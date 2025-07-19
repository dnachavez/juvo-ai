<center>
  <h1>Juvo AI - Social Media Monitoring & Risk Analysis Platform</h1>

  <img src="frontend/public/icon_text.png" width="250">
</center>

A platform for monitoring social media content, analyzing risks, and tracking safety concerns using AI-powered analysis.

## 📁 Project Structure

```
juvo-ai/
├── frontend/                    # React dashboard application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/             # Page components for routing
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # API utilities and helpers
│   │   ├── data/              # Static data files
│   │   └── assets/            # Images and static assets
│   ├── api-server.js          # Express API server
│   ├── dist/                  # Build output directory
│   └── package.json
├── analyzed_data/             # JSON files with analysis results
├── reports/                   # Case report management system
│   ├── case-reports/         # Uploaded report files
│   └── metadata/             # System metadata and configuration
├── tool/                     # Analysis and monitoring tools
│   ├── analysis/             # Content analysis tools
│   └── monitoring/           # Social media monitoring tools
│       ├── mention/          # Facebook mention monitoring
│       │   ├── scraped_posts/  # Raw scraped posts
│       │   └── scraped_media/  # Downloaded media files
│       └── search/           # Keyword-based search monitoring
├── api-server.js             # Root-level API server
├── package.json              # Root package configuration
└── README.md                 # This file
```

## 🚀 Quick Start Guide

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git
- Modern web browser (Chrome, Firefox, Safari, Edge)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd juvo-ai
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
cd frontend
npm install
```

#### Analysis Tool Dependencies
```bash
cd ../tool/analysis
npm install
```

#### Monitoring Tool Dependencies
```bash
cd ../monitoring/mention
npm install

cd ../search
npm install
```

### 3. Start the API Server

The API server serves analyzed data from the `analyzed_data` folder to the frontend dashboard.

```bash
cd frontend
npm run api
```

The API server will start on `http://localhost:3001` and provide:
- `GET /api/analyzed-data` - All analysis results
- `GET /api/health` - Health check
- `GET /api/files` - List all data files
- `GET /api/notifications` - Real-time notifications (SSE)

### 4. Start the Frontend Dashboard

In a new terminal:

```bash
cd frontend
npm run dev
```

The dashboard will be available at `http://localhost:5173`

### 5. Run Analysis Tools

#### Content Analysis
```bash
cd tool/analysis
node integrated-analyzer.js
```

#### Social Media Monitoring
```bash
# For mention monitoring
cd tool/monitoring/mention
node index.js

# For search monitoring
cd tool/monitoring/search
node index.js
```

## 📊 Dashboard Features

### Analysis Section
- **Real-time Data Loading**: Automatically fetches data from `analyzed_data` folder
- **Advanced Filtering**: Filter by risk level, platform, and search terms
- **Detailed View**: Click any row to see complete analysis details
- **Case Status Management**: Track cases through new → investigation → intervention → resolution stages
- **Report Generation**: Required reports for all status changes with optional file uploads
- **Report Viewing**: View all reports and status changes for each case
- **Export Functionality**: Export filtered data to CSV including case status information

### Case Management System
- **Status Tracking**: Four-stage workflow (New, Investigation, Intervention, Resolution)
- **Mandatory Reporting**: Text reports required for all status changes
- **File Uploads**: Support for PDF, DOC, DOCX, and TXT files
- **Report History**: Complete audit trail of all case activities
- **Status Dashboard**: Visual indicators for case status in the main table

### Geographic Risk Analysis
- **Interactive Heatmap**: Shows risk locations across monitored areas with color-coded intensity
- **Risk Summary Dashboard**: High-level statistics and counts with filtering capabilities
- **Scrollable Risk List**: Detailed list of all risk locations with coordinates
- **Real-time Updates**: Updates as new data becomes available

### Categories Analysis
- **Risk Category Breakdown**: Detailed analysis of grooming, trafficking, CSAM, and harassment risks
- **Trend Visualization**: Line graphs showing risk patterns over time
- **Category Statistics**: Individual cards showing category-specific metrics
- **Filterable Data**: Category-specific filtering and analysis

### Keywords Monitoring
- **Keyword Log Management**: Track and manage keyword-based monitoring
- **Search Performance**: Monitor effectiveness of different keyword combinations
- **Log Entry Management**: Add, edit, and delete keyword monitoring entries

## 🔧 API Endpoints

### Analysis Data
- `GET /api/analyzed-data` - Returns all JSON files from analyzed_data folder
- `GET /api/analyzed-data/:filename` - Returns specific analysis file
- `GET /api/files` - Lists all available files with metadata

### Real-time Notifications
- `GET /api/notifications` - Server-Sent Events for real-time updates
- `POST /api/notify` - Send custom notifications

### Health Check
- `GET /api/health` - API server status

## 📁 Data Flow

1. **Monitoring Tools** scrape social media posts → `tool/monitoring/mention/scraped_posts/` and `scraped_media/`
2. **Analysis Tools** process posts → `analyzed_data/`
3. **API Server** serves data from `analyzed_data/`
4. **Dashboard** displays real-time analysis results
5. **Case Management** tracks status changes and reports → `reports/case-reports/` (localStorage for demo)

## 🛠 Tools Overview

### Analysis Tools (`tool/analysis/`)
- **integrated-analyzer.js**: Main content analysis engine
- **content-analyzer.js**: AI-powered content analysis
- **batch-processor.js**: Process multiple files

### Monitoring Tools (`tool/monitoring/`)
- **mention/**: Facebook mention monitoring
- **search/**: Keyword-based search monitoring

## 🔄 Real-time Updates

The system supports real-time updates:
- File watcher monitors `analyzed_data/` and `scraped_posts/` folders
- Server-Sent Events (SSE) push notifications to connected dashboards
- Dashboard automatically refreshes data when new files are detected

## 📈 Data Structure

### Analysis Data Format
Each file in `analyzed_data/` contains:
```json
{
  "analysis_id": "unique-id",
  "source": {
    "platform": "facebook",
    "collection_method": "browser_use",
    "scrape_session_id": "session-id"
  },
  "post": {
    "id": "post-id",
    "full_text": "post content",
    "scraped_at": "2025-07-15T03:15:13.213Z"
  },
  "risk_scores": {
    "grooming": 0.7,
    "trafficking": 0.4,
    "csam": 0.2,
    "harassment": 0.0
  },
  "risk_level": "medium",
  "flagged": true,
  "recommended_action": "review"
}
```

## 🚨 Usage Instructions

### Starting Everything

1. **Terminal 1 - API Server**:
   ```bash
   cd frontend
   npm run api
   ```

2. **Terminal 2 - Dashboard**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Terminal 3 - Analysis (Optional)**:
   ```bash
   cd tool/analysis
   node integrated-analyzer.js
   ```

4. **Terminal 4 - Monitoring (Optional)**:
   ```bash
   cd tool/monitoring/mention
   node index.js
   ```

### Viewing Data

1. Open browser to `http://localhost:5173`
2. The dashboard will automatically load data from `analyzed_data/`
3. Use filters and search to explore the data
4. Click "Refresh" to check for new data
5. Click any table row for detailed view

### Adding New Data

Simply add JSON files to the `analyzed_data/` folder. The system will:
- Automatically detect new files
- Send real-time notifications
- Update the dashboard when you click refresh

## 🔍 Troubleshooting

### No Data Showing
1. Check if API server is running on port 3001
2. Verify `analyzed_data/` folder contains JSON files
3. Check browser console for API errors
4. Click the "Refresh" button in the dashboard

### API Connection Issues
1. Ensure API server is running: `npm run api`
2. Check port 3001 is not in use by other applications
3. Verify CORS settings if accessing from different domain

### Tool Issues
1. Check if all dependencies are installed
2. Verify configuration files exist
3. Check tool-specific README files for setup instructions

## 📝 Development

### Adding New Analysis Types
1. Modify the analysis tools in `tool/analysis/`
2. Ensure output JSON follows the expected schema
3. Dashboard will automatically display new fields

### Custom Notifications
Send custom notifications via API:
```bash
curl -X POST http://localhost:3001/api/notify \
  -H "Content-Type: application/json" \
  -d '{"type": "alert", "message": "Custom notification"}'
```

## 🔒 Security Notes

- API server includes basic security checks for file access
- No sensitive data should be committed to the repository
- Use environment variables for production configurations
- Regularly update dependencies for security patches

## 📚 Additional Resources

- Check individual tool README files for specific configurations
- Review component code for customization options
- API documentation available at `/api/health` endpoint

## 👥 Collaborators

This project is developed and maintained by:

- AI/ML: [dnachavez](https:///github.com/dnachavez)
- Frontend: [Allain-afk](https://github.com/Allain-afk)
- Frontend: [h4nzdev](https://github.com/h4nzdev)
- Presenter/Picther: [Prannsss](https://github.com/Prannsss)

---

For questions or issues, please check the troubleshooting section or review the tool-specific documentation.