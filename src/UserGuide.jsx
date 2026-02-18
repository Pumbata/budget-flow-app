import React, { useState } from 'react';
import { BookOpen, LayoutDashboard, SplitSquareHorizontal, Target, Calculator, PieChart, Settings, ArrowRight } from 'lucide-react';

export default function UserGuide() {
  const [activeSection, setActiveSection] = useState('intro');

  const scrollTo = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const Section = ({ id, title, icon: Icon, children }) => (
    <section id={id} style={{ marginBottom: 80, scrollMarginTop: 40, paddingBottom: 40, borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
        <div style={{ padding: 10, background: 'rgba(96, 165, 250, 0.1)', borderRadius: 12 }}>
          <Icon size={32} color="var(--accent)" />
        </div>
        <h2 style={{ fontSize: '2.2rem', margin: 0, letterSpacing: '-1px' }}>{title}</h2>
      </div>
      <div style={{ paddingLeft: 10 }}>
        {children}
      </div>
    </section>
  );

  const Placeholder = ({ label }) => (
    <div style={{ 
      width: '100%', 
      height: 220, 
      background: 'rgba(0,0,0,0.2)', 
      border: '2px dashed var(--border)', 
      borderRadius: 16, 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      margin: '30px 0',
      color: 'var(--text-dim)',
      transition: 'all 0.2s'
    }}>
      <div style={{ fontSize: '2.5rem', opacity: 0.3, marginBottom: 10 }}>📷</div>
      <p style={{ margin: 0, fontWeight: 500 }}>{label}</p>
      <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>(Insert Screenshot Here)</span>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: 40, height: 'calc(100vh - 40px)', overflow: 'hidden' }}>
      
      {/* LEFT: Table of Contents */}
      <aside style={{ width: 260, flexShrink: 0, borderRight: '1px solid var(--border)', paddingRight: 20, overflowY: 'auto' }}>
        <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 20, marginTop: 10 }}>User Manual</h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <NavButton id="intro" active={activeSection} onClick={scrollTo} icon={BookOpen} label="Philosophy" />
          <NavButton id="dashboard" active={activeSection} onClick={scrollTo} icon={LayoutDashboard} label="The Dashboard" />
          <NavButton id="blueprint" active={activeSection} onClick={scrollTo} icon={SplitSquareHorizontal} label="The Blueprint" />
          <NavButton id="savings" active={activeSection} onClick={scrollTo} icon={Target} label="Savings & Goals" />
          <NavButton id="tools" active={activeSection} onClick={scrollTo} icon={Calculator} label="Tools & Sims" />
          <NavButton id="reports" active={activeSection} onClick={scrollTo} icon={PieChart} label="Financial Reports" />
          <NavButton id="settings" active={activeSection} onClick={scrollTo} icon={Settings} label="Settings" />
        </nav>
      </aside>

      {/* RIGHT: Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 40, paddingBottom: 100 }}>
        
        {/* INTRO */}
        <Section id="intro" title="The Philosophy" icon={BookOpen}>
          <p className="lead" style={{ fontSize: '1.2rem', lineHeight: 1.6 }}>Welcome to OmegaBudget. If you have tried other budgeting apps and failed, it likely wasn't your fault. It was the system's fault.</p>
          
          <div style={{ background: 'var(--card-bg)', padding: 25, borderRadius: 16, margin: '20px 0', borderLeft: '4px solid var(--accent)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--accent)' }}>The Kanban Method</h4>
            <p style={{ margin: 0, lineHeight: 1.6 }}>Most apps are "Forensic Accounting"—they look backward at what you already spent. OmegaBudget is an <strong>Operational Command Center</strong>. We use the Kanban system (invented by Toyota in the 1950s) to visualize your money as a supply chain, allowing you to manage flow, not just inventory.</p>
          </div>

          <Placeholder label="Toyota Kanban vs OmegaBudget Board" />

          <h3>Why it Works</h3>
          <ul style={{ lineHeight: 1.8, color: 'var(--text-dim)' }}>
            <li><strong>Visual Flow:</strong> See exactly where your bottlenecks are.</li>
            <li><strong>Active Management:</strong> Dragging a bill forces you to acknowledge the trade-off.</li>
            <li><strong>Just-In-Time:</strong> Keep enough cash for the current cycle, invest the rest.</li>
          </ul>
        </Section>

        {/* DASHBOARD */}
        <Section id="dashboard" title="The Dashboard" icon={LayoutDashboard}>
          <p>The Dashboard is your daily cockpit. This is where you execute your financial plan.</p>
          
          <h3>1. Setting Up Income</h3>
          <p>At the start of the month, input your expected paychecks in the top input fields. This creates your "Supply."</p>
          <Placeholder label="Income Inputs & Free Cash Badges" />
          
          <h3>2. The Card System</h3>
          <p>Every bill is a card. Cards have three states:</p>
          <ul style={{ lineHeight: 1.8 }}>
            <li><strong>Paycheck 1 Column:</strong> Bills to be paid with your first check.</li>
            <li><strong>Paycheck 2 Column:</strong> Bills to be paid with your second check.</li>
            <li><strong>Paid Column:</strong> Bills that are done.</li>
          </ul>
          
          <div className="tip-box" style={tipStyle}>
            <strong>Pro Tip:</strong> If the "Free Cash" badge turns <span style={{color:'var(--red)'}}>Red</span>, you have over-assigned bills to that paycheck. Drag some cards to the other column!
          </div>

          <h3>3. Adding One-Off Expenses</h3>
          <p>Did you buy a coffee or unexpected groceries? Click the <strong>+ Add Expense</strong> button to create a temporary card for just this month.</p>
        </Section>

        {/* BLUEPRINT */}
        <Section id="blueprint" title="The Blueprint" icon={SplitSquareHorizontal}>
          <p>The Blueprint is the "DNA" of your budget. Changes made here will repeat every single month.</p>
          
          <h3>Recurring Expenses</h3>
          <p>Add your Rent, Internet, Netflix, and Insurance here. You set them up once, and the system generates them automatically on the Dashboard forever.</p>
          <Placeholder label="Blueprint List of Recurring Bills" />

          <h3>The Sync Logic</h3>
          <p>The Blueprint does not change the <em>current</em> month immediately (to prevent accidents). If you add a new bill here, go to your Dashboard and click <strong>"Sync Blueprint"</strong> to pull it in.</p>
        </Section>

        {/* SAVINGS */}
        <Section id="savings" title="Savings & Goals" icon={Target}>
          <p>Stop being surprised by "Annual" expenses. Use Sinking Funds to turn big scary bills into small monthly payments.</p>
          
          <h3>Creating a Goal</h3>
          <p>Example: You want $800 for Christmas Gifts by December 1st.</p>
          <ol style={{ lineHeight: 1.8, marginBottom: 20 }}>
            <li>Click <strong>+ New Goal</strong>.</li>
            <li>Enter "Christmas", Target: "$800", Date: "Dec 1".</li>
            <li>The app calculates the <strong>Monthly Required Contribution</strong>.</li>
          </ol>
          <Placeholder label="Goal Creation Modal" />

          <h3>Funding Goals</h3>
          <p>The app creates a "Bill" on your dashboard called "Christmas Fund." When you "pay" it, you are actually transferring money to your own savings account.</p>
        </Section>

        {/* TOOLS */}
        <Section id="tools" title="Tools & Simulations" icon={Calculator}>
          <p>This is your sandbox. Run simulations without affecting your real money.</p>
          
          <h3>Debt Destroyer 📉</h3>
          <p>Plug in your credit cards and interest rates. The tool simulates the <strong>Avalanche vs. Snowball</strong> methods to show you which one gets you debt-free faster.</p>
          <Placeholder label="Debt Destroyer Chart" />

          <h3>Millionaire Math 📈</h3>
          <p>Visualizing Compound Interest. See how investing just $500/mo can turn into over $1 Million over 30 years.</p>
          
          <h3>Is It Worth It? ⏳</h3>
          <p>A "Time-Cost" calculator. Enter your hourly wage and the price of an item (e.g., a $700 PS5). The app tells you how many hours of your life you are trading for it.</p>
        </Section>

        {/* REPORTS */}
        <Section id="reports" title="Financial Reports" icon={PieChart}>
          <p>The "State of the Union" address for your household.</p>

          <h3>The Executive Summary</h3>
          <p>At the top, you get an instant health check:</p>
          <ul style={{ lineHeight: 1.8 }}>
            <li><strong>Net Cash Flow:</strong> Did you earn more than you spent?</li>
            <li><strong>Savings Rate:</strong> What % of your income did you keep? (Aim for 20%!)</li>
          </ul>
          <Placeholder label="Reports Hero Cards (Cash Flow/Savings)" />

          <h3>Lifestyle Audit (Needs vs. Wants)</h3>
          <p>If you feel broke but make good money, look here. If your "Needs" (Fixed Costs) are over 80%, your overhead is too high.</p>

          <h3>Freedom Forecast (Runway)</h3>
          <p>This metric calculates how many months you could survive without a job, based on your current savings and spending habits.</p>
        </Section>

        {/* SETTINGS */}
        <Section id="settings" title="Settings" icon={Settings}>
          <h3>Manage Users</h3>
          <p>OmegaBudget is multiplayer. Add a spouse or partner here so you can assign specific bills to them (e.g., "His Car Payment" vs "Her Student Loan").</p>
          
          <h3>Data Controls</h3>
          <p><strong>Clear Current Month:</strong> Wipes the board clean for a fresh start this month.</p>
          <p><strong>Factory Reset:</strong> Deletes everything and returns the app to day one.</p>
        </Section>

        <div style={{ height: 100 }}></div>
      </div>
    </div>
  );
}

// Sub-components for styling
const NavButton = ({ id, active, onClick, icon: Icon, label }) => (
  <button 
    onClick={() => onClick(id)} 
    className={`nav-item ${active === id ? 'active' : ''}`} 
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      padding: '12px 16px',
      background: active === id ? 'var(--card-bg)' : 'transparent',
      border: active === id ? '1px solid var(--accent)' : '1px solid transparent',
      color: active === id ? 'var(--accent)' : 'var(--text-dim)',
      textAlign: 'left',
      cursor: 'pointer',
      borderRadius: 10,
      fontSize: '0.95rem',
      fontWeight: active === id ? 600 : 400,
      transition: 'all 0.2s'
    }}
  >
    <Icon size={18} /> {label}
  </button>
);

const tipStyle = {
  background: 'rgba(16, 185, 129, 0.1)', 
  border: '1px solid rgba(16, 185, 129, 0.3)', 
  color: '#fff', 
  padding: 15, 
  borderRadius: 8, 
  fontSize: '0.9rem', 
  marginTop: 20,
  lineHeight: 1.5
};