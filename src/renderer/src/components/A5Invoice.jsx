import React from 'react';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

const cellBorder = '1.5px solid #000';

const A5Invoice = ({ invoice, business, chunks, subtotal, totalTax, grandTotal, totalDiscount, numberToWords }) => {
  void totalDiscount;

  const settings = business.settings || {};
  const customer = invoice.customer || {};
  const invoiceNumber = invoice.number || '';
  const MAX_ITEMS_PER_PAGE = 12;

  return (
    <>
      {chunks.map((chunk, pageIdx) => (
        <div
          key={pageIdx}
          className="invoice-container"
          style={{
            width: '210mm',
            height: '148mm',
            margin: '0 auto 8mm',
            backgroundColor: '#fff',
            color: '#000',
            border: '2px solid #000',
            fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            fontSize: '13px',
            lineHeight: 1.15,
            position: 'relative',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.15fr 1fr',
              alignItems: 'center',
              height: '8.5mm',
              borderBottom: '2px solid #000',
              fontSize: '16px',
              fontWeight: 700,
              textAlign: 'center',
              letterSpacing: '0.02em'
            }}
          >
            <div>TAX INVOICE</div>
            <div>
              INVOICENO:{invoiceNumber}
              {chunks.length > 1 ? ` (${pageIdx + 1}/${chunks.length})` : ''}
            </div>
            <div>DATE:{formatDate(invoice.date)}</div>
          </div>

          {/* Business & Customer Info (Flex Vertical Space Filling) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              height: '30mm',
              borderBottom: '2px solid #000'
            }}
          >
            <div style={{ padding: '2.5mm 4mm', borderRight: '2px solid #000', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '21px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.01em', lineHeight: 1.1 }}>
                  {settings.name}
                </div>
                <div style={{ fontSize: '13.5px', lineHeight: 1.25, marginTop: '1.5mm', textTransform: 'uppercase', fontWeight: 500 }}>
                  {settings.address}
                  {settings.city ? `, ${settings.city}` : ''}
                  {settings.state ? `, ${settings.state}` : ''}
                  {settings.pincode ? ` - ${settings.pincode}` : ''}
                </div>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.01em', marginTop: '1.5mm' }}>
                MOBILE NO: {settings.phoneNumber || 'N/A'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;GSTIN: {settings.gstin || 'N/A'}
              </div>
            </div>

            <div style={{ padding: '2.5mm 4mm', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.01em', lineHeight: 1.1 }}>{customer.shopName}</div>
                <div style={{ fontSize: '13.5px', lineHeight: 1.25, marginTop: '1.5mm', textTransform: 'uppercase', fontWeight: 500 }}>
                  {customer.address}
                  {customer.city ? `, ${customer.city}` : ''}
                  {customer.state ? `, ${customer.state}` : ''}
                </div>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.01em', marginTop: '1.5mm' }}>
                GSTIN: {customer.gstNumber || 'CASH BILL'}{customer.phoneNumber ? `\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0MOB: ${customer.phoneNumber}` : ''}
              </div>
            </div>
          </div>

          {/* Table */}
          <table
            style={{
              width: '100%',
              flex: 1,
              borderCollapse: 'collapse',
              tableLayout: 'fixed',
              margin: 0,
              color: '#000'
            }}
          >
            <colgroup>
              <col style={{ width: '7mm' }} />
              <col style={{ width: '18mm' }} />
              <col style={{ width: '49mm' }} />
              <col style={{ width: '18mm' }} />
              <col style={{ width: '18mm' }} />
              <col style={{ width: '11mm' }} />
              <col style={{ width: '18mm' }} />
              <col style={{ width: '12mm' }} />
              <col style={{ width: '10mm' }} />
              <col style={{ width: '21mm' }} />
            </colgroup>
            <thead>
              <tr style={{ height: '7mm', borderBottom: '2px solid #000' }}>
                {['#', 'NETRATE', 'ITEMNAME', 'HSN', 'MRP', 'QTY', 'RATE', 'DISC%', 'GST', 'T.AMT'].map(
                  (header, index) => (
                    <th
                      key={header}
                      style={{
                        padding: '0.5mm',
                        borderRight: index === 9 ? 'none' : cellBorder,
                        background: '#d9d9d9',
                        color: '#000',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        letterSpacing: '0.01em'
                      }}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {chunk.map((item, idx) => {
                const qty = parseFloat(item.quantity || 1);
                const grossPrice = parseFloat(item.price || 0);
                const discount = parseFloat(item.discountPercent || 0) / 100;
                const unitInclusive = grossPrice * (1 - discount);
                const taxRate = parseFloat(item.gstPercent || 0) / 100;
                const unitTaxable = unitInclusive / (1 + taxRate);
                const totalInclusive = unitInclusive * qty;

                return (
                  <tr key={idx} style={{ height: '5.2mm', verticalAlign: 'middle' }}>
                    <td style={styles.rowNumber}>{pageIdx * MAX_ITEMS_PER_PAGE + idx + 1}</td>
                    <td style={styles.numberCell}>{unitInclusive.toFixed(2)}</td>
                    <td style={styles.itemCell}>{String(item.name || '').toUpperCase()}</td>
                    <td style={styles.centerCell}>{item.hsnCode || item.hsn || ''}</td>
                    <td style={styles.numberCell}>{Number(item.mrp || 0).toFixed(2)}</td>
                    <td style={styles.centerCell}>{qty} {item.unit || ''}</td>
                    <td style={styles.numberCell}>{unitTaxable.toFixed(2)}</td>
                    <td style={styles.centerCell}>
                      {discount > 0 ? `${parseFloat(item.discountPercent || 0)}%` : '-'}
                    </td>
                    <td style={styles.centerCell}>{parseFloat(item.gstPercent || 0)}%</td>
                    <td style={styles.totalCell}>{totalInclusive.toFixed(2)}</td>
                  </tr>
                );
              })}
              {[...Array(Math.max(0, MAX_ITEMS_PER_PAGE - chunk.length))].map((_, idx) => (
                <tr
                  key={`spacer-${idx}`}
                  style={{
                    height: '5.2mm',
                    verticalAlign: 'middle'
                  }}
                >
                  <td style={styles.emptyCell}></td>
                  <td style={styles.emptyCell}></td>
                  <td style={styles.emptyCell}></td>
                  <td style={styles.emptyCell}></td>
                  <td style={styles.emptyCell}></td>
                  <td style={styles.emptyCell}></td>
                  <td style={styles.emptyCell}></td>
                  <td style={styles.emptyCell}></td>
                  <td style={styles.emptyCell}></td>
                  <td style={{ borderRight: 'none', verticalAlign: 'middle', textAlign: 'center' }}></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer Section */}
          <div style={{ marginTop: 'auto', borderTop: '2px solid #000' }}>
            {pageIdx === chunks.length - 1 ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', minHeight: '17mm' }}>
                  <div
                    style={{
                      borderRight: '2px solid #000',
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: '0 0 1.5mm 2.5mm',
                      fontSize: '13px',
                      fontWeight: 700
                    }}
                  >
                    BUYER SIGNATURE
                  </div>
                  <div style={{ padding: '1.5mm 2.5mm 0', fontSize: '13px', fontWeight: 700 }}>
                    <div style={styles.totalRow}>
                      <span>TAXABLE VALUE:</span>
                      <span>{subtotal.toFixed(2)}</span>
                    </div>
                    <div style={styles.totalRow}>
                      <span>CGST VALUE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</span>
                      <span>{(totalTax / 2).toFixed(2)}</span>
                    </div>
                    <div style={styles.totalRow}>
                      <span>SGST VALUE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</span>
                      <span>{(totalTax / 2).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: '2px solid #000',
                    display: 'grid',
                    gridTemplateColumns: '1fr 60mm',
                    alignItems: 'center',
                    minHeight: '8.5mm',
                    padding: '0.5mm 2.5mm',
                    fontSize: '13px',
                    fontWeight: 700
                  }}
                >
                  <div style={{ fontSize: '13px' }}>INR: {numberToWords(grandTotal)}</div>
                  <div style={{ textAlign: 'right', fontSize: '18px', fontWeight: 700 }}>GRAND TOTAL&nbsp;&nbsp; {grandTotal.toFixed(2)}</div>
                </div>

                {(settings.bankName || settings.accountNumber || settings.ifscCode) && (
                  <div
                    style={{
                      borderTop: '1.5px solid #000',
                      padding: '0.5mm 2.5mm',
                      minHeight: '6mm',
                      fontSize: '11.5px',
                      fontWeight: 600
                    }}
                  >
                    BANK NAME: {settings.bankName} | A/C NO: {settings.accountNumber} | IFSC CODE:{' '}
                    {settings.ifscCode}
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: '4mm', textAlign: 'center', fontSize: '13px', fontWeight: 700 }}>
                Continued on next page...
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

const styles = {
  rowNumber: {
    borderRight: cellBorder,
    padding: '0 0.5mm',
    textAlign: 'center',
    fontSize: '14.5px',
    fontWeight: 500,
    color: '#000',
    verticalAlign: 'middle',
    lineHeight: 1.05
  },
  numberCell: {
    borderRight: cellBorder,
    padding: '0 0.5mm',
    textAlign: 'center',
    fontSize: '14.5px',
    fontWeight: 500,
    color: '#000',
    verticalAlign: 'middle',
    lineHeight: 1.05
  },
  itemCell: {
    borderRight: cellBorder,
    padding: '0 0.5mm',
    textAlign: 'center',
    fontSize: '14.5px',
    fontWeight: 500,
    color: '#000',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    verticalAlign: 'middle',
    lineHeight: 1.05
  },
  centerCell: {
    borderRight: cellBorder,
    padding: '0 0.5mm',
    textAlign: 'center',
    fontSize: '14.5px',
    fontWeight: 500,
    color: '#000',
    verticalAlign: 'middle',
    lineHeight: 1.05
  },
  totalCell: {
    padding: '0 0.5mm',
    textAlign: 'center',
    fontSize: '14.5px',
    fontWeight: 500,
    color: '#000',
    verticalAlign: 'middle',
    lineHeight: 1.05
  },
  emptyCell: {
    borderRight: cellBorder,
    textAlign: 'center',
    verticalAlign: 'middle'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid #000',
    padding: '0 0 0.5mm',
    marginBottom: '0.5mm'
  }
};

export default A5Invoice;
