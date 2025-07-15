import fetch from 'node-fetch';

class NotificationClient {
  constructor(apiUrl = 'http://localhost:3001') {
    this.apiUrl = apiUrl;
  }

  async sendNotification(type, message, data = {}) {
    try {
      const response = await fetch(`${this.apiUrl}/api/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          message,
          data
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Notification sent: ${type} - ${message}`);
      return result;
    } catch (error) {
      console.error('Failed to send notification:', error.message);
      // Don't throw error to avoid breaking the main workflow
      return null;
    }
  }

  // Specific notification methods for different events
  async notifyScrapingStarted(recordCount) {
    return this.sendNotification(
      'scraping_started',
      `Starting to scrape ${recordCount} new record(s)`,
      { recordCount }
    );
  }

  async notifyDataScraped(filename, recordId) {
    return this.sendNotification(
      'data_scraped',
      `Data scraped and saved: ${filename}`,
      { filename, recordId }
    );
  }

  async notifyAnalysisStarted(filename) {
    return this.sendNotification(
      'analysis_started',
      `Sending data to analysis tool: ${filename}`,
      { filename }
    );
  }

  async notifyNewAnalysis(filename) {
    return this.sendNotification(
      'new_analysis',
      `New analysis completed: ${filename}`,
      { filename }
    );
  }
}

export { NotificationClient };