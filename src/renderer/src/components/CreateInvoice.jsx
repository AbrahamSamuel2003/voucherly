import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#ffffff',
    borderColor: state.isFocused ? '#4f46e5' : '#e2e8f0',
    color: '#0f172a',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(79, 70, 229, 0.15)' : 'none',
    borderRadius: '10px',
    padding: '4px',
    minHeight: '44px',
    '&:hover': {
      borderColor: '#4f46e5',
    },
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#ffffff',
    color: '#0f172a',
    borderRadius: '10px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    zIndex: 9999,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#f1f5f9' : '#ffffff',
    color: state.isSelected ? '#ffffff' : '#0f172a',
    cursor: 'pointer',
    padding: '10px 14px',
    fontSize: '14px',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#0f172a',
    fontWeight: '500',
  }),
  input: (provided) => ({
    ...provided,
    color: '#0f172a',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#94a3b8',
  }),
};

const tableSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#ffffff',
    borderColor: state.isFocused ? '#4f46e5' : '#cbd5e1',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(79, 70, 229, 0.2)' : 'none',
    borderRadius: '8px',
    minHeight: '40px',
    fontSize: '13px',
    cursor: 'text',
    '&:hover': {
      borderColor: '#4f46e5',
    },
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #cbd5e1',
    zIndex: 9999,
    minWidth: '320px',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#eef2ff' : '#ffffff',
    color: state.isSelected ? '#ffffff' : '#0f172a',
    fontSize: '13px',
    padding: '9px 12px',
    cursor: 'pointer',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#6366f1',
    fontWeight: '500',
    fontSize: '13px',
  }),
  input: (provided) => ({
    ...provided,
    color: '#0f172a',
    fontSize: '13px',
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
    return sum + (parseFloat(i.price || 0) * (parseFloat(i.quantity) || 1));
  }, 0), [invoice.items]);

  const totalDiscount = useMemo(() => (invoice.items || []).reduce((sum, i) => {
    const qty = parseFloat(i.quantity) || 1;
    const price = parseFloat(i.price || 0);
    const disc = parseFloat(i.discountPercent || 0) / 100;
    return sum + (price * qty * disc);
  }, 0), [invoice.items]);

  const itemTax = useMemo(() => (invoice.items || []).reduce((sum, i) => {
    const qty = parseFloat(i.quantity) || 1;
    const price = parseFloat(i.price || 0);
    const disc = parseFloat(i.discountPercent || 0) / 100;
    const discountedPrice = price * (1 - disc);
    const taxRate = parseFloat(i.gstPercent || 0) / 100;
    const taxAmountPerUnit = discountedPrice * taxRate;
    return sum + (taxAmountPerUnit * qty);
  }, 0), [invoice.items]);

  const subtotal = useMemo(() => (invoice.items || []).reduce((sum, i) => {
    const qty = parseFloat(i.quantity) || 1;
    const price = parseFloat(i.price || 0);
    const disc = parseFloat(i.discountPercent || 0) / 100;
    const discountedPrice = price * (1 - disc);
    const taxRate = parseFloat(i.gstPercent || 0) / 100;
    const basePrice = discountedPrice - (discountedPrice * taxRate);
    return sum + (basePrice * qty);
  }, 0), [invoice.items]);

  const total = (invoice.items || []).reduce((sum, i) => {
    const qty = parseFloat(i.quantity) || 1;
    const price = parseFloat(i.price || 0);
    const disc = parseFloat(i.discountPercent || 0) / 100;
    return sum + (price * qty * (1 - disc));
  }, 0) + (parseFloat(invoice.freightCharges) || 0);

  const handleAddItem = (selectedItem) => {
    if (!selectedItem) return;
    const newItem = {
      id: selectedItem.id || crypto.randomUUID(),
      name: selectedItem.name || selectedItem.label || '',
      hsnCode: selectedItem.hsnCode || selectedItem.hsn || '',
      price: parseFloat(selectedItem.price) || 0,
      mrp: parseFloat(selectedItem.mrp) || parseFloat(selectedItem.price) || 0,
      discountPercent: parseFloat(selectedItem.discountPercent) || 0,
      gstPercent: selectedItem.gstPercent !== undefined ? parseFloat(selectedItem.gstPercent) : 18,
      quantity: parseFloat(selectedItem.quantity) || 1,
      unit: selectedItem.unit || 'Pcs',
      description: selectedItem.description || ''
    };
    setInvoice(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
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
      showToast("Please enter or select a customer/shop before saving.", "error");
      return;
    }

    if (!invoice.items || invoice.items.length === 0) {
      showToast("Please add at least one line item to the invoice.", "error");
      return;
    }

    const updatedInvoice = {
      ...invoice,
      total,
      tax: itemTax,
      discount: totalDiscount
    };
    let newInvoices = business.invoices || [];
    let newLastInvoiceNumber = business.lastInvoiceNumber || 0;

    if (newInvoices.some(i => i.id === invoice.id)) {
      newInvoices = newInvoices.map(i => i.id === invoice.id ? updatedInvoice : i);
    } else {
      newInvoices = [...newInvoices, updatedInvoice];
      newLastInvoiceNumber += 1;
    }

    // Automatically save newly entered customer into business.customers
    let updatedCustomers = business.customers || [];
    if (invoice.customer?.shopName) {
      const exists = updatedCustomers.some(c =>
        c.shopName.trim().toLowerCase() === invoice.customer.shopName.trim().toLowerCase()
      );
      if (!exists) {
        updatedCustomers = [...updatedCustomers, {
          id: invoice.customer.id || crypto.randomUUID(),
          shopName: invoice.customer.shopName,
          name: invoice.customer.name || '',
          phoneNumber: invoice.customer.phone || invoice.customer.phoneNumber || '',
          address: invoice.customer.address || '',
          city: invoice.customer.city || '',
          state: invoice.customer.state || '',
          pincode: invoice.customer.pincode || '',
          gstNumber: invoice.customer.gstNumber || ''
        }];
      }
    }

    updateBusiness({
      invoices: newInvoices,
      lastInvoiceNumber: newLastInvoiceNumber,
      customers: updatedCustomers
    });

    showToast("Invoice saved successfully!");
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
              transform: translateY(16px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .section-card {
            animation: slideIn 0.4s ease forwards;
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
            transform: scale(1.05);
          }

          .table-row input:focus {
            border-color: #4f46e5 !important;
            box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15) !important;
            background: #ffffff !important;
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
            <div>
              <h2 style={styles.cardTitle}>Bill To (Customer)</h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                Select an existing customer or type a new shop name
              </p>
            </div>
          </div>
          
          <CreatableSelect
            styles={customSelectStyles}
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            options={business.customers.map(c => ({
              value: c,
              label: `${c.shopName} ${c.name ? `(${c.name})` : ''}`
            }))}
            onChange={opt => {
              if (!opt) {
                setInvoice({ ...invoice, customer: {} });
                return;
              }
              if (opt.__isNew__) {
                setInvoice({
                  ...invoice,
                  customer: {
                    id: crypto.randomUUID(),
                    shopName: opt.value,
                    name: '',
                    phone: '',
                    address: '',
                    city: '',
                    gstNumber: ''
                  }
                });
              } else {
                setInvoice({ ...invoice, customer: opt.value });
              }
            }}
            placeholder="🔍 Search Shop or Customer (or type new name)..."
            formatCreateLabel={val => `➕ Create new customer "${val}"`}
            value={invoice.customer?.shopName ? { label: `${invoice.customer.shopName} ${invoice.customer.name ? `(${invoice.customer.name})` : ''}` } : null}
            isClearable
          />
          
          {invoice.customer?.shopName && (
            <div style={styles.customerDetails}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                <div>
                  <label style={styles.inlineFieldLabel}>Shop Name *</label>
                  <input
                    style={styles.inlineFieldInput}
                    value={invoice.customer.shopName || ''}
                    onChange={e => setInvoice({
                      ...invoice,
                      customer: { ...invoice.customer, shopName: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label style={styles.inlineFieldLabel}>Contact Person</label>
                  <input
                    style={styles.inlineFieldInput}
                    placeholder="e.g. John Doe"
                    value={invoice.customer.name || ''}
                    onChange={e => setInvoice({
                      ...invoice,
                      customer: { ...invoice.customer, name: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                <div>
                  <label style={styles.inlineFieldLabel}>Phone Number</label>
                  <input
                    style={styles.inlineFieldInput}
                    placeholder="e.g. +91 98765 43210"
                    value={invoice.customer.phone || invoice.customer.phoneNumber || ''}
                    onChange={e => setInvoice({
                      ...invoice,
                      customer: { ...invoice.customer, phone: e.target.value, phoneNumber: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label style={styles.inlineFieldLabel}>GST Number</label>
                  <input
                    style={styles.inlineFieldInput}
                    placeholder="GSTIN (optional)"
                    value={invoice.customer.gstNumber || ''}
                    onChange={e => setInvoice({
                      ...invoice,
                      customer: { ...invoice.customer, gstNumber: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div>
                <label style={styles.inlineFieldLabel}>Address & City</label>
                <input
                  style={styles.inlineFieldInput}
                  placeholder="Street address, city"
                  value={invoice.customer.address || ''}
                  onChange={e => setInvoice({
                    ...invoice,
                    customer: { ...invoice.customer, address: e.target.value }
                  })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Invoice Details Card */}
        <div className="section-card" style={{...styles.card, animationDelay: '0.2s'}}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>📋</span>
            <div>
              <h2 style={styles.cardTitle}>Invoice Details</h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                General shipping and dispatch metadata
              </p>
            </div>
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
                  placeholder="e.g. Road, Courier"
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

            <div style={{ ...styles.detailField, gridColumn: 'span 2' }}>
              <label style={styles.fieldLabel}>Place of Supply</label>
              <div style={styles.fieldWrapper}>
                <span style={styles.fieldPrefix}>📍</span>
                <input
                  style={styles.fieldInput}
                  placeholder="e.g. Chennai, Tamil Nadu"
                  value={invoice.placeOfSupply || ''}
                  onChange={e => setInvoice({ ...invoice, placeOfSupply: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Section - IN-TABLE CONTAINER ENTRY */}
      <div className="section-card" style={{...styles.card, padding: '0', overflow: 'hidden', animationDelay: '0.3s'}}>
        <div style={styles.itemsHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={styles.cardIcon}>📦</span>
            <div>
              <h2 style={styles.cardTitle}>Line Items</h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Search or enter items inside the active row below. Each entered product moves down to create the next row.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleAddItem({ name: '', price: 0, mrp: 0, gstPercent: 18, quantity: 1, unit: 'Pcs' })}
            style={styles.addBlankRowBtn}
            title="Add a custom empty row"
          >
            + Add Blank Row
          </button>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.tableHead}>
              <tr>
                <th style={{...styles.tableHeader, width: '40px', textAlign: 'center'}}>#</th>
                <th style={{...styles.tableHeader, minWidth: '280px'}}>Item Description</th>
                <th style={{...styles.tableHeader, width: '100px'}}>HSN/SAC</th>
                <th style={{...styles.tableHeader, width: '105px'}}>Rate (₹)</th>
                <th style={{...styles.tableHeader, width: '95px'}}>MRP</th>
                <th style={{...styles.tableHeader, width: '85px'}}>Disc %</th>
                <th style={{...styles.tableHeader, width: '85px'}}>GST %</th>
                <th style={{...styles.tableHeader, width: '80px'}}>Qty</th>
                <th style={{...styles.tableHeader, width: '75px'}}>Unit</th>
                <th style={{...styles.tableHeader, width: '115px', textAlign: 'right'}}>Total (₹)</th>
                <th style={{...styles.tableHeader, width: '45px', textAlign: 'center'}}></th>
              </tr>
            </thead>
            <tbody>
              {/* Existing items entered in the invoice */}
              {invoice.items.map((item, index) => (
                <tr key={item.id || index} className="table-row" style={styles.tableRow}>
                  <td style={{...styles.tableCell, textAlign: 'center', fontWeight: '700', color: '#64748b'}}>
                    {index + 1}
                  </td>
                  <td style={styles.tableCell}>
                    <input
                      style={styles.itemTitleInput}
                      value={item.name || ''}
                      placeholder="Product Name"
                      onChange={e => handleUpdateItem(index, { name: e.target.value })}
                    />
                    <input
                      style={styles.itemDescription}
                      value={item.description || ''}
                      placeholder="Add description / size / model..."
                      onChange={e => handleUpdateItem(index, { description: e.target.value })}
                    />
                  </td>
                  <td style={styles.tableCell}>
                    <input
                      style={styles.hsnInput}
                      value={item.hsnCode || ''}
                      placeholder="HSN"
                      onChange={e => handleUpdateItem(index, { hsnCode: e.target.value })}
                    />
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
                    <input
                      style={styles.unitInput}
                      value={item.unit || 'Pcs'}
                      placeholder="Unit"
                      onChange={e => handleUpdateItem(index, { unit: e.target.value })}
                    />
                  </td>
                  <td style={{...styles.tableCell, textAlign: 'right', fontWeight: '700', color: '#0f172a'}}>
                    ₹{(parseFloat(item.price || 0) * (parseFloat(item.quantity) || 1) * (1 - (parseFloat(item.discountPercent || 0) / 100))).toFixed(2)}
                  </td>
                  <td style={{...styles.tableCell, textAlign: 'center'}}>
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

              {/* ACTIVE IN-TABLE ENTRY ROW (Auto-advancing) */}
              <tr style={styles.activeEntryRow}>
                <td style={{...styles.tableCell, textAlign: 'center', fontWeight: '700', color: '#4f46e5'}}>
                  {invoice.items.length + 1}
                </td>
                <td style={styles.tableCell}>
                  <CreatableSelect
                    key={`item-entry-row-${invoice.items.length}`}
                    styles={tableSelectStyles}
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                    options={business.items.map(i => ({
                      value: i,
                      label: `${i.name} (Rate: ₹${i.price || 0} | GST: ${i.gstPercent || 0}% | HSN: ${i.hsnCode || '-'})`
                    }))}
                    onChange={opt => {
                      if (!opt) return;
                      if (opt.__isNew__) {
                        handleAddItem({
                          name: opt.value,
                          price: 0,
                          mrp: 0,
                          gstPercent: 18,
                          quantity: 1,
                          unit: 'Pcs',
                          hsnCode: ''
                        });
                      } else {
                        handleAddItem(opt.value);
                      }
                    }}
                    placeholder="🔍 Search & Add item (or type new product)..."
                    formatCreateLabel={val => `➕ Add "${val}" as new product`}
                    value={null}
                    autoFocus={invoice.items.length === 0}
                  />
                </td>
                <td style={styles.tableCell}>
                  <span style={styles.entryPlaceholderText}>Auto</span>
                </td>
                <td style={styles.tableCell}>
                  <span style={styles.entryPlaceholderText}>-</span>
                </td>
                <td style={styles.tableCell}>
                  <span style={styles.entryPlaceholderText}>-</span>
                </td>
                <td style={styles.tableCell}>
                  <span style={styles.entryPlaceholderText}>0%</span>
                </td>
                <td style={styles.tableCell}>
                  <span style={styles.entryPlaceholderText}>18%</span>
                </td>
                <td style={styles.tableCell}>
                  <span style={styles.entryPlaceholderText}>1</span>
                </td>
                <td style={styles.tableCell}>
                  <span style={styles.entryPlaceholderText}>Unit</span>
                </td>
                <td style={{...styles.tableCell, textAlign: 'right', color: '#94a3b8', fontWeight: '600'}}>
                  ₹0.00
                </td>
                <td style={{...styles.tableCell, textAlign: 'center'}}>
                  <span style={{ fontSize: '16px', color: '#4f46e5', fontWeight: '700' }} title="Active line entry">↳</span>
                </td>
              </tr>
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
                rows="4"
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
              <span style={styles.calculationLabel}>Freight / Shipping Charges</span>
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

// Helper function for number to words
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
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },

  title: {
    fontSize: '28px',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },

  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
  },

  summaryCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
    marginTop: '24px',
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },

  cardIcon: {
    fontSize: '24px',
  },

  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
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

  inlineFieldLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '4px',
    display: 'block',
  },

  inlineFieldInput: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
  },

  invoiceDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '14px',
  },

  detailField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  fieldLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  fieldWrapper: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
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
    padding: '9px 10px',
    border: 'none',
    background: 'transparent',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
  },

  itemsHeader: {
    padding: '18px 24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    background: '#f8fafc',
  },

  addBlankRowBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#334155',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  tableContainer: {
    padding: '0',
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '1020px',
  },

  tableHead: {
    background: '#f1f5f9',
  },

  tableHeader: {
    padding: '12px 10px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #cbd5e1',
  },

  tableRow: {
    borderBottom: '1px solid #e2e8f0',
    background: '#ffffff',
  },

  activeEntryRow: {
    background: '#f8fafc',
    borderTop: '2px dashed #cbd5e1',
    borderBottom: '1px solid #e2e8f0',
  },

  tableCell: {
    padding: '10px',
    fontSize: '13px',
    color: '#334155',
    verticalAlign: 'middle',
  },

  itemTitleInput: {
    width: '100%',
    padding: '7px 9px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a',
    background: '#ffffff',
    outline: 'none',
    marginBottom: '4px',
    boxSizing: 'border-box',
  },

  itemDescription: {
    width: '100%',
    padding: '5px 8px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '11px',
    color: '#64748b',
    background: '#f8fafc',
    outline: 'none',
    boxSizing: 'border-box',
  },

  hsnInput: {
    width: '100%',
    padding: '6px 8px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '12px',
    color: '#475569',
    background: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
  },

  numberInput: {
    width: '100%',
    padding: '6px 8px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    textAlign: 'right',
    color: '#0f172a',
    background: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
  },

  percentageWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },

  percentageInput: {
    width: '100%',
    padding: '6px 18px 6px 6px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    textAlign: 'right',
    color: '#0f172a',
    background: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
  },

  percentageSymbol: {
    position: 'absolute',
    right: '6px',
    fontSize: '11px',
    color: '#94a3b8',
    pointerEvents: 'none',
  },

  qtyInput: {
    width: '100%',
    padding: '6px 8px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    textAlign: 'center',
    fontWeight: '600',
    color: '#0f172a',
    background: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
  },

  unitInput: {
    width: '100%',
    padding: '6px 6px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '12px',
    textAlign: 'center',
    color: '#475569',
    background: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
  },

  entryPlaceholderText: {
    color: '#94a3b8',
    fontSize: '12px',
    fontStyle: 'italic',
  },

  removeButton: {
    width: '30px',
    height: '30px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    background: 'white',
    color: '#94a3b8',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    margin: '0 auto',
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
  },

  summaryLeft: {
    paddingRight: '24px',
    borderRight: '1px solid #e2e8f0',
  },

  notesSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  notesLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155',
  },

  notesInput: {
    padding: '12px',
    borderRadius: '10px',
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
    gap: '10px',
  },

  calculationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    fontSize: '14px',
  },

  calculationLabel: {
    color: '#64748b',
    fontWeight: '500',
  },

  calculationValue: {
    fontWeight: '600',
    color: '#334155',
  },

  freightRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
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
    width: '110px',
    padding: '6px 10px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    textAlign: 'right',
    fontWeight: '600',
    background: '#f8fafc',
    outline: 'none',
  },

  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0 6px',
    borderTop: '2px solid #e2e8f0',
    fontSize: '18px',
  },

  totalLabel: {
    fontWeight: '700',
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
    padding: '10px 12px',
    background: '#f1f5f9',
    borderRadius: '8px',
    fontSize: '12px',
    marginTop: '6px',
  },

  inWordsLabel: {
    color: '#64748b',
    fontWeight: '700',
  },

  inWordsValue: {
    color: '#334155',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
};

export default CreateInvoice;