import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Download } from 'lucide-react';

export default function ReportAnalysis({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  const handlePrint = useReactToPrint({
    contentRef: ref,
    pageStyle: "@page { size: A4; margin: 18mm } @media print { body { -webkit-print-color-adjust: exact; color-adjust: exact } }"
  });

  // Try to parse JSON to render structured UI. Fall back to raw preformatted text if parsing fails.
  let parsed: any = null;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    // not JSON - leave parsed null
  }

  return (
    <div className="report-analysis border rounded-lg bg-white p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start items-center justify-between mb-3 gap-2">
        <div className="w-full sm:w-auto">
          <h2 className="text-lg font-semibold">Report Analysis</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigator.clipboard.writeText(content)}
            title="Copy raw analysis"
            className="hidden sm:inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
          >
            Copy
          </button>
          <button 
            onClick={handlePrint}
            aria-label="Download report as PDF"
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded text-sm self-start sm:self-auto"
          >
            <Download className="h-4 w-4" /> <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>

      <div ref={ref as any} className="prose prose-sm max-w-none relative z-0">
        {parsed ? (
          <div className="space-y-4">
            {/* Summary */}
            {parsed.summary && (
              <div className="p-3 bg-gray-50 rounded-lg border">
                <h3 className="text-sm font-semibold mb-2">Summary</h3>
                <p className="text-sm text-gray-800">{parsed.summary}</p>
              </div>
            )}

            {/* Personal Info Issues */}
            {parsed.personalinfoissues && parsed.personalinfoissues.length > 0 && (
              <div className="space-y-2">
                <h4 className="section-title">Personal Information Issues</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {parsed.personalinfoissues.map((item: any, idx: number) => (
                    <div key={idx} className="issue-card">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold">{item.type}</div>
                          <div className="text-xs text-gray-600 mt-1">{item.description}</div>
                        </div>
                        <div className={`badge ${item.severity || 'low'}`}>{(item.severity || 'low').toUpperCase()}</div>
                      </div>
                      {item.evidence && <div className="mt-2 text-xs text-gray-700">{item.evidence}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Account Issues */}
            {parsed.accountissues && parsed.accountissues.length > 0 && (
              <div className="space-y-2">
                <h4 className="section-title">Account Issues</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {parsed.accountissues.map((acc: any, idx: number) => (
                    <div key={idx} className="issue-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold">{acc.accountname}</div>
                          <div className="text-xs text-gray-600">Acct#: {acc.accountnumber}</div>
                        </div>
                        <div className={`badge ${acc.severity || 'low'}`}>{(acc.severity || 'low').toUpperCase()}</div>
                      </div>
                      <div className="mt-2 text-xs text-gray-700">
                        <div><strong>Status:</strong> {acc.status}</div>
                        <div><strong>Issue:</strong> {acc.issuetype}</div>
                        {acc.balance && <div><strong>Balance:</strong> {acc.balance}</div>}
                        {acc.evidence && <div className="mt-1 text-xs text-gray-700"><strong>Evidence:</strong> {acc.evidence}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Collection Accounts */}
            {parsed.collectionaccounts && parsed.collectionaccounts.length > 0 && (
              <div>
                <h4 className="section-title">Collection Accounts</h4>
                <div className="space-y-2">
                  {parsed.collectionaccounts.map((c: any, idx: number) => (
                    <div key={idx} className="issue-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold">{c.creditorname || 'Not specified'}</div>
                          <div className="text-xs text-gray-600">Agency: {c.collectionagency || 'Not specified'}</div>
                        </div>
                        <div className="badge low">COLLECTION</div>
                      </div>
                      <div className="mt-2 text-xs text-gray-700">
                        <div><strong>Orig Bal:</strong> {c.originalbalance}</div>
                        <div><strong>Current Bal:</strong> {c.currentbalance}</div>
                        {c.recommendation && <div className="mt-1"><strong>Recommendation:</strong> {c.recommendation}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inquiries */}
            {parsed.inquiries && parsed.inquiries.length > 0 && (
              <div>
                <h4 className="section-title">Inquiries</h4>
                <div className="space-y-2 text-sm">
                  {parsed.inquiries.map((inq: any, idx: number) => (
                    <div key={idx} className="p-2 bg-gray-50 rounded text-xs border">{inq.creditorname} • {inq.date} • {inq.purpose}</div>
                  ))}
                </div>
              </div>
            )}

            {/* FCRA Violations */}
            {parsed.fcraviolations && parsed.fcraviolations.length > 0 && (
              <div>
                <h4 className="section-title">FCRA Violations</h4>
                <div className="space-y-2">
                  {parsed.fcraviolations.map((v: any, idx: number) => (
                    <div key={idx} className="issue-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold">{v.violationtype}</div>
                          <div className="text-xs text-gray-600">CRA Responsible: {v.craresponsible}</div>
                        </div>
                        <div className={`badge ${v.severity || 'low'}`}>{(v.severity || 'low').toUpperCase()}</div>
                      </div>
                      <div className="mt-2 text-xs text-gray-700">
                        <div>{v.description}</div>
                        {v.affectedaccounts && <div className="mt-2"><strong>Affected:</strong> {v.affectedaccounts.join(', ')}</div>}
                        {v.disputestrategy && <div className="mt-1 text-xs text-gray-700"><strong>Strategy:</strong> {v.disputestrategy}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overall assessment */}
            {parsed.overallassessment && (
              <div>
                <h4 className="section-title">Overall Assessment</h4>
                <div className="p-3 bg-gray-50 rounded border">
                  <div className="text-sm text-gray-800"><strong>Risk:</strong> {parsed.overallassessment.overallrisklevel}</div>
                  <div className="text-sm text-gray-800"><strong>Impact:</strong> {parsed.overallassessment.creditscoreimpact}</div>
                  <div className="mt-2">
                    <strong>Priority Actions:</strong>
                    <ol className="list-decimal list-inside ml-4 text-sm">
                      {parsed.overallassessment.priorityactions.map((pa: string, i: number) => (
                        <li key={i} className="text-sm text-gray-800">{pa}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* Dispute letters needed */}
            {parsed.disputelettersneeded && parsed.disputelettersneeded.length > 0 && (
              <div>
                <h4 className="section-title">Suggested Dispute Letters</h4>
                <div className="space-y-2">
                  {parsed.disputelettersneeded.map((d: any, idx: number) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded border">
                      <div className="text-sm font-semibold">{d.type} • Target: {d.target}</div>
                      <div className="text-xs text-gray-700 mt-1"><strong>Accounts:</strong> {d.accountsinvolved.join(', ')}</div>
                      <div className="text-xs text-gray-700 mt-1"><strong>Evidence Required:</strong> {d.evidenceneeded.join(', ')}</div>
                      <div className="text-xs text-gray-700 mt-1"><strong>Timeline:</strong> {d.timeline}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 p-4 rounded border overflow-auto">{content}</pre>
        )}
      </div>
    </div>
  );
}
