import React, { useState } from "react";
import AnalysisTable from "./AnalysisTable";
import { Search, Filter, Download, AlertTriangle } from "lucide-react";

export default function AnalysisSection({ analysisData = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");

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
    const matchesSearch = 
      item.post.full_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.actors.poster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keywords_matched.some(keyword => 
        keyword.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesRisk = riskFilter === "all" || item.risk_level === riskFilter;
    const matchesPlatform = platformFilter === "all" || item.source.platform === platformFilter;
    
    return matchesSearch && matchesRisk && matchesPlatform;
  });

  const riskCounts = {
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 text-center">
          <div className="text-2xl font-bold text-slate-100">{analysisData.length}</div>
          <div className="text-slate-400 text-sm">Total Analyses</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{riskCounts.high}</div>
          <div className="text-slate-400 text-sm">High Risk</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{riskCounts.medium}</div>
          <div className="text-slate-400 text-sm">Medium Risk</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">{riskCounts.flagged}</div>
          <div className="text-slate-400 text-sm">Flagged</div>
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
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-600">
          <div className="text-slate-400 text-sm">
            Showing {filteredData.length} of {analysisData.length} results
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Alert for high-risk items */}
      {filteredData.some(item => item.risk_level === "high" && item.flagged) && (
        <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <div className="text-red-400 font-medium">High-Risk Content Detected</div>
              <div className="text-red-300 text-sm">
                {filteredData.filter(item => item.risk_level === "high" && item.flagged).length} items require immediate attention
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Table */}
      <AnalysisTable analysisData={filteredData} />
    </section>
  );
}