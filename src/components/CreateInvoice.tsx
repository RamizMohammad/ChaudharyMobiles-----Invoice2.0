import { useState } from "react";
import type { InvoiceItem, InvoicePayload, PaymentMode } from "../types";

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

  /* ---------------- LOGIC ---------------- */

  const validateForm = (): boolean => {
    if (!customerName.trim()) return setError("Customer Name required"), false;
    if (!customerAddress.trim()) return setError("Customer Address required"), false;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.quantity <= 0) return setError("Invalid quantity"), false;
      if (item.price <= 0) return setError("Invalid price"), false;

      if (item.category === "Phone") {
        if (!item.imei_1?.trim()) return setError("IMEI required"), false;
        if (item.charger_included && !item.charger_name?.trim())
          return setError("Charger name required"), false;
      }

      if (item.category === "Charger" && !item.charger_name?.trim())
        return setError("Charger name required"), false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setError("");
    if (!validateForm()) return;

    const payload: InvoicePayload = {
      customer_name: customerName,
      customer_address: customerAddress,
      payment_mode: paymentMode,
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

      if (!res.ok) throw new Error("Invoice generation failed");

      const data = await res.json();

      if (data.pdf_url) {
        window.location.href = data.pdf_url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invoice failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b px-4 py-4 sticky top-0">
        <div className="max-w-4xl mx-auto flex justify-between">
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

        <div className="bg-white border rounded p-4 space-y-4">
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

        <div className="bg-white border rounded p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Items</h2>
            <button
              onClick={() =>
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
                ])
              }
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
            >
              Add Item
            </button>
          </div>

          {items.map((item, idx) => (
            <div key={idx} className="border rounded p-3 space-y-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <select
                  value={item.category}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].category = e.target.value as "Phone" | "Charger";
                    setItems(newItems);
                  }}
                  className="border px-3 py-2 rounded"
                >
                  <option>Phone</option>
                  <option>Charger</option>
                </select>
                {items.length > 1 && (
                  <button
                    onClick={() => setItems(items.filter((_, i) => i !== idx))}
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                placeholder="Item Name"
                value={item.item_name}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[idx].item_name = e.target.value;
                  setItems(newItems);
                }}
                className="w-full border px-3 py-2 rounded text-sm"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].quantity = parseInt(e.target.value) || 0;
                    setItems(newItems);
                  }}
                  className="border px-3 py-2 rounded text-sm"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].price = parseFloat(e.target.value) || 0;
                    setItems(newItems);
                  }}
                  className="border px-3 py-2 rounded text-sm"
                />
              </div>

              {item.category === "Phone" && (
                <div className="space-y-2 bg-blue-50 p-2 rounded">
                  <input
                    placeholder="IMEI 1"
                    value={item.imei_1}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[idx].imei_1 = e.target.value;
                      setItems(newItems);
                    }}
                    className="w-full border px-3 py-2 rounded text-sm"
                  />
                  <input
                    placeholder="IMEI 2 (optional)"
                    value={item.imei_2}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[idx].imei_2 = e.target.value;
                      setItems(newItems);
                    }}
                    className="w-full border px-3 py-2 rounded text-sm"
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.charger_included}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[idx].charger_included = e.target.checked;
                        setItems(newItems);
                      }}
                    />
                    <span className="text-sm">Charger Included</span>
                  </label>
                  {item.charger_included && (
                    <div className="space-y-2">
                      <input
                        placeholder="Charger Name"
                        value={item.charger_name}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].charger_name = e.target.value;
                          setItems(newItems);
                        }}
                        className="w-full border px-3 py-2 rounded text-sm"
                      />
                      <input
                        placeholder="Charger Serial Number (optional)"
                        value={item.charger_serial_number}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].charger_serial_number = e.target.value;
                          setItems(newItems);
                        }}
                        className="w-full border px-3 py-2 rounded text-sm"
                      />
                    </div>
                  )}
                </div>
              )}

              {item.category === "Charger" && (
                <div className="space-y-2 bg-green-50 p-2 rounded">
                  <input
                    placeholder="Charger Name"
                    value={item.charger_name}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[idx].charger_name = e.target.value;
                      setItems(newItems);
                    }}
                    className="w-full border px-3 py-2 rounded text-sm"
                  />
                  <input
                    placeholder="Serial Number (optional)"
                    value={item.charger_serial_number}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[idx].charger_serial_number = e.target.value;
                      setItems(newItems);
                    }}
                    className="w-full border px-3 py-2 rounded text-sm"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white border rounded p-4">
          <label className="block text-sm font-semibold mb-3">Payment Mode</label>
          <div className="space-y-2">
            {(["Cash", "Online", "Cheque"] as PaymentMode[]).map((mode) => (
              <label key={mode} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMode === mode}
                  onChange={() => setPaymentMode(mode)}
                />
                <span>{mode}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-gray-900 text-white rounded text-lg"
        >
          {loading ? "Generating..." : "Generate Invoice"}
        </button>
      </div>
    </div>
  );
}
