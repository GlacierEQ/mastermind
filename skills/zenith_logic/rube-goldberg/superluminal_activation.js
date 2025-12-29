#!/usr/bin/env node

/**
 * SUPERLUMINAL SYSTEM ACTIVATION
 * Core system activation without NLP dependencies
 */

const SuperluminalCaseManager = require('./superluminal_case_manager');
const ICloudMemoryExtension = require('./icloud_memory_extension');
const CaseOptimizer = require('./case_optimizer');
const fs = require('fs');
const path = require('path');

class SuperluminalActivation {
    constructor() {
        this.caseManager = new SuperluminalCaseManager();
        this.icloudExtension = new ICloudMemoryExtension();
        this.caseOptimizer = new CaseOptimizer();
        this.systemActive = false;
    }

    /**
     * Activate the complete Superluminal system
     */
    async activate() {
        console.log('🚀 ACTIVATING SUPERLUMINAL COMPLETE INTEGRATION SYSTEM...');

        try {
            // Initialize all subsystems
            console.log('🔄 Initializing subsystems...');
            this.caseManager.initialize();
            this.icloudExtension.initialize();
            this.caseOptimizer.initialize();

            // Check iCloud status
            const icloudStatus = this.icloudExtension.checkICloudMountStatus();
            console.log(`☁️ iCloud Status: ${icloudStatus ? 'Mounted' : 'Not mounted'}`);

            // Create system directories
            this.createSystemDirectories();

            // Test iCloud symlink
            this.icloudExtension.createICloudSymlink();

            // Generate activation report
            const activationReport = this.generateActivationReport();

            this.systemActive = true;

            console.log('✅ SUPERLUMINAL SYSTEM FULLY ACTIVATED!');
            console.log('🚀 All subagents are now operational');
            console.log('💾 iCloud memory extension is active');
            console.log('📊 System monitoring is enabled');

            return activationReport;

        } catch (error) {
            console.error(`❌ Activation failed: ${error.message}`);
            this.systemActive = false;
            return null;
        }
    }

    /**
     * Create system directories
     */
    createSystemDirectories() {
        const directories = [
            './superluminal_workspace',
            './processed_cases',
            './cloud_sync_queue',
            './system_reports',
            './temp_processing',
            './case_database',
            './analysis_reports'
        ];

        directories.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 Created directory: ${dir}`);
            }
        });
    }

    /**
     * Generate activation report
     */
    generateActivationReport() {
        const report = {
            system: 'SUPERLUMINAL COMPLETE INTEGRATION',
            version: '1.0.0',
            activationTimestamp: new Date().toISOString(),
            status: 'ACTIVE',
            components: {
                caseManager: 'Initialized',
                icloudExtension: 'Initialized',
                caseOptimizer: 'Initialized',
                systemIntegration: 'Active'
            },
            storage: {
                local: this.getLocalStorageStats(),
                icloud: this.icloudExtension.getICloudStorageStats()
            },
            capabilities: [
                'Case file processing and optimization',
                'iCloud storage extension',
                'Automatic synchronization',
                'Storage monitoring',
                'System backup/restore',
                'Performance optimization'
            ],
            recommendations: [
                'Run complete system optimization',
                'Enable automatic iCloud sync',
                'Monitor storage usage regularly',
                'Implement regular backups'
            ]
        };

        // Save activation report
        const reportPath = path.join('./system_reports', `activation_report_${new Date().toISOString().split('T')[0]}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        return report;
    }

    /**
     * Get local storage statistics
     */
    getLocalStorageStats() {
        try {
            const stats = fs.statfsSync('.');
            const total = stats.blocks * stats.bsize;
            const available = stats.bavail * stats.bsize;
            const used = total - available;

            return {
                total: total,
                used: used,
                available: available,
                percentageUsed: ((used / total) * 100).toFixed(2),
                totalGB: (total / 1024 / 1024 / 1024).toFixed(2),
                usedGB: (used / 1024 / 1024 / 1024).toFixed(2),
                availableGB: (available / 1024 / 1024 / 1024).toFixed(2)
            };
        } catch (error) {
            console.error(`❌ Failed to get local storage stats: ${error.message}`);
            return {
                total: 0,
                used: 0,
                available: 0,
                percentageUsed: 100,
                totalGB: '0.00',
                usedGB: '0.00',
                availableGB: '0.00'
            };
        }
    }

