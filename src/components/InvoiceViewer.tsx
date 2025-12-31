import { ArrowLeft, Download } from "lucide-react";

interface InvoiceViewerProps {
  pdfUrl: string;
  onBack: () => void;
}

export default function InvoiceViewer({ pdfUrl, onBack }: InvoiceViewerProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 border rounded text-gray-700"
        >
          <ArrowLeft size={18} />
        </button>

        <h1 className="text-lg font-semibold">Invoice Preview</h1>

        <div className="ml-auto">
          <a
            href={pdfUrl}
            download
            className="flex items-center gap-2 px-3 py-2 border rounded text-sm"
          >
            <Download size={16} />
            Download
          </a>
        </div>
      </div>

      {/* PDF VIEWER */}
      <iframe
        src={pdfUrl}
        title="Invoice PDF"
        className="flex-1 w-full"
      />
    </div>
  );
}
