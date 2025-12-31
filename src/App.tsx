import { useState } from "react";
import { FileText, History } from "lucide-react";
import CreateInvoice from "./components/CreateInvoice";
import InvoiceHistory from "./components/InvoiceHistory";

type Screen = "home" | "create" | "history";

function App() {
  const [screen, setScreen] = useState<Screen>("home");

  if (screen === "create") {
    return <CreateInvoice onBack={() => setScreen("home")} />;
  }

  if (screen === "history") {
    return <InvoiceHistory onBack={() => setScreen("home")} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900">POS Invoice System</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pt-8">
        <div className="grid gap-4 md:grid-cols-2">
          <button
            onClick={() => setScreen("create")}
            className="bg-white border border-gray-200 rounded-lg p-8 hover:border-gray-900 transition-colors"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <FileText size={32} className="text-gray-900" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">Create Invoice</h2>
                <p className="text-sm text-gray-600 mt-1">Generate new invoice</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setScreen("history")}
            className="bg-white border border-gray-200 rounded-lg p-8 hover:border-gray-900 transition-colors"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <History size={32} className="text-gray-900" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">Invoice History</h2>
                <p className="text-sm text-gray-600 mt-1">View past invoices</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
