import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import A4Invoice from './A4Invoice';
import A5Invoice from './A5Invoice';

const ViewInvoice = ({ business, showToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paperSize, setPaperSize] = useState('A4'); // Default to A4
  const invoice = business.invoices.find(i => i.id === id);

  if (!invoice) return <p className="error-message">Invoice not found</p>;

  const handleDuplicate = (invoice) => {
    const newInvoice = {
      ...invoice,
      id: crypto.randomUUID(),
      number: `${business.settings.invoicePrefix || 'INV'}-${business.lastInvoiceNumber + 1}`,
      date: new Date().toISOString(),
      paid: false
    };
    navigate('/create-invoice', { state: { invoice: newInvoice } });
  };

  // Utility for amount in words
  const numberToWords = (num) => {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const convert = (n) => {
      if (n < 20) return a[n];
      let s = b[Math.floor(n / 10)];
      if (n % 10 > 0) s += '-' + a[n % 10];
      return s;
    };

    const g = (n) => {
      if (n === 0) return '';
      let res = '';
      if (n > 99) {
        res += a[Math.floor(n / 100)] + 'hundred ';
        n %= 100;
      }
      if (n > 0) {
        if (res !== '') res += 'and ';
        res += convert(n);
      }
      return res;
    };

    let n = Math.floor(num);
    let str = '';
    if (n === 0) str = 'zero';
    if (n >= 10000000) { str += g(Math.floor(n / 10000000)) + 'crore '; n %= 10000000; }
    if (n >= 100000) { str += g(Math.floor(n / 100000)) + 'lakh '; n %= 100000; }
    if (n >= 1000) { str += g(Math.floor(n / 1000)) + 'thousand '; n %= 1000; }
    str += g(n);

    const paisa = Math.round((num - Math.floor(num)) * 100);
    let final = 'INR ' + str.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    if (paisa > 0) {
      const paisaWords = convert(paisa);
      final += ' and ' + (paisaWords || 'zero') + ' Paisa';
    }
    return final + ' Only';
  };

  // Calculations (INCLUSIVE GST LOGIC)
  const subtotal = (invoice.items || []).reduce((sum, item) => {
    const qty = parseFloat(item.quantity || 1);
    const price = parseFloat(item.price || 0);
    const disc = parseFloat(item.discountPercent || 0) / 100;
    const discountedPrice = price * (1 - disc);
    const taxRate = parseFloat(item.gstPercent || 0) / 100;
    const taxablePrice = discountedPrice / (1 + taxRate);
    return sum + (taxablePrice * qty);
  }, 0);

  const totalTax = (invoice.items || []).reduce((sum, item) => {
    const qty = parseFloat(item.quantity || 1);
    const price = parseFloat(item.price || 0);
    const disc = parseFloat(item.discountPercent || 0) / 100;
    const discountedPrice = price * (1 - disc);
    const taxRate = parseFloat(item.gstPercent || 0) / 100;
    const taxablePrice = discountedPrice / (1 + taxRate);
    const taxAmt = discountedPrice - taxablePrice;
    return sum + (taxAmt * qty);
  }, 0);

  const totalDiscount = (invoice.items || []).reduce((sum, item) => {
    const qty = parseFloat(item.quantity || 1);
    const price = parseFloat(item.price || 0);
    const disc = parseFloat(item.discountPercent || 0) / 100;
    return sum + (price * disc * qty);
  }, 0);

  const grandTotal = subtotal + totalTax;

  const chunkItems = (items, size) => {
    const chunks = [];
    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }
    return chunks.length ? chunks : [[]];
  };

  const a5Chunks = chunkItems(invoice.items || [], 12);
  const a4Chunks = chunkItems(invoice.items || [], 15);

  const handleSavePdf = async () => {
    const targetPaperSize = 'A5';
    if (paperSize !== targetPaperSize) {
      setPaperSize(targetPaperSize);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const safeInvoiceNumber = String(invoice.number || 'invoice').replace(/[\\/:*?"<>|]/g, '-');
    const result = await window.electronAPI.saveInvoicePdf({
      paperSize: targetPaperSize,
      fileName: `${safeInvoiceNumber}.pdf`
    });

    if (result?.error) {
      showToast?.(`Failed to save PDF: ${result.error}`, 'error');
      return;
    }

    if (!result?.canceled) {
      showToast?.('Invoice PDF saved successfully!');
    }
  };

  return (
    <div className="view-invoice" style={{ padding: '20px', backgroundColor: '#f3f4f6', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <style>
        {`
          @media screen {
            .invoice-container {
              transition: all 0.3s ease;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
              background: #fff;
            }
          }

          @media print {
            @page { 
              size: ${paperSize === 'A5' ? '210mm 148mm' : 'A4 portrait'}; 
              margin: 0 !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              user-select: text !important;
              -webkit-user-select: text !important;
              transition: none !important;
              animation: none !important;
              box-shadow: none !important;
              text-shadow: none !important;
              border-radius: 0 !important;
              filter: none !important;
              -webkit-filter: none !important;
            }
            html, body {
              width: 100% !important;
              height: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background-color: #fff !important;
            }
            .view-invoice {
              display: block !important;
              padding: 0 !important;
              margin: 0 !important;
              min-height: auto !important;
              background: #fff !important;
            }
            .invoice-container {
              transform: none !important;
              margin: 0 !important;
              width: ${paperSize === 'A5' ? '210mm' : '210mm'} !important;
              height: ${paperSize === 'A5' ? '148mm' : '297mm'} !important;
              page-break-after: always !important;
              break-after: page !important;
              page-break-inside: avoid !important;
            }
            .invoice-container:last-child {
              page-break-after: auto !important;
              break-after: auto !important;
            }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <div className="actions no-print" style={{ marginBottom: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button className="edit-btn" onClick={() => navigate('/create-invoice', { state: { invoice } })}>Edit</button>
        <button className="duplicate-btn" onClick={() => handleDuplicate(invoice)}>Duplicate</button>
        <button
          className="paper-size-btn"
          onClick={() => setPaperSize(paperSize === 'A4' ? 'A5' : 'A4')}
          style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold' }}
        >
          📄 {paperSize === 'A4' ? 'Show A5 Landscape' : 'Show A4 Portrait'}
        </button>
        <button className="print-btn" onClick={handleSavePdf} style={{ background: '#000', color: 'white', border: 'none' }}>Save A5 PDF</button>
      </div>

      {paperSize === 'A5' ? (
        <A5Invoice
          invoice={invoice}
          business={business}
          chunks={a5Chunks}
          subtotal={subtotal}
          totalTax={totalTax}
          grandTotal={grandTotal}
          totalDiscount={totalDiscount}
          numberToWords={numberToWords}
        />
      ) : (
        <A4Invoice
          invoice={invoice}
          business={business}
          chunks={a4Chunks}
          subtotal={subtotal}
          totalTax={totalTax}
          grandTotal={grandTotal}
          totalDiscount={totalDiscount}
          numberToWords={numberToWords}
        />
      )}
    </div>
  );
};

export default ViewInvoice;
