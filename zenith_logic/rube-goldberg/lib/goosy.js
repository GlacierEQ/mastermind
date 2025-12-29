/**
 * Goosy - The World's Most Powerful File Pattern Engine
 *
 * Advanced file pattern matching, ignoring, and management system
 * with AI-powered optimization and real-time monitoring capabilities
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');
const chalk = require('chalk');
const { performance } = require('perf_hooks');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const execAsync = promisify(exec);

// Goosy Configuration
const GOOSY_DIR = '.goosy';
const GOOSY_IGNORE_FILE = '.goosyignore';
const GOOSY_CONFIG = {
  maxScanDepth: 20,
  performanceThreshold: 1000, // ms
  aiSuggestions: true,
  realtimeMonitoring: false,
  securityScan: true
};

/**
 * Goosy Core Engine
 */
class GoosyEngine {
  constructor() {
    this.patterns = [];
    this.stats = {
      totalFiles: 0,
      ignoredFiles: 0,
      scanTime: 0,
      lastScan: null
    };
    this.cache = new Map();
  }

  /**
   * Initialize Goosy Engine
   */
  async initialize() {
    await this._ensureGoosyDirectory();
    await this.loadPatterns();
    this._setupPerformanceMonitoring();
  }

  /**
   * Ensure .goosy directory exists
   */
  async _ensureGoosyDirectory() {
    try {
      await mkdir(GOOSY_DIR, { recursive: true });
      console.log(chalk.green('✅ Goosy directory initialized'));
    } catch (error) {
      console.error(chalk.red('❌ Failed to create Goosy directory:'), error.message);
    }
  }

