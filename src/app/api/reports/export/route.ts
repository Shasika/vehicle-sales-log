import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-utils';
import { authOptions } from '@/lib/auth';
import { canAccess } from '@/lib/auth-utils';
import connectDB from '@/lib/mongodb';
import { Transaction, Expense } from '@/models';
import { ProfitCalculator } from '@/lib/profit-calculator';
import { z } from 'zod';
import { formatCurrencyWithRs } from '@/lib/currency';

const exportQuerySchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  format: z.enum(['csv', 'pdf', 'html']),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !canAccess(session.user.role, ['READ'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validation = exportQuerySchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { from: startDate, to: endDate, format } = validation.data;

    await connectDB();

    // Fetch data
    const [transactions, expenses] = await Promise.all([
      Transaction.find({
        date: { $gte: startDate, $lte: endDate },
        deletedAt: { $exists: false }
      })
      .populate('vehicleId', 'registrationNumber make vehicleModel')
      .populate('counterpartyId', 'fullName businessName type')
      .lean(),
      Expense.find({
        date: { $gte: startDate, $lte: endDate },
        deletedAt: { $exists: false }
      }).lean(),
    ]);

    // Calculate P&L
    const pnl = ProfitCalculator.calculatePeriodProfit(
      transactions,
      expenses,
      startDate,
      endDate
    );

    if (format === 'csv') {
      return generateCSVReport(transactions, expenses, pnl, startDate, endDate);
    } else if (format === 'pdf') {
      return await generatePDFReport(transactions, expenses, pnl, startDate, endDate);
    } else {
      return generateHTMLReport(transactions, expenses, pnl, startDate, endDate);
    }

  } catch (error) {
    console.error('Export report error:', error);
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    );
  }
}

function generateCSVReport(
  transactions: any[],
  expenses: any[],
  pnl: any,
  startDate: Date,
  endDate: Date
) {
  const csvData = [];

  // Header
  csvData.push('Vehicle Sales Report');
  csvData.push(`Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
  csvData.push('');

  // Summary
  csvData.push('SUMMARY');
  csvData.push(`Total Revenue,${formatCurrencyWithRs(pnl.revenue)}`);
  csvData.push(`Total Costs,${formatCurrencyWithRs(pnl.costs)}`);
  csvData.push(`Total Expenses,${formatCurrencyWithRs(pnl.expenses)}`);
  csvData.push(`Net Profit,${formatCurrencyWithRs(pnl.netProfit)}`);
  csvData.push(`Vehicles Sold,${pnl.transactionCount.out}`);
  csvData.push(`Vehicles Purchased,${pnl.transactionCount.in}`);
  csvData.push('');

  // Transactions
  csvData.push('TRANSACTIONS');
  csvData.push('Date,Type,Vehicle,Counterparty,Amount');

  transactions.forEach(tx => {
    const vehicle = tx.vehicleId
      ? `${tx.vehicleId.make} ${tx.vehicleId.vehicleModel} (${tx.vehicleId.registrationNumber})`
      : 'Unknown Vehicle';
    const counterparty = tx.counterpartyId
      ? (tx.counterpartyId.fullName || tx.counterpartyId.businessName || 'Unknown')
      : 'Unknown';
    const type = tx.direction === 'OUT' ? 'Sale' : 'Purchase';

    csvData.push(`${tx.date.toLocaleDateString()},${type},${vehicle},${counterparty},${formatCurrencyWithRs(tx.totalPrice)}`);
  });

  csvData.push('');

  // Expenses
  csvData.push('EXPENSES');
  csvData.push('Date,Category,Description,Amount');

  expenses.forEach(expense => {
    csvData.push(`${expense.date.toLocaleDateString()},${expense.category},${expense.description},${formatCurrencyWithRs(expense.amount)}`);
  });

  const csvContent = csvData.join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="vehicle-sales-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv"`,
    },
  });
}

