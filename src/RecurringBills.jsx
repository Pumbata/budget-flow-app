import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
// We import the helper from App (or we could move it to a util file, but importing from App is fine for now if App exports it, otherwise we duplicate the helper or move it to a separate file. For simplicity, let's assume we pass the icon helper or just render a generic Tag if needed. 
// BETTER WAY: Let's just import the icon helper function if we exported it, OR pass it as a prop.
// actually, since we are in the same src folder, we can import { getCategoryIcon } from './App' if App exports it. 
// BUT circular dependencies are bad.
// So, I will just replicate the Icon Helper here for display purposes or use a generic one. 
// Actually, let's just use the `categories` prop which has label and color. For the icon, we can just use a generic <Tag/> for the dropdown or simple text. 

export default function RecurringBills({ bills, onAddBill, onEditBill, onDeleteBill, owners, categories }) {
  const [isEditing, setIsEditing] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', amount: '', dueDate: '', owner: '', category: 'other' });
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', amount: '', dueDate: '', owner: owners[1], category: 'other' });

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
    onAddBill({ ...addForm, id: `bill-${Date.now()}`, amount: parseFloat(addForm.amount), dueDate: parseInt(addForm.dueDate) });
    setIsAdding(false);
    setAddForm({ name: '', amount: '', dueDate: '', owner: owners[1], category: 'other' });
  };

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <div>
          <h1 style={{fontSize: '1.5rem'}}>Recurring Bills Blueprint</h1>
          <p className="subtitle">Manage your master list of monthly expenses.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsAdding(true)}><Plus size={18} /> Add Bill</button>
      </header>

      {/* ADD BILL FORM */}
      {isAdding && (
        <div className="card" style={{ padding: 20, marginBottom: 30, borderLeft: '4px solid var(--accent)' }}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom: 15}}>
            <h3 style={{ margin: 0 }}>New Recurring Bill</h3>
            <button onClick={() => setIsAdding(false)} className="btn-icon-only"><X size={20}/></button>
          </div>
          
          <form onSubmit={handleAddSubmit} className="labeled-form-grid">
            <div className="form-field"><label>Bill Name</label><input placeholder="e.g. Netflix" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} required /></div>
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
      <div className="bills-container">
        {owners.map(owner => {
          const ownerBills = bills.filter(b => b.owner === owner).sort((a,b) => a.dueDate - b.dueDate);
          if (ownerBills.length === 0) return null;

          return (
            <div key={owner} className="owner-group-section">
              <h3 className="group-header">{owner}'s Bills</h3>
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
                              {/* We just show label here since icons are tricky without the helper */}
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