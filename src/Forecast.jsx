import React from 'react';
import { CalendarClock, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Cell } from 'recharts';

function getOrdinal(n) {
  const j = n % 10, k = n % 100;
  if (j == 1 && k != 11) return n + "st";
  if (j == 2 && k != 12) return n + "nd";
  if (j == 3 && k != 13) return n + "rd";
  return n + "th";
}

export default function Forecast({ bills, currentDate, monthLabel, incomes, owners, rollover }) {
  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <div>
          <h1 style={{fontSize: '1.5rem'}}>Financial Forecast</h1>
          <p className="subtitle">Projected cash flow timeline for {monthLabel}</p>
        </div>
      </header>

      {/* 1. UPCOMING BILLS (Top Priority) */}
      <div className="forecast-section">
        <h3 style={{marginTop:0, marginBottom: 15, display:'flex', alignItems:'center', gap:8}}>
          <TrendingUp size={20} color="var(--green)"/> Next 7 Days
        </h3>
        <UpcomingList bills={bills} currentDate={currentDate} />
      </div>

      {/* 2. DAILY SPEND PULSE */}
      <div className="forecast-section">
        <h3 style={{marginTop:0, marginBottom: 15, display:'flex', alignItems:'center', gap:8}}>
          <BarChart3 size={20} color="var(--accent)"/> Daily Spending Pulse
        </h3>
        <div className="card" style={{padding: '20px 20px 5px 0', height: 250}}>
          <DailySpendChart bills={bills} currentDate={currentDate} />
        </div>
      </div>

      {/* 3. PROJECTED RUNNING BALANCE (The Crystal Ball) */}
      <div className="forecast-section">
        <h3 style={{marginTop:0, marginBottom: 15, display:'flex', alignItems:'center', gap:8}}>
          <Activity size={20} color="#22c55e"/> Projected Month-End Balance
        </h3>
        <div className="card" style={{padding: '20px 20px 5px 0', height: 300}}>
          <RunningBalanceChart 
            bills={bills} 
            currentDate={currentDate} 
            incomes={incomes} 
            owners={owners} 
            rollover={rollover} 
          />
        </div>
      </div>

      {/* 4. BIG CALENDAR (Bottom Anchor) */}
      <div className="forecast-section">
        <h3 style={{marginTop:0, marginBottom: 15, display:'flex', alignItems:'center', gap:8}}>
          <CalendarClock size={20} color="var(--text-dim)"/> Full Month View
        </h3>
        <div className="card" style={{padding: 20}}>
          <BigCalendar bills={bills} currentDate={currentDate} />
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function DailySpendChart({ bills, currentDate }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const data = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dayBills = bills.filter(b => {
      if (b.dueDate === day) return true;
      if (b.dueDate > daysInMonth && day === daysInMonth) return true;
      return false;
    });
    const total = dayBills.reduce((sum, b) => sum + b.amount, 0);
    return { day, amount: total, bills: dayBills };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { day, amount, bills } = payload[0].payload;
      if (amount === 0) return null;
      return (
        <div className="chart-tooltip">
          <p className="label">Day {day}</p>
          <p className="value" style={{marginBottom: 8}}>${amount.toFixed(0)} Due</p>
          <div style={{borderTop: '1px solid var(--border)', paddingTop: 6}}>
            {bills.map(b => (
              <div key={b.snapshotId} style={{fontSize: '0.75rem', display:'flex', justifyContent:'space-between', gap: 15, marginBottom: 2}}>
                <span style={{color: 'var(--text-dim)'}}>{b.name}</span>
                <span>${b.amount}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
        <XAxis dataKey="day" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} interval={2} />
        <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
        <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--bg)'}} />
        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.amount > 1000 ? '#ef4444' : entry.amount > 200 ? '#f59e0b' : '#3b82f6'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// --- NEW SMART RUNNING BALANCE CHART ---
function RunningBalanceChart({ bills, currentDate, incomes, owners, rollover }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Start with Rollover cash
  let currentBalance = rollover || 0;

  const data = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    
    // 1. Calculate Income landing on this day
    let dailyIncome = 0;
    const incomeSources = [];

    // Check Extra Income (Assume Day 1 for simplicity, or we could add a date for that too later)
    if (day === 1) {
      owners.filter(o => o !== 'Shared').forEach(owner => {
        dailyIncome += parseFloat(incomes[`${owner}_extra`] || 0);
      });
    }

    // Check Paychecks
    owners.filter(o => o !== 'Shared').forEach(owner => {
      const p1Date = parseInt(incomes[`${owner}_p1_date`]) || 0;
      const p2Date = parseInt(incomes[`${owner}_p2_date`]) || 0;

      if (p1Date === day) {
        const amt = parseFloat(incomes[`${owner}_p1`] || 0);
        dailyIncome += amt;
        if(amt > 0) incomeSources.push(`${owner} Check 1`);
      }
      if (p2Date === day) {
        const amt = parseFloat(incomes[`${owner}_p2`] || 0);
        dailyIncome += amt;
        if(amt > 0) incomeSources.push(`${owner} Check 2`);
      }
    });

    // 2. Calculate Bills due on this day
    const dayBills = bills.filter(b => {
      if (b.dueDate === day) return true;
      if (b.dueDate > daysInMonth && day === daysInMonth) return true;
      return false;
    });
    const dailyExpense = dayBills.reduce((sum, b) => sum + b.amount, 0);

    // 3. Update Balance
    currentBalance = currentBalance + dailyIncome - dailyExpense;

    return { 
      day, 
      balance: currentBalance, 
      expense: dailyExpense, 
      income: dailyIncome,
      bills: dayBills,
      incomeSources 
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { day, balance, expense, income, bills, incomeSources } = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="label" style={{marginBottom: 4}}>Day {day}</p>
          <p className="value" style={{color: balance < 0 ? '#ef4444' : 'var(--green)'}}>
            ${balance.toFixed(0)} Balance
          </p>
          
          {income > 0 && (
             <div style={{marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 6}}>
               <div style={{fontSize: '0.75rem', color: 'var(--green)', marginBottom: 4, fontWeight: 700}}>
                 +{income.toFixed(0)} Deposit
               </div>
               {incomeSources.map((src, idx) => (
                 <div key={idx} style={{fontSize: '0.7rem', color: 'var(--text-dim)'}}>{src}</div>
               ))}
             </div>
          )}

          {expense > 0 && (
            <div style={{marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 6}}>
              <div style={{fontSize: '0.75rem', color: 'var(--red)', marginBottom: 4, fontWeight: 700}}>
                -{expense.toFixed(0)} Expenses
              </div>
              {bills.map(b => (
                <div key={b.snapshotId} style={{fontSize: '0.7rem', display:'flex', justifyContent:'space-between', gap: 10, color: 'var(--text-dim)'}}>
                  <span>{b.name}</span>
                  <span>${b.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const offset = () => {
    const max = Math.max(...data.map(d => d.balance));
    const min = Math.min(...data.map(d => d.balance));
    if (max <= 0) return 0;
    if (min >= 0) return 1;
    return max / (max - min);
  };

  const off = offset();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset={off} stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset={off} stopColor="#ef4444" stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
        <XAxis dataKey="day" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} interval={2} />
        <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--text-dim)', strokeWidth: 1 }} />
        <ReferenceLine y={0} stroke="var(--text-dim)" strokeDasharray="3 3" />
        <Area type="monotone" dataKey="balance" stroke="#000" strokeWidth={0} fill="url(#splitColor)" />
        <Area type="monotone" dataKey="balance" stroke="var(--text)" strokeWidth={2} fill="none" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function UpcomingList({ bills, currentDate }) {
  const today = new Date().getDate();
  const currentMonth = currentDate.getMonth();
  const realMonth = new Date().getMonth();
  const startDay = currentMonth === realMonth ? today : 1;

  const upcoming = bills
    .filter(b => !b.isPaid && b.dueDate >= startDay)
    .sort((a, b) => a.dueDate - b.dueDate)
    .slice(0, 6); 

  if (upcoming.length === 0) {
    return (
      <div className="card empty-state-card">
        <CheckCircle2 size={32} color="var(--green)" style={{marginBottom: 10}}/>
        <span>You're all clear for the rest of the month!</span>
      </div>
    );
  }

  return (
    <div className="upcoming-grid">
      {upcoming.map(b => (
        <div key={b.snapshotId} className="upcoming-card">
          <div className="upcoming-left">
            <div className="upcoming-day">{b.dueDate}</div>
            <div className="upcoming-ordinal">{getOrdinal(b.dueDate).replace(/[0-9]/g, '')}</div>
          </div>
          <div className="upcoming-right">
            <div className="bill-name">{b.name}</div>
            <div className="bill-sub">{b.owner} • {b.columnId === 'pay1' ? 'Check 1' : 'Check 2'}</div>
            <div className="bill-amount">-${b.amount}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BigCalendar({ bills, currentDate }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); 

  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarCells.push(i);

  return (
    <div className="big-calendar-grid">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
        <div key={d} className="cal-header">{d}</div>
      ))}
      {calendarCells.map((day, idx) => {
        if (!day) return <div key={`empty-${idx}`} className="cal-cell empty"></div>;
        
        const dayBills = bills.filter(b => b.dueDate === day || (b.dueDate > daysInMonth && day === daysInMonth));
        
        return (
          <div key={day} className="cal-cell">
            <div className="cal-date">{day}</div>
            <div className="cal-pills">
              {dayBills.map(b => (
                <div key={b.snapshotId} className={`cal-pill ${b.isPaid ? 'paid' : ''} ${b.owner === 'Shared' ? 'shared' : ''}`}>
                  {b.name}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}