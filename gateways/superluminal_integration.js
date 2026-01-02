#!/usr/bin/env node

/**
 * SUPERLUMINAL COMPLETE INTEGRATION SYSTEM
 * Unified case management with iCloud memory extension
 *
 * Features:
 * - Complete case processing pipeline
 * - Automatic iCloud synchronization
 * - Intelligent storage management
 * - Advanced analytics and reporting
 * - Seamless local/cloud integration
 */

const SuperluminalCaseManager = require('./superluminal_case_manager');
const ICloudMemoryExtension = require('./icloud_memory_extension');
const CaseOptimizer = require('./case_optimizer');
const fs = require('fs');
const path = require('path');

class SuperluminalIntegration {
    constructor() {
        this.caseManager = new SuperluminalCaseManager();
        this.icloudExtension = new ICloudMemoryExtension();
        this.caseOptimizer = new CaseOptimizer();
        this.systemStats = {
            totalCasesProcessed: 0,
            totalSpaceSaved: 0,
            icloudSpaceUsed: 0,
            localSpaceUsed: 0,
            lastFullSync: null
        };
    }

    /**
     * Initialize the complete Superluminal system
     */
    async initialize() {
        console.log('🚀 Initializing SUPERLUMINAL COMPLETE INTEGRATION SYSTEM...');

        // Initialize all subsystems
        this.caseManager.initialize();
        this.icloudExtension.initialize();
        this.caseOptimizer.initialize();

        // Create integration directories
        this.setupIntegrationDirectories();

        // Check system status
        await this.checkSystemStatus();

        console.log('✅ Superluminal system ready for operation!');
        return this.getSystemStatus();
    }

