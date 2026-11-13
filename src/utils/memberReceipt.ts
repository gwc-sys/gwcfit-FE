export type MemberReceiptData = {
  receipt_number: string;
  payment_uuid: string;
  gym_name: string;
  gym_address?: string | null;
  gym_phone?: string | null;
  member_name: string;
  member_code: string;
  plan_name: string;
  amount_cents: number;
  currency: string;
  paid_at: string | null;
  payment_method: string;
  transaction_reference?: string | null;
  start_date?: string | null;
  expiry_date?: string | null;
};

export function formatReceiptPaymentMethod(method?: string | null): string {
  if (!method) return "Cash";
  const normalized = method.trim().toLowerCase();
  if (normalized === "manual_qr") return "UPI / Gym QR";
  if (normalized === "upi") return "UPI";
  return method
    .trim()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatReceiptPaidAt(paidAt?: string | null): string {
  if (!paidAt) return "Not recorded";
  const parsed = new Date(paidAt);
  if (Number.isNaN(parsed.getTime())) return paidAt;
  return parsed.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function receiptAmount(receipt: MemberReceiptData): string {
  const currency = (receipt.currency || "INR").toUpperCase();
  return `${currency} ${(receipt.amount_cents / 100).toFixed(2)}`;
}

export function receiptZeroAmount(receipt: MemberReceiptData): string {
  const currency = (receipt.currency || "INR").toUpperCase();
  return `${currency} 0.00`;
}

export function receiptRows(receipt: MemberReceiptData): Array<[string, string]> {
  return [
    ["Receipt number", receipt.receipt_number],
    ["Member", receipt.member_name],
    ["Member ID", receipt.member_code],
    ["Plan", receipt.plan_name],
    ["Paid on", formatReceiptPaidAt(receipt.paid_at)],
    ["Payment method", formatReceiptPaymentMethod(receipt.payment_method)],
    ["Transaction reference", receipt.transaction_reference || receipt.payment_uuid],
    ...(receipt.start_date ? ([["Membership starts", receipt.start_date]] as Array<[string, string]>) : []),
    ...(receipt.expiry_date ? ([["Membership ends", receipt.expiry_date]] as Array<[string, string]>) : []),
  ];
}

export function memberReceiptHtml(receipt: MemberReceiptData): string {
  const escape = (value: string) =>
    value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));

  const gymDisplayName = (receipt.gym_name || "Gym").trim();
  const gymUpper = gymDisplayName.toUpperCase();
  const amountFormatted = receiptAmount(receipt);
  const zeroFormatted = receiptZeroAmount(receipt);
  const paymentMode = formatReceiptPaymentMethod(receipt.payment_method);
  const paidOn = formatReceiptPaidAt(receipt.paid_at);
  const txReference = receipt.transaction_reference || receipt.payment_uuid;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: A4; margin: 18mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #000000;
      margin: 0;
      padding: 0;
      font-size: 12px;
      line-height: 1.45;
      background: #FFFFFF;
    }
    .page {
      min-height: 255mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 14px;
      border-bottom: 2px solid #000000;
    }
    .gym-title {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.3px;
      color: #000000;
      margin: 0 0 4px 0;
      text-transform: uppercase;
    }
    .gym-meta {
      font-size: 12px;
      color: #1C1C1E;
      margin: 2px 0 0 0;
    }
    .header-right {
      text-align: right;
    }
    .receipt-heading {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.4px;
      color: #000000;
      margin: 0 0 6px 0;
      text-transform: uppercase;
    }
    .confirmed-badge {
      display: inline-block;
      background: rgba(52, 199, 89, 0.14);
      color: #34C759;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.6px;
      padding: 4px 10px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .amount-banner {
      margin-top: 20px;
      background: #F2F2F7;
      border: 1px solid #F2F2F7;
      border-left: 4px solid #34C759;
      border-radius: 4px;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .banner-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #1C1C1E;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .banner-amount {
      font-size: 24px;
      font-weight: 800;
      color: #000000;
    }
    .banner-method {
      font-size: 14px;
      font-weight: 700;
      color: #000000;
      text-align: right;
    }
    .cards-row {
      margin-top: 20px;
      display: flex;
      gap: 16px;
    }
    .info-card {
      flex: 1;
      border: 1px solid #F2F2F7;
      border-radius: 4px;
      padding: 14px 16px;
      background: #FFFFFF;
    }
    .card-heading {
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.4px;
      color: #000000;
      text-transform: uppercase;
      padding-bottom: 8px;
      margin: 0 0 10px 0;
      border-bottom: 1px dashed rgba(28, 28, 30, 0.2);
    }
    .field {
      margin-bottom: 10px;
    }
    .field:last-child {
      margin-bottom: 0;
    }
    .field-label {
      font-size: 10.5px;
      color: #1C1C1E;
      margin-bottom: 2px;
    }
    .field-value {
      font-size: 12.5px;
      font-weight: 700;
      color: #000000;
      word-break: break-all;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 22px;
    }
    .items-table thead tr {
      background: #000000;
      color: #FFFFFF;
    }
    .items-table th {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      padding: 10px 14px;
      text-align: left;
    }
    .items-table th.right, .items-table td.right {
      text-align: right;
    }
    .items-table tbody td {
      padding: 14px;
      border-bottom: 2px solid #000000;
      vertical-align: middle;
    }
    .plan-name {
      font-size: 12.5px;
      font-weight: 700;
      color: #000000;
    }
    .plan-sub {
      font-size: 11px;
      color: #1C1C1E;
      margin-top: 2px;
    }
    .summary-row {
      margin-top: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
    }
    .tx-ref-box {
      width: 46%;
      background: #F2F2F7;
      border: 1px dashed rgba(28, 28, 30, 0.2);
      border-radius: 4px;
      padding: 10px 14px;
    }
    .tx-ref-label {
      font-size: 9.5px;
      font-weight: 700;
      color: #1C1C1E;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .tx-ref-val {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 10.5px;
      color: #1C1C1E;
      word-break: break-all;
    }
    .totals-box {
      width: 38%;
    }
    .totals-line {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 12px;
    }
    .totals-line .label {
      color: #1C1C1E;
    }
    .totals-line .val {
      font-weight: 700;
      color: #000000;
    }
    .totals-total {
      display: flex;
      justify-content: space-between;
      padding-top: 8px;
      margin-top: 6px;
      border-top: 1.5px solid #000000;
      font-size: 14px;
      font-weight: 800;
      color: #000000;
    }
    .thank-you {
      margin-top: 28px;
      padding-top: 16px;
      border-top: 1px solid #F2F2F7;
      text-align: center;
    }
    .thank-you-title {
      font-size: 12px;
      font-weight: 700;
      color: #000000;
      margin: 0 0 4px 0;
    }
    .thank-you-sub {
      font-size: 11px;
      color: #1C1C1E;
      margin: 0;
    }
    .page-footer {
      margin-top: 40px;
      padding-top: 10px;
      border-top: 1px solid #F2F2F7;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #1C1C1E;
    }
  </style>
</head>
<body>
  <div class="page">
    <div>
      <div class="header">
        <div>
          <h1 class="gym-title">${escape(gymUpper)}</h1>
          ${receipt.gym_phone ? `<p class="gym-meta">Phone: ${escape(receipt.gym_phone)}</p>` : ""}
          ${receipt.gym_address ? `<p class="gym-meta">${escape(receipt.gym_address)}</p>` : ""}
        </div>
        <div class="header-right">
          <div class="receipt-heading">PAYMENT RECEIPT</div>
          <span class="confirmed-badge">CONFIRMED</span>
        </div>
      </div>

      <div class="amount-banner">
        <div>
          <div class="banner-label">TOTAL AMOUNT PAID</div>
          <div class="banner-amount">${escape(amountFormatted)}</div>
        </div>
        <div style="text-align: right;">
          <div class="banner-label">PAYMENT METHOD</div>
          <div class="banner-method">${escape(paymentMode)}</div>
        </div>
      </div>

      <div class="cards-row">
        <div class="info-card">
          <div class="card-heading">MEMBER INFORMATION</div>
          <div class="field">
            <div class="field-label">Member Name</div>
            <div class="field-value">${escape(receipt.member_name)}</div>
          </div>
          <div class="field">
            <div class="field-label">Member ID</div>
            <div class="field-value">${escape(receipt.member_code)}</div>
          </div>
        </div>
        <div class="info-card">
          <div class="card-heading">TRANSACTION DETAILS</div>
          <div class="field">
            <div class="field-label">Receipt Number</div>
            <div class="field-value">${escape(receipt.receipt_number)}</div>
          </div>
          <div class="field">
            <div class="field-label">Paid On</div>
            <div class="field-value">${escape(paidOn)}</div>
          </div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 48%;">DESCRIPTION / PLAN</th>
            <th style="width: 26%;">PAYMENT MODE</th>
            <th class="right" style="width: 26%;">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="plan-name">${escape(receipt.plan_name)}</div>
              <div class="plan-sub">Gym Membership Subscription</div>
            </td>
            <td>${escape(paymentMode)}</td>
            <td class="right" style="font-weight: 700;">${escape(amountFormatted)}</td>
          </tr>
        </tbody>
      </table>

      <div class="summary-row">
        <div class="tx-ref-box">
          <div class="tx-ref-label">TRANSACTION REFERENCE</div>
          <div class="tx-ref-val">${escape(txReference)}</div>
        </div>
        <div class="totals-box">
          <div class="totals-line">
            <span class="label">Subtotal:</span>
            <span class="val">${escape(amountFormatted)}</span>
          </div>
          <div class="totals-line">
            <span class="label">Tax / Fees:</span>
            <span class="val">${escape(zeroFormatted)}</span>
          </div>
          <div class="totals-total">
            <span>Total Paid:</span>
            <span>${escape(amountFormatted)}</span>
          </div>
        </div>
      </div>

      <div class="thank-you">
        <p class="thank-you-title">Thank you for training with ${escape(gymDisplayName)}!</p>
        <p class="thank-you-sub">This document serves as an official proof of payment. Please retain this receipt for your records.</p>
      </div>
    </div>

    <div class="page-footer">
      <span>${escape(gymDisplayName)} &mdash; Receipt ${escape(receipt.receipt_number)}</span>
      <span>Page 1 of 1</span>
    </div>
  </div>
</body>
</html>`;
}

export async function generateMemberReceiptPdf(receipt: MemberReceiptData): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });

  const gymDisplayName = (receipt.gym_name || "Gym").trim();
  const gymUpper = gymDisplayName.toUpperCase();
  const amountFormatted = receiptAmount(receipt);
  const zeroFormatted = receiptZeroAmount(receipt);
  const paymentMode = formatReceiptPaymentMethod(receipt.payment_method);
  const paidOn = formatReceiptPaidAt(receipt.paid_at);
  const txReference = receipt.transaction_reference || receipt.payment_uuid;

  const marginX = 18;
  const pageWidth = 210;
  const rightX = pageWidth - marginX; // 192
  const contentWidth = rightX - marginX; // 174

  // ── 1. Top Header ──────────────────────────────────────────────────────────
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(0, 0, 0);
  pdf.text(gymUpper, marginX, 23);

  let leftSubY = 29;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(28, 28, 30);
  if (receipt.gym_phone) {
    pdf.text(`Phone: ${receipt.gym_phone}`, marginX, leftSubY);
    leftSubY += 4.8;
  }
  if (receipt.gym_address) {
    const addrLines = pdf.splitTextToSize(receipt.gym_address, 105) as string[];
    pdf.text(addrLines, marginX, leftSubY);
    leftSubY += addrLines.length * 4.5;
  }

  // Right side: PAYMENT RECEIPT + CONFIRMED badge
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13.5);
  pdf.setTextColor(0, 0, 0);
  pdf.text("PAYMENT RECEIPT", rightX, 22, { align: "right" });

  const badgeW = 24;
  const badgeH = 6;
  const badgeX = rightX - badgeW;
  const badgeY = 25;
  pdf.setFillColor(227, 247, 232); // #34C759 light
  pdf.roundedRect(badgeX, badgeY, badgeW, badgeH, 1.2, 1.2, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(52, 199, 89); // #34C759
  pdf.text("CONFIRMED", badgeX + badgeW / 2, badgeY + 4.1, { align: "center" });

  // Solid dark header divider line
  const dividerY = Math.max(36, leftSubY + 3);
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.55);
  pdf.line(marginX, dividerY, rightX, dividerY);

  // ── 2. Total Amount Paid Banner Box ────────────────────────────────────────
  const bannerY = dividerY + 6;
  const bannerH = 21;
  pdf.setFillColor(242, 242, 247); // #F2F2F7
  pdf.setDrawColor(242, 242, 247); // #F2F2F7
  pdf.setLineWidth(0.25);
  pdf.rect(marginX, bannerY, contentWidth, bannerH, "FD");

  // Green left accent strip
  pdf.setFillColor(52, 199, 89); // #34C759
  pdf.rect(marginX, bannerY, 1.4, bannerH, "F");

  // Left: TOTAL AMOUNT PAID + INR 999.00
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(28, 28, 30);
  pdf.text("TOTAL AMOUNT PAID", marginX + 6, bannerY + 7);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(19.5);
  pdf.setTextColor(0, 0, 0);
  pdf.text(amountFormatted, marginX + 6, bannerY + 15.5);

  // Right: PAYMENT METHOD + Cash
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(28, 28, 30);
  pdf.text("PAYMENT METHOD", rightX - 5.5, bannerY + 8.5, { align: "right" });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11.5);
  pdf.setTextColor(0, 0, 0);
  pdf.text(paymentMode, rightX - 5.5, bannerY + 14.5, { align: "right" });

  // ── 3. Two Side-by-Side Cards (MEMBER INFORMATION & TRANSACTION DETAILS) ───
  const cardsY = bannerY + bannerH + 6;
  const cardGap = 5;
  const cardW = (contentWidth - cardGap) / 2; // 84.5mm
  const cardH = 39;
  const rightCardX = marginX + cardW + cardGap;

  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(242, 242, 247);
  pdf.setLineWidth(0.25);
  pdf.rect(marginX, cardsY, cardW, cardH, "FD");
  pdf.rect(rightCardX, cardsY, cardW, cardH, "FD");

  // Card Headings
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(0, 0, 0);
  pdf.text("MEMBER INFORMATION", marginX + 4.5, cardsY + 6.5);
  pdf.text("TRANSACTION DETAILS", rightCardX + 4.5, cardsY + 6.5);

  // Dashed divider inside cards
  pdf.setDrawColor(242, 242, 247);
  pdf.setLineWidth(0.25);
  if (typeof (pdf as any).setLineDashPattern === "function") {
    (pdf as any).setLineDashPattern([1, 1], 0);
  }
  pdf.line(marginX + 4.5, cardsY + 9.5, marginX + cardW - 4.5, cardsY + 9.5);
  pdf.line(rightCardX + 4.5, cardsY + 9.5, rightCardX + cardW - 4.5, cardsY + 9.5);
  if (typeof (pdf as any).setLineDashPattern === "function") {
    (pdf as any).setLineDashPattern([], 0);
  }

  // Left card fields: Member Name & Member ID
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(28, 28, 30);
  pdf.text("Member Name", marginX + 4.5, cardsY + 15);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10.5);
  pdf.setTextColor(0, 0, 0);
  pdf.text(receipt.member_name || "Member", marginX + 4.5, cardsY + 19.8);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(28, 28, 30);
  pdf.text("Member ID", marginX + 4.5, cardsY + 26);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  pdf.setTextColor(0, 0, 0);
  const memberIdLines = pdf.splitTextToSize(receipt.member_code || "-", cardW - 9) as string[];
  pdf.text(memberIdLines, marginX + 4.5, cardsY + 30.5);

  // Right card fields: Receipt Number & Paid On
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(28, 28, 30);
  pdf.text("Receipt Number", rightCardX + 4.5, cardsY + 15);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  pdf.setTextColor(0, 0, 0);
  const receiptNumLines = pdf.splitTextToSize(receipt.receipt_number, cardW - 9) as string[];
  pdf.text(receiptNumLines, rightCardX + 4.5, cardsY + 19.5);

  const paidOnLabelY = cardsY + 19.5 + receiptNumLines.length * 4 + 2.5;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(28, 28, 30);
  pdf.text("Paid On", rightCardX + 4.5, paidOnLabelY);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  pdf.setTextColor(0, 0, 0);
  pdf.text(paidOn, rightCardX + 4.5, paidOnLabelY + 4.5);

  // ── 4. Description / Plan Table ────────────────────────────────────────────
  const tableY = cardsY + cardH + 6;
  const tableHeaderH = 9;

  // Dark header bar
  pdf.setFillColor(28, 28, 30); // #1C1C1E
  pdf.rect(marginX, tableY, contentWidth, tableHeaderH, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(255, 255, 255);
  pdf.text("DESCRIPTION / PLAN", marginX + 4.5, tableY + 5.8);
  pdf.text("PAYMENT MODE", marginX + 83, tableY + 5.8);
  pdf.text("AMOUNT", rightX - 4.5, tableY + 5.8, { align: "right" });

  // Item row
  const rowY = tableY + tableHeaderH;
  const rowH = 15;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text(receipt.plan_name || "Membership Plan", marginX + 4.5, rowY + 6.5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(28, 28, 30);
  pdf.text("Gym Membership Subscription", marginX + 4.5, rowY + 11.2);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor(28, 28, 30);
  pdf.text(paymentMode, marginX + 83, rowY + 8.8);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text(amountFormatted, rightX - 4.5, rowY + 8.8, { align: "right" });

  // Solid bottom border under table row
  const tableBottomY = rowY + rowH;
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.45);
  pdf.line(marginX, tableBottomY, rightX, tableBottomY);

  // ── 5. Transaction Reference Box & Subtotal / Tax / Total Paid ─────────────
  const summaryY = tableBottomY + 5.5;
  const refBoxW = 74;
  const refBoxH = 15;

  pdf.setFillColor(242, 242, 247);
  pdf.setDrawColor(242, 242, 247);
  pdf.setLineWidth(0.25);
  if (typeof (pdf as any).setLineDashPattern === "function") {
    (pdf as any).setLineDashPattern([1, 1], 0);
  }
  pdf.rect(marginX, summaryY, refBoxW, refBoxH, "FD");
  if (typeof (pdf as any).setLineDashPattern === "function") {
    (pdf as any).setLineDashPattern([], 0);
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.8);
  pdf.setTextColor(28, 28, 30);
  pdf.text("TRANSACTION REFERENCE", marginX + 4.5, summaryY + 5.8);

  pdf.setFont("courier", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(28, 28, 30);
  const txLines = pdf.splitTextToSize(txReference, refBoxW - 9) as string[];
  pdf.text(txLines[0] || "-", marginX + 4.5, summaryY + 10.8);

  // Right Totals column
  const totalsLeftX = 128.5;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor(28, 28, 30);
  pdf.text("Subtotal:", totalsLeftX, summaryY + 4.5);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  pdf.setTextColor(0, 0, 0);
  pdf.text(amountFormatted, rightX, summaryY + 4.5, { align: "right" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor(28, 28, 30);
  pdf.text("Tax / Fees:", totalsLeftX, summaryY + 11.2);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  pdf.setTextColor(0, 0, 0);
  pdf.text(zeroFormatted, rightX, summaryY + 11.2, { align: "right" });

  // Solid line above Total Paid
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.4);
  pdf.line(totalsLeftX, summaryY + 14.5, rightX, summaryY + 14.5);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  pdf.text("Total Paid:", totalsLeftX, summaryY + 20.5);
  pdf.text(amountFormatted, rightX, summaryY + 20.5, { align: "right" });

  // ── 6. Thank You Section ───────────────────────────────────────────────────
  const thankYouLineY = summaryY + 32;
  pdf.setDrawColor(242, 242, 247);
  pdf.setLineWidth(0.25);
  pdf.line(marginX, thankYouLineY, rightX, thankYouLineY);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Thank you for training with ${gymDisplayName}!`, pageWidth / 2, thankYouLineY + 7, {
    align: "center",
  });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(28, 28, 30);
  pdf.text(
    "This document serves as an official proof of payment. Please retain this receipt for your records.",
    pageWidth / 2,
    thankYouLineY + 12.2,
    { align: "center" }
  );

  // ── 7. Bottom Page Footer ──────────────────────────────────────────────────
  const footerLineY = 278;
  pdf.setDrawColor(242, 242, 247);
  pdf.setLineWidth(0.25);
  pdf.line(marginX, footerLineY, rightX, footerLineY);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(28, 28, 30);
  pdf.text(`${gymDisplayName} — Receipt ${receipt.receipt_number}`, marginX, footerLineY + 5);
  pdf.text("Page 1 of 1", rightX, footerLineY + 5, { align: "right" });

  return pdf.output("blob");
}
