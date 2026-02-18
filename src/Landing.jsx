import React from 'react';
import { Wallet, ArrowRight, ShieldCheck } from 'lucide-react';
import DemoBoard from './DemoBoard';

export default function Landing({ onSignIn, onSignUp }) {
  return (
    <div className="landing-container" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid var(--border)', background: 'var(--bg)', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent)' }}>
          <img src="/logo.png" alt="OmegaBudget Logo" style={{ width: '32px', height: '32px' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>OmegaBudget</span>
        </div>
        <div style={{ display: 'flex', gap: 15 }}>
          <button onClick={onSignIn} style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontWeight: 600, cursor: 'pointer' }}>Log In</button>
          <button onClick={onSignUp} className="btn-primary" style={{ padding: '8px 16px' }}>Get Started</button>
        </div>
      </nav>

      {/* Hero Section with Background Image */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        // Dark gradient overlay for text readability
        backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.7)), url("/hero-home.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '100px 20px',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        
        <header style={{ textAlign: 'center', maxWidth: '900px', width: '100%', position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: '4rem', letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 20, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            Manage your money from <span style={{ color: '#60a5fa' }}>Alpha to Omega.</span>
          </h1>
          <p style={{ fontSize: '1.3rem', color: '#e2e8f0', marginBottom: 40, lineHeight: 1.6, textShadow: '0 2px 10px rgba(0,0,0,0.5)', maxWidth: '700px', margin: '0 auto 40px auto' }}>
            The first visual, paycheck-to-paycheck financial board designed for modern households. Split expenses, track shared goals, and close your books with confidence.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
            <button onClick={onSignUp} className="btn-primary" style={{ fontSize: '1.1rem', padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)' }}>
              Start Budgeting Free <ArrowRight size={18} />
            </button>
          </div>
          
          {/* Mockup area with Glassmorphism */}
          <div style={{ 
            marginTop: 60, 
            padding: 20, 
            background: 'rgba(30, 41, 59, 0.6)', 
            backdropFilter: 'blur(12px)',
            borderRadius: 20, 
            border: '1px solid rgba(255,255,255,0.1)', 
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' 
          }}>
             <DemoBoard />
          </div>
          
        </header>
      </div>

      {/* Features Section - UPDATED LAYOUT */}
      <section style={{ padding: '80px 20px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* 1. The New Feature Image Header */}
          <div style={{ marginBottom: '50px', textAlign: 'center' }}>
            <img 
              src="/hero2.png" 
              alt="Features: Kanban, Splitting, Closing Ritual" 
              style={{ maxWidth: '100%', height: 'auto', borderRadius: '12px', boxShadow: '0 10px 30px -15px rgba(0,0,0,0.2)' }}
            />
          </div>

          {/* 2. The 3-Column Text Grid Underneath */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, textAlign: 'center' }}>
            
            {/* Column 1 */}
            <div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: 15, fontWeight: 700 }}>Kanban-Style Tracking</h3>
              <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, fontSize: '1.05rem' }}>Drag and drop your bills between paychecks. See exactly what is due, when it's due, and where the money is coming from.</p>
            </div>

            {/* Column 2 */}
            <div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: 15, fontWeight: 700 }}>Proportional Splitting</h3>
              <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, fontSize: '1.05rem' }}>Perfect for couples. Maintain separate accounts but easily manage the "Shared" house bills without complex spreadsheets.</p>
            </div>

            {/* Column 3 */}
            <div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: 15, fontWeight: 700 }}>The Closing Ritual</h3>
              <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, fontSize: '1.05rem' }}>At the end of the month, reconcile your expected cash with reality. Any leftover free cash rolls over to fuel your goals.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <ShieldCheck size={18} />
          <span>Secure, cloud-synced, and built for modern families.</span>
        </div>
        <p>© {new Date().getFullYear()} OmegaBudget. All rights reserved.</p>
      </footer>

    </div>
  );
}