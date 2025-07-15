import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

export class SheetsMonitor {
  constructor(credentialsPath, spreadsheetId, sheetName = 'Sheet1') {
    this.credentialsPath = credentialsPath;
    this.spreadsheetId = spreadsheetId;
    this.sheetName = sheetName;
    this.auth = null;
    this.sheets = null;
    this.lastProcessedRow = 0;
    this.processedRecordsFile = path.join(process.cwd(), 'processed_records.json');
    
    this.loadProcessedRecords();
  }

  async initialize() {
    try {
      const credentials = JSON.parse(fs.readFileSync(this.credentialsPath, 'utf8'));
      
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });

      const authClient = await this.auth.getClient();
      this.sheets = google.sheets({ version: 'v4', auth: authClient });
      
      console.log('Google Sheets API initialized successfully');
    } catch (error) {
      throw new Error(`Failed to initialize Google Sheets API: ${error.message}`);
    }
  }

  loadProcessedRecords() {
    try {
      if (fs.existsSync(this.processedRecordsFile)) {
        const data = fs.readFileSync(this.processedRecordsFile, 'utf8');
        const parsed = JSON.parse(data);
        this.lastProcessedRow = parsed.lastProcessedRow || 0;
      }
    } catch (error) {
      console.warn('Could not load processed records file, starting fresh:', error.message);
      this.lastProcessedRow = 0;
    }
  }

  saveProcessedRecords() {
    try {
      const data = { lastProcessedRow: this.lastProcessedRow };
      fs.writeFileSync(this.processedRecordsFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save processed records:', error.message);
    }
  }

  async getNewRecords() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:B`,
      });

      const rows = response.data.values || [];
      
      if (rows.length <= 1) {
        return [];
      }

      const newRecords = [];
      for (let i = this.lastProcessedRow + 1; i < rows.length; i++) {
        const row = rows[i];
        if (row && row.length >= 2 && row[0] && row[1]) {
          newRecords.push({
            id: row[0].trim(),
            link: row[1].trim(),
            rowIndex: i
          });
        }
      }

      if (newRecords.length > 0) {
        this.lastProcessedRow = rows.length - 1;
        this.saveProcessedRecords();
      }

      return newRecords;
    } catch (error) {
      throw new Error(`Failed to fetch records from Google Sheets: ${error.message}`);
    }
  }

  async pollForNewRecords(intervalMs = 30000) {
    console.log(`Starting to poll for new records every ${intervalMs}ms`);
    
    const poll = async () => {
      try {
        const newRecords = await this.getNewRecords();
        if (newRecords.length > 0) {
          console.log(`Found ${newRecords.length} new record(s)`);
          return newRecords;
        }
        return [];
      } catch (error) {
        console.error('Error polling for records:', error.message);
        return [];
      }
    };

    return poll;
  }
}