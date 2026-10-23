export type MemberReceiptData = {
  receipt_number: string; payment_uuid: string; gym_name: string; gym_address?: string | null;
  gym_phone?: string | null; member_name: string; member_code: string; plan_name: string;
  amount_cents: number; currency: string; paid_at: string | null; payment_method: string;
  transaction_reference?: string | null; start_date?: string | null; expiry_date?: string | null;
};

export function receiptRows(receipt: MemberReceiptData): Array<[string, string]> {
  return [
    ["Receipt number", receipt.receipt_number],
    ["Member", receipt.member_name], ["Member ID", receipt.member_code],
    ["Plan", receipt.plan_name],
    ["Paid on", receipt.paid_at ? new Date(receipt.paid_at).toLocaleString() : "Not recorded"],
    ["Payment method", receipt.payment_method === "manual_qr" ? "UPI / gym QR" : receipt.payment_method],
    ["Transaction reference", receipt.transaction_reference || receipt.payment_uuid],
    ...(receipt.start_date ? [["Membership starts", receipt.start_date] as [string, string]] : []),
    ...(receipt.expiry_date ? [["Membership ends", receipt.expiry_date] as [string, string]] : []),
  ];
}

export function receiptAmount(receipt: MemberReceiptData) {
  return `${receipt.currency} ${(receipt.amount_cents / 100).toFixed(2)}`;
}

export function memberReceiptHtml(receipt: MemberReceiptData) {
  const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @page{size:A4;margin:24mm}body{font-family:Arial,sans-serif;color:#142238;font-size:13px;line-height:1.5}
    h1{font-size:28px;margin:4px 0}h2{font-size:20px;margin:28px 0 4px}p{margin:4px 0;color:#526681}
    .total{padding:20px;background:#f1f5fa;border-radius:12px;margin:24px 0;font-size:26px;font-weight:bold}
    table{width:100%;border-collapse:collapse;table-layout:fixed}td{padding:12px 0;border-bottom:1px solid #dce4ee;vertical-align:top;word-wrap:break-word}td:first-child{width:32%;color:#526681;padding-right:16px}
    .status{color:#187744;font-weight:bold}.footer{margin-top:28px;font-size:11px}
    </style></head><body><h1>${escape(receipt.gym_name)}</h1>
    ${receipt.gym_address ? `<p>${escape(receipt.gym_address)}</p>` : ""}${receipt.gym_phone ? `<p>${escape(receipt.gym_phone)}</p>` : ""}
    <h2>Payment receipt</h2><p class="status">Payment confirmed</p>
    <div class="total">${escape(receiptAmount(receipt))}</div>
    <table>${receiptRows(receipt).map(([label, value]) => `<tr><td>${escape(label)}</td><td>${escape(value)}</td></tr>`).join("")}</table>
    <p class="footer">Generated from the gym's confirmed payment record.</p></body></html>`;
}
