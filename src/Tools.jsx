import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { Calculator, Plus, Trash2, TrendingDown, DollarSign, Calendar, Zap, AlertCircle } from 'lucide-react';

export default function Tools() {
  // --- STATE ---
  const [debts, setDebts] = useState([
    { id: 1, name: 'Visa Card', balance: 5000, rate: 24.99, minPayment: 150 },
    { id: 2, name: 'Car Loan', balance: 12000, rate: 6.5, minPayment: 350 }
  ]);
  
  const [newDebt, setNewDebt] = useState({ name: '', balance: '', rate: '', minPayment: '' });
  const [extraPayment, setExtraPayment] = useState(100);
  const [strategy, setStrategy] = useState('avalanche'); // 'snowball' or 'avalanche'

  // --- ACTIONS ---
  const handleAddDebt = (e) => {
    e.preventDefault();
    if (!newDebt.name || !newDebt.balance) return;
    setDebts([...debts, { 
      id: Date.now(), 
      name: newDebt.name, 
      balance: parseFloat(newDebt.balance), 
      rate: parseFloat(newDebt.rate || 0), 
      minPayment: parseFloat(newDebt.minPayment || 0) 
    }]);
    setNewDebt({ name: '', balance: '', rate: '', minPayment: '' });
  };

  const handleDeleteDebt = (id) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  // --- SIMULATION ENGINE ---
  const simulation = useMemo(() => {
    if (debts.length === 0) return null;

    const runScenario = (isAccelerated) => {
      let currentDebts = debts.map(d => ({ ...d })); // Deep copy
      let timeline = [];
      let totalInterest = 0;
      let months = 0;
      let monthlyExtra = isAccelerated ? extraPayment : 0;

      // Safety Cap: 30 years (360 months) to prevent infinite loops if interest > payment
      while (currentDebts.some(d => d.balance > 0) && months < 360) {
        let monthInterest = 0;
        let totalBalance = 0;
        let freedUpCash = 0; // "Snowball" effect money from paid-off debts

        // 1. Charge Interest & Apply Minimums
        currentDebts.forEach(d => {
          if (d.balance > 0) {
            const interest = (d.balance * (d.rate / 100)) / 12;
            monthInterest += interest;
            d.balance += interest;
            
            let payment = d.minPayment;
            if (d.balance < payment) {
              payment = d.balance; // Pay off remainder
              freedUpCash += (d.minPayment - payment); // Add unused min to snowball
            }
            d.balance -= payment;
            totalBalance += d.balance;
          } else {
            freedUpCash += d.minPayment; // Fully paid debt adds its min payment to snowball
          }
        });

        // 2. Apply Extra Payments (Accelerator)
        // Sort debts based on strategy
        if (isAccelerated) {
          let availableExtra = monthlyExtra + freedUpCash;
          
          const sortedDebts = [...currentDebts].filter(d => d.balance > 0).sort((a, b) => {
            if (strategy === 'snowball') return a.balance - b.balance; // Lowest Bal First
            return b.rate - a.rate; // Highest Rate First
          });

          // Pour extra cash into the top priority debt
          if (sortedDebts.length > 0) {
            let target = sortedDebts[0];
            // Find original reference to update balance
            let realTarget = currentDebts.find(d => d.id === target.id);
            
            if (realTarget.balance < availableExtra) {
              availableExtra -= realTarget.balance;
              realTarget.balance = 0;
              // If cash still left, it would theoretically go to next debt, 
              // but for simple simulation step we'll stop here for this month
            } else {
              realTarget.balance -= availableExtra;
            }
            // Recalculate total balance after extra payment
            totalBalance = currentDebts.reduce((sum, d) => sum + d.balance, 0);
          }
        }

        totalInterest += monthInterest;
        months++;
        
        // Add data point for chart
        // We only push every 3 months to keep chart clean, or every month if short
        timeline.push({ 
          month: months, 
          balance: Math.max(0, totalBalance),
          date: new Date(new Date().setMonth(new Date().getMonth() + months)).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        });
      }

      return { timeline, totalInterest, months };
    };

    const baseline = runScenario(false);
    const accelerated = runScenario(true);

    return { baseline, accelerated };
  }, [debts, extraPayment, strategy]);

  // Combine data for the chart
  const chartData = simulation ? simulation.baseline.timeline.map((point, index) => {
    const accPoint = simulation.accelerated.timeline[index];
    return {
      name: point.date,
      Baseline: point.balance,
      Accelerated: accPoint ? accPoint.balance : 0
    };
  }) : [];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 60 }}>
      <header className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calculator size={28} color="var(--accent)" /> Tools & Simulations
          </h1>
          <p className="subtitle">Plan your financial future with interactive scenarios.</p>
        </div>
      </header>

      {/* TOOL SELECTOR (Future proofing for more tools) */}
      <div className="tool-tabs" style={{marginBottom: 20}}>
        <button className="tool-tab active">Debt Destroyer</button>
        {/* Placeholder for future tools */}
        {/* <button className="tool-tab">Net Worth</button> */}
      </div>

      <div className="tools-grid-layout">
        
        {/* LEFT COLUMN: INPUTS */}
        <div className="inputs-column">
          <div className="card tool-card">
            <h3>Your Debts</h3>
            <div className="debt-list">
              {debts.map(debt => (
                <div key={debt.id} className="debt-item">
                  <div style={{flex: 1}}>
                    <div className="debt-name">{debt.name}</div>
                    <div className="debt-sub">{debt.rate}% APR • Min ${debt.minPayment}</div>
                  </div>
                  <div className="debt-bal">${debt.balance.toLocaleString()}</div>
                  <button onClick={() => handleDeleteDebt(debt.id)} className="btn-icon-only"><Trash2 size={16}/></button>
                </div>
              ))}
              {debts.length === 0 && <div className="empty-msg">No debts added yet.</div>}
            </div>

            <form onSubmit={handleAddDebt} className="add-debt-form">
              <input placeholder="Name (e.g. Visa)" value={newDebt.name} onChange={e => setNewDebt({...newDebt, name: e.target.value})} />
              <div className="split-inputs">
                <input type="number" placeholder="Balance" value={newDebt.balance} onChange={e => setNewDebt({...newDebt, balance: e.target.value})} />
                <input type="number" placeholder="APR %" value={newDebt.rate} onChange={e => setNewDebt({...newDebt, rate: e.target.value})} />
              </div>
              <div className="split-inputs">
                <input type="number" placeholder="Min Pay" value={newDebt.minPayment} onChange={e => setNewDebt({...newDebt, minPayment: e.target.value})} />
                <button type="submit" className="btn-primary" style={{justifyContent:'center'}}><Plus size={18}/></button>
              </div>
            </form>
          </div>

          <div className="card tool-card">
            <h3>Strategy Controls</h3>
            
            <div className="control-group">
              <label>Extra Monthly Payment: <span className="highlight-val">${extraPayment}</span></label>
              <input 
                type="range" 
                min="0" max="2000" step="10" 
                value={extraPayment} 
                onChange={e => setExtraPayment(parseInt(e.target.value))} 
                className="slider"
              />
              <div className="slider-labels"><span>$0</span><span>$2,000</span></div>
            </div>

            <div className="control-group">
              <label>Payoff Method</label>
              <div className="strategy-toggle">
                <button 
                  className={strategy === 'avalanche' ? 'active' : ''} 
                  onClick={() => setStrategy('avalanche')}
                  title="Highest Interest Rate First (Mathmatically Optimal)"
                >
                  Avalanche 🏔️
                </button>
                <button 
                  className={strategy === 'snowball' ? 'active' : ''} 
                  onClick={() => setStrategy('snowball')}
                  title="Lowest Balance First (Psychological Wins)"
                >
                  Snowball ❄️
                </button>
              </div>
              <p className="strategy-desc">
                {strategy === 'avalanche' ? 'Targeting highest interest rates first. Saves the most money.' : 'Targeting lowest balances first. Builds momentum faster.'}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RESULTS */}
        <div className="results-column">
          {simulation && debts.length > 0 ? (
            <>
              {/* BIG METRICS */}
              <div className="sim-stats-grid">
                <div className="sim-stat-card success">
                  <div className="icon-box"><Calendar size={20}/></div>
                  <div>
                    <span className="label">Debt Free By</span>
                    <span className="value">
                      {new Date(new Date().setMonth(new Date().getMonth() + simulation.accelerated.months)).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <span className="sub">
                      {simulation.baseline.months - simulation.accelerated.months > 0 
                        ? `${simulation.baseline.months - simulation.accelerated.months} months sooner!` 
                        : 'Standard timeline'}
                    </span>
                  </div>
                </div>

                <div className="sim-stat-card success">
                  <div className="icon-box"><DollarSign size={20}/></div>
                  <div>
                    <span className="label">Interest Saved</span>
                    <span className="value">
                      ${Math.max(0, simulation.baseline.totalInterest - simulation.accelerated.totalInterest).toFixed(0)}
                    </span>
                    <span className="sub">vs. paying minimums</span>
                  </div>
                </div>
              </div>

              {/* CHART */}
              <div className="card tool-card" style={{height: 400}}>
                <h3>Payoff Timeline</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} minTickGap={30}/>
                    <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`}/>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)"/>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)' }}
                      formatter={(val) => [`$${val.toFixed(0)}`, '']}
                    />
                    <Legend verticalAlign="top" height={36}/>
                    <Area type="monotone" dataKey="Baseline" stroke="#ef4444" fillOpacity={1} fill="url(#colorBase)" name="Minimums Only" />
                    <Area type="monotone" dataKey="Accelerated" stroke="#22c55e" fillOpacity={1} fill="url(#colorAcc)" name="With Strategy" strokeWidth={3}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="empty-state-card">
              <Zap size={48} color="var(--accent)" style={{opacity:0.5, marginBottom:20}}/>
              <h3>No Debts Added</h3>
              <p>Add your loans on the left to generate your freedom plan.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}