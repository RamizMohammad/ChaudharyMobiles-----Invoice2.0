# API Reference for Backend

This document outlines the REST API endpoints required for the POS Invoice System frontend to function properly.

## Base URL
All endpoints are relative to your backend server URL.

---

## Endpoints

### 1. Generate Invoice

**POST** `/api/invoices/generate`

Creates a new invoice and returns a PDF URL.

#### Request Body
```json
{
  "customer_name": "John Doe",
  "customer_address": "123 Main Street, City, State",
  "items": [
    {
      "category": "Phone",
      "item_name": "iPhone 15 Pro",
      "quantity": 1,
      "price": 50000,
      "serial_number": "SN123456",
      "imei_1": "123456789012345",
      "imei_2": "543210987654321",
      "charger_included": true,
      "charger_name": "20W USB-C Charger",
      "charger_serial_number": "CH123456"
    },
    {
      "category": "Charger",
      "item_name": "Samsung 25W Charger",
      "quantity": 2,
      "price": 1500,
      "serial_number": "SN789012",
      "charger_name": "Samsung 25W Charger",
      "charger_serial_number": "CH789012"
    }
  ],
  "payment_mode": "Cash"
}
```

#### Response
```json
{
  "pdf_url": "https://your-backend.com/invoices/INV-2024-001.pdf"
}
```

#### Field Rules
- `customer_name` (required): Customer's full name
- `customer_address` (required): Customer's address
- `items` (required): Array of invoice items
  - `category` (required): "Phone" or "Charger"
  - `item_name` (required): Name of the item
  - `quantity` (required): Quantity (must be > 0)
  - `price` (required): Base price per unit (must be > 0)
  - `serial_number` (optional): Item serial number

  **For Phone category:**
  - `imei_1` (required): Primary IMEI number
  - `imei_2` (optional): Secondary IMEI number
  - `charger_included` (optional): Boolean indicating if charger is included
  - `charger_name` (conditional): Required if `charger_included` is true
  - `charger_serial_number` (optional): Charger serial number

  **For Charger category:**
  - `charger_name` (required): Name of the charger
  - `charger_serial_number` (optional): Charger serial number

- `payment_mode` (required): "Cash", "Online", or "EMI"

---

### 2. Get Invoice History

**GET** `/api/invoices`

Retrieves a paginated list of invoices with optional search.

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `search` (optional): Search query for invoice number or customer name

Example: `/api/invoices?page=2&search=John`

#### Response
```json
{
  "invoices": [
    {
      "id": "uuid-1",
      "invoice_number": "INV-2024-001",
      "date": "2024-12-30T10:30:00Z",
      "customer_name": "John Doe",
      "payment_mode": "Cash",
      "pdf_url": "https://your-backend.com/invoices/INV-2024-001.pdf"
    },
    {
      "id": "uuid-2",
      "invoice_number": "INV-2024-002",
      "date": "2024-12-30T11:45:00Z",
      "customer_name": "Jane Smith",
      "payment_mode": "Online",
      "pdf_url": "https://your-backend.com/invoices/INV-2024-002.pdf"
    }
  ],
  "total_pages": 5
}
```

#### Response Fields
- `invoices`: Array of invoice objects
  - `id`: Unique identifier for the invoice
  - `invoice_number`: Human-readable invoice number
  - `date`: ISO 8601 timestamp of invoice creation
  - `customer_name`: Customer's name
  - `payment_mode`: Payment method used
  - `pdf_url`: URL to access the invoice PDF
- `total_pages`: Total number of pages available

---

## Notes

1. The frontend does NOT perform any price calculations, tax calculations, or totals
2. All monetary calculations must be handled by the backend
3. The backend is responsible for:
   - Calculating GST/SGST
   - Computing subtotals and grand totals
   - Generating the PDF invoice
   - Storing invoice data
4. PDF URLs returned must be publicly accessible or properly authenticated
5. Date format should be ISO 8601 for consistency
