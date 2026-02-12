import React, { useState } from 'react';
import { Moon, Sun, UserPlus, Trash2, Save, Tags, Plus, X, Coffee } from 'lucide-react';

export default function Settings({ currentTheme, setTheme, owners, onAddOwner, onDeleteOwner, appStartDate, startingBalances, setStartingBalances, categories, setCategories }) {
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366f1');

  const handleAddOwner = (e) => {
    e.preventDefault();
    if (newOwnerName && !owners.includes(newOwnerName)) {
      onAddOwner([...owners, newOwnerName]);
      setNewOwnerName('');
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCatName) {
      const id = newCatName.toLowerCase().replace(/\s+/g, '_');
      if (!categories[id]) {
        setCategories({
          ...categories,
          [id]: { label: newCatName, color: newCatColor }
        });
        setNewCatName('');
      }
    }
  };

  const handleDeleteCategory = (catId) => {
    const newCats = { ...categories };
    delete newCats[catId];
    setCategories(newCats);
  };

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1>Settings</h1>
      </header>

      <div className="settings-grid">
        {/* APPEARANCE / THEME SELECTOR */}
        <div className="card settings-card">
          <h3>Appearance</h3>
          <div className="theme-btn-group">
            <button 
              className={`theme-btn light ${currentTheme === 'light' ? 'active' : ''}`} 
              onClick={() => setTheme('light')}
            >
              <Sun size={18} /> Light
            </button>
            <button 
              className={`theme-btn dark ${currentTheme === 'dark' ? 'active' : ''}`} 
              onClick={() => setTheme('dark')}
            >
              <Moon size={18} /> Dark
            </button>
            <button 
              className={`theme-btn taupe ${currentTheme === 'taupe' ? 'active' : ''}`} 
              onClick={() => setTheme('taupe')}
            >
              <Coffee size={18} /> Taupe
            </button>
          </div>
        </div>

        {/* CATEGORY MANAGER */}
        <div className="card settings-card">
          <h3><Tags size={18} style={{verticalAlign: 'text-bottom', marginRight: 8}}/> Expense Categories</h3>
          <div className="categories-list">
            {Object.entries(categories).map(([id, cat]) => (
              <div key={id} className="category-item">
                <div style={{display:'flex', alignItems:'center', gap: 10}}>
                  <div className="color-dot" style={{backgroundColor: cat.color}}></div>
                  <span>{cat.label}</span>
                </div>
                {id !== 'other' && (
                  <button onClick={() => handleDeleteCategory(id)} className="btn-icon-only"><Trash2 size={14} /></button>
                )}
              </div>
            ))}
          </div>
          
          <form onSubmit={handleAddCategory} className="add-category-form">
            <input 
              type="color" 
              className="color-picker-input"
              value={newCatColor} 
              onChange={e => setNewCatColor(e.target.value)} 
            />
            <input 
              type="text"
              className="input-field" 
              placeholder="New Category Name" 
              value={newCatName} 
              onChange={e => setNewCatName(e.target.value)} 
            />
            <button type="submit" className="btn-primary"><Plus size={16}/></button>
          </form>
        </div>

        {/* HOUSEHOLD MEMBERS */}
        <div className="card settings-card">
          <h3>Household Members</h3>
          <div className="owners-list">
            {owners.map(owner => (
              <div key={owner} className="owner-item">
                <span>{owner}</span>
                {owner !== 'Shared' && (
                  <button onClick={() => onDeleteOwner(owner)} className="btn-icon-only"><Trash2 size={16} /></button>
                )}
              </div>
            ))}
          </div>
          <form onSubmit={handleAddOwner} className="add-owner-form">
            <input 
              type="text"
              className="input-field" 
              placeholder="Add Name" 
              value={newOwnerName} 
              onChange={(e) => setNewOwnerName(e.target.value)} 
            />
            <button type="submit" className="btn-primary"><UserPlus size={18} /></button>
          </form>
        </div>

        {/* DATA MANAGEMENT */}
        <div className="card settings-card">
          <h3>Data Management</h3>
          <div className="form-group">
            <label>App Start Month (YYYY-MM)</label>
            <input type="month" className="input-field" value={appStartDate} disabled title="Locked for safety." />
            <p className="hint">This is the anchor date for all calculations.</p>
          </div>
          
          <div style={{marginTop: 20}}>
            <h4 style={{marginBottom: 10, fontSize: '0.9rem', color: 'var(--text-dim)'}}>Initial Starting Balances (Rollover Seed)</h4>
            {owners.filter(o => o !== 'Shared').map(owner => (
              <div key={owner} className="balance-row">
                <span>{owner}</span>
                <input 
                  type="number" 
                  className="input-field" 
                  value={startingBalances[owner] || ''} 
                  placeholder="0.00"
                  onChange={(e) => setStartingBalances({...startingBalances, [owner]: e.target.value})}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}