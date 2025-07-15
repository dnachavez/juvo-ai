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

  async notifyAnalysisStarted(filename) {
    return this.sendNotification(
      'analysis_started',
      `Starting analysis of: ${filename}`,
      { filename }
    );
  }

  async notifyAnalysisCompleted(filename, analysisResult) {
    return this.sendNotification(
      'new_analysis',
      `Analysis completed: ${filename}`,
      { filename, riskLevel: analysisResult.risk_level, flagged: analysisResult.flagged }
    );
  }
}

export { NotificationClient };