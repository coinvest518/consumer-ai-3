import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
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

  // Normalize line endings and split into lines
  const lines = text.replace(/\r/g, '').split('\n');

  // Extract title (first line like "Analysis of ...")
  const titleLine = lines.find((l) => /Analysis of\s+/i.test(l));
  if (titleLine) sections.title = titleLine.trim();

  // Find heading lines in a tolerant, case-insensitive way and collect content until next heading
  const headingIndices: { name: string; index: number; inlineContent?: string }[] = [];
  const headingRegex = /^(?:[-\s]*)?(HIGHLIGHTED VIOLATIONS|OUTLINED ERRORS|ACTIONABLE ITEMS|EVIDENCE QUOTES|HIGHLIGHTED|OUTLINED|ACTIONABLE|ACTIONS)\b\s*[:\-\s]*(.*)$/i;

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    const m = trimmed.match(headingRegex);
    if (m) {
      const name = (m[1] || '').toUpperCase();
      const inline = (m[2] || '').trim();
      headingIndices.push({ name, index: i, inlineContent: inline.length > 0 ? inline : undefined });
    }
  });

  const getRange = (startIdx: number, endIdx: number, includeInline?: string) => {
    const range = lines.slice(startIdx + 1, endIdx).map((l) => l.trim()).filter((l) => l.length > 0);
    if (includeInline) range.unshift(includeInline);
    return range;
  };

  const findHeading = (heading: string) => {
    const h = headingIndices.find((h) => h.name.includes(heading));
    if (!h) return [] as string[];
    const start = h.index;
    const next = headingIndices.find((hh) => hh.index > start);
    const end = next ? next.index : lines.length;
    return getRange(start, end, h.inlineContent);
  };

  const rawHighlighted = findHeading('HIGHLIGHTED VIOLATIONS');
  sections.highlighted = rawHighlighted.map((l) => l.replace(/^[-•\u2022\u25CF\d+\.\s]*\s*/, ''));

  const rawOutlined = findHeading('OUTLINED ERRORS');
  sections.outlined = rawOutlined.map((l) => l.replace(/^[-•\u2022\u25CF\d+\.\s]*\s*/, ''));

  const rawActions = findHeading('ACTIONABLE ITEMS');
  sections.actions = rawActions.map((l) => l.replace(/^[-•\u2022\u25CF\d+\.\s]*\s*/, ''));

  // Evidence quotes — try to find heading and capture the block
  const evidenceRaw = findHeading('EVIDENCE QUOTES');
  if (evidenceRaw.length > 0) {
    sections.evidence = evidenceRaw;
  } else {
    // fallback: capture any quoted lines in the text
    const quoted = text.split(/\n+/).map((l) => l.trim()).filter((l) => l.startsWith('"') || l.startsWith("'"));
    if (quoted.length > 0) sections.evidence = quoted;
  }

  // If we found no section headings at all, provide a best-effort fallback: treat non-empty paragraphs as actions/highlights
  const hasAny = (sections.highlighted && sections.highlighted.length > 0) || (sections.outlined && sections.outlined.length > 0) || (sections.actions && sections.actions.length > 0) || (sections.evidence && sections.evidence.length > 0);
  if (!hasAny) {
    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
    // Prefer shorter bullet-like paragraphs as highlighted items
    sections.highlighted = paragraphs.filter(p => p.length < 300).slice(0, 6);
    if (paragraphs.length > 0 && !sections.footer) sections.footer = paragraphs.slice(-1)[0];
  }

  // footer (e.g., Analysis saved ...)
  const footerStart = lines.findIndex((l) => l.trim().startsWith('---'));
  if (footerStart >= 0) {
    sections.footer = lines.slice(footerStart + 1).join('\n').trim();
  }

  return sections;
}

export default function ReportAnalysis({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const s = parseAnalysis(content);

  const handlePrint = useReactToPrint({
    contentRef: ref,
    pageStyle: "@page { size: A4; margin: 18mm } @media print { body { -webkit-print-color-adjust: exact; color-adjust: exact } }"
  });

  return (
    <div className="report-analysis border rounded-lg bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold">{s.title || 'Report Analysis'}</h2>
          <p className="text-sm text-gray-500 mt-1">AI-generated analysis — structured view for review and export.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded text-sm"
          >
            <Download className="h-4 w-4" /> Download PDF
          </button>
        </div>
      </div>

      <div ref={ref as any} className="space-y-5">
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
