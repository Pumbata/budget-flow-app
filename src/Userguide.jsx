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
    <section id={id} style={{ marginBottom: 60, scrollMarginTop: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
        <Icon size={28} color="var(--accent)" />
        <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{title}</h2>
      </div>
      {children}
    </section>
  );

  const Placeholder = ({ label }) => (
    <div style={{ 
      width: '100%', 
      height: 200, 
      background: 'rgba(0,0,0,0.2)', 
      border: '2px dashed var(--border)', 
      borderRadius: 12, 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      margin: '20px 0',
      color: 'var(--text-dim)'
    }}>
      <div style={{ fontSize: '3rem', opacity: 0.2 }}>📷</div>
      <p>Screenshot: {label}</p>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: 40, height: 'calc(100vh - 40px)', overflow: 'hidden' }}>
      
      {/* LEFT: Table of Contents */}
      <aside style={{ width: 250, flexShrink: 0, borderRight: '1px solid var(--border)', paddingRight: 20, overflowY: 'auto' }}>
        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 15 }}>Table of Contents</h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <button onClick={() => scrollTo('intro')} className={`nav-item ${activeSection === 'intro' ? 'active' : ''}`} style={navBtnStyle}>
            <BookOpen size={16} /> Introduction
          </button>
          <button onClick={() => scrollTo('dashboard')} className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`} style={navBtnStyle}>
            <LayoutDashboard size={16} /> The Dashboard
          </button>
          <button onClick={() => scrollTo('blueprint')} className={`nav-item ${activeSection === 'blueprint' ? 'active' : ''}`} style={navBtnStyle}>
            <SplitSquareHorizontal size={16} /> The Blueprint
          </button>
          <button onClick={() => scrollTo('savings')} className={`nav-item ${activeSection === 'savings' ? 'active' : ''}`} style={navBtnStyle}>
            <Target size={16} /> Savings & Goals
          </button>
          <button onClick={() => scrollTo('tools')} className={`nav-item ${activeSection === 'tools' ? 'active' : ''}`} style={navBtnStyle}>
            <Calculator size={16} /> Tools & Sims
          </button>
          <button onClick={() => scrollTo('reports')} className={`nav-item ${activeSection === 'reports' ? 'active' : ''}`} style={navBtnStyle}>
            <PieChart size={16} /> Reports
          </button>
          <button onClick={() => scrollTo('settings')} className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`} style={navBtnStyle}>
            <Settings size={16} /> Settings
          </button>
        </nav>
      </aside>

      {/* RIGHT: Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 20, paddingBottom: 100 }}>
        
        {/* INTRO */}
        <Section id="intro" title="The Philosophy" icon={BookOpen}>
          <p className="lead">Welcome to OmegaBudget. If you've tried other apps and failed, it wasn't your fault. It was the system's fault.</p>
          <p>Most apps are "Forensic Accounting"—looking backward at what you spent. OmegaBudget is an <strong>Operational Command Center</strong>. We use the <strong>Kanban Method</strong> (invented by Toyota in the 1950s) to visualize your money as a "Flow."</p>
          
          <div className="card" style={{ background: 'var(--accent)', color: 'white', marginTop: 20 }}>
            <h4 style={{marginTop:0}}>The Golden Rule</h4>
            <p style={{marginBottom:0}}>Don't just track your money. <strong>Command it.</strong></p>
          </div>
        </Section>

        {/* DASHBOARD */}
        <Section id="dashboard" title="The Dashboard" icon={LayoutDashboard}>
          <p>Your "Command Center." This answers the big question: <em>"Do I have enough cash for my bills this pay period?"</em></p>
          
          <h3>1. Setting Your Income</h3>
          <p>Enter your expected paychecks at the top. Watch the "Free Cash" badge in the corner.</p>
          <ul>
            <li><strong style={{color:'var(--green)'}}>Green Badge:</strong> You are safe! Income {'>'} Expenses.</li>
            <li><strong style={{color:'var(--red)'}}>Red Badge:</strong> You are over-budget. Move some bills!</li>
          </ul>
          <Placeholder label="Top of Dashboard (Income Inputs)" />

          <h3>2. The Kanban Board</h3>
          <p>Drag and drop bills between Paycheck 1 and Paycheck 2. Your goal is to keep both columns positive.</p>
          <Placeholder label="Kanban Board Drag & Drop" />
          
          <div className="tip-box" style={tipStyle}>
            <strong>Pro Tip:</strong> Use the "Balance All" button in the top right to let our AI instantly sort your bills for you.
          </div>
        </Section>

        {/* BLUEPRINT */}
        <Section id="blueprint" title="The Blueprint" icon={SplitSquareHorizontal}>
          <p>This is the DNA of your budget. You only set this up once.</p>
          
          <h3>Recurring Bills</h3>
          <p>Add your Rent, Internet, and Netflix here. These will automatically copy to your Dashboard on the 1st of every month.</p>
          <Placeholder label="Recurring Bills List" />

          <h3>The Sync Button</h3>
          <p>If you change a bill amount here, you must go to the Dashboard and click <strong>Sync</strong> to update the current month.</p>
        </Section>

        {/* SAVINGS */}
        <Section id="savings" title="Savings & Goals" icon={Target}>
          <p>Stop being surprised by "Annual" expenses. Use Sinking Funds.</p>
          
          <h3>Creating a Goal</h3>
          <p>Want new tires in December? Enter the cost ($800) and the date. The app calculates exactly how much you need to save monthly.</p>
          <Placeholder label="Goal Creation Card" />

          <h3>Funding It</h3>
          <p>The app creates a "Bill" on your dashboard. When you pay it, you are paying your future self.</p>
        </Section>

        {/* TOOLS */}
        <Section id="tools" title="Tools & Simulations" icon={Calculator}>
          <p>This is your financial sandbox. Play "What If?" without risking real money.</p>
          
          <h3>Debt Destroyer 📉</h3>
          <p>See how fast you can be debt-free using the Avalanche or Snowball method.</p>
          <Placeholder label="Debt Destroyer Chart" />

          <h3>Millionaire Math 📈</h3>
          <p>Visualize compound interest. See how $500/mo turns into $1.2 Million over time.</p>

          <h3>Is It Worth It? ⏳</h3>
          <p>A brutal reality check. Enter your hourly wage and a price tag (e.g. $700 PS5) to see how many <strong>hours of your life</strong> it costs.</p>
        </Section>

        {/* REPORTS */}
        <Section id="reports" title="Financial Reports" icon={PieChart}>
          <p>Your "State of the Union" address.</p>
          
          <h3>The Lifestyle Audit</h3>
          <p>See your breakdown of <strong>Needs vs. Wants</strong>. If "Needs" is over 80%, your fixed costs are too high.</p>
          <Placeholder label="Needs vs Wants Chart" />

          <h3>Freedom Forecast</h3>
          <p>Your "Runway" metric. How many months could you survive without a job?</p>
        </Section>

        {/* SETTINGS */}
        <Section id="settings" title="Settings" icon={Settings}>
          <h3>Manage Users</h3>
          <p>Add your spouse or partner here so you can assign specific bills to them.</p>
          
          <h3>Data Management</h3>
          <p>Need a fresh start? Use "Clear Current Month" to wipe the board clean while keeping your settings.</p>
        </Section>

        <div style={{ height: 100 }}></div>
      </div>
    </div>
  );
}

const navBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '10px 15px',
  background: 'transparent',
  border: 'none',
  color: 'var(--text)',
  textAlign: 'left',
  cursor: 'pointer',
  borderRadius: 8,
  marginBottom: 5,
  fontSize: '0.95rem'
};