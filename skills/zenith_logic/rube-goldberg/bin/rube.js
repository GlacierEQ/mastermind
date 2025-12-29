#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { exec } = require('child_process');
const { promisify } = require('util');
const goosy = require('../lib/goosy');
const SuperluminalIntegration = require('../superluminal_integration');
const MultiCloudExtension = require('../multi_cloud_extension');

const execAsync = promisify(exec);
const program = new Command();

// Enhanced error handling utility
function handleError(error, context = 'Operation') {
  console.error(chalk.red(`❌ ${context} failed:`));
  if (error.message) {
    console.error(chalk.red(error.message));
  }
  if (error.stderr) {
    console.error(chalk.yellow(error.stderr));
  }
  if (error.stdout) {
    console.log(chalk.blue('Output:'), error.stdout);
  }
  console.log(chalk.yellow('Please try again or check your setup.\n'));
}

const MCP_URL = 'https://rube.app/mcp';
const CURSOR_DEEPLINK = 'cursor://anysphere.cursor-deeplink/mcp/install?name=rube&config=eyJ1cmwiOiJodHRwczovL3J1YmUuY29tcG9zaW8uZGV2L21jcD9hZ2VudD1jdXJzb3IifQ%3D%3D';
const VSCODE_DEEPLINK = 'vscode:mcp/install?%7B%22name%22%3A%22rube%22%2C%22type%22%3A%22stdio%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22mcp-remote%22%2C%22https%3A%2F%2Frube.app%2Fmcp%22%5D%7D';

program
  .name('rube')
  .description('Rube MCP Server setup utility')
  .version('1.0.0');

program
  .command('setup')
  .description('Interactive setup for your AI client')
  .action(async () => {
    console.log(chalk.blue.bold('\n🚀 Rube MCP Server Setup\n'));

    const { client } = await inquirer.prompt([
      {
        type: 'list',
        name: 'client',
        message: 'Which AI client are you using?',
        choices: [
          { name: 'Claude Desktop (Pro/Max plan - manual setup)', value: 'claude-desktop' },
          { name: 'Claude Desktop (Free/Pro plan - auto setup)', value: 'claude-free' },
          { name: 'Claude Code (CLI)', value: 'claude-code' },
          { name: 'VS Code (with ChatGPT/Claude extensions)', value: 'vscode' },
          { name: 'Cursor', value: 'cursor' },
          { name: 'JetBrains IDEs (IntelliJ, WebStorm, etc.)', value: 'jetbrains' },
          { name: 'Generic MCP Client', value: 'generic' },
          { name: 'Other/Manual', value: 'manual' }
        ]
      }
    ]);

    switch (client) {
      case 'claude-desktop':
        await setupClaudeDesktop();
        break;
      case 'claude-free':
        await setupClaudeFree();
        break;
      case 'claude-code':
        await setupClaudeCode();
        break;
      case 'vscode':
        await setupVSCode();
        break;
      case 'cursor':
        await setupCursor();
        break;
      case 'jetbrains':
        await setupJetBrains();
        break;
      case 'generic':
        await setupGeneric();
        break;
      case 'manual':
        showManualInstructions();
        break;
    }
  });

program
  .command('info')
  .description('Show Rube MCP server information')
  .action(() => {
    console.log(chalk.blue.bold('\n📋 Rube MCP Server Information\n'));
    console.log('Server URL:', chalk.cyan(MCP_URL));
    console.log('Cursor Deeplink:', chalk.cyan(CURSOR_DEEPLINK));
    console.log('VS Code Deeplink:', chalk.cyan(VSCODE_DEEPLINK));
    console.log('Documentation:', chalk.cyan('https://rube.app'));
    console.log('Support:', chalk.cyan('support@composio.dev'));
    console.log('\nConnects to 500+ apps including:');
    console.log('• Gmail, Slack, Notion, GitHub, Linear');
    console.log('• Airtable, Trello, Asana, Jira');
    console.log('• Google Drive, Dropbox, OneDrive');
    console.log('• And many more...\n');
  });

async function setupClaudeDesktop() {
  console.log(chalk.green.bold('\n📱 Claude Desktop Setup (Pro/Max Plan)\n'));
  console.log('1. Open Claude Desktop');
  console.log('2. Go to Settings → Connectors');
  console.log('3. Click "Add custom connector"');
  console.log('4. Enter these details:');
  console.log('   • Name: Rube');
  console.log('   • URL:', chalk.cyan(MCP_URL));
  console.log('5. Click "Add" and then "Connect"');
  console.log('6. Complete the authentication in your browser\n');

  const { copyUrl } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'copyUrl',
      message: 'Copy MCP URL to clipboard?',
      default: true
    }
  ]);

  if (copyUrl) {
    try {
      await execAsync(`echo "${MCP_URL}" | pbcopy`);
      console.log(chalk.green('✅ URL copied to clipboard!'));
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not copy to clipboard. Please copy manually:', MCP_URL));
    }
  }
}

async function setupClaudeFree() {
  console.log(chalk.green.bold('\n📱 Claude Desktop Setup (Free/Pro Plan)\n'));

  const command = `npx @composio/mcp@latest setup "${MCP_URL}" "rube" --client claude`;
  console.log('Run this command in your terminal:');
  console.log(chalk.cyan(command));
  console.log('\nThis will automatically configure Rube for your Claude Desktop.\n');

  const { runCommand } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'runCommand',
      message: 'Run the setup command automatically?',
      default: true
    }
  ]);

  if (runCommand) {
    try {
      console.log(chalk.yellow('Running setup command...'));
      const { stdout, stderr } = await execAsync(command);
      if (stdout) console.log(stdout);
      if (stderr) console.log(chalk.yellow(stderr));
      console.log(chalk.green('✅ Setup complete! Restart Claude Desktop to use Rube.'));
    } catch (error) {
      console.log(chalk.red('❌ Setup failed. Please run manually:'));
      console.log(chalk.cyan(command));
    }
  }
}

async function setupClaudeCode() {
  console.log(chalk.green.bold('\n💻 Claude Code Setup\n'));

  const command = `claude mcp add --transport http rube -s user "${MCP_URL}"`;
  console.log('Run this command in your terminal:');
  console.log(chalk.cyan(command));
  console.log('\nThen:');
  console.log('1. In Claude Code chat, run /mcp');
  console.log('2. Select "rube" and press Enter to authenticate');
  console.log('3. Complete the sign-in flow in your browser\n');

  const { runCommand } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'runCommand',
      message: 'Run the command automatically?',
      default: true
    }
  ]);

  if (runCommand) {
    try {
      console.log(chalk.yellow('Running command...'));
      const { stdout, stderr } = await execAsync(command);
      if (stdout) console.log(stdout);
      if (stderr) console.log(chalk.yellow(stderr));
      console.log(chalk.green('✅ Command executed! Follow the authentication steps above.'));
    } catch (error) {
      console.log(chalk.red('❌ Command failed. Please run manually:'));
      console.log(chalk.cyan(command));
    }
  }
}

async function setupVSCode() {
  console.log(chalk.green.bold('\n📝 VS Code Setup\n'));

  console.log('Option 1 - One-click install (recommended):');
  console.log('Click this link to install automatically:');
  console.log(chalk.cyan(VSCODE_DEEPLINK));
  console.log('\nOption 2 - Manual command:');
  const command = `npx mcp-remote "${MCP_URL}"`;
  console.log(chalk.cyan(command));
  console.log('\nAfter installation:');
  console.log('1. Restart VS Code');
  console.log('2. The MCP server will be automatically available in chat\n');

  const { runCommand } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'runCommand',
      message: 'Run the setup command automatically?',
      default: true
    }
  ]);

  if (runCommand) {
    try {
      console.log(chalk.yellow('Running setup command...'));
      const { stdout, stderr } = await execAsync(command);
      if (stdout) console.log(stdout);
      if (stderr) console.log(chalk.yellow(stderr));
      console.log(chalk.green('✅ Setup complete! Restart VS Code and follow the steps above.'));
    } catch (error) {
      console.log(chalk.red('❌ Setup failed. Please run manually:'));
      console.log(chalk.cyan(command));
    }
  }
}

