import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

export class ContentAnalyzer {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    // Find the project root (where analyzed_data should be)
    let projectRoot = process.cwd();
    while (!projectRoot.endsWith('juvo-ai') && path.dirname(projectRoot) !== projectRoot) {
      projectRoot = path.dirname(projectRoot);
    }
    this.analyzedDataPath = path.join(projectRoot, 'analyzed_data');
    this.ensureAnalyzedDataFolderExists();
  }

  ensureAnalyzedDataFolderExists() {
    if (!fs.existsSync(this.analyzedDataPath)) {
      fs.mkdirSync(this.analyzedDataPath, { recursive: true });
      console.log(`Created analyzed_data folder: ${this.analyzedDataPath}`);
    }
  }

  async analyzePost(scrapedPostData) {
    try {
      const startTime = Date.now();
      console.log(`Analyzing post: ${scrapedPostData.postId || 'unknown'}`);

      const prompt = this.buildAnalysisPrompt(scrapedPostData);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();

      let geminiAnalysis;
      try {
        // Clean the response by removing markdown code blocks if present
        let cleanedText = analysisText.trim();
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        geminiAnalysis = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', parseError);
        geminiAnalysis = { error: 'Failed to parse JSON response', raw_response: analysisText };
      }

      const analysisResult = this.buildStructuredOutput(scrapedPostData, geminiAnalysis, startTime);
      
      await this.saveAnalysis(analysisResult);
      
      console.log(`Analysis completed for post ${scrapedPostData.postId || 'unknown'} in ${analysisResult.processing_ms}ms`);
      return analysisResult;

    } catch (error) {
      console.error(`Error analyzing post ${scrapedPostData.postId || 'unknown'}:`, error.message);
      throw error;
    }
  }

  buildAnalysisPrompt(postData) {
    return `
You are an AI content moderator analyzing social media posts for potential risks. Analyze the following post data and return a JSON response with the specified structure.

POST DATA:
- Text: "${postData.fullText || 'No text content'}"
- Poster: ${postData.posterName || 'Unknown'}
- Platform: Facebook
- Posted: ${postData.publishedAt || 'Unknown time'}
- Media Count: ${postData.mediaUrls ? postData.mediaUrls.length : 0}
- Is Shared Post: ${postData.sharerName ? 'Yes (shared by ' + postData.sharerName + ')' : 'No'}

ANALYSIS REQUIREMENTS:
1. Detect language of the post content
2. Identify any mentioned people/usernames in the text
3. Extract location references if any
4. Find keywords that match risk patterns
5. Calculate risk scores (0.0-1.0) for:
   - grooming: Indicators of potential child grooming behavior
   - trafficking: Signs of human trafficking or exploitation
   - csam: Child sexual abuse material indicators
   - harassment: Cyberbullying or harassment patterns
6. Determine overall risk level: "low", "medium", "high", or "critical"
7. Flag the post if any risk score > 0.5
8. Provide flag reasons and explanation
9. Recommend action: "no_action", "review", "alert", "alert_immediate"
10. Calculate priority score (0-100 based on risk levels and urgency)

RESPONSE FORMAT (JSON only, no other text):
{
  "language_detected": "en",
  "mentioned_people": ["name1", "name2"],
  "location_detected": "city, country" or null,
  "keywords_matched": ["keyword1", "keyword2"],
  "risk_scores": {
    "grooming": 0.0,
    "trafficking": 0.0,
    "csam": 0.0,
    "harassment": 0.0
  },
  "risk_level": "low|medium|high|critical",
  "flagged": false,
  "flag_reason": [],
  "explanation": "Brief explanation of the analysis",
  "recommended_action": "no_action|review|alert|alert_immediate",
  "priority_score": 0,
  "compliance": {
    "ra11930": true,
    "data_privacy_exemption": false
  }
}

Focus on detecting patterns like:
- Requests for private contact ("PM me", "DM me")
- Age-related terms with suspicious context
- Offers of money/gifts to young people
- Sexual language combined with youth references
- Trafficking indicators (transport, control, exploitation)
- Harassment or threatening language
`;
  }

  buildStructuredOutput(scrapedData, geminiAnalysis, startTime) {
    const processingMs = Date.now() - startTime;
    const analysisId = uuidv4();
    const scrapeSessionId = this.generateScrapeSessionId(scrapedData.scrapedAt);

    return {
      analysis_id: analysisId,
      source: {
        platform: "facebook",
        collection_method: "browser_use",
        scrape_session_id: scrapeSessionId
      },
      post: {
        id: scrapedData.postId || "unknown",
        permalink: scrapedData.permalink || `https://www.facebook.com/${scrapedData.postId}`,
        scraped_at: scrapedData.scrapedAt || new Date().toISOString(),
        published_at: scrapedData.publishedAt || scrapedData.scrapedAt || new Date().toISOString(),
        full_text: scrapedData.fullText || "",
        media: this.formatMediaData(scrapedData.mediaUrls || [])
      },
      actors: {
        poster: {
          name: scrapedData.posterName || "Unknown",
          profile_id: scrapedData.posterProfileId || scrapedData.posterId || "",
          profile_url: scrapedData.posterProfileUrl || (scrapedData.posterProfileId ? `https://www.facebook.com/profile.php?id=${scrapedData.posterProfileId}` : "")
        },
        sharers: scrapedData.sharerName ? [{
          name: scrapedData.sharerName,
          profile_id: scrapedData.sharerProfileId || scrapedData.sharerId || "",
          profile_url: scrapedData.sharerProfileUrl || (scrapedData.sharerProfileId ? `https://www.facebook.com/profile.php?id=${scrapedData.sharerProfileId}` : "")
        }] : [],
        mentioned_people: geminiAnalysis.mentioned_people || []
      },
      language_detected: geminiAnalysis.language_detected || "unknown",
      location_detected: geminiAnalysis.location_detected || null,
      keywords_matched: geminiAnalysis.keywords_matched || [],
      risk_scores: {
        grooming: Number((geminiAnalysis.risk_scores?.grooming || 0.0).toFixed(2)),
        trafficking: Number((geminiAnalysis.risk_scores?.trafficking || 0.0).toFixed(2)),
        csam: Number((geminiAnalysis.risk_scores?.csam || 0.0).toFixed(2)),
        harassment: Number((geminiAnalysis.risk_scores?.harassment || 0.0).toFixed(2))
      },
      risk_level: geminiAnalysis.risk_level || "low",
      flagged: geminiAnalysis.flagged || false,
      flag_reason: Array.isArray(geminiAnalysis.flag_reason) ? geminiAnalysis.flag_reason : [],
      explanation: geminiAnalysis.explanation || "Automated analysis completed",
      model_outputs: {
        gemini: geminiAnalysis,
        photodna: { match: false }
      },
      matched_hashes: [],
      recommended_action: geminiAnalysis.recommended_action || "no_action",
      priority_score: geminiAnalysis.priority_score || 0,
      compliance: {
        ra11930: geminiAnalysis.compliance?.ra11930 !== false,
        data_privacy_exemption: geminiAnalysis.compliance?.data_privacy_exemption !== false
      },
      ai_version: {
        gemini_model: "gemini-2.0-flash-exp"
      },
      processing_ms: processingMs,
      signature: this.generateSignature(analysisId, scrapedData.postId, processingMs)
    };
  }

  formatMediaData(mediaUrls) {
    return mediaUrls.map(media => ({
      url: media.originalUrl || media.url,
      type: this.detectMediaType(media.originalUrl || media.url || ''),
      hash_sha256: this.generateMediaHash(media.localPath || media.filename || '')
    }));
  }

  detectMediaType(url) {
    const ext = path.extname(url).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) return 'image';
    if (['.mp4', '.avi', '.mov', '.webm'].includes(ext)) return 'video';
    return 'unknown';
  }

  generateMediaHash(filePath) {
    if (!filePath || !fs.existsSync(filePath)) {
      return crypto.createHash('sha256').update('').digest('hex');
    }
    try {
      const fileBuffer = fs.readFileSync(filePath);
      return crypto.createHash('sha256').update(fileBuffer).digest('hex');
    } catch (error) {
      return crypto.createHash('sha256').update('').digest('hex');
    }
  }

  generateScrapeSessionId(scrapedAt) {
    const date = new Date(scrapedAt);
    const dateStr = date.toISOString().split('T')[0];
    const hourStr = String(date.getUTCHours()).padStart(2, '0');
    return `sess-${dateStr}T${hourStr}:00Z`;
  }

  generateSignature(analysisId, postId, processingMs) {
    const data = `${analysisId}${postId}${processingMs}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 8);
  }

  async saveAnalysis(analysisResult) {
    try {
      // Only save analysis if content is flagged as harmful and relates to serious crimes
      if (!this.shouldSaveAnalysis(analysisResult)) {
        console.log(`Analysis not saved - content does not meet harmful criteria threshold`);
        return null;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `analysis_${analysisResult.post.id}_${timestamp}.json`;
      const filepath = path.join(this.analyzedDataPath, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(analysisResult, null, 2));
      console.log(`Saved harmful content analysis to: ${filepath}`);
      
      return filepath;
    } catch (error) {
      console.error('Error saving analysis:', error.message);
      throw error;
    }
  }

  /**
   * Determines if analysis should be saved based on harmful content criteria
   * Only saves content flagged for child trafficking, online sexual exploitation, and similar harmful activities
   */
  shouldSaveAnalysis(analysisResult) {
    // Must be flagged as concerning content
    if (!analysisResult.flagged) {
      return false;
    }

    // Must have high or critical risk level for serious crimes
    const riskLevel = analysisResult.risk_level?.toLowerCase();
    if (!['high', 'critical'].includes(riskLevel)) {
      return false;
    }

    // Check for specific harmful content indicators with stricter thresholds
    const riskScores = analysisResult.risk_scores || {};
    const seriousHarmThreshold = 0.5; // Higher threshold for serious crimes only

    const hasTraffickingRisk = riskScores.trafficking >= seriousHarmThreshold;
    const hasGroomingRisk = riskScores.grooming >= seriousHarmThreshold;
    const hasCSAMRisk = riskScores.csam >= seriousHarmThreshold;
    
    // Check for specific serious crime keywords in flag reasons
    const flagReasons = (analysisResult.flag_reason || []).join(' ').toLowerCase();
    const seriousCrimeKeywords = [
      'child trafficking', 'human trafficking', 'sexual exploitation', 'grooming',
      'csam', 'child abuse', 'online sexual exploitation', 'child sexual abuse',
      'commercial sexual exploitation', 'child predator', 'online predator',
      'solicitation', 'child solicitation', 'minor exploitation'
    ];
    
    const hasSeriousCrimeKeywords = seriousCrimeKeywords.some(keyword => 
      flagReasons.includes(keyword)
    );

    // Check explanation for serious crime indicators
    const explanation = (analysisResult.explanation || '').toLowerCase();
    const hasSeriousCrimeExplanation = seriousCrimeKeywords.some(keyword => 
      explanation.includes(keyword)
    );

    // Check recommended action for immediate alerts
    const isImmediateAlert = analysisResult.recommended_action === 'alert_immediate';

    // Save only if serious harmful indicators are present
    const shouldSave = (hasTraffickingRisk || hasGroomingRisk || hasCSAMRisk || 
                       hasSeriousCrimeKeywords || hasSeriousCrimeExplanation || isImmediateAlert) &&
                       analysisResult.priority_score >= 70; // High priority threshold

    if (shouldSave) {
      console.log(`Content flagged for saving - detected serious harmful activities:`, {
        trafficking: hasTraffickingRisk,
        grooming: hasGroomingRisk,
        csam: hasCSAMRisk,
        seriousCrimeKeywords: hasSeriousCrimeKeywords,
        immediateAlert: isImmediateAlert,
        priorityScore: analysisResult.priority_score,
        riskLevel: riskLevel
      });
    } else {
      console.log(`Content not saved - does not meet serious crime criteria (risk: ${riskLevel}, priority: ${analysisResult.priority_score})`);
    }

    return shouldSave;
  }
}