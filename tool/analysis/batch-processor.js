import fs from 'fs';
import path from 'path';
import { ContentAnalyzer } from './content-analyzer.js';

export class BatchProcessor {
  constructor(apiKey) {
    this.analyzer = new ContentAnalyzer(apiKey);
    this.scrapedDataPath = path.join(process.cwd(), '..', '..', 'scraped_posts');
  }

  async processAllScrapedData() {
    try {
      console.log('Starting batch processing of scraped data...');
      
      if (!fs.existsSync(this.scrapedDataPath)) {
        console.log(`Scraped posts folder not found: ${this.scrapedDataPath}`);
        return [];
      }

      const jsonFiles = this.findJsonFiles(this.scrapedDataPath);
      console.log(`Found ${jsonFiles.length} JSON files to process`);

      const results = [];
      for (const filePath of jsonFiles) {
        try {
          console.log(`Processing: ${path.basename(filePath)}`);
          const scrapedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const analysis = await this.analyzer.analyzePost(scrapedData);
          results.push(analysis);
          
          // Add small delay to avoid rate limiting
          await this.delay(1000);
        } catch (error) {
          console.error(`Error processing ${filePath}:`, error.message);
          results.push({ error: error.message, file: filePath });
        }
      }

      console.log(`Batch processing completed. Processed ${results.length} files.`);
      return results;

    } catch (error) {
      console.error('Error in batch processing:', error.message);
      throw error;
    }
  }

  async processSingleFile(filePath) {
    try {
      console.log(`Processing single file: ${filePath}`);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const scrapedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const analysis = await this.analyzer.analyzePost(scrapedData);
      
      console.log(`Single file processing completed: ${filePath}`);
      return analysis;

    } catch (error) {
      console.error(`Error processing single file ${filePath}:`, error.message);
      throw error;
    }
  }

  findJsonFiles(directory) {
    const jsonFiles = [];
    
    function searchRecursively(dir) {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          searchRecursively(fullPath);
        } else if (path.extname(file).toLowerCase() === '.json') {
          jsonFiles.push(fullPath);
        }
      }
    }
    
    searchRecursively(directory);
    return jsonFiles;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async watchScrapedDataFolder() {
    try {
      console.log(`Watching for new files in: ${this.scrapedDataPath}`);
      
      if (!fs.existsSync(this.scrapedDataPath)) {
        fs.mkdirSync(this.scrapedDataPath, { recursive: true });
        console.log(`Created scraped_posts folder: ${this.scrapedDataPath}`);
      }

      fs.watch(this.scrapedDataPath, { recursive: true }, async (eventType, filename) => {
        if (eventType === 'rename' && filename && filename.endsWith('.json')) {
          const filePath = path.join(this.scrapedDataPath, filename);
          
          // Wait a bit to ensure file is completely written
          await this.delay(2000);
          
          if (fs.existsSync(filePath)) {
            console.log(`New file detected: ${filename}`);
            try {
              await this.processSingleFile(filePath);
              console.log(`Successfully processed new file: ${filename}`);
            } catch (error) {
              console.error(`Error processing new file ${filename}:`, error.message);
            }
          }
        }
      });

      console.log('File watcher is now active. Press Ctrl+C to stop.');
      
    } catch (error) {
      console.error('Error setting up file watcher:', error.message);
      throw error;
    }
  }
}