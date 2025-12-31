import { ExternalLink, Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { InvoiceHistoryItem } from "../types";

interface InvoiceHistoryProps {
  onBack: () => void;
}

export default function InvoiceHistory({ onBack }: InvoiceHistoryProps) {
  const [invoices, setInvoices] = useState<InvoiceHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // -------------------------------
  // FETCH ALL INVOICES
  // -------------------------------
  const fetchInvoices = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://chaudharymobilesshopserver.onrender.com/invoices");

      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }

      const data = await response.json();

      // Backend returns ARRAY directly
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // SEARCH INVOICES
  // -------------------------------
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchInvoices();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://chaudharymobilesshopserver.onrender.com/invoices/search?q=${encodeURIComponent(
          searchQuery
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to search invoices");
      }

      const data = await response.json();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const openPDF = (url: string) => {
    window.open(url, "_blank");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // -------------------------------
  // RENDER
  // -------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button
            onClick={onBack}
            className="text-gray-600 text-sm font-medium px-4 py-2 border border-gray-300 rounded"
          >
            Back
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            Invoice History
          </h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-4">
        {/* SEARCH */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by invoice number or customer name"
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded text-base"
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-gray-900 text-white rounded font-medium"
          >
            Search
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="text-center py-12 text-gray-600">Loading...</div>
        )}

        {/* EMPTY */}
        {!loading && invoices.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            No invoices found
          </div>
        )}

        {/* DESKTOP TABLE */}
        {!loading && invoices.length > 0 && (
          <>
            <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Invoice No
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-4 py-3 text-sm">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {invoice.customer_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {invoice.payment_mode}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openPDF(invoice.pdf_url)}
                          className="inline-flex items-center gap-2 text-sm font-medium"
                        >
                          View
                          <ExternalLink size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="text-sm font-semibold">
                        {invoice.invoice_number}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(invoice.date)}
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {invoice.payment_mode}
                    </span>
                  </div>

                  <div className="text-sm">{invoice.customer_name}</div>

                  <button
                    onClick={() => openPDF(invoice.pdf_url)}
                    className="w-full flex items-center justify-center gap-2 py-2 border rounded text-sm font-medium"
                  >
                    View Invoice
                    <ExternalLink size={16} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
