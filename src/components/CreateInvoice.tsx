import { Plus, Trash2 } from "lucide-react";
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

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number | boolean) => {
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
          setError(`Item ${i + 1}: IMEI 1 is required for Phone`);
          return false;
        }

        if (item.charger_included) {
          if (!item.charger_name?.trim()) {
            setError(`Item ${i + 1}: Charger Name is required when charger is included`);
            return false;
          }
        }
      }

      if (item.category === "Charger") {
        if (!item.charger_name?.trim()) {
          setError(`Item ${i + 1}: Charger Name is required`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    setError("");

    if (!validateForm()) {
      return;
    }

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
          if (item.imei_1?.trim()) cleaned.imei_1 = item.imei_1;
          if (item.imei_2?.trim()) cleaned.imei_2 = item.imei_2;

          cleaned.charger_included = item.charger_included;
          if (item.charger_included) {
            if (item.charger_name?.trim()) cleaned.charger_name = item.charger_name;
            if (item.charger_serial_number?.trim())
              cleaned.charger_serial_number = item.charger_serial_number;
          }
        }

        if (item.category === "Charger") {
          if (item.charger_name?.trim()) cleaned.charger_name = item.charger_name;
          if (item.charger_serial_number?.trim())
            cleaned.charger_serial_number = item.charger_serial_number;
        }

        return cleaned;
      }),
      payment_mode: paymentMode,
    };

    setLoading(true);

    try {
      const response = await fetch("https://chaudharymobilesshopserver.onrender.com/invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to generate invoice");
      }

      const data = await response.json();

      if (data.pdf_url) {
        window.location.href = data.pdf_url;

        setCustomerName("");
        setCustomerAddress("");
        setPaymentMode("Cash");
        setItems([
          {
            category: "Phone",
            item_name: "",
            quantity: 1,
            price: 0,
            serial_number: "",
            imei_1: "",
            imei_2: "",
            charger_included: false,
            charger_name: "",
            charger_serial_number: "",
          },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="text-gray-600 text-sm font-medium px-4 py-2 border border-gray-300 rounded"
          >
            Back
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Create Invoice</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Customer Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded text-base"
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Address *
            </label>
            <textarea
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded text-base"
              rows={3}
              placeholder="Enter customer address"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            <button
              onClick={addItem}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded text-sm font-medium"
            >
              <Plus size={18} />
              Add Item
            </button>
          </div>

          <div className="space-y-6">
            {items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Item {index + 1}</span>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-600 p-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={item.category}
                    onChange={(e) => updateItem(index, "category", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded text-base"
                  >
                    <option value="Phone">Phone</option>
                    <option value="Charger">Charger</option>
                  </select>
                </div>

                {item.category === "Phone" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={item.item_name}
                      onChange={(e) => updateItem(index, "item_name", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded text-base"
                      placeholder="Enter item name"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded text-base"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Price *
                    </label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded text-base"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {item.category === "Phone" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IMEI 1 *
                      </label>
                      <input
                        type="text"
                        value={item.imei_1 || ""}
                        onChange={(e) => updateItem(index, "imei_1", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded text-base"
                        placeholder="Enter IMEI 1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IMEI 2
                      </label>
                      <input
                        type="text"
                        value={item.imei_2 || ""}
                        onChange={(e) => updateItem(index, "imei_2", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded text-base"
                        placeholder="Optional"
                      />
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.charger_included || false}
                          onChange={(e) => updateItem(index, "charger_included", e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          Charger Included
                        </span>
                      </label>

                      {item.charger_included && (
                        <div className="mt-4 space-y-4 pl-8">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Charger Name *
                            </label>
                            <input
                              type="text"
                              value={item.charger_name || ""}
                              onChange={(e) => updateItem(index, "charger_name", e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded text-base"
                              placeholder="Enter charger name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Charger Serial Number
                            </label>
                            <input
                              type="text"
                              value={item.charger_serial_number || ""}
                              onChange={(e) =>
                                updateItem(index, "charger_serial_number", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded text-base"
                              placeholder="Optional"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {item.category === "Charger" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Charger Name *
                      </label>
                      <input
                        type="text"
                        value={item.charger_name || ""}
                        onChange={(e) => updateItem(index, "charger_name", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded text-base"
                        placeholder="Enter charger name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Charger Serial Number
                      </label>
                      <input
                        type="text"
                        value={item.charger_serial_number || ""}
                        onChange={(e) =>
                          updateItem(index, "charger_serial_number", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded text-base"
                        placeholder="Optional"
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Payment</h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-300 rounded">
              <input
                type="radio"
                name="payment_mode"
                value="Cash"
                checked={paymentMode === "Cash"}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-5 h-5"
              />
              <span className="text-base font-medium text-gray-900">Cash</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-300 rounded">
              <input
                type="radio"
                name="payment_mode"
                value="Online"
                checked={paymentMode === "Online"}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-5 h-5"
              />
              <span className="text-base font-medium text-gray-900">Online</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-300 rounded">
              <input
                type="radio"
                name="payment_mode"
                value="EMI"
                checked={paymentMode === "EMI"}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-5 h-5"
              />
              <span className="text-base font-medium text-gray-900">EMI</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-gray-900 text-white rounded text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Generating..." : "Generate Invoice"}
        </button>
      </div>
    </div>
  );
}
