import React, { useState } from 'react';

const BusinessList = ({ businesses, onCreate, onSelect, onDelete }) => {
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleCreate = () => {
    if (newName.trim()) {
      setIsCreating(true);
      // Simulate API call
      setTimeout(() => {
        onCreate(newName);
        setNewName('');
        setIsCreating(false);
      }, 600);
    }
  };

  const handleDelete = (id) => {
    if (deleteConfirm === id) {
      onDelete(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
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

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }

          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }

          .business-card {
            animation: slideIn 0.5s ease forwards;
          }

          .delete-confirm {
            animation: pulse 1.5s ease-in-out infinite;
          }
        `}
      </style>

      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>💰</div>
          <h1 style={styles.title}>Sam_Billing</h1>
        </div>
        <p style={styles.subtitle}>
          Professional billing software for modern businesses
        </p>
      </div>

      {/* Create Business Section */}
      <div style={styles.createSection}>
        <div style={styles.createCard}>
          <div style={styles.createCardHeader}>
            <div style={styles.createIcon}>+</div>
            <div>
              <h3 style={styles.createTitle}>Create New Workspace</h3>
              <p style={styles.createSubtitle}>Add a business to start billing</p>
            </div>
          </div>

          <div style={styles.createForm}>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                style={styles.input}
                placeholder="Enter business name (e.g., 'Acme Corp')"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                disabled={isCreating}
              />
              {newName && (
                <span style={styles.inputHint}>
                  Press Enter ⏎
                </span>
              )}
            </div>
            
            <button
              onClick={handleCreate}
              disabled={isCreating || !newName.trim()}
              style={{
                ...styles.createButton,
                ...(isCreating || !newName.trim() ? styles.createButtonDisabled : {}),
                ...(isCreating ? styles.createButtonLoading : {})
              }}
            >
              {isCreating ? (
                <>
                  <span style={styles.spinner} />
                  Creating...
                </>
              ) : (
                'Create Business'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={styles.statsBar}>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{businesses.length}</span>
          <span style={styles.statLabel}>Total Businesses</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <span style={styles.statValue}>
            {businesses.filter(b => b.active).length}
          </span>
          <span style={styles.statLabel}>Active</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <span style={styles.statValue}>
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <span style={styles.statLabel}>Current Date</span>
        </div>
      </div>

      {/* Businesses Grid */}
      {businesses.length > 0 ? (
        <div style={styles.grid}>
          {businesses.map((business, index) => (
            <div
              key={business.id}
              className="business-card"
              style={{
                ...styles.card,
                animationDelay: `${index * 0.1}s`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 30px -10px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* Status Indicator */}
              <div style={{
                ...styles.statusIndicator,
                background: business.active ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #9ca3af, #6b7280)'
              }} />

              {/* Card Content */}
              <div style={styles.cardContent}>
                {/* Avatar */}
                <div style={styles.avatar}>
                  {business.name[0]?.toUpperCase()}
                  {business.active && <span style={styles.activeDot} />}
                </div>

                {/* Business Info */}
                <div style={styles.businessInfo}>
                  <h3 style={styles.businessName}>{business.name}</h3>
                  <div style={styles.businessMeta}>
                    <span style={styles.businessId}>ID: {business.id.slice(0, 8)}</span>
                    <span style={styles.businessDate}>
                      Created {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div style={styles.quickStats}>
                  <div style={styles.quickStat}>
                    <span style={styles.quickStatValue}>0</span>
                    <span style={styles.quickStatLabel}>Invoices</span>
                  </div>
                  <div style={styles.quickStat}>
                    <span style={styles.quickStatValue}>$0</span>
                    <span style={styles.quickStatLabel}>Revenue</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={styles.cardActions}>
                  <button
                    style={styles.enterButton}
                    onClick={() => onSelect(business.id)}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'var(--primary-600, #4f46e5)';
                      e.target.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'var(--primary-500, #6366f1)';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    <span style={styles.enterIcon}>→</span>
                    Open Workspace
                  </button>
                  
                  <button
                    onClick={() => handleDelete(business.id)}
                    style={{
                      ...styles.deleteButton,
                      ...(deleteConfirm === business.id ? styles.deleteButtonConfirm : {})
                    }}
                    onMouseEnter={(e) => {
                      if (deleteConfirm !== business.id) {
                        e.target.style.background = '#fee2e2';
                        e.target.style.color = '#dc2626';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (deleteConfirm !== business.id) {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#9ca3af';
                      }
                    }}
                  >
                    {deleteConfirm === business.id ? (
                      <span className="delete-confirm" style={styles.deleteConfirmText}>
                        Click to confirm
                      </span>
                    ) : (
                      <span style={styles.deleteIcon}>🗑️</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty State
        <div style={styles.emptyState}>
          <div style={styles.emptyStateIcon}>🏢</div>
          <h3 style={styles.emptyStateTitle}>No businesses yet</h3>
          <p style={styles.emptyStateText}>
            Get started by creating your first business workspace above.
            You'll be able to manage invoices, customers, and products.
          </p>
          <button
            style={styles.emptyStateButton}
            onClick={() => document.querySelector('input')?.focus()}
          >
            Create Your First Business
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          © 2024 Sam_Billing. Professional billing software for modern businesses.
        </p>
      </div>
    </div>
  );
};

// Styles Object
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
    padding: '40px 24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  header: {
    textAlign: 'center',
    marginBottom: '48px',
  },

  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '12px',
  },

  logoIcon: {
    fontSize: '40px',
    background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.2)',
  },

  title: {
    fontSize: 'clamp(32px, 5vw, 48px)',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #1f2937, #4f46e5)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
    letterSpacing: '-0.02em',
  },

  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '8px 0 0',
    fontWeight: '400',
  },

  createSection: {
    maxWidth: '700px',
    margin: '0 auto 48px',
  },

  createCard: {
    background: 'white',
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid #e5e7eb',
  },

  createCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },

  createIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '24px',
    fontWeight: '600',
    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)',
  },

  createTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 4px',
  },

  createSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },

  createForm: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },

  inputWrapper: {
    flex: 1,
    minWidth: '280px',
    position: 'relative',
  },

  input: {
    width: '100%',
    padding: '14px 18px',
    borderRadius: '14px',
    border: '2px solid #e5e7eb',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s ease',
    background: '#f9fafb',
    color: '#1f2937',
  },

  inputHint: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '12px',
    color: '#9ca3af',
    background: '#f3f4f6',
    padding: '2px 8px',
    borderRadius: '12px',
    pointerEvents: 'none',
  },

  createButton: {
    padding: '14px 32px',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
    color: 'white',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minWidth: '160px',
    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)',
  },

  createButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    background: '#9ca3af',
    boxShadow: 'none',
  },

  createButtonLoading: {
    opacity: 0.8,
    cursor: 'wait',
  },

  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },

  statsBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '32px',
    marginBottom: '48px',
    padding: '20px',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: 1.2,
  },

  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  statDivider: {
    width: '1px',
    height: '30px',
    background: '#e5e7eb',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
  },

  card: {
    background: 'white',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    position: 'relative',
    cursor: 'pointer',
  },

  statusIndicator: {
    height: '4px',
    width: '100%',
  },

  cardContent: {
    padding: '24px',
  },

  avatar: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '16px',
    position: 'relative',
  },

  activeDot: {
    position: 'absolute',
    bottom: '2px',
    right: '2px',
    width: '12px',
    height: '12px',
    background: '#10b981',
    borderRadius: '50%',
    border: '2px solid white',
  },

  businessInfo: {
    marginBottom: '16px',
  },

  businessName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 4px',
  },

  businessMeta: {
    display: 'flex',
    gap: '8px',
    fontSize: '12px',
    color: '#6b7280',
  },

  businessId: {
    background: '#f3f4f6',
    padding: '2px 8px',
    borderRadius: '12px',
  },

  businessDate: {
    color: '#9ca3af',
  },

  quickStats: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
    padding: '12px 0',
    borderTop: '1px solid #f3f4f6',
    borderBottom: '1px solid #f3f4f6',
  },

  quickStat: {
    flex: 1,
    textAlign: 'center',
  },

  quickStatValue: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
  },

  quickStatLabel: {
    fontSize: '11px',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  cardActions: {
    display: 'flex',
    gap: '8px',
  },

  enterButton: {
    flex: 1,
    padding: '10px',
    borderRadius: '12px',
    border: 'none',
    background: '#4f46e5',
    color: 'white',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
  },

  enterIcon: {
    fontSize: '16px',
  },

  deleteButton: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    background: 'transparent',
    color: '#9ca3af',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    fontSize: '16px',
  },

  deleteButtonConfirm: {
    background: '#dc2626',
    color: 'white',
    border: 'none',
    width: 'auto',
    padding: '0 12px',
  },

  deleteConfirmText: {
    fontSize: '12px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },

  deleteIcon: {
    fontSize: '16px',
  },

  emptyState: {
    textAlign: 'center',
    padding: '60px 40px',
    background: 'white',
    borderRadius: '24px',
    border: '2px dashed #e5e7eb',
    maxWidth: '500px',
    margin: '0 auto',
  },

  emptyStateIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },

  emptyStateTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 8px',
  },

  emptyStateText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 24px',
    lineHeight: 1.6,
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

  footer: {
    marginTop: '60px',
    textAlign: 'center',
  },

  footerText: {
    fontSize: '13px',
    color: '#9ca3af',
  },
};

export default BusinessList;