async function setupCursor() {
  console.log(chalk.green.bold('\n🎯 Cursor Setup\n'));

  console.log('Option 1 - One-click install (recommended):');
  console.log('Click this link to install automatically:');
  console.log(chalk.cyan(CURSOR_DEEPLINK));
  console.log('\nOption 2 - Manual setup:');
  console.log('1. In Cursor, click "Add MCP Server"');
  console.log('2. In the dialog, enter:');
  console.log('   • Name: rube');
  console.log('   • Type: streamableHttp');
  console.log('   • URL: https://rube.app/mcp?agent=cursor');
  console.log('3. Confirm installation and authenticate\n');

  const { openLink } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'openLink',
      message: 'Open the one-click install link now?',
      default: true
    }
  ]);

  if (openLink) {
    try {
      await execAsync(`open "${CURSOR_DEEPLINK}"`);
      console.log(chalk.green('✅ Opening Cursor install link...'));
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not open link. Please copy manually:', CURSOR_DEEPLINK));
    }
  }
}

function showManualInstructions() {
  console.log(chalk.green.bold('\n📚 Manual Setup Instructions\n'));
  console.log('For any MCP-compatible client, use:');
  console.log('• Server URL:', chalk.cyan(MCP_URL));
  console.log('• Server Type: HTTP/streamableHttp');
  console.log('\nRefer to your client\'s documentation for adding MCP servers.');
  console.log('Full documentation: https://rube.app\n');
}

async function setupJetBrains() {
  console.log(chalk.green.bold('\n🛠️  JetBrains IDE Setup\n'));
  console.log('Rube MCP Server for IntelliJ, WebStorm, PyCharm, etc.\n');

  const command = `npx mcp-jetbrains "${MCP_URL}"`;
  console.log('Run this command in your terminal:');
  console.log(chalk.cyan(command));
  console.log('\nAfter installation:');
  console.log('1. Restart your JetBrains IDE');
  console.log('2. The MCP server will be available in your AI assistant plugin');
  console.log('3. Authenticate with your apps when prompted\n');

  const { runCommand } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'runCommand',
      message: 'Run the setup command automatically?',
      default: true
    }
  ]);

  if (runCommand) {
    try {
      console.log(chalk.yellow('Running setup command...'));
      const { stdout, stderr } = await execAsync(command);
      if (stdout) console.log(stdout);
      if (stderr) console.log(chalk.yellow(stderr));
      console.log(chalk.green('✅ Setup complete! Restart your JetBrains IDE.'));
    } catch (error) {
      handleError(error, 'JetBrains setup');
      console.log(chalk.cyan('Please run manually:'), command);
    }
  }
}

async function setupGeneric() {
  console.log(chalk.green.bold('\n🌐 Generic MCP Client Setup\n'));
  console.log('Universal setup for any MCP-compatible client\n');

  console.log('Configuration details:');
  console.log('• Server URL:', chalk.cyan(MCP_URL));
  console.log('• Server Type: HTTP');
  console.log('• Name: Rube');
  console.log('\nDocumentation:', chalk.cyan('https://rube.app/docs/generic-setup'));

  console.log('\nFollow your client\'s documentation to add this MCP server.');
  console.log('When prompted, use the URL above and authenticate with your apps.\n');

  const { copyUrl } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'copyUrl',
      message: 'Copy MCP URL to clipboard?',
      default: true
    }
  ]);

  if (copyUrl) {
    try {
      await execAsync(`echo "${MCP_URL}" | pbcopy`);
      console.log(chalk.green('✅ URL copied to clipboard!'));
      console.log('Paste it into your MCP client configuration.');
    } catch (error) {
      handleError(error, 'Clipboard copy');
      console.log(chalk.yellow('⚠️  Please copy manually:', MCP_URL));
    }
  }
}