    /**
     * Setup required directories for integration
     */
    setupIntegrationDirectories() {
        const directories = [
            './superluminal_workspace',
            './processed_cases',
            './cloud_sync_queue',
            './system_reports',
            './temp_processing'
        ];

        directories.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    /**
     * Check overall system status
     */
    async checkSystemStatus() {
        try {
            // Get local disk space
            const localStats = fs.statfsSync('.');
            const localTotal = localStats.blocks * localStats.bsize;
            const localAvailable = localStats.bavail * localStats.bsize;
            const localUsed = localTotal - localAvailable;

            // Get iCloud status
            const icloudStats = this.icloudExtension.getICloudStorageStats();

            // Update system stats
            this.systemStats = {
                ...this.systemStats,
                localSpace: {
                    total: localTotal,
                    used: localUsed,
                    available: localAvailable,
                    percentageUsed: ((localUsed / localTotal) * 100).toFixed(2)
                },
                icloudSpace: icloudStats,
                lastCheck: new Date().toISOString()
            };

            console.log(`📊 System Status:`);
            console.log(`   Local: ${(localUsed/1024/1024/1024).toFixed(2)}GB / ${(localTotal/1024/1024/1024).toFixed(2)}GB used`);
            console.log(`   iCloud: ${icloudStats.usedGB}GB / ${icloudStats.totalGB}GB used`);
            console.log(`   Integration: Ready`);

            return this.systemStats;

        } catch (error) {
            console.error(`❌ System status check failed: ${error.message}`);
            return null;
        }
    }

    /**
     * Process cases with complete integration
     */
    async processCasesWithIntegration(inputDirectory) {
        console.log('🔄 Starting COMPLETE SUPERLUMINAL PROCESSING...');
        const startTime = Date.now();

        try {
            // Step 1: Process cases locally
            const caseManagerResult = await this.caseManager.processDirectory(inputDirectory);
            this.systemStats.totalCasesProcessed += caseManagerResult.statistics.totalCasesProcessed;
            this.systemStats.totalSpaceSaved += parseFloat(caseManagerResult.statistics.totalSpaceSavedMB);

            // Step 2: Upload processed cases to iCloud
            const cases = caseManagerResult.caseDatabase;
            const caseIds = Object.keys(cases);

            for (const caseId of caseIds) {
                const caseData = cases[caseId];
                const caseFiles = this.getCaseFiles(caseId);

                // Upload to iCloud
                await this.icloudExtension.uploadCaseToICloud(caseId, caseData, caseFiles);

                // Update stats
                this.systemStats.totalCasesProcessed++;
            }

            // Step 3: Optimize iCloud storage
            await this.icloudExtension.optimizeICloudStorage();

            // Step 4: Generate comprehensive report
            const processingTime = Date.now() - startTime;
            const report = this.generateCompleteReport(caseManagerResult, processingTime);

            console.log('✅ COMPLETE SUPERLUMINAL PROCESSING FINISHED!');
            console.log(`📊 Processed ${this.systemStats.totalCasesProcessed} cases`);
            console.log(`💾 Saved ${this.systemStats.totalSpaceSaved.toFixed(2)}MB locally`);
            console.log(`☁️ Synced to iCloud: ${caseIds.length} cases`);
            console.log(`⏱️ Processing time: ${(processingTime/1000).toFixed(1)} seconds`);

            return report;

        } catch (error) {
            console.error(`❌ Complete processing failed: ${error.message}`);
            return null;
        }
    }

    /**
     * Get all files for a specific case
     */
    getCaseFiles(caseId) {
        const caseFiles = [];
        const caseDir = path.join('./case_database', caseId);

        if (fs.existsSync(caseDir)) {
            const files = fs.readdirSync(caseDir);
            files.forEach(file => {
                caseFiles.push(path.join(caseDir, file));
            });
        }

        return caseFiles;
    }

    /**
     * Generate complete system report
     */
    generateCompleteReport(caseManagerReport, processingTimeMs) {
        const report = {
            system: 'SUPERLUMINAL COMPLETE INTEGRATION',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            processing: {
                startTime: new Date(Date.now() - processingTimeMs).toISOString(),
                endTime: new Date().toISOString(),
                durationMs: processingTimeMs,
                durationSeconds: (processingTimeMs / 1000).toFixed(2)
            },
            caseProcessing: caseManagerReport.statistics,
            storage: {
                local: this.systemStats.localSpace,
                icloud: this.systemStats.icloudSpace,
                totalSpaceSavedMB: this.systemStats.totalSpaceSaved
            },
            integration: {
                casesProcessed: this.systemStats.totalCasesProcessed,
                casesSyncedToICloud: Object.keys(caseManagerReport.caseDatabase).length,
                syncStatus: this.icloudExtension.getSyncStatus(),
                optimizationRecommendations: this.generateOptimizationRecommendations()
            },
            recommendations: this.generateSystemRecommendations(),
            caseDatabase: caseManagerReport.caseDatabase
        };

        // Save report
        const reportPath = path.join('./system_reports', `superluminal_report_${new Date().toISOString().split('T')[0]}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        return report;
    }

    /**
     * Generate optimization recommendations
     */
    generateOptimizationRecommendations() {
        const recommendations = [];

        // Local storage recommendations
        if (this.systemStats.localSpace.percentageUsed > 90) {
            recommendations.push("⚠️ Local storage critical - clean up immediately");
        } else if (this.systemStats.localSpace.percentageUsed > 75) {
            recommendations.push("🟡 Local storage high - consider cleanup");
        } else {
            recommendations.push("🟢 Local storage optimal");
        }

        // iCloud storage recommendations
        if (this.systemStats.icloudSpace.percentageUsed > 90) {
            recommendations.push("⚠️ iCloud storage critical - upgrade plan or optimize");
        } else if (this.systemStats.icloudSpace.percentageUsed > 75) {
            recommendations.push("🟡 iCloud storage high - run optimization");
        } else {
            recommendations.push("🟢 iCloud storage optimal");
        }

        // System recommendations
        recommendations.push("Enable automatic iCloud sync for seamless operation");
        recommendations.push("Use case archiving for completed cases");
        recommendations.push("Implement regular storage optimization");

        return recommendations;
    }

    /**
     * Generate system-wide recommendations
     */
    generateSystemRecommendations() {
        return [
            {
                category: "Performance",
                recommendations: [
                    "Process cases in batches for better performance",
                    "Use iCloud symlinks for direct cloud access",
                    "Enable automatic synchronization"
                ]
            },
            {
                category: "Storage",
                recommendations: [
                    "Regularly optimize both local and iCloud storage",
                    "Archive completed cases to free up space",
                    "Monitor storage usage with system reports"
                ]
            },
            {
                category: "Reliability",
                recommendations: [
                    "Implement regular backups",
                    "Use iCloud for disaster recovery",
                    "Enable automatic sync for data redundancy"
                ]
            }
        ];
    }

    /**
     * Get complete system status
     */
    getSystemStatus() {
        return {
            system: 'SUPERLUMINAL COMPLETE INTEGRATION',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            components: {
                caseManager: 'Ready',
                icloudExtension: this.icloudExtension.getSyncStatus(),
                caseOptimizer: 'Ready'
            },
            statistics: this.systemStats,
            storage: {
                local: this.systemStats.localSpace,
                icloud: this.systemStats.icloudSpace
            },
            recommendations: this.generateOptimizationRecommendations()
        };
    }

    /**
     * Download and process case from iCloud
     */
    async downloadAndProcessCase(caseId) {
        console.log(`🔄 Downloading and processing case: ${caseId}`);

        try {
            // Download from iCloud
            const downloadedCase = await this.icloudExtension.downloadCaseFromICloud(caseId);

            if (!downloadedCase) {
                console.log(`⚠️ Case ${caseId} not found in iCloud`);
                return null;
            }

            // Process the downloaded case
            const caseData = {
                caseId: caseId,
                report: {
                    path: path.join(downloadedCase.localPath, `${caseId}_report.pdf`),
                    name: `${caseId}_report.pdf`,
                    size: fs.existsSync(path.join(downloadedCase.localPath, `${caseId}_report.pdf`)) ?
                        fs.statSync(path.join(downloadedCase.localPath, `${caseId}_report.pdf`)).size : 0
                },
                fillings: downloadedCase.files
                    .filter(f => f.includes('filling') || f.includes('filing'))
                    .map(f => ({
                        path: path.join(downloadedCase.localPath, f),
                        name: f,
                        size: fs.statSync(path.join(downloadedCase.localPath, f)).size
                    })),
                evidence: downloadedCase.files
                    .filter(f => f.includes('evidence'))
                    .map(f => ({
                        path: path.join(downloadedCase.localPath, f),
                        name: f,
                        size: fs.statSync(path.join(downloadedCase.localPath, f)).size
                    }))
            };

            // Reconstruct and optimize the case
            const optimizedCase = await this.caseOptimizer.processCompleteCase(caseData);

            console.log(`✅ Case ${caseId} downloaded and optimized`);
            return optimizedCase;

        } catch (error) {
            console.error(`❌ Failed to download and process case: ${error.message}`);
            return null;
        }
    }

    /**
     * Create complete system backup
     */
    async createSystemBackup(backupDir = './superluminal_backup') {
        console.log('💾 Creating complete system backup...');

        try {
            // Create backup directory
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }

            // Backup case database
            const caseDbDir = './case_database';
            if (fs.existsSync(caseDbDir)) {
                this.copyDirectory(caseDbDir, path.join(backupDir, 'case_database'));
            }

            // Backup analysis reports
            const reportsDir = './analysis_reports';
            if (fs.existsSync(reportsDir)) {
                this.copyDirectory(reportsDir, path.join(backupDir, 'analysis_reports'));
            }

            // Backup system reports
            const systemReportsDir = './system_reports';
            if (fs.existsSync(systemReportsDir)) {
                this.copyDirectory(systemReportsDir, path.join(backupDir, 'system_reports'));
            }

            // Create backup manifest
            const manifest = {
                backupTimestamp: new Date().toISOString(),
                systemVersion: '1.0.0',
                contents: {
                    caseDatabase: fs.existsSync(caseDbDir),
                    analysisReports: fs.existsSync(reportsDir),
                    systemReports: fs.existsSync(systemReportsDir),
                    totalCases: this.systemStats.totalCasesProcessed,
                    totalSpaceSavedMB: this.systemStats.totalSpaceSaved
                }
            };

            fs.writeFileSync(path.join(backupDir, 'backup_manifest.json'), JSON.stringify(manifest, null, 2));

            console.log(`✅ System backup created: ${backupDir}`);
            return backupDir;

        } catch (error) {
            console.error(`❌ Backup failed: ${error.message}`);
            return null;
        }
    }

    /**
     * Copy directory recursively
     */
    copyDirectory(source, target) {
        if (!fs.existsSync(source)) {
            return;
        }

        if (!fs.existsSync(target)) {
            fs.mkdirSync(target, { recursive: true });
        }

        const items = fs.readdirSync(source);

        for (const item of items) {
            const sourcePath = path.join(source, item);
            const targetPath = path.join(target, item);
            const stat = fs.statSync(sourcePath);

            if (stat.isDirectory()) {
                this.copyDirectory(sourcePath, targetPath);
            } else {
                fs.copyFileSync(sourcePath, targetPath);
            }
        }
    }

    /**
     * Restore from backup
     */
    async restoreFromBackup(backupDir) {
        console.log(`🔄 Restoring from backup: ${backupDir}`);

        try {
            // Read backup manifest
            const manifestPath = path.join(backupDir, 'backup_manifest.json');
            if (!fs.existsSync(manifestPath)) {
                console.log('⚠️ Invalid backup - no manifest found');
                return false;
            }

            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

            // Restore case database
            if (manifest.contents.caseDatabase) {
                const sourceDb = path.join(backupDir, 'case_database');
                const targetDb = './case_database';
                this.copyDirectory(sourceDb, targetDb);
                console.log('📁 Restored case database');
            }

            // Restore analysis reports
            if (manifest.contents.analysisReports) {
                const sourceReports = path.join(backupDir, 'analysis_reports');
                const targetReports = './analysis_reports';
                this.copyDirectory(sourceReports, targetReports);
                console.log('📊 Restored analysis reports');
            }

            // Restore system reports
            if (manifest.contents.systemReports) {
                const sourceSystemReports = path.join(backupDir, 'system_reports');
                const targetSystemReports = './system_reports';
                this.copyDirectory(sourceSystemReports, targetSystemReports);
                console.log('📈 Restored system reports');
            }

            // Update system stats
            this.systemStats.totalCasesProcessed = manifest.contents.totalCases || 0;
            this.systemStats.totalSpaceSaved = manifest.contents.totalSpaceSavedMB || 0;

            console.log('✅ System restore completed successfully');
            return true;

        } catch (error) {
            console.error(`❌ Restore failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Run complete system optimization
     */
    async runCompleteOptimization() {
        console.log('🎯 Running COMPLETE SYSTEM OPTIMIZATION...');

        try {
            // Optimize local case files
            console.log('🔄 Optimizing local case files...');
            const caseFiles = this.getAllFiles('./case_database');
            let localSpaceSaved = 0;

            for (const file of caseFiles) {
                if (file.endsWith('.pdf')) {
                    const originalSize = fs.statSync(file).size;
                    await this.optimizePDFFile(file);
                    const optimizedSize = fs.statSync(file).size;
                    localSpaceSaved += (originalSize - optimizedSize);
                }
            }

            // Optimize iCloud storage
            console.log('☁️ Optimizing iCloud storage...');
            await this.icloudExtension.optimizeICloudStorage();

            // Clean up temporary files
            console.log('🧹 Cleaning up temporary files...');
            this.cleanupTempFiles();

            // Update stats
            this.systemStats.totalSpaceSaved += localSpaceSaved / 1024 / 1024;

            console.log(`✅ Complete optimization finished`);
            console.log(`💾 Saved ${(localSpaceSaved/1024/1024).toFixed(2)}MB locally`);
            console.log(`☁️ iCloud storage optimized`);

            return {
                localSpaceSavedMB: (localSpaceSaved/1024/1024).toFixed(2),
                icloudOptimized: true,
                tempFilesCleaned: true
            };

        } catch (error) {
            console.error(`❌ Complete optimization failed: ${error.message}`);
            return null;
        }
    }

    /**
     * Optimize PDF file
     */
    async optimizePDFFile(filePath) {
        try {
            const pdfBytes = fs.readFileSync(filePath);
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const optimizedBytes = await pdfDoc.save({ useObjectStreams: true });
            fs.writeFileSync(filePath, optimizedBytes);
            return true;
        } catch (error) {
            console.error(`❌ Failed to optimize PDF: ${error.message}`);
            return false;
        }
    }

    /**
     * Clean up temporary files
     */
    cleanupTempFiles() {
        const tempDirs = ['./temp_processing', './.temp', './tmp'];

        tempDirs.forEach(dir => {
            if (fs.existsSync(dir)) {
                this.deleteDirectoryContents(dir);
            }
        });
    }

    /**
     * Delete directory contents
     */
    deleteDirectoryContents(directory) {
        if (fs.existsSync(directory)) {
            const items = fs.readdirSync(directory);

            for (const item of items) {
                const itemPath = path.join(directory, item);
                const stat = fs.statSync(itemPath);

                if (stat.isDirectory()) {
                    this.deleteDirectoryContents(itemPath);
                    fs.rmdirSync(itemPath);
                } else {
                    fs.unlinkSync(itemPath);
                }
            }
        }
    }

    /**
     * Get all files recursively
     */
    getAllFiles(directory) {
        const files = [];

        if (!fs.existsSync(directory)) {
            return files;
        }

        const items = fs.readdirSync(directory);

        for (const item of items) {
            const fullPath = path.join(directory, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                files.push(...this.getAllFiles(fullPath));
            } else {
                files.push(fullPath);
            }
        }

        return files;
    }

    /**
     * Generate performance report
     */
    generatePerformanceReport() {
        const report = {
            system: 'SUPERLUMINAL PERFORMANCE REPORT',
            timestamp: new Date().toISOString(),
            performanceMetrics: {
                totalCasesProcessed: this.systemStats.totalCasesProcessed,
                averageProcessingTimePerCase: this.systemStats.totalCasesProcessed > 0 ?
                    ((this.systemStats.lastFullSync ? new Date() - new Date(this.systemStats.lastFullSync) : 0) / this.systemStats.totalCasesProcessed).toFixed(2) + 'ms' : 'N/A',
                spaceEfficiency: this.systemStats.totalSpaceSaved > 0 ?
                    `${(this.systemStats.totalSpaceSaved / this.systemStats.totalCasesProcessed).toFixed(2)}MB per case` : 'N/A'
            },
            storageEfficiency: {
                localUsage: this.systemStats.localSpace,
                icloudUsage: this.systemStats.icloudSpace,
                optimizationEffectiveness: this.systemStats.totalSpaceSaved > 0 ?
                    'High' : 'Not measured'
            },
            recommendations: [
                "Implement regular system optimization",
                "Use iCloud for large case storage",
                "Monitor performance metrics regularly"
            ]
        };

        const reportPath = path.join('./system_reports', `performance_report_${new Date().toISOString().split('T')[0]}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        return report;
    }
}

// Export the complete integration system
module.exports = SuperluminalIntegration;

// CLI Interface
if (require.main === module) {
    const superluminal = new SuperluminalIntegration();

    // Initialize the system
    superluminal.initialize()
        .then(status => {
            console.log('✅ Superluminal system ready!');

            // Process command line arguments
            const command = process.argv[2];
            const arg1 = process.argv[3];
            const arg2 = process.argv[4];

            switch (command) {
                case 'process':
                    if (arg1) {
                        superluminal.processCasesWithIntegration(arg1)
                            .then(report => console.log('✅ Processing completed'))
                            .catch(err => console.error(`❌ Processing failed: ${err.message}`));
                    } else {
                        console.log('Usage: superluminal_integration.js process <input_directory>');
                    }
                    break;

                case 'download':
                    if (arg1) {
                        superluminal.downloadAndProcessCase(arg1)
                            .then(caseData => console.log(`✅ Case ${arg1} downloaded and processed`))
                            .catch(err => console.error(`❌ Download failed: ${err.message}`));
                    } else {
                        console.log('Usage: superluminal_integration.js download <case_id>');
                    }
                    break;

                case 'backup':
                    superluminal.createSystemBackup(arg1 || './superluminal_backup')
                        .then(backupPath => console.log(`✅ Backup created: ${backupPath}`))
                        .catch(err => console.error(`❌ Backup failed: ${err.message}`));
                    break;

                case 'restore':
                    if (arg1) {
                        superluminal.restoreFromBackup(arg1)
                            .then(success => console.log(success ? '✅ Restore completed' : '❌ Restore failed'))
                            .catch(err => console.error(`❌ Restore failed: ${err.message}`));
                    } else {
                        console.log('Usage: superluminal_integration.js restore <backup_directory>');
                    }
                    break;

                case 'optimize':
                    superluminal.runCompleteOptimization()
                        .then(results => console.log('✅ Optimization completed'))
                        .catch(err => console.error(`❌ Optimization failed: ${err.message}`));
                    break;

                case 'status':
                    const status = superluminal.getSystemStatus();
                    console.log(JSON.stringify(status, null, 2));
                    break;

                case 'report':
                    const report = superluminal.generatePerformanceReport();
                    console.log(JSON.stringify(report, null, 2));
                    break;

                default:
                    console.log('SUPERLUMINAL COMPLETE INTEGRATION SYSTEM');
                    console.log('Usage:');
                    console.log('  superluminal_integration.js process <dir>    - Process cases with full integration');
                    console.log('  superluminal_integration.js download <id>    - Download and process case from iCloud');
                    console.log('  superluminal_integration.js backup [dir]     - Create system backup');
                    console.log('  superluminal_integration.js restore <dir>    - Restore from backup');
                    console.log('  superluminal_integration.js optimize        - Run complete optimization');
                    console.log('  superluminal_integration.js status          - Get system status');
                    console.log('  superluminal_integration.js report          - Generate performance report');
                    break;
            }
        })
        .catch(err => {
            console.error(`❌ System initialization failed: ${err.message}`);
            process.exit(1);
        });
}
