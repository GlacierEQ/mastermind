/**
 * Rube MCP Server - Test Suite
 * Basic testing framework for Rube functionality
 */

const { getConfig, getServerInfo, goosy } = require('../index.js');
const assert = require('assert');

// Simple test runner function
function runTest(name, testFn) {
  try {
    testFn();
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    console.error(`❌ ${name}:`, error.message);
    return false;
  }
}

// Run tests if executed directly
if (require.main === module) {
  console.log('🧪 Running Rube MCP Server tests...');

  // Run all tests
  let passed = 0;
  let failed = 0;

  try {
    // Test getConfig
    console.log('📋 Testing getConfig()...');
    const testCases = [
      { client: 'claude-desktop', expectedName: 'Rube' },
      { client: 'cursor', expectedName: 'rube' },
      { client: 'generic', expectedUrl: 'https://rube.app/mcp' },
      { client: 'unknown-client', expectedUrl: 'https://rube.app/mcp' }
    ];

    testCases.forEach(({ client, expectedName, expectedUrl }) => {
      try {
        const config = getConfig(client);
        if (expectedName && config.name === expectedName) passed++;
        else if (expectedUrl && config.url === expectedUrl) passed++;
        else failed++;
      } catch (error) {
        failed++;
        console.error(`❌ getConfig('${client}') failed:`, error.message);
      }
    });

    // Test getServerInfo
    console.log('📋 Testing getServerInfo()...');
    try {
      const serverInfo = getServerInfo();
      if (serverInfo.name === 'Rube MCP Server' && serverInfo.version === '1.0.0') {
        passed++;
      } else {
        failed++;
        console.error('❌ getServerInfo() returned unexpected data');
      }
    } catch (error) {
      failed++;
      console.error('❌ getServerInfo() failed:', error.message);
    }

    // Test Goosy
    console.log('📋 Testing Goosy Engine...');
    try {
      const goosyInfo = goosy.getInfo();
      if (goosyInfo.name === 'Goosy Ultimate' && goosyInfo.version === '1.0.0') {
        passed++;
      } else {
        failed++;
        console.error('❌ goosy.getInfo() returned unexpected data');
      }
    } catch (error) {
      failed++;
      console.error('❌ goosy.getInfo() failed:', error.message);
    }

    // Summary
    console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
    if (failed === 0) {
      console.log('🎉 All tests passed! Rube MCP Server is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please check the implementation.');
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}
