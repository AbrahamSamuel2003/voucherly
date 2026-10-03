import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CustomerDetails = ({ business, updateBusiness }) => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const customer = business.customers.find(c => c.id === customerId);

  if (!customer) return <div className="content">Customer not found</div>;

  const customerInvoices = business.invoices.filter(i => i.customer.id === customerId).sort((a, b) => new Date(b.date) - new Date(a.date));

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

  const handleDeleteInvoice = (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      updateBusiness({ invoices: business.invoices.filter(i => i.id !== id) });
    }
  };

  const handleTogglePaid = (id) => {
    const newInvoices = business.invoices.map(i =>
      i.id === id ? { ...i, paid: !i.paid } : i
    );
    updateBusiness({ invoices: newInvoices });
  };

  const formatAddress = () => {
    const parts = [customer.address, customer.city, customer.state, customer.pincode].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className="customer-details">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ marginBottom: '8px', color: 'var(--accent-color)' }}>{customer.shopName}</h1>
          <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{customer.name || 'No Contact Person'}</span>
            <span>•</span>
            <span>{customer.phoneNumber || 'No Phone Number'}</span>
          </div>
        </div>
        <button className="action-btn" onClick={() => navigate('/create-invoice', { state: { customer } })}>
          Create Invoice
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
        <div className="stat-card" style={{ textAlign: 'left' }}>
          <h3 style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '16px' }}>Contact & ID</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Shop Name</div>
              <div style={{ fontWeight: '600', color: 'var(--accent-color)' }}>{customer.shopName}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Contact Person</div>
              <div style={{ fontWeight: '500' }}>{customer.name || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Phone</div>
              <div style={{ fontWeight: '500' }}>{customer.phoneNumber || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>GST Number</div>
              <div style={{ fontWeight: '600' }}>{customer.gstNumber || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ textAlign: 'left' }}>
          <h3 style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '16px' }}>Address Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Street Address</div>
              <div style={{ fontWeight: '500', whiteSpace: 'pre-line' }}>{customer.address || 'N/A'}</div>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>City</div>
                <div style={{ fontWeight: '500' }}>{customer.city || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>State</div>
                <div style={{ fontWeight: '500' }}>{customer.state || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Pincode</div>
                <div style={{ fontWeight: '500' }}>{customer.pincode || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="stat-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px', margin: 0 }}>Invoice History</h2>
        </div>
        <table style={{ margin: 0 }}>
          <thead>
            <tr>
              <th>Number</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customerInvoices.map(i => (
              <tr key={i.id}>
                <td>{i.number}</td>
                <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{new Date(i.date).toLocaleDateString()}</td>
                <td style={{ fontWeight: '600' }}>₹{i.total.toFixed(2)}</td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '700',
                    background: i.paid ? '#ecfdf5' : '#fff1f2',
                    color: i.paid ? '#059669' : '#e11d48',
                    textTransform: 'uppercase'
                  }}>
                    {i.paid ? 'Paid' : 'Unpaid'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="view-btn" onClick={() => navigate(`/invoice/${i.id}/view`)}>View</button>
                  <button className="edit-btn" onClick={() => handleEdit(i)}>Edit</button>
                  <button className="edit-btn" onClick={() => handleTogglePaid(i.id)}>
                    {i.paid ? 'Unpaid' : 'Paid'}
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteInvoice(i.id)}>✕</button>
                </td>
              </tr>
            ))}
            {customerInvoices.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                  No invoices found for this customer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerDetails;