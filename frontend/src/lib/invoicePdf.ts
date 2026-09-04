import jsPDF from "jspdf";

export interface InvoicePdfParams {
  invoice: any;
  customer?: any;
  order?: any;
  business?: any;
}

export function generateInvoicePDF({ invoice, customer, order, business }: InvoicePdfParams) {
  const doc = new jsPDF("p", "mm", "a4");

  const shopName = business?.name?.trim() || "TailorPro Boutique";
  const shopPhone = business?.phone?.trim() || "";
  const shopEmail = business?.email?.trim() || "";
  const shopAddress = business?.address?.trim() || "";
  const shopGst = business?.gst_number?.trim() || "";

  // Styling palette
  const primaryColor: [number, number, number] = [15, 23, 42];    // Slate 900
  const brandColor: [number, number, number]   = [14, 165, 233];  // Sky 500
  const mutedColor: [number, number, number]   = [100, 116, 139]; // Slate 500
  const lightBg: [number, number, number]      = [248, 250, 252]; // Slate 50
  const darkGreen: [number, number, number]    = [16, 185, 129];  // Emerald 500
  const darkRed: [number, number, number]      = [239, 68, 68];   // Rose 500

  // Top decorative bar
  doc.setFillColor(...brandColor);
  doc.rect(0, 0, 210, 5, "F");

  let y = 20;

  // Header: Shop Name and Invoice Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.text(shopName, 15, y);

  doc.setFontSize(24);
  doc.setTextColor(...brandColor);
  doc.text("INVOICE", 195, y, { align: "right" });

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);

  const shopLines: string[] = [];
  if (shopAddress) shopLines.push(shopAddress);
  const contact = [shopPhone ? `Phone: ${shopPhone}` : "", shopEmail ? `Email: ${shopEmail}` : ""].filter(Boolean).join("  |  ");
  if (contact) shopLines.push(contact);
  if (shopGst) shopLines.push(`GSTIN: ${shopGst}`);

  shopLines.forEach((line) => {
    doc.text(line, 15, y);
    y += 4.5;
  });

  // Invoice Meta
  const invCode = invoice.invoice_number || `INV-${String(invoice.id).padStart(4, "0")}`;
  const invDate = invoice.created_at

    ? new Date(invoice.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  let metaY = 26;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text(`Invoice #: ${invCode}`, 195, metaY, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  metaY += 5;
  doc.text(`Date: ${invDate}`, 195, metaY, { align: "right" });

  if (order?.order_code) {
    metaY += 5;
    doc.text(`Order Code: ${order.order_code}`, 195, metaY, { align: "right" });
  }

  y = Math.max(y + 6, metaY + 10);

  // Horizontal divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, y, 195, y);
  y += 8;

  // Bill To / Customer details
  doc.setFillColor(...lightBg);
  doc.roundedRect(15, y, 180, 26, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...brandColor);
  doc.text("BILLED TO:", 20, y + 6);

  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text(customer?.name || "Valued Customer", 20, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  const custContact = [customer?.phone, customer?.email].filter(Boolean).join("  •  ");
  if (custContact) {
    doc.text(custContact, 20, y + 17);
  }
  if (customer?.address) {
    doc.text(customer.address, 20, y + 22);
  }

  y += 34;

  // Items Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y, 180, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text("ITEM / DESCRIPTION", 20, y + 5.5);
  doc.text("ORDER REF", 115, y + 5.5);
  doc.text("AMOUNT (INR)", 190, y + 5.5, { align: "right" });

  y += 8;

  // Item Row
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);

  const desc = order?.description || invoice.notes || "Tailoring & Bespoke Stitching Service";
  doc.text(desc, 20, y + 6);

  doc.setTextColor(...mutedColor);
  doc.setFontSize(9);
  doc.text(order?.order_code || `#${invoice.order_id}`, 115, y + 6);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.text(`Rs. ${Number(invoice.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 190, y + 6, { align: "right" });

  y += 12;
  doc.setDrawColor(241, 245, 249);
  doc.line(15, y, 195, y);
  y += 6;

  // Payments History Breakdown
  const payments = invoice.payments || [];
  const paidAmount = invoice.paid_amount ?? payments.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);
  const remaining = invoice.remaining_amount ?? Math.max(0, invoice.amount - paidAmount);

  if (payments.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...brandColor);
    doc.text("PAYMENTS RECORDED:", 15, y + 4);
    y += 7;

    payments.forEach((p: any, idx: number) => {
      doc.setFillColor(...lightBg);
      doc.roundedRect(15, y, 105, 7, 1, 1, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...mutedColor);
      const pDate = p.payment_date
        ? new Date(p.payment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "Recorded";
      const pMethod = (p.payment_type || "cash").toUpperCase();
      const pRef = p.reference ? ` (${p.reference})` : "";
      doc.text(`${idx + 1}. ${pDate} • ${pMethod}${pRef}`, 18, y + 5);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...darkGreen);
      doc.text(`+ Rs. ${Number(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 115, y + 5, { align: "right" });

      y += 8.5;
    });
  }

  // Totals Box (right aligned)
  const totalsY = Math.max(y, 140);
  doc.setFillColor(...lightBg);
  doc.roundedRect(125, totalsY, 70, 36, 2, 2, "F");

  let tY = totalsY + 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text("Subtotal:", 130, tY);
  doc.text(`Rs. ${Number(invoice.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 190, tY, { align: "right" });

  tY += 8;
  doc.text("Total Paid:", 130, tY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkGreen);
  doc.text(`Rs. ${Number(paidAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 190, tY, { align: "right" });

  tY += 8;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedColor);
  doc.text("Remaining Balance:", 130, tY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(remaining > 0 ? darkRed[0] : darkGreen[0], remaining > 0 ? darkRed[1] : darkGreen[1], remaining > 0 ? darkRed[2] : darkGreen[2]);
  doc.text(`Rs. ${Number(remaining).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 190, tY, { align: "right" });

  tY += 8;
  doc.setDrawColor(226, 232, 240);
  doc.line(130, tY - 2, 190, tY - 2);

  // Status Stamp
  const statusStr = remaining <= 0 ? "PAID IN FULL" : (paidAmount > 0 ? "PARTIALLY PAID" : "UNPAID");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  if (remaining <= 0) {
    doc.setTextColor(...darkGreen);
  } else {
    doc.setTextColor(...darkRed);
  }
  doc.text(statusStr, 130, tY + 2);

  // Footer notes & Thank you
  const footerY = 270;
  doc.setDrawColor(226, 232, 240);
  doc.line(15, footerY - 5, 195, footerY - 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedColor);
  doc.text("Thank you for choosing us for your tailoring needs! We look forward to creating your next design.", 105, footerY, { align: "center" });

  const footerContact = [shopName, shopPhone, shopEmail].filter(Boolean).join("  •  ");
  doc.setFontSize(7.5);
  doc.text(footerContact, 105, footerY + 5, { align: "center" });
  doc.text("Powered by TailorPro ERP", 105, footerY + 9, { align: "center" });

  // Save the PDF
  doc.save(`Invoice_${invCode}.pdf`);
}
