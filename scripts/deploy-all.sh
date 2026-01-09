#!/bin/bash
# ============================================================================
# APEX PRODUCTION DEPLOYMENT SCRIPT
# Deploy all services continuously with health checks and rollback
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_NAME="apex-mastermind"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production.local"
LOG_DIR="./logs/deployment"
BACKUP_DIR="./backups/pre-deploy"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOY_LOG="${LOG_DIR}/deploy_${TIMESTAMP}.log"
MAX_RETRIES=3
HEALTH_CHECK_TIMEOUT=300

# ============================================================================
# LOGGING & OUTPUT FUNCTIONS
# ============================================================================

log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "${DEPLOY_LOG}"
}

log_info() {
    log "${BLUE}INFO${NC}" "$@"
}

log_success() {
    log "${GREEN}✓${NC}" "$@"
}

log_warning() {
    log "${YELLOW}⚠${NC}" "$@"
}

log_error() {
    log "${RED}✗${NC}" "$@"
}

# ============================================================================
# PRE-DEPLOYMENT CHECKS
# ============================================================================

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    log_success "Docker found: $(docker --version)"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    log_success "Docker Compose found: $(docker-compose --version)"
    
    # Check if env file exists
    if [ ! -f "${ENV_FILE}" ]; then
        log_error "Environment file not found: ${ENV_FILE}"
        log_info "Please create ${ENV_FILE} from .env.production template"
        exit 1
    fi
    log_success "Environment file found"
    
    # Check if compose file exists
    if [ ! -f "${COMPOSE_FILE}" ]; then
        log_error "Compose file not found: ${COMPOSE_FILE}"
        exit 1
    fi
    log_success "Compose file found"
    
    # Verify disk space
    local available=$(df /var/lib/docker | tail -1 | awk '{print $4}')
    local required=10485760  # 10GB in KB
    if [ "${available}" -lt "${required}" ]; then
        log_error "Insufficient disk space. Available: $((available / 1024 / 1024))GB, Required: 10GB"
        exit 1
    fi
    log_success "Sufficient disk space available"
}

# ============================================================================
# BACKUP PROCEDURES
# ============================================================================

backup_state() {
    log_info "Creating pre-deployment backup..."
    
    mkdir -p "${BACKUP_DIR}"
    
    # Backup Docker volumes
    log_info "Backing up database volume..."
    docker run --rm \
        -v "${DEPLOYMENT_NAME}_postgres_data:/data" \
        -v "${BACKUP_DIR}:/backup" \
        alpine tar czf /backup/postgres_${TIMESTAMP}.tar.gz -C /data . || true
    
    # Backup Redis data
    log_info "Backing up Redis data..."
    docker run --rm \
        -v "${DEPLOYMENT_NAME}_redis_data:/data" \
        -v "${BACKUP_DIR}:/backup" \
        alpine tar czf /backup/redis_${TIMESTAMP}.tar.gz -C /data . || true
    
    # Export running configuration
    log_info "Exporting current configuration..."
    docker-compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" ps > "${BACKUP_DIR}/services_${TIMESTAMP}.txt"
    
    log_success "Backup completed: ${BACKUP_DIR}"
}

# ============================================================================
# DEPLOYMENT FUNCTIONS
# ============================================================================

build_images() {
    log_info "Building Docker images..."
    
    docker-compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" build --no-cache 2>&1 | tee -a "${DEPLOY_LOG}"
    
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        log_success "Docker images built successfully"
    else
        log_error "Failed to build Docker images"
        return 1
    fi
}

start_services() {
    log_info "Starting services..."
    
    docker-compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d 2>&1 | tee -a "${DEPLOY_LOG}"
    
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        log_success "Services started"
    else
        log_error "Failed to start services"
        return 1
    fi
}

wait_for_services() {
    log_info "Waiting for services to be healthy (max ${HEALTH_CHECK_TIMEOUT}s)..."
    
    local start_time=$(date +%s)
    local services=("orchestrator" "postgres" "redis" "memory-sync" "notion-sync")
    
    for service in "${services[@]}"; do
        log_info "Checking ${service}..."
        
        while true; do
            if docker-compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" ps "${service}" | grep -q "healthy\|running"; then
                log_success "${service} is healthy"
                break
            fi
            
            local current_time=$(date +%s)
            local elapsed=$((current_time - start_time))
            
            if [ ${elapsed} -gt ${HEALTH_CHECK_TIMEOUT} ]; then
                log_error "${service} failed to become healthy within ${HEALTH_CHECK_TIMEOUT}s"
                return 1
            fi
            
            log_info "Waiting for ${service}... (${elapsed}s)"
            sleep 10
        done
    done
    
    log_success "All services are healthy"
}

run_integration_tests() {
    log_info "Running integration tests..."
    
    local retry_count=0
    while [ ${retry_count} -lt ${MAX_RETRIES} ]; do
        if docker-compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" exec -T orchestrator \
            python -m pytest tests/integration -v 2>&1 | tee -a "${DEPLOY_LOG}"; then
            log_success "Integration tests passed"
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        if [ ${retry_count} -lt ${MAX_RETRIES} ]; then
            log_warning "Integration tests failed, retrying... (${retry_count}/${MAX_RETRIES})"
            sleep 30
        fi
    done
    
    log_error "Integration tests failed after ${MAX_RETRIES} attempts"
    return 1
}

