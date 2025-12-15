import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Download } from 'lucide-react';

export default function ReportAnalysis({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  const handlePrint = useReactToPrint({
    contentRef: ref,
    pageStyle: "@page { size: A4; margin: 18mm } @media print { body { -webkit-print-color-adjust: exact; color-adjust: exact } }"
  });

  return (
    <div className="report-analysis border rounded-lg bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold">Report Analysis</h2>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded text-sm"
        >
          <Download className="h-4 w-4" /> Download PDF
        </button>
      </div>

      <div ref={ref as any} className="prose prose-sm max-w-none">
        <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 p-4 rounded border">{content}</pre>
      </div>
    </div>
  );
}
