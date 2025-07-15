# Mention Monitor Tool

This tool monitors a Google Sheets spreadsheet for new mention records and automatically scrapes the linked posts using Playwright.

## Features

- **Google Sheets Integration**: Monitors spreadsheet for new records using Google Service Account
- **Web Scraping**: Uses Playwright to scrape posts from various social platforms
- **Platform Support**: LinkedIn, Twitter/X, Facebook, Instagram, and generic websites
- **Login Modal Handling**: Automatically dismisses login prompts and modals
- **Data Extraction**: Extracts comprehensive post data including text, media, author info
- **JSON Output**: Saves scraped data as JSON files in the `scraped_posts` folder

## Setup

1. **Install Dependencies**:
   ```bash
   cd tool/monitoring/mention
   npm install
   ```

2. **Install Playwright Browsers**:
   ```bash
   npx playwright install chromium
   ```

3. **Google Service Account Setup**:
   - Create a Google Cloud Project
   - Enable Google Sheets API
   - Create a Service Account and download JSON credentials
   - Share your Google Sheet with the service account email
   - Place the credentials JSON file in this directory as `credentials.json`

4. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Required Environment Variables**:
   - `GOOGLE_CREDENTIALS_PATH`: Path to your service account JSON file
   - `SPREADSHEET_ID`: Your Google Sheets ID (from the URL)
   - `SHEET_NAME`: Sheet name (default: "Sheet1")
   - `POLL_INTERVAL_MS`: Polling interval in milliseconds (default: 30000)

## Usage

### Start Monitoring
```bash
npm start
```

### Development Mode (auto-restart)
```bash
npm run dev
```

## Google Sheets Format

Your spreadsheet should have the following columns:
- **Column A**: ID (unique identifier from Zapier)
- **Column B**: Link (URL to the post/mention)

## Extracted Data

The tool extracts the following data for each post:

### Core Data
- `postId`: Platform-specific post identifier
- `permalink`: Original URL
- `scrapedAt`: Timestamp when scraped
- `publishedAt`: Post publication timestamp
- `fullText`: Complete post text content
- `mediaUrls`: Array of image/video URLs

### Author Information
- `posterName`: Author's display name
- `posterProfileId`: Author's username/handle
- `posterProfileUrl`: Author's profile URL

### Shared Content (if applicable)
- `sharerName`: Person who shared the content
- `sharerProfileId`: Sharer's username/handle
- `sharerProfileUrl`: Sharer's profile URL

## Output

Scraped data is saved as JSON files in the `scraped_posts` folder at the project root with the naming convention:
- `post_{postId}.json` (if post ID available)
- `post_{timestamp}.json` (fallback)

## Platform Support

- **LinkedIn**: Full post data extraction including shared content
- **Twitter/X**: Tweet content, media, and author information
- **Facebook**: Post content and basic author data
- **Instagram**: Post captions, media, and author info
- **Generic Sites**: Basic content extraction for other websites

## Error Handling

- Automatic retry for transient failures
- Graceful handling of login modals and popups
- Comprehensive error logging
- Tracks processed records to avoid duplicates

## Monitoring

The tool maintains a `processed_records.json` file to track which spreadsheet rows have been processed, ensuring no duplicates and allowing for restarts without reprocessing old data.

## Graceful Shutdown

The tool handles SIGINT (Ctrl+C) and SIGTERM signals gracefully, properly closing browser instances and saving state.