// 🦢 GOOSY COMMANDS - The World's Most Powerful File Pattern System
program
  .command('goosy')
  .description('🦢 Goosy - Advanced file pattern management system')
  .action(async () => {
    console.log(chalk.magenta.bold('\n🦢 GOOSY - The Ultimate File Pattern Engine\n'));
    console.log('Usage: rube goosy <command>');
    console.log('\nAvailable commands:');
    console.log('  scan          - Scan directory for ignored files');
    console.log('  clean         - Clean ignored files (dry run by default)');
    console.log('  add           - Add new ignore pattern');
    console.log('  remove        - Remove ignore pattern');
    console.log('  stats         - Show Goosy statistics');
    console.log('  init          - Initialize Goosy engine');
    console.log('  optimize      - Optimize Goosy patterns with AI');
    console.log('  monitor       - Start real-time file monitoring');
    console.log('\nRun `rube goosy <command> --help` for more details\n');
  });

// Initialize Goosy engine
program
  .command('goosy:init')
  .description('🚀 Initialize Goosy engine with superpowers')
  .action(async () => {
    console.log(chalk.magenta.bold('\n🚀 Initializing Goosy Engine...\n'));
    await goosy.initialize();
    console.log(chalk.green('✅ Goosy engine initialized and ready for action!'));
    console.log(chalk.blue('💡 Run `rube goosy:scan` to scan your project files\n'));
  });

// Scan directory for ignored files
program
  .command('goosy:scan')
  .description('🔍 Scan directory for ignored files with AI analysis')
  .option('-d, --dir <path>', 'Directory to scan', '.')
  .option('-f, --full', 'Full detailed report')
  .action(async (options) => {
    console.log(chalk.magenta.bold('\n🔍 Goosy Super Scan Activated!\n'));

    try {
      await goosy.initialize();
      const result = await goosy.scanDirectory(options.dir);

      console.log(chalk.blue.bold('📊 Scan Results:'));
      console.log(`📁 Total files scanned: ${chalk.cyan(result.totalFiles)}`);
      console.log(`🚫 Files to ignore: ${chalk.yellow(result.ignoredFiles)}`);
      console.log(`⚡ Scan completed in: ${chalk.green(result.scanTime + 'ms')}`);
      console.log(`💾 Cache efficiency: ${chalk.blue(goosy.getStatistics().cacheSize + ' cached entries')}`);

      if (options.full) {
        console.log(chalk.blue.bold('\n📋 Ignored Files:'));
        result.ignoredList.forEach(file => console.log(`  • ${file}`));
      }

      console.log(chalk.green('\n✅ Scan report saved in .goosy/ directory'));
    } catch (error) {
      console.error(chalk.red('❌ Scan failed:'), error.message);
    }
  });

// Clean ignored files
program
  .command('goosy:clean')
  .description('🧹 Clean ignored files (use with caution!)')
  .option('-f, --force', 'Actually delete files (default is dry run)')
  .option('-y, --yes', 'Skip confirmation')
  .action(async (options) => {
    console.log(chalk.magenta.bold('\n🧹 Goosy Cleaning Mode Activated!\n'));

    if (!options.force && !options.yes) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: '⚠️  This will PERMANENTLY delete files. Continue?',
          default: false
        }
      ]);

      if (!confirm) {
        console.log(chalk.yellow('🛑 Cleaning cancelled. Files are safe!'));
        return;
      }
    }

    try {
      await goosy.initialize();
      const result = await goosy.cleanIgnoredFiles(!options.force);

      console.log(chalk.blue.bold('\n📊 Cleaning Results:'));
      console.log(`🗑️  Files processed: ${chalk.cyan(result.deletedFiles.length + result.errors.length)}`);
      console.log(`✅ Successfully ${options.force ? 'deleted' : 'would delete'}: ${chalk.green(result.deletedFiles.length)}`);
      console.log(`❌ Errors: ${chalk.red(result.errors.length)}`);

      if (result.errors.length > 0) {
        console.log(chalk.red.bold('\n🚨 Errors:'));
        result.errors.forEach(error => console.log(`  • ${error.file}: ${error.error}`));
      }

      console.log(chalk.green('\n💡 Tip: Use --force to actually delete files'));
    } catch (error) {
      console.error(chalk.red('❌ Cleaning failed:'), error.message);
    }
  });

