import { FacebookSearcher } from './facebook-searcher.js';
import fs from 'fs';
import yaml from 'yaml';
import path from 'path';

async function loadKeywords() {
  try {
    const keywordsPath = path.join(process.cwd(), 'keywords.yml');
    const keywordsFile = fs.readFileSync(keywordsPath, 'utf8');
    const keywordsData = yaml.parse(keywordsFile);
    return keywordsData.keywords || [];
  } catch (error) {
    console.error('Error loading keywords:', error.message);
    return [];
  }
}

async function main() {
  const searcher = new FacebookSearcher();
  
  try {
    console.log('Starting Facebook Search Tool...');
    
    // Load keywords from YAML file
    const keywords = await loadKeywords();
    if (keywords.length === 0) {
      console.error('No keywords found in keywords.yml');
      process.exit(1);
    }
    
    console.log(`Loaded ${keywords.length} keywords:`, keywords);
    
    // Initialize browser
    await searcher.initialize();
    
    // Navigate to Facebook
    const navigated = await searcher.navigateToFacebook();
    if (!navigated) {
      console.error('Failed to navigate to Facebook');
      process.exit(1);
    }
    
    // Wait for user to log in
    await searcher.waitForLogin();
    
    // Process each keyword
    for (const keyword of keywords) {
      console.log(`\n--- Processing keyword: "${keyword}" ---`);
      
      try {
        // Search for the keyword
        const searchSuccess = await searcher.searchKeyword(keyword);
        if (!searchSuccess) {
          console.error(`Failed to search for keyword: ${keyword}`);
          continue;
        }
        
        // Select Posts filter
        await searcher.selectPostsFilter();
        
        // Scrape posts (up to 15 per keyword)
        const posts = await searcher.scrapeSearchResults(15);
        
        if (posts.length === 0) {
          console.log(`No posts found for keyword: ${keyword}`);
          continue;
        }
        
        // Save each post as JSON
        console.log(`Saving ${posts.length} posts for keyword: ${keyword}`);
        for (let i = 0; i < posts.length; i++) {
          try {
            await searcher.savePostData(posts[i], i + 1);
          } catch (error) {
            console.error(`Error saving post ${i + 1}:`, error.message);
          }
        }
        
        console.log(`Completed processing keyword: ${keyword}`);
        
        // Wait between keywords to avoid rate limiting
        if (keywords.indexOf(keyword) < keywords.length - 1) {
          console.log('Waiting 10 seconds before next keyword...');
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
        
      } catch (error) {
        console.error(`Error processing keyword "${keyword}":`, error.message);
      }
    }
    
    console.log('\n--- Facebook Search Tool completed ---');
    
  } catch (error) {
    console.error('Error in main process:', error.message);
  } finally {
    await searcher.closeBrowser();
  }
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, closing browser...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, closing browser...');
  process.exit(0);
});

main().catch(console.error);