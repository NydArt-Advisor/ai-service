#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Test runner for AI service
 */
class TestRunner {
  constructor() {
    this.testDir = path.join(__dirname);
    this.reportDir = path.join(__dirname, '../reports');
    this.coverageDir = path.join(__dirname, '../coverage');
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 Starting AI Service Test Suite...\n');

    // Create reports directory if it doesn't exist
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }

    // Create coverage directory if it doesn't exist
    if (!fs.existsSync(this.coverageDir)) {
      fs.mkdirSync(this.coverageDir, { recursive: true });
    }

    try {
      // Run unit tests
      await this.runUnitTests();
      
      // Run integration tests
      await this.runIntegrationTests();
      
      // Run performance tests
      await this.runPerformanceTests();
      
      // Generate coverage report
      await this.generateCoverageReport();
      
      console.log('\n✅ All tests completed successfully!');
      
    } catch (error) {
      console.error('\n❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Run unit tests
   */
  async runUnitTests() {
    console.log('📋 Running Unit Tests...');
    
    return new Promise((resolve, reject) => {
      // Use node_modules/.bin/mocha directly to avoid npx dependency
      const mochaPath = path.join(__dirname, '../../node_modules/.bin/mocha');
      const isWindows = process.platform === 'win32';
      const mochaCommand = isWindows ? `${mochaPath}.cmd` : mochaPath;
      
      const testProcess = spawn(mochaCommand, [
        '--timeout', '10000',
        '--reporter', 'spec',
        '--require', 'chai/register-expect',
        '--require', 'sinon',
        path.join(this.testDir, '**/*.test.js')
      ], {
        stdio: 'inherit',
        cwd: path.join(__dirname, '../..')
      });

      testProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Unit tests passed\n');
          resolve();
        } else {
          reject(new Error(`Unit tests failed with code ${code}`));
        }
      });

      testProcess.on('error', (error) => {
        reject(new Error(`Failed to run unit tests: ${error.message}`));
      });
    });
  }

  /**
   * Run integration tests
   */
  async runIntegrationTests() {
    console.log('🔗 Running Integration Tests...');
    
    return new Promise((resolve, reject) => {
      // Use node_modules/.bin/mocha directly to avoid npx dependency
      const mochaPath = path.join(__dirname, '../../node_modules/.bin/mocha');
      const isWindows = process.platform === 'win32';
      const mochaCommand = isWindows ? `${mochaPath}.cmd` : mochaPath;
      
      const testProcess = spawn(mochaCommand, [
        '--timeout', '30000',
        '--reporter', 'spec',
        '--require', 'chai/register-expect',
        '--require', 'sinon',
        path.join(this.testDir, 'integration/**/*.test.js')
      ], {
        stdio: 'inherit',
        cwd: path.join(__dirname, '../..'),
        env: {
          ...process.env,
          NODE_ENV: 'test',
          TEST_MODE: 'integration'
        }
      });

      testProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Integration tests passed\n');
          resolve();
        } else {
          reject(new Error(`Integration tests failed with code ${code}`));
        }
      });

      testProcess.on('error', (error) => {
        reject(new Error(`Failed to run integration tests: ${error.message}`));
      });
    });
  }

  /**
   * Run performance tests
   */
  async runPerformanceTests() {
    console.log('⚡ Running Performance Tests...');
    
    return new Promise((resolve, reject) => {
      // Use node_modules/.bin/mocha directly to avoid npx dependency
      const mochaPath = path.join(__dirname, '../../node_modules/.bin/mocha');
      const isWindows = process.platform === 'win32';
      const mochaCommand = isWindows ? `${mochaPath}.cmd` : mochaPath;
      
      const testProcess = spawn(mochaCommand, [
        '--timeout', '60000',
        '--reporter', 'spec',
        '--require', 'chai/register-expect',
        path.join(this.testDir, 'performance/**/*.test.js')
      ], {
        stdio: 'inherit',
        cwd: path.join(__dirname, '../..'),
        env: {
          ...process.env,
          NODE_ENV: 'test',
          TEST_MODE: 'performance'
        }
      });

      testProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Performance tests passed\n');
          resolve();
        } else {
          reject(new Error(`Performance tests failed with code ${code}`));
        }
      });

      testProcess.on('error', (error) => {
        reject(new Error(`Failed to run performance tests: ${error.message}`));
      });
    });
  }

  /**
   * Generate coverage report
   */
  async generateCoverageReport() {
    console.log('📊 Generating Coverage Report...');
    
    return new Promise((resolve, reject) => {
      // Use node_modules/.bin/nyc and mocha directly to avoid npx dependency
      const nycPath = path.join(__dirname, '../../node_modules/.bin/nyc');
      const mochaPath = path.join(__dirname, '../../node_modules/.bin/mocha');
      const isWindows = process.platform === 'win32';
      const nycCommand = isWindows ? `${nycPath}.cmd` : nycPath;
      const mochaCommand = isWindows ? `${mochaPath}.cmd` : mochaPath;
      
      const coverageProcess = spawn(nycCommand, [
        '--reporter=text',
        '--reporter=html',
        '--reporter=lcov',
        '--report-dir', this.coverageDir,
        mochaCommand,
        '--timeout', '10000',
        '--require', 'chai/register-expect',
        '--require', 'sinon',
        path.join(this.testDir, '**/*.test.js')
      ], {
        stdio: 'inherit',
        cwd: path.join(__dirname, '../..')
      });

      coverageProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Coverage report generated\n');
          resolve();
        } else {
          reject(new Error(`Coverage generation failed with code ${code}`));
        }
      });

      coverageProcess.on('error', (error) => {
        reject(new Error(`Failed to generate coverage report: ${error.message}`));
      });
    });
  }

  /**
   * Run specific test file
   */
  async runSpecificTest(testFile) {
    console.log(`🧪 Running specific test: ${testFile}`);
    
    return new Promise((resolve, reject) => {
      // Use node_modules/.bin/mocha directly to avoid npx dependency
      const mochaPath = path.join(__dirname, '../../node_modules/.bin/mocha');
      const isWindows = process.platform === 'win32';
      const mochaCommand = isWindows ? `${mochaPath}.cmd` : mochaPath;
      
      const testProcess = spawn(mochaCommand, [
        '--timeout', '10000',
        '--reporter', 'spec',
        '--require', 'chai/register-expect',
        '--require', 'sinon',
        path.join(this.testDir, testFile)
      ], {
        stdio: 'inherit',
        cwd: path.join(__dirname, '../..')
      });

      testProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Test passed\n');
          resolve();
        } else {
          reject(new Error(`Test failed with code ${code}`));
        }
      });

      testProcess.on('error', (error) => {
        reject(new Error(`Failed to run test: ${error.message}`));
      });
    });
  }

  /**
   * Watch mode for development
   */
  async runWatchMode() {
    console.log('👀 Starting Watch Mode...');
    
    // Use node_modules/.bin/mocha directly to avoid npx dependency
    const mochaPath = path.join(__dirname, '../../node_modules/.bin/mocha');
    const isWindows = process.platform === 'win32';
    const mochaCommand = isWindows ? `${mochaPath}.cmd` : mochaPath;
    
    const testProcess = spawn(mochaCommand, [
      '--watch',
      '--timeout', '10000',
      '--reporter', 'spec',
      '--require', 'chai/register-expect',
      '--require', 'sinon',
      path.join(this.testDir, '**/*.test.js')
    ], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '../..')
    });

    testProcess.on('error', (error) => {
      console.error(`Watch mode error: ${error.message}`);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping watch mode...');
      testProcess.kill('SIGINT');
      process.exit(0);
    });
  }
}

// CLI interface
if (require.main === module) {
  const runner = new TestRunner();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Run all tests
    runner.runAllTests().catch(console.error);
  } else if (args[0] === '--watch' || args[0] === '-w') {
    // Watch mode
    runner.runWatchMode();
  } else if (args[0] === '--unit') {
    // Unit tests only
    runner.runUnitTests().catch(console.error);
  } else if (args[0] === '--integration') {
    // Integration tests only
    runner.runIntegrationTests().catch(console.error);
  } else if (args[0] === '--performance') {
    // Performance tests only
    runner.runPerformanceTests().catch(console.error);
  } else if (args[0] === '--coverage') {
    // Coverage only
    runner.generateCoverageReport().catch(console.error);
  } else if (args[0] === '--file' && args[1]) {
    // Specific test file
    runner.runSpecificTest(args[1]).catch(console.error);
  } else {
    console.log(`
🧪 AI Service Test Runner

Usage:
  node run-tests.js                    # Run all tests
  node run-tests.js --watch            # Watch mode for development
  node run-tests.js --unit             # Run unit tests only
  node run-tests.js --integration      # Run integration tests only
  node run-tests.js --performance      # Run performance tests only
  node run-tests.js --coverage         # Generate coverage report only
  node run-tests.js --file <filename>  # Run specific test file

Examples:
  node run-tests.js --file ai.test.js
  node run-tests.js --watch
    `);
  }
}

module.exports = TestRunner;