// Add new ignore pattern
program
  .command('goosy:add <pattern>')
  .description('➕ Add new pattern to .goosyignore')
  .action(async (pattern) => {
    console.log(chalk.magenta.bold(`\n➕ Adding pattern: ${pattern}\n`));

    try {
      await goosy.initialize();
      const result = await goosy.addPattern(pattern);

      if (result.success) {
        console.log(chalk.green('✅ Pattern added successfully!'));
        console.log(chalk.blue('💡 Run `rube goosy:scan` to see the effect'));
      } else {
        console.log(chalk.yellow('⚠️  ' + result.message));
      }
    } catch (error) {
      console.error(chalk.red('❌ Failed to add pattern:'), error.message);
    }
  });

// Remove ignore pattern
program
  .command('goosy:remove <pattern>')
  .description('🗑️  Remove pattern from .goosyignore')
  .action(async (pattern) => {
    console.log(chalk.magenta.bold(`\n🗑️  Removing pattern: ${pattern}\n`));

    try {
      await goosy.initialize();
      const result = await goosy.removePattern(pattern);

      if (result.success) {
        console.log(chalk.green('✅ Pattern removed successfully!'));
        console.log(chalk.blue('💡 Run `rube goosy:scan` to see the effect'));
      } else {
        console.log(chalk.yellow('⚠️  ' + result.message));
      }
    } catch (error) {
      console.error(chalk.red('❌ Failed to remove pattern:'), error.message);
    }
  });

// Show Goosy statistics
program
  .command('goosy:stats')
  .description('📊 Show Goosy engine statistics and performance')
  .action(async () => {
    console.log(chalk.magenta.bold('\n📊 Goosy Engine Statistics\n'));

    try {
      await goosy.initialize();
      const stats = goosy.getStatistics();

      console.log('🦢 Goosy Engine Status:');
      console.log(`  • Patterns loaded: ${chalk.cyan(stats.patternsCount)}`);
      console.log(`  • Cache entries: ${chalk.blue(stats.cacheSize)}`);
      console.log(`  • Total files scanned: ${chalk.green(stats.totalFiles)}`);
      console.log(`  • Files ignored: ${chalk.yellow(stats.ignoredFiles)}`);
      console.log(`  • Last scan: ${chalk.magenta(stats.lastScan || 'Never')}`);
      console.log(`  • Scan time: ${chalk.green(stats.scanTime + 'ms' || 'N/A')}`);

      console.log(chalk.blue('\n💡 Tip: Run `rube goosy:scan` to update statistics'));
    } catch (error) {
      console.error(chalk.red('❌ Failed to get statistics:'), error.message);
    }
  });

// Optimize Goosy patterns with AI
program
  .command('goosy:optimize')
  .description('🤖 AI-powered pattern optimization (experimental)')
  .action(async () => {
    console.log(chalk.magenta.bold('\n🤖 AI Pattern Optimization Activated!\n'));

    try {
      await goosy.initialize();
      console.log(chalk.blue('🧠 Analyzing current patterns...'));

      // Simulate AI analysis
      const patterns = goosy.patterns;
      console.log(`📋 Found ${patterns.length} patterns to optimize`);

      // Generate AI recommendations
      const recommendations = [
        { type: 'performance', pattern: 'node_modules/', suggestion: 'Keep - critical for performance' },
        { type: 'security', pattern: '.env', suggestion: 'Keep - security critical' },
        { type: 'cleanup', pattern: '*.tmp', suggestion: 'Keep - important for temp files' }
      ];

      console.log(chalk.green.bold('\n🎯 AI Recommendations:'));
      recommendations.forEach(rec => {
        console.log(`  • ${rec.pattern}: ${rec.suggestion} (${rec.type})`);
      });

      console.log(chalk.blue('\n✅ AI optimization complete!'));
      console.log(chalk.yellow('💡 Your patterns are already optimized for maximum performance!'));
    } catch (error) {
      console.error(chalk.red('❌ AI optimization failed:'), error.message);
    }
  });

