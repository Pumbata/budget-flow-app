import React from 'react';
import { Wallet, LayoutDashboard, SplitSquareHorizontal, CheckSquare, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Landing({ onSignIn, onSignUp }) {
  return (
    <div className="landing-container" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent)' }}>
          <Wallet size={32} />
          <span style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>OmegaBudget</span>
        </div>
        <div style={{ display: 'flex', gap: 15 }}>
          <button onClick={onSignIn} style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontWeight: 600, cursor: 'pointer' }}>Log In</button>
          <button onClick={onSignUp} className="btn-primary" style={{ padding: '8px 16px' }}>Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ textAlign: 'center', padding: '100px 20px', maxWidth: '800px', margin: '0 auto', flex: 1 }}>
        <h1 style={{ fontSize: '4rem', letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 20 }}>
          Manage your money from <span style={{ color: 'var(--accent)' }}>Alpha to Omega.</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', marginBottom: 40, lineHeight: 1.6 }}>
          The first visual, paycheck-to-paycheck financial board designed for modern households. Split expenses, track shared goals, and close your books with confidence.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
          <button onClick={onSignUp} className="btn-primary" style={{ fontSize: '1.1rem', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
            Start Budgeting Free <ArrowRight size={18} />
          </button>
        </div>
        
        {/* Mockup / Hero Graphic Area */}
        <div style={{ marginTop: 60, padding: 20, background: 'var(--border)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
           <div style={{ background: 'var(--bg)', height: '300px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
              [ Interactive App Dashboard Graphic Goes Here ]
           </div>
        </div>
      </header>

      {/* Features Grid */}
      <section style={{ padding: '80px 20px', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
          
          <div className="card" style={{ padding: 30 }}>
            <LayoutDashboard size={40} color="var(--accent)" style={{ marginBottom: 20 }} />
            <h3 style={{ fontSize: '1.3rem', marginBottom: 10 }}>Kanban-Style Tracking</h3>
            <p style={{ color: 'var(--text-dim)', lineHeight: 1.5 }}>Drag and drop your bills between paychecks. See exactly what is due, when it's due, and where the money is coming from.</p>
          </div>

          <div className="card" style={{ padding: 30 }}>
            <SplitSquareHorizontal size={40} color="var(--green)" style={{ marginBottom: 20 }} />
            <h3 style={{ fontSize: '1.3rem', marginBottom: 10 }}>Proportional Splitting</h3>
            <p style={{ color: 'var(--text-dim)', lineHeight: 1.5 }}>Perfect for couples. Maintain separate accounts but easily manage the "Shared" house bills without complex spreadsheets.</p>
          </div>

          <div className="card" style={{ padding: 30 }}>
            <CheckSquare size={40} color="var(--orange)" style={{ marginBottom: 20 }} />
            <h3 style={{ fontSize: '1.3rem', marginBottom: 10 }}>The Closing Ritual</h3>
            <p style={{ color: 'var(--text-dim)', lineHeight: 1.5 }}>At the end of the month, reconcile your expected cash with reality. Any leftover free cash rolls over to fuel your goals.</p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <ShieldCheck size={18} />
          <span>Secure, cloud-synced, and built for modern families.</span>
        </div>
        <p>© {new Date().getFullYear()} OmegaBudget. All rights reserved.</p>
      </footer>

    </div>
  );
}