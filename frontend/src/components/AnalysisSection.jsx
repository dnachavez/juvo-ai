import React, { useState, useEffect, useCallback } from "react";
import AnalysisTable from "./AnalysisTable";
import { Search, Filter, Download, AlertTriangle, RefreshCw } from "lucide-react";
import { fetchAnalyzedData } from "../utils/analyzedDataApi";

const AnalysisSection = React.memo(function AnalysisSection({ analysisData: propAnalysisData = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [analysisData, setAnalysisData] = useState(propAnalysisData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [dataCache, setDataCache] = useState(new Map()); // Cache for displayed data
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load data from API with caching to prevent duplicate rows during polling
  const loadAnalyzedData = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
      setDataCache(new Map()); // Clear cache on refresh
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAnalyzedData();
      
      if (forceRefresh) {
        // Complete refresh - replace all data
        setAnalysisData(data || []);
        setDataCache(new Map(data?.map(item => [item.analysis_id, item]) || []));
      } else {
        // Incremental update - merge with cache to preserve displayed data
        const newCache = new Map(dataCache);
        const newItems = [];
        
        (data || []).forEach(item => {
          if (!newCache.has(item.analysis_id)) {
            newCache.set(item.analysis_id, item);
            newItems.push(item);
          }
        });
        
        if (newItems.length > 0) {
          setAnalysisData(Array.from(newCache.values()));
          setDataCache(newCache);
          console.log(`Added ${newItems.length} new analysis items`);
        }
      }
      
      setLastFetch(new Date());
    } catch (error) {
      console.error('Error loading analyzed data:', error);
      setError('Failed to load analyzed data. Make sure the API server is running.');
      // Fall back to prop data if API fails
      if (analysisData.length === 0) {
        setAnalysisData(propAnalysisData);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [dataCache]);

  // Load data on component mount and set up polling
  useEffect(() => {
    // If no prop data provided, try to load from API
    if (propAnalysisData.length === 0) {
      loadAnalyzedData();
      
      // Set up polling every 30 seconds for new data (incremental)
      const pollInterval = setInterval(() => {
        loadAnalyzedData(false); // Incremental load
      }, 30000);
      
      return () => clearInterval(pollInterval);
    } else {
      setAnalysisData(propAnalysisData);
      setDataCache(new Map(propAnalysisData.map(item => [item.analysis_id, item])));
    }
  }, [propAnalysisData, loadAnalyzedData]);

  // Manual refresh function for user-triggered full refresh
  const handleRefresh = () => {
    loadAnalyzedData(true); // Force full refresh
  };

  const exportToCSV = () => {
    if (!filteredData || filteredData.length === 0) {
      alert("No data to export");
      return;
    }

    // Define headers for CSV
    const headers = [
      "Analysis ID",
      "Platform",
      "Collection Method",
      "Scrape Session ID",
      "Post ID",
      "Permalink",
      "Scraped At",
      "Published At",
      "Full Text",
      "Poster Name",
      "Poster ID",
      "Poster URL",
      "Language",
      "Location",
      "Keywords Matched",
      "Grooming Score",
      "Trafficking Score",
      "CSAM Score",
      "Harassment Score",
      "Risk Level",
      "Flagged",
      "Flag Reason",
      "Explanation",
      "Recommended Action",
      "Priority Score",
      "Status",
      "Number of Reports",
      "RA11930 Compliant",
      "Privacy Exemption",
      "Gemini Model",
      "Processing Time (ms)",
      "Signature"
    ];

    // Helper function to escape CSV values
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Helper function to format arrays
    const formatArray = (arr) => {
      if (!arr || !Array.isArray(arr)) return "";
      return arr.join("; ");
    };

    // Get case statuses and reports from localStorage
    const caseStatuses = JSON.parse(localStorage.getItem('caseStatuses') || '{}');
    const caseReports = JSON.parse(localStorage.getItem('caseReports') || '{}');

    // Convert data to CSV rows
    const csvRows = filteredData.map(item => [
      escapeCSV(item.analysis_id),
      escapeCSV(item.source?.platform),
      escapeCSV(item.source?.collection_method),
      escapeCSV(item.source?.scrape_session_id),
      escapeCSV(item.post?.id),
      escapeCSV(item.post?.permalink),
      escapeCSV(item.post?.scraped_at),
      escapeCSV(item.post?.published_at),
      escapeCSV(item.post?.full_text),
      escapeCSV(item.actors?.poster?.name),
      escapeCSV(item.actors?.poster?.profile_id),
      escapeCSV(item.actors?.poster?.profile_url),
      escapeCSV(item.language_detected),
      escapeCSV(item.location_detected),
      escapeCSV(formatArray(item.keywords_matched)),
      escapeCSV(item.risk_scores?.grooming ? (item.risk_scores.grooming * 100).toFixed(1) + '%' : ''),
      escapeCSV(item.risk_scores?.trafficking ? (item.risk_scores.trafficking * 100).toFixed(1) + '%' : ''),
      escapeCSV(item.risk_scores?.csam ? (item.risk_scores.csam * 100).toFixed(1) + '%' : ''),
      escapeCSV(item.risk_scores?.harassment ? (item.risk_scores.harassment * 100).toFixed(1) + '%' : ''),
      escapeCSV(item.risk_level),
      escapeCSV(item.flagged ? "Yes" : "No"),
      escapeCSV(formatArray(item.flag_reason)),
      escapeCSV(item.explanation),
      escapeCSV(item.recommended_action),
      escapeCSV(item.priority_score ? `${item.priority_score}%` : ''),
      escapeCSV(caseStatuses[item.analysis_id] || "New"),
      escapeCSV((caseReports[item.analysis_id] || []).length),
      escapeCSV(item.compliance?.ra11930 === true ? "Yes" : item.compliance?.ra11930 === false ? "No" : ""),
      escapeCSV(item.compliance?.data_privacy_exemption === true ? "Yes" : item.compliance?.data_privacy_exemption === false ? "No" : ""),
      escapeCSV(item.ai_version?.gemini_model),
      escapeCSV(item.processing_ms),
      escapeCSV(item.signature)
    ]);

    // Combine headers and rows
    const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `analysis-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const filteredData = analysisData.filter((item) => {
    // Handle missing data gracefully
    const postText = item.post?.full_text || '';
    const posterName = item.actors?.poster?.name || '';
    const keywords = item.keywords_matched || [];
    
    const matchesSearch = 
      postText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      posterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      keywords.some(keyword => 
        keyword.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesRisk = riskFilter === "all" || item.risk_level === riskFilter;
    const matchesPlatform = platformFilter === "all" || item.source?.platform === platformFilter;
    
    return matchesSearch && matchesRisk && matchesPlatform;
  });

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, riskFilter, platformFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const riskCounts = {
    critical: analysisData.filter(item => item.risk_level === "critical").length,
    high: analysisData.filter(item => item.risk_level === "high").length,
    medium: analysisData.filter(item => item.risk_level === "medium").length,
    low: analysisData.filter(item => item.risk_level === "low").length,
    flagged: analysisData.filter(item => item.flagged).length
  };

  return (
    <section
      id="analysis"
      className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 shadow-xl"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-100 mb-3">
          Analysis Results
        </h2>
        <p className="text-slate-400 text-lg">
          Real-time monitoring and risk assessment of social media content
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 text-center">
          <div className="text-2xl font-bold text-slate-100">{analysisData.length}</div>
          <div className="text-slate-400 text-sm">Total Analyses</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 text-center">
          <div className="text-2xl font-bold text-red-500">{riskCounts.critical}</div>
          <div className="text-slate-400 text-sm">Critical Risk</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">{riskCounts.high}</div>
          <div className="text-slate-400 text-sm">High Risk</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{riskCounts.medium}</div>
          <div className="text-slate-400 text-sm">Medium Risk</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{riskCounts.low}</div>
          <div className="text-slate-400 text-sm">Low Risk</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-800/30 rounded-lg border border-slate-700 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search content, poster name, or keywords..."
                className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-slate-100 placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-100"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="all">All Risk Levels</option>
              <option value="critical">Critical Risk</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
            <select
              className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-100"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
            >
              <option value="all">All Platforms</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter</option>
            </select>
            <select
              className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-100"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-600">
          <div className="text-slate-400 text-sm">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length} results
            {lastFetch && (
              <div className="text-xs mt-1">
                Last updated: {lastFetch.toLocaleTimeString()}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="hidden flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${(loading || isRefreshing) ? 'animate-spin' : ''}`} />
              {(loading || isRefreshing) ? 'Refreshing...' : 'Refresh'}
            </button>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t border-slate-600">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm bg-slate-800 border border-slate-600 rounded-lg text-slate-100 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm bg-slate-800 border border-slate-600 rounded-lg text-slate-100 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`px-3 py-2 text-sm border rounded-lg ${
                      currentPage === pageNumber
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm bg-slate-800 border border-slate-600 rounded-lg text-slate-100 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm bg-slate-800 border border-slate-600 rounded-lg text-slate-100 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Last
            </button>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <div className="text-red-400 font-medium">Data Loading Error</div>
              <div className="text-red-300 text-sm">{error}</div>
            </div>
            <button 
              onClick={loadAnalyzedData}
              className="ml-auto bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Alert for critical and high-risk items */}
      {filteredData.some(item => (item.risk_level === "critical" || item.risk_level === "high") && item.flagged) && (
        <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <div className="text-red-400 font-medium">Critical/High-Risk Content Detected</div>
              <div className="text-red-300 text-sm">
                {filteredData.filter(item => (item.risk_level === "critical" || item.risk_level === "high") && item.flagged).length} items require immediate attention
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Table */}
      <AnalysisTable analysisData={paginatedData} />
    </section>
  );
});

export default AnalysisSection;