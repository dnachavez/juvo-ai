import { SheetsMonitor } from './sheets-monitor.js';
import { PostScraper } from './post-scraper.js';
import { NotificationClient } from './notification-client.js';
import dotenv from 'dotenv';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

class MentionMonitor {
  constructor() {
    this.sheetsMonitor = null;
    this.postScraper = null;
    this.notificationClient = new NotificationClient();
    this.isRunning = false;
    
    // Configuration from environment variables
    this.config = {
      credentialsPath: process.env.GOOGLE_CREDENTIALS_PATH || './credentials.json',
      spreadsheetId: process.env.SPREADSHEET_ID,
      sheetName: process.env.SHEET_NAME || 'Sheet1',
      pollInterval: parseInt(process.env.POLL_INTERVAL_MS) || 30000
    };
    
    this.validateConfig();
  }

  validateConfig() {
    if (!this.config.spreadsheetId) {
      throw new Error('SPREADSHEET_ID environment variable is required');
    }
    
    console.log('Configuration:');
    console.log('- Credentials Path:', this.config.credentialsPath);
    console.log('- Spreadsheet ID:', this.config.spreadsheetId);
    console.log('- Sheet Name:', this.config.sheetName);
    console.log('- Poll Interval:', this.config.pollInterval, 'ms');
  }

  async initialize() {
    try {
      console.log('Initializing Mention Monitor...');
      
      // Initialize Google Sheets monitor
      this.sheetsMonitor = new SheetsMonitor(
        this.config.credentialsPath,
        this.config.spreadsheetId,
        this.config.sheetName
      );
      await this.sheetsMonitor.initialize();
      
      // Initialize post scraper
      this.postScraper = new PostScraper();
      await this.postScraper.initialize();
      
      console.log('Mention Monitor initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Mention Monitor:', error.message);
      throw error;
    }
  }

  async processRecord(record) {
    try {
      console.log(`Processing record - ID: ${record.id}, Link: ${record.link}`);
      
      const postData = await this.postScraper.scrapePost(record.link);
      
      if (postData) {
        // Add the original record ID to the post data
        postData.originalRecordId = record.id;
        
        const savedPath = await this.postScraper.savePostData(postData);
        console.log(`Successfully processed and saved post: ${savedPath}`);
        
        // Send notification that data was scraped and saved
        await this.notificationClient.notifyDataScraped(
          path.basename(savedPath),
          record.id
        );
        
        // Automatically run analysis on the scraped data
        await this.runAnalysis(savedPath, record.id);
        
        return {
          success: true,
          recordId: record.id,
          savedPath,
          postData
        };
      } else {
        console.error(`Failed to scrape post for record ${record.id}`);
        return {
          success: false,
          recordId: record.id,
          error: 'Failed to scrape post data'
        };
      }
    } catch (error) {
      console.error(`Error processing record ${record.id}:`, error.message);
      return {
        success: false,
        recordId: record.id,
        error: error.message
      };
    }
  }

  async processNewRecords(records) {
    const results = [];
    
    for (const record of records) {
      try {
        const result = await this.processRecord(record);
        results.push(result);
        
        // Add delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`Error processing record ${record.id}:`, error.message);
        results.push({
          success: false,
          recordId: record.id,
          error: error.message
        });
      }
    }
    
    return results;
  }

  async start() {
    if (this.isRunning) {
      console.log('Monitor is already running');
      return;
    }
    
    this.isRunning = true;
    console.log('Starting mention monitoring...');
    
    const pollFunction = await this.sheetsMonitor.pollForNewRecords(this.config.pollInterval);
    
    const monitorLoop = async () => {
      if (!this.isRunning) return;
      
      try {
        const newRecords = await pollFunction();
        
        if (newRecords.length > 0) {
          console.log(`Processing ${newRecords.length} new record(s)...`);
          
          // Send notification that scraping started
          await this.notificationClient.notifyScrapingStarted(newRecords.length);
          
          const results = await this.processNewRecords(newRecords);
          
          const successful = results.filter(r => r.success).length;
          const failed = results.filter(r => !r.success).length;
          
          console.log(`Batch complete - Success: ${successful}, Failed: ${failed}`);
        }
        
      } catch (error) {
        console.error('Error in monitoring loop:', error.message);
      }
      
      // Schedule next poll
      setTimeout(monitorLoop, this.config.pollInterval);
    };
    
    // Start the monitoring loop
    monitorLoop();
  }

  async stop() {
    console.log('Stopping mention monitoring...');
    this.isRunning = false;
    
    if (this.postScraper) {
      await this.postScraper.closeBrowser();
    }
    
    console.log('Mention monitoring stopped');
  }

  // Run analysis on scraped data
  async runAnalysis(scrapedFilePath, recordId) {
    try {
      console.log(`Starting analysis for ${path.basename(scrapedFilePath)}...`);
      
      // Send notification that analysis started
      await this.notificationClient.notifyAnalysisStarted(path.basename(scrapedFilePath));
      
      // Get the analysis tool path (go up to root, then to analysis folder)
      const analysisToolPath = path.join(__dirname, '..', '..', 'analysis', 'integrated-analyzer.js');
      
      return new Promise((resolve, reject) => {
        const analysisProcess = spawn('node', [analysisToolPath], {
          cwd: path.dirname(analysisToolPath),
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let stdout = '';
        let stderr = '';
        
        analysisProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        analysisProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        analysisProcess.on('close', async (code) => {
          if (code === 0) {
            console.log(`Analysis completed successfully for record ${recordId}`);
            console.log('Analysis output:', stdout);
            
            // Send notification that analysis completed
            await this.notificationClient.notifyNewAnalysis(path.basename(scrapedFilePath));
            
            resolve({ success: true, output: stdout });
          } else {
            console.error(`Analysis failed for record ${recordId} with code ${code}`);
            console.error('Analysis error:', stderr);
            reject(new Error(`Analysis process exited with code ${code}: ${stderr}`));
          }
        });
        
        analysisProcess.on('error', (error) => {
          console.error(`Failed to start analysis process:`, error);
          reject(error);
        });
      });
      
    } catch (error) {
      console.error(`Error running analysis for record ${recordId}:`, error.message);
      throw error;
    }
  }

  // Method to process a single URL manually (for testing)
  async processSingleUrl(url, id = null) {
    try {
      if (!this.postScraper) {
        throw new Error('Post scraper not initialized. Call initialize() first.');
      }
      
      const record = { id: id || 'manual', link: url };
      return await this.processRecord(record);
      
    } catch (error) {
      console.error('Error processing single URL:', error.message);
      throw error;
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\\nReceived SIGINT. Shutting down gracefully...');
  if (global.mentionMonitor) {
    await global.mentionMonitor.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\\nReceived SIGTERM. Shutting down gracefully...');
  if (global.mentionMonitor) {
    await global.mentionMonitor.stop();
  }
  process.exit(0);
});

// Main execution
async function main() {
  try {
    const monitor = new MentionMonitor();
    global.mentionMonitor = monitor;
    
    await monitor.initialize();
    await monitor.start();
    
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

// Export for use as module
export { MentionMonitor };

// Run if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}