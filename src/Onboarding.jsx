import React, { useState } from 'react';
import { User, Users, Home, Receipt, ArrowRight, CheckCircle2, ChevronRight, Plus, X } from 'lucide-react';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState(null); // 'solo' or 'joint'
  
  // User Configuration
  const [owners, setOwners] = useState(['', '']); 
  const [hasJointPool, setHasJointPool] = useState(true);
  const [jointPoolName, setJointPoolName] = useState('House Bills');
  
  // Quick-start bills
  const [rentAmount, setRentAmount] = useState('');
  const [electricAmount, setElectricAmount] = useState('');

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    if (selectedMode === 'solo') {
      setOwners(['']); // Just one input needed
      setHasJointPool(false); // Solo users don't have a shared pool
    } else {
      setOwners(['', '']); // Two inputs to start for partners
      setHasJointPool(true); // Default to true for groups, but they can toggle it off
    }
    setStep(2);
  };

  const handleNameChange = (index, value) => {
    const newOwners = [...owners];
    newOwners[index] = value;
    setOwners(newOwners);
  };

  const addOwnerField = () => setOwners([...owners, '']);
  const removeOwnerField = (index) => setOwners(owners.filter((_, i) => i !== index));

  const handleNamesSubmit = (e) => {
    e.preventDefault();
    const validOwners = owners.map(o => o.trim()).filter(o => o !== '');
    
    if (validOwners.length === 0) {
      alert("Please enter at least one name.");
      return;
    }
    
    setOwners(validOwners);
    
    if (mode === 'solo' || validOwners.length === 1) {
      setStep(4); // Skip shared pool step entirely
    } else {
      setStep(3); // Go to shared pool step
    }
  };

  const handleFinish = () => {
    const initialBills = [];
    // If they have a joint pool, assign house bills there. If solo/no pool, assign to the first owner.
    const primaryOwner = hasJointPool ? jointPoolName : owners[0];

    if (rentAmount) {
      initialBills.push({ id: `b-rent-${Date.now()}`, name: 'Mortgage / Rent', amount: parseFloat(rentAmount), dueDate: 1, owner: primaryOwner, category: 'housing' });
    }
    if (electricAmount) {
      initialBills.push({ id: `b-elec-${Date.now()}`, name: 'Electric Bill', amount: parseFloat(electricAmount), dueDate: 15, owner: primaryOwner, category: 'utilities' });
    }

    // Pass the clean payload back to App.jsx
    onComplete({
      finalOwners: owners, // Just the humans! No more phantom 'Shared' user
      hasJointPool: hasJointPool,
      jointPoolName: hasJointPool ? jointPoolName : '',
      finalBills: initialBills
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card animate-fade-in" style={{ maxWidth: 550, width: '100%', padding: 40, borderTop: '4px solid var(--accent)' }}>
        
        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30, fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>
          <span style={{ color: step >= 1 ? 'var(--accent)' : 'inherit' }}>1. Setup</span>
          <ChevronRight size={14} />
          <span style={{ color: step >= 2 ? 'var(--accent)' : 'inherit' }}>2. Users</span>
          <ChevronRight size={14} />
          {mode === 'joint' && (
            <><span style={{ color: step >= 3 ? 'var(--accent)' : 'inherit' }}>3. Pool</span><ChevronRight size={14} /></>
          )}
          <span style={{ color: step >= 4 ? 'var(--accent)' : 'inherit' }}>{mode === 'joint' ? '4' : '3'}. Boot Up</span>
        </div>

        {/* STEP 1: Mode Selection */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 style={{ margin: '0 0 10px 0', fontSize: '1.8rem', textAlign: 'center' }}>Welcome to OmegaBudget</h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: 30, textAlign: 'center', lineHeight: 1.5 }}>
              Let's tailor your financial command center. Who are we building this budget for?
            </p>
            
            <div style={{ display: 'flex', gap: 20, flexDirection: 'column' }}>
              <button 
                onClick={() => handleModeSelect('solo')}
                style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 25, background: 'var(--border)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'var(--text)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease' }}
                className="hover-card-effect"
              >
                <div style={{ background: 'var(--bg)', padding: 15, borderRadius: 50, color: 'var(--accent)' }}><User size={32} /></div>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>Just Me (Solo)</h3>
                  <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.9rem' }}>I am managing my own personal finances and bills.</p>
                </div>
              </button>

              <button 
                onClick={() => handleModeSelect('joint')}
                style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 25, background: 'var(--border)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'var(--text)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease' }}
                className="hover-card-effect"
              >
                <div style={{ background: 'var(--bg)', padding: 15, borderRadius: 50, color: 'var(--green)' }}><Users size={32} /></div>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>Partner / Roommates</h3>
                  <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.9rem' }}>I am tracking finances with someone else (joint or split bills).</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Names */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Users size={28} color="var(--accent)" />
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{mode === 'solo' ? "What's your name?" : "Who is budgeting?"}</h2>
            </div>
            <p style={{ color: 'var(--text-dim)', marginBottom: 25, lineHeight: 1.5 }}>
              {mode === 'solo' ? "This will be the label for your personal column." : "Enter the names of everyone who contributes to the bills."}
            </p>
            
            <form onSubmit={handleNamesSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginBottom: 20 }}>
                {owners.map((owner, index) => (
                  <div key={index} style={{ display: 'flex', gap: 10 }}>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={owner} 
                      onChange={(e) => handleNameChange(index, e.target.value)} 
                      placeholder={mode === 'solo' ? "Your Name" : `Person ${index + 1}`} 
                      autoFocus={index === 0}
                      required={index === 0} // Only first is strictly required
                    />
                    {mode === 'joint' && owners.length > 2 && (
                      <button type="button" onClick={() => removeOwnerField(index)} className="btn-icon-only" style={{ color: 'var(--red)' }}><X size={20}/></button>
                    )}
                  </div>
                ))}
              </div>

              {mode === 'joint' && (
                <button type="button" onClick={addOwnerField} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 30, fontWeight: 600 }}>
                  <Plus size={16} /> Add another person
                </button>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: mode === 'solo' ? 30 : 0 }}>
                <button type="button" className="btn-cancel" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center', padding: 15 }}>Back</button>
                <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center', padding: 15 }}>Next Step <ArrowRight size={18} /></button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: Shared Pool (Joint Only) */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Home size={28} color="var(--accent)" />
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Shared Household Bills</h2>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: 20, borderRadius: 8, marginBottom: 25 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 15, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={hasJointPool} 
                  onChange={(e) => setHasJointPool(e.target.checked)} 
                  style={{ width: 20, height: 20, accentColor: 'var(--accent)' }} 
                />
                <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>We have joint bills to split</span>
              </label>
              <p style={{ color: 'var(--text-dim)', margin: '10px 0 0 35px', fontSize: '0.9rem', lineHeight: 1.4 }}>
                Uncheck this if you are just roommates tracking completely separate expenses on the same board.
              </p>
            </div>

            {hasJointPool && (
              <div className="animate-fade-in" style={{ marginBottom: 30 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>What do you call this shared pool?</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={jointPoolName}
                  onChange={(e) => setJointPoolName(e.target.value)}
                  placeholder="e.g. House Bills, Joint Account" 
                  autoFocus
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: hasJointPool ? 0 : 30 }}>
              <button className="btn-cancel" onClick={() => setStep(2)} style={{ flex: 1, justifyContent: 'center', padding: 15 }}>Back</button>
              <button className="btn-primary" onClick={() => setStep(4)} style={{ flex: 2, justifyContent: 'center', padding: 15 }}>Next Step <ArrowRight size={18} /></button>
            </div>
          </div>
        )}

        {/* STEP 4: Quick Start Bills */}
        {step === 4 && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Receipt size={28} color="var(--accent)" />
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Initial Blueprint</h2>
            </div>
            <p style={{ color: 'var(--text-dim)', marginBottom: 25, lineHeight: 1.5 }}>
              Let's seed your dashboard with a couple of standard bills. You can edit these or add more later.
            </p>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Monthly Rent / Mortgage ($)</label>
              <input type="number" className="input-field" value={rentAmount} onChange={(e) => setRentAmount(e.target.value)} placeholder="e.g. 1800" autoFocus />
            </div>

            <div style={{ marginBottom: 30 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Average Electric Bill ($)</label>
              <input type="number" className="input-field" value={electricAmount} onChange={(e) => setElectricAmount(e.target.value)} placeholder="e.g. 150" />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-cancel" onClick={() => setStep(mode === 'solo' ? 2 : 3)} style={{ flex: 1, justifyContent: 'center', padding: 15 }}>Back</button>
              <button className="btn-primary" onClick={handleFinish} style={{ flex: 2, justifyContent: 'center', padding: 15, background: 'var(--green)', color: '#000' }}>
                Boot Dashboard <CheckCircle2 size={18} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}