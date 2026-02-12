import React, { useState } from 'react';
import { Save, DollarSign, Calendar } from 'lucide-react';

export default function IncomeManager({ income, buffer, onSave }) {
  const [formData, setFormData] = useState(income);
  const [localBuffer, setLocalBuffer] = useState(buffer);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, localBuffer);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  return (
    <div className="animate-fade-in">
      <header>
        <h1>Income & Limits</h1>
        <p className="subtitle">Tell us how you get paid to calibrate the engine.</p>
      </header>

      <form onSubmit={handleSubmit} className="card" style={{ marginTop: '20px' }}>
        
        {/* SECTION 1: PAYCHECK STRUCTURE */}
        <h3>Paycheck Settings</h3>
        
        <div className="form-group" style={{marginBottom: 20}}>
          <label>Is your paycheck consistent?</label>
          <div className="toggle-row">
            <button 
              type="button"
              className={`toggle-btn ${formData.type === 'consistent' ? 'active' : ''}`}
              onClick={() => setFormData({...formData, type: 'consistent'})}
            >
              Yes, it's consistent
            </button>
            <button 
              type="button"
              className={`toggle-btn ${formData.type === 'variable' ? 'active' : ''}`}
              onClick={() => setFormData({...formData, type: 'variable'})}
            >
              No, it varies
            </button>
          </div>
        </div>

        {/* DYNAMIC FIELDS BASED ON CONSISTENCY */}
        <div className="form-grid">
          <div>
            <label>Pay Frequency</label>
            <select 
              className="input-field"
              value={formData.frequency}
              onChange={(e) => setFormData({...formData, frequency: e.target.value})}
            >
              <option value="weekly">Every Week</option>
              <option value="bi-weekly">Every 2 Weeks</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label>Next Pay Date</label>
            <input 
              type="date" 
              className="input-field"
              value={formatDate(formData.nextPayDate)}
              onChange={(e) => setFormData({...formData, nextPayDate: e.target.value})}
            />
          </div>

          <div>
            <label>
              {formData.type === 'consistent' ? 'Paycheck Amount ($)' : 'Estimated Amount ($)'}
            </label>
            <input 
              type="number" 
              className="input-field"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
            />
          </div>
        </div>

        {/* SECTION 2: SPENDING BUFFER */}
        <hr className="divider" />
        <h3>Variable Spending Buffer</h3>
        <p className="subtitle">Money reserved for groceries, gas, and "life" per pay period.</p>
        
        <div className="form-row">
          <div className="input-with-icon">
            <DollarSign size={18} className="input-icon" />
            <input 
              type="number" 
              className="input-field"
              value={localBuffer}
              onChange={(e) => setLocalBuffer(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary mt-4">
          <Save size={18} style={{marginRight: 8}}/>
          {saved ? 'Settings Saved!' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
}