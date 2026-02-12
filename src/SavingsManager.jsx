import React, { useState } from 'react';
import { Target, Plus, Trash2, Edit2, Save, User, Users } from 'lucide-react';

export default function SavingsManager({ goals, onAddGoal, onEditGoal, onDeleteGoal, owners }) {
  const [formData, setFormData] = useState({ name: '', target: '', monthlyMin: '', owner: 'Shared' });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.target) return;
    
    const goalData = {
      ...formData,
      target: parseFloat(formData.target),
      monthlyMin: parseFloat(formData.monthlyMin || 0),
      owner: formData.owner || 'Shared',
    };

    if (editingId) {
      onEditGoal({ ...goalData, id: editingId });
      setEditingId(null);
    } else {
      onAddGoal({ ...goalData, id: `goal-${Date.now()}`, totalPaid: 0 });
    }
    setFormData({ name: '', target: '', monthlyMin: '', owner: 'Shared' });
  };

  const handleEdit = (goal) => {
    setFormData({ name: goal.name, target: goal.target, monthlyMin: goal.monthlyMin, owner: goal.owner || 'Shared' });
    setEditingId(goal.id);
  };

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1>Savings & Repayments</h1>
        <p className="subtitle">Track large purchases, vacations, and sinking funds.</p>
      </header>

      {/* FORM */}
      <div className="card form-card">
        <h3>{editingId ? 'Edit Goal' : 'Create New Goal'}</h3>
        <form onSubmit={handleSubmit} className="add-bill-form">
          <input
            placeholder="Goal Name (e.g., Caribbean Trip)"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="input-field"
          />
          <div className="form-row">
            <input
              type="number" placeholder="Total Target ($)"
              value={formData.target}
              onChange={e => setFormData({...formData, target: e.target.value})}
              className="input-field"
            />
            <input
              type="number" placeholder="Monthly Base Payment ($)"
              value={formData.monthlyMin}
              onChange={e => setFormData({...formData, monthlyMin: e.target.value})}
              className="input-field"
            />
          </div>
          
          <div className="form-row">
             <div className="select-wrapper" style={{flex:1}}>
               <label style={{fontSize:'0.8rem', color:'var(--text-dim)', marginBottom:4, display:'block'}}>Goal Owner</label>
               <div className="owner-toggle-row">
                 {owners.map(owner => (
                   <button
                     key={owner}
                     type="button"
                     className={`owner-btn ${formData.owner === owner ? 'selected' : ''}`}
                     onClick={() => setFormData({...formData, owner})}
                   >
                     {owner === 'Shared' ? <Users size={14}/> : <User size={14}/>} {owner}
                   </button>
                 ))}
               </div>
             </div>
          </div>

          <div className="form-actions" style={{marginTop:10}}>
            {editingId && (
              <button type="button" className="btn-cancel" onClick={() => { setEditingId(null); setFormData({name:'', target:'', monthlyMin:'', owner:'Shared'}); }}>Cancel</button>
            )}
            <button type="submit" className="btn-primary">
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