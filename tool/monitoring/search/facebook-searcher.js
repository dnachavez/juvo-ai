import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

export class FacebookSearcher {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.mediaFolder = path.join(process.cwd(), '..', '..', '..', 'scraped_media');
    this.postsFolder = path.join(process.cwd(), '..', '..', '..', 'scraped_posts');
    this.ensureFoldersExist();
  }

  ensureFoldersExist() {
    if (!fs.existsSync(this.mediaFolder)) {
      fs.mkdirSync(this.mediaFolder, { recursive: true });
      console.log(`Created media folder: ${this.mediaFolder}`);
    }
    if (!fs.existsSync(this.postsFolder)) {
      fs.mkdirSync(this.postsFolder, { recursive: true });
      console.log(`Created posts folder: ${this.postsFolder}`);
    }
  }

  async initialize() {
    try {
      this.browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      this.context = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      });
      this.page = await this.context.newPage();
      
      console.log('Playwright browser initialized');
    } catch (error) {
      throw new Error(`Failed to initialize browser: ${error.message}`);
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async navigateToFacebook() {
    try {
      console.log('Navigating to Facebook...');
      await this.page.goto('https://www.facebook.com', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      await this.page.waitForTimeout(3000);
      
      return true;
    } catch (error) {
      console.error('Error navigating to Facebook:', error.message);
      return false;
    }
  }

  async promptUserLogin() {
    return new Promise((resolve) => {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('Have you logged into Facebook? (y/n): ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  async waitForLogin() {
    const isLoggedIn = await this.promptUserLogin();
    if (!isLoggedIn) {
      console.log('Please log into Facebook manually and then restart the script.');
      process.exit(1);
    }
    
    await this.page.waitForTimeout(2000);
  }

  async searchKeyword(keyword) {
    try {
      console.log(`Searching for keyword: ${keyword}`);
      
      // Wait for and click the search bar
      const searchSelector = 'input[placeholder*="Search"], input[aria-label*="Search"], input[data-testid="search"], [role="searchbox"]';
      await this.page.waitForSelector(searchSelector, { timeout: 10000 });
      
      const searchBox = await this.page.$(searchSelector);
      if (!searchBox) {
        throw new Error('Could not find search box');
      }

      await searchBox.click();
      await this.page.waitForTimeout(1000);
      
      // Clear and type the keyword
      await searchBox.fill('');
      await searchBox.type(keyword);
      await this.page.waitForTimeout(1000);
      
      // Press Enter to search
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(3000);
      
      return true;
    } catch (error) {
      console.error('Error searching keyword:', error.message);
      return false;
    }
  }

  async selectPostsFilter() {
    try {
      console.log('Selecting Posts filter...');
      
      // Wait for search results to load
      await this.page.waitForTimeout(3000);
      
      // Look for Posts filter button with various selectors
      const postsFilterSelectors = [
        'a[href*="search/posts"]',
        'span:has-text("Posts")',
        '[data-testid="search_filter_posts"]',
        'div[role="tab"]:has-text("Posts")',
        'a:has-text("Posts")'
      ];
      
      for (const selector of postsFilterSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            await element.click();
            await this.page.waitForTimeout(3000);
            console.log('Posts filter selected');
            return true;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      console.log('Posts filter not found, continuing with current results');
      return true;
    } catch (error) {
      console.error('Error selecting posts filter:', error.message);
      return false;
    }
  }

  async scrapeSearchResults(maxPosts = 15) {
    try {
      console.log(`Scraping up to ${maxPosts} posts...`);
      const scrapedPosts = [];
      let attempts = 0;
      const maxAttempts = 10;

      while (scrapedPosts.length < maxPosts && attempts < maxAttempts) {
        attempts++;
        console.log(`Attempt ${attempts}: Found ${scrapedPosts.length} posts so far`);
        
        // Find post elements using the provided pattern
        const postElements = await this.page.$$('div[data-ad-rendering-role="story_message"]');
        console.log(`Found ${postElements.length} post elements on page`);
        
        for (const postElement of postElements) {
          if (scrapedPosts.length >= maxPosts) break;
          
          try {
            const postData = await this.extractPostFromElement(postElement);
            if (postData && !this.isDuplicatePost(postData, scrapedPosts)) {
              scrapedPosts.push(postData);
              console.log(`Scraped post ${scrapedPosts.length}/${maxPosts}`);
            }
          } catch (error) {
            console.error('Error extracting post:', error.message);
          }
        }
        
        // Scroll down to load more posts
        if (scrapedPosts.length < maxPosts) {
          await this.page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
          });
          await this.page.waitForTimeout(3000);
        }
      }
      
      console.log(`Successfully scraped ${scrapedPosts.length} posts`);
      return scrapedPosts;
    } catch (error) {
      console.error('Error scraping search results:', error.message);
      return [];
    }
  }

  async extractPostFromElement(postElement) {
    try {
      const scrapedAt = new Date().toISOString();
      
      const postData = {
        postId: null,
        permalink: null,
        scrapedAt,
        publishedAt: null,
        fullText: '',
        mediaUrls: [],
        posterName: '',
        posterProfileId: '',
        posterProfileUrl: '',
        sharerName: null,
        sharerProfileId: null,
        sharerProfileUrl: null
      };

      // Extract text content
      const textElement = await postElement.$('[data-ad-rendering-role="story_message"], [data-ad-preview="message"], [data-testid="post_message"]');
      if (textElement) {
        const text = await textElement.textContent();
        if (text && text.trim().length > 0) {
          postData.fullText = text.trim();
        }
      }

      // Extract permalink
      const linkElements = await postElement.$$('a[href*="facebook.com"]');
      for (const linkElement of linkElements) {
        const href = await linkElement.getAttribute('href');
        if (href && (href.includes('/posts/') || href.includes('story_fbid='))) {
          postData.permalink = href;
          postData.postId = this.extractPostIdFromUrl(href);
          break;
        }
      }

      // Extract profile information
      await this.extractProfileInfoFromElement(postElement, postData);

      // Extract media
      await this.extractMediaFromElement(postElement, postData);

      // Extract timestamp
      await this.extractTimestampFromElement(postElement, postData);

      return postData;
    } catch (error) {
      console.error('Error extracting post from element:', error.message);
      return null;
    }
  }

  async extractProfileInfoFromElement(postElement, postData) {
    try {
      const profileLinks = [];
      const allLinks = await postElement.$$('a[href*="facebook.com"]');
      
      for (const link of allLinks) {
        try {
          const href = await link.getAttribute('href');
          if (!href) continue;

          let cleanHref = href;
          if (href.includes('?') && (href.includes('__cft__') || href.includes('__tn__'))) {
            cleanHref = href.split('?')[0];
          }

          if (/facebook\.com\/(profile\.php\?id=\d+|people\/[^\/]+\/pfbid[^\/\?]+|[^\/\?]+\/?$)/.test(cleanHref)) {
            const nameElement = await link.$('strong, span');
            const name = nameElement ? await nameElement.textContent() : await link.textContent();
            
            if (!profileLinks.find(p => p.url === cleanHref) && name && name.trim()) {
              profileLinks.push({
                url: cleanHref,
                name: name.trim()
              });
            }
          }
        } catch (e) {}
      }

      if (profileLinks.length >= 2) {
        postData.sharerProfileUrl = profileLinks[0].url;
        postData.sharerName = profileLinks[0].name;
        postData.sharerProfileId = this.extractProfileId(profileLinks[0].url);
        
        postData.posterProfileUrl = profileLinks[1].url;
        postData.posterName = profileLinks[1].name;
        postData.posterProfileId = this.extractProfileId(profileLinks[1].url);
      } else if (profileLinks.length === 1) {
        postData.posterProfileUrl = profileLinks[0].url;
        postData.posterName = profileLinks[0].name;
        postData.posterProfileId = this.extractProfileId(profileLinks[0].url);
      }
    } catch (error) {
      console.error('Error extracting profile info:', error.message);
    }
  }

  async extractMediaFromElement(postElement, postData) {
    try {
      const mediaElements = await postElement.$$('img[src*="scontent"], img[src*="facebook"], video');
      for (const element of mediaElements) {
        try {
          const src = await element.getAttribute('src');
          if (src && !src.includes('profile') && !src.includes('static') && 
              (src.includes('jpg') || src.includes('png') || src.includes('gif') || src.includes('mp4'))) {
            const localPath = await this.downloadMedia(src, postData.postId);
            if (localPath) {
              postData.mediaUrls.push({
                originalUrl: src,
                localPath: localPath,
                filename: path.basename(localPath)
              });
            }
          }
        } catch (e) {
          console.error('Error processing media element:', e.message);
        }
      }
    } catch (error) {
      console.error('Error extracting media:', error.message);
    }
  }

  async extractTimestampFromElement(postElement, postData) {
    try {
      const timestampLinks = await postElement.$$('a[aria-label]');
      for (const link of timestampLinks) {
        try {
          const ariaLabel = await link.getAttribute('aria-label');
          if (ariaLabel && this.isTimePattern(ariaLabel)) {
            const timestamp = this.parseRelativeTime(ariaLabel);
            if (timestamp) {
              postData.publishedAt = timestamp;
              return;
            }
          }
        } catch (e) {}
      }

      const timeElements = await postElement.$$('time[datetime], abbr[data-utime]');
      for (const element of timeElements) {
        try {
          const datetime = await element.getAttribute('datetime') || await element.getAttribute('data-utime');
          if (datetime) {
            postData.publishedAt = new Date(datetime).toISOString();
            return;
          }
        } catch (e) {}
      }
    } catch (error) {
      console.error('Error extracting timestamp:', error.message);
    }
  }

  extractPostIdFromUrl(url) {
    const patterns = [
      /\/posts\/(\d+)/,
      /story_fbid=(\d+)/,
      /fbid=(\d+)/,
      /\/permalink\/(\d+)/,
      /posts\/(\d+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    try {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;
      for (const param of ['story_fbid', 'fbid', 'id']) {
        if (params.has(param)) {
          return params.get(param);
        }
      }
    } catch (e) {}
    
    return null;
  }

  extractProfileId(url) {
    const match = url.match(/profile\.php\?id=(\d+)/) || url.match(/facebook\.com\/([^\/\?]+)/);
    return match ? match[1] : '';
  }

  isTimePattern(text) {
    const timePatterns = [
      /^\d+[smhd]$/i,
      /^\d+\s*(second|minute|hour|day|week|month|year)s?$/i,
      /^(a|an)\s*(second|minute|hour|day|week|month|year)$/i,
      /^just now$/i,
      /^yesterday$/i,
      /^\d{1,2}:\d{2}$/,
      /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,
    ];
    
    return timePatterns.some(pattern => pattern.test(text));
  }

  parseRelativeTime(timeText) {
    try {
      const now = new Date();
      const text = timeText.toLowerCase().trim();

      if (text === 'just now') {
        return now.toISOString();
      }

      if (text === 'yesterday') {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString();
      }

      const match = text.match(/(\d+)\s*([smhd]|second|minute|hour|day|week|month|year)s?/);
      if (match) {
        const amount = parseInt(match[1]);
        const unit = match[2];
        const date = new Date(now);

        switch (unit.charAt(0)) {
          case 's':
            date.setSeconds(date.getSeconds() - amount);
            break;
          case 'm':
            date.setMinutes(date.getMinutes() - amount);
            break;
          case 'h':
            date.setHours(date.getHours() - amount);
            break;
          case 'd':
            date.setDate(date.getDate() - amount);
            break;
          case 'w':
            date.setDate(date.getDate() - (amount * 7));
            break;
          case 'y':
            date.setFullYear(date.getFullYear() - amount);
            break;
        }

        return date.toISOString();
      }

      const aPattern = text.match(/^(a|an)\s*(second|minute|hour|day|week|month|year)$/);
      if (aPattern) {
        const unit = aPattern[2];
        const date = new Date(now);

        switch (unit.charAt(0)) {
          case 's':
            date.setSeconds(date.getSeconds() - 1);
            break;
          case 'm':
            date.setMinutes(date.getMinutes() - 1);
            break;
          case 'h':
            date.setHours(date.getHours() - 1);
            break;
          case 'd':
            date.setDate(date.getDate() - 1);
            break;
          case 'w':
            date.setDate(date.getDate() - 7);
            break;
          case 'y':
            date.setFullYear(date.getFullYear() - 1);
            break;
        }

        return date.toISOString();
      }

      return null;
    } catch (error) {
      console.error('Error parsing relative time:', error.message);
      return null;
    }
  }

  async downloadMedia(url, postId) {
    try {
      console.log(`Downloading media: ${url}`);
      
      const cleanUrl = url.split('?')[0];
      const urlExtension = path.extname(cleanUrl) || '.jpg';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${postId || 'unknown'}_${timestamp}${urlExtension}`;
      const filepath = path.join(this.mediaFolder, filename);
      
      return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https:') ? https : http;
        
        const request = protocol.get(url, (response) => {
          if (response.statusCode === 301 || response.statusCode === 302) {
            if (response.headers.location) {
              this.downloadMedia(response.headers.location, postId)
                .then(resolve)
                .catch(reject);
              return;
            }
          }
          
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download media: HTTP ${response.statusCode}`));
            return;
          }
          
          const fileStream = fs.createWriteStream(filepath);
          response.pipe(fileStream);
          
          fileStream.on('finish', () => {
            fileStream.close();
            console.log(`Media saved to: ${filepath}`);
            resolve(filepath);
          });
          
          fileStream.on('error', (error) => {
            fs.unlink(filepath, () => {});
            reject(error);
          });
        });
        
        request.on('error', (error) => {
          reject(error);
        });
        
        request.setTimeout(30000, () => {
          request.destroy();
          reject(new Error('Download timeout'));
        });
      });
      
    } catch (error) {
      console.error(`Error downloading media ${url}:`, error.message);
      return null;
    }
  }

  isDuplicatePost(newPost, existingPosts) {
    return existingPosts.some(post => 
      post.postId === newPost.postId || 
      post.permalink === newPost.permalink ||
      (post.fullText === newPost.fullText && post.posterName === newPost.posterName)
    );
  }

  async savePostData(postData, index) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `search_post_${index}_${postData.postId || timestamp}.json`;
      const filepath = path.join(this.postsFolder, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(postData, null, 2));
      console.log(`Saved post data to: ${filepath}`);
      
      return filepath;
    } catch (error) {
      console.error('Error saving post data:', error.message);
      throw error;
    }
  }
}