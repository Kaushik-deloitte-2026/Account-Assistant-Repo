# Ledgerly

Ledgerly is a responsive, browser-based accounting dashboard prototype for small businesses. It is an original demo inspired by common accounting workflows; it is not affiliated with Tally Solutions or a replacement for certified accounting software.

## Features

- Business overview with sales, collections, receivables, purchases, cash-flow visualization, and recent activity
- Create sales, purchase, receipt, payment, and journal entries
- Search transactions and browse sales, purchases, expenses, cash/bank, parties, and reports
- Profit-and-loss summary, customer/supplier list, and cash/bank balances
- Demo entries persist in this browser using `localStorage`
- Responsive desktop and mobile layout

## Run locally

1. Install Node.js (LTS).
2. In this folder, install dependencies with `npm install`.
3. Start the development server with `npm run dev` and open the local address Vite prints.
4. Create a production build with `npm run build`.

## Important limitations

This is a front-end prototype, not a production accounting system. Data is stored only in the current browser and is not backed up or synchronized. There is no authentication, server/database, audit trail, GST/tax compliance, invoice PDF generation, or verified double-entry ledger engine. Do not use it for official books, tax filings, or sensitive financial records. A production release needs a secure backend, validated accounting rules, backups, access controls, and jurisdiction-specific review.