async function generatePDFReport(
  transactions: any[],
  expenses: any[],
  pnl: any,
  startDate: Date,
  endDate: Date
) {
  const puppeteer = require('puppeteer');

  // Generate HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Vehicle Sales Report</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          box-sizing: border-box;
        }

        @page {
          margin: 0.5in;
          size: A4;
        }

        @media print {
          body { margin: 0; font-size: 10px; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .summary-grid { grid-template-columns: 1fr 1fr; }
          table { font-size: 9px; min-width: auto; }
          th, td { padding: 6px 4px; }
        }

        @media screen and (max-width: 768px) {
          body { padding: 10px; font-size: 14px; }
          .header h1 { font-size: 20px; }
          .header p { font-size: 12px; }
          .summary { padding: 10px; }
          .summary-grid { grid-template-columns: 1fr; gap: 5px; }
          .summary h2 { font-size: 14px; }
          .section h2 { font-size: 14px; }
          table { font-size: 11px; }
          th, td { padding: 6px 4px; }
          .print-note { padding: 10px; }
          .print-note p { font-size: 12px; }
        }

        @media screen and (max-width: 480px) {
          body { padding: 8px; font-size: 12px; }
          .header h1 { font-size: 18px; }
          .header { margin-bottom: 20px; padding-bottom: 15px; }
          .summary { padding: 8px; margin-bottom: 20px; }
          .summary h2 { font-size: 13px; margin-bottom: 10px; }
          .section { margin-bottom: 20px; }
          .section h2 { font-size: 13px; }
          table { font-size: 9px; overflow-x: auto; display: block; white-space: nowrap; }
          tbody, thead { display: table; width: 100%; }
          th, td { padding: 4px 3px; }
          .mobile-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .print-note { padding: 8px; margin-bottom: 15px; }
          .print-note p { font-size: 11px; line-height: 1.3; }
        }

        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 20px;
          line-height: 1.4;
          font-size: 11px;
          background: #fff;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }

        .header h1 {
          color: #333;
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }

        .header p {
          color: #666;
          margin: 10px 0 0 0;
          font-size: 14px;
        }

        .summary {
          background: #f8f9fa;
          padding: 15px;
          margin-bottom: 25px;
          border-radius: 5px;
          border: 1px solid #dee2e6;
        }

        .summary h2 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #495057;
          font-size: 16px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #dee2e6;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-label {
          font-weight: bold;
          color: #495057;
        }

        .summary-value {
          color: #212529;
        }

        .section {
          margin-bottom: 30px;
        }

        .section h2 {
          color: #495057;
          border-bottom: 1px solid #dee2e6;
          padding-bottom: 8px;
          margin-bottom: 15px;
          font-size: 16px;
        }

        .mobile-scroll {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 10px;
          min-width: 500px;
        }

        th, td {
          border: 1px solid #dee2e6;
          padding: 8px 6px;
          text-align: left;
        }

        th {
          background-color: #f8f9fa;
          font-weight: bold;
          color: #495057;
          font-size: 10px;
        }

        tr:nth-child(even) {
          background-color: #f8f9fa;
        }

        .positive {
          color: #28a745;
          font-weight: bold;
        }

        .negative {
          color: #dc3545;
          font-weight: bold;
        }

        .print-note {
          background: #e7f3ff;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 5px;
          border: 1px solid #b3d9ff;
        }

        .print-note p {
          margin: 0;
          color: #0066cc;
        }

        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #dee2e6;
          font-size: 9px;
          color: #6c757d;
          text-align: center;
        }

        .amount-cell {
          text-align: right;
        }

        .date-cell {
          white-space: nowrap;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Vehicle Sales Report</h1>
        <p>Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
      </div>

      <div class="summary">
        <h2>Executive Summary</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">Total Revenue:</span>
            <span class="summary-value">${formatCurrencyWithRs(pnl.revenue)}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Total Costs:</span>
            <span class="summary-value">${formatCurrencyWithRs(pnl.costs)}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Total Expenses:</span>
            <span class="summary-value">${formatCurrencyWithRs(pnl.expenses)}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Net Profit:</span>
            <span class="summary-value ${pnl.netProfit >= 0 ? 'positive' : 'negative'}">${formatCurrencyWithRs(pnl.netProfit)}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Vehicles Sold:</span>
            <span class="summary-value">${pnl.transactionCount.out}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Vehicles Purchased:</span>
            <span class="summary-value">${pnl.transactionCount.in}</span>
          </div>
        </div>
      </div>

      ${transactions.length > 0 ? `
      <div class="section">
        <h2>Transaction Details</h2>
        <div class="mobile-scroll">
          <table>
          <thead>
            <tr>
              <th class="date-cell">Date</th>
              <th>Type</th>
              <th>Vehicle</th>
              <th>Counterparty</th>
              <th class="amount-cell">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(tx => {
              const vehicle = tx.vehicleId
                ? `${tx.vehicleId.make} ${tx.vehicleId.vehicleModel} (${tx.vehicleId.registrationNumber})`
                : 'Unknown Vehicle';
              const counterparty = tx.counterpartyId
                ? (tx.counterpartyId.fullName || tx.counterpartyId.businessName || 'Unknown')
                : 'Unknown';
              const type = tx.direction === 'OUT' ? 'Sale' : 'Purchase';

              return `<tr>
                <td class="date-cell">${tx.date.toLocaleDateString()}</td>
                <td>${type}</td>
                <td>${vehicle}</td>
                <td>${counterparty}</td>
                <td class="amount-cell">${formatCurrencyWithRs(tx.totalPrice)}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        </div>
      </div>
      ` : ''}

      ${expenses.length > 0 ? `
      ${transactions.length > 15 ? '<div class="page-break"></div>' : ''}
      <div class="section">
        <h2>Expense Details</h2>
        <div class="mobile-scroll">
          <table>
          <thead>
            <tr>
              <th class="date-cell">Date</th>
              <th>Category</th>
              <th>Description</th>
              <th class="amount-cell">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(expense => `<tr>
              <td class="date-cell">${expense.date.toLocaleDateString()}</td>
              <td>${expense.category}</td>
              <td>${expense.description}</td>
              <td class="amount-cell">${formatCurrencyWithRs(expense.amount)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
        </div>
      </div>
      ` : ''}

      <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p>Vehicle Sales Management System</p>
      </div>
    </body>
    </html>
  `;

  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set content and generate PDF
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      printBackground: true
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="vehicle-sales-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    // Fallback to HTML if PDF generation fails
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="vehicle-sales-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.html"`,
      },
    });
  }
}

function generateHTMLReport(
  transactions: any[],
  expenses: any[],
  pnl: any,
  startDate: Date,
  endDate: Date
) {

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Vehicle Sales Report</title>
      <meta charset="UTF-8">
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .header h1 { color: #333; margin: 0; font-size: 28px; }
        .header p { color: #666; margin: 10px 0 0 0; font-size: 16px; }
        .summary { background: #f8f9fa; padding: 20px; margin-bottom: 30px; border-radius: 8px; border: 1px solid #dee2e6; }
        .summary h2 { margin-top: 0; color: #495057; }
        .section { margin-bottom: 40px; }
        .section h2 { color: #495057; border-bottom: 1px solid #dee2e6; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #dee2e6; padding: 12px 8px; text-align: left; }
        th { background-color: #f8f9fa; font-weight: bold; color: #495057; }
        tr:nth-child(even) { background-color: #f8f9fa; }
        .positive { color: #28a745; font-weight: bold; }
        .negative { color: #dc3545; font-weight: bold; }
        .print-note { background: #e7f3ff; padding: 15px; margin-bottom: 20px; border-radius: 5px; border: 1px solid #b3d9ff; }
        .print-note p { margin: 0; color: #0066cc; }
      </style>
    </head>
    <body>
      <div class="print-note no-print">
        <p><strong>💡 Tip:</strong> To convert this report to PDF, use your browser's Print function and choose "Save as PDF" or "Microsoft Print to PDF" as the destination.</p>
      </div>

      <div class="header">
        <h1>Vehicle Sales Report</h1>
        <p>Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
      </div>

      <div class="summary">
        <h2>Summary</h2>
        <p><strong>Total Revenue:</strong> ${formatCurrencyWithRs(pnl.revenue)}</p>
        <p><strong>Total Costs:</strong> ${formatCurrencyWithRs(pnl.costs)}</p>
        <p><strong>Total Expenses:</strong> ${formatCurrencyWithRs(pnl.expenses)}</p>
        <p><strong>Net Profit:</strong> <span class="${pnl.netProfit >= 0 ? 'positive' : 'negative'}">${formatCurrencyWithRs(pnl.netProfit)}</span></p>
        <p><strong>Vehicles Sold:</strong> ${pnl.transactionCount.out}</p>
        <p><strong>Vehicles Purchased:</strong> ${pnl.transactionCount.in}</p>
      </div>

      <div class="section">
        <h2>Transactions</h2>
        <table>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Vehicle</th>
            <th>Counterparty</th>
            <th>Amount</th>
          </tr>
          ${transactions.map(tx => {
            const vehicle = tx.vehicleId
              ? `${tx.vehicleId.make} ${tx.vehicleId.vehicleModel} (${tx.vehicleId.registrationNumber})`
              : 'Unknown Vehicle';
            const counterparty = tx.counterpartyId
      ? (tx.counterpartyId.fullName || tx.counterpartyId.businessName || 'Unknown')
      : 'Unknown';
            const type = tx.direction === 'OUT' ? 'Sale' : 'Purchase';

            return `<tr>
              <td>${tx.date.toLocaleDateString()}</td>
              <td>${type}</td>
              <td>${vehicle}</td>
              <td>${counterparty}</td>
              <td>${formatCurrencyWithRs(tx.totalPrice)}</td>
            </tr>`;
          }).join('')}
        </table>
      </div>

      <div class="section">
        <h2>Expenses</h2>
        <table>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
          ${expenses.map(expense => `<tr>
            <td>${expense.date.toLocaleDateString()}</td>
            <td>${expense.category}</td>
            <td>${expense.description}</td>
            <td>${formatCurrencyWithRs(expense.amount)}</td>
          </tr>`).join('')}
        </table>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(htmlContent, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="vehicle-sales-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.html"`,
    },
  });
}