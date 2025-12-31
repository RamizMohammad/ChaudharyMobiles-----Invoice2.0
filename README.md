# POS Invoice System - Frontend

A clean, mobile-first React frontend for a Point of Sale (POS) Invoice System designed for mobile phone shopkeepers.

## Overview

This is a **FRONTEND-ONLY** application that collects invoice data and communicates with a backend REST API. The frontend does NOT perform any price calculations, tax computations, or PDF generation. All business logic is handled by the backend.

## Features

### Create Invoice
- Customer information entry (name, address)
- Dynamic item management (add/remove items)
- Two product categories: Phone and Charger
- Conditional fields based on category:
  - **Phone**: IMEI numbers, optional charger inclusion
  - **Charger**: Charger details only
- Payment mode selection (Cash, Online, EMI)
- Real-time validation
- Opens generated PDF in new tab

### Invoice History
- Paginated list of past invoices
- Search by invoice number or customer name
- Mobile-responsive table/card view
- Direct PDF access

## Technology Stack

- React 18
- TypeScript
- Tailwind CSS
- Vite
- Lucide React (icons)

## Design Philosophy

- Simple, fast, boring, reliable
- Mobile and tablet optimized
- Large tap targets for easy use
- No animations or gradients
- Clean, professional interface

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── CreateInvoice.tsx    # Invoice creation form
│   └── InvoiceHistory.tsx   # Invoice history list
├── types.ts                  # TypeScript type definitions
├── App.tsx                   # Main app with navigation
├── main.tsx                  # App entry point
└── index.css                 # Global styles
```

## API Integration

The frontend expects a REST API to be available. See `API_REFERENCE.md` for complete API documentation.

### Required Endpoints

1. **POST** `/api/invoices/generate` - Create invoice and return PDF URL
2. **GET** `/api/invoices` - Get paginated invoice history with search

## Key Rules (IMPORTANT)

The frontend strictly adheres to these rules:

1. **NO CALCULATIONS**: Frontend does not calculate prices, taxes, or totals
2. **NO GST/SGST UI**: Tax fields are NOT displayed to the user
3. **RAW DATA ONLY**: Frontend collects and submits raw data to backend
4. **BACKEND IS TRUTH**: All monetary values come from backend
5. **PDF FROM BACKEND**: Frontend only opens the PDF URL returned by backend

## Conditional Logic

### Phone Category
When an item category is "Phone":
- IMEI 1 field (required)
- IMEI 2 field (optional)
- "Charger Included" checkbox
  - If checked: Charger Name and Charger Serial Number fields appear

### Charger Category
When an item category is "Charger":
- NO "Charger Included" checkbox
- Charger Name field (required)
- Charger Serial Number field (optional)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design: 320px to 2560px viewport width

## License

Private/Commercial Use
