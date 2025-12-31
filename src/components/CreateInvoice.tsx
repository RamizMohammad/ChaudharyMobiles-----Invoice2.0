import { useState } from "react";
import type { Category, InvoiceItem, InvoicePayload, PaymentMode } from "../types";

interface CreateInvoiceProps {
  onBack: () => void;
}

export default function CreateInvoice({ onBack }: CreateInvoiceProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("Cash");
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      category: "Phone",
      item_name: "",
      quantity: 1,
      price: 0,
      imei_1: "",
      imei_2: "",
      charger_included: false,
      charger_name: "",
      charger_serial_number: "",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ PWA / iOS SAFE PDF OPEN
  const openPdfSafely = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_self";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        category: "Phone",
        item_name: "",
        quantity: 1,
        price: 0,
        imei_1: "",
        imei_2: "",
        charger_included: false,
        charger_name: "",
        charger_serial_number: "",
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number | boolean
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "category") {
      const category = value as Category;
      if (category === "Charger") {
        delete newItems[index].imei_1;
        delete newItems[index].imei_2;
        delete newItems[index].charger_included;
      } else {
        delete newItems[index].charger_name;
        delete newItems[index].charger_serial_number;
      }
    }

    if (field === "charger_included" && !value) {
      delete newItems[index].charger_name;
      delete newItems[index].charger_serial_number;
    }

    setItems(newItems);
  };

  const validateForm = (): boolean => {
    if (!customerName.trim()) {
      setError("Customer Name is required");
      return false;
    }
    if (!customerAddress.trim()) {
      setError("Customer Address is required");
      return false;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.category === "Phone" && !item.item_name.trim()) {
        setError(`Item ${i + 1}: Item Name is required`);
        return false;
      }

      if (item.quantity <= 0) {
        setError(`Item ${i + 1}: Quantity must be greater than 0`);
        return false;
      }

      if (item.price <= 0) {
        setError(`Item ${i + 1}: Base Price must be greater than 0`);
        return false;
      }

      if (item.category === "Phone") {
        if (!item.imei_1?.trim()) {
          setError(`Item ${i + 1}: IMEI 1 is required`);
          return false;
        }
        if (item.charger_included && !item.charger_name?.trim()) {
          setError(`Item ${i + 1}: Charger Name is required`);
          return false;
        }
      }

      if (item.category === "Charger" && !item.charger_name?.trim()) {
        setError(`Item ${i + 1}: Charger Name is required`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    if (!validateForm()) return;

    const payload: InvoicePayload = {
      customer_name: customerName,
      customer_address: customerAddress,
      items: items.map((item) => {
        const cleaned: InvoiceItem = {
          category: item.category,
          item_name: item.item_name,
          quantity: item.quantity,
          price: item.price,
        };

        if (item.category === "Phone") {
          cleaned.imei_1 = item.imei_1;
          if (item.imei_2) cleaned.imei_2 = item.imei_2;
          cleaned.charger_included = item.charger_included;
          if (item.charger_included) {
            cleaned.charger_name = item.charger_name;
            if (item.charger_serial_number)
              cleaned.charger_serial_number = item.charger_serial_number;
          }
        }

        if (item.category === "Charger") {
          cleaned.charger_name = item.charger_name;
          if (item.charger_serial_number)
            cleaned.charger_serial_number = item.charger_serial_number;
        }

        return cleaned;
      }),
      payment_mode: paymentMode,
    };

    setLoading(true);

    try {
      const res = await fetch(
        "https://chaudharymobilesshopserver.onrender.com/invoice",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to generate invoice");

      const data = await res.json();

      if (data.pdf_url) {
        // ✅ MUST HAPPEN BEFORE STATE RESET
        openPdfSafely(data.pdf_url);

        // Reset form AFTER navigation
        setCustomerName("");
        setCustomerAddress("");
        setPaymentMode("Cash");
        setItems([
          {
            category: "Phone",
            item_name: "",
            quantity: 1,
            price: 0,
            imei_1: "",
            imei_2: "",
            charger_included: false,
            charger_name: "",
            charger_serial_number: "",
          },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invoice failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="flex justify-between max-w-4xl mx-auto">
          <button onClick={onBack} className="border px-4 py-2 rounded">
            Back
          </button>
          <h1 className="text-xl font-semibold">Create Invoice</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* CUSTOMER */}
        <div className="bg-white border rounded p-4 space-y-4">
          <h2 className="font-semibold">Customer Details</h2>
          <input
            className="w-full border px-4 py-3 rounded"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <textarea
            className="w-full border px-4 py-3 rounded"
            placeholder="Customer Address"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
          />
        </div>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-gray-900 text-white rounded text-lg disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Invoice"}
        </button>
      </div>
    </div>
  );
}
