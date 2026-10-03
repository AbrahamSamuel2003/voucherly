import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ business, updateBusiness }) => {
  const navigate = useNavigate();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calculate monthly profits
  const monthlyProfit = business.invoices
    .filter(i => i.paid && new Date(i.date).getMonth() === currentMonth && new Date(i.date).getFullYear() === currentYear)
    .reduce((sum, i) => sum + i.total, 0);

  // Yearly profits
  const yearlyProfit = business.invoices
    .filter(i => i.paid && new Date(i.date).getFullYear() === now.getFullYear())
    .reduce((sum, i) => sum + i.total, 0);

  // Find last month profits
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const lastMonthlyProfit = business.invoices
    .filter(i => i.paid && new Date(i.date).getMonth() === lastMonth && new Date(i.date).getFullYear() === lastMonthYear)
    .reduce((sum, i) => sum + i.total, 0);

  // Calculate percent change
  let percentChange = 0;
  let changeText = '';
  if (lastMonthlyProfit > 0) {
    percentChange = ((monthlyProfit - lastMonthlyProfit) / lastMonthlyProfit) * 100;
    changeText = `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}% from last month`;
  } else if (monthlyProfit > 0) {
    changeText = 'New growth';
  }

  const paidInvoices = business.invoices.filter(i => i.paid);
  const unpaidInvoices = business.invoices.filter(i => !i.paid);
  const recentInvoices = [...business.invoices]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Duplicate invoice function
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

  // Edit invoice
  const handleEdit = (invoice) => {
    navigate('/create-invoice', { state: { invoice } });
  };

  // Toggle paid status
  const handleTogglePaid = (id) => {
    const newInvoices = business.invoices.map(i =>
      i.id === id ? { ...i, paid: !i.paid } : i
    );
    updateBusiness({ invoices: newInvoices });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div style={styles.container}>
      {/* Embedded Styles */}
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .stat-card {
            animation: fadeInUp 0.5s ease forwards;
          }

          .table-row {
            animation: slideIn 0.3s ease forwards;
            transition: all 0.2s ease;
          }

          .table-row:hover {
            background: #f8fafc;
          }

          .action-btn {
            transition: all 0.2s ease;
          }

          .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }

          .toggle-paid-btn {
            transition: all 0.2s ease;
          }

          .toggle-paid-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
        `}
      </style>

      {/* Header Section */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>
            Welcome back, {business.name} • {formatDate(now)}
          </p>
        </div>
        <div style={styles.headerActions}>
          <button 
            style={styles.primaryButton}
            onClick={() => navigate('/create-invoice')}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <span style={styles.buttonIcon}>+</span>
            New Invoice
          </button>
          <button 
            style={styles.secondaryButton}
            onClick={() => navigate('/customers')}
          >
            <span style={styles.buttonIcon}>👥</span>
            Customers
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {/* Monthly Profit Card */}
        <div className="stat-card" style={{...styles.statCard, animationDelay: '0.1s'}}>
          <div style={styles.statIconWrapper}>
            <span style={styles.statIcon}>📈</span>
          </div>
          <div style={styles.statContent}>
            <span style={styles.statLabel}>Monthly Profit</span>
            <div style={styles.statValueWrapper}>
              <span style={styles.statValue}>{formatCurrency(monthlyProfit)}</span>
              {lastMonthlyProfit > 0 && (
                <span style={{
                  ...styles.statChange,
                  color: percentChange >= 0 ? '#10b981' : '#ef4444',
                  background: percentChange >= 0 ? '#d1fae5' : '#fee2e2'
                }}>
                  {percentChange >= 0 ? '↑' : '↓'} {Math.abs(percentChange).toFixed(1)}%
                </span>
              )}
            </div>
            <span style={styles.statPeriod}>{changeText}</span>
          </div>
        </div>

        {/* Yearly Profit Card */}
        <div className="stat-card" style={{...styles.statCard, animationDelay: '0.2s'}}>
          <div style={styles.statIconWrapper}>
            <span style={styles.statIcon}>📊</span>
          </div>
          <div style={styles.statContent}>
            <span style={styles.statLabel}>Yearly Profit</span>
            <span style={styles.statValue}>{formatCurrency(yearlyProfit)}</span>
            <span style={styles.statPeriod}>Financial Year {currentYear}</span>
          </div>
        </div>

        {/* Paid Invoices Card */}
        <div className="stat-card" style={{...styles.statCard, animationDelay: '0.3s'}}>
          <div style={{...styles.statIconWrapper, background: '#d1fae5'}}>
            <span style={styles.statIcon}>✅</span>
          </div>
          <div style={styles.statContent}>
            <span style={styles.statLabel}>Paid Invoices</span>
            <div style={styles.statValueWrapper}>
              <span style={styles.statValue}>{paidInvoices.length}</span>
              <span style={styles.statSubValue}>{formatCurrency(paidInvoices.reduce((sum, i) => sum + i.total, 0))}</span>
            </div>
            <span style={styles.statPeriod}>
              {((paidInvoices.length / business.invoices.length) * 100 || 0).toFixed(1)}% of total
            </span>
          </div>
        </div>

        {/* Unpaid Invoices Card */}
        <div className="stat-card" style={{...styles.statCard, animationDelay: '0.4s'}}>
          <div style={{...styles.statIconWrapper, background: '#fee2e2'}}>
            <span style={styles.statIcon}>⏳</span>
          </div>
          <div style={styles.statContent}>
            <span style={styles.statLabel}>Unpaid Invoices</span>
            <div style={styles.statValueWrapper}>
              <span style={styles.statValue}>{unpaidInvoices.length}</span>
              <span style={styles.statSubValue}>{formatCurrency(unpaidInvoices.reduce((sum, i) => sum + i.total, 0))}</span>
            </div>
            <span style={styles.statPeriod}>
              {((unpaidInvoices.length / business.invoices.length) * 100 || 0).toFixed(1)}% of total
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        <button style={styles.quickAction} onClick={() => navigate('/products')}>
          <span style={styles.quickActionIcon}>📦</span>
          <span style={styles.quickActionLabel}>Products</span>
        </button>
        <button style={styles.quickAction} onClick={() => navigate('/reports')}>
          <span style={styles.quickActionIcon}>📑</span>
          <span style={styles.quickActionLabel}>Reports</span>
        </button>
        <button style={styles.quickAction} onClick={() => navigate('/settings')}>
          <span style={styles.quickActionIcon}>⚙️</span>
          <span style={styles.quickActionLabel}>Settings</span>
        </button>
        <button style={styles.quickAction} onClick={() => navigate('/customers')}>
          <span style={styles.quickActionIcon}>👥</span>
          <span style={styles.quickActionLabel}>Customers</span>
        </button>
      </div>

      {/* Recent Invoices Section */}
      <div style={styles.recentInvoices}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Invoices</h2>
          <button 
            style={styles.viewAllButton}
            onClick={() => navigate('/invoices')}
          >
            View All →
          </button>
        </div>

        {recentInvoices.length > 0 ? (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  <th style={styles.tableHeader}>Invoice</th>
                  <th style={styles.tableHeader}>Customer</th>
                  <th style={styles.tableHeader}>Date</th>
                  <th style={styles.tableHeader}>Amount</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((invoice, index) => (
                  <tr 
                    key={invoice.id} 
                    className="table-row"
                    style={{
                      ...styles.tableRow,
                      animationDelay: `${0.1 * (index + 1)}s`
                    }}
                  >
                    <td style={styles.tableCell}>
                      <div style={styles.invoiceNumber}>{invoice.number}</div>
                      <div style={styles.invoiceId}>ID: {invoice.id.slice(0, 8)}</div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.customerName}>{invoice.customer.shopName}</div>
                      <div style={styles.customerContact}>{invoice.customer.name}</div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.dateText}>{formatDate(invoice.date)}</div>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={styles.amount}>{formatCurrency(invoice.total)}</span>
                    </td>
                    <td style={styles.tableCell}>
                      <span 
                        className="status-badge"
                        style={{
                          ...styles.statusBadge,
                          background: invoice.paid ? '#d1fae5' : '#fee2e2',
                          color: invoice.paid ? '#059669' : '#dc2626'
                        }}
                      >
                        {invoice.paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.actionButtons}>
                        <button
                          className="action-btn"
                          style={styles.actionButton}
                          onClick={() => handleEdit(invoice)}
                          title="Edit Invoice"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="action-btn"
                          style={styles.actionButton}
                          onClick={() => handleDuplicate(invoice)}
                          title="Duplicate Invoice"
                        >
                          📋 Duplicate
                        </button>
                        <button
                          className="toggle-paid-btn"
                          style={{
                            ...styles.togglePaidButton,
                            background: invoice.paid ? '#fee2e2' : '#d1fae5',
                            color: invoice.paid ? '#dc2626' : '#059669',
                            borderColor: invoice.paid ? '#fecaca' : '#a7f3d0'
                          }}
                          onClick={() => handleTogglePaid(invoice.id)}
                          title={invoice.paid ? 'Mark as Unpaid' : 'Mark as Paid'}
                        >
                          {invoice.paid ? '↩️ Mark Unpaid' : '✅ Mark Paid'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>📄</div>
            <h3 style={styles.emptyStateTitle}>No invoices yet</h3>
            <p style={styles.emptyStateText}>
              Create your first invoice to start tracking your business revenue.
            </p>
            <button 
              style={styles.emptyStateButton}
              onClick={() => navigate('/create-invoice')}
            >
              Create First Invoice
            </button>
          </div>
        )}
      </div>
    </div>
  );
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

  headerActions: {
    display: 'flex',
    gap: '12px',
  },

  primaryButton: {
    padding: '10px 20px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
  },

  secondaryButton: {
    padding: '10px 20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    background: 'white',
    color: '#334155',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },

  buttonIcon: {
    fontSize: '18px',
    lineHeight: 1,
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },

  statCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    display: 'flex',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    opacity: 0,
    animation: 'fadeInUp 0.5s ease forwards',
  },

  statIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: '#e0e7ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },

  statIcon: {
    fontSize: '24px',
  },

  statContent: {
    flex: 1,
  },

  statLabel: {
    display: 'block',
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  statValueWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '4px',
    flexWrap: 'wrap',
  },

  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 1.2,
  },

  statSubValue: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500',
  },

  statChange: {
    padding: '4px 8px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },

  statPeriod: {
    fontSize: '12px',
    color: '#94a3b8',
  },

  quickActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
    marginBottom: '32px',
  },

  quickAction: {
    padding: '16px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    background: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.2s ease',
  },

  quickActionIcon: {
    fontSize: '20px',
  },

  quickActionLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#334155',
  },

  recentInvoices: {
    background: 'white',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },

  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },

  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#0f172a',
    margin: 0,
  },

  viewAllButton: {
    padding: '8px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    background: 'white',
    color: '#4f46e5',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  tableContainer: {
    overflowX: 'auto',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '1000px',
  },

  tableHead: {
    background: '#f8fafc',
  },

  tableHeader: {
    padding: '16px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #e2e8f0',
  },

  tableRow: {
    borderBottom: '1px solid #e2e8f0',
    opacity: 0,
    animation: 'slideIn 0.3s ease forwards',
  },

  tableCell: {
    padding: '16px',
    fontSize: '14px',
    color: '#334155',
  },

  invoiceNumber: {
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '2px',
  },

  invoiceId: {
    fontSize: '11px',
    color: '#94a3b8',
  },

  customerName: {
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: '2px',
  },

  customerContact: {
    fontSize: '12px',
    color: '#64748b',
  },

  dateText: {
    color: '#64748b',
    fontSize: '13px',
  },

  amount: {
    fontWeight: '600',
    color: '#0f172a',
  },

  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },

  actionButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },

  actionButton: {
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: 'white',
    color: '#334155',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s ease',
  },

  togglePaidButton: {
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s ease',
  },

  emptyState: {
    textAlign: 'center',
    padding: '48px',
  },

  emptyStateIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },

  emptyStateTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#0f172a',
    margin: '0 0 8px',
  },

  emptyStateText: {
    fontSize: '14px',
    color: '#64748b',
    margin: '0 0 24px',
  },

  emptyStateButton: {
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    background: '#4f46e5',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export default Dashboard;