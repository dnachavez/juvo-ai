// Simple Node.js server to serve analyzed data from the analyzed_data folder
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));

app.use(express.json());

// Get all analyzed data files
app.get('/api/analyzed-data', async (req, res) => {
  try {
    // Go up one level from frontend to root, then to analyzed_data
    const analyzedDataPath = path.join(__dirname, '..', 'analyzed_data');
    
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
    const analyzedDataPath = path.join(__dirname, '..', 'analyzed_data');
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

// Store connected SSE clients
let sseClients = [];

// Server-Sent Events endpoint for real-time notifications
app.get('/api/notifications', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Credentials': 'true'
  });

  // Add client to the list
  sseClients.push(res);

  // Send initial connection confirmation
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to notifications' })}\n\n`);

  // Remove client when connection closes
  req.on('close', () => {
    sseClients = sseClients.filter(client => client !== res);
  });
});

// Notification endpoint to receive notifications from monitoring tool
app.post('/api/notify', (req, res) => {
  const { type, message, data } = req.body;
  
  console.log(`Received notification: ${type} - ${message}`);
  
  // Broadcast to all connected SSE clients
  const notification = {
    type,
    message,
    data,
    timestamp: new Date().toISOString()
  };
  
  sseClients.forEach(client => {
    try {
      client.write(`data: ${JSON.stringify(notification)}\n\n`);
    } catch {
      // Remove dead clients
      sseClients = sseClients.filter(c => c !== client);
    }
  });
  
  res.json({ success: true, message: 'Notification sent to all clients' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: PORT,
    connectedClients: sseClients.length
  });
});

// List all available files (for debugging)
app.get('/api/files', (req, res) => {
  try {
    const analyzedDataPath = path.join(__dirname, '..', 'analyzed_data');
    
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

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET /api/health - Health check`);
  console.log(`  GET /api/files - List all files`);
  console.log(`  GET /api/analyzed-data - Get all analyzed data`);
  console.log(`  GET /api/analyzed-data/:filename - Get specific file`);
});