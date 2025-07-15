// Simple Node.js server to serve analyzed data from the analyzed_data folder
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const app = express();
const PORT = 3001;

// Store SSE connections
let sseConnections = [];

// Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));

app.use(express.json());

// SSE endpoint for real-time notifications
app.get('/api/notifications', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Headers': 'Cache-Control',
    'Access-Control-Allow-Credentials': 'true'
  });

  // Send initial connection message
  res.write('data: {"type": "connected", "message": "Connected to notifications"}\n\n');

  // Store connection
  sseConnections.push(res);

  // Handle client disconnect
  req.on('close', () => {
    sseConnections = sseConnections.filter(conn => conn !== res);
  });
});

// Function to broadcast notification to all connected clients
function broadcastNotification(type, message, data = {}) {
  const notification = {
    type,
    message,
    timestamp: new Date().toISOString(),
    ...data
  };

  const eventData = `data: ${JSON.stringify(notification)}\n\n`;
  
  sseConnections.forEach(res => {
    try {
      res.write(eventData);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  });
}

// API endpoint to trigger notifications (for monitoring tools)
app.post('/api/notify', (req, res) => {
  const { type, message, data } = req.body;
  broadcastNotification(type, message, data);
  res.json({ success: true, message: 'Notification sent' });
});

// Get all analyzed data files
app.get('/api/analyzed-data', async (req, res) => {
  try {
    const analyzedDataPath = path.join(__dirname, 'analyzed_data');
    
    // Check if directory exists
    if (!fs.existsSync(analyzedDataPath)) {
      return res.status(404).json({ error: 'analyzed_data directory not found' });
    }

    // Read all JSON files in the directory
    const files = fs.readdirSync(analyzedDataPath).filter(file => file.endsWith('.json'));
    
    const allData = [];
    
    for (const file of files) {
      try {
        const filePath = path.join(analyzedDataPath, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(fileContent);
        
        // Add metadata about the file
        jsonData._metadata = {
          filename: file,
          filesize: fs.statSync(filePath).size,
          modified: fs.statSync(filePath).mtime
        };
        
        allData.push(jsonData);
      } catch (fileError) {
        console.error(`Error reading file ${file}:`, fileError);
        // Continue with other files even if one fails
      }
    }
    
    res.json({
      success: true,
      count: allData.length,
      data: allData
    });
    
  } catch (error) {
    console.error('Error fetching analyzed data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get specific analyzed data file
app.get('/api/analyzed-data/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const analyzedDataPath = path.join(__dirname, 'analyzed_data');
    const filePath = path.join(analyzedDataPath, filename);
    
    // Security check - ensure filename is safe
    if (!filename.endsWith('.json') || filename.includes('..')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent);
    
    // Add metadata
    jsonData._metadata = {
      filename: filename,
      filesize: fs.statSync(filePath).size,
      modified: fs.statSync(filePath).mtime
    };
    
    res.json({
      success: true,
      data: jsonData
    });
    
  } catch (error) {
    console.error(`Error fetching file ${req.params.filename}:`, error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// List all available files (for debugging)
app.get('/api/files', (req, res) => {
  try {
    const analyzedDataPath = path.join(__dirname, 'analyzed_data');
    
    if (!fs.existsSync(analyzedDataPath)) {
      return res.json({ files: [], error: 'analyzed_data directory not found' });
    }
    
    const files = fs.readdirSync(analyzedDataPath);
    const fileDetails = files.map(file => {
      const filePath = path.join(analyzedDataPath, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        modified: stats.mtime,
        isJson: file.endsWith('.json')
      };
    });
    
    res.json({ 
      files: fileDetails,
      totalFiles: files.length,
      jsonFiles: fileDetails.filter(f => f.isJson).length
    });
    
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Watch for new files in analyzed_data directory
const watchAnalyzedData = () => {
  const analyzedDataPath = path.join(__dirname, 'analyzed_data');
  
  if (fs.existsSync(analyzedDataPath)) {
    const watcher = chokidar.watch(analyzedDataPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });

    watcher.on('add', filePath => {
      const filename = path.basename(filePath);
      if (filename.endsWith('.json')) {
        broadcastNotification(
          'new_analysis',
          `New analysis data available: ${filename}`,
          { filename, filePath }
        );
      }
    });

    console.log(`Watching ${analyzedDataPath} for new files...`);
  }
};

// Watch for new files in scraped_posts directory
const watchScrapedPosts = () => {
  const scrapedPostsPath = path.join(__dirname, 'scraped_posts');
  
  if (fs.existsSync(scrapedPostsPath)) {
    const watcher = chokidar.watch(scrapedPostsPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });

    watcher.on('add', filePath => {
      const filename = path.basename(filePath);
      if (filename.endsWith('.json')) {
        broadcastNotification(
          'data_scraped',
          `Data scraped and saved: ${filename}`,
          { filename, filePath }
        );
      }
    });

    console.log(`Watching ${scrapedPostsPath} for new scraped data...`);
  }
};

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET /api/health - Health check`);
  console.log(`  GET /api/files - List all files`);
  console.log(`  GET /api/analyzed-data - Get all analyzed data`);
  console.log(`  GET /api/analyzed-data/:filename - Get specific file`);
  console.log(`  GET /api/notifications - SSE notifications`);
  console.log(`  POST /api/notify - Send notification`);
  
  // Start file watchers
  watchAnalyzedData();
  watchScrapedPosts();
});