import React, { useState } from 'react';
import { Home, Users, Receipt, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [sharedName, setSharedName] = useState('Shared');
  const [owners, setOwners] = useState([]);
  const [tempOwner, setTempOwner] = useState('');
  
  // Quick-start bills
  const [rentAmount, setRentAmount] = useState('');
  const [electricAmount, setElectricAmount] = useState('');

  const handleAddOwner = (e) => {
    e.preventDefault();
    const trimmed = tempOwner.trim();
    if (trimmed && !owners.includes(trimmed) && trimmed.toLowerCase() !== 'shared') {
      setOwners([...owners, trimmed]);
      setTempOwner('');
    }
  };

  const handleRemoveOwner = (name) => {
    setOwners(owners.filter(o => o !== name));
  };

  const handleFinish = () => {
    // Compile the initial bills blueprint
    const initialBills = [];
    if (rentAmount) {
      initialBills.push({ id: `b-rent-${Date.now()}`, name: 'Mortgage / Rent', amount: parseFloat(rentAmount), dueDate: 1, owner: sharedName, category: 'housing' });
    }
    if (electricAmount) {
      initialBills.push({ id: `b-elec-${Date.now()}`, name: 'Electric Bill', amount: parseFloat(electricAmount), dueDate: 15, owner: sharedName, category: 'utilities' });
    }

    // Pass everything back to App.jsx
    onComplete({
      finalSharedName: sharedName,
      finalOwners: [sharedName, ...owners.length > 0 ? owners : ['User 1']],
      finalBills: initialBills
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card animate-fade-in" style={{ maxWidth: 500, width: '100%', padding: 40, borderTop: '4px solid var(--accent)' }}>
        
        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30, fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>
          <span style={{ color: step >= 1 ? 'var(--accent)' : 'inherit' }}>1. Base System</span>
          <ChevronRight size={14} />
          <span style={{ color: step >= 2 ? 'var(--accent)' : 'inherit' }}>2. Users</span>
          <ChevronRight size={14} />
          <span style={{ color: step >= 3 ? 'var(--accent)' : 'inherit' }}>3. Boot Up</span>
        </div>

        {/* STEP 1: Base Account */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Home size={28} color="var(--accent)" />
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Name your Household</h2>
            </div>
            <p style={{ color: 'var(--text-dim)', marginBottom: 25, lineHeight: 1.5 }}>
              OmegaBudget uses a "Base Account" for joint expenses. If you are sharing finances, what do you call your shared pool? If you are flying solo, you can just call this "My Bills".
            </p>
            <input 
              type="text" 
              autoFocus
              className="input-field" 
              value={sharedName}
              onChange={(e) => setSharedName(e.target.value)}
              placeholder="e.g. Shared, Our House, Main Account"
              style={{ fontSize: '1.1rem', padding: 15, marginBottom: 30 }}
            />
            <button className="btn-primary" onClick={() => setStep(2)} style={{ width: '100%', padding: 15, justifyContent: 'center' }}>
              Next Step <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: Individual Users */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Users size={28} color="var(--accent)" />
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Who is budgeting?</h2>
            </div>
            <p style={{ color: 'var(--text-dim)', marginBottom: 25, lineHeight: 1.5 }}>
              Add the names of anyone who pays bills out of their own paycheck. You can add or remove users later.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 15 }}>
              {owners.map(o => (
                <div key={o} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--border)', padding: '10px 15px', borderRadius: 8 }}>
                  {o} <button onClick={() => handleRemoveOwner(o)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }}>X</button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddOwner} style={{ display: 'flex', gap: 10, marginBottom: 30 }}>
              <input type="text" className="input-field" value={tempOwner} onChange={(e) => setTempOwner(e.target.value)} placeholder="Type a name and press Enter..." autoFocus />
              <button type="submit" className="btn-primary">Add</button>
            </form>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-cancel" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center', padding: 15 }}>Back</button>
              <button className="btn-primary" onClick={() => setStep(3)} style={{ flex: 2, justifyContent: 'center', padding: 15 }}>Next Step <ArrowRight size={18} /></button>
            </div>
          </div>
        )}

        {/* STEP 3: Quick Start Bills */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Receipt size={28} color="var(--accent)" />
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Initial Blueprint</h2>
            </div>
            <p style={{ color: 'var(--text-dim)', marginBottom: 25, lineHeight: 1.5 }}>
              Let's add your two biggest recurring bills to your blueprint so your command center is ready to go.
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
              <button className="btn-cancel" onClick={() => setStep(2)} style={{ flex: 1, justifyContent: 'center', padding: 15 }}>Back</button>
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