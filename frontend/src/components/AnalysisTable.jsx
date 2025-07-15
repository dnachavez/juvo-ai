import React, { useState } from "react";
import { AlertTriangle, Eye, Clock, Flag, User, MapPin, Hash, ExternalLink, Info, X, Check } from "lucide-react";

export default function AnalysisTable({ analysisData = [] }) {
  const [sortField, setSortField] = useState("post.scraped_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getRiskLevelColor = (level) => {
    switch (level) {
      case "high":
        return "bg-red-600/20 text-red-400 border-red-600/30";
      case "medium":
        return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30";
      case "low":
        return "bg-green-600/20 text-green-400 border-green-600/30";
      default:
        return "bg-gray-600/20 text-gray-400 border-gray-600/30";
    }
  };

  const getRecommendedActionColor = (action) => {
    switch (action) {
      case "alert_immediate":
        return "bg-red-600/20 text-red-400 border-red-600/30";
      case "alert":
        return "bg-orange-600/20 text-orange-400 border-orange-600/30";
      case "review":
        return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30";
      case "monitor":
        return "bg-blue-600/20 text-blue-400 border-blue-600/30";
      default:
        return "bg-gray-600/20 text-gray-400 border-gray-600/30";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString();
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const sortedData = [...analysisData].sort((a, b) => {
    let aValue = getNestedValue(a, sortField) || "";
    let bValue = getNestedValue(b, sortField) || "";
    
    // Handle date sorting
    if (sortField.includes('_at')) {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const renderArrayValue = (arr) => {
    if (!arr || arr.length === 0) return "";
    if (typeof arr[0] === 'string') {
      return arr.join(', ');
    }
    return `${arr.length} item${arr.length !== 1 ? 's' : ''}`;
  };

  const renderMediaInfo = (media) => {
    if (!media || media.length === 0) return "";
    return media.map((m, idx) => (
      <div key={idx} className="text-xs">
        <div>{m.type || ""}</div>
        {m.url && <ExternalLink className="w-3 h-3 inline" />}
      </div>
    ));
  };

  const getMediaFullText = (media) => {
    if (!media || media.length === 0) return "";
    return media.map(m => `${m.type || 'Unknown'}: ${m.url || 'No URL'}`).join(', ');
  };

  const TruncatedCell = ({ children, fullText, className = "", item = null }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    
    // If there's no full text or it's empty, just return the children without tooltip
    if (!fullText || fullText.trim() === '') {
      return <span className={className}>{children}</span>;
    }
    
    // Always show tooltip functionality if there's fullText
    const handleClick = () => {
      if (item) {
        setSelectedItem(item);
        setShowModal(true);
      }
    };
    
    return (
      <div 
        className={`relative cursor-help ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={handleClick}
      >
        {children}
        {showTooltip && (
          <div className="absolute z-50 bg-slate-900 border border-slate-600 rounded-lg p-3 shadow-xl max-w-sm text-xs text-slate-100 whitespace-normal break-words -top-2 left-0 transform -translate-y-full">
            <div className="mb-1 font-medium text-slate-300">Full Content:</div>
            {fullText}
            <div className="text-xs text-slate-400 mt-2">Click to view full record</div>
            <div className="absolute bottom-0 left-4 transform translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-600"></div>
          </div>
        )}
      </div>
    );
  };

  const DetailModal = ({ item, onClose }) => {
    if (!item) return null;

    const formatValue = (value) => {
      if (value === null || value === undefined) return "N/A";
      if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : "None";
      if (typeof value === 'object') return JSON.stringify(value, null, 2);
      if (typeof value === 'boolean') return value ? "Yes" : "No";
      return String(value);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 rounded-lg border border-slate-700 max-w-4xl max-h-[90vh] overflow-auto w-full">
          <div className="flex justify-between items-center p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-slate-100">Analysis Record Details</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            {/* Analysis ID */}
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Analysis Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium text-slate-300">Analysis ID:</span> <span className="text-slate-100">{formatValue(item.analysis_id)}</span></div>
                <div><span className="font-medium text-slate-300">Priority Score:</span> <span className="text-slate-100">{item.priority_score ? `${item.priority_score}%` : 'N/A'}</span></div>
                <div><span className="font-medium text-slate-300">Risk Level:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(item.risk_level)}`}>{item.risk_level?.toUpperCase()}</span></div>
                <div><span className="font-medium text-slate-300">Flagged:</span> <span className="text-slate-100">{formatValue(item.flagged)}</span></div>
              </div>
            </div>

            {/* Source */}
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Source Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium text-slate-300">Platform:</span> <span className="text-slate-100">{formatValue(item.source?.platform)}</span></div>
                <div><span className="font-medium text-slate-300">Collection Method:</span> <span className="text-slate-100">{formatValue(item.source?.collection_method)}</span></div>
                <div className="md:col-span-2"><span className="font-medium text-slate-300">Scrape Session ID:</span> <span className="text-slate-100">{formatValue(item.source?.scrape_session_id)}</span></div>
              </div>
            </div>

            {/* Post */}
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Post Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium text-slate-300">Post ID:</span> <span className="text-slate-100">{formatValue(item.post?.id)}</span></div>
                <div><span className="font-medium text-slate-300">Scraped At:</span> <span className="text-slate-100">{formatDate(item.post?.scraped_at)}</span></div>
                <div><span className="font-medium text-slate-300">Published At:</span> <span className="text-slate-100">{formatDate(item.post?.published_at)}</span></div>
                <div><span className="font-medium text-slate-300">Language:</span> <span className="text-slate-100">{formatValue(item.language_detected)}</span></div>
                <div className="md:col-span-2"><span className="font-medium text-slate-300">Permalink:</span> <span className="text-slate-100 break-all">{formatValue(item.post?.permalink)}</span></div>
                <div className="md:col-span-2"><span className="font-medium text-slate-300">Full Text:</span> <div className="text-slate-100 mt-1 p-3 bg-slate-800 rounded border border-slate-600">{formatValue(item.post?.full_text)}</div></div>
              </div>
            </div>

            {/* Actors */}
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Actors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium text-slate-300">Poster Name:</span> <span className="text-slate-100">{formatValue(item.actors?.poster?.name)}</span></div>
                <div><span className="font-medium text-slate-300">Poster ID:</span> <span className="text-slate-100">{formatValue(item.actors?.poster?.profile_id)}</span></div>
                <div className="md:col-span-2"><span className="font-medium text-slate-300">Poster URL:</span> <span className="text-slate-100 break-all">{formatValue(item.actors?.poster?.profile_url)}</span></div>
                <div><span className="font-medium text-slate-300">Sharers:</span> <span className="text-slate-100">{formatValue(item.actors?.sharers)}</span></div>
                <div><span className="font-medium text-slate-300">Mentioned People:</span> <span className="text-slate-100">{formatValue(item.actors?.mentioned_people)}</span></div>
              </div>
            </div>

            {/* Risk Scores */}
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Risk Scores</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="font-medium text-slate-300">Grooming:</span> <span className="text-slate-100">{item.risk_scores?.grooming ? (item.risk_scores.grooming * 100).toFixed(1) + '%' : 'N/A'}</span></div>
                <div><span className="font-medium text-slate-300">Trafficking:</span> <span className="text-slate-100">{item.risk_scores?.trafficking ? (item.risk_scores.trafficking * 100).toFixed(1) + '%' : 'N/A'}</span></div>
                <div><span className="font-medium text-slate-300">CSAM:</span> <span className="text-slate-100">{item.risk_scores?.csam ? (item.risk_scores.csam * 100).toFixed(1) + '%' : 'N/A'}</span></div>
                <div><span className="font-medium text-slate-300">Harassment:</span> <span className="text-slate-100">{item.risk_scores?.harassment ? (item.risk_scores.harassment * 100).toFixed(1) + '%' : 'N/A'}</span></div>
              </div>
            </div>

            {/* Analysis Results */}
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Analysis Results</h3>
              <div className="space-y-3 text-sm">
                <div><span className="font-medium text-slate-300">Keywords Matched:</span> <span className="text-slate-100">{formatValue(item.keywords_matched)}</span></div>
                <div><span className="font-medium text-slate-300">Flag Reason:</span> <span className="text-slate-100">{formatValue(item.flag_reason)}</span></div>
                <div><span className="font-medium text-slate-300">Recommended Action:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRecommendedActionColor(item.recommended_action)}`}>{item.recommended_action?.replace('_', ' ').toUpperCase()}</span></div>
                <div><span className="font-medium text-slate-300">Location Detected:</span> <span className="text-slate-100">{formatValue(item.location_detected)}</span></div>
                <div><span className="font-medium text-slate-300">Explanation:</span> <div className="text-slate-100 mt-1 p-3 bg-slate-800 rounded border border-slate-600">{formatValue(item.explanation)}</div></div>
              </div>
            </div>

            {/* Technical Details */}
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Technical Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium text-slate-300">Processing Time:</span> <span className="text-slate-100">{formatValue(item.processing_ms)}ms</span></div>
                <div><span className="font-medium text-slate-300">AI Model:</span> <span className="text-slate-100">{formatValue(item.ai_version?.gemini_model)}</span></div>
                <div><span className="font-medium text-slate-300">RA11930 Compliant:</span> <span className="text-slate-100">{item.compliance?.ra11930 === true ? '✓ Yes' : item.compliance?.ra11930 === false ? '✗ No' : 'N/A'}</span></div>
                <div><span className="font-medium text-slate-300">Privacy Exemption:</span> <span className="text-slate-100">{item.compliance?.data_privacy_exemption === true ? '✓ Yes' : item.compliance?.data_privacy_exemption === false ? '✗ No' : 'N/A'}</span></div>
                <div className="md:col-span-2"><span className="font-medium text-slate-300">Signature:</span> <span className="text-slate-100 break-all">{formatValue(item.signature)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[2000px]">
          <thead>
            <tr className="border-b border-slate-600">
              {/* Analysis ID */}
              <th className="text-left py-3 px-2 text-slate-300 font-medium cursor-pointer hover:text-slate-100 min-w-[120px]"
                  onClick={() => handleSort("analysis_id")}>
                <div className="flex items-center gap-1">
                  Analysis ID
                  {sortField === "analysis_id" && (
                    <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              
              {/* Source columns */}
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[100px]">Platform</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[120px]">Collection Method</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[150px]">Scrape Session ID</th>
              
              {/* Post columns */}
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[120px]">Post ID</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[100px]">Permalink</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium cursor-pointer hover:text-slate-100 min-w-[130px]"
                  onClick={() => handleSort("post.scraped_at")}>
                <div className="flex items-center gap-1">
                  Scraped At
                  {sortField === "post.scraped_at" && (
                    <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium cursor-pointer hover:text-slate-100 min-w-[130px]"
                  onClick={() => handleSort("post.published_at")}>
                <div className="flex items-center gap-1">
                  Published At
                  {sortField === "post.published_at" && (
                    <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[200px]">Full Text</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[80px]">Media</th>
              
              {/* Actors columns */}
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[120px]">Poster Name</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[120px]">Poster ID</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[100px]">Poster URL</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[100px]">Sharers</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[120px]">Mentioned People</th>
              
              {/* Other basic fields */}
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[80px]">Language</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[100px]">Location</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[120px]">Keywords</th>
              
              {/* Risk Scores columns */}
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[80px]">Grooming</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[80px]">Trafficking</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[80px]">CSAM</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[80px]">Harassment</th>
              
              {/* Risk and Flag columns */}
              <th className="text-left py-3 px-2 text-slate-300 font-medium cursor-pointer hover:text-slate-100 min-w-[80px]"
                  onClick={() => handleSort("risk_level")}>
                <div className="flex items-center gap-1">
                  Risk Level
                  {sortField === "risk_level" && (
                    <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[60px]">Flagged</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[120px]">Flag Reason</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[200px]">Explanation</th>
              
              {/* Model outputs */}
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[80px]">Gemini</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[80px]">PhotoDNA</th>
              
              {/* Other fields */}
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[100px]">Matched Hashes</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[120px]">Recommended Action</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium cursor-pointer hover:text-slate-100 min-w-[80px]"
                  onClick={() => handleSort("priority_score")}>
                <div className="flex items-center gap-1">
                  Priority
                  {sortField === "priority_score" && (
                    <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              
              {/* Compliance */}
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[80px]">RA11930</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[100px]">Privacy Exemption</th>
              
              {/* AI Version */}
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[150px]">Gemini Model</th>
              
              {/* Processing and Signature */}
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[80px]">Processing (ms)</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[100px]">Signature</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item) => (
              <tr key={item.analysis_id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                {/* Analysis ID */}
                <td className="py-2 px-2 text-slate-300 text-xs">
                  <TruncatedCell fullText={item.analysis_id} item={item}>
                    {truncateText(item.analysis_id, 12)}
                  </TruncatedCell>
                </td>
                
                {/* Source */}
                <td className="py-2 px-2 text-slate-300 text-xs">
                  {item.source?.platform || ""}
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs">
                  {item.source?.collection_method || ""}
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs">
                  <TruncatedCell fullText={item.source?.scrape_session_id}>
                    {truncateText(item.source?.scrape_session_id, 15)}
                  </TruncatedCell>
                </td>
                
                {/* Post */}
                <td className="py-2 px-2 text-slate-300 text-xs">
                  <TruncatedCell fullText={item.post?.id}>
                    {truncateText(item.post?.id, 12)}
                  </TruncatedCell>
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs">
                  {item.post?.permalink ? (
                    <TruncatedCell fullText={item.post.permalink}>
                      <ExternalLink className="w-3 h-3 text-blue-400" />
                    </TruncatedCell>
                  ) : ""}
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs">
                  {formatDate(item.post?.scraped_at)}
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs">
                  {formatDate(item.post?.published_at)}
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs">
                  <TruncatedCell fullText={item.post?.full_text} item={item}>
                    {truncateText(item.post?.full_text, 25)}
                  </TruncatedCell>
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs">
                  <TruncatedCell fullText={getMediaFullText(item.post?.media)} item={item}>
                    {renderMediaInfo(item.post?.media)}
                  </TruncatedCell>
                </td>
                
                {/* Actors */}
                <td className="py-2 px-2 text-slate-300 text-xs">
                  {item.actors?.poster?.name || ""}
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs">
                  <TruncatedCell fullText={item.actors?.poster?.profile_id}>
                    {truncateText(item.actors?.poster?.profile_id, 12)}
                  </TruncatedCell>
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs">
                  {item.actors?.poster?.profile_url ? (
                    <TruncatedCell fullText={item.actors?.poster?.profile_url}>
                      <ExternalLink className="w-3 h-3 text-blue-400" />
                    </TruncatedCell>
                  ) : ""}
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs">
                  <TruncatedCell fullText={item.actors?.sharers?.join(', ')}>
                    {renderArrayValue(item.actors?.sharers)}
                  </TruncatedCell>
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs">
                  <TruncatedCell fullText={item.actors?.mentioned_people?.join(', ')}>
                    {renderArrayValue(item.actors?.mentioned_people)}
                  </TruncatedCell>
                </td>
                
                {/* Other basic fields */}
                <td className="py-2 px-2 text-slate-300 text-xs">
                  {item.language_detected || ""}
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs">
                  {item.location_detected || ""}
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs">
                  <TruncatedCell fullText={item.keywords_matched?.join(', ')}>
                    {renderArrayValue(item.keywords_matched)}
                  </TruncatedCell>
                </td>
                
                {/* Risk Scores */}
                <td className="py-2 px-2 text-slate-300 text-xs">
                  {item.risk_scores?.grooming ? (item.risk_scores.grooming * 100).toFixed(0) + '%' : ""}
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs">
                  {item.risk_scores?.trafficking ? (item.risk_scores.trafficking * 100).toFixed(0) + '%' : ""}
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs">
                  {item.risk_scores?.csam ? (item.risk_scores.csam * 100).toFixed(0) + '%' : ""}
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs">
                  {item.risk_scores?.harassment ? (item.risk_scores.harassment * 100).toFixed(0) + '%' : ""}
                </td>
                
                {/* Risk and Flag */}
                <td className="py-2 px-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(item.risk_level)}`}>
                    {item.risk_level?.toUpperCase() || ""}
                  </span>
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs">
                  {item.flagged ? "Yes" : "No"}
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs">
                  <TruncatedCell fullText={item.flag_reason?.join(', ')}>
                    {renderArrayValue(item.flag_reason)}
                  </TruncatedCell>
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs">
                  <TruncatedCell fullText={item.explanation} item={item}>
                    {truncateText(item.explanation, 25)}
                  </TruncatedCell>
                </td>
                
                {/* Model outputs */}
                <td className="py-2 px-2 text-slate-300 text-xs">
                  {item.model_outputs?.gemini ? "Available" : ""}
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs">
                  {item.model_outputs?.photodna?.match ? "Match" : item.model_outputs?.photodna?.match === false ? "No Match" : ""}
                </td>
                
                {/* Other fields */}
                <td className="py-2 px-2 text-slate-300 text-xs">
                  <TruncatedCell fullText={item.matched_hashes?.join(', ')}>
                    {renderArrayValue(item.matched_hashes)}
                  </TruncatedCell>
                </td>
                <td className="py-2 px-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRecommendedActionColor(item.recommended_action)}`}>
                    {item.recommended_action?.replace('_', ' ').toUpperCase() || ""}
                  </span>
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs font-medium">
                  {item.priority_score ? `${item.priority_score}%` : ""}
                </td>
                
                {/* Compliance */}
                <td className="py-2 px-2 text-slate-300 text-xs">
                  {item.compliance?.ra11930 === true ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : item.compliance?.ra11930 === false ? (
                    <X className="w-4 h-4 text-red-400" />
                  ) : ""}
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs">
                  {item.compliance?.data_privacy_exemption === true ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : item.compliance?.data_privacy_exemption === false ? (
                    <X className="w-4 h-4 text-red-400" />
                  ) : ""}
                </td>
                
                {/* AI Version */}
                <td className="py-2 px-2 text-slate-300 text-xs">
                  {item.ai_version?.gemini_model || ""}
                </td>
                
                {/* Processing and Signature */}
                <td className="py-2 px-2 text-slate-300 text-xs">
                  {item.processing_ms || ""}
                </td>
                <td className="py-2 px-2 text-slate-300 text-xs">
                  <TruncatedCell fullText={item.signature} item={item}>
                    {truncateText(item.signature, 8)}
                  </TruncatedCell>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedData.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            No analysis data available
          </div>
        )}
      </div>
      
      {/* Modal */}
      {showModal && (
        <DetailModal 
          item={selectedItem} 
          onClose={() => {
            setShowModal(false);
            setSelectedItem(null);
          }} 
        />
      )}
    </div>
  );
}