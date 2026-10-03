import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Select from 'react-select';

const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: 'var(--card-bg)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-main)',
    boxShadow: 'none',
    borderRadius: '8px',
    padding: '4px',
    '&:hover': {
      borderColor: 'var(--accent-color)',
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'var(--card-bg)',
    color: 'var(--text-main)',
    borderRadius: '8px',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 100,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? 'var(--sidebar-item-active)' : 'var(--card-bg)',
    color: state.isSelected ? 'var(--sidebar-text-active)' : 'var(--text-main)',
    '&:hover': {
      backgroundColor: 'var(--sidebar-item-hover)',
      color: 'var(--text-main)',
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'var(--text-main)',
  }),
  input: (provided) => ({
    ...provided,
    color: 'var(--text-main)',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'var(--text-secondary)',
  }),
};

const CreateInvoice = ({ business, updateBusiness, showToast }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Robust prefill merging
  const getInitialState = () => {
    let base = {
      customer: {},
      items: [],
      paid: false,
      transportMode: '',
      vehicleNo: '',
      placeOfSupply: '',
      freightCharges: 0,
      isOriginal: true,
      number: `${business.settings.invoicePrefix || 'INV'}-${business.lastInvoiceNumber + 1}`,
      date: new Date().toISOString(),
      id: crypto.randomUUID()
    };

    if (location.state?.invoice) {
      base = { ...base, ...location.state.invoice };
    } else if (location.state?.customer) {
      base.customer = location.state.customer;
    }
    return base;
  };

  const [invoice, setInvoice] = useState(getInitialState());

  // Revised GST & Discount calculations based on Gross Price
  const grossValue = useMemo(() => (invoice.items || []).reduce((sum, i) => {
    return sum + (parseFloat(i.price || 0) * (i.quantity || 1));
  }, 0), [invoice.items]);

  const totalDiscount = useMemo(() => (invoice.items || []).reduce((sum, i) => {
    const qty = parseFloat(i.quantity || 1);
    const price = parseFloat(i.price || 0);
    const disc = parseFloat(i.discountPercent || 0) / 100;
    return sum + (price * qty * disc);
  }, 0), [invoice.items]);

  const itemTax = useMemo(() => (invoice.items || []).reduce((sum, i) => {
    const qty = parseFloat(i.quantity || 1);
    const price = parseFloat(i.price || 0);
    const disc = parseFloat(i.discountPercent || 0) / 100;
    const discountedPrice = price * (1 - disc);
    const taxRate = parseFloat(i.gstPercent || 0) / 100;
    const taxAmountPerUnit = discountedPrice * taxRate;
    return sum + (taxAmountPerUnit * qty);
  }, 0), [invoice.items]);

  const subtotal = useMemo(() => (invoice.items || []).reduce((sum, i) => {
    const qty = parseFloat(i.quantity || 1);
    const price = parseFloat(i.price || 0);
    const disc = parseFloat(i.discountPercent || 0) / 100;
    const discountedPrice = price * (1 - disc);
    const taxRate = parseFloat(i.gstPercent || 0) / 100;
    const basePrice = discountedPrice - (discountedPrice * taxRate);
    return sum + (basePrice * qty);
  }, 0), [invoice.items]);

  const total = (invoice.items || []).reduce((sum, i) => {
    const qty = parseFloat(i.quantity || 1);
    const price = parseFloat(i.price || 0);
    const disc = parseFloat(i.discountPercent || 0) / 100;
    return sum + (price * qty * (1 - disc));
  }, 0) + (parseFloat(invoice.freightCharges) || 0);

  const handleAddItem = (selectedItem) => {
    setInvoice({ ...invoice, items: [...(invoice.items || []), { ...selectedItem, quantity: 1, discountPercent: 0, description: selectedItem.description || '' }] });
  };

  const handleUpdateItem = (index, updates) => {
    const newItems = [...(invoice.items || [])];
    newItems[index] = { ...newItems[index], ...updates };
    setInvoice({ ...invoice, items: newItems });
  };

  const handleRemoveItem = (index) => {
    setInvoice({ ...invoice, items: (invoice.items || []).filter((_, i) => i !== index) });
  };

  const handleSave = () => {
    if (!invoice.customer?.shopName) {
      showToast("Please select a customer/shop before saving.", "error");
      return;
    }

    const updatedInvoice = {
      ...invoice,
      total,
      tax: itemTax,
      discount: totalDiscount
    };
    let newInvoices = business.invoices;
    let newLastInvoiceNumber = business.lastInvoiceNumber;

    if (business.invoices.some(i => i.id === invoice.id)) {
      newInvoices = business.invoices.map(i => i.id === invoice.id ? updatedInvoice : i);
    } else {
      newInvoices = [...business.invoices, updatedInvoice];
      newLastInvoiceNumber += 1;
    }

    updateBusiness({ invoices: newInvoices, lastInvoiceNumber: newLastInvoiceNumber });
    navigate(`/invoice/${invoice.id}/view`);
  };

  return (
    <div style={styles.container}>
      {/* Embedded Styles */}
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .section-card {
            animation: slideIn 0.5s ease forwards;
          }

          .table-row {
            transition: all 0.2s ease;
          }

          .table-row:hover {
            background: #f8fafc;
          }

          .remove-btn:hover {
            background: #fee2e2 !important;
            color: #dc2626 !important;
            transform: scale(1.1);
          }
        `}
      </style>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            {business.invoices.some(i => i.id === invoice.id) ? '✏️ Edit Invoice' : '📄 New Invoice'}
          </h1>
          <p style={styles.subtitle}>
            {business.invoices.some(i => i.id === invoice.id) 
              ? 'Update invoice details and items' 
              : 'Create a new invoice for your customer'}
          </p>
        </div>
        <button 
          style={styles.saveButton}
          onClick={handleSave}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <span style={styles.saveIcon}>💾</span>
          Save Invoice
        </button>
      </div>

      {/* Customer & Invoice Details Grid */}
      <div style={styles.detailsGrid}>
        {/* Customer Card */}
        <div className="section-card" style={{...styles.card, animationDelay: '0.1s'}}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>👥</span>
            <h2 style={styles.cardTitle}>Bill To</h2>
          </div>
          
          <Select
            styles={customSelectStyles}
            options={business.customers.map(c => ({ value: c, label: `${c.shopName} ${c.name ? `(${c.name})` : ''}` }))}
            onChange={opt => setInvoice({ ...invoice, customer: opt.value })}
            placeholder="🔍 Search Shop or Customer..."
            value={invoice.customer?.shopName ? { label: `${invoice.customer.shopName} ${invoice.customer.name ? `(${invoice.customer.name})` : ''}` } : null}
          />
          
          {invoice.customer?.shopName && (
            <div style={styles.customerDetails}>
              <div style={styles.customerName}>{invoice.customer.shopName}</div>
              {invoice.customer.name && <div style={styles.customerAttn}>Attn: {invoice.customer.name}</div>}
              <div style={styles.customerAddress}>
                {invoice.customer.address}, {invoice.customer.city}
              </div>
              {invoice.customer.gstNumber && (
                <div style={styles.customerGst}>
                  <span style={styles.gstBadge}>GST</span>
                  {invoice.customer.gstNumber}
                </div>
              )}
              {invoice.customer.phone && (
                <div style={styles.customerPhone}>📞 {invoice.customer.phone}</div>
              )}
            </div>
          )}
        </div>

        {/* Invoice Details Card */}
        <div className="section-card" style={{...styles.card, animationDelay: '0.2s'}}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>📋</span>
            <h2 style={styles.cardTitle}>Invoice Details</h2>
          </div>
          
          <div style={styles.invoiceDetailsGrid}>
            <div style={styles.detailField}>
              <label style={styles.fieldLabel}>Invoice Number</label>
              <div style={styles.fieldWrapper}>
                <span style={styles.fieldPrefix}>#</span>
                <input
                  style={styles.fieldInput}
                  value={invoice.number || ''}
                  onChange={e => setInvoice({ ...invoice, number: e.target.value })}
                />
              </div>
            </div>
            
            <div style={styles.detailField}>
              <label style={styles.fieldLabel}>Invoice Date</label>
              <div style={styles.fieldWrapper}>
                <span style={styles.fieldPrefix}>📅</span>
                <input
                  style={styles.fieldInput}
                  type="date"
                  value={new Date(invoice.date || new Date()).toISOString().split('T')[0]}
                  onChange={e => setInvoice({ ...invoice, date: new Date(e.target.value).toISOString() })}
                />
              </div>
            </div>

            <div style={styles.detailField}>
              <label style={styles.fieldLabel}>Transport Mode</label>
              <div style={styles.fieldWrapper}>
                <span style={styles.fieldPrefix}>🚚</span>
                <input
                  style={styles.fieldInput}
                  placeholder="e.g., Road, Air"
                  value={invoice.transportMode || ''}
                  onChange={e => setInvoice({ ...invoice, transportMode: e.target.value })}
                />
              </div>
            </div>

            <div style={styles.detailField}>
              <label style={styles.fieldLabel}>Vehicle No.</label>
              <div style={styles.fieldWrapper}>
                <span style={styles.fieldPrefix}>🚛</span>
                <input
                  style={styles.fieldInput}
                  placeholder="Vehicle number"
                  value={invoice.vehicleNo || ''}
                  onChange={e => setInvoice({ ...invoice, vehicleNo: e.target.value })}
                />
              </div>
            </div>

            <div style={styles.detailField}>
              <label style={styles.fieldLabel}>Place of Supply</label>
              <div style={styles.fieldWrapper}>
                <span style={styles.fieldPrefix}>📍</span>
                <input
                  style={styles.fieldInput}
                  placeholder="City/State"
                  value={invoice.placeOfSupply || ''}
                  onChange={e => setInvoice({ ...invoice, placeOfSupply: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Section */}
      <div className="section-card" style={{...styles.card, padding: '0', overflow: 'hidden', animationDelay: '0.3s'}}>
        <div style={styles.itemsHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={styles.cardIcon}>📦</span>
            <h2 style={styles.cardTitle}>Line Items</h2>
          </div>
          <div style={{ width: '300px', position: 'relative', zIndex: 10 }}>
            <Select
              styles={customSelectStyles}
              options={business.items.map(i => ({ value: i, label: i.name }))}
              onChange={opt => handleAddItem(opt.value)}
              placeholder="🔍 Search & Add item..."
              value={null}
            />
          </div>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.tableHead}>
              <tr>
                <th style={styles.tableHeader}>Item Description</th>
                <th style={styles.tableHeader}>HSN/SAC</th>
                <th style={styles.tableHeader}>Rate (₹)</th>
                <th style={styles.tableHeader}>MRP</th>
                <th style={styles.tableHeader}>Disc %</th>
                <th style={styles.tableHeader}>GST %</th>
                <th style={styles.tableHeader}>Qty</th>
                <th style={styles.tableHeader}>Unit</th>
                <th style={styles.tableHeader} align="right">Total (₹)</th>
                <th style={styles.tableHeader}></th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="table-row" style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    <div style={styles.itemName}>{item.name}</div>
                    <input
                      style={styles.itemDescription}
                      value={item.description || ''}
                      placeholder="Add details..."
                      onChange={e => handleUpdateItem(index, { description: e.target.value })}
                    />
                  </td>
                  <td style={styles.tableCell}>
                    <span style={styles.hsnCode}>{item.hsnCode || '-'}</span>
                  </td>
                  <td style={styles.tableCell}>
                    <input
                      style={styles.numberInput}
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={e => handleUpdateItem(index, { price: parseFloat(e.target.value) || 0 })}
                    />
                  </td>
                  <td style={styles.tableCell}>
                    <input
                      style={styles.numberInput}
                      type="number"
                      step="0.01"
                      value={item.mrp || 0}
                      onChange={e => handleUpdateItem(index, { mrp: parseFloat(e.target.value) || 0 })}
                    />
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.percentageWrapper}>
                      <input
                        style={styles.percentageInput}
                        type="number"
                        value={item.discountPercent || 0}
                        onChange={e => handleUpdateItem(index, { discountPercent: parseFloat(e.target.value) || 0 })}
                      />
                      <span style={styles.percentageSymbol}>%</span>
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.percentageWrapper}>
                      <input
                        style={styles.percentageInput}
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.gstPercent}
                        onChange={e => handleUpdateItem(index, { gstPercent: parseFloat(e.target.value) || 0 })}
                      />
                      <span style={styles.percentageSymbol}>%</span>
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <input
                      style={styles.qtyInput}
                      type="number"
                      value={item.quantity || 1}
                      onChange={e => handleUpdateItem(index, { quantity: parseFloat(e.target.value) || 0 })}
                    />
                  </td>
                  <td style={styles.tableCell}>
                    <span style={styles.unit}>{item.unit || 'Unit'}</span>
                  </td>
                  <td style={{...styles.tableCell, textAlign: 'right', fontWeight: '700'}}>
                    ₹{(parseFloat(item.price || 0) * (item.quantity || 1) * (1 - (parseFloat(item.discountPercent || 0) / 100))).toFixed(2)}
                  </td>
                  <td style={styles.tableCell}>
                    <button 
                      className="remove-btn"
                      style={styles.removeButton}
                      onClick={() => handleRemoveItem(index)}
                      title="Remove item"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
              {invoice.items.length === 0 && (
                <tr>
                  <td colSpan="10" style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📦</div>
                    <div style={styles.emptyText}>No items added yet</div>
                    <div style={styles.emptySubtext}>Use the selector above to add items to this invoice</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Section */}
      <div className="section-card" style={{...styles.summaryCard, animationDelay: '0.4s'}}>
        <div style={styles.summaryGrid}>
          {/* Left side - Additional Info */}
          <div style={styles.summaryLeft}>
            <div style={styles.notesSection}>
              <label style={styles.notesLabel}>Notes / Terms</label>
              <textarea 
                style={styles.notesInput}
                placeholder="Add any additional notes or payment terms..."
                rows="3"
              />
            </div>
          </div>

          {/* Right side - Calculations */}
          <div style={styles.summaryRight}>
            <div style={styles.calculationRow}>
              <span style={styles.calculationLabel}>Total Gross Value</span>
              <span style={styles.calculationValue}>₹{grossValue.toFixed(2)}</span>
            </div>
            
            <div style={styles.calculationRow}>
              <span style={styles.calculationLabel}>Total Discount</span>
              <span style={{...styles.calculationValue, color: '#dc2626'}}>-₹{totalDiscount.toFixed(2)}</span>
            </div>
            
            <div style={styles.calculationRow}>
              <span style={styles.calculationLabel}>Taxable Value</span>
              <span style={styles.calculationValue}>₹{subtotal.toFixed(2)}</span>
            </div>
            
            <div style={styles.calculationRow}>
              <span style={styles.calculationLabel}>Total Tax (GST)</span>
              <span style={{...styles.calculationValue, color: '#4f46e5'}}>₹{itemTax.toFixed(2)}</span>
            </div>
            
            <div style={styles.freightRow}>
              <span style={styles.calculationLabel}>Freight Charges</span>
              <div style={styles.freightInputWrapper}>
                <span style={styles.currencySymbol}>₹</span>
                <input
                  type="number"
                  style={styles.freightInput}
                  value={invoice.freightCharges || 0}
                  onChange={e => setInvoice({ ...invoice, freightCharges: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Grand Total</span>
              <span style={styles.totalValue}>₹{total.toFixed(2)}</span>
            </div>

            <div style={styles.totalInWords}>
              <span style={styles.inWordsLabel}>In Words:</span>
              <span style={styles.inWordsValue}>
                {numberToWords(total)} Rupees Only
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for number to words (simplified)
const numberToWords = (num) => {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  const convertLessThanThousand = (n) => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  };
  
  const integer = Math.floor(num);
  
  if (integer < 1000) return convertLessThanThousand(integer);
  if (integer < 100000) {
    const thousands = Math.floor(integer / 1000);
    const remainder = integer % 1000;
    return convertLessThanThousand(thousands) + ' Thousand' + (remainder !== 0 ? ' ' + convertLessThanThousand(remainder) : '');
  }
  if (integer < 10000000) {
    const lakhs = Math.floor(integer / 100000);
    const remainder = integer % 100000;
    return convertLessThanThousand(lakhs) + ' Lakh' + (remainder !== 0 ? ' ' + convertLessThanThousand(remainder) : '');
  }
  const crores = Math.floor(integer / 10000000);
  const remainder = integer % 10000000;
  return convertLessThanThousand(crores) + ' Crore' + (remainder !== 0 ? ' ' + convertLessThanThousand(remainder) : '');
};

// Styles Object
const styles = {
  container: {
    padding: '32px',
    background: '#f8fafc',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
  },

  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 4px',
    letterSpacing: '-0.02em',
  },

  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },

  saveButton: {
    padding: '12px 28px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
    color: 'white',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)',
  },

  saveIcon: {
    fontSize: '18px',
  },

  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },

  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
    opacity: 0,
    animation: 'slideIn 0.5s ease forwards',
  },

  summaryCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    marginTop: '24px',
    opacity: 0,
    animation: 'slideIn 0.5s ease forwards',
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },

  cardIcon: {
    fontSize: '24px',
  },

  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#0f172a',
    margin: 0,
  },

  customerDetails: {
    marginTop: '16px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },

  customerName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '4px',
  },

  customerAttn: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4f46e5',
    marginBottom: '8px',
  },

  customerAddress: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '8px',
    lineHeight: '1.5',
  },

  customerGst: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },

  gstBadge: {
    background: '#4f46e5',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '600',
  },

  customerPhone: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '4px',
  },

  invoiceDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },

  detailField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  fieldLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  fieldWrapper: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    overflow: 'hidden',
    background: '#f8fafc',
  },

  fieldPrefix: {
    padding: '0 10px',
    color: '#64748b',
    fontSize: '14px',
  },

  fieldInput: {
    flex: 1,
    padding: '10px 12px',
    border: 'none',
    background: 'transparent',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
  },

  itemsHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    background: '#f8fafc',
  },

  tableContainer: {
    padding: '0 24px',
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '1000px',
  },

  tableHead: {
    background: '#f1f5f9',
  },

  tableHeader: {
    padding: '14px 12px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #cbd5e1',
  },

  tableRow: {
    borderBottom: '1px solid #e2e8f0',
  },

  tableCell: {
    padding: '12px',
    fontSize: '13px',
    color: '#334155',
  },

  itemName: {
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '4px',
  },

  itemDescription: {
    width: '100%',
    padding: '6px 8px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '11px',
    background: '#f8fafc',
    outline: 'none',
  },

  hsnCode: {
    fontSize: '12px',
    color: '#64748b',
  },

  numberInput: {
    width: '90px',
    padding: '6px 8px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    textAlign: 'right',
    background: '#f8fafc',
    outline: 'none',
  },

  percentageWrapper: {
    position: 'relative',
    display: 'inline-block',
  },

  percentageInput: {
    width: '70px',
    padding: '6px 8px',
    paddingRight: '20px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    textAlign: 'right',
    background: '#f8fafc',
    outline: 'none',
  },

  percentageSymbol: {
    position: 'absolute',
    right: '6px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '11px',
    color: '#94a3b8',
  },

  qtyInput: {
    width: '60px',
    padding: '6px 8px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    textAlign: 'center',
    background: '#f8fafc',
    outline: 'none',
  },

  unit: {
    fontSize: '12px',
    color: '#64748b',
    padding: '0 8px',
  },

  removeButton: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: 'white',
    color: '#94a3b8',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },

  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#64748b',
  },

  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.5,
  },

  emptyText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '4px',
  },

  emptySubtext: {
    fontSize: '13px',
    color: '#94a3b8',
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
  },

  summaryLeft: {
    paddingRight: '32px',
    borderRight: '1px solid #e2e8f0',
  },

  notesSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  notesLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155',
  },

  notesInput: {
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    fontFamily: 'inherit',
    resize: 'vertical',
    background: '#f8fafc',
    outline: 'none',
  },

  summaryRight: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  calculationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    fontSize: '14px',
  },

  calculationLabel: {
    color: '#64748b',
  },

  calculationValue: {
    fontWeight: '600',
    color: '#334155',
  },

  freightRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderTop: '1px dashed #e2e8f0',
    borderBottom: '1px dashed #e2e8f0',
  },

  freightInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  currencySymbol: {
    color: '#64748b',
    fontSize: '14px',
  },

  freightInput: {
    width: '120px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    textAlign: 'right',
    fontWeight: '600',
    background: '#f8fafc',
    outline: 'none',
  },

  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0 8px',
    borderTop: '2px solid #e2e8f0',
    fontSize: '18px',
  },

  totalLabel: {
    fontWeight: '600',
    color: '#0f172a',
  },

  totalValue: {
    fontWeight: '800',
    fontSize: '24px',
    color: '#4f46e5',
  },

  totalInWords: {
    display: 'flex',
    gap: '8px',
    padding: '12px',
    background: '#f1f5f9',
    borderRadius: '10px',
    fontSize: '12px',
    marginTop: '8px',
  },

  inWordsLabel: {
    color: '#64748b',
    fontWeight: '600',
  },

  inWordsValue: {
    color: '#334155',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
};

export default CreateInvoice;