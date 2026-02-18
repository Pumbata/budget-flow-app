import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function Landing({ onSignIn, onSignUp }) {
  return (
    <div className="landing-container" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'transparent', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="OmegaBudget Logo" style={{ width: '32px', height: '32px' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: '#fff' }}>OmegaBudget</span>
        </div>
        <div style={{ display: 'flex', gap: 15 }}>
          <button onClick={onSignIn} style={{ background: 'transparent', border: 'none', color: '#e2e8f0', fontWeight: 600, cursor: 'pointer' }}>Log In</button>
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
        padding: '120px 20px 80px 20px', // Added top padding for nav
        minHeight: '100vh', // Ensure it covers screen
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        
        <header style={{ textAlign: 'center', maxWidth: '1000px', width: '100%', position: 'relative', zIndex: 2 }}>
          
          {/* Main Headline */}
          <h1 style={{ fontSize: '4rem', letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 20, color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            Manage your money from <span style={{ color: '#60a5fa' }}>Alpha to Omega.</span>
          </h1>
          
          <p style={{ fontSize: '1.3rem', color: '#cbd5e1', marginBottom: 40, lineHeight: 1.6, textShadow: '0 2px 10px rgba(0,0,0,0.5)', maxWidth: '700px', margin: '0 auto 40px auto' }}>
            The first visual, paycheck-to-paycheck financial board designed for modern households. Split expenses, track shared goals, and close your books with confidence.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 60 }}>
            <button onClick={onSignUp} className="btn-primary" style={{ fontSize: '1.1rem', padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)' }}>
              Start Budgeting Free <ArrowRight size={18} />
            </button>
          </div>
          
          {/* Feature Showcase Container (Glassmorphism) */}
          <div style={{ 
            padding: 40, 
            background: 'rgba(30, 41, 59, 0.6)', 
            backdropFilter: 'blur(12px)',
            borderRadius: 24, 
            border: '1px solid rgba(255,255,255,0.1)', 
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' 
          }}>
             
             {/* The Feature Image */}
             <div style={{ marginBottom: 40 }}>
                <img 
                  src="/hero2.png" 
                  alt="OmegaBudget Features" 
                  style={{ width: '100%', height: 'auto', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                />
             </div>

             {/* The 3-Column Explainer Grid */}
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 30, textAlign: 'center', color: '#fff' }}>
                
                {/* Col 1 */}
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: 10, fontWeight: 700, color: '#fff' }}>Kanban-Style Tracking</h3>
                  <p style={{ color: '#cbd5e1', lineHeight: 1.5, fontSize: '0.95rem' }}>Drag and drop your bills between paychecks. See exactly what is due and when.</p>
                </div>

                {/* Col 2 */}
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: 10, fontWeight: 700, color: '#fff' }}>Proportional Splitting</h3>
                  <p style={{ color: '#cbd5e1', lineHeight: 1.5, fontSize: '0.95rem' }}>Perfect for couples. Manage "Shared" house bills without complex spreadsheets.</p>
                </div>

                {/* Col 3 */}
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: 10, fontWeight: 700, color: '#fff' }}>The Closing Ritual</h3>
                  <p style={{ color: '#cbd5e1', lineHeight: 1.5, fontSize: '0.95rem' }}>Reconcile expected cash with reality. Roll over free cash to fuel your goals.</p>
                </div>

             </div>

          </div>
          
        </header>

        {/* Footer inside the hero area since it's full height */}
        <footer style={{ marginTop: 60, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <ShieldCheck size={16} />
            <span>Secure, cloud-synced, and built for modern families.</span>
          </div>
          <p>© {new Date().getFullYear()} OmegaBudget. All rights reserved.</p>
        </footer>

      </div>
    </div>
  );
}