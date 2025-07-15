import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

export class PostScraper {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.mediaFolder = path.join(process.cwd(), 'scraped_media');
    this.ensureMediaFolderExists();
  }

  ensureMediaFolderExists() {
    if (!fs.existsSync(this.mediaFolder)) {
      fs.mkdirSync(this.mediaFolder, { recursive: true });
      console.log(`Created media folder: ${this.mediaFolder}`);
    }
  }

  async initialize() {
    try {
      this.browser = await chromium.launch({ 
        headless: true,
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


  async scrapePost(url) {
    try {
      console.log(`Navigating to: ${url}`);
      
      await this.page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      await this.page.waitForTimeout(3000);

      const postData = await this.extractPostData(url);
      
      return postData;
    } catch (error) {
      console.error(`Error scraping post ${url}:`, error.message);
      return null;
    }
  }

  async extractPostData(url) {
    const scrapedAt = new Date().toISOString();
    
    try {
      let postData = {
        postId: null,
        permalink: url,
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

      if (url.includes('facebook.com')) {
        postData = await this.extractFacebookData(postData);
      } else {
        throw new Error('Only Facebook URLs are supported');
      }

      return postData;
    } catch (error) {
      console.error('Error extracting post data:', error.message);
      return null;
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

  async extractFacebookData(postData) {
    try {
      // Extract post ID using improved logic
      postData.postId = this.extractPostIdFromUrl(postData.permalink);

      // Wait longer for dynamic content to load
      await this.page.waitForTimeout(5000);

      // Enhanced text selectors based on working Python version
      const textSelectors = [
        '[data-ad-preview="message"]',
        '[data-testid="post_message"]',
        '.userContent',
        '.text_exposed_show',
        'div[dir="auto"]',
        '[data-ad-rendering-role="story_message"]'
      ];
      
      for (const selector of textSelectors) {
        try {
          const textElement = await this.page.$(selector);
          if (textElement) {
            const text = await textElement.textContent();
            if (text && text.trim().length > 0) {
              postData.fullText = text.trim();
              break;
            }
          }
        } catch (e) {}
      }

      // Detect shared posts and extract profile information
      await this.detectSharedPost(postData);

      // Enhanced media extraction with download
      const mediaElements = await this.page.$$('img[src*="scontent"], img[src*="facebook"], video');
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

      // Enhanced timestamp extraction
      try {
        await this.extractFacebookTimestamp(postData);
      } catch (e) {
        console.error('Error extracting timestamp:', e.message);
      }

    } catch (error) {
      console.error('Error extracting Facebook data:', error.message);
    }
    
    return postData;
  }

  async extractFacebookTimestamp(postData) {
    try {
      // Strategy 1: Look for aria-label timestamp links
      const timestampLinks = await this.page.$$('a[aria-label]');
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

      // Strategy 2: Look for time elements with datetime attribute
      const timeElements = await this.page.$$('time[datetime], abbr[data-utime]');
      for (const element of timeElements) {
        try {
          const datetime = await element.getAttribute('datetime') || await element.getAttribute('data-utime');
          if (datetime) {
            postData.publishedAt = new Date(datetime).toISOString();
            return;
          }
        } catch (e) {}
      }

      // Strategy 3: Look for relative time text in links
      const allLinks = await this.page.$$('a');
      for (const link of allLinks) {
        try {
          const linkText = await link.textContent();
          if (linkText && this.isTimePattern(linkText.trim())) {
            const timestamp = this.parseRelativeTime(linkText.trim());
            if (timestamp) {
              postData.publishedAt = timestamp;
              return;
            }
          }
        } catch (e) {}
      }

      // Strategy 4: Look for spans with time-like text
      const spans = await this.page.$$('span');
      for (const span of spans) {
        try {
          const spanText = await span.textContent();
          if (spanText && this.isTimePattern(spanText.trim())) {
            const timestamp = this.parseRelativeTime(spanText.trim());
            if (timestamp) {
              postData.publishedAt = timestamp;
              return;
            }
          }
        } catch (e) {}
      }

    } catch (error) {
      console.error('Error extracting Facebook timestamp:', error.message);
    }
  }

  isTimePattern(text) {
    // Match patterns like: 1h, 2m, 3d, 1 hour, 2 minutes, 3 days, etc.
    const timePatterns = [
      /^\d+[smhd]$/i,                    // 1h, 2m, 3d, 4s
      /^\d+\s*(second|minute|hour|day|week|month|year)s?$/i,  // 1 hour, 2 minutes, etc.
      /^(a|an)\s*(second|minute|hour|day|week|month|year)$/i, // a minute, an hour
      /^just now$/i,
      /^yesterday$/i,
      /^\d{1,2}:\d{2}$/,                // 14:30
      /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,    // 12/25/2023
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

      // Parse relative time patterns
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

      // Handle "a/an" patterns
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

  async extractFacebookProfileInfo(postData) {
    try {
      // Profile link patterns from Python version
      const profilePatterns = [
        /facebook\.com\/profile\.php\?id=\d+/,
        /facebook\.com\/people\/[^\/]+\/pfbid[^\/\?]+/,
        /facebook\.com\/[^\/\?]+\/?$/
      ];

      // Look for profile links
      const allLinks = await this.page.$$('a[href*="facebook.com"]');
      
      for (const link of allLinks) {
        try {
          const href = await link.getAttribute('href');
          if (!href) continue;

          // Clean tracking parameters
          let cleanHref = href;
          if (href.includes('?') && (href.includes('__cft__') || href.includes('__tn__'))) {
            cleanHref = href.split('?')[0];
          }

          // Check if it matches profile patterns
          for (const pattern of profilePatterns) {
            if (pattern.test(cleanHref)) {
              postData.posterProfileUrl = cleanHref;
              
              // Try to get name from strong or span tags within the link
              const nameElement = await link.$('strong, span');
              if (nameElement) {
                const name = await nameElement.textContent();
                if (name && name.trim()) {
                  postData.posterName = name.trim();
                }
              } else {
                const linkText = await link.textContent();
                if (linkText && linkText.trim()) {
                  postData.posterName = linkText.trim();
                }
              }
              
              // Extract profile ID
              const profileIdMatch = cleanHref.match(/profile\.php\?id=(\d+)/) || 
                                  cleanHref.match(/facebook\.com\/([^\/\?]+)/);
              if (profileIdMatch) {
                postData.posterProfileId = profileIdMatch[1];
              }
              
              return; // Found profile info, exit
            }
          }
        } catch (e) {}
      }

      // Fallback: look for data-ad-rendering-role="profile_name"
      if (!postData.posterName) {
        try {
          const profileNameDiv = await this.page.$('div[data-ad-rendering-role="profile_name"]');
          if (profileNameDiv) {
            const nameElement = await profileNameDiv.$('strong, span, h3');
            if (nameElement) {
              const name = await nameElement.textContent();
              if (name && name.trim()) {
                postData.posterName = name.trim();
              }
            }
          }
        } catch (e) {}
      }

    } catch (error) {
      console.error('Error extracting Facebook profile info:', error.message);
    }
  }

  async detectSharedPost(postData) {
    try {
      // Collect all unique profile links from the page
      const profileLinks = [];
      const allLinks = await this.page.$$('a[href*="facebook.com"]');
      
      for (const link of allLinks) {
        try {
          const href = await link.getAttribute('href');
          if (!href) continue;

          let cleanHref = href;
          if (href.includes('?') && (href.includes('__cft__') || href.includes('__tn__'))) {
            cleanHref = href.split('?')[0];
          }

          // Check if it's a profile URL
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

      // Logic: If 2+ profiles = shared post, if 1 profile = original post
      if (profileLinks.length >= 2) {
        // This is a shared post - first profile is the sharer, second is the original poster
        postData.sharerProfileUrl = profileLinks[0].url;
        postData.sharerName = profileLinks[0].name;
        postData.sharerProfileId = this.extractProfileId(profileLinks[0].url);
        
        postData.posterProfileUrl = profileLinks[1].url;
        postData.posterName = profileLinks[1].name;
        postData.posterProfileId = this.extractProfileId(profileLinks[1].url);
      } else if (profileLinks.length === 1) {
        // This is an original post - only one profile (the poster)
        postData.posterProfileUrl = profileLinks[0].url;
        postData.posterName = profileLinks[0].name;
        postData.posterProfileId = this.extractProfileId(profileLinks[0].url);
        
        // Clear any sharer data that might have been set
        postData.sharerProfileUrl = null;
        postData.sharerName = null;
        postData.sharerProfileId = null;
      }
    } catch (error) {
      console.error('Error detecting shared post:', error.message);
    }
  }

  extractProfileId(url) {
    const match = url.match(/profile\.php\?id=(\d+)/) || url.match(/facebook\.com\/([^\/\?]+)/);
    return match ? match[1] : '';
  }


  async downloadMedia(url, postId) {
    try {
      console.log(`Downloading media: ${url}`);
      
      // Clean URL by removing query parameters that might interfere
      const cleanUrl = url.split('?')[0];
      
      // Determine file extension
      const urlExtension = path.extname(cleanUrl) || '.jpg';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${postId || 'unknown'}_${timestamp}${urlExtension}`;
      const filepath = path.join(this.mediaFolder, filename);
      
      return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https:') ? https : http;
        
        const request = protocol.get(url, (response) => {
          // Handle redirects
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
            fs.unlink(filepath, () => {}); // Delete partial file
            reject(error);
          });
        });
        
        request.on('error', (error) => {
          reject(error);
        });
        
        // Set timeout for download
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

  async savePostData(postData) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `post_${postData.postId || timestamp}.json`;
      const filepath = path.join(process.cwd(), 'scraped_posts', filename);
      
      fs.writeFileSync(filepath, JSON.stringify(postData, null, 2));
      console.log(`Saved post data to: ${filepath}`);
      
      // Run analysis on the saved post
      await this.runAnalysis(filepath);
      
      return filepath;
    } catch (error) {
      console.error('Error saving post data:', error.message);
      throw error;
    }
  }

  async runAnalysis(filePath) {
    try {
      // Dynamic import to avoid dependency issues if analysis tool is not available
      const { IntegratedAnalyzer } = await import('../../analysis/integrated-analyzer.js');
      await IntegratedAnalyzer.analyzeIfConfigured(filePath);
    } catch (error) {
      console.log('Analysis skipped:', error.message);
    }
  }
}