import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon, Activity, Calendar, Download, AlertCircle, CheckCircle2, List } from 'lucide-react';

export default function Reports({ monthlyData, owners, categories, savingsGoals, recurringBills }) {
  // Default to the most recent month with data, or current month
  const availableMonths = Object.keys(monthlyData).sort().reverse();
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0] || new Date().toISOString().slice(0, 7));

  // --- MATH ENGINE ---
  const reportData = useMemo(() => {
    const data = monthlyData[selectedMonth] || { bills: [], incomes: {} };
    const bills = data.bills || [];
    const incomes = data.incomes || {};

    // 1. Calculate Total Income
    let totalIncome = 0;
    owners.forEach(owner => {
      const p1 = parseFloat(incomes[`${owner}_p1`] || 0);
      const p2 = parseFloat(incomes[`${owner}_p2`] || 0);
      const extra = parseFloat(incomes[`${owner}_extra`] || 0);
      totalIncome += p1 + p2 + extra;
    });

    // 2. Calculate Total Expenses & Categorize
    let totalExpenses = 0;
    const categoryBreakdown = {};
    let fixedCosts = 0; // Needs
    let flexibleCosts = 0; // Wants
    
    // New: Itemized Lists
    const needsItems = [];
    const wantsItems = [];

    bills.forEach(bill => {
      totalExpenses += bill.amount;
      const cat = bill.category || 'other';
      
      // Category Totals
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + bill.amount;

      // Needs vs Wants Logic
      if (['housing', 'utilities', 'debt', 'health', 'transport'].includes(cat)) {
        fixedCosts += bill.amount;
        needsItems.push(bill);
      } else {
        flexibleCosts += bill.amount;
        wantsItems.push(bill);
      }
    });

    // Sort itemized lists by amount (Highest first)
    needsItems.sort((a, b) => b.amount - a.amount);
    wantsItems.sort((a, b) => b.amount - a.amount);

    // 3. Net Results
    const netCashFlow = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((netCashFlow / totalIncome) * 100).toFixed(1) : 0;
    
    // 4. Savings Runway
    const totalLiquidSavings = savingsGoals.reduce((sum, g) => sum + g.totalPaid, 0);
    const monthsOfRunway = totalExpenses > 0 ? (totalLiquidSavings / totalExpenses).toFixed(1) : 0;

    return { totalIncome, totalExpenses, netCashFlow, savingsRate, categoryBreakdown, fixedCosts, flexibleCosts, totalLiquidSavings, monthsOfRunway, needsItems, wantsItems };
  }, [selectedMonth, monthlyData, owners, savingsGoals]);

  // Chart Data Prep
  const pieData = Object.entries(reportData.categoryBreakdown).map(([key, value]) => ({
    name: categories[key]?.label || key,
    value,
    color: categories[key]?.color || '#94a3b8'
  })).sort((a, b) => b.value - a.value);

  const monthLabel = new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 60 }}>
      {/* HEADER & CONTROLS */}
      <header className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Activity size={28} color="var(--accent)" /> Financial Reports
          </h1>
          <p className="subtitle">Executive summary for {monthLabel}</p>
        </div>
        <div className="select-wrapper-small">
          <Calendar size={16} className="icon" />
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ fontSize: '1rem', padding: '8px 12px 8px 32px' }}
          >
            {availableMonths.length > 0 ? availableMonths.map(m => (
              <option key={m} value={m}>{m}</option>
            )) : <option value={selectedMonth}>{selectedMonth}</option>}
          </select>
        </div>
      </header>

      {/* 1. THE CFO "1-PAGER" HERO CARD */}
      <div className="report-hero-card">
        <div className="hero-metric">
          <span className="hero-label">Net Cash Flow</span>
          <span className={`hero-value ${reportData.netCashFlow >= 0 ? 'pos' : 'neg'}`}>
            {reportData.netCashFlow >= 0 ? '+' : ''}${reportData.netCashFlow.toFixed(2)}
          </span>
          <span className="hero-sub">{reportData.savingsRate}% Savings Rate</span>
        </div>
        
        <div className="hero-divider"></div>

        <div className="hero-metric">
          <span className="hero-label">Total Income</span>
          <span className="hero-value text-default">${reportData.totalIncome.toFixed(0)}</span>
          <span className="hero-sub" style={{color: 'var(--green)'}}><TrendingUp size={12}/> Inflow</span>
        </div>

        <div className="hero-metric">
          <span className="hero-label">Total Expenses</span>
          <span className="hero-value text-default">${reportData.totalExpenses.toFixed(0)}</span>
          <span className="hero-sub" style={{color: 'var(--red)'}}><TrendingDown size={12}/> Outflow</span>
        </div>
      </div>

      <div className="reports-grid">
        
        {/* 2. LIFESTYLE AUDIT (NEEDS VS WANTS) */}
        <div className="card report-card">
          <h3><PieIcon size={18}/> Lifestyle Audit</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={[
                    { name: 'Needs (Fixed)', value: reportData.fixedCosts, color: '#ef4444' },
                    { name: 'Wants (Flexible)', value: reportData.flexibleCosts, color: '#3b82f6' },
                    { name: 'Unspent (Saved)', value: Math.max(0, reportData.netCashFlow), color: '#22c55e' }
                  ]} 
                  cx="50%" cy="50%" 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  <Cell fill="#ef4444"/>
                  <Cell fill="#3b82f6"/>
                  <Cell fill="#22c55e"/>
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)' }}
                  itemStyle={{ color: 'var(--text)' }}
                  formatter={(value) => `$${value.toFixed(0)}`}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-dim)', marginTop: 0 }}>
            You spent <b>${reportData.flexibleCosts.toFixed(0)}</b> on flexible lifestyle choices this month.
          </p>
        </div>

        {/* 3. CATEGORY BREAKDOWN */}
        <div className="card report-card">
          <h3>Top Expense Categories</h3>
          <div className="category-rank-list">
            {pieData.slice(0, 5).map((cat, idx) => (
              <div key={idx} className="rank-item">
                <div className="rank-bar-bg">
                  <div 
                    className="rank-bar-fill" 
                    style={{ 
                      width: `${(cat.value / reportData.totalExpenses) * 100}%`, 
                      backgroundColor: cat.color 
                    }}
                  ></div>
                </div>
                <div className="rank-info">
                  <span className="rank-name">{cat.name}</span>
                  <span className="rank-val">${cat.value.toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. FREEDOM FORECAST (RUNWAY) */}
        <div className="card report-card full-width" style={{ background: 'linear-gradient(135deg, var(--card) 0%, rgba(34, 197, 94, 0.05) 100%)' }}>
          <h3><CheckCircle2 size={18} color="var(--green)"/> Freedom Forecast</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <div className="forecast-stat">
              <span className="f-label">Total Liquid Savings</span>
              <span className="f-val">${reportData.totalLiquidSavings.toFixed(0)}</span>
            </div>
            <div className="forecast-stat">
              <span className="f-label">Avg Monthly Burn</span>
              <span className="f-val" style={{color: 'var(--red)'}}>-${reportData.totalExpenses.toFixed(0)}</span>
            </div>
            <div className="forecast-stat highlight">
              <span className="f-label">Safety Runway</span>
              <span className="f-val text-accent">{reportData.monthsOfRunway} Months</span>
              <span className="f-sub">If income stopped today</span>
            </div>
          </div>
        </div>

        {/* 5. ITEMIZED BREAKDOWN (NEW TABLE) */}
        <div className="card report-card full-width">
          <h3><List size={18}/> Itemized Breakdown</h3>
          <div className="split-list-container">
            
            {/* NEEDS COLUMN */}
            <div className="split-col">
              <h4 style={{ color: '#ef4444', borderBottom: '2px solid #ef4444' }}>Needs (Fixed)</h4>
              <div className="detail-list">
                {reportData.needsItems.length > 0 ? reportData.needsItems.map((item, i) => (
                  <div key={i} className="detail-row">
                    <span className="d-name">{item.name}</span>
                    <span className="d-val">${item.amount.toFixed(0)}</span>
                  </div>
                )) : <div className="empty-msg">No fixed bills found.</div>}
              </div>
            </div>

            {/* WANTS COLUMN */}
            <div className="split-col">
              <h4 style={{ color: '#3b82f6', borderBottom: '2px solid #3b82f6' }}>Wants (Flexible)</h4>
              <div className="detail-list">
                {reportData.wantsItems.length > 0 ? reportData.wantsItems.map((item, i) => (
                  <div key={i} className="detail-row">
                    <span className="d-name">{item.name}</span>
                    <span className="d-val">${item.amount.toFixed(0)}</span>
                  </div>
                )) : <div className="empty-msg">No flexible spending found.</div>}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}