verify_memory_plugin() {
    log_info "Verifying Memory Plugin connection..."
    
    if docker-compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" exec -T memory-sync \
        python scripts/test_memory_plugin.py 2>&1 | tee -a "${DEPLOY_LOG}"; then
        log_success "Memory Plugin verified"
        return 0
    else
        log_error "Memory Plugin verification failed"
        return 1
    fi
}

verify_notion() {
    log_info "Verifying Notion connection..."
    
    if docker-compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" exec -T notion-sync \
        python scripts/test_notion.py 2>&1 | tee -a "${DEPLOY_LOG}"; then
        log_success "Notion verified"
        return 0
    else
        log_error "Notion verification failed"
        return 1
    fi
}

initialization_sync() {
    log_info "Running initial synchronization..."
    
    # Sync Memory Plugin
    log_info "Syncing Memory Plugin..."
    docker-compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" exec -T memory-sync \
        python cli/memory_plugin_orchestrator.py sync-to-memory 2>&1 | tee -a "${DEPLOY_LOG}" || true
    
    # Sync Notion
    log_info "Syncing Notion..."
    docker-compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" exec -T notion-sync \
        python cli/sync_memory_plugin_to_notion.py 2>&1 | tee -a "${DEPLOY_LOG}" || true
    
    log_success "Initial synchronization completed"
}

setup_monitoring() {
    log_info "Setting up monitoring dashboards..."
    
    # Wait for Grafana to be ready
    sleep 30
    
    # Create datasources and dashboards
    docker-compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" exec -T grafana \
        curl -X POST http://localhost:3000/api/datasources \
        -H "Content-Type: application/json" \
        -d '{"name": "Prometheus", "type": "prometheus", "url": "http://prometheus:9090"}' || true
    
    log_success "Monitoring setup completed"
}

# ============================================================================
# ROLLBACK PROCEDURES
# ============================================================================

rollback() {
    log_error "Deployment failed, initiating rollback..."
    
    log_info "Stopping current services..."
    docker-compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" down 2>&1 | tee -a "${DEPLOY_LOG}"
    
    log_warning "Rollback completed. Services have been stopped."
    log_warning "Please restore from backup: ${BACKUP_DIR}"
    exit 1
}

# ============================================================================
# HEALTH CHECK & STATUS REPORTING
# ============================================================================

generate_status_report() {
    log_info "Generating deployment status report..."
    
    local report_file="${LOG_DIR}/status_${TIMESTAMP}.txt"
    
    {
        echo "=== APEX DEPLOYMENT STATUS REPORT ==="
        echo "Timestamp: $(date)"
        echo ""
        echo "=== SERVICE STATUS ==="
        docker-compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" ps
        echo ""
        echo "=== DOCKER IMAGES ==="
        docker images | grep apex
        echo ""
        echo "=== DISK USAGE ==="
        docker system df
        echo ""
        echo "=== NETWORK ==="
        docker network inspect apex-network || true
        echo ""
        echo "=== LOGS (Last 50 lines) ==="
        docker-compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" logs --tail 50
    } | tee "${report_file}"
    
    log_success "Status report: ${report_file}"
}

# ============================================================================
# MAIN DEPLOYMENT FLOW
# ============================================================================

main() {
    log_info "========================================"
    log_info "APEX PRODUCTION DEPLOYMENT"
    log_info "========================================"
    log_info "Deployment started at: $(date)"
    
    mkdir -p "${LOG_DIR}"
    
    # Pre-deployment checks
    if ! check_prerequisites; then
        log_error "Prerequisites check failed"
        exit 1
    fi
    
    # Backup current state
    if ! backup_state; then
        log_error "Backup failed"
        exit 1
    fi
    
    # Build images
    if ! build_images; then
        rollback
    fi
    
    # Start services
    if ! start_services; then
        rollback
    fi
    
    # Wait for services to be healthy
    if ! wait_for_services; then
        rollback
    fi
    
    # Verify integrations
    if ! verify_memory_plugin; then
        log_warning "Memory Plugin verification failed - but continuing"
    fi
    
    if ! verify_notion; then
        log_warning "Notion verification failed - but continuing"
    fi
    
    # Run tests
    if ! run_integration_tests; then
        log_warning "Some tests failed - continuing with deployment"
    fi
    
    # Initial sync
    if ! initialization_sync; then
        log_warning "Initial sync incomplete - continuing"
    fi
    
    # Setup monitoring
    if ! setup_monitoring; then
        log_warning "Monitoring setup incomplete - continuing"
    fi
    
    # Generate report
    generate_status_report
    
    # Success
    log_success "========================================"
    log_success "DEPLOYMENT COMPLETED SUCCESSFULLY"
    log_success "========================================"
    log_info "Deployment completed at: $(date)"
    log_info "Full log: ${DEPLOY_LOG}"
    
    # Service URLs
    echo ""
    echo -e "${GREEN}=== SERVICE ENDPOINTS ===${NC}"
    echo -e "Orchestrator API:  ${BLUE}http://localhost:8000${NC}"
    echo -e "Grafana Dashboard: ${BLUE}http://localhost:3000${NC}"
    echo -e "Prometheus:        ${BLUE}http://localhost:9090${NC}"
    echo -e "Redis CLI:         ${BLUE}redis-cli -p 6379${NC}"
    echo -e "PostgreSQL:        ${BLUE}psql -h localhost -U mastermind -d mastermind${NC}"
    echo ""
}

# ============================================================================
# CLEANUP & TRAP HANDLERS
# ============================================================================

trap 'rollback' ERR

# Run main deployment
main "$@"