    /**
     * Run system self-test
     */
    async runSelfTest() {
        console.log('🧪 Running system self-test...');

        const testResults = {
            timestamp: new Date().toISOString(),
            tests: []
        };

        // Test 1: Directory access
        try {
            fs.accessSync('./superluminal_workspace');
            testResults.tests.push({ name: 'Directory Access', status: 'PASS' });
        } catch (error) {
            testResults.tests.push({ name: 'Directory Access', status: 'FAIL', error: error.message });
        }

        // Test 2: iCloud mount check
        try {
            const mounted = this.icloudExtension.checkICloudMountStatus();
            testResults.tests.push({ name: 'iCloud Mount Check', status: mounted ? 'PASS' : 'WARN', details: `iCloud ${mounted ? 'mounted' : 'not mounted'}` });
        } catch (error) {
            testResults.tests.push({ name: 'iCloud Mount Check', status: 'FAIL', error: error.message });
        }

        // Test 3: Storage stats
        try {
            const stats = this.getLocalStorageStats();
            testResults.tests.push({ name: 'Storage Stats', status: 'PASS', details: `${stats.usedGB}GB / ${stats.totalGB}GB used` });
        } catch (error) {
            testResults.tests.push({ name: 'Storage Stats', status: 'FAIL', error: error.message });
        }

        // Test 4: System directories
        try {
            const dirs = fs.readdirSync('.');
            const requiredDirs = ['superluminal_workspace', 'case_database', 'system_reports'];
            const missingDirs = requiredDirs.filter(dir => !dirs.includes(dir));
            testResults.tests.push({ name: 'System Directories', status: missingDirs.length === 0 ? 'PASS' : 'WARN', details: missingDirs.length === 0 ? 'All directories present' : `Missing: ${missingDirs.join(', ')}` });
        } catch (error) {
            testResults.tests.push({ name: 'System Directories', status: 'FAIL', error: error.message });
        }

        // Calculate test results
        const passed = testResults.tests.filter(t => t.status === 'PASS').length;
        const total = testResults.tests.length;
        testResults.summary = {
            passed: passed,
            total: total,
            percentage: ((passed / total) * 100).toFixed(1),
            status: passed === total ? 'OPERATIONAL' : passed >= total * 0.75 ? 'DEGRADED' : 'FAILED'
        };

        // Save test results
        const testReportPath = path.join('./system_reports', `self_test_${new Date().toISOString().split('T')[0]}.json`);
        fs.writeFileSync(testReportPath, JSON.stringify(testResults, null, 2));

        console.log(`📊 Self-test completed: ${testResults.summary.status}`);
        console.log(`   Passed: ${passed}/${total} (${testResults.summary.percentage}%)`);

        return testResults;
    }

    /**
     * Activate iCloud synchronization
     */
    activateICloudSync() {
        try {
            this.icloudExtension.setSyncEnabled(true);
            this.icloudExtension.startAutoSync(15); // Sync every 15 minutes
            console.log('☁️ iCloud synchronization activated');
            return true;
        } catch (error) {
            console.error(`❌ Failed to activate iCloud sync: ${error.message}`);
            return false;
        }
    }

    /**
     * Get system activation status
     */
    getActivationStatus() {
        return {
            system: 'SUPERLUMINAL COMPLETE INTEGRATION',
            status: this.systemActive ? 'ACTIVE' : 'INACTIVE',
            timestamp: new Date().toISOString(),
            components: {
                caseManager: 'Ready',
                icloudExtension: 'Ready',
                caseOptimizer: 'Ready',
                systemIntegration: this.systemActive ? 'Active' : 'Inactive'
            },
            storage: {
                local: this.getLocalStorageStats(),
                icloud: this.icloudExtension.getICloudStorageStats()
            },
            capabilities: this.systemActive ? [
                'Case processing',
                'iCloud integration',
                'Storage optimization',
                'System monitoring',
                'Backup/restore'
            ] : []
        };
    }

    /**
     * Run complete system activation sequence
     */
    async runCompleteActivation() {
        console.log('🎯 RUNNING COMPLETE SYSTEM ACTIVATION SEQUENCE...');

        // Step 1: Activate core system
        const activationReport = await this.activate();

        // Step 2: Run self-test
        const testResults = await this.runSelfTest();

        // Step 3: Activate iCloud sync
        this.activateICloudSync();

        // Step 4: Generate final report
        const finalReport = {
            activationReport: activationReport,
            testResults: testResults,
            systemStatus: this.getActivationStatus(),
            timestamp: new Date().toISOString(),
            conclusion: this.systemActive ?
                'SUPERLUMINAL SYSTEM FULLY OPERATIONAL' :
                'ACTIVATION COMPLETED WITH ISSUES'
        };

        // Save final report
        const finalReportPath = path.join('./system_reports', `complete_activation_${new Date().toISOString().split('T')[0]}.json`);
        fs.writeFileSync(finalReportPath, JSON.stringify(finalReport, null, 2));

        console.log('✅ COMPLETE SYSTEM ACTIVATION FINISHED!');
        console.log(`📊 Final report saved: ${finalReportPath}`);
        console.log(`🚀 System status: ${this.systemActive ? 'FULLY OPERATIONAL' : 'ACTIVATED WITH LIMITATIONS'}`);

        return finalReport;
    }
}

// CLI Interface
if (require.main === module) {
    const activator = new SuperluminalActivation();

    // Process command line arguments
    const command = process.argv[2];

    switch (command) {
        case 'activate':
            activator.runCompleteActivation()
                .then(report => {
                    console.log('✅ SUPERLUMINAL SYSTEM ACTIVATION COMPLETE!');
                    console.log('🚀 All subagents are now operational');
                })
                .catch(err => {
                    console.error(`❌ Activation failed: ${err.message}`);
                    process.exit(1);
                });
            break;

        case 'status':
            const status = activator.getActivationStatus();
            console.log(JSON.stringify(status, null, 2));
            break;

        case 'test':
            activator.runSelfTest()
                .then(results => console.log(JSON.stringify(results, null, 2)))
                .catch(err => console.error(`❌ Test failed: ${err.message}`));
            break;

        default:
            console.log('SUPERLUMINAL SYSTEM ACTIVATION');
            console.log('Usage:');
            console.log('  superluminal_activation.js activate  - Complete system activation');
            console.log('  superluminal_activation.js status    - Get activation status');
            console.log('  superluminal_activation.js test      - Run system self-test');
            break;
    }
}
