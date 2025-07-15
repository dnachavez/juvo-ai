import React, { useState, useRef, useEffect } from "react";
import { AlertTriangle, Eye, Clock, Flag, User, MapPin, Hash, ExternalLink, Info, X, Check, FileText, Upload, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered } from "lucide-react";

const AnalysisTable = React.memo(function AnalysisTable({ analysisData = [] }) {
  const [sortField, setSortField] = useState("post.scraped_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [caseStatuses, setCaseStatuses] = useState(() => {
    return JSON.parse(localStorage.getItem('caseStatuses') || '{}');
  });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusChangeItem, setStatusChangeItem] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [reportText, setReportText] = useState("");
  const [reportFile, setReportFile] = useState(null);
  const editorRef = useRef(null);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [viewingReports, setViewingReports] = useState([]);
  const [viewingAnalysisId, setViewingAnalysisId] = useState("");

  // Rich text editor functions
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      setReportText(editorRef.current.innerHTML);
    }
  };

  const clearEditor = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      setReportText('');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "investigation":
        return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30";
      case "intervention":
        return "bg-orange-600/20 text-orange-400 border-orange-600/30";
      case "resolution":
        return "bg-green-600/20 text-green-400 border-green-600/30";
      default:
        return "bg-gray-600/20 text-gray-400 border-gray-600/30";
    }
  };

  const handleStatusChange = (item, status) => {
    setStatusChangeItem(item);
    setNewStatus(status);
    setShowStatusModal(true);
    setReportText("");
    setReportFile(null);
    // Clear editor content
    setTimeout(() => clearEditor(), 100);
  };

  const saveStatusChange = async () => {
    // Check if editor has content (strip HTML tags for validation)
    const textContent = editorRef.current?.textContent || '';
    if (!textContent.trim() && !reportFile) {
      alert("Please provide a report (text or file) when changing status.");
      return;
    }

    try {
      // Create report data
      const reportData = {
        analysisId: statusChangeItem.analysis_id,
        previousStatus: caseStatuses[statusChangeItem.analysis_id] || "new",
        newStatus: newStatus,
        reportText: reportText,
        timestamp: new Date().toISOString(),
        fileName: reportFile?.name || null
      };

      // Save to local storage (in real app, this would be sent to backend)
      const existingReports = JSON.parse(localStorage.getItem('caseReports') || '{}');
      if (!existingReports[statusChangeItem.analysis_id]) {
        existingReports[statusChangeItem.analysis_id] = [];
      }
      existingReports[statusChangeItem.analysis_id].push(reportData);
      localStorage.setItem('caseReports', JSON.stringify(existingReports));

      // Update status
      setCaseStatuses(prev => {
        const updated = {
          ...prev,
          [statusChangeItem.analysis_id]: newStatus
        };
        // Also save to localStorage for persistence
        localStorage.setItem('caseStatuses', JSON.stringify(updated));
        return updated;
      });

      // Reset modal state
      setShowStatusModal(false);
      setStatusChangeItem(null);
      setNewStatus("");
      setReportText("");
      setReportFile(null);
      clearEditor();

      alert("Status updated and report saved successfully!");
    } catch (error) {
      console.error("Error saving status change:", error);
      alert("Error saving status change. Please try again.");
    }
  };

  const getCaseReports = (analysisId) => {
    const reports = JSON.parse(localStorage.getItem('caseReports') || '{}');
    return reports[analysisId] || [];
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case "critical":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      case "high":
        return "bg-orange-500/20 text-orange-500 border-orange-500/30";
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

  const TruncatedCell = React.memo(({ children, fullText, className = "", item = null }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);
    
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
    
    const handleMouseEnter = () => {
      if (timeoutId) clearTimeout(timeoutId);
      setShowTooltip(true);
    };
    
    const handleMouseLeave = () => {
      const id = setTimeout(() => setShowTooltip(false), 100);
      setTimeoutId(id);
    };
    
    useEffect(() => {
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }, [timeoutId]);
    
    return (
      <div 
        className={`relative cursor-help ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
  }, (prevProps, nextProps) => {
    return prevProps.children === nextProps.children && 
           prevProps.fullText === nextProps.fullText && 
           prevProps.className === nextProps.className &&
           prevProps.item?.analysis_id === nextProps.item?.analysis_id;
  });

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
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="bg-slate-900 rounded-lg border border-slate-700 max-w-4xl w-full h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-slate-700 flex-shrink-0">
            <h2 className="text-xl font-bold text-slate-100">Analysis Record Details</h2>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="text-slate-400 hover:text-slate-100 transition-colors p-1 hover:bg-slate-800 rounded"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
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
      </div>
    );
  };

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[2200px]">
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
              
              {/* Status and Actions */}
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[120px]">Status</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[100px]">Reports</th>
              
              {/* Processing and Signature */}
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[80px]">Processing (ms)</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium min-w-[100px]">Signature</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item) => (
              <tr key={item.analysis_id} className="border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer" onClick={() => {
                setSelectedItem(item);
                setShowModal(true);
              }}>
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
                
                {/* Status and Actions */}
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={caseStatuses[item.analysis_id] || "new"}
                      onChange={(e) => handleStatusChange(item, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(caseStatuses[item.analysis_id])} bg-transparent`}
                    >
                      <option value="new">New</option>
                      <option value="investigation">Investigation</option>
                      <option value="intervention">Intervention</option>
                      <option value="resolution">Resolution</option>
                    </select>
                  </div>
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400">
                      {getCaseReports(item.analysis_id).length}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const reports = getCaseReports(item.analysis_id);
                        if (reports.length > 0) {
                          setViewingReports(reports);
                          setViewingAnalysisId(item.analysis_id);
                          setShowReportsModal(true);
                        } else {
                          alert("No reports available for this case.");
                        }
                      }}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <FileText className="w-3 h-3" />
                    </button>
                  </div>
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
      
      {/* Detail Modal */}
      {showModal && (
        <DetailModal 
          item={selectedItem} 
          onClose={() => {
            setShowModal(false);
            setSelectedItem(null);
          }} 
        />
      )}

      {/* Status Change Modal */}
      {showStatusModal && statusChangeItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-lg border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-slate-100">Change Case Status</h2>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-slate-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Case Information</h3>
                <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                  <div><span className="font-medium text-slate-300">Analysis ID:</span> <span className="text-slate-100">{statusChangeItem.analysis_id}</span></div>
                  <div><span className="font-medium text-slate-300">Current Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(caseStatuses[statusChangeItem.analysis_id])}`}>{caseStatuses[statusChangeItem.analysis_id] || "New"}</span></div>
                  <div><span className="font-medium text-slate-300">New Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(newStatus)}`}>{newStatus}</span></div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Required Report</h3>
                <p className="text-slate-400 text-sm mb-4">Please provide a report explaining the status change and any actions taken.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Report Text</label>
                    
                    {/* Rich Text Editor Toolbar */}
                    <div className="bg-slate-800 border border-slate-600 rounded-t-lg p-2 flex items-center gap-1 border-b-0">
                      <button
                        type="button"
                        onClick={() => execCommand('bold')}
                        className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-slate-100"
                        title="Bold"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCommand('italic')}
                        className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-slate-100"
                        title="Italic"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCommand('underline')}
                        className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-slate-100"
                        title="Underline"
                      >
                        <Underline className="w-4 h-4" />
                      </button>
                      
                      <div className="w-px h-6 bg-slate-600 mx-1"></div>
                      
                      <button
                        type="button"
                        onClick={() => execCommand('justifyLeft')}
                        className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-slate-100"
                        title="Align Left"
                      >
                        <AlignLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCommand('justifyCenter')}
                        className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-slate-100"
                        title="Align Center"
                      >
                        <AlignCenter className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCommand('justifyRight')}
                        className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-slate-100"
                        title="Align Right"
                      >
                        <AlignRight className="w-4 h-4" />
                      </button>
                      
                      <div className="w-px h-6 bg-slate-600 mx-1"></div>
                      
                      <button
                        type="button"
                        onClick={() => execCommand('insertUnorderedList')}
                        className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-slate-100"
                        title="Bullet List"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCommand('insertOrderedList')}
                        className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-slate-100"
                        title="Numbered List"
                      >
                        <ListOrdered className="w-4 h-4" />
                      </button>
                      
                      <div className="flex-1"></div>
                      
                      <select
                        onChange={(e) => execCommand('fontSize', e.target.value)}
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-300"
                        defaultValue="3"
                      >
                        <option value="1">8pt</option>
                        <option value="2">10pt</option>
                        <option value="3">12pt</option>
                        <option value="4">14pt</option>
                        <option value="5">18pt</option>
                        <option value="6">24pt</option>
                        <option value="7">36pt</option>
                      </select>
                    </div>
                    
                    {/* Rich Text Editor Content Area */}
                    <div className="relative">
                      <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleEditorInput}
                        onFocus={(e) => {
                          const placeholder = e.target.parentElement.querySelector('.editor-placeholder');
                          if (placeholder) placeholder.style.display = 'none';
                        }}
                        onBlur={(e) => {
                          const placeholder = e.target.parentElement.querySelector('.editor-placeholder');
                          if (placeholder && !e.target.textContent.trim()) {
                            placeholder.style.display = 'block';
                          }
                        }}
                        className="w-full bg-slate-800 border border-slate-600 rounded-b-lg p-3 text-slate-100 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-10"
                        style={{ 
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word'
                        }}
                        suppressContentEditableWarning={true}
                      />
                      <div className="editor-placeholder absolute top-3 left-3 text-slate-400 italic pointer-events-none z-0">
                        Describe the actions taken, findings, or reasons for status change...
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Upload Report File (Optional)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        onChange={(e) => setReportFile(e.target.files[0])}
                        className="hidden"
                        id="report-file-upload"
                        accept=".pdf,.doc,.docx,.txt"
                      />
                      <label
                        htmlFor="report-file-upload"
                        className="flex items-center gap-2 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-300 hover:bg-slate-700 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        Choose File
                      </label>
                      {reportFile && (
                        <span className="text-slate-300 text-sm">{reportFile.name}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-slate-300 hover:text-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveStatusChange}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Save Status Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Viewing Modal */}
      {showReportsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-lg border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-slate-100">Case Reports - {viewingAnalysisId}</h2>
              <button
                onClick={() => setShowReportsModal(false)}
                className="text-slate-400 hover:text-slate-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {viewingReports.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No reports available for this case.
                </div>
              ) : (
                <div className="space-y-6">
                  {viewingReports.map((report, index) => (
                    <div key={index} className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 text-sm">Report #{index + 1}</span>
                          <span className="text-slate-400 text-sm">
                            {new Date(report.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.previousStatus)}`}>
                            {report.previousStatus}
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.newStatus)}`}>
                            {report.newStatus}
                          </span>
                        </div>
                      </div>
                      
                      <div className="border-t border-slate-600 pt-3">
                        <h4 className="text-slate-300 font-medium mb-2">Report Content:</h4>
                        <div 
                          className="bg-slate-900 rounded p-3 text-slate-100 prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: report.reportText }}
                          style={{
                            fontSize: '14px',
                            lineHeight: '1.5'
                          }}
                        />
                        
                        {report.fileName && (
                          <div className="mt-3 pt-3 border-t border-slate-600">
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                              <FileText className="w-4 h-4" />
                              <span>Attached file: {report.fileName}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default AnalysisTable;