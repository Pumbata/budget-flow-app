import React, { useState, useRef } from 'react';
import { Moon, Sun, UserPlus, Trash2, Tags, Plus, Coffee, Home, Users, Download, Upload, PlayCircle, Lock, LogOut } from 'lucide-react';
import { supabase } from './supabaseClient';

export default function Settings({ 
  currentTheme, setTheme, 
  owners, setOwners, 
  hasJointPool, setHasJointPool,
  jointPoolName, setJointPoolName, 
  appStartDate, 
  startingBalances, setStartingBalances, 
  categories, setCategories,
  recurringBills, setRecurringBills,
  savingsGoals, setSavingsGoals,
  monthlyData, setMonthlyData,
  onReplayTour
}) {
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366f1');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingAuth, setIsUpdatingAuth] = useState(false);
  const fileInputRef = useRef(null);

  const handleAddOwner = (e) => {
    e.preventDefault();
    const trimmed = newOwnerName.trim();
    if (trimmed && !owners.includes(trimmed)) {
      setOwners([...owners, trimmed]);
      setNewOwnerName('');
    }
  };

  const handleDeleteOwner = (ownerToRemove) => {
    if (window.confirm(`Remove ${ownerToRemove}? Their historical bills will remain, but you won't be able to assign new ones to them.`)) {
      setOwners(owners.filter(o => o !== ownerToRemove));
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCatName) {
      const id = newCatName.toLowerCase().replace(/\s+/g, '_');
      if (!categories[id]) {
        setCategories({ ...categories, [id]: { label: newCatName, color: newCatColor } });
        setNewCatName('');
      }
    }
  };

  const handleDeleteCategory = (catId) => {
    const newCats = { ...categories };
    delete newCats[catId];
    setCategories(newCats);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setIsUpdatingAuth(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsUpdatingAuth(false);

    if (error) {
      alert("Error updating password: " + error.message);
    } else {
      alert("Password updated successfully!");
      setNewPassword('');
    }
  };

  // --- EXPORT DATA ---
  const handleExportData = () => {
    const dataToExport = {
      owners,
      hasJointPool,
      jointPoolName,
      categories,
      appStartDate,
      startingBalances,
      recurringBills,
      savingsGoals,
      monthlyData
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omegabudget-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- IMPORT DATA ---
  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        
        if (window.confirm("WARNING: This will completely overwrite your current dashboard and cloud save. Are you sure you want to restore from this backup?")) {
          if (importedData.owners) setOwners(importedData.owners);
          if (importedData.hasJointPool !== undefined) setHasJointPool(importedData.hasJointPool);
          if (importedData.jointPoolName) setJointPoolName(importedData.jointPoolName);
          if (importedData.categories) setCategories(importedData.categories);
          if (importedData.startingBalances) setStartingBalances(importedData.startingBalances);
          if (importedData.recurringBills) setRecurringBills(importedData.recurringBills);
          if (importedData.savingsGoals) setSavingsGoals(importedData.savingsGoals);
          if (importedData.monthlyData) setMonthlyData(importedData.monthlyData);
          
          alert("Backup restored successfully!");
        }
      } catch (err) {
        alert("Error reading backup file. Please make sure it is a valid OmegaBudget .json file.");
        console.error(err);
      }
      e.target.value = null; 
    };
    reader.readAsText(file);
  };

  const handleConnectTelegram = async () => {
    // 1. Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Error: Could not find user session.");
      return;
    }

    // 2. Generate a random 8-character token
    const linkToken = Math.random().toString(36).substring(2, 10);
    
    // 3. Save the token to this user's Supabase profile
    const { error } = await supabase
      .from('user_state')
      .update({ telegram_link_token: linkToken })
      .eq('id', user.id);

    // 4. Redirect them to Telegram
    if (!error) {
      // NOTE: Replace 'OmegaBudgetApp_Bot' with your actual bot username!
      window.location.href = `https://t.me/OmegaBudgetApp_Bot?start=${linkToken}`;
    } else {
      console.error(error);
      alert("Error generating link token.");
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      alert("There was an issue signing out.");
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: 40 }}>
      <header className="page-header" style={{ marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>System Settings</h1>
          <p className="subtitle" style={{ margin: 0 }}>Configure your OmegaBudget workspace</p>
        </div>
      </header>

      <div className="settings-grid">
        
        {/* HELP & TUTORIALS */}
        <div className="card settings-card" style={{ borderLeft: '4px solid var(--accent)' }}>
          <h3><PlayCircle size={18} style={{verticalAlign: 'text-bottom', marginRight: 8}}/> Help & Tutorials</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: 15, lineHeight: 1.4 }}>
            Need a quick refresher on how the dashboard works? You can restart the interactive guided tour at any time to walk through the basics of balancing your budget.
          </p>
          <button className="btn-primary" onClick={onReplayTour} style={{ display: 'inline-flex' }}>
            <PlayCircle size={18} /> Replay Guided Tour
          </button>
        </div>

        {/* TELEGRAM BUTTON */}
        <div style={{ marginBottom: 30, padding: 20, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <h3 style={{ margin: 0, color: 'var(--accent)' }}>🤖 Quick Entry Bot</h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', margin: '0 0 15px 0', lineHeight: 1.5 }}>
            Connect your Telegram account to instantly log expenses via text message without opening the app.
          </p>
          <button 
            onClick={handleConnectTelegram} 
            className="btn-primary" 
            style={{ background: '#0088cc', color: 'white', border: 'none' }}
          >
            Connect Telegram
          </button>
        </div>

        {/* APPEARANCE */}
        <div className="card settings-card">
          <h3>Appearance</h3>
          <div className="theme-btn-group">
            <button className={`theme-btn light ${currentTheme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}><Sun size={18} /> Light</button>
            <button className={`theme-btn dark ${currentTheme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}><Moon size={18} /> Dark</button>
            <button className={`theme-btn taupe ${currentTheme === 'taupe' ? 'active' : ''}`} onClick={() => setTheme('taupe')}><Coffee size={18} /> Taupe</button>
          </div>
        </div>

        {/* ACCOUNT STRUCTURE & TOPOLOGY */}
        <div className="card settings-card" style={{ gridColumn: '1 / -1' }}>
          <h3><Home size={18} style={{verticalAlign: 'text-bottom', marginRight: 8}}/> Account Structure</h3>
          
          <div style={{ background: 'var(--bg)', padding: 20, borderRadius: 8, marginBottom: 25, border: '1px solid rgba(255,255,255,0.05)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 15, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={hasJointPool} 
                onChange={(e) => setHasJointPool(e.target.checked)} 
                style={{ width: 20, height: 20, accentColor: 'var(--accent)' }} 
              />
              <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Enable Shared Expense Pool</span>
            </label>
            <p style={{ color: 'var(--text-dim)', margin: '8px 0 0 35px', fontSize: '0.9rem', lineHeight: 1.4 }}>
              Turn this on if you share joint expenses (like rent or utilities) that are split among household members.
            </p>

            {hasJointPool && (
              <div className="animate-fade-in" style={{ marginTop: 20, marginLeft: 35 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '0.9rem' }}>Shared Pool Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={jointPoolName}
                  onChange={(e) => setJointPoolName(e.target.value)}
                  onBlur={() => { if (!jointPoolName.trim()) setJointPoolName('House Bills'); }}
                  placeholder="e.g. House Bills, Joint Account"
                  style={{ maxWidth: '300px' }}
                />
              </div>
            )}
          </div>

          <h4 style={{marginBottom: 10, fontSize: '0.9rem', color: 'var(--text-dim)'}}><Users size={16} style={{verticalAlign: 'text-bottom', marginRight: 6}}/> Individual Users</h4>
          <div className="owners-list" style={{ maxWidth: '400px', marginBottom: 15 }}>
            {owners.map(owner => (
              <div key={owner} className="owner-item">
                <span>{owner}</span>
                <button onClick={() => handleDeleteOwner(owner)} className="btn-icon-only"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddOwner} className="add-owner-form" style={{ maxWidth: '400px' }}>
            <input type="text" className="input-field" placeholder="Add Name" value={newOwnerName} onChange={(e) => setNewOwnerName(e.target.value)} />
            <button type="submit" className="btn-primary"><UserPlus size={18} /></button>
          </form>
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
                {id !== 'other' && <button onClick={() => handleDeleteCategory(id)} className="btn-icon-only"><Trash2 size={14} /></button>}
              </div>
            ))}
          </div>
          <form onSubmit={handleAddCategory} className="add-category-form">
            <input type="color" className="color-picker-input" value={newCatColor} onChange={e => setNewCatColor(e.target.value)} />
            <input type="text" className="input-field" placeholder="New Category Name" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
            <button type="submit" className="btn-primary"><Plus size={16}/></button>
          </form>
        </div>

        {/* ACCOUNT SECURITY - NEW */}
        <div className="card settings-card">
          <h3><Lock size={18} style={{verticalAlign: 'text-bottom', marginRight: 8}}/> Account Security</h3>
          <form onSubmit={handleUpdatePassword} style={{ marginTop: 15 }}>
            <div className="form-group" style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-dim)' }}>Change Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="New Password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                style={{ width: '100%', maxWidth: '300px' }}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={isUpdatingAuth}>
              {isUpdatingAuth ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* DATA MANAGEMENT & OFFLINE BACKUPS */}
        <div className="card settings-card">
          <h3>Data Management</h3>
          
          <div style={{ background: 'var(--bg)', padding: 15, borderRadius: 8, marginBottom: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem' }}>Offline Backups</h4>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: 15 }}>
              Download a complete copy of your dashboard state. You can use this to restore your board if you ever make a mistake.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" onClick={handleExportData} style={{ flex: 1, justifyContent: 'center' }}>
                <Download size={16} style={{ marginRight: 6 }}/> Export Data
              </button>
              
              <input 
                type="file" 
                accept=".json" 
                style={{ display: 'none' }} 
                ref={fileInputRef} 
                onChange={handleImportData} 
              />
              <button className="btn-cancel" onClick={() => fileInputRef.current.click()} style={{ flex: 1, justifyContent: 'center' }}>
                <Upload size={16} style={{ marginRight: 6 }}/> Restore Data
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>App Start Month (YYYY-MM)</label>
            <input type="month" className="input-field" value={appStartDate} disabled title="Locked for safety." />
          </div>
          
          <div style={{marginTop: 20}}>
            <h4 style={{marginBottom: 10, fontSize: '0.9rem', color: 'var(--text-dim)'}}>Initial Starting Balances (Rollover Seed)</h4>
            {owners.map(owner => (
              <div key={owner} className="balance-row">
                <span>{owner}</span>
                <input type="number" className="input-field" value={startingBalances[owner] || ''} placeholder="0.00" onChange={(e) => setStartingBalances({...startingBalances, [owner]: e.target.value})} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TIP JAR / SUPPORT THE PROJECT */}
      <div className="card settings-card" style={{ 
        marginTop: 20, 
        background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.02) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 15 }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: 8, borderRadius: 8, display: 'flex' }}>
            <Coffee size={20} color="#f59e0b" />
          </div>
          <h3 style={{ margin: 0, color: '#f59e0b' }}>Support OmegaBudget</h3>
        </div>
        
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 20 }}>
          OmegaBudget is built and maintained by one developer. It is 100% free, ad-free, and your data is never sold. If this app helped you get your money right this month, consider buying me a coffee to help keep the servers running!
        </p>
        
        <a 
          href="https://www.buymeacoffee.com/randymccrodden" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f59e0b', 
            color: '#fff',
            textDecoration: 'none',
            border: 'none',
            padding: '10px 24px'
          }}
        >
          ☕ Buy Me a Coffee
        </a>
      </div>

      {/* SIGN OUT SECTION (MOBILE FRIENDLY) */}
      <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
        <button 
          onClick={handleSignOut} 
          className="btn-cancel" 
          style={{ 
            width: '100%', 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'var(--red)', 
            borderColor: 'rgba(239, 68, 68, 0.3)', 
            background: 'rgba(239, 68, 68, 0.05)',
            padding: '12px',
            fontSize: '1rem',
            fontWeight: 600
          }}
        >
          <LogOut size={20} style={{ marginRight: 8 }} />
          Sign Out of OmegaBudget
        </button>
      </div>

    </div>
  );
}