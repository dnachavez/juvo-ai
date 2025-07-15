# Facebook Search Tool

A Playwright-based tool for searching Facebook posts using specific keywords and scraping the results.

## Features

- Automated Facebook navigation and search
- Keyword-based post searching with Posts filter
- Extracts comprehensive post data including:
  - Post content and metadata
  - Profile information (poster/sharer)
  - Media files (images/videos) with local download
  - Timestamps and permalinks
- Saves each post as individual JSON files
- Configurable keyword list via YAML file
- Supports up to 15 posts per keyword search

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure keywords in `keywords.yml`:
```yaml
keywords:
  - "young girls cebu city"
  - "another keyword"
```

## Usage

1. Start the tool:
```bash
npm start
```

2. The browser will open Facebook - log in manually when prompted

3. Confirm login completion in the terminal

4. The tool will automatically:
   - Search each keyword
   - Apply Posts filter
   - Scrape up to 15 posts per keyword
   - Save posts as JSON files in `../../../scraped_posts/`
   - Download media to `../../../scraped_media/`

## Post Data Structure

Each scraped post is saved as JSON with the following structure:

```json
{
  "postId": "123456789",
  "permalink": "https://facebook.com/posts/123456789",
  "scrapedAt": "2023-12-07T10:30:00.000Z",
  "publishedAt": "2023-12-07T09:00:00.000Z",
  "fullText": "Post content text...",
  "mediaUrls": [
    {
      "originalUrl": "https://scontent.facebook.com/image.jpg",
      "localPath": "/path/to/downloaded/file.jpg",
      "filename": "123456789_2023-12-07T10-30-00-000Z.jpg"
    }
  ],
  "posterName": "John Doe",
  "posterProfileId": "john.doe",
  "posterProfileUrl": "https://facebook.com/john.doe",
  "sharerName": null,
  "sharerProfileId": null,
  "sharerProfileUrl": null
}
```

## Post Detection Patterns

The tool uses the following patterns to identify Facebook posts:

- HTML Element: `div`
- CSS Classes: `xdj266r`, `x14z9mp`, `xat24cr`, `x1lziwak`, `xexx8yu`, `xyri2b`, `x18d9i69`, `x1c1uobl`
- Data Attributes: `data-ad-rendering-role="story_message"`, `data-ad-comet-preview="message"`, `data-ad-preview="message"`

## Notes

- The tool runs with headless=false for manual login
- Rate limiting: 10-second delay between keyword searches
- Duplicate detection prevents saving the same post multiple times
- Supports both original posts and shared posts with proper attribution