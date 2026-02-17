import React, { useState, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon, Activity, Calendar, Download, CheckCircle2, List, Loader2, ArrowRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Reports({ monthlyData, owners, categories, savingsGoals }) {
  const availableMonths = Object.keys(monthlyData).sort().reverse();
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0] || new Date().toISOString().slice(0, 7));
  const [reportType, setReportType] = useState('executive'); // 'executive' or 'trends'
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const reportRef = useRef(null);

  // --- HELPER: PARSE MONTH ---
  const getPrevMonthKey = (currentKey) => {
    const [y, m] = currentKey.split('-').map(Number);
    const prevDate = new Date(y, m - 2); // Month is 0-indexed in JS Date, so m-2 gets previous
    return `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  };

  // --- MATH ENGINE ---
  const reportData = useMemo(() => {
    // 1. CURRENT MONTH DATA
    const currentData = monthlyData[selectedMonth] || { bills: [], incomes: {} };
    const bills = currentData.bills || [];
    const incomes = currentData.incomes || {};

    let totalIncome = 0;
    owners.forEach(owner => {
      totalIncome += (parseFloat(incomes[`${owner}_p1`] || 0) + parseFloat(incomes[`${owner}_p2`] || 0) + parseFloat(incomes[`${owner}_extra`] || 0));
    });

    let totalExpenses = 0;
    const categoryBreakdown = {};
    const needsItems = [];
    const wantsItems = [];

    bills.forEach(bill => {
      totalExpenses += bill.amount;
      const cat = bill.category || 'other';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + bill.amount;
      if (['housing', 'utilities', 'debt', 'health', 'transport'].includes(cat)) needsItems.push(bill);
      else wantsItems.push(bill);
    });

    // 2. PREVIOUS MONTH DATA (For Trends)
    const prevKey = getPrevMonthKey(selectedMonth);
    const prevData = monthlyData[prevKey] || { bills: [], incomes: {} };
    const prevBills = prevData.bills || [];
    let prevExpenses = prevBills.reduce((sum, b) => sum + b.amount, 0);
    
    // Category Deltas
    const categoryDeltas = [];
    const allCats = new Set([...Object.keys(categoryBreakdown), ...prevBills.map(b => b.category || 'other')]);
    
    allCats.forEach(cat => {
      const currVal = categoryBreakdown[cat] || 0;
      const prevVal = prevBills.filter(b => (b.category || 'other') === cat).reduce((s, b) => s + b.amount, 0);
      const diff = currVal - prevVal;
      categoryDeltas.push({ 
        cat, 
        label: categories[cat]?.label || cat, 
        color: categories[cat]?.color || '#94a3b8',
        currVal, 
        prevVal, 
        diff,
        pct: prevVal > 0 ? ((diff / prevVal) * 100).toFixed(1) : (currVal > 0 ? '100' : '0')
      });
    });

    // Sort by absolute change impact
    categoryDeltas.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

    // 3. STATS
    const netCashFlow = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((netCashFlow / totalIncome) * 100).toFixed(1) : 0;
    const totalLiquidSavings = savingsGoals.reduce((sum, g) => sum + g.totalPaid, 0);
    const monthsOfRunway = totalExpenses > 0 ? (totalLiquidSavings / totalExpenses).toFixed(1) : 0;
    const expenseChange = totalExpenses - prevExpenses;

    return { 
      totalIncome, totalExpenses, netCashFlow, savingsRate, categoryBreakdown, 
      needsItems: needsItems.sort((a,b) => b.amount - a.amount), 
      wantsItems: wantsItems.sort((a,b) => b.amount - a.amount), 
      totalLiquidSavings, monthsOfRunway,
      prevExpenses, expenseChange, categoryDeltas, prevKey
    };
  }, [selectedMonth, monthlyData, owners, savingsGoals]);

  // --- FORMATTING HELPERS ---
  // Fix: Parse manually to avoid UTC timezone rollback
  const [rptYear, rptMonth] = selectedMonth.split('-').map(Number);
  const monthLabel = new Date(rptYear, rptMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const [prevYear, prevMonth] = reportData.prevKey.split('-').map(Number);
  const prevMonthLabel = new Date(prevYear, prevMonth - 1).toLocaleString('default', { month: 'short' });

  // --- PDF GENERATOR ---
  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22); doc.setTextColor(40); doc.text(reportType === 'executive' ? 'Executive Financial Summary' : 'Month-Over-Month Comparison', 14, 20);
    doc.setFontSize(10); doc.setTextColor(100); doc.text(`OmegaBudget Report | ${monthLabel}`, 14, 26);

    // Summary Box
    doc.setFillColor(245, 247, 250); doc.roundedRect(14, 35, 180, 25, 3, 3, 'F');
    doc.setFontSize(9); doc.text('NET OUTFLOW', 20, 42); doc.text('PREV MONTH', 80, 42); doc.text('DIFFERENCE', 140, 42);
    
    doc.setFontSize(14); doc.setTextColor(40);
    doc.text(`$${reportData.totalExpenses.toFixed(0)}`, 20, 50);
    doc.text(`$${reportData.prevExpenses.toFixed(0)}`, 80, 50);
    
    const diffColor = reportData.expenseChange > 0 ? [239, 68, 68] : [34, 197, 94];
    doc.setTextColor(diffColor[0], diffColor[1], diffColor[2]);
    doc.text(`${reportData.expenseChange > 0 ? '+' : ''}$${reportData.expenseChange.toFixed(0)}`, 140, 50);

    // Table
    if (reportType === 'executive') {
       doc.setTextColor(40); doc.setFontSize(11); doc.text('Needs & Fixed Costs', 14, 75);
       autoTable(doc, {
         startY: 78, head: [['Bill', 'Category', 'Amount']],
         body: reportData.needsItems.map(i => [i.name, categories[i.category]?.label, `$${i.amount}`]),
         theme: 'grid', headStyles: { fillColor: [239, 68, 68] }
       });
    } else {
       doc.setTextColor(40); doc.setFontSize(11); doc.text('Category Trends', 14, 75);
       autoTable(doc, {
         startY: 78, head: [['Category', 'This Month', 'Last Month', 'Change']],
         body: reportData.categoryDeltas.map(d => [d.label, `$${d.currVal}`, `$${d.prevVal}`, `${d.diff > 0 ? '+' : ''}$${d.diff} (${d.pct}%)`]),
         theme: 'grid', headStyles: { fillColor: [59, 130, 246] }
       });
    }

    doc.save(`OmegaBudget_${reportType}_${selectedMonth}.pdf`);
    setIsGeneratingPdf(false);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 60 }}>
      {/* HEADER & CONTROLS */}
      <header className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Activity size={28} color="var(--accent)" /> Financial Reports
          </h1>
          <p className="subtitle">Insights for {monthLabel}</p>
        </div>
        
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div className="view-toggle">
            <button className={reportType === 'executive' ? 'active' : ''} onClick={() => setReportType('executive')}>Executive Summary</button>
            <button className={reportType === 'trends' ? 'active' : ''} onClick={() => setReportType('trends')}>Comparison</button>
          </div>

          <div className="select-wrapper-small">
            <Calendar size={16} className="icon" />
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ fontSize: '0.9rem', padding: '8px 12px 8px 32px' }}>
              {availableMonths.length > 0 ? availableMonths.map(m => <option key={m} value={m}>{m}</option>) : <option value={selectedMonth}>{selectedMonth}</option>}
            </select>
          </div>

          <button className="btn-primary" onClick={handleDownloadPDF} disabled={isGeneratingPdf} style={{ fontSize: '0.9rem' }}>
            {isGeneratingPdf ? <Loader2 className="spin" size={16}/> : <Download size={16} />}
          </button>
        </div>
      </header>

      {/* PRINTABLE TARGET */}
      <div ref={reportRef} style={{ background: 'var(--bg)', padding: 10 }}>
        
        {/* EXECUTIVE VIEW */}
        {reportType === 'executive' && (
          <>
            <div className="report-hero-card">
              <div className="hero-metric">
                <span className="hero-label">Net Cash Flow</span>
                <span className={`hero-value ${reportData.netCashFlow >= 0 ? 'pos' : 'neg'}`}>
                  {reportData.netCashFlow >= 0 ? '+' : ''}${reportData.netCashFlow.toFixed(2)}
                </span>
                <span className="hero-sub">{reportData.savingsRate}% Savings Rate</span>
              </div>
              <div className="hero-divider"></div>
              <div className="hero-metric"><span className="hero-label">Income</span><span className="hero-value text-default">${reportData.totalIncome.toFixed(0)}</span></div>
              <div className="hero-metric"><span className="hero-label">Expenses</span><span className="hero-value text-default">${reportData.totalExpenses.toFixed(0)}</span></div>
            </div>

            <div className="reports-grid">
              <div className="card report-card">
                <h3><PieIcon size={18}/> Needs vs Wants</h3>
                <div style={{ height: 200 }}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{ name: 'Fixed', value: reportData.categoryBreakdown.housing + reportData.categoryBreakdown.utilities || 0, color: '#ef4444' }, { name: 'Flexible', value: reportData.totalExpenses - (reportData.categoryBreakdown.housing || 0), color: '#3b82f6' }]} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value"><Cell fill="#ef4444"/><Cell fill="#3b82f6"/></Pie><Legend verticalAlign="bottom" height={36}/></PieChart></ResponsiveContainer></div>
              </div>
              <div className="card report-card full-width">
                <h3><List size={18}/> Itemized Breakdown</h3>
                <div className="split-list-container">
                  <div className="split-col"><h4 style={{ color: '#ef4444', borderBottom: '2px solid #ef4444' }}>Needs (Fixed)</h4><div className="detail-list">{reportData.needsItems.map((item, i) => (<div key={i} className="detail-row"><span className="d-name">{item.name}</span><span className="d-val">${item.amount.toFixed(0)}</span></div>))}</div></div>
                  <div className="split-col"><h4 style={{ color: '#3b82f6', borderBottom: '2px solid #3b82f6' }}>Wants (Flexible)</h4><div className="detail-list">{reportData.wantsItems.map((item, i) => (<div key={i} className="detail-row"><span className="d-name">{item.name}</span><span className="d-val">${item.amount.toFixed(0)}</span></div>))}</div></div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TRENDS VIEW */}
        {reportType === 'trends' && (
          <>
            <div className="report-hero-card">
              <div className="hero-metric">
                <span className="hero-label">Spend Velocity</span>
                <div style={{display:'flex', alignItems:'center', gap:10}}>
                  <span className={`hero-value ${reportData.expenseChange > 0 ? 'neg' : 'pos'}`}>
                    {reportData.expenseChange > 0 ? '+' : ''}${reportData.expenseChange.toFixed(0)}
                  </span>
                  {reportData.expenseChange > 0 ? <TrendingUp size={32} color="var(--red)"/> : <TrendingDown size={32} color="var(--green)"/>}
                </div>
                <span className="hero-sub">vs {prevMonthLabel}</span>
              </div>
              <div className="hero-divider"></div>
              <div className="hero-metric"><span className="hero-label">This Month</span><span className="hero-value text-default">${reportData.totalExpenses.toFixed(0)}</span></div>
              <div className="hero-metric"><span className="hero-label">Last Month</span><span className="hero-value text-default" style={{color:'var(--text-dim)'}}>${reportData.prevExpenses.toFixed(0)}</span></div>
            </div>

            <div className="card report-card full-width">
              <h3>Category Changes (Month over Month)</h3>
              <div className="detail-list">
                {reportData.categoryDeltas.map((d, idx) => (
                  <div key={idx} className="detail-row" style={{ padding: '12px 0' }}>
                    <div style={{display:'flex', alignItems:'center', gap:10, width: '40%'}}>
                      <div className="color-dot" style={{background: d.color}}></div>
                      <span className="d-name" style={{fontSize:'1rem'}}>{d.label}</span>
                    </div>
                    
                    <div style={{display:'flex', gap:20, flex:1, justifyContent:'flex-end'}}>
                      <div style={{textAlign:'right'}}>
                        <span style={{display:'block', fontSize:'0.75rem', color:'var(--text-dim)'}}>{prevMonthLabel}</span>
                        <span style={{fontWeight:600}}>${d.prevVal.toFixed(0)}</span>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <span style={{display:'block', fontSize:'0.75rem', color:'var(--text-dim)'}}>Current</span>
                        <span style={{fontWeight:600}}>${d.currVal.toFixed(0)}</span>
                      </div>
                      <div style={{width: 80, textAlign:'right', display:'flex', flexDirection:'column', alignItems:'flex-end'}}>
                         <span style={{fontWeight: 700, color: d.diff > 0 ? 'var(--red)' : 'var(--green)'}}>
                           {d.diff > 0 ? '+' : ''}{d.diff.toFixed(0)}
                         </span>
                         <span style={{fontSize:'0.75rem', color: d.diff > 0 ? 'var(--red)' : 'var(--green)'}}>
                           {d.diff > 0 ? '🔺' : '⬇️'} {Math.abs(d.pct)}%
                         </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}