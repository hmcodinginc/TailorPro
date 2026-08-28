import re

with open('frontend/src/pages/Invoices.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_dialog = '''
      {/* Preview Dialog */}
      <Dialog
        open={!!previewInvoice}
        onOpenChange={(open) => { if (!open) setPreviewInvoice(null); }}
      >
        <DialogContent className="max-w-[800px] print:max-w-none print:w-full print:p-0 print:m-0 print:border-none print:shadow-none bg-gray-50 border-gray-200">
          <DialogHeader className="print:hidden flex flex-row justify-between items-center w-full">
            <DialogTitle>Invoice Preview</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => {
                const element = document.getElementById('printable-invoice');
                if (!element) return;
                import('html2canvas').then((html2canvas) => {
                  html2canvas.default(element, { scale: 2 }).then((canvas) => {
                    const imgData = canvas.toDataURL('image/png');
                    import('jspdf').then((jsPDF) => {
                      const pdf = new jsPDF.default('p', 'mm', 'a4');
                      const pdfWidth = pdf.internal.pageSize.getWidth();
                      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                      pdf.save(`Invoice_INV-${previewInvoice?.id.toString().padStart(4, '0')}.pdf`);
                    });
                  });
                });
              }}>
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
              <Button size="sm" onClick={() => window.print()} className="gap-2">
                <Printer className="w-4 h-4 mr-2" /> Print Invoice
              </Button>
            </div>
          </DialogHeader>
          
          <div className="overflow-auto max-h-[80vh] flex justify-center print:overflow-visible">
          {previewInvoice && (() => {
            const customer = getCustomer(previewInvoice.customer_id);
            const order = getOrder(previewInvoice.order_id);
            const isPaid = previewInvoice.status === 'paid';
            const purpleColor = "#925488"; // Matches the Lilly's Closet theme
            
            return (
              <div 
                id="printable-invoice" 
                className="bg-white text-black shadow-sm border print:border-none print:shadow-none mx-auto relative overflow-hidden flex flex-col font-sans"
                style={{ width: '210mm', minHeight: '297mm', position: 'relative' }}
              >
                {/* Background Floral SVGs (approximations using simple curved paths) */}
                <svg className="absolute top-0 left-0 w-72 h-72 opacity-10 pointer-events-none" style={{ color: purpleColor, transform: 'translate(-20%, -20%)' }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M50 50 C 20 0, 0 20, 50 50 C 80 0, 100 20, 50 50 C 100 80, 80 100, 50 50 C 0 80, 20 100, 50 50" />
                  <path d="M50 50 C 10 20, 10 80, 50 50 C 90 20, 90 80, 50 50 C 20 10, 80 10, 50 50 C 20 90, 80 90, 50 50" />
                </svg>
                <svg className="absolute bottom-10 right-0 w-96 h-96 opacity-10 pointer-events-none" style={{ color: purpleColor, transform: 'translate(20%, 20%)' }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                  <path d="M50 50 C 20 0, 0 20, 50 50 C 80 0, 100 20, 50 50 C 100 80, 80 100, 50 50 C 0 80, 20 100, 50 50" />
                  <path d="M50 50 C 10 20, 10 80, 50 50 C 90 20, 90 80, 50 50 C 20 10, 80 10, 50 50 C 20 90, 80 90, 50 50" />
                </svg>

                <div className="flex-1 p-14 relative z-10 pt-16">
                  {/* Header */}
                  <div className="flex justify-end items-start mb-20">
                    <div className="text-right">
                      <h1 className="text-5xl font-[cursive] mb-1" style={{ color: purpleColor, fontFamily: "'Brush Script MT', 'Comic Sans MS', cursive" }}>{business?.name || "Tailor Studio"}</h1>
                      <h2 className="text-2xl font-bold tracking-[0.2em] uppercase" style={{ color: '#63395b' }}>INVOICE</h2>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-8 mb-12">
                    <div>
                      <div className="font-bold text-sm uppercase mb-3" style={{ color: purpleColor }}>BILL TO:</div>
                      <div className="text-gray-700 text-sm space-y-1.5">
                        <div className="font-bold text-gray-900">{customer?.name}</div>
                        {customer?.address && <div>{customer.address}</div>}
                        {customer?.phone && <div>{customer.phone}</div>}
                        {customer?.email && <div>{customer.email}</div>}
                      </div>
                    </div>
                    
                    <div className="space-y-3 w-3/4 ml-auto">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold uppercase text-xs tracking-wider" style={{ color: purpleColor }}>INVOICE #:</span>
                        <span className="text-gray-600">{previewInvoice.id.toString().padStart(4, '0')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-bold uppercase text-xs tracking-wider" style={{ color: purpleColor }}>Issue Date:</span>
                        <span className="text-gray-600">{format(new Date(previewInvoice.created_at), 'MM/dd/yyyy')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-bold uppercase text-xs tracking-wider" style={{ color: purpleColor }}>Due Date:</span>
                        <span className="text-gray-600">{order?.due_date ? format(new Date(order.due_date), 'MM/dd/yyyy') : format(new Date(previewInvoice.created_at), 'MM/dd/yyyy')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <table className="w-full mb-16 border-collapse">
                    <thead>
                      <tr className="text-xs uppercase tracking-wider">
                        <th className="p-3 border border-gray-400 text-left font-bold" style={{ color: purpleColor }}>Description</th>
                        <th className="p-3 border border-gray-400 text-center font-bold w-20" style={{ color: purpleColor }}>QTY</th>
                        <th className="p-3 border border-gray-400 text-center font-bold w-32" style={{ color: purpleColor }}>Price</th>
                        <th className="p-3 border border-gray-400 text-center font-bold w-32" style={{ color: purpleColor }}>Total</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700">
                      <tr className="h-10">
                        <td className="p-3 border border-gray-400">
                          {order?.description || "Custom Tailoring Service"}
                          {order?.garment_type && ` - ${order.garment_type}`}
                        </td>
                        <td className="p-3 border border-gray-400 text-center font-medium">1</td>
                        <td className="p-3 border border-gray-400 text-center font-medium">₹{previewInvoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td className="p-3 border border-gray-400 text-center font-medium">₹{previewInvoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      </tr>
                      {/* Empty rows to match style */}
                      <tr className="h-10"><td className="border border-gray-400"></td><td className="border border-gray-400"></td><td className="border border-gray-400"></td><td className="border border-gray-400"></td></tr>
                      <tr className="h-10"><td className="border border-gray-400"></td><td className="border border-gray-400"></td><td className="border border-gray-400"></td><td className="border border-gray-400"></td></tr>
                      <tr className="h-10"><td className="border border-gray-400"></td><td className="border border-gray-400"></td><td className="border border-gray-400"></td><td className="border border-gray-400"></td></tr>
                    </tbody>
                  </table>

                  {/* Payment & Totals */}
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="font-bold text-sm uppercase mb-4" style={{ color: purpleColor }}>PAYMENT INFORMATION:</div>
                      <div className="text-gray-700 text-sm space-y-2">
                        {business?.gst_number && <div><span className="font-bold text-gray-900">GST:</span> {business.gst_number}</div>}
                        <div><span className="font-bold text-gray-900">Payment Method:</span> <span className="capitalize">{previewInvoice.payment_type}</span></div>
                        <div><span className="font-bold text-gray-900">Status:</span> <span className="uppercase">{previewInvoice.status}</span></div>
                        {previewInvoice.notes && <div className="mt-2 text-gray-500 italic">{previewInvoice.notes}</div>}
                      </div>
                    </div>
                    <div className="space-y-3 w-3/4 ml-auto">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold uppercase text-xs tracking-wider" style={{ color: purpleColor }}>Subtotal</span>
                        <span className="text-gray-800 font-medium">₹{previewInvoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-bold uppercase text-xs tracking-wider" style={{ color: purpleColor }}>Tax</span>
                        <span className="text-gray-800 font-medium">0%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-bold uppercase text-xs tracking-wider" style={{ color: purpleColor }}>Deposit</span>
                        <span className="text-gray-800 font-medium">{isPaid ? `₹${previewInvoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}` : '0'}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-200">
                        <span className="font-bold uppercase text-xs tracking-wider" style={{ color: purpleColor }}>Balance</span>
                        <span className="text-gray-800 font-bold">₹{isPaid ? "0.00" : previewInvoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="py-5 px-14 flex justify-between text-xs w-full mt-auto relative z-10 text-white" style={{ backgroundColor: '#ad679f' }}>
                  <div>{business?.email || "tailor@example.com"}</div>
                  <div>www.tailorpro.com</div>
                  <div>{business?.phone || "(555) 555-5555"}</div>
                </div>
              </div>
            );
          })()}
          </div>
        </DialogContent>
      </Dialog>
'''

content = re.sub(r'\{\/\* Preview Dialog \*\/\}.*?<\/Dialog>', new_dialog, content, flags=re.DOTALL)

with open('frontend/src/pages/Invoices.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
