import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Wallet, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';

export default function Auth({ initialMode = 'signin', onBack }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState(initialMode); 
  const [message, setMessage] = useState('');

  // Update mode if the prop changes
  useEffect(() => { setMode(initialMode); }, [initialMode]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    let error;
    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      error = signUpError;
      if (!error) setMessage('Check your email for the confirmation link!');
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      error = signInError;
    }

    if (error) setMessage(error.message);
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: 20 }}>
      
      <button onClick={onBack} style={{ position: 'absolute', top: 30, left: 30, background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
        <ArrowLeft size={20} /> Back to Home
      </button>

      <div className="card" style={{ padding: 40, width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20, color: 'var(--accent)' }}>
        <img src="/logo.png" alt="OmegaBudget Logo" style={{ width: '40px', height: '40px' }} />
          <h1 style={{ fontSize: '1.8rem', margin: 0, letterSpacing: '-1px' }}>OmegaBudget</h1>
        </div>
        
        <p style={{ marginBottom: 30, color: 'var(--text-dim)' }}>
          {mode === 'signin' ? 'Welcome back! Sign in to access your board.' : 'Create an account to build your stack.'}
        </p>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div className="input-group" style={{ padding: 10 }}>
            <Mail size={18} color="var(--text-dim)" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', border: 'none', background: 'transparent', marginLeft: 10, color: 'var(--text)', fontSize: '1rem', outline: 'none' }} />
          </div>
          <div className="input-group" style={{ padding: 10 }}>
            <Lock size={18} color="var(--text-dim)" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', border: 'none', background: 'transparent', marginLeft: 10, color: 'var(--text)', fontSize: '1rem', outline: 'none' }} />
          </div>

          <button className="btn-primary" disabled={loading} style={{ marginTop: 10, justifyContent: 'center', padding: 12 }}>
            {loading ? <Loader2 className="spin" /> : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        {message && <p style={{ color: 'var(--red)', marginTop: 15, fontSize: '0.9rem' }}>{message}</p>}

        <div style={{ marginTop: 20, fontSize: '0.9rem' }}>
          {mode === 'signin' ? (
            <span>Don't have an account? <button onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>Sign Up</button></span>
          ) : (
            <span>Already have an account? <button onClick={() => setMode('signin')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>Sign In</button></span>
          )}
        </div>
      </div>
    </div>
  );
}