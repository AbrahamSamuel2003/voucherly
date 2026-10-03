import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Customers = ({ business, updateBusiness, showToast }) => {
  const [search, setSearch] = useState('');
  const initialCustomerState = {
    name: '',
    shopName: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: ''
  };
  const [newCustomer, setNewCustomer] = useState(initialCustomerState);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const filteredCustomers = business.customers.filter(c =>
    (c.shopName && c.shopName.toLowerCase().includes(search.toLowerCase())) ||
    (c.name && c.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddOrEdit = () => {
    if (!newCustomer.shopName) {
      showToast("Shop Name is required", "error");
      return;
    }

    let updatedCustomers;
    if (editingId) {
      updatedCustomers = business.customers.map(c => c.id === editingId ? { ...c, ...newCustomer } : c);
    } else {
      updatedCustomers = [...business.customers, { id: crypto.randomUUID(), ...newCustomer }];
    }
    updateBusiness({ customers: updatedCustomers });
    showToast(editingId ? 'Customer updated!' : 'Customer added!');
    setNewCustomer(initialCustomerState);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (customer) => {
    setNewCustomer(customer);
    setEditingId(customer.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      updateBusiness({ customers: business.customers.filter(c => c.id !== id) });
    }
  };

  const handleCreateInvoice = (customer) => {
    navigate('/create-invoice', { state: { customer } });
  };

  const isFieldValid = (field) => newCustomer[field] && newCustomer[field].trim() !== '';

  return (
    <div className="customers-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>Customers</h1>
        <button
          className="action-btn"
          onClick={() => {
            if (showForm) {
              setNewCustomer(initialCustomerState);
              setEditingId(null);
            }
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancel' : 'Add New Customer'}
        </button>
      </div>

      <div className="search-section" style={{ marginBottom: '24px' }}>
        <input
          className="search-input"
          placeholder="Search by name or shop..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </div>

      {showForm && (
        <div className="stat-card" style={{ textAlign: 'left', marginBottom: '32px', border: '1px solid var(--accent-color)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>{editingId ? 'Edit Customer' : 'Add New Customer'}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Shop Name *</label>
              <input
                className="form-input"
                placeholder="Business/Shop Name"
                value={newCustomer.shopName}
                onChange={e => setNewCustomer({ ...newCustomer, shopName: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Customer Name</label>
              <input
                className="form-input"
                placeholder="Contact Person Name"
                value={newCustomer.name}
                onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Phone Number</label>
              <input
                className="form-input"
                placeholder="Mobile or Landline"
                value={newCustomer.phoneNumber}
                onChange={e => setNewCustomer({ ...newCustomer, phoneNumber: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>GST Number</label>
              <input
                className="form-input"
                placeholder="GSTIN"
                value={newCustomer.gstNumber}
                onChange={e => setNewCustomer({ ...newCustomer, gstNumber: e.target.value })}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Complete Address</label>
              <textarea
                className="form-input"
                style={{ minHeight: '80px', resize: 'vertical' }}
                placeholder="Street address, building, etc."
                value={newCustomer.address}
                onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>City</label>
              <input
                className="form-input"
                placeholder="City"
                value={newCustomer.city}
                onChange={e => setNewCustomer({ ...newCustomer, city: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>State</label>
                <input
                  className="form-input"
                  placeholder="State"
                  value={newCustomer.state}
                  onChange={e => setNewCustomer({ ...newCustomer, state: e.target.value })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Pincode</label>
                <input
                  className="form-input"
                  placeholder="Zip"
                  value={newCustomer.pincode}
                  onChange={e => setNewCustomer({ ...newCustomer, pincode: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button className="action-btn" onClick={handleAddOrEdit} style={{ padding: '12px 32px' }}>
              {editingId ? 'Save Changes' : 'Save Customer'}
            </button>
            <button
              className="delete-btn"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setNewCustomer(initialCustomerState);
              }}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="stat-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ margin: 0 }}>
          <thead>
            <tr>
              <th>Name & Shop</th>
              <th>Contact</th>
              <th>Location</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ fontWeight: '600', color: 'var(--accent-color)' }}>{c.shopName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.name || 'No Contact Name'}</div>
                </td>
                <td>
                  <div style={{ fontSize: '13px' }}>{c.phoneNumber || 'N/A'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--accent-color)', fontWeight: '500' }}>{c.gstNumber}</div>
                </td>
                <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {c.city && c.state ? `${c.city}, ${c.state}` : c.city || c.state || 'N/A'}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="view-btn" onClick={() => handleCreateInvoice(c)} title="Direct Invoice">Invoice</button>
                  <button className="edit-btn" onClick={() => handleEdit(c)}>Edit</button>
                  <Link className="view-btn" to={`/customers/${c.id}`} style={{ textDecoration: 'none', display: 'inline-block' }}>View</Link>
                  <button className="delete-btn" onClick={() => handleDelete(c.id)}>✕</button>
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                  No customers found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;