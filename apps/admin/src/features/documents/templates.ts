/**
 * HTML for the printable A4 documents. The markup and CSS are the company templates
 * (invoice-template.html, offer-letter-template.html) with the placeholders filled in.
 * Everything typed into the forms is escaped before it lands in the HTML.
 */

export type InvoiceItem = { name: string; note: string; qty: string; unitPrice: string };

export type InvoiceData = {
  invoiceNo: string;
  clientCompany: string;
  clientContact: string;
  clientEmail: string;
  clientAddress: string; // one line per address line
  items: InvoiceItem[];
  invoiceDate: string; // yyyy-mm-dd
  dueDate: string; // yyyy-mm-dd
};

export type OfferData = {
  candidateName: string;
  candidateFirstName: string;
  designation: string;
  issueDate: string; // yyyy-mm-dd
  referenceNo: string;
  reportsTo: string;
  joiningDate: string; // yyyy-mm-dd
  workingDays: string;
  officeHours: string;
  probation: string;
  monthlySalary: string;
  responsibilities: string; // one per line
  acceptByDate: string; // yyyy-mm-dd
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const lines = (s: string) =>
  s
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** "2026-11-21" → local Date (no timezone shift). */
export function parseDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

export function toIsoDate(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function addDays(iso: string, days: number) {
  const d = parseDate(iso) ?? new Date();
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

/** "21 Nov 2026" */
export function shortDate(iso: string) {
  const d = parseDate(iso);
  return d ? `${d.getDate()} ${SHORT[d.getMonth()]} ${d.getFullYear()}` : '';
}

/** "19 November 2026" */
export function longDate(iso: string) {
  const d = parseDate(iso);
  return d ? `${d.getDate()} ${LONG[d.getMonth()]} ${d.getFullYear()}` : '';
}

/** Billing period starting on `iso`: "21 Nov – 20 Dec 2026". */
export function billingPeriod(iso: string) {
  const start = parseDate(iso);
  if (!start) return '';
  const end = new Date(start.getFullYear(), start.getMonth() + 1, start.getDate() - 1);
  const s = `${start.getDate()} ${SHORT[start.getMonth()]}`;
  const e = `${end.getDate()} ${SHORT[end.getMonth()]} ${end.getFullYear()}`;
  return start.getFullYear() === end.getFullYear()
    ? `${s} – ${e}`
    : `${s} ${start.getFullYear()} – ${e}`;
}

/** Parses "10,000" / "10000.5" → number (0 when blank or invalid). */
export const toNumber = (s: string) => {
  const n = Number(s.replace(/[,\s]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const money2 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

/** "10,000.00" */
export const formatAmount = (n: number) => money2.format(n);

export const lineTotal = (item: InvoiceItem) => toNumber(item.qty) * toNumber(item.unitPrice);
export const invoiceTotal = (items: InvoiceItem[]) =>
  items.reduce((sum, item) => sum + lineTotal(item), 0);

const LOGO_POLYGONS =
  '<polygon points="11.3,17.0 30.9,17.0 19.6,45.9 0.0,45.9"/><polygon points="39.5,17.0 59.1,17.0 47.8,45.9 28.2,45.9"/><polygon points="74.8,0.0 94.4,0.0 76.2,45.9 56.6,45.9"/>';

/* ------------------------------------------------------------------ */
/* Invoice                                                             */
/* ------------------------------------------------------------------ */

export function renderInvoice(d: InvoiceData) {
  const no = esc(d.invoiceNo);
  const rows = d.items
    .filter((item) => item.name.trim() || toNumber(item.unitPrice))
    .map(
      (item) => `
        <tr>
          <td>${esc(item.name)}${item.note.trim() ? `<small>${esc(item.note)}</small>` : ''}</td>
          <td class="c">${esc(item.qty)}</td>
          <td class="c">BDT ${formatAmount(toNumber(item.unitPrice))}</td>
          <td class="r">BDT ${formatAmount(lineTotal(item))}</td>
        </tr>`,
    )
    .join('');
  const address = lines(d.clientAddress).map(esc).join('<br>');
  const attn = d.clientContact.trim() ? `<br>Attn: ${esc(d.clientContact)}` : '';
  const email = d.clientEmail.trim() ? `<br>${esc(d.clientEmail)}` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Invoice-${no}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root{ --ink:#171721; --ink-2:#4A4A5A; --muted:#80808F; --line:#E7E7EE; --tile:#1C1C2B; --accent:#5266EB; }
  @page{ size:A4; margin:0; }
  *{ box-sizing:border-box; }
  html,body{ margin:0; background:#fff; }
  body{ font-family:"Inter",-apple-system,"Segoe UI",Helvetica,Arial,sans-serif; color:var(--ink-2);
        font-size:10.5pt; line-height:1.6; -webkit-font-smoothing:antialiased; font-feature-settings:"ss01","cv11","tnum"; }
  .page{ width:210mm; height:296mm; overflow:hidden; margin:0; background:#fff; padding:18mm 18mm 14mm;
         display:flex; flex-direction:column; }

  header{ display:flex; justify-content:space-between; align-items:flex-start; }
  h1{ margin:0; font-size:36pt; font-weight:400; color:var(--ink); letter-spacing:-.03em; line-height:1; }
  .tile{ width:17mm; height:17mm; border-radius:3.2mm; background:var(--tile); display:grid; place-items:center;
         -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .tile svg{ width:10.5mm; height:auto; display:block; }

  .sec{ margin-top:13mm; }
  .grid3{ display:grid; grid-template-columns:37% 37% 26%; }
  .grid2{ display:grid; grid-template-columns:39% 61%; }
  .head{ color:var(--ink); font-weight:500; padding-bottom:3.2mm; border-bottom:1px solid var(--line); }
  .body{ padding-top:4.5mm; }
  .body p{ margin:0 0 2.8mm; }
  .strong{ color:var(--ink); }

  .kv{ display:grid; grid-template-columns:auto 1fr; column-gap:6mm; align-content:start; row-gap:1.2mm; }
  .kv span{ white-space:nowrap; }
  .kv span:nth-child(even){ color:var(--ink); }

  table.items{ width:100%; border-collapse:collapse; }
  .items th{ text-align:left; color:var(--ink); font-weight:500; padding:0 0 3.2mm; border-bottom:1px solid var(--line); }
  .items td{ padding:4mm 0; border-bottom:1px solid var(--line); vertical-align:top; color:var(--ink); }
  .items .c{ text-align:center; } .items .r{ text-align:right; }
  .items td small{ display:block; color:var(--muted); font-size:9pt; margin-top:1px; }
  .total{ display:grid; grid-template-columns:39% 61%; align-items:center; padding-top:4mm; }
  .total .lbl{ grid-column:2; display:flex; justify-content:space-between; align-items:baseline; }
  .total .lbl span:first-child{ font-size:17pt; color:var(--ink); letter-spacing:-.015em; }
  .total .lbl span:last-child{ font-size:17pt; color:var(--ink); font-weight:500; letter-spacing:-.015em; }

  footer{ margin-top:auto; padding-top:4mm; border-top:1px solid var(--line);
          display:flex; justify-content:space-between; font-size:8.5pt; color:var(--muted); }
</style>
</head>
<body>
<div class="page">

  <header>
    <h1>Invoice</h1>
    <div class="tile">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 46" fill="#FFFFFF">${LOGO_POLYGONS}</svg>
    </div>
  </header>

  <div class="sec">
    <div class="grid3">
      <div class="head">From</div><div class="head">To</div><div class="head">Details</div>
    </div>
    <div class="grid3 body">
      <div>
        <p><span class="strong">Muvance Digital</span><br>muvance.com</p>
        <p>House 22, Road 2A<br>Nikunja 2, Khilkhet<br>Dhaka, Bangladesh</p>
      </div>
      <div>
        <p><span class="strong">${esc(d.clientCompany)}</span>${attn}${email}</p>
        ${address ? `<p>${address}</p>` : ''}
      </div>
      <div class="kv">
        <span>Invoice no.</span><span>${no}</span>
        <span>Currency</span><span>BDT</span>
      </div>
    </div>
  </div>

  <div class="sec">
    <table class="items">
      <thead><tr>
        <th style="width:39%">Item</th>
        <th class="c" style="width:16%">Quantity</th>
        <th class="c" style="width:25%">Unit price</th>
        <th class="r" style="width:20%">Total</th>
      </tr></thead>
      <tbody>${rows}
      </tbody>
    </table>
    <div class="total">
      <div class="lbl"><span>Total</span><span>BDT ${formatAmount(invoiceTotal(d.items))}</span></div>
    </div>
  </div>

  <div class="sec">
    <div class="grid2">
      <div class="head">Terms</div><div class="head">Memo</div>
    </div>
    <div class="grid2 body">
      <div class="kv" style="row-gap:1.2mm">
        <span>Invoice date</span><span>${shortDate(d.invoiceDate)}</span>
        <span>Due date</span><span>${shortDate(d.dueDate)}</span>
        <span>Pay via</span><span>Bank transfer</span>
      </div>
      <div>
        <p>Thank you for working with Muvance Digital. Please use invoice no. ${no} as the payment reference. Ad spend is paid separately through your ad account and is not included in this invoice.</p>
      </div>
    </div>
  </div>

  <div class="sec">
    <div class="grid2">
      <div class="head">Bank transfer</div><div class="head">&nbsp;</div>
    </div>
    <div class="grid2 body">
      <div class="kv" style="row-gap:1.2mm">
        <span>Account name</span><span>STAMPKIT</span>
        <span>Account no.</span><span>20501310100646715</span>
        <span>Branch</span><span>Mirpur</span>
      </div>
      <div></div>
    </div>
  </div>

  <footer>
    <span>Muvance Digital · Invoice ${no}</span>
    <span>Page 1 of 1</span>
  </footer>
</div>
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/* Offer letter                                                        */
/* ------------------------------------------------------------------ */

export function renderOffer(d: OfferData, signatureUrl: string) {
  const name = esc(d.candidateName);
  const designation = esc(d.designation);
  const salary = toNumber(d.monthlySalary);
  const year = (parseDate(d.issueDate) ?? new Date()).getFullYear();
  const responsibilities = lines(d.responsibilities)
    .map((r) => `<li>${esc(r)}</li>`)
    .join('\n    ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(offerFileName(d))}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{ --ink:#171721; --ink-2:#4A4A5A; --muted:#80808F; --line:#E7E7EE; --soft:#F6F6F9; --accent:#5266EB; }
  @page{ size:A4; margin:0; }
  *{ box-sizing:border-box; }
  html,body{ margin:0; background:#fff; }
  body{ font-family:"Inter",-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;
        color:var(--ink-2); font-size:10.5pt; line-height:1.5;
        -webkit-font-smoothing:antialiased; font-feature-settings:"ss01","cv11"; }
  .page{ width:210mm; height:296mm; overflow:hidden; margin:0; background:#fff;
         /* The margins the issued offer letters were printed with (narrower than the template's 20mm). */
         padding:28px 22px; display:flex; flex-direction:column; }

  header{ display:flex; justify-content:space-between; align-items:flex-start; }
  .brand{ display:flex; align-items:center; gap:10px; }
  .mark{ display:flex; align-items:center; }
  .mark .logo{ height:22px; width:auto; display:block; }
  .wordmark{ font-weight:600; font-size:15px; color:var(--ink); letter-spacing:-.01em; }
  .from{ text-align:right; font-size:9pt; color:var(--muted); line-height:1.55; }
  .from strong{ color:var(--ink); font-weight:500; }

  .title{ margin:7mm 0 1mm; font-size:24pt; font-weight:500; color:var(--ink); letter-spacing:-.025em; line-height:1.1; }
  .sub{ color:var(--muted); font-size:10pt; margin:0; }

  .meta{ display:grid; grid-template-columns:repeat(3,1fr); gap:0; margin:6mm 0 5mm;
         border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
  .meta div{ padding:10px 0; }
  .meta div + div{ padding-left:16px; border-left:1px solid var(--line); }
  .label{ display:block; font-size:8pt; font-weight:500; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); margin-bottom:2px; }
  .val{ color:var(--ink); font-weight:500; }

  p{ margin:0 0 3.2mm; }
  .greet{ color:var(--ink); }

  table.terms{ width:100%; border-collapse:collapse; margin:3mm 0 4mm; }
  .terms tr:first-child td{ border-top:1px solid var(--line); }
  .terms td{ padding:6px 0; border-bottom:1px solid var(--line); vertical-align:top; }
  .terms td:first-child{ width:34%; color:var(--muted); }
  .terms td:last-child{ color:var(--ink); }
  .terms tr.total td{ border-bottom:none; padding-top:12px; }
  .terms tr.total td:last-child{ font-weight:600; font-size:12pt; letter-spacing:-.01em; }

  h2{ font-size:8pt; font-weight:500; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); margin:3.5mm 0 1.5mm; }
  ul{ margin:0 0 4mm; padding-left:16px; }
  li{ margin-bottom:1mm; }
  li::marker{ color:var(--accent); }

  .sign{ display:grid; grid-template-columns:1fr 1fr; gap:14mm; margin-top:auto; padding-top:0; }
  .sigbox{ position:relative; height:16mm; border-bottom:1px solid var(--ink); margin-bottom:6px; }
  .sigimg{ position:absolute; bottom:-4mm; height:34mm; z-index:2; left:-2mm; width:auto; }
  .signame{ color:var(--ink); font-weight:500; }
  .sigmeta{ font-size:9pt; color:var(--muted); }
</style>
</head>
<body>
<div class="page">

  <header>
    <div class="brand">
      <div class="mark"><svg class="logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 46" fill="#111111">${LOGO_POLYGONS}</svg></div>
      <div class="wordmark">Muvance Digital</div>
    </div>
    <div class="from">
      <strong>Muvance Digital</strong><br>
      House 22, Road 2A, Nikunja 2<br>
      Khilkhet, Dhaka<br>
      muvance.com<br>
      <span style="color:var(--accent)">Private &amp; Confidential</span>
    </div>
  </header>

  <div class="title">Offer of Employment</div>
  <p class="sub">${designation}</p>

  <div class="meta">
    <div><span class="label">Issued to</span><span class="val">${name}</span></div>
    <div><span class="label">Date of issue</span><span class="val">${longDate(d.issueDate)}</span></div>
    <div><span class="label">Reference</span><span class="val">${esc(d.referenceNo)}</span></div>
  </div>

  <p class="greet">Dear ${esc(d.candidateFirstName)},</p>
  <p>We are pleased to offer you the position of <strong style="color:var(--ink);font-weight:500">${designation}</strong> at Muvance Digital. The terms of this offer are set out below.</p>

  <table class="terms">
    <tbody>
      <tr><td>Position</td><td>${designation}</td></tr>
      <tr><td>Reports to</td><td>${esc(d.reportsTo)}</td></tr>
      <tr><td>Date of joining</td><td>${longDate(d.joiningDate)}</td></tr>
      <tr><td>Working days</td><td>${esc(d.workingDays)}</td></tr>
      <tr><td>Office hours</td><td>${esc(d.officeHours)}</td></tr>
      <tr><td>Probation</td><td>${esc(d.probation)}</td></tr>
      <tr class="total"><td>Monthly salary (gross)</td><td>BDT ${money0.format(salary)}</td></tr>
    </tbody>
  </table>

  ${
    responsibilities
      ? `<h2>Your responsibilities</h2>
  <ul>
    ${responsibilities}
  </ul>`
      : ''
  }

  <h2>Terms</h2>
  <p>Your salary will be paid monthly, subject to applicable tax deductions. During probation, either party may end employment with 7 days' written notice; after confirmation, the notice period is 30 days. You will be expected to keep all client and company information confidential during and after your employment. All other terms follow company policy.</p>

  <p>Please confirm your acceptance by signing below and returning a copy by <strong style="color:var(--ink);font-weight:500">${longDate(d.acceptByDate)}</strong>. We look forward to welcoming you to the team.</p>

  <div class="sign">
    <div>
      <div class="sigbox"><img class="sigimg" alt="Signature of Alvi Noman" src="${esc(signatureUrl)}"></div>
      <div class="signame">Alvi Noman</div>
      <div class="sigmeta">Chief Executive Officer, Muvance Digital</div>
    </div>
    <div>
      <div class="sigbox"></div>
      <div class="signame">${name}</div>
      <div class="sigmeta">Accepted on: ____ / ____ / ${year}</div>
    </div>
  </div>

</div>
</body>
</html>`;
}

export const invoiceFileName = (d: InvoiceData) => `Invoice-${d.invoiceNo.trim() || 'draft'}`;

export const offerFileName = (d: OfferData) =>
  `Offer_Letter_${d.candidateName.trim().replace(/\s+/g, '_') || 'draft'}`;
