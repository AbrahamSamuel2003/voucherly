import React, { useState } from 'react';

const Items = ({ business, updateBusiness, showToast }) => {
  const [search, setSearch] = useState('');
  const initialItemState = {
    name: '',
    hsnCode: '',
    unit: 'Box',
    price: '',
    mrp: '',
    gstPercent: '18',
    description: ''
  };
  const [newItem, setNewItem] = useState(initialItemState);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // filter item if searched
  const filteredItems = business.items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.hsnCode && i.hsnCode.includes(search))
  );

  // add or edit an item
  const handleAddOrEdit = () => {
    if (!newItem.name || !newItem.price) {
      showToast("Product Name and Price are required", "error");
      return;
    }

    let updatedItems;
    if (editingId) {
      updatedItems = business.items.map(i => i.id === editingId ? { ...i, ...newItem } : i);
    } else {
      updatedItems = [...business.items, { id: crypto.randomUUID(), ...newItem }];
    }
    updateBusiness({ items: updatedItems });
    showToast(editingId ? 'Product updated!' : 'Product added!');
    setNewItem(initialItemState);
    setEditingId(null);
    setShowForm(false);
  };

  // edit an item
  const handleEdit = (item) => {
    setNewItem(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  // delete an item but confirm
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this product?')) {
      updateBusiness({ items: business.items.filter(i => i.id !== id) });
    }
  };

  return (
    <div className="items-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>Products & Items</h1>
        <button
          className="action-btn"
          onClick={() => {
            if (showForm) {
              setNewItem(initialItemState);
              setEditingId(null);
            }
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancel' : 'Add New Product'}
        </button>
      </div>

      <div className="search-section" style={{ marginBottom: '24px' }}>
        <input
          className="search-input"
          placeholder="Search by name or HSN code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </div>

      {showForm && (
        <div className="stat-card" style={{ textAlign: 'left', marginBottom: '32px', border: '1px solid var(--accent-color)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>{editingId ? 'Edit Product' : 'Add New Product'}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Product Name *</label>
              <input
                className="form-input"
                placeholder="e.g. Premium Basmati Rice"
                value={newItem.name}
                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>HSN Code</label>
              <input
                className="form-input"
                placeholder="8-digit code"
                value={newItem.hsnCode}
                onChange={e => setNewItem({ ...newItem, hsnCode: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>MRP (₹)</label>
              <input
                className="form-input"
                type="number"
                placeholder="0.00"
                value={newItem.mrp}
                onChange={e => setNewItem({ ...newItem, mrp: parseFloat(e.target.value) || '' })}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Unit</label>
              <select
                className="form-input"
                value={newItem.unit}
                onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
              >
                <option value="Kg">Kg</option>
                <option value="Litre">Litre</option>
                <option value="Tin">Tin</option>
                <option value="Box">Box</option>
                <option value="Pcs">Pcs</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>NET RATE *</label>
              <input
                className="form-input"
                type="number"
                placeholder="0.00"
                value={newItem.price}
                onChange={e => setNewItem({ ...newItem, price: parseFloat(e.target.value) || '' })}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>GST %</label>
              <input
                className="form-input"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="0.00"
                value={newItem.gstPercent}
                onChange={e => setNewItem({ ...newItem, gstPercent: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div style={{ gridColumn: 'span 3' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Description</label>
              <input
                className="form-input"
                placeholder="Short detail (appears on invoice)"
                value={newItem.description}
                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button className="action-btn" onClick={handleAddOrEdit} style={{ padding: '12px 32px' }}>
              {editingId ? 'Save Changes' : 'Save Product'}
            </button>
            <button
              className="delete-btn"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setNewItem(initialItemState);
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
              <th>Product Details</th>
              <th>HSN Code</th>
              <th>Unit</th>
              <th>NET RATE</th>
              <th>MRP</th>
              <th>GST</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(i => (
              <tr key={i.id}>
                <td>
                  <div style={{ fontWeight: '600' }}>{i.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{i.description || 'No description'}</div>
                </td>
                <td style={{ fontSize: '13px', fontFamily: 'monospace' }}>{i.hsnCode || 'N/A'}</td>
                <td>
                  <span style={{ fontSize: '12px', padding: '2px 6px', background: '#f1f5f9', borderRadius: '4px' }}>{i.unit}</span>
                </td>
                <td style={{ fontWeight: '600' }}>₹{Number(i.price).toFixed(2)}</td>
                <td style={{ fontWeight: '600', color: '#059669' }}>{i.mrp ? `₹${Number(i.mrp).toFixed(2)}` : '-'}</td>
                <td style={{ fontSize: '13px', color: 'var(--accent-color)', fontWeight: '500' }}>{i.gstPercent}%</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="edit-btn" onClick={() => handleEdit(i)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(i.id)}>✕</button>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                  No products found. Start by adding your first product!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Items;