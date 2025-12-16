import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Download, AlertCircle, CheckCircle, AlertTriangle, Copy, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ReportAnalysis({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  const handlePrint = useReactToPrint({
    contentRef: ref,
    pageStyle: "@page { size: A4; margin: 18mm } @media print { body { -webkit-print-color-adjust: exact; color-adjust: exact } }"
  });

  let parsed: any = null;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    // not JSON
  }

  const getSeverityColor = (severity: string) => {
    switch(severity?.toLowerCase()) {
      case 'high': return 'bg-red-50 border-red-200 text-red-900';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'low': return 'bg-green-50 border-green-200 text-green-900';
      default: return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch(severity?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 border border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 border border-green-300';
      default: return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch(severity?.toLowerCase()) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="report-analysis border rounded-xl bg-gradient-to-br from-white via-gray-50 to-white p-4 sm:p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-blue-600" />
            Credit Report Analysis
          </h2>
          <p className="text-sm text-gray-600 mt-1">Comprehensive review of your credit profile</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigator.clipboard.writeText(content)}
            title="Copy analysis"
            className="hidden sm:inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
          >
            <Copy className="h-4 w-4" /> Copy
          </button>
          <button 
            onClick={handlePrint}
            aria-label="Download report as PDF"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 shadow-md hover:shadow-lg"
          >
            <Download className="h-4 w-4" /> <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>

      <div ref={ref as any} className="space-y-6">
        {parsed ? (
          <>
            {/* Summary */}
            {parsed.summary && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                <h3 className="text-sm font-bold text-blue-900 mb-2 uppercase tracking-wide">Executive Summary</h3>
                <p className="text-sm text-blue-800 leading-relaxed">{parsed.summary}</p>
              </div>
            )}

            {/* Personal Info Issues */}
            {parsed.personalinfoissues && parsed.personalinfoissues.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Personal Information Issues
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {parsed.personalinfoissues.map((item: any, idx: number) => (
                    <div key={idx} className={cn("p-4 rounded-lg border-2 transition-all hover:shadow-md", getSeverityColor(item.severity))}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="font-semibold text-sm capitalize">{item.type?.replace(/([A-Z])/g, ' $1').trim()}</div>
                        <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1", getSeverityBadge(item.severity))}>
                          {getSeverityIcon(item.severity)}
                          {item.severity?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed mb-2">{item.description}</p>
                      {item.evidence && <p className="text-xs italic opacity-70 bg-black bg-opacity-5 p-2 rounded">{item.evidence}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Account Issues */}
            {parsed.accountissues && parsed.accountissues.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  Account Issues ({parsed.accountissues.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {parsed.accountissues.map((acc: any, idx: number) => (
                    <div key={idx} className={cn("p-4 rounded-lg border-2 transition-all hover:shadow-md", getSeverityColor(acc.severity))}>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <div className="font-bold text-sm">{acc.accountname}</div>
                          <div className="text-xs opacity-70">Account #{acc.accountnumber}</div>
                        </div>
                        <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1", getSeverityBadge(acc.severity))}>
                          {getSeverityIcon(acc.severity)}
                          {acc.severity?.toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div><strong>Status:</strong> {acc.status}</div>
                        <div><strong>Issue:</strong> {acc.issuetype}</div>
                        {acc.balance && <div><strong>Balance:</strong> {acc.balance}</div>}
                        {acc.evidence && <div className="mt-2 p-2 bg-black bg-opacity-5 rounded italic">{acc.evidence}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Collection Accounts */}
            {parsed.collectionaccounts && parsed.collectionaccounts.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Collection Accounts</h3>
                <div className="space-y-3">
                  {parsed.collectionaccounts.map((c: any, idx: number) => (
                    <div key={idx} className="p-4 bg-red-50 border-2 border-red-200 rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-bold text-sm">{c.creditorname || 'Not specified'}</div>
                          <div className="text-xs text-gray-600">Agency: {c.collectionagency || 'Not specified'}</div>
                        </div>
                        <span className="text-xs font-bold px-3 py-1.5 bg-red-100 text-red-700 rounded-full border border-red-300">COLLECTION</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div><strong>Original Balance:</strong> {c.originalbalance}</div>
                        <div><strong>Current Balance:</strong> {c.currentbalance}</div>
                        {c.recommendation && <div className="mt-2 p-2 bg-white rounded"><strong>Recommendation:</strong> {c.recommendation}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inquiries */}
            {parsed.inquiries && parsed.inquiries.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Credit Inquiries</h3>
                <div className="space-y-2">
                  {parsed.inquiries.map((inq: any, idx: number) => (
                    <div key={idx} className="p-3 bg-gray-100 rounded-lg text-xs border border-gray-300 hover:bg-gray-150 transition-colors">
                      <div className="font-bold">{inq.creditorname || 'Not specified'}</div>
                      <div className="text-gray-700 mt-1">{inq.date || 'Not specified'} • {inq.purpose || 'Not specified'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FCRA Violations */}
            {parsed.fcraviolations && parsed.fcraviolations.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  FCRA Violations ({parsed.fcraviolations.length})
                </h3>
                <div className="space-y-3">
                  {parsed.fcraviolations.map((v: any, idx: number) => (
                    <div key={idx} className={cn("p-4 rounded-lg border-2 transition-all hover:shadow-md", getSeverityColor(v.severity))}>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <div className="font-bold text-sm capitalize">{v.violationtype?.replace(/([A-Z])/g, ' $1').trim()}</div>
                          <div className="text-xs opacity-70">CRA: {v.craresponsible}</div>
                        </div>
                        <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", getSeverityBadge(v.severity))}>
                          {v.severity?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs mb-2">{v.description}</p>
                      {v.affectedaccounts && <div className="text-xs mb-2"><strong>Affected Accounts:</strong> {v.affectedaccounts.join(', ')}</div>}
                      {v.disputestrategy && <div className="text-xs p-2 bg-white bg-opacity-50 rounded italic"><strong>Strategy:</strong> {v.disputestrategy}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overall Assessment */}
            {parsed.overallassessment && (
              <div className="p-4 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border-2 border-purple-200 rounded-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Overall Assessment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all">
                    <div className="text-xs font-semibold text-gray-600 uppercase">Risk Level</div>
                    <div className="font-bold text-sm text-gray-900 mt-1">{parsed.overallassessment.overallrisklevel}</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all">
                    <div className="text-xs font-semibold text-gray-600 uppercase">Credit Impact</div>
                    <div className="font-bold text-sm text-gray-900 mt-1">{parsed.overallassessment.creditscoreimpact}</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all">
                    <div className="text-xs font-semibold text-gray-600 uppercase">Accounts Affected</div>
                    <div className="font-bold text-sm text-gray-900 mt-1">{parsed.overallassessment.totalaccountsaffected}</div>
                  </div>
                </div>
                {parsed.overallassessment.priorityactions && (
                  <div>
                    <strong className="text-sm">Priority Actions:</strong>
                    <ol className="list-decimal list-inside ml-2 mt-2 space-y-1">
                      {parsed.overallassessment.priorityactions.map((pa: string, i: number) => (
                        <li key={i} className="text-xs text-gray-800">{pa}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* Dispute Letters Needed */}
            {parsed.disputelettersneeded && parsed.disputelettersneeded.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Suggested Dispute Letters</h3>
                <div className="space-y-3">
                  {parsed.disputelettersneeded.map((d: any, idx: number) => (
                    <div key={idx} className="p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:shadow-md transition-all">
                      <div className="font-bold text-sm text-green-900 mb-2">{d.type?.replace(/([A-Z])/g, ' $1').trim()} • Target: {d.target}</div>
                      <div className="space-y-1 text-xs text-green-800">
                        <div><strong>Accounts:</strong> {d.accountsinvolved.join(', ')}</div>
                        <div><strong>Evidence Required:</strong> {d.evidenceneeded.join(', ')}</div>
                        <div><strong>Timeline:</strong> {d.timeline}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-100 p-4 rounded-lg border overflow-auto">{content}</pre>
        )}
      </div>
    </div>
  );
}
