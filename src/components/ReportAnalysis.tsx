import React, { useRef } from 'react';
import ReactToPrint from 'react-to-print';
const ReactToPrintAny: any = ReactToPrint;
import { CheckCircle, AlertTriangle, FileText, Quote, Download } from 'lucide-react';

type Sections = {
  title?: string;
  highlighted?: string[];
  outlined?: string[];
  actions?: string[];
  evidence?: string[];
  footer?: string;
};

function parseAnalysis(text: string): Sections {
  const sections: Sections = {};

  // Extract title (first line like "Analysis of ...")
  const titleMatch = text.match(/^\s*(Analysis of[^\n]+)/i);
  if (titleMatch) sections.title = titleMatch[1].trim();

  const getSection = (name: string) => {
    const rx = new RegExp(`${name}([\s\S]*?)(?=\n[A-Z]{4,}|$)`, 'm');
    const m = text.match(rx);
    if (!m) return [];
    // split by lines that look like bullets or inline markers
    return m[1]
      .split(/\n+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .map((l) => l.replace(/^[-•\u2022\u25CF\d+\.\s]*\s*/, ''));
  };

  sections.highlighted = getSection('HIGHLIGHTED VIOLATIONS');
  sections.outlined = getSection('OUTLINED ERRORS');
  sections.actions = getSection('ACTIONABLE ITEMS');
  // Evidence quotes: look for the heading and then capture the subsequent quoted lines
  const evidenceRx = /EVIDENCE QUOTES([\s\S]*)/m;
  const ev = text.match(evidenceRx);
  if (ev) {
    // split by lines starting with quotes
    const parts = ev[1]
      .split(/\n{1,}/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    sections.evidence = parts;
  }

  // footer (e.g., Analysis saved ...)
  const footerMatch = text.match(/---([\s\S]*?)$/m);
  if (footerMatch) sections.footer = footerMatch[1].trim();

  return sections;
}

export default function ReportAnalysis({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const s = parseAnalysis(content);

  return (
    <div className="report-analysis border rounded-lg bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold">{s.title || 'Report Analysis'}</h2>
          <p className="text-sm text-gray-500 mt-1">AI-generated analysis — structured view for review and export.</p>
        </div>
        <div className="flex items-center gap-2">
          <ReactToPrintAny
            trigger={() => (
              <button className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded text-sm">
                <Download className="h-4 w-4" /> Download PDF
              </button>
            )}
            content={() => ref.current}
            pageStyle={"@page { size: A4; margin: 18mm } @media print { body { -webkit-print-color-adjust: exact; color-adjust: exact } }"}
          />
        </div>
      </div>

      <div ref={ref} className="space-y-5">
        {s.highlighted && s.highlighted.length > 0 && (
          <section className="report-section">
            <h3 className="flex items-center gap-2 text-md font-semibold text-red-700"><AlertTriangle className="h-4 w-4" /> Highlighted Violations</h3>
            <ul className="mt-2 space-y-2">
              {s.highlighted.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-red-600 mt-0.5">•</span>
                  <div className="text-sm text-gray-800">{item}</div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {s.outlined && s.outlined.length > 0 && (
          <section className="report-section">
            <h3 className="flex items-center gap-2 text-md font-semibold text-yellow-700"><FileText className="h-4 w-4" /> Outlined Errors</h3>
            <ol className="mt-2 list-decimal list-inside space-y-2 text-sm text-gray-800">
              {s.outlined.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          </section>
        )}

        {s.actions && s.actions.length > 0 && (
          <section className="report-section">
            <h3 className="flex items-center gap-2 text-md font-semibold text-green-700"><CheckCircle className="h-4 w-4" /> Actionable Items</h3>
            <ul className="mt-2 space-y-2">
              {s.actions.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="text-green-600">✔</span>
                  <div className="text-sm text-gray-800">{item}</div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {s.evidence && s.evidence.length > 0 && (
          <section className="report-section">
            <h3 className="flex items-center gap-2 text-md font-semibold text-gray-800"><Quote className="h-4 w-4" /> Evidence Quotes</h3>
            <div className="mt-2 grid gap-2">
              {s.evidence.map((line, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded text-sm text-gray-800 border">
                  <pre className="whitespace-pre-wrap m-0">{line}</pre>
                </div>
              ))}
            </div>
          </section>
        )}

        {s.footer && (
          <div className="text-xs text-gray-500">{s.footer}</div>
        )}
      </div>
    </div>
  );
}
