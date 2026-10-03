import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaCheckCircle, FaTimesCircle, FaPrint, FaFileAlt } from 'react-icons/fa';

const Invoices = ({ business, updateBusiness }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedIds, setSelectedIds] = useState([]);

  // filter the invoices and also sort by number or customers or paid or date
  const filteredInvoices = business.invoices
    .filter(i =>
      i.number.toLowerCase().includes(search.toLowerCase()) ||
      (i.customer.shopName && i.customer.shopName.toLowerCase().includes(search.toLowerCase())) ||
      (i.customer.name && i.customer.name.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'number':
          valA = a.number;
          valB = b.number;
          break;
        case 'customer':
          valA = (a.customer.shopName || '').toLowerCase();
          valB = (b.customer.shopName || '').toLowerCase();
          break;
        case 'total':
          valA = a.total;
          valB = b.total;
          break;
        case 'paid':
          valA = a.paid ? 1 : 0;
          valB = b.paid ? 1 : 0;
          break;
        case 'date':
        default:
          valA = new Date(a.date);
          valB = new Date(b.date);
          break;
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  // Selection Logic
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredInvoices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInvoices.map(i => i.id));
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Bulk Actions
  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} invoices?`)) {
      const newInvoices = business.invoices.filter(i => !selectedIds.includes(i.id));
      updateBusiness({ invoices: newInvoices });
      setSelectedIds([]);
    }
  };

  const handleBulkStatusChange = (status) => {
    const newInvoices = business.invoices.map(i =>
      selectedIds.includes(i.id) ? { ...i, paid: status } : i
    );
    updateBusiness({ invoices: newInvoices });
    setSelectedIds([]);
  };

  const handleBulkExport = () => {
    const selectedInvoices = business.invoices.filter(i => selectedIds.includes(i.id));
    const headers = ["Invoice Number", "Customer", "Date", "Discount (₹)", "GST (₹)", "Total (₹)", "Status"];
    const rows = selectedInvoices.map(i => [
      i.number,
      i.customer.shopName || i.customer.name,
      new Date(i.date).toLocaleDateString(),
      (i.discount || 0).toFixed(2),
      (i.tax || 0).toFixed(2),
      i.total.toFixed(2),
      i.paid ? "Paid" : "Unpaid"
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `invoices_export_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSelectedIds([]);
  };

  const handleBulkPrint = () => {
    alert("Bulk printing feature: Printing " + selectedIds.length + " invoices sequentially. Please wait for print prompts.");
    // In a real app, we might create a dedicated 'Bulk Print' route that renders all selected invoices on one long spool
    // For now, we'll suggest using individual print or we could sequentially navigate and print (too intrusive)
  };

  // Individual Actions
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

  const handleEdit = (invoice) => {
    navigate('/create-invoice', { state: { invoice } });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete invoice?')) {
      updateBusiness({ invoices: business.invoices.filter(i => i.id !== id) });
    }
  };

  const handleTogglePaid = (id) => {
    const newInvoices = business.invoices.map(i =>
      i.id === id ? { ...i, paid: !i.paid } : i
    );
    updateBusiness({ invoices: newInvoices });
  };

  return (
    <div className="invoices-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Invoices</h1>
        {selectedIds.length > 0 && (
          <div className="bulk-actions-bar" style={{
            display: 'flex',
            gap: '8px',
            background: 'var(--accent-color)',
            padding: '6px 16px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: 'var(--shadow-lg)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <span style={{ fontWeight: '600', alignSelf: 'center', marginRight: '8px', fontSize: '13px' }}>{selectedIds.length} Selected</span>
            <button onClick={() => handleBulkStatusChange(true)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px' }} title="Mark as Paid">
              <FaCheckCircle /> Paid
            </button>
            <button onClick={() => handleBulkStatusChange(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px' }} title="Mark as Unpaid">
              <FaTimesCircle /> Unpaid
            </button>
            <button onClick={handleBulkExport} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px' }} title="Export to CSV">
              <FaFileAlt /> Download
            </button>
            <button onClick={handleBulkDelete} style={{ background: 'rgba(255,0,0,0.3)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px' }} title="Delete Selected">
              <FaTrash /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="search-section" style={{ marginBottom: '24px' }}>
        <input
          className="search-input"
          placeholder="Search by number or customer"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </div>

      <div className="invoices-table" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredInvoices.length && filteredInvoices.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="sortable" onClick={() => toggleSort('number')}>
                Number {sortBy === 'number' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="sortable" onClick={() => toggleSort('customer')}>
                Customer {sortBy === 'customer' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="sortable" onClick={() => toggleSort('total')}>
                Total {sortBy === 'total' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="sortable" onClick={() => toggleSort('paid')}>
                Status {sortBy === 'paid' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th>Disc Amt</th>
              <th>GST Amt</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map(i => (
              <tr key={i.id} style={{ background: selectedIds.includes(i.id) ? 'var(--sidebar-item-active)' : 'transparent' }}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(i.id)}
                    onChange={() => toggleSelectOne(i.id)}
                  />
                </td>
                <td style={{ fontWeight: '600' }}>{i.number}</td>
                <td>
                  <div style={{ fontWeight: '600' }}>{i.customer.shopName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{i.customer.name}</div>
                </td>
                <td style={{ fontWeight: '700' }}>₹{i.total.toFixed(2)}</td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    background: i.paid ? '#ecfdf5' : '#fff1f2',
                    color: i.paid ? '#059669' : '#e11d48'
                  }}>
                    {i.paid ? 'PAID' : 'UNPAID'}
                  </span>
                </td>
                <td style={{ fontWeight: '600', color: '#dc2626', fontSize: '13px' }}>
                  ₹{(i.discount || 0).toFixed(2)}
                </td>
                <td style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  ₹{(i.tax || 0).toFixed(2)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="view-btn" onClick={() => navigate(`/invoice/${i.id}/view`)}>View</button>
                  <button className="duplicate-btn" onClick={() => handleDuplicate(i)}>Duplicate</button>
                  <button className="edit-btn" onClick={() => handleEdit(i)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(i.id)}>✕</button>
                </td>
              </tr>
            ))}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                  No invoices found. Try a different search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoices;