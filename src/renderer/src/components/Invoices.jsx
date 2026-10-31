import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaCheckCircle, FaTimesCircle, FaFileAlt, FaSearch, FaFilter, FaRedo, FaPlus } from 'react-icons/fa';

const Invoices = ({ business, updateBusiness }) => {
  const navigate = useNavigate();

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'paid' | 'unpaid'
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'this_week' | 'this_month' | 'last_month' | 'this_year' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all');

  // Sorting: Default to 'date' descending (Most recent first)
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedIds, setSelectedIds] = useState([]);

  // Extract unique customer/shop list for filter dropdown
  const customerOptions = useMemo(() => {
    const map = new Map();
    (business.customers || []).forEach(c => {
      if (c.shopName) map.set(c.shopName.trim(), c.shopName.trim());
    });
    (business.invoices || []).forEach(i => {
      if (i.customer?.shopName) {
        map.set(i.customer.shopName.trim(), i.customer.shopName.trim());
      }
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [business.customers, business.invoices]);

  // Fast index map for fallback tie-breaker
  const invoiceIndexMap = useMemo(() => {
    const map = new Map();
    (business.invoices || []).forEach((inv, index) => {
      map.set(inv.id, index);
    });
    return map;
  }, [business.invoices]);

  // Helper to extract timestamp safely
  const getInvoiceTime = (inv) => {
    if (!inv || !inv.date) return 0;
    const t = new Date(inv.date).getTime();
    return isNaN(t) ? 0 : t;
  };

  // Helper to extract number sequence (e.g. "INV-104" -> 104)
  const getInvoiceSeq = (inv) => {
    if (!inv || !inv.number) return 0;
    const match = String(inv.number).match(/\d+/g);
    if (match) {
      return parseInt(match[match.length - 1], 10) || 0;
    }
    return 0;
  };

  // Status Counts
  const statusCounts = useMemo(() => {
    const invoices = business.invoices || [];
    let paid = 0;
    let unpaid = 0;
    invoices.forEach(i => {
      if (i.paid) paid++;
      else unpaid++;
    });
    return { all: invoices.length, paid, unpaid };
  }, [business.invoices]);

  // Filter Pipeline
  const filteredInvoices = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = startOfToday + 86400000 - 1;

    return (business.invoices || []).filter(invoice => {
      // 1. Text Search (Number, Shop Name, Customer Name, Phone, Items)
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const matchesNumber = (invoice.number || '').toLowerCase().includes(query);
        const matchesShop = (invoice.customer?.shopName || '').toLowerCase().includes(query);
        const matchesName = (invoice.customer?.name || '').toLowerCase().includes(query);
        const matchesPhone = (invoice.customer?.phone || invoice.customer?.phoneNumber || '').includes(query);
        const matchesItem = (invoice.items || []).some(item => (item.name || '').toLowerCase().includes(query));

        if (!matchesNumber && !matchesShop && !matchesName && !matchesPhone && !matchesItem) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter === 'paid' && !invoice.paid) return false;
      if (statusFilter === 'unpaid' && invoice.paid) return false;

      // 3. Customer / Shop Filter
      if (customerFilter !== 'all') {
        const shopName = (invoice.customer?.shopName || '').trim().toLowerCase();
        if (shopName !== customerFilter.toLowerCase()) return false;
      }

      // 4. Date Range Filter
      if (dateFilter !== 'all') {
        const invTime = getInvoiceTime(invoice);
        if (!invTime) return false;
        const invDate = new Date(invTime);

        if (dateFilter === 'today') {
          if (invTime < startOfToday || invTime > endOfToday) return false;
        } else if (dateFilter === 'this_week') {
          const sevenDaysAgo = startOfToday - 6 * 86400000;
          if (invTime < sevenDaysAgo || invTime > endOfToday) return false;
        } else if (dateFilter === 'this_month') {
          if (invDate.getMonth() !== now.getMonth() || invDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
        } else if (dateFilter === 'last_month') {
          const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
          const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
          if (invDate.getMonth() !== lastMonth || invDate.getFullYear() !== lastMonthYear) {
            return false;
          }
        } else if (dateFilter === 'this_year') {
          if (invDate.getFullYear() !== now.getFullYear()) return false;
        } else if (dateFilter === 'custom') {
          if (customStartDate) {
            const startLimit = new Date(`${customStartDate}T00:00:00`).getTime();
            if (invTime < startLimit) return false;
          }
          if (customEndDate) {
            const endLimit = new Date(`${customEndDate}T23:59:59`).getTime();
            if (invTime > endLimit) return false;
          }
        }
      }

      return true;
    });
  }, [business.invoices, search, statusFilter, customerFilter, dateFilter, customStartDate, customEndDate]);

  // Robust Sorting Pipeline (Guaranteed Recent-First)
  const sortedInvoices = useMemo(() => {
    return [...filteredInvoices].sort((a, b) => {
      const indexA = invoiceIndexMap.get(a.id) ?? 0;
      const indexB = invoiceIndexMap.get(b.id) ?? 0;
      let res = 0;

      switch (sortBy) {
        case 'number': {
          const seqA = getInvoiceSeq(a);
          const seqB = getInvoiceSeq(b);
          if (seqA !== seqB) {
            res = seqA - seqB;
          } else {
            res = (a.number || '').localeCompare(b.number || '', undefined, { numeric: true });
          }
          break;
        }
        case 'date': {
          const timeA = getInvoiceTime(a);
          const timeB = getInvoiceTime(b);
          if (timeA !== timeB) {
            res = timeA - timeB;
          } else {
            // Same day/timestamp tie-breaker: higher sequence or later array index first
            const seqA = getInvoiceSeq(a);
            const seqB = getInvoiceSeq(b);
            if (seqA !== seqB) {
              res = seqA - seqB;
            } else {
              res = indexA - indexB;
            }
          }
          break;
        }
        case 'customer': {
          const nameA = (a.customer?.shopName || a.customer?.name || '').toLowerCase();
          const nameB = (b.customer?.shopName || b.customer?.name || '').toLowerCase();
          res = nameA.localeCompare(nameB);
          break;
        }
        case 'total': {
          res = (parseFloat(a.total) || 0) - (parseFloat(b.total) || 0);
          break;
        }
        case 'paid': {
          const paidA = a.paid ? 1 : 0;
          const paidB = b.paid ? 1 : 0;
          res = paidA - paidB;
          break;
        }
        default:
          res = 0;
      }

      if (res !== 0) {
        return sortDir === 'asc' ? res : -res;
      }

      // Default fallback tie-breaker: later creation comes first when sortDir === 'desc'
      const tieSeq = getInvoiceSeq(b) - getInvoiceSeq(a);
      if (tieSeq !== 0) return sortDir === 'asc' ? -tieSeq : tieSeq;
      return sortDir === 'asc' ? indexA - indexB : indexB - indexA;
    });
  }, [filteredInvoices, sortBy, sortDir, invoiceIndexMap]);

  // Live Summary of Filtered Invoices
  const summary = useMemo(() => {
    let totalBilled = 0;
    let paidAmount = 0;
    let unpaidAmount = 0;

    sortedInvoices.forEach(inv => {
      const amt = parseFloat(inv.total) || 0;
      totalBilled += amt;
      if (inv.paid) paidAmount += amt;
      else unpaidAmount += amt;
    });

    return {
      count: sortedInvoices.length,
      totalBilled,
      paidAmount,
      unpaidAmount
    };
  }, [sortedInvoices]);

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      // For date or total, default to desc (highest / newest first)
      setSortDir(column === 'date' || column === 'total' ? 'desc' : 'asc');
    }
  };

  const isFilterActive = search !== '' || statusFilter !== 'all' || dateFilter !== 'all' || customerFilter !== 'all' || customStartDate !== '' || customEndDate !== '';

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setDateFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setCustomerFilter('all');
    setSortBy('date');
    setSortDir('desc');
  };

  // Selection Logic
  const toggleSelectAll = () => {
    if (selectedIds.length === sortedInvoices.length && sortedInvoices.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedInvoices.map(i => i.id));
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
    const targetInvoices = selectedIds.length > 0
      ? business.invoices.filter(i => selectedIds.includes(i.id))
      : sortedInvoices;

    const headers = ["Invoice Number", "Customer", "Date", "Discount (₹)", "GST (₹)", "Total (₹)", "Status"];
    const rows = targetInvoices.map(i => [
      i.number,
      i.customer?.shopName || i.customer?.name || '',
      new Date(i.date).toLocaleDateString(),
      (i.discount || 0).toFixed(2),
      (i.tax || 0).toFixed(2),
      (i.total || 0).toFixed(2),
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

  // Individual Actions
  const handleDuplicate = (invoice) => {
    const newInvoice = {
      ...invoice,
      id: crypto.randomUUID(),
      number: `${business.settings?.invoicePrefix || 'INV'}-${(business.lastInvoiceNumber || 0) + 1}`,
      date: new Date().toISOString(),
      paid: false
    };
    navigate('/create-invoice', { state: { invoice: newInvoice } });
  };

  const handleEdit = (invoice) => {
    navigate('/create-invoice', { state: { invoice } });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this invoice?')) {
      updateBusiness({ invoices: business.invoices.filter(i => i.id !== id) });
    }
  };

  return (
    <div className="invoices-page">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px' }}>Invoices</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
            Manage, filter, and track all your business billing invoices.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {selectedIds.length > 0 && (
            <div className="bulk-actions-bar" style={{
              display: 'flex',
              gap: '8px',
              background: 'var(--accent-color)',
              padding: '6px 14px',
              borderRadius: '10px',
              color: 'white',
              boxShadow: 'var(--shadow-md)',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: '600', fontSize: '12px', marginRight: '6px' }}>{selectedIds.length} Selected</span>
              <button onClick={() => handleBulkStatusChange(true)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 8px', borderRadius: '6px', fontSize: '12px' }} title="Mark as Paid">
                <FaCheckCircle /> Paid
              </button>
              <button onClick={() => handleBulkStatusChange(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 8px', borderRadius: '6px', fontSize: '12px' }} title="Mark as Unpaid">
                <FaTimesCircle /> Unpaid
              </button>
              <button onClick={handleBulkExport} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 8px', borderRadius: '6px', fontSize: '12px' }} title="Export Selected">
                <FaFileAlt /> Export
              </button>
              <button onClick={handleBulkDelete} style={{ background: 'rgba(239, 68, 68, 0.4)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 8px', borderRadius: '6px', fontSize: '12px' }} title="Delete Selected">
                <FaTrash /> Delete
              </button>
            </div>
          )}

          <button
            className="action-btn"
            style={{ background: 'white', color: 'var(--text-main)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={handleBulkExport}
            title="Download CSV report of current filtered view"
          >
            <FaFileAlt /> Export CSV
          </button>

          <button
            className="action-btn"
            onClick={() => navigate('/create-invoice')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FaPlus /> New Invoice
          </button>
        </div>
      </div>

      {/* Live Financial Metrics Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div className="stat-card" style={{ padding: '16px 20px', borderRadius: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Filtered Invoices</div>
          <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px', color: 'var(--text-main)' }}>{summary.count}</div>
        </div>
        <div className="stat-card" style={{ padding: '16px 20px', borderRadius: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Billed</div>
          <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px', color: 'var(--accent-color)' }}>₹{summary.totalBilled.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-card" style={{ padding: '16px 20px', borderRadius: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Paid Amount</div>
          <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px', color: '#059669' }}>₹{summary.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-card" style={{ padding: '16px 20px', borderRadius: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Outstanding (Unpaid)</div>
          <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px', color: '#e11d48' }}>₹{summary.unpaidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Row 1: Search & Status Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: '1', minWidth: '260px', maxWidth: '420px' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              className="search-input"
              placeholder="Search by number, shop, customer, item..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '34px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {/* Status Pills */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', gap: '4px' }}>
            <button
              onClick={() => setStatusFilter('all')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                background: statusFilter === 'all' ? 'white' : 'transparent',
                color: statusFilter === 'all' ? 'var(--text-main)' : 'var(--text-secondary)',
                boxShadow: statusFilter === 'all' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              All ({statusCounts.all})
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                background: statusFilter === 'paid' ? '#ecfdf5' : 'transparent',
                color: statusFilter === 'paid' ? '#059669' : 'var(--text-secondary)',
                boxShadow: statusFilter === 'paid' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              Paid ({statusCounts.paid})
            </button>
            <button
              onClick={() => setStatusFilter('unpaid')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                background: statusFilter === 'unpaid' ? '#fff1f2' : 'transparent',
                color: statusFilter === 'unpaid' ? '#e11d48' : 'var(--text-secondary)',
                boxShadow: statusFilter === 'unpaid' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              Unpaid ({statusCounts.unpaid})
            </button>
          </div>
        </div>

        {/* Row 2: Date Filters, Customer Filter & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>
            <FaFilter style={{ fontSize: '12px' }} /> Filters:
          </div>

          {/* Date Period Preset */}
          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '150px', padding: '8px 12px', fontSize: '13px' }}
          >
            <option value="all">📅 All Time</option>
            <option value="today">Today</option>
            <option value="this_week">This Week (Last 7 Days)</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
            <option value="custom">Custom Date Range...</option>
          </select>

          {/* Custom Date Inputs */}
          {dateFilter === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                style={{ width: 'auto', padding: '6px 10px', fontSize: '13px' }}
                title="Start Date"
              />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                style={{ width: 'auto', padding: '6px 10px', fontSize: '13px' }}
                title="End Date"
              />
            </div>
          )}

          {/* Customer / Shop Filter */}
          <select
            value={customerFilter}
            onChange={e => setCustomerFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '160px', padding: '8px 12px', fontSize: '13px' }}
          >
            <option value="all">🏪 All Customers / Shops</option>
            {customerOptions.map(shop => (
              <option key={shop} value={shop}>{shop}</option>
            ))}
          </select>

          {/* Clear Filters Button */}
          {isFilterActive && (
            <button
              onClick={handleResetFilters}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: 'var(--text-secondary)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginLeft: 'auto'
              }}
            >
              <FaRedo style={{ fontSize: '10px' }} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="invoices-table" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === sortedInvoices.length && sortedInvoices.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="sortable" onClick={() => toggleSort('number')}>
                Number {sortBy === 'number' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="sortable" onClick={() => toggleSort('date')}>
                Date {sortBy === 'date' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
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
            {sortedInvoices.map(i => (
              <tr key={i.id} style={{ background: selectedIds.includes(i.id) ? 'var(--sidebar-item-active)' : 'transparent' }}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(i.id)}
                    onChange={() => toggleSelectOne(i.id)}
                  />
                </td>
                <td style={{ fontWeight: '600' }}>{i.number}</td>
                <td style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {i.date ? new Date(i.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                </td>
                <td>
                  <div style={{ fontWeight: '600' }}>{i.customer?.shopName || '-'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{i.customer?.name || ''}</div>
                </td>
                <td style={{ fontWeight: '700' }}>₹{(i.total || 0).toFixed(2)}</td>
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
            {sortedInvoices.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                  No invoices found matching your filters.
                  {isFilterActive && (
                    <div style={{ marginTop: '12px' }}>
                      <button className="action-btn" onClick={handleResetFilters} style={{ padding: '6px 16px', fontSize: '13px' }}>
                        Reset Filters
                      </button>
                    </div>
                  )}
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