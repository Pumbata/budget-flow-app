import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, Edit2, Save, User, Users } from 'lucide-react';

export default function SavingsManager({ goals, onAddGoal, onEditGoal, onDeleteGoal, owners }) {
  // Added 'currentProgress' to state and defaulted owner to our dynamic array
  const [formData, setFormData] = useState({ name: '', target: '', currentProgress: '', monthlyMin: '', owner: owners[0] || '' });
  const [editingId, setEditingId] = useState(null);

  // Failsafe: Update default owner if topology changes in settings
  useEffect(() => {
    if (!editingId) {
      setFormData(prev => ({ ...prev, owner: owners[0] || '' }));
    }
  }, [owners, editingId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.target) return;
    
    const goalData = {
      name: formData.name,
      target: parseFloat(formData.target),
      monthlyMin: parseFloat(formData.monthlyMin || 0),
      owner: formData.owner || owners[0],
      totalPaid: parseFloat(formData.currentProgress || 0) // Injects the starting balance
    };

    if (editingId) {
      onEditGoal({ ...goalData, id: editingId });
      setEditingId(null);
    } else {
      onAddGoal({ ...goalData, id: `goal-${Date.now()}` });
    }
    
    // Reset form to safe dynamic defaults
    setFormData({ name: '', target: '', currentProgress: '', monthlyMin: '', owner: owners[0] || '' });
  };

  const handleEdit = (goal) => {
    setFormData({ 
      name: goal.name, 
      target: goal.target, 
      currentProgress: goal.totalPaid, // Pulls their existing progress in so they can edit it
      monthlyMin: goal.monthlyMin, 
      owner: goal.owner || owners[0] 
    });
    setEditingId(goal.id);
  };

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1>Savings & Repayments</h1>
        <p className="subtitle">Track large purchases, vacations, and sinking funds.</p>
      </header>

      {/* FORM */}
      <div className="card form-card" style={{ borderLeft: '4px solid var(--green)' }}>
        <h3>{editingId ? 'Edit Goal' : 'Create New Goal'}</h3>
        <form onSubmit={handleSubmit} className="add-bill-form">
          <input
            placeholder="Goal Name (e.g., Caribbean All-Inclusive)"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="input-field"
            autoFocus
          />
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
            <input
              type="number" placeholder="Total Target ($)"
              value={formData.target}
              onChange={e => setFormData({...formData, target: e.target.value})}
              className="input-field"
            />
            <input
              type="number" placeholder="Current Progress ($) - Optional"
              value={formData.currentProgress}
              onChange={e => setFormData({...formData, currentProgress: e.target.value})}
              className="input-field"
            />
            <input
              type="number" placeholder="Monthly Base ($)"
              value={formData.monthlyMin}
              onChange={e => setFormData({...formData, monthlyMin: e.target.value})}
              className="input-field"
            />
          </div>
          
          <div className="form-row" style={{ marginTop: 10 }}>
             <div className="select-wrapper" style={{flex:1}}>
               <label style={{fontSize:'0.8rem', color:'var(--text-dim)', marginBottom:8, display:'block', fontWeight: 600}}>Assign To</label>
               <div className="owner-toggle-row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                 {owners.map((owner, index) => (
                   <button
                     key={owner}
                     type="button"
                     className={`owner-btn ${formData.owner === owner ? 'selected' : ''}`}
                     onClick={() => setFormData({...formData, owner})}
                     style={{ 
                       padding: '8px 16px', 
                       borderRadius: 6, 
                       border: formData.owner === owner ? '1px solid var(--accent)' : '1px solid var(--border)',
                       background: formData.owner === owner ? 'rgba(217, 119, 6, 0.1)' : 'var(--bg)',
                       color: formData.owner === owner ? 'var(--accent)' : 'var(--text)',
                       cursor: 'pointer',
                       display: 'flex',
                       alignItems: 'center',
                       gap: 6
                     }}
                   >
                     {/* If it's the first entity and there are multiple owners, we assume it's the joint pool */}
                     {index === 0 && owners.length > 1 ? <Users size={14}/> : <User size={14}/>} 
                     {owner}
                   </button>
                 ))}
               </div>
             </div>
          </div>

          <div className="form-actions" style={{marginTop: 20, justifyContent: 'flex-end'}}>
            {editingId && (
              <button type="button" className="btn-cancel" onClick={() => { setEditingId(null); setFormData({name:'', target:'', currentProgress:'', monthlyMin:'', owner: owners[0]}); }}>Cancel</button>
            )}
            <button type="submit" className="btn-primary" style={{ background: 'var(--green)', color: '#000' }}>
              <Save size={16} /> {editingId ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>

      {/* MASTER LIST OF GOALS */}
      <div className="goals-master-grid">
        {goals.map(goal => {
          const progress = Math.min(100, Math.round((goal.totalPaid / goal.target) * 100));
          const isComplete = goal.totalPaid >= goal.target;

          return (
            <div key={goal.id} className={`goal-master-card ${isComplete ? 'complete' : ''}`}>
              <div className="goal-header">
                <div>
                  <span className="goal-owner-badge">{goal.owner}</span>
                  <h4>{goal.name}</h4>
                </div>
                <div className="goal-actions">
                  <button onClick={() => handleEdit(goal)}><Edit2 size={16}/></button>
                  <button onClick={() => onDeleteGoal(goal.id)} className="del"><Trash2 size={16}/></button>
                </div>
              </div>
              
              <div className="goal-stats">
                <span>${goal.totalPaid.toFixed(0)} paid</span>
                <span>${goal.target.toFixed(0)} total</span>
              </div>
              
              <div className="goal-progress-bar">
                <div className="goal-progress-fill" style={{width: `${progress}%`, background: isComplete ? 'var(--green)' : 'var(--accent)'}}></div>
              </div>
              
              <div className="goal-footer">
                <span>Base Payment: ${goal.monthlyMin}/mo</span>
                {isComplete && <span className="complete-badge">🎉 Paid Off</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}