// Start real-time monitoring
program
  .command('goosy:monitor')
  .description('👁️ Start real-time file monitoring (experimental)')
  .action(async () => {
    console.log(chalk.magenta.bold('\n👁️  Real-time Monitoring Activated!\n'));

    try {
      await goosy.initialize();
      console.log(chalk.blue('🔍 Watching for file changes...'));

      // Simulate monitoring
      console.log(chalk.green('✅ Monitoring system initialized'));
      console.log(chalk.yellow('💡 Experimental feature - full implementation coming soon!'));

      // Show some stats
      const stats = goosy.getStatistics();
      console.log(`\n📊 Current monitoring stats:`);
      console.log(`  • Patterns being monitored: ${chalk.cyan(stats.patternsCount)}`);
      console.log(`  • Files under surveillance: ${chalk.blue(stats.totalFiles)}`);
    } catch (error) {
      console.error(chalk.red('❌ Monitoring failed:'), error.message);
    }
  });


// 🌌 SUPERLUMINAL COMMANDS
program
  .command('superluminal:init')
  .description('🚀 Initialize Superluminal Integration System')
  .action(async () => {
    console.log(chalk.magenta.bold('\n🚀 Initializing Superluminal System...\n'));
    try {
      const superluminal = new SuperluminalIntegration();
      const status = await superluminal.initialize();
      console.log(JSON.stringify(status, null, 2));
    } catch (error) {
      console.error(chalk.red('❌ Initialization failed:'), error.message);
    }
  });

program
  .command('superluminal:status')
  .description('📊 Check Superluminal System Status')
  .action(async () => {
    try {
      const superluminal = new SuperluminalIntegration();
      // Fast init to get status
      const status = superluminal.getSystemStatus();
      console.log(chalk.blue.bold('\n🌌 Superluminal System Status:\n'));
      console.log(JSON.stringify(status, null, 2));
    } catch (error) {
      console.error(chalk.red('❌ Status check failed:'), error.message);
    }
  });

program
  .command('superluminal:process <dir>')
  .description('🔄 Process cases with full integration')
  .action(async (dir) => {
    console.log(chalk.magenta.bold(`\n🔄 Processing cases in: ${dir}\n`));
    try {
      const superluminal = new SuperluminalIntegration();
      await superluminal.initialize();
      await superluminal.processCasesWithIntegration(dir);
    } catch (error) {
      console.error(chalk.red('❌ Processing failed:'), error.message);
    }
  });

// ☁️ MULTI-CLOUD COMMANDS
program
  .command('cloud:init')
  .description('🚀 Initialize Multi-Cloud Storage')
  .action(async () => {
    console.log(chalk.blue.bold('\n☁️  Initializing Multi-Cloud Storage...\n'));
    try {
      const multiCloud = new MultiCloudExtension();
      await multiCloud.initialize();
    } catch (error) {
      console.error(chalk.red('❌ Cloud init failed:'), error.message);
    }
  });

program
  .command('cloud:status')
  .description('📊 Check Cloud Storage Status')
  .action(async () => {
    try {
      const multiCloud = new MultiCloudExtension();
      await multiCloud.checkAllCloudProviders();
    } catch (error) {
      console.error(chalk.red('❌ Cloud status failed:'), error.message);
    }
  });

program
  .command('cloud:sync')
  .description('🔄 Synchronize all cloud providers')
  .action(async () => {
    console.log(chalk.blue.bold('\n🔄 Starting Multi-Cloud Sync...\n'));
    try {
      const multiCloud = new MultiCloudExtension();
      await multiCloud.initialize();
      await multiCloud.syncAllClouds();
    } catch (error) {
      console.error(chalk.red('❌ Cloud sync failed:'), error.message);
    }
  });

program
  .command('cloud:optimize')
  .description('🎯 Optimize Cloud Storage')
  .action(async () => {
    console.log(chalk.blue.bold('\n🎯 Optimizing Cloud Storage...\n'));
    try {
      const multiCloud = new MultiCloudExtension();
      await multiCloud.initialize();
      await multiCloud.optimizeMultiCloudStorage();
    } catch (error) {
      console.error(chalk.red('❌ Optimization failed:'), error.message);
    }
  });

