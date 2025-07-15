import { ContentAnalyzer } from './content-analyzer.js';
import dotenv from 'dotenv';

dotenv.config();

export class IntegratedAnalyzer {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.analyzer = new ContentAnalyzer(apiKey);
  }

  async analyzePostFile(filePath) {
    try {
      console.log(`Running integrated analysis for: ${filePath}`);
      
      const fs = await import('fs');
      const postData = JSON.parse(fs.default.readFileSync(filePath, 'utf8'));
      
      const analysis = await this.analyzer.analyzePost(postData);
      
      console.log(`Analysis completed for post ${postData.postId || 'unknown'}`);
      console.log(`Risk level: ${analysis.risk_level}, Flagged: ${analysis.flagged}`);
      
      return analysis;
    } catch (error) {
      console.error(`Error in integrated analysis for ${filePath}:`, error.message);
      throw error;
    }
  }

  static async analyzeIfConfigured(filePath) {
    try {
      const analyzer = new IntegratedAnalyzer();
      return await analyzer.analyzePostFile(filePath);
    } catch (error) {
      console.log('Skipping analysis - not configured or failed:', error.message);
      return null;
    }
  }
}