import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calculator, Plus, Trash2, TrendingUp, DollarSign, Calendar, Zap, PieChart as PieIcon } from 'lucide-react';

export default function Tools() {
  const [activeTool, setActiveTool] = useState('debt'); // 'debt' or 'invest'

  // --- DEBT STATE ---
  const [debts, setDebts] = useState([
    { id: 1, name: 'Visa Card', balance: 5000, rate: 24.99, minPayment: 150 },
    { id: 2, name: 'Car Loan', balance: 12000, rate: 6.5, minPayment: 350 }
  ]);
  const [newDebt, setNewDebt] = useState({ name: '', balance: '', rate: '', minPayment: '' });
  const [extraPayment, setExtraPayment] = useState(100);
  const [strategy, setStrategy] = useState('avalanche');

  // --- INVESTMENT STATE ---
  const [investForm, setInvestForm] = useState({
    initial: 1000,
    monthly: 500,
    rate: 8, // Standard S&P 500 adjusted for inflation
    years: 30
  });

  // --- DEBT ACTIONS ---
  const handleAddDebt = (e) => {
    e.preventDefault();
    if (!newDebt.name || !newDebt.balance) return;
    setDebts([...debts, { 
      id: Date.now(), name: newDebt.name, 
      balance: parseFloat(newDebt.balance), rate: parseFloat(newDebt.rate || 0), 
      minPayment: parseFloat(newDebt.minPayment || 0) 
    }]);
    setNewDebt({ name: '', balance: '', rate: '', minPayment: '' });
  };
  const handleDeleteDebt = (id) => setDebts(debts.filter(d => d.id !== id));

  // --- DEBT SIMULATION ENGINE ---
  const debtSimulation = useMemo(() => {
    if (debts.length === 0) return null;
    const runScenario = (isAccelerated) => {
      let currentDebts = debts.map(d => ({ ...d })); 
      let timeline = [];
      let totalInterest = 0;
      let months = 0;
      let monthlyExtra = isAccelerated ? extraPayment : 0;

      while (currentDebts.some(d => d.balance > 0) && months < 360) {
        let monthInterest = 0;
        let totalBalance = 0;
        let freedUpCash = 0;

        currentDebts.forEach(d => {
          if (d.balance > 0) {
            const interest = (d.balance * (d.rate / 100)) / 12;
            monthInterest += interest;
            d.balance += interest;
            let payment = d.minPayment;
            if (d.balance < payment) { payment = d.balance; freedUpCash += (d.minPayment - payment); }
            d.balance -= payment;
            totalBalance += d.balance;
          } else { freedUpCash += d.minPayment; }
        });

        if (isAccelerated) {
          let availableExtra = monthlyExtra + freedUpCash;
          const sortedDebts = [...currentDebts].filter(d => d.balance > 0).sort((a, b) => strategy === 'snowball' ? a.balance - b.balance : b.rate - a.rate);
          if (sortedDebts.length > 0) {
            let target = currentDebts.find(d => d.id === sortedDebts[0].id);
            if (target.balance < availableExtra) { availableExtra -= target.balance; target.balance = 0; } 
            else { target.balance -= availableExtra; }
            totalBalance = currentDebts.reduce((sum, d) => sum + d.balance, 0);
          }
        }
        totalInterest += monthInterest;
        months++;
        if (months % 3 === 0 || totalBalance === 0) {
          timeline.push({ name: months, balance: Math.max(0, totalBalance), date: new Date(new Date().setMonth(new Date().getMonth() + months)).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) });
        }
      }
      return { timeline, totalInterest, months };
    };
    return { baseline: runScenario(false), accelerated: runScenario(true) };
  }, [debts, extraPayment, strategy]);

  const debtChartData = debtSimulation ? debtSimulation.baseline.timeline.map((point, index) => {
    const accPoint = debtSimulation.accelerated.timeline[index];
    return { name: point.date, Baseline: point.balance, Accelerated: accPoint ? accPoint.balance : 0 };
  }) : [];

  // --- INVESTMENT SIMULATION ENGINE ---
  const investSimulation = useMemo(() => {
    const months = investForm.years * 12;
    const monthlyRate = investForm.rate / 100 / 12;
    let balance = investForm.initial;
    let totalPrincipal = investForm.initial;
    const data = [];

    for (let i = 1; i <= months; i++) {
      balance = (balance + investForm.monthly) * (1 + monthlyRate);
      totalPrincipal += investForm.monthly;

      if (i % 12 === 0) { // Only log once a year to keep chart clean
        data.push({
          year: `Year ${i / 12}`,
          Principal: totalPrincipal,
          Interest: balance - totalPrincipal,
          Total: balance
        });
      }
    }
    return { data, finalBalance: balance, totalPrincipal, totalInterest: balance - totalPrincipal };
  }, [investForm]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 60 }}>
      <header className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calculator size={28} color="var(--accent)" /> Tools & Simulations
          </h1>
          <p className="subtitle">Play "What If?" with your financial future.</p>
        </div>
      </header>

      {/* TOOL SELECTOR */}
      <div className="tool-tabs" style={{ marginBottom: 20 }}>
        <button className={`tool-tab ${activeTool === 'debt' ? 'active' : ''}`} onClick={() => setActiveTool('debt')}>Debt Destroyer 📉</button>
        <button className={`tool-tab ${activeTool === 'invest' ? 'active' : ''}`} onClick={() => setActiveTool('invest')}>Millionaire Math 📈</button>
      </div>

      {/* ========================================== */}
      {/* DEBT DESTROYER VIEW                        */}
      {/* ========================================== */}
      {activeTool === 'debt' && (
        <div className="tools-grid-layout">
          <div className="inputs-column">
            <div className="card tool-card">
              <h3>Your Debts</h3>
              <div className="debt-list">
                {debts.map(debt => (
                  <div key={debt.id} className="debt-item">
                    <div style={{ flex: 1 }}>
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
                <input placeholder="Name (e.g. Visa)" value={newDebt.name} onChange={e => setNewDebt({ ...newDebt, name: e.target.value })} />
                <div className="split-inputs">
                  <input type="number" placeholder="Balance" value={newDebt.balance} onChange={e => setNewDebt({ ...newDebt, balance: e.target.value })} />
                  <input type="number" placeholder="APR %" value={newDebt.rate} onChange={e => setNewDebt({ ...newDebt, rate: e.target.value })} />
                </div>
                <div className="split-inputs">
                  <input type="number" placeholder="Min Pay" value={newDebt.minPayment} onChange={e => setNewDebt({ ...newDebt, minPayment: e.target.value })} />
                  <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}><Plus size={18}/></button>
                </div>
              </form>
            </div>
            <div className="card tool-card">
              <h3>Strategy Controls</h3>
              <div className="control-group">
                <label>Extra Monthly Payment: <span className="highlight-val">${extraPayment}</span></label>
                <input type="range" min="0" max="2000" step="10" value={extraPayment} onChange={e => setExtraPayment(parseInt(e.target.value))} className="slider" />
                <div className="slider-labels"><span>$0</span><span>$2,000</span></div>
              </div>
              <div className="control-group">
                <label>Payoff Method</label>
                <div className="strategy-toggle">
                  <button className={strategy === 'avalanche' ? 'active' : ''} onClick={() => setStrategy('avalanche')}>Avalanche 🏔️</button>
                  <button className={strategy === 'snowball' ? 'active' : ''} onClick={() => setStrategy('snowball')}>Snowball ❄️</button>
                </div>
                <p className="strategy-desc">{strategy === 'avalanche' ? 'Targeting highest interest rates first. Saves the most money.' : 'Targeting lowest balances first. Builds momentum faster.'}</p>
              </div>
            </div>
          </div>
          <div className="results-column">
            {debtSimulation && debts.length > 0 ? (
              <>
                <div className="sim-stats-grid">
                  <div className="sim-stat-card success">
                    <div className="icon-box"><Calendar size={20}/></div>
                    <div>
                      <span className="label">Debt Free By</span>
                      <span className="value">{new Date(new Date().setMonth(new Date().getMonth() + debtSimulation.accelerated.months)).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                      <span className="sub">{debtSimulation.baseline.months - debtSimulation.accelerated.months > 0 ? `${debtSimulation.baseline.months - debtSimulation.accelerated.months} months sooner!` : 'Standard timeline'}</span>
                    </div>
                  </div>
                  <div className="sim-stat-card success">
                    <div className="icon-box"><DollarSign size={20}/></div>
                    <div>
                      <span className="label">Interest Saved</span>
                      <span className="value">${Math.max(0, debtSimulation.baseline.totalInterest - debtSimulation.accelerated.totalInterest).toFixed(0)}</span>
                      <span className="sub">vs. paying minimums</span>
                    </div>
                  </div>
                </div>
                <div className="card tool-card" style={{ height: 400 }}>
                  <h3>Payoff Timeline</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={debtChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                        <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                      <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <RechartsTooltip contentStyle={{ backgroundColor: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)' }} formatter={(val) => [`$${val.toFixed(0)}`, '']} />
                      <Legend verticalAlign="top" height={36} />
                      <Area type="monotone" dataKey="Baseline" stroke="#ef4444" fillOpacity={1} fill="url(#colorBase)" name="Minimums Only" />
                      <Area type="monotone" dataKey="Accelerated" stroke="#22c55e" fillOpacity={1} fill="url(#colorAcc)" name="With Strategy" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="empty-state-card"><Zap size={48} color="var(--accent)" style={{ opacity: 0.5, marginBottom: 20 }} /><h3>No Debts Added</h3><p>Add your loans on the left to generate your freedom plan.</p></div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MILLIONAIRE MATH VIEW                      */}
      {/* ========================================== */}
      {activeTool === 'invest' && (
        <div className="tools-grid-layout">
          <div className="inputs-column">
            <div className="card tool-card">
              <h3>Investment Inputs</h3>
              <div className="control-group">
                <label>Initial Investment</label>
                <div style={{position:'relative'}}><span style={{position:'absolute', left:10, top:10, color:'var(--text-dim)'}}>$</span><input type="number" className="input-field" style={{paddingLeft:25}} value={investForm.initial} onChange={e => setInvestForm({...investForm, initial: parseFloat(e.target.value) || 0})} /></div>
              </div>
              <div className="control-group">
                <label>Monthly Contribution: <span className="highlight-val">${investForm.monthly}</span></label>
                <input type="range" min="0" max="5000" step="50" value={investForm.monthly} onChange={e => setInvestForm({...investForm, monthly: parseInt(e.target.value)})} className="slider" />
              </div>
              <div className="control-group">
                <label>Annual Return Rate: <span className="highlight-val">{investForm.rate}%</span></label>
                <input type="range" min="1" max="15" step="0.5" value={investForm.rate} onChange={e => setInvestForm({...investForm, rate: parseFloat(e.target.value)})} className="slider" />
                <div className="slider-labels"><span>Safe (3%)</span><span>S&P 500 (8%)</span><span>Aggressive (12%)</span></div>
              </div>
              <div className="control-group">
                <label>Years to Grow: <span className="highlight-val">{investForm.years} Years</span></label>
                <input type="range" min="1" max="50" step="1" value={investForm.years} onChange={e => setInvestForm({...investForm, years: parseInt(e.target.value)})} className="slider" />
              </div>
            </div>
          </div>

          <div className="results-column">
            <div className="sim-stats-grid">
              <div className="sim-stat-card success">
                <div className="icon-box"><TrendingUp size={20}/></div>
                <div>
                  <span className="label">Future Value</span>
                  <span className="value text-accent">${investSimulation.finalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  <span className="sub">in {investForm.years} years</span>
                </div>
              </div>
              <div className="sim-stat-card">
                <div className="icon-box"><PieIcon size={20}/></div>
                <div>
                  <span className="label">Total Contributed</span>
                  <span className="value">${investSimulation.totalPrincipal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  <span className="sub">Money you put in</span>
                </div>
              </div>
            </div>

            <div className="card tool-card" style={{ height: 400 }}>
              <h3>Compound Growth Chart</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={investSimulation.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0.2}/></linearGradient>
                    <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/></linearGradient>
                  </defs>
                  <XAxis dataKey="year" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                  <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)' }} formatter={(val) => [`$${Math.round(val).toLocaleString()}`, '']} />
                  <Legend verticalAlign="top" height={36} />
                  <Area type="monotone" dataKey="Interest" stackId="1" stroke="#22c55e" fill="url(#colorInterest)" name="Free Money (Interest)" />
                  <Area type="monotone" dataKey="Principal" stackId="1" stroke="#3b82f6" fill="url(#colorPrincipal)" name="Your Money (Principal)" />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{textAlign:'center', marginTop: 10, fontSize: '0.9rem', color: 'var(--text-dim)'}}>
                You earned <strong style={{color: 'var(--green)'}}>${investSimulation.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong> in free interest!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}