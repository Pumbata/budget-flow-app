import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export default function RecurringBills({ bills, onAddBill, onEditBill, onDeleteBill, owners, categories }) {
  const [isEditing, setIsEditing] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', amount: '', dueDate: '', owner: '', category: 'other' });
  const [isAdding, setIsAdding] = useState(false);
  
  // Default to the top entity (either the Joint Pool name or the Solo User)
  const [addForm, setAddForm] = useState({ name: '', amount: '', dueDate: '', owner: owners[0] || '', category: 'other' });

  // Failsafe: If the topology changes in Settings, update the default form owner
  useEffect(() => {
    setAddForm(prev => ({ ...prev, owner: owners[0] || '' }));
  }, [owners]);

  const handleEditClick = (bill) => {
    setIsEditing(bill.id);
    setEditForm({ ...bill, category: bill.category || 'other' });
  };

  const handleSaveEdit = () => {
    onEditBill({ ...editForm, amount: parseFloat(editForm.amount), dueDate: parseInt(editForm.dueDate) });
    setIsEditing(null);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    
    // Ensure an owner is ALWAYS attached natively from the new dynamic array
    const finalOwner = addForm.owner || owners[0];
    
    onAddBill({ ...addForm, owner: finalOwner, id: `bill-${Date.now()}`, amount: parseFloat(addForm.amount), dueDate: parseInt(addForm.dueDate) });
    setIsAdding(false);
    
    // Reset to safe dynamic defaults
    setAddForm({ name: '', amount: '', dueDate: '', owner: owners[0] || '', category: 'other' });
  };

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <div>
          <h1 style={{fontSize: '1.5rem'}}>Recurring Bills Blueprint</h1>
          <p className="subtitle">Manage your master list of monthly expenses.</p>
        </div>
        {/* ADDED TARGET CLASS: tour-add-bill */}
        <button className="btn-primary tour-add-bill" onClick={() => setIsAdding(true)}><Plus size={18} /> Add Bill</button>
      </header>

      {/* ADD BILL FORM */}
      {isAdding && (
        <div className="card" style={{ padding: 20, marginBottom: 30, borderLeft: '4px solid var(--accent)' }}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom: 15}}>
            <h3 style={{ margin: 0 }}>New Recurring Bill</h3>
            <button onClick={() => setIsAdding(false)} className="btn-icon-only"><X size={20}/></button>
          </div>
          
          <form onSubmit={handleAddSubmit} className="labeled-form-grid">
            <div className="form-field"><label>Bill Name</label><input placeholder="e.g. Netflix" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} required autoFocus /></div>
            <div className="form-field"><label>Amount</label><input type="number" placeholder="0.00" value={addForm.amount} onChange={e => setAddForm({...addForm, amount: e.target.value})} required /></div>
            <div className="form-field"><label>Due Day (1-31)</label><input type="number" min="1" max="31" placeholder="15" value={addForm.dueDate} onChange={e => setAddForm({...addForm, dueDate: e.target.value})} required /></div>
            <div className="form-field"><label>Assigned Owner</label><select value={addForm.owner} onChange={e => setAddForm({...addForm, owner: e.target.value})}>{owners.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
            
            <div className="form-field">
              <label>Category</label>
              <select value={addForm.category} onChange={e => setAddForm({...addForm, category: e.target.value})}>
                {Object.entries(categories).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="form-actions-cell"><button type="submit" className="btn-primary" style={{width: '100%'}}>Save Bill</button></div>
          </form>
        </div>
      )}

      {/* BILLS LIST GROUPED BY OWNER */}
      {/* ADDED TARGET CLASS: tour-blueprint-list */}
      <div className="bills-container tour-blueprint-list">
        {owners.map(owner => {
          const ownerBills = bills.filter(b => b.owner === owner).sort((a,b) => a.dueDate - b.dueDate);
          if (ownerBills.length === 0) return null;

          return (
            <div key={owner} className="owner-group-section">
              <h3 className="group-header">{owner}</h3>
              <div className="bills-list">
                {ownerBills.map(bill => (
                  <div key={bill.id} className="bill-row-card">
                    {isEditing === bill.id ? (
                      <div className="labeled-form-grid" style={{width: '100%'}}>
                        <div className="form-field"><label>Name</label><input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
                        <div className="form-field"><label>Amount</label><input type="number" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} /></div>
                        <div className="form-field"><label>Due Day</label><input type="number" value={editForm.dueDate} onChange={e => setEditForm({...editForm, dueDate: e.target.value})} /></div>
                        <div className="form-field"><label>Owner</label><select value={editForm.owner} onChange={e => setEditForm({...editForm, owner: e.target.value})}>{owners.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                        <div className="form-field">
                          <label>Category</label>
                          <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                            {Object.entries(categories).map(([key, cat]) => (
                              <option key={key} value={key}>{cat.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-actions-cell" style={{flexDirection: 'row', gap: 5}}>
                          <button onClick={handleSaveEdit} className="btn-icon-only" title="Save"><Save size={18} color="var(--green)"/></button>
                          <button onClick={() => setIsEditing(null)} className="btn-icon-only" title="Cancel"><X size={18} /></button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="bill-info">
                          <div className="bill-date"><span style={{fontSize: '0.7rem', color: 'var(--text-dim)', display:'block'}}>DUE</span>{bill.dueDate}</div>
                          <div className="bill-details">
                            <span className="name">{bill.name}</span>
                            <span className="owner-badge">
                              <span style={{fontWeight: 600, color: categories[bill.category || 'other']?.color || 'var(--text-dim)'}}>
                                {categories[bill.category || 'other']?.label || 'Other'}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="bill-actions">
                          <span className="amount">-${bill.amount}</span>
                          <button onClick={() => handleEditClick(bill)} className="btn-icon-only"><Edit2 size={16} /></button>
                          <button onClick={() => onDeleteBill(bill.id)} className="btn-icon-only"><Trash2 size={16} /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}