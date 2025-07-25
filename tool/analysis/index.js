#!/usr/bin/env node

import { BatchProcessor } from './batch-processor.js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    // Get API key from environment variable or prompt user
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('Error: GEMINI_API_KEY environment variable is required');
      console.log('Please set your Gemini API key:');
      console.log('export GEMINI_API_KEY="your-api-key-here"');
      process.exit(1);
    }

    const processor = new BatchProcessor(apiKey);
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case 'batch':
        console.log('Running batch processing on all scraped data...');
        await processor.processAllScrapedData();
        break;
        
      case 'watch':
        console.log('Starting file watcher...');
        await processor.watchScrapedDataFolder();
        // Keep the process running
        process.stdin.resume();
        break;
        
      case 'single':
        const filePath = args[1];
        if (!filePath) {
          console.error('Error: Please provide a file path');
          console.log('Usage: node index.js single <path-to-json-file>');
          process.exit(1);
        }
        console.log(`Processing single file: ${filePath}`);
        await processor.processSingleFile(filePath);
        break;
        
      case 'test':
        console.log('Running test with sample data...');
        await runTest(processor);
        break;
        
      case 'test-filter':
        console.log('Testing harmful content filtering logic...');
        await runFilterTest(processor);
        break;
        
      default:
        console.log('Juvo AI Content Analysis Tool');
        console.log('');
        console.log('Usage:');
        console.log('  node index.js batch          - Process all JSON files in scraped_data folder');
        console.log('  node index.js watch          - Watch for new files and process automatically');
        console.log('  node index.js single <file>  - Process a single JSON file');
        console.log('  node index.js test           - Run test with sample data');
        console.log('  node index.js test-filter    - Test harmful content filtering logic');
        console.log('');
        console.log('Environment Variables:');
        console.log('  GEMINI_API_KEY - Your Google Gemini API key (required)');
    }

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

async function runFilterTest(processor) {
  console.log('Testing harmful content filtering logic...');
  
  // Test cases for filtering
  const testCases = [
    {
      name: "High Risk - Trafficking Indicators",
      analysisResult: {
        flagged: true,
        risk_level: "high",
        risk_scores: { trafficking: 0.8, grooming: 0.2, csam: 0.1, harassment: 0.1 },
        flag_reason: ["trafficking indicators", "suspicious contact"],
        explanation: "Post contains trafficking indicators and suspicious contact patterns",
        post: { id: "test1" }
      },
      expectedSave: true
    },
    {
      name: "Medium Risk - Grooming Indicators", 
      analysisResult: {
        flagged: true,
        risk_level: "medium",
        risk_scores: { trafficking: 0.1, grooming: 0.7, csam: 0.2, harassment: 0.1 },
        flag_reason: ["grooming behavior", "inappropriate contact with minor"],
        explanation: "Potential grooming behavior detected",
        post: { id: "test2" }
      },
      expectedSave: true
    },
    {
      name: "Low Risk - General Harassment",
      analysisResult: {
        flagged: true, 
        risk_level: "low",
        risk_scores: { trafficking: 0.1, grooming: 0.1, csam: 0.0, harassment: 0.6 },
        flag_reason: ["mild harassment"],
        explanation: "General harassment detected but not serious crime related",
        post: { id: "test3" }
      },
      expectedSave: false
    },
    {
      name: "Not Flagged - Safe Content",
      analysisResult: {
        flagged: false,
        risk_level: "low", 
        risk_scores: { trafficking: 0.0, grooming: 0.0, csam: 0.0, harassment: 0.0 },
        flag_reason: [],
        explanation: "Content appears safe",
        post: { id: "test4" }
      },
      expectedSave: false
    },
    {
      name: "Critical Risk - CSAM Indicators",
      analysisResult: {
        flagged: true,
        risk_level: "critical",
        risk_scores: { trafficking: 0.2, grooming: 0.3, csam: 0.9, harassment: 0.1 },
        flag_reason: ["csam", "child abuse material"],
        explanation: "Critical CSAM indicators detected",
        post: { id: "test5" }
      },
      expectedSave: true
    }
  ];

  console.log(`Running ${testCases.length} filter test cases...\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    const shouldSave = processor.analyzer.shouldSaveAnalysis(testCase.analysisResult);
    const result = shouldSave === testCase.expectedSave ? "PASS" : "FAIL";
    
    console.log(`${result}: ${testCase.name}`);
    console.log(`  Expected Save: ${testCase.expectedSave}, Actual Save: ${shouldSave}`);
    
    if (result === "PASS") {
      passed++;
    } else {
      failed++;
      console.log(`  Risk Level: ${testCase.analysisResult.risk_level}`);
      console.log(`  Risk Scores:`, testCase.analysisResult.risk_scores);
      console.log(`  Flag Reasons:`, testCase.analysisResult.flag_reason);
    }
    console.log();
  }
  
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('✅ All filter tests passed! Harmful content filtering is working correctly.');
  } else {
    console.log('❌ Some filter tests failed. Please review the filtering logic.');
  }
}

async function runTest(processor) {
  try {
    // Create test data that matches the scraped post format
    const testData = {
      postId: "test123456789",
      permalink: "https://www.facebook.com/test/posts/123456789",
      scrapedAt: new Date().toISOString(),
      publishedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      fullText: "Looking for young models for photo shoot. Good pay! DM me for details. Must be 16-18 years old. Private sessions available.",
      mediaUrls: [
        {
          originalUrl: "https://example.com/image.jpg",
          localPath: "/path/to/local/image.jpg",
          filename: "test_image.jpg"
        }
      ],
      posterName: "Test User",
      posterProfileId: "100000000000000",
      posterProfileUrl: "https://www.facebook.com/profile.php?id=100000000000000",
      sharerName: null,
      sharerProfileId: null,
      sharerProfileUrl: null
    };

    console.log('Test data created:', JSON.stringify(testData, null, 2));
    console.log('');
    console.log('Running analysis...');
    
    const result = await processor.analyzer.analyzePost(testData);
    
    console.log('');
    console.log('Analysis Result:');
    console.log('===============');
    console.log(`Risk Level: ${result.risk_level}`);
    console.log(`Flagged: ${result.flagged}`);
    console.log(`Priority Score: ${result.priority_score}`);
    console.log(`Recommended Action: ${result.recommended_action}`);
    console.log(`Processing Time: ${result.processing_ms}ms`);
    console.log('');
    console.log('Risk Scores:');
    console.log(`  Grooming: ${result.risk_scores.grooming}`);
    console.log(`  Trafficking: ${result.risk_scores.trafficking}`);
    console.log(`  CSAM: ${result.risk_scores.csam}`);
    console.log(`  Harassment: ${result.risk_scores.harassment}`);
    console.log('');
    console.log('Flag Reasons:', result.flag_reason);
    console.log('Explanation:', result.explanation);
    console.log('');
    console.log('Full analysis saved to analyzed_data folder');

  } catch (error) {
    console.error('Test failed:', error.message);
    throw error;
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\\nShutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\\nShutting down gracefully...');
  process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}