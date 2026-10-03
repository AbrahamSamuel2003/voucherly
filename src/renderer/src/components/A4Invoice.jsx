import React from 'react';

const A4Invoice = ({ invoice, business, chunks, subtotal, totalTax, grandTotal, totalDiscount, numberToWords }) => {
  return (
    <>
      {chunks.map((chunk, pageIdx) => (
        <div key={pageIdx} className="invoice-container" style={{
          width: '210mm',
          height: '297mm',
          margin: '0 auto 50px auto',
          backgroundColor: '#fff',
          color: '#000',
          border: '3px solid #000',
          fontFamily: "'Times New Roman', Times, serif",
          fontSize: '12px',
          lineHeight: '1.1',
          position: 'relative',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Header Row - Compressed */}
            <div style={{ display: 'flex', borderBottom: '2px solid #000' }}>
              <div style={{ flex: 1.5, padding: '12px 12px', borderRight: '2px solid #000', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ border: '1px solid #eee', padding: '3px' }}>
                  {business.settings.logo && <img src={business.settings.logo} alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />}
                </div>
                <div>
                  <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: 'bold' }}>{business.settings.name}</h1>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', lineHeight: '1.2' }}>
                    <div>{business.settings.address}</div>
                    <div>{business.settings.city}, {business.settings.state} - {business.settings.pincode}</div>
                    <div style={{ marginTop: '3px' }}>MOBILENO: {business.settings.phoneNumber}</div>
                  </div>
                </div>
              </div>
              <div style={{ flex: 0.8, display: 'flex', flexDirection: 'column' }}>
                <div style={{ borderBottom: '1.5px solid #000', padding: '4px 10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '11px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '10px', height: '10px', border: '1.5px solid #000' }}></div> ORIGINAL
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '10px', height: '10px', border: '1.5px solid #000' }}></div> DUPLICATE
                  </label>
                </div>
                <div style={{ borderBottom: '1.5px solid #000', padding: '4px 10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>GSTIN</span><span>: {business.settings.gstin || '----------------'}</span>
                </div>
                <div style={{ borderBottom: '1.5px solid #000', padding: '4px 10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
                  <span>Invoice No.</span><span>:{invoice.number.replace(`${business.settings.invoicePrefix || 'INV'}-`, '')}</span>
                </div>
                <div style={{ padding: '4px 10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
                  <span>Date</span><span>:{new Date(invoice.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')}</span>
                </div>
              </div>
            </div>

            {/* Pill Section: Tax Invoice */}
            <div style={{ padding: '8px 0', textAlign: 'center' }}>
              <span style={{ border: '2px solid #000', borderRadius: '25px', padding: '2px 50px', fontSize: '16px', fontWeight: 'bold' }}>Tax Invoice</span>
            </div>

            {/* Receiver & Supply Details */}
            <div style={{ display: 'flex', borderBottom: '2px solid #000', borderTop: '2px solid #000' }}>
              <div style={{ flex: 1.2, padding: '6px 12px', borderRight: '2px solid #000' }}>
                <div style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '3px', fontSize: '11px' }}>Details of Receiver (Billed to)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '70px 10px 1fr', gap: '2px', fontSize: '12px', fontWeight: 'bold' }}>
                  <span>Billed to</span><span>:</span><span style={{ fontSize: '14px' }}>{invoice.customer.shopName}</span>
                  <span>Address</span><span>:</span><span>{invoice.customer.address}, {invoice.customer.city}</span>
                  <span>GSTIN</span><span>:</span><span>{invoice.customer.gstNumber || 'NULL'}</span>
                </div>
              </div>
              <div style={{ flex: 1, padding: '6px 12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '130px 10px 1fr', gap: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  <span>Date & Time of Supply</span><span>:</span><span>{new Date(invoice.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')}</span>
                  <div style={{ gridColumn: 'span 3', height: '6px' }}></div>
                  <span style={{ fontSize: '11px' }}>State : {business.settings.state || 'Tamil Nadu'}</span><span></span><span style={{ textAlign: 'right', fontSize: '11px' }}>State Code : 33</span>
                </div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', borderBottom: '2px solid #000' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #000', fontSize: '11px', fontWeight: 'bold' }}>
                  <th style={{ width: '32px', borderRight: '2px solid #000', padding: '6px 2px' }}>#</th>
                  <th style={{ borderRight: '2px solid #000', padding: '6px', textAlign: 'left' }}>DESCRIPTION OF GOODS</th>
                  <th style={{ width: '85px', borderRight: '2px solid #000', padding: '6px' }}>NET RATE</th>
                  <th style={{ width: '65px', borderRight: '2px solid #000', padding: '6px' }}>MRP</th>
                  <th style={{ width: '60px', borderRight: '2px solid #000', padding: '6px' }}>QTY..</th>
                  <th style={{ width: '55px', borderRight: '2px solid #000', padding: '6px' }}>DISC%</th>
                  <th style={{ width: '55px', borderRight: '2px solid #000', padding: '6px' }}>GST%</th>
                  <th style={{ width: '85px', borderRight: '2px solid #000', padding: '6px' }}>RATE</th>
                  <th style={{ width: '100px', padding: '6px' }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {chunk.map((item, idx) => {
                  const qty = parseFloat(item.quantity || 1);
                  const grossPrice = parseFloat(item.price || 0);
                  const disc = parseFloat(item.discountPercent || 0) / 100;
                  const unitInclusive = grossPrice * (1 - disc);
                  const taxRate = parseFloat(item.gstPercent || 0) / 100;
                  const unitTaxable = unitInclusive / (1 + taxRate);
                  const totalTaxable = unitTaxable * qty;
                  return (
                    <tr key={idx} style={{ height: '38px', fontWeight: 'bold', fontSize: '13px', borderBottom: '1.5px solid #000', verticalAlign: 'middle' }}>
                    <td style={{ borderRight: '2px solid #000', verticalAlign: 'middle' }}>{pageIdx * 15 + idx + 1}</td>
                    <td style={{ borderRight: '2px solid #000', verticalAlign: 'middle', textAlign: 'left', paddingLeft: '6px' }}>{item.name.toUpperCase()}</td>
                    <td style={{ borderRight: '2px solid #000', verticalAlign: 'middle' }}>{unitInclusive.toFixed(2)}</td>
                    <td style={{ borderRight: '2px solid #000', verticalAlign: 'middle' }}>{item.mrp || '0.00'}</td>
                    <td style={{ borderRight: '2px solid #000', textAlign: 'center', verticalAlign: 'middle', fontSize: '11px' }}>{qty} {item.unit || ''}</td>
                    <td style={{ borderRight: '2px solid #000', verticalAlign: 'middle' }}>{parseFloat(item.discountPercent || 0).toFixed(1)}%</td>
                    <td style={{ borderRight: '2px solid #000', verticalAlign: 'middle' }}>{parseFloat(item.gstPercent || 0)}%</td>
                    <td style={{ borderRight: '2px solid #000', verticalAlign: 'middle' }}>{unitTaxable.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', paddingRight: '11px', verticalAlign: 'middle' }}>{totalTaxable.toFixed(2)}</td>
                  </tr>
                );
              })}
              {[...Array(15 - chunk.length)].map((_, i) => (
                <tr key={'spacer-' + i} style={{ height: '38px', borderBottom: '1.5px solid #000', verticalAlign: 'middle' }}>
                  <td style={{ borderRight: '2px solid #000', verticalAlign: 'middle' }}></td><td style={{ borderRight: '2px solid #000', verticalAlign: 'middle' }}></td><td style={{ borderRight: '2px solid #000', verticalAlign: 'middle' }}></td><td style={{ borderRight: '2px solid #000', verticalAlign: 'middle' }}></td><td style={{ borderRight: '2px solid #000', verticalAlign: 'middle' }}></td><td style={{ borderRight: '2px solid #000', verticalAlign: 'middle' }}></td><td style={{ borderRight: '2px solid #000', verticalAlign: 'middle' }}></td><td style={{ borderRight: '2px solid #000', verticalAlign: 'middle' }}></td><td style={{ verticalAlign: 'middle' }}></td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>

          <div>
            {pageIdx === chunks.length - 1 ? (
              <>
                <div style={{ display: 'flex', borderBottom: '2px solid #000' }}>
                  <div style={{ flex: 1.5, borderRight: '2px solid #000' }}>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', borderBottom: '1.5px solid #000', padding: '3px', fontSize: '11px' }}>Tax Summary</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 50px 50px 70px', borderBottom: '1.5px solid #000', fontWeight: 'bold', fontSize: '10px', textAlign: 'center' }}>
                      <div style={{ borderRight: '1.5px solid #000', padding: '4px' }}>TAX RATE</div>
                      <div style={{ borderRight: '1.5px solid #000', padding: '4px' }}>TAXABLE AMT.</div>
                      <div style={{ borderRight: '1.5px solid #000', padding: '4px' }}>CGST</div>
                      <div style={{ borderRight: '1.5px solid #000', padding: '4px' }}>SGST</div>
                      <div style={{ padding: '4px' }}>TOTAL TAX</div>
                    </div>
                    {Array.from(new Set(invoice.items.map(i => i.gstPercent || 0))).sort((a,b) => a-b).map(rate => {
                      const itemsWithRate = invoice.items.filter(i => (i.gstPercent || 0) === rate);
                      const taxable = itemsWithRate.reduce((acc, item) => {
                        const q = parseFloat(item.quantity || 1);
                        const gp = parseFloat(item.price || 0);
                        const d = parseFloat(item.discountPercent || 0) / 100;
                        const inc = gp * (1 - d);
                        return acc + (inc / (1 + (rate/100))) * q;
                      }, 0);
                      const tax = taxable * (rate / 100);
                      return (
                        <div key={rate} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 50px 50px 70px', fontWeight: 'bold', fontSize: '11px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                          <div style={{ borderRight: '1.5px solid #000', padding: '4px' }}>{rate}%</div>
                          <div style={{ borderRight: '1.5px solid #000', padding: '4px' }}>{taxable.toFixed(2)}</div>
                          <div style={{ borderRight: '1.5px solid #000', padding: '4px' }}>{(tax/2).toFixed(2)}</div>
                          <div style={{ borderRight: '1.5px solid #000', padding: '4px' }}>{(tax/2).toFixed(2)}</div>
                          <div style={{ padding: '4px' }}>{tax.toFixed(2)}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ flex: 1, backgroundColor: '#fff', fontSize: '12px', fontWeight: 'bold' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', borderBottom: '1.5px solid #000' }}>
                      <div style={{ borderRight: '1.5px solid #000', padding: '4px 10px', textAlign: 'right' }}>TOTAL GROSS VALUE</div>
                      <div style={{ padding: '4px 10px', textAlign: 'right' }}>{grandTotal.toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', borderBottom: '1.5px solid #000', color: '#dc2626' }}>
                      <div style={{ borderRight: '1.5px solid #000', padding: '4px 10px', textAlign: 'right' }}>Less: DISCOUNT</div>
                      <div style={{ padding: '4px 10px', textAlign: 'right' }}>{parseFloat(totalDiscount || 0).toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', borderBottom: '1.5px solid #000', backgroundColor: '#f9fafb' }}>
                      <div style={{ borderRight: '1.5px solid #000', padding: '4px 10px', textAlign: 'right' }}>TAXABLE VALUE</div>
                      <div style={{ padding: '4px 10px', textAlign: 'right' }}>{subtotal.toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', borderBottom: '1.5px solid #000' }}>
                      <div style={{ borderRight: '1.5px solid #000', padding: '4px 10px', textAlign: 'right' }}>Add : CGST</div>
                      <div style={{ padding: '4px 10px', textAlign: 'right' }}>{(totalTax / 2).toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', borderBottom: '1.5px solid #000' }}>
                      <div style={{ borderRight: '1.5px solid #000', padding: '4px 10px', textAlign: 'right' }}>Add : SGST</div>
                      <div style={{ padding: '4px 10px', textAlign: 'right' }}>{(totalTax / 2).toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', borderBottom: '1.5px solid #000' }}>
                      <div style={{ borderRight: '1.5px solid #000', padding: '4px 10px', textAlign: 'right' }}>Freight Charges</div>
                      <div style={{ padding: '4px 10px', textAlign: 'right' }}>0.00</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', fontWeight: '900', fontSize: '14px' }}>
                      <div style={{ borderRight: '1.5px solid #000', padding: '6px 10px', textAlign: 'right' }}>Grand Total</div>
                      <div style={{ padding: '6px 10px', textAlign: 'right' }}>{grandTotal.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
                <div style={{ borderBottom: '2px solid #000', padding: '6px 12px', fontWeight: 'bold', fontSize: '13px' }}>{numberToWords(grandTotal).toUpperCase()}</div>
                <div style={{ display: 'flex' }}>
                  <div style={{ flex: 1, padding: '8px 12px', borderRight: '2px solid #000' }}>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4px', fontSize: '13px' }}>Bank Details</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '100px 10px 1fr', gap: '3px', fontWeight: 'bold', fontSize: '11px' }}>
                      <span>Bank & Branch</span><span>:</span><span>{business.settings.bankName}</span>
                      <span>A/c No.</span><span>:</span><span>{business.settings.accountNumber}</span>
                      <span>IFSC Code No.</span><span>:</span><span>{business.settings.ifscCode}</span>
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', fontWeight: 'bold' }}>For</div>
                      <div style={{ fontWeight: 'bold', marginTop: '1px', fontSize: '14px' }}>{business.settings.name}</div>
                    </div>
                    <div style={{ marginTop: '25px', fontWeight: 'bold', borderTop: '1.5px solid #000', width: '80%', textAlign: 'center', paddingTop: '3px', fontSize: '11px' }}>Authorised Signatory</div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '30px', fontWeight: 'bold', fontSize: '13px', borderTop: '2px solid #000' }}>
                Continued on next page...
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

export default A4Invoice;