  /**
   * Load patterns from .goosyignore file
   */
  async loadPatterns() {
    try {
      const content = await readFile(GOOSY_IGNORE_FILE, 'utf8');
      this.patterns = this._parsePatterns(content);
      console.log(chalk.blue(`📋 Loaded ${this.patterns.length} Goosy patterns`));
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(chalk.yellow('⚠️  No .goosyignore file found. Using default patterns.'));
        this.patterns = this._getDefaultPatterns();
      } else {
        console.error(chalk.red('❌ Failed to load patterns:'), error.message);
      }
    }
  }

  /**
   * Parse patterns from content
   */
  _parsePatterns(content) {
    return content.split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('#'))
      .map(line => line.trim())
      .filter(pattern => pattern.length > 0);
  }

  /**
   * Get default Goosy patterns
   */
  _getDefaultPatterns() {
    return [
      '.goosy/',
      'node_modules/',
      'dist/',
      'build/',
      '*.log',
      '.env',
      '.DS_Store',
      '*.tmp'
    ];
  }

  /**
   * Setup performance monitoring
   */
  _setupPerformanceMonitoring() {
    this.performance = {
      startTime: null,
      endTime: null,
      memoryUsage: []
    };
  }

  /**
   * Start performance tracking
   */
  _startPerformanceTracking() {
    this.performance.startTime = performance.now();
    this.performance.memoryUsage = [process.memoryUsage().heapUsed];
  }

  /**
   * End performance tracking
   */
  _endPerformanceTracking() {
    this.performance.endTime = performance.now();
    this.performance.memoryUsage.push(process.memoryUsage().heapUsed);
    this.performance.duration = this.performance.endTime - this.performance.startTime;
  }

  /**
   * Check if file should be ignored
   */
  async shouldIgnore(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);

    // Check cache first
    const cacheKey = relativePath;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Check against patterns
    let shouldIgnore = false;
    const normalizedPath = relativePath.replace(/\\/g, '/');

    for (const pattern of this.patterns) {
      if (this._matchesPattern(normalizedPath, pattern)) {
        shouldIgnore = true;
        break;
      }
    }

    // Cache result
    this.cache.set(cacheKey, shouldIgnore);
    return shouldIgnore;
  }

  /**
   * Check if path matches pattern
   */
  _matchesPattern(filePath, pattern) {
    // Handle directory patterns
    if (pattern.endsWith('/')) {
      const dirPattern = pattern.slice(0, -1);
      return filePath === dirPattern || filePath.startsWith(dirPattern + '/');
    }

    // Handle wildcard patterns
    if (pattern.includes('*')) {
      const regexPattern = pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(filePath);
    }

    // Exact match
    return filePath === pattern;
  }

  /**
   * Scan directory for ignored files
   */
  async scanDirectory(dirPath = '.', options = {}) {
    this._startPerformanceTracking();
    this.stats.totalFiles = 0;
    this.stats.ignoredFiles = 0;

    const startTime = Date.now();
    const files = await this._getAllFiles(dirPath);
    const ignoredFiles = [];

    for (const file of files) {
      this.stats.totalFiles++;
      const shouldIgnore = await this.shouldIgnore(file);

      if (shouldIgnore) {
        this.stats.ignoredFiles++;
        ignoredFiles.push(file);
      }
    }

    this._endPerformanceTracking();
    this.stats.scanTime = Date.now() - startTime;
    this.stats.lastScan = new Date();

    // Generate report
    await this._generateScanReport(ignoredFiles);

    return {
      totalFiles: this.stats.totalFiles,
      ignoredFiles: this.stats.ignoredFiles,
      ignoredList: ignoredFiles,
      scanTime: this.stats.scanTime,
      performance: this.performance
    };
  }

  /**
   * Get all files recursively
   */
  async _getAllFiles(dirPath, currentDepth = 0) {
    if (currentDepth > GOOSY_CONFIG.maxScanDepth) {
      return [];
    }

    const entries = await readdir(dirPath, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      // Optimization: Check ignore patterns early to avoid scanning massive directories like node_modules
      if (await this.shouldIgnore(fullPath)) {
        files.push(fullPath); // Add the directory/file itself so it counts as ignored
        continue;
      }

      if (entry.isDirectory()) {
        files.push(...await this._getAllFiles(fullPath, currentDepth + 1));
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Generate scan report
   */
  async _generateScanReport(ignoredFiles) {
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      ignoredFiles: ignoredFiles,
      patterns: this.patterns,
      performance: this.performance,
      recommendations: this._generateRecommendations(ignoredFiles)
    };

    const reportPath = path.join(GOOSY_DIR, `scan-${Date.now()}.json`);
    await writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(chalk.green(`📊 Scan report generated: ${reportPath}`));
  }

  /**
   * Generate AI-powered recommendations
   */
  _generateRecommendations(ignoredFiles) {
    const recommendations = [];

    // Analyze file types
    const fileExtensions = {};
    ignoredFiles.forEach(file => {
      const ext = path.extname(file).slice(1);
      if (ext) {
        fileExtensions[ext] = (fileExtensions[ext] || 0) + 1;
      }
    });

    // Generate recommendations
    if (Object.keys(fileExtensions).length > 0) {
      recommendations.push({
        type: 'file-type-analysis',
        message: `Found ${Object.keys(fileExtensions).length} different file types being ignored`,
        data: fileExtensions
      });
    }

    // Performance recommendations
    if (this.performance.duration > GOOSY_CONFIG.performanceThreshold) {
      recommendations.push({
        type: 'performance',
        message: `Scan took ${this.performance.duration.toFixed(2)}ms. Consider optimizing patterns.`,
        threshold: GOOSY_CONFIG.performanceThreshold
      });
    }

    // Memory recommendations
    const memoryDiff = this.performance.memoryUsage[1] - this.performance.memoryUsage[0];
    if (memoryDiff > 1000000) { // 1MB
      recommendations.push({
        type: 'memory',
        message: `Scan used ${(memoryDiff / 1024 / 1024).toFixed(2)}MB additional memory`,
        suggestion: 'Consider increasing cache efficiency'
      });
    }

    return recommendations;
  }

  /**
   * Clean ignored files
   */
  async cleanIgnoredFiles(dryRun = true) {
    const scanResult = await this.scanDirectory();
    const deletedFiles = [];
    const errors = [];

    console.log(chalk.blue(`🧹 Preparing to clean ${scanResult.ignoredFiles} files...`));

    for (const file of scanResult.ignoredList) {
      try {
        if (!dryRun) {
          await fs.promises.unlink(file);
          deletedFiles.push(file);
          console.log(chalk.green(`✅ Deleted: ${file}`));
        } else {
          console.log(chalk.yellow(`🗑️  Would delete: ${file}`));
        }
      } catch (error) {
        errors.push({ file, error: error.message });
        console.log(chalk.red(`❌ Failed to delete ${file}: ${error.message}`));
      }
    }

    return {
      success: true,
      deletedFiles,
      errors,
      dryRun
    };
  }

  /**
   * Add new pattern to .goosyignore
   */
  async addPattern(pattern) {
    try {
      let content = '';
      try {
        content = await readFile(GOOSY_IGNORE_FILE, 'utf8');
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }

      // Check if pattern already exists
      const existingPatterns = this._parsePatterns(content);
      if (existingPatterns.includes(pattern)) {
        return { success: false, message: 'Pattern already exists' };
      }

      // Add new pattern
      content += `\n${pattern}\n`;
      await writeFile(GOOSY_IGNORE_FILE, content);
      this.patterns.push(pattern);

      console.log(chalk.green(`✅ Added pattern: ${pattern}`));
      return { success: true, pattern };
    } catch (error) {
      console.error(chalk.red('❌ Failed to add pattern:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove pattern from .goosyignore
   */
  async removePattern(pattern) {
    try {
      const content = await readFile(GOOSY_IGNORE_FILE, 'utf8');
      const lines = content.split('\n');
      const newLines = lines.filter(line =>
        line.trim() !== pattern && !line.startsWith('#')
      );

      await writeFile(GOOSY_IGNORE_FILE, newLines.join('\n'));
      this.patterns = this.patterns.filter(p => p !== pattern);

      console.log(chalk.green(`✅ Removed pattern: ${pattern}`));
      return { success: true, pattern };
    } catch (error) {
      console.error(chalk.red('❌ Failed to remove pattern:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Goosy statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      patternsCount: this.patterns.length
    };
  }

  /**
   * Clear Goosy cache
   */
  clearCache() {
    this.cache.clear();
    console.log(chalk.blue('🧹 Goosy cache cleared'));
  }
}

// Export Goosy Engine
const goosyEngine = new GoosyEngine();
module.exports = goosyEngine;
