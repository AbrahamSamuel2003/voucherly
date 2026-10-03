import React, { useState } from 'react';

const Settings = ({ business, updateBusiness, showToast }) => {
  const [settings, setSettings] = useState({
    name: '',
    ownerName: '',
    phoneNumber: '',
    gstin: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    invoicePrefix: 'INV',
    footerNote: 'Thank you for your business!',
    logo: null,
    ...business.settings
  });

  const handleSave = () => {
    updateBusiness({ settings });
    showToast('Settings saved successfully!');
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSettings(prev => ({ ...prev, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="settings-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>Business Settings</h1>
        <button className="save-btn" onClick={handleSave} style={{ padding: '12px 32px' }}>Save Settings</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Basic Information */}
        <div className="stat-card" style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Basic Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Company Name</label>
              <input
                className="form-input"
                placeholder="Business Name"
                value={settings.name}
                onChange={e => setSettings({ ...settings, name: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Owner Name</label>
              <input
                className="form-input"
                placeholder="Manager or Owner Name"
                value={settings.ownerName}
                onChange={e => setSettings({ ...settings, ownerName: e.target.value })}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Phone Number</label>
                <input
                  className="form-input"
                  placeholder="Contact Number"
                  value={settings.phoneNumber}
                  onChange={e => setSettings({ ...settings, phoneNumber: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>GSTIN</label>
                <input
                  className="form-input"
                  placeholder="GST Number"
                  value={settings.gstin}
                  onChange={e => setSettings({ ...settings, gstin: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div className="stat-card" style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Location Details</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Street Address</label>
              <textarea
                className="form-input"
                style={{ minHeight: '80px' }}
                placeholder="Building, Street, Area"
                value={settings.address}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>City</label>
                <input
                  className="form-input"
                  placeholder="City"
                  value={settings.city}
                  onChange={e => setSettings({ ...settings, city: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>State</label>
                <input
                  className="form-input"
                  placeholder="State"
                  value={settings.state}
                  onChange={e => setSettings({ ...settings, state: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Pincode</label>
                <input
                  className="form-input"
                  placeholder="Zip Code"
                  value={settings.pincode}
                  onChange={e => setSettings({ ...settings, pincode: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bank & Payment Details */}
        <div className="stat-card" style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Payment & Banking</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Bank Name</label>
              <input
                className="form-input"
                placeholder="e.g. HDFC Bank"
                value={settings.bankName}
                onChange={e => setSettings({ ...settings, bankName: e.target.value })}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Account Number</label>
                <input
                  className="form-input"
                  placeholder="Account No."
                  value={settings.accountNumber}
                  onChange={e => setSettings({ ...settings, accountNumber: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>IFSC Code</label>
                <input
                  className="form-input"
                  placeholder="IFSC"
                  value={settings.ifscCode}
                  onChange={e => setSettings({ ...settings, ifscCode: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>UPI ID</label>
              <input
                className="form-input"
                placeholder="business@upi"
                value={settings.upiId}
                onChange={e => setSettings({ ...settings, upiId: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Branding & Invoicing */}
        <div className="stat-card" style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Branding & Invoicing</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              {settings.logo ? (
                <div style={{ position: 'relative' }}>
                  <img src={settings.logo} alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                  <button
                    onClick={() => setSettings({ ...settings, logo: null })}
                    style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#e11d48', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '10px', cursor: 'pointer' }}
                  >✕</button>
                </div>
              ) : (
                <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '11px', textAlign: 'center', padding: '10px' }}>
                  No Logo
                </div>
              )}
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Business Logo</label>
                <input
                  type="file"
                  id="logo-upload"
                  onChange={handleLogoChange}
                  style={{ display: 'none' }}
                  accept="image/*"
                />
                <label
                  htmlFor="logo-upload"
                  className="action-btn"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: 'var(--text-main)', display: 'inline-block', cursor: 'pointer', fontSize: '13px' }}
                >
                  Upload New Logo
                </label>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Invoice Prefix</label>
              <input
                className="form-input"
                placeholder="e.g. INV"
                value={settings.invoicePrefix}
                onChange={e => setSettings({ ...settings, invoicePrefix: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Footer Note</label>
              <input
                className="form-input"
                placeholder="Thank you message"
                value={settings.footerNote}
                onChange={e => setSettings({ ...settings, footerNote: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;