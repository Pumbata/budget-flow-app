import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Joyride, { STATUS } from 'react-joyride';
import { LayoutDashboard, Receipt, Wallet, RefreshCw, RefreshCcw, Users, User, Settings as SettingsIcon, ChevronLeft, ChevronRight, CheckCircle2, Circle, Trash2, Plus, X, Target, PieChart as PieChartIcon, Kanban, Filter, Maximize2, CheckSquare, CalendarClock, Calendar as CalendarIcon, ChevronDown, Layers, Tag, Home, Car, Zap, CreditCard, Smile, ShoppingBag, Activity, HelpCircle, Landmark, Lock, Unlock, LogOut, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ComposedChart, Area, Line } from 'recharts';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import RecurringBills from './RecurringBills';
import SavingsManager from './SavingsManager';
import Settings from './Settings';
import Forecast from './Forecast'; 
import { autoBalanceBudget } from './balanceEngine';
import './index.css';
import Landing from './Landing';
import Onboarding from './Onboarding';
import Reports from './Reports';

// --- CONSTANTS & HELPERS ---
export const DEFAULT_CATEGORIES = { housing: { label: 'Housing', color: '#ef4444' }, transport: { label: 'Transport', color: '#f97316' }, utilities: { label: 'Utilities', color: '#eab308' }, debt: { label: 'Debt', color: '#8b5cf6' }, lifestyle: { label: 'Lifestyle', color: '#ec4899' }, shopping: { label: 'Shopping', color: '#06b6d4' }, health: { label: 'Health', color: '#10b981' }, savings: { label: 'Savings', color: '#22c55e' }, other: { label: 'Other', color: '#64748b' } };
export function getCategoryIcon(catId) { const size = 14; switch(catId) { case 'housing': return <Home size={size}/>; case 'transport': return <Car size={size}/>; case 'utilities': return <Zap size={size}/>; case 'debt': return <CreditCard size={size}/>; case 'lifestyle': return <Smile size={size}/>; case 'shopping': return <ShoppingBag size={size}/>; case 'health': return <Activity size={size}/>; case 'savings': return <Landmark size={size}/>; case 'other': return <HelpCircle size={size}/>; default: return <Tag size={size}/>; } }
export function getOrdinal(n) { const j = n % 10, k = n % 100; if (j == 1 && k != 11) return n + "st"; if (j == 2 && k != 12) return n + "nd"; if (j == 3 && k != 13) return n + "rd"; return n + "th"; }

export default function App() {
  // ==========================================
  // 1. ALL HOOKS MUST BE DECLARED HERE (TOP)
  // ==========================================

  // --- Session & Loading ---
  const [session, setSession] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [publicRoute, setPublicRoute] = useState('landing');  

  // --- UI State ---
  const [view, setView] = useState('dashboard');
  const [dashboardMode, setDashboardMode] = useState('board');
  const [expandedChart, setExpandedChart] = useState(null); 
  const [breakdownFilter, setBreakdownFilter] = useState('All');
  const [chartGroupBy, setChartGroupBy] = useState('owner'); 
  const [cashFlowFilter, setCashFlowFilter] = useState('All');
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // --- Guided Tour State (UPDATED) ---
  const [runTour, setRunTour] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(true); 
  const [tourStepIndex, setTourStepIndex] = useState(0); // WE CONTROL THIS NOW
  
  // --- Data State (NEW TOPOLOGY) ---
  const [theme, setTheme] = useState('dark');
  const [owners, setOwners] = useState(['User 1']); 
  const [hasJointPool, setHasJointPool] = useState(false);
  const [jointPoolName, setJointPoolName] = useState('House Bills'); 
  const [isEditingJointPoolName, setIsEditingJointPoolName] = useState(false); 
  const [tempJointPoolName, setTempJointPoolName] = useState(''); 
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [appStartDate, setAppStartDate] = useState('');
  const [startingBalances, setStartingBalances] = useState({});
  const [recurringBills, setRecurringBills] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [monthlyData, setMonthlyData] = useState({});
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // --- Modal & Form State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('onetime'); 
  const [modalData, setModalData] = useState({ owner: '', columnId: '', name: '', amount: '', goalId: null, category: 'other' });
  const [isClosingOpen, setIsClosingOpen] = useState(false);
  const [closingBalances, setClosingBalances] = useState({});
  
  const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const monthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // ==========================================
  // 2. EFFECTS (DATA LOADING & SAVING)
  // ==========================================

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadUserData(session.user.id);
      else setIsLoadingData(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setIsRecoveringPassword(true);
      setSession(session);
      if (session && !isRecoveringPassword) loadUserData(session.user.id);
      else setIsLoadingData(false);
    });

    return () => subscription.unsubscribe();
  }, [isRecoveringPassword]);

  const loadUserData = async (userId) => {
    setIsLoadingData(true);
    try {
      const { data, error } = await supabase.from('user_state').select('*').eq('id', userId).maybeSingle();
      if (error) console.error('Error loading data:', error);

      if (data) {
        if (data.owners) setOwners(data.owners.filter(o => o !== 'Shared')); 
        if (data.has_joint_pool !== undefined) setHasJointPool(data.has_joint_pool);
        if (data.joint_pool_name) setJointPoolName(data.joint_pool_name);
        else if (data.shared_name && data.has_joint_pool === undefined) { setJointPoolName(data.shared_name); setHasJointPool(true); }
        if (data.categories) setCategories(data.categories);
        if (data.recurring_bills) setRecurringBills(data.recurring_bills);
        if (data.savings_goals) setSavingsGoals(data.savings_goals);
        if (data.monthly_data) setMonthlyData(data.monthly_data);
        if (data.starting_balances) setStartingBalances(data.starting_balances);
        if (data.app_start_date) setAppStartDate(data.app_start_date);
        if (data.theme) setTheme(data.theme);
        
        if (data.has_seen_tour) {
          setHasSeenTour(true);
        } else {
          setHasSeenTour(false);
          setRunTour(true);
        }
      } else {
        setAppStartDate(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`);
        setHasSeenTour(false);
        setShowOnboarding(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (!session || isLoadingData) return;
    const saveData = async () => {
      const updates = {
        id: session.user.id,
        owners,
        has_joint_pool: hasJointPool,
        joint_pool_name: jointPoolName,
        categories,
        recurring_bills: recurringBills,
        savings_goals: savingsGoals,
        monthly_data: monthlyData,
        starting_balances: startingBalances,
        app_start_date: appStartDate,
        theme,
        has_seen_tour: hasSeenTour, 
        updated_at: new Date()
      };
      const { error } = await supabase.from('user_state').upsert(updates);
      if (error) console.error('Error saving data:', error);
    };
    saveData();
  }, [owners, hasJointPool, jointPoolName, categories, recurringBills, savingsGoals, monthlyData, startingBalances, appStartDate, theme, hasSeenTour, session]);

  useEffect(() => { document.body.setAttribute('data-theme', theme); }, [theme]);

  useEffect(() => {
    if (!monthlyData[monthKey]) {
      const clonedBills = recurringBills.map(b => ({ 
        ...b, snapshotId: `${monthKey}-${b.id}-${Math.random().toString(36).substring(7)}`, isPaid: false, originalOwner: b.owner, category: b.category || 'other' 
      }));
      const activeGoals = savingsGoals.filter(g => g.totalPaid < g.target);
      const clonedGoals = activeGoals.map(g => ({
        id: `goal-${g.id}`, snapshotId: `${monthKey}-goal-${g.id}-${Math.random().toString(36).substring(7)}`, name: `🎯 ${g.name}`, amount: g.monthlyMin, dueDate: 28, columnId: 'pay2', owner: g.owner, isPaid: false, isSavings: true, goalId: g.id, originalOwner: g.owner, category: 'savings' 
      }));
      setMonthlyData(prev => ({ ...prev, [monthKey]: { bills: [...clonedBills, ...clonedGoals], incomes: {}, todos: [] } }));
    }
  }, [monthKey, recurringBills, savingsGoals, monthlyData]);

  // ==========================================
  // 3. HELPER LOGIC
  // ==========================================
  const currentMonthData = monthlyData[monthKey] || { bills: [], incomes: {}, todos: [] };
  const currentBills = currentMonthData.bills || [];
  const currentIncomes = currentMonthData.incomes || {};
  const currentTodos = currentMonthData.todos || [];
  const isMonthClosed = !!currentMonthData.closingBalances;

  const updateCurrentMonth = (newBills, newIncomes, newTodos) => {
    setMonthlyData(prev => {
      const currentObj = prev[monthKey] || { bills: [], incomes: {}, todos: [] };
      return { ...prev, [monthKey]: { ...currentObj, bills: newBills !== undefined ? newBills : currentObj.bills, incomes: newIncomes !== undefined ? newIncomes : currentObj.incomes, todos: newTodos !== undefined ? newTodos : (currentObj.todos || []) }};
    });
  };

  const peopleCount = Math.max(1, owners.length);
  const getRollover = (targetMonthKey, person) => {
    if (targetMonthKey <= appStartDate) return parseFloat(startingBalances[person] || 0);
    let totalRollover = 0; let currentKey = targetMonthKey;
    for(let i=0; i < 120; i++) { 
       const [y, m] = currentKey.split('-').map(Number); let prevM = m - 1; let prevY = y;
       if (prevM === 0) { prevM = 12; prevY -= 1; }
       const prevKey = `${prevY}-${String(prevM).padStart(2, '0')}`;
       if (prevKey < appStartDate) { totalRollover += parseFloat(startingBalances[person] || 0); break; }
       const mData = monthlyData[prevKey] || { bills: [], incomes: {} };
       if (mData.closingBalances && mData.closingBalances[person] !== undefined) { totalRollover += mData.closingBalances[person]; break; }
       const b = mData.bills || []; const inc = mData.incomes || {};
       
       const oldSharedP1 = hasJointPool ? b.filter(x => x.owner === jointPoolName && x.columnId === 'pay1').reduce((s, x) => s + x.amount, 0) : 0;
       const oldSharedP2 = hasJointPool ? b.filter(x => x.owner === jointPoolName && x.columnId === 'pay2').reduce((s, x) => s + x.amount, 0) : 0;
       const oldSplit1 = hasJointPool ? oldSharedP1 / peopleCount : 0; 
       const oldSplit2 = hasJointPool ? oldSharedP2 / peopleCount : 0;
       
       const oldInc1 = parseFloat(inc[`${person}_p1`] || 0); const oldInc2 = parseFloat(inc[`${person}_p2`] || 0); const oldIncExtra = parseFloat(inc[`${person}_extra`] || 0);
       const oldPersP1 = b.filter(x => x.owner === person && x.columnId === 'pay1').reduce((s, x) => s + x.amount, 0); const oldPersP2 = b.filter(x => x.owner === person && x.columnId === 'pay2').reduce((s, x) => s + x.amount, 0);
       const generatedThatMonth = (oldInc1 - (oldPersP1 + oldSplit1)) + (oldInc2 - (oldPersP2 + oldSplit2)) + oldIncExtra;
       totalRollover += generatedThatMonth; currentKey = prevKey; 
    }
    return totalRollover;
  };

  const sharedP1 = hasJointPool ? currentBills.filter(b => b.owner === jointPoolName && b.columnId === 'pay1').reduce((sum, b) => sum + b.amount, 0) : 0; 
  const sharedP2 = hasJointPool ? currentBills.filter(b => b.owner === jointPoolName && b.columnId === 'pay2').reduce((sum, b) => sum + b.amount, 0) : 0; 
  const splitP1 = hasJointPool ? sharedP1 / peopleCount : 0; 
  const splitP2 = hasJointPool ? sharedP2 / peopleCount : 0;

  const getPersonStats = (person) => { 
    const inc1 = parseFloat(currentIncomes[`${person}_p1`] || 0); const inc2 = parseFloat(currentIncomes[`${person}_p2`] || 0); const incExtra = parseFloat(currentIncomes[`${person}_extra`] || 0); 
    const pBills = currentBills.filter(b => b.owner === person); 
    const myPersP1 = pBills.filter(b => b.columnId === 'pay1').reduce((sum, b) => sum + b.amount, 0); const myPersP2 = pBills.filter(b => b.columnId === 'pay2').reduce((sum, b) => sum + b.amount, 0); 
    const due1 = myPersP1 + splitP1; const due2 = myPersP2 + splitP2; 
    const free1 = inc1 - due1; const free2 = inc2 - due2; const rollover = getRollover(monthKey, person); 
    const totalFree = free1 + free2 + incExtra + rollover; 
    return { free1, free2, incExtra, rollover, totalFree, due1, due2 }; 
  };

  const generatePieData = () => { /* chart logic omitted for brevity, keeping existing */
    const ownerColors = ['#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e', '#f59e0b']; let rawData = []; let scopeBills = currentBills; 
    if (breakdownFilter !== 'All') scopeBills = currentBills.filter(b => b.owner === breakdownFilter); 
    if (chartGroupBy === 'owner') { 
      if (breakdownFilter === 'All') { 
        let totalFreeCash = 0; const personalBillsData = []; 
        owners.forEach((owner, idx) => { 
          const stats = getPersonStats(owner); totalFreeCash += stats.totalFree; 
          const persOnlyTotal = currentBills.filter(b => b.owner === owner).reduce((sum, b) => sum + b.amount, 0); 
          if (persOnlyTotal > 0) personalBillsData.push({ name: `${owner}'s Bills`, value: persOnlyTotal, color: ownerColors[idx % ownerColors.length] }); 
        }); 
        rawData = hasJointPool ? [{ name: `${jointPoolName} Bills`, value: sharedP1 + sharedP2, color: '#f59e0b' }, ...personalBillsData] : [...personalBillsData]; 
        if (totalFreeCash > 0) rawData.push({ name: 'Total Free Cash', value: totalFreeCash, color: '#22c55e' }); 
      } else { 
        const stats = getPersonStats(breakdownFilter); 
        rawData = scopeBills.map((b, idx) => ({ name: b.name, value: b.amount, color: ownerColors[idx % ownerColors.length] })); 
        const mySharedShare = hasJointPool ? (sharedP1 + sharedP2) / peopleCount : 0; 
        if (mySharedShare > 0) rawData.push({ name: `${jointPoolName} Portion`, value: mySharedShare, color: '#f59e0b' }); 
        if (stats.totalFree > 0) rawData.push({ name: 'My Free Cash', value: stats.totalFree, color: '#22c55e' }); 
      } 
    } else { 
      const categoryTotals = {}; Object.keys(categories).forEach(k => categoryTotals[k] = 0); 
      scopeBills.forEach(b => { const cat = b.category && categories[b.category] ? b.category : 'other'; categoryTotals[cat] = (categoryTotals[cat] || 0) + b.amount; }); 
      rawData = Object.keys(categoryTotals).filter(k => categoryTotals[k] > 0).map(k => ({ name: categories[k].label, value: categoryTotals[k], color: categories[k].color })); 
      let totalFree = 0;
      if (breakdownFilter === 'All') { owners.forEach(o => totalFree += getPersonStats(o).totalFree); } 
      else { totalFree = getPersonStats(breakdownFilter).totalFree; }
      if (totalFree > 0) rawData.push({ name: 'Free Cash', value: totalFree, color: '#22c55e' }); 
    } 
    const filteredData = rawData.filter(d => d.value > 0); const totalValue = filteredData.reduce((sum, item) => sum + item.value, 0); 
    return filteredData.map(item => ({ ...item, share: totalValue > 0 ? (item.value / totalValue) : 0 })); 
  };
  
  const generateIncomeVsExpenseData = () => { /* chart logic omitted for brevity, keeping existing */
    if (cashFlowFilter === 'All') { 
      let totalIncome = 0; let totalExpenses = currentBills.reduce((sum, b) => sum + b.amount, 0); 
      owners.forEach(owner => { 
        const inc1 = parseFloat(currentIncomes[`${owner}_p1`] || 0); const inc2 = parseFloat(currentIncomes[`${owner}_p2`] || 0); const extra = parseFloat(currentIncomes[`${owner}_extra`] || 0); const rollover = getRollover(monthKey, owner); 
        totalIncome += (inc1 + inc2 + extra + (rollover > 0 ? rollover : 0)); 
      }); 
      return [ { name: 'Total In', amount: totalIncome, fill: '#22c55e' }, { name: 'Total Out', amount: totalExpenses, fill: '#ef4444' }, { name: 'Net', amount: totalIncome - totalExpenses, fill: '#3b82f6' } ]; 
    } else { 
      const owner = cashFlowFilter; const stats = getPersonStats(owner); 
      const inc1 = parseFloat(currentIncomes[`${owner}_p1`] || 0); const inc2 = parseFloat(currentIncomes[`${owner}_p2`] || 0); const extra = parseFloat(currentIncomes[`${owner}_extra`] || 0); const rollover = getRollover(monthKey, owner); 
      const myIncome = inc1 + inc2 + extra + (rollover > 0 ? rollover : 0); const myFixedCosts = stats.due1 + stats.due2; 
      return [ { name: 'My Income', amount: myIncome, fill: '#22c55e' }, { name: 'My Costs', amount: myFixedCosts, fill: '#ef4444' }, { name: 'My Net', amount: myIncome - myFixedCosts, fill: '#3b82f6' } ]; 
    } 
  };

  const generateBurdenData = () => owners.map(owner => { const stats = getPersonStats(owner); return { name: owner, Fixed: stats.due1 + stats.due2, Free: stats.totalFree }; });
  const generateTrendData = () => { const keys = Object.keys(monthlyData).sort(); const recentKeys = keys.slice(-6); return recentKeys.map(key => { const mData = monthlyData[key]; const b = mData.bills || []; const inc = mData.incomes || {}; let mIncome = 0; let mExpenses = b.reduce((sum, item) => sum + item.amount, 0); owners.forEach(owner => { mIncome += (parseFloat(inc[`${owner}_p1`] || 0) + parseFloat(inc[`${owner}_p2`] || 0) + parseFloat(inc[`${owner}_extra`] || 0)); }); const [y, m] = key.split('-'); return { name: new Date(y, m - 1).toLocaleString('default', { month: 'short' }), Income: mIncome, Expenses: mExpenses }; }); };
  const CustomTooltip = ({ active, payload }) => { if (active && payload && payload.length) { const item = payload[0]; const originalData = item.payload; return ( <div className="chart-tooltip"> <p className="label">{item.name || item.dataKey}</p> <p className="value">${item.value.toFixed(0)}</p> {originalData.share !== undefined && ( <p style={{fontSize: '0.85rem', color: 'var(--accent)', marginTop: 4, fontWeight: 600}}> {(originalData.share * 100).toFixed(1)}% </p> )} </div> ); } return null; };
  const renderChartContent = (type) => { if (type === 'breakdown') { return ( <ResponsiveContainer width="100%" height="100%"> <PieChart> <Pie data={generatePieData()} cx="50%" cy="50%" innerRadius="45%" outerRadius="70%" paddingAngle={5} dataKey="value"> {generatePieData().map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)} </Pie> <Tooltip content={<CustomTooltip />} isAnimationActive={false} /> <Legend verticalAlign="bottom" height={36}/> </PieChart> </ResponsiveContainer> ); } if (type === 'cashflow') { return ( <ResponsiveContainer width="100%" height="100%"> <BarChart data={generateIncomeVsExpenseData()} margin={{top: 20, right: 30, left: 0, bottom: 5}}> <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)"/> <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false}/> <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`}/> <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--bg)'}} isAnimationActive={false}/> <Bar dataKey="amount" radius={[4, 4, 0, 0]}> {generateIncomeVsExpenseData().map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)} </Bar> </BarChart> </ResponsiveContainer> ); } if (type === 'burden') { return ( <ResponsiveContainer width="100%" height="100%"> <BarChart data={generateBurdenData()} margin={{top: 20, right: 30, left: 0, bottom: 5}}> <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)"/> <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false}/> <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`}/> <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--bg)'}} isAnimationActive={false}/> <Legend verticalAlign="top" height={36}/> <Bar dataKey="Fixed" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} name="Fixed Bills"/> <Bar dataKey="Free" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} name="Free Cash"/> </BarChart> </ResponsiveContainer> ); } if (type === 'trend') { return ( <ResponsiveContainer width="100%" height="100%"> <ComposedChart data={generateTrendData()} margin={{top: 20, right: 30, left: 0, bottom: 5}}> <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)"/> <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false}/> <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`}/> <Tooltip content={<CustomTooltip />} isAnimationActive={false} /> <Legend verticalAlign="top" height={36}/> <Area type="monotone" dataKey="Income" fill="rgba(34, 197, 94, 0.1)" stroke="#22c55e" strokeWidth={2} name="Total Income"/> <Line type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2} dot={{r: 4}} name="Total Expenses"/> </ComposedChart> </ResponsiveContainer> ); } };

  // --- Actions ---
  const handleSignOut = async () => { await supabase.auth.signOut(); setSession(null); }; 
  const openClosingModal = () => { const initial = {}; owners.forEach(o => { initial[o] = getPersonStats(o).totalFree; }); setClosingBalances(initial); setIsClosingOpen(true); };
  const handleCloseBooks = (e) => { e.preventDefault(); setMonthlyData(prev => ({ ...prev, [monthKey]: { ...prev[monthKey], closingBalances: closingBalances } })); setIsClosingOpen(false); };
  const handleReopenBooks = () => { if (window.confirm("Re-opening will revert balances to their calculated values. Are you sure?")) { setMonthlyData(prev => { const updatedMonth = { ...prev[monthKey] }; delete updatedMonth.closingBalances; return { ...prev, [monthKey]: updatedMonth }; }); } };
  const handleSyncBlueprint = () => { const oneTimeBills = currentBills.filter(cb => cb.id.startsWith('modal-') || cb.id.startsWith('onetime-')); const syncedRecurring = currentBills.filter(cb => !cb.isSavings && !cb.id.startsWith('modal-') && !cb.id.startsWith('onetime-')).map(cb => { const master = recurringBills.find(rb => rb.id === cb.id); if (master) return { ...cb, name: master.name, amount: master.amount, dueDate: master.dueDate, owner: master.owner, originalOwner: master.owner, category: master.category }; return null; }).filter(Boolean); const syncedGoals = currentBills.filter(cb => cb.isSavings).map(cb => { const master = savingsGoals.find(sg => sg.id === cb.goalId && sg.totalPaid < sg.target); if (master) return { ...cb, name: `🎯 ${master.name}`, amount: master.monthlyMin, owner: master.owner, originalOwner: master.owner, category: 'savings' }; return null; }).filter(Boolean); const missingRecurring = recurringBills.filter(rb => !syncedRecurring.some(cb => cb.id === rb.id)).map(b => ({ ...b, snapshotId: `${monthKey}-${b.id}-${Math.random().toString(36).substring(7)}`, isPaid: false, columnId: 'pay1', originalOwner: b.owner, category: b.category })); const missingGoals = savingsGoals.filter(g => g.totalPaid < g.target && !syncedGoals.some(cb => cb.goalId === g.id)).map(g => ({ id: `goal-${g.id}`, snapshotId: `${monthKey}-goal-${g.id}-${Math.random().toString(36).substring(7)}`, name: `🎯 ${g.name}`, amount: g.monthlyMin, dueDate: 28, columnId: 'pay2', owner: g.owner, isPaid: false, isSavings: true, goalId: g.id, originalOwner: g.owner, category: 'savings' })); updateCurrentMonth([...oneTimeBills, ...syncedRecurring, ...syncedGoals, ...missingRecurring, ...missingGoals], undefined); };
  const handleModalSubmit = (e) => { e.preventDefault(); if (!modalData.name || !modalData.amount) return; const amount = parseFloat(modalData.amount); if (isNaN(amount)) return; const newBill = { id: `modal-${Date.now()}`, snapshotId: `modal-${Date.now()}`, name: modalType === 'onetime' ? `(One-Time) ${modalData.name}` : `🎯 ${modalData.name}`, amount: amount, dueDate: currentDate.getDate(), columnId: modalData.columnId, owner: modalData.owner, originalOwner: modalData.owner, category: modalData.category || 'other', isPaid: false, isSavings: modalType === 'extraSavings', goalId: modalData.goalId }; updateCurrentMonth([...currentBills, newBill], undefined); setIsModalOpen(false); };
  const handleIncomeChange = (owner, period, value) => updateCurrentMonth(undefined, { ...currentIncomes, [`${owner}_${period}`]: value });
  const onDragEnd = (result) => { if (!result.destination) return; const { draggableId, destination } = result; const destParts = destination.droppableId.split('-'); const newColumnId = destParts.pop(); const newOwner = destParts.join('-'); const newBills = currentBills.map(bill => { if (bill.snapshotId === draggableId) { return { ...bill, columnId: newColumnId, owner: newOwner, originalOwner: bill.originalOwner || bill.owner }; } return bill; }); updateCurrentMonth(newBills, undefined); };
  
  const handleSectionBalance = (targetOwner) => { const ownerBills = currentBills.filter(b => b.owner === targetOwner); const otherBills = currentBills.filter(b => b.owner !== targetOwner); let inc1 = 0, inc2 = 0; if (targetOwner !== jointPoolName) { inc1 = parseFloat(currentIncomes[`${targetOwner}_p1`] || 0); inc2 = parseFloat(currentIncomes[`${targetOwner}_p2`] || 0); } const { col1, col2 } = autoBalanceBudget(inc1, inc2, ownerBills); updateCurrentMonth([...otherBills, ...col1, ...col2], undefined); };
  const handleBalanceEverything = () => { 
    let allBalancedBills = []; 
    if (hasJointPool) {
      const sharedBills = currentBills.filter(b => b.owner === jointPoolName); 
      const sharedBalanced = autoBalanceBudget(0, 0, sharedBills); 
      allBalancedBills.push(...sharedBalanced.col1, ...sharedBalanced.col2); 
    }
    owners.forEach(owner => { 
      const ownerBills = currentBills.filter(b => b.owner === owner); 
      const inc1 = parseFloat(currentIncomes[`${owner}_p1`] || 0); const inc2 = parseFloat(currentIncomes[`${owner}_p2`] || 0); 
      const ownerBalanced = autoBalanceBudget(inc1, inc2, ownerBills); 
      allBalancedBills.push(...ownerBalanced.col1, ...ownerBalanced.col2); 
    }); 
    const knownEntities = hasJointPool ? [jointPoolName, ...owners] : owners;
    const unknownBills = currentBills.filter(b => !knownEntities.includes(b.owner)); 
    allBalancedBills.push(...unknownBills); 
    updateCurrentMonth(allBalancedBills, undefined); 
  };
  
  const handleAddTodo = (text, owner, columnId) => { if (!text.trim()) return; const newTodo = { id: `todo-${Date.now()}-${Math.random()}`, text: text, completed: false, owner: owner || (hasJointPool ? jointPoolName : owners[0]), columnId: columnId || 'global' }; updateCurrentMonth(undefined, undefined, [...currentTodos, newTodo]); };
  const handleToggleTodo = (id) => { const updatedTodos = currentTodos.map(t => t.id === id ? { ...t, completed: !t.completed } : t); updateCurrentMonth(undefined, undefined, updatedTodos); };
  const handleDeleteTodo = (id) => { const updatedTodos = currentTodos.filter(t => t.id !== id); updateCurrentMonth(undefined, undefined, updatedTodos); };
  const togglePaid = (snapshotId) => { const bill = currentBills.find(b => b.snapshotId === snapshotId); if (!bill) return; const isNowPaid = !bill.isPaid; const newBills = currentBills.map(b => b.snapshotId === snapshotId ? { ...b, isPaid: isNowPaid } : b); updateCurrentMonth(newBills, undefined); if (bill.isSavings) { setSavingsGoals(prev => prev.map(g => g.id === bill.goalId ? { ...g, totalPaid: g.totalPaid + (isNowPaid ? bill.amount : -bill.amount) } : g)); } };
  const deleteFromDashboard = (snapshotId) => { const bill = currentBills.find(b => b.snapshotId === snapshotId); if (!bill) return; if (bill.isSavings && bill.isPaid) { setSavingsGoals(prev => prev.map(g => g.id === bill.goalId ? { ...g, totalPaid: g.totalPaid - bill.amount } : g)); } const newBills = currentBills.filter(b => b.snapshotId !== snapshotId); updateCurrentMonth(newBills, undefined); };
  const addRecurring = (bill) => setRecurringBills(prev => [...prev, { ...bill, columnId: 'pay1' }]);
  const updateRecurring = (updated) => setRecurringBills(prev => prev.map(b => b.id === updated.id ? updated : b));
  const deleteRecurring = (id) => setRecurringBills(prev => prev.filter(b => b.id !== id));
  const addGoal = (goal) => setSavingsGoals(prev => [...prev, goal]);
  const updateGoal = (updatedGoal) => setSavingsGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  const deleteGoal = (id) => setSavingsGoals(prev => prev.filter(g => g.id !== id));
  const openOneTimeModal = (owner, columnId) => { setModalType('onetime'); setModalData({ owner, columnId, name: '', amount: '', goalId: null, category: 'other' }); setIsModalOpen(true); };
  const openExtraSavingsModal = (goal) => { setModalType('extraSavings'); setModalData({ owner: goal.owner, columnId: 'pay1', name: `Extra: ${goal.name}`, amount: '', goalId: goal.id, category: 'savings' }); setIsModalOpen(true); };
  const changeMonth = (offset) => { const newDate = new Date(currentDate); newDate.setMonth(newDate.getMonth() + offset); setCurrentDate(newDate); };
  
  const handleOnboardingComplete = ({ finalOwners, hasJointPool, jointPoolName, finalBills }) => {
    setOwners(finalOwners);
    setHasJointPool(hasJointPool);
    if (hasJointPool) setJointPoolName(jointPoolName);
    setRecurringBills(finalBills);
    setShowOnboarding(false);
    
    // Trigger the tour
    if (!hasSeenTour) {
      setTourStepIndex(0);
      setRunTour(true);
    }
  };
  
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { alert(error.message); } else { alert("Password updated successfully!"); setIsRecoveringPassword(false); loadUserData(session.user.id); }
  };

  // --- JOYRIDE TOUR SETUP (MULTI-PAGE) ---
  const tourSteps = [
    { target: '.tour-income', content: "Welcome to your command center! Start by entering your expected paychecks here. As you add income, your 'Total Free' cash will calculate automatically.", disableBeacon: true, placement: 'bottom' },
    { target: '.tour-board', content: "This is your financial Kanban board. Drag and drop your bills between Paycheck 1 and Paycheck 2 to visually balance your cash flow.", placement: 'top' },
    { target: '.tour-balance-all', content: "Don't want to drag and drop manually? Click 'Balance All' and OmegaBudget's engine will instantly sort your bills to maximize your free cash.", placement: 'bottom' },
    { target: '.tour-close-books', content: "At the end of the month, click here to 'Close Books'. You'll confirm your actual bank balance, and any extra money rolls over into next month!", placement: 'bottom' },
    { target: '.tour-sync', content: "Got new regular expenses? The 'Sync' button pulls fresh master bills straight into your current month.", placement: 'bottom' },
    { target: '.tour-nav-bills', content: "Speaking of your master list, let's head over to the Recurring Bills tab to set that up.", placement: 'right' },
    // -- VIEW SWITCHES TO 'BILLS' HERE --
    { target: '.tour-add-bill', content: "Welcome to the Blueprint! Click 'Add Bill' to input all your standard monthly expenses.", placement: 'bottom' },
    { target: '.tour-blueprint-list', content: "Once added, they live here forever. Your dashboard will copy these every single month so you never have to type them twice. You're all set!", placement: 'top' }
  ];

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data;

    // Reacting to a step changing
    if (type === 'step:after') {
      if (action === 'next' || action === 'close') {
        // If they just finished Step 5 (Sidebar link to Recurring Bills)
        if (index === 5) {
          setView('bills'); // Change the React state to show the new page
          // Wait 100ms for the DOM to render the new page before firing the next tour step
          setTimeout(() => setTourStepIndex(index + 1), 100);
        } else {
          setTourStepIndex(index + 1); // Normal next step
        }
      } 
      else if (action === 'prev') {
        // If they click 'Back' while on the first step of the Bills page
        if (index === 6) {
          setView('dashboard');
          setTimeout(() => setTourStepIndex(index - 1), 100);
        } else {
          setTourStepIndex(index - 1);
        }
      }
    }

    // When the tour is totally done or skipped
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      setHasSeenTour(true);
      setTourStepIndex(0); // Reset for the next time they hit "Replay"
      setView('dashboard'); // Teleport them back home
    }
  };


  // ==========================================
  // 4. RENDER GATE (MUST BE LAST)
  // ==========================================
  if (!session) {
    if (publicRoute === 'landing') return <Landing onSignIn={() => setPublicRoute('signin')} onSignUp={() => setPublicRoute('signup')} />;
    return <Auth initialMode={publicRoute} onBack={() => setPublicRoute('landing')} />;
  }

  if (isLoadingData) return <div style={{height: '100vh', display:'flex', justifyContent:'center', alignItems:'center', background: 'var(--bg)', color:'var(--text)'}}><Loader2 className="spin" size={40}/></div>;
  
  if (isRecoveringPassword) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="card" style={{ padding: 40, width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <Lock size={40} color="var(--accent)" style={{ marginBottom: 20 }} />
          <h2 style={{ marginTop: 0 }}>Reset Your Password</h2>
          <p style={{ color: 'var(--text-dim)', marginBottom: 20 }}>Enter a new, strong password below.</p>
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <input type="password" className="input-field" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required autoFocus />
            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: 12 }}>Update Password</button>
          </form>
        </div>
      </div>
    );
  }
  
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const allEntities = hasJointPool ? [jointPoolName, ...owners] : owners;

  return (
    <div className="app-container">
      {/* JOYRIDE COMPONENT */}
      <Joyride
        steps={tourSteps}
        run={runTour}
        stepIndex={tourStepIndex} /* THIS IS NEW - IT LETS US CONTROL THE PAUSING/PLAYING */
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: 'var(--accent)',
            backgroundColor: 'var(--card)',
            textColor: 'var(--text)',
            arrowColor: 'var(--card)',
            zIndex: 10000,
          },
          tooltipContainer: {
            textAlign: 'left'
          }
        }}
      />

      <nav className="sidebar">
        <div className="logo"><img src="/logo.png" alt="OmegaBudget Logo" style={{ width: '28px', height: '28px' }} /><span>OmegaBudget</span></div>
        <button className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}><LayoutDashboard size={20} /> Dashboard</button>
        <button className={`nav-item ${view === 'forecast' ? 'active' : ''}`} onClick={() => setView('forecast')}><CalendarClock size={20} /> Forecast</button>
        {/* ADDED TARGET CLASS: tour-nav-bills */}
        <button className={`nav-item tour-nav-bills ${view === 'bills' ? 'active' : ''}`} onClick={() => setView('bills')}><Receipt size={20} /> Recurring Bills</button>
        <button className={`nav-item ${view === 'goals' ? 'active' : ''}`} onClick={() => setView('goals')}><Target size={20} /> Savings Goals</button>
        <button className={`nav-item ${view === 'reports' ? 'active' : ''}`} onClick={() => setView('reports')}><Activity size={20} /> Reports</button>
        <button className={`nav-item ${view === 'settings' ? 'active' : ''}`} onClick={() => setView('settings')}><SettingsIcon size={20} /> Settings</button>
        <button className="nav-item" onClick={handleSignOut} style={{marginTop: 'auto', color: 'var(--red)'}}><LogOut size={20} /> Sign Out</button>
      </nav>

      <main className="main-content">
        {view === 'dashboard' && (
          <div className="animate-fade-in">
            <div className="month-selector"><button onClick={() => changeMonth(-1)}><ChevronLeft size={24}/></button><h2>{monthLabel}</h2><button onClick={() => changeMonth(1)}><ChevronRight size={24}/></button></div>
            <header className="page-header" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '20px'}}>
              <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div><h1 style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 10}}>Budget Snapshot{isMonthClosed && <span className="closed-badge"><Lock size={12}/> Closed</span>}</h1><p className="subtitle">Managing {monthLabel}</p></div>
                <div style={{display: 'flex', gap: '10px'}}>
                  {!isMonthClosed ? (<button className="btn-close-books tour-close-books" onClick={openClosingModal}><CheckSquare size={16} /> Close Books</button>) : (<button className="btn-reopen-books" onClick={handleReopenBooks}><Unlock size={16} /> Re-open Books</button>)}
                  <div className="view-toggle"><button className={dashboardMode === 'board' ? 'active' : ''} onClick={() => setDashboardMode('board')}><Kanban size={16}/> Board</button><button className={dashboardMode === 'charts' ? 'active' : ''} onClick={() => setDashboardMode('charts')}><PieChartIcon size={16}/> Charts</button></div>
                  
                  {/* ADDED TARGET CLASS: tour-sync */}
                  <button className="btn-sync tour-sync" onClick={handleSyncBlueprint} title="Pull updates from Master Blueprints"><RefreshCcw size={16} /> Sync</button>
                  <button className="btn-balance-all tour-balance-all" onClick={handleBalanceEverything}><RefreshCw size={18} /> Balance All</button>
                </div>
              </div>
              
              <div className="split-summary-card" style={{width: '100%', boxSizing: 'border-box'}}>
                {hasJointPool ? (
                  <>
                    <div className="split-row"><span className="label"><Users size={16}/> {jointPoolName} Total</span><span className="value">${(sharedP1 + sharedP2).toFixed(2)}</span></div>
                    <div className="split-divider"></div>
                    <div className="split-row highlight"><span className="label">Each Pays</span><span className="value text-accent">${((sharedP1 + sharedP2) / peopleCount).toFixed(0)}</span></div>
                    <div className="split-row" style={{ marginTop: 4 }}><span className="label" style={{ fontSize: '0.75rem' }}>Per Check Split</span><span className="value" style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>C1: ${splitP1.toFixed(0)} <span style={{ opacity: 0.5, margin: '0 4px' }}>|</span> C2: ${splitP2.toFixed(0)}</span></div>
                  </>
                ) : (
                  <div className="split-row" style={{ justifyContent: 'space-between' }}>
                    <span className="label" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem' }}><Wallet size={20} color="var(--accent)"/> Total Household Output</span>
                    <span className="value text-accent" style={{ fontSize: '1.4rem' }}>${currentBills.reduce((s, b) => s + b.amount, 0).toFixed(0)}</span>
                  </div>
                )}
              </div>
            </header>
            
            {dashboardMode === 'charts' ? (
              <div className="charts-grid animate-fade-in"><div className="chart-card"><div className="chart-header-row"><h3>Spending Breakdown</h3><div style={{display:'flex', gap:8}}><div className="select-wrapper-small" style={{marginRight: 4}}><Layers size={14} className="icon"/><select value={chartGroupBy} onChange={(e) => setChartGroupBy(e.target.value)}><option value="owner">By Owner</option><option value="category">By Category</option></select></div><div className="select-wrapper-small"><Filter size={14} className="icon"/><select value={breakdownFilter} onChange={(e) => setBreakdownFilter(e.target.value)}><option value="All">All Owners</option>{owners.map(o => <option key={o} value={o}>{o}</option>)}</select></div><button className="btn-icon-only" onClick={() => setExpandedChart('breakdown')}><Maximize2 size={16}/></button></div></div><div style={{ width: '100%', height: 300 }}>{renderChartContent('breakdown')}</div></div><div className="chart-card"><div className="chart-header-row"><h3>Money In vs Money Out</h3><div style={{display:'flex', gap:8}}><div className="select-wrapper-small"><Filter size={14} className="icon"/><select value={cashFlowFilter} onChange={(e) => setCashFlowFilter(e.target.value)}><option value="All">Household</option>{owners.map(o => <option key={o} value={o}>{o}</option>)}</select></div><button className="btn-icon-only" onClick={() => setExpandedChart('cashflow')}><Maximize2 size={16}/></button></div></div><div style={{ width: '100%', height: 300 }}>{renderChartContent('cashflow')}</div></div><div className="chart-card"><div className="chart-header-row"><h3>Fixed Bills vs Free Cash</h3><button className="btn-icon-only" onClick={() => setExpandedChart('burden')}><Maximize2 size={16}/></button></div><div style={{ width: '100%', height: 300 }}>{renderChartContent('burden')}</div></div><div className="chart-card"><div className="chart-header-row"><h3>6-Month Financial Trend</h3><button className="btn-icon-only" onClick={() => setExpandedChart('trend')}><Maximize2 size={16}/></button></div><div style={{ width: '100%', height: 300 }}>{renderChartContent('trend')}</div></div></div>
            ) : (
              <>
                {savingsGoals.filter(g => g.totalPaid < g.target).length > 0 && (<div className="savings-widget"><h3 style={{marginTop: 0, fontSize: '1.1rem', color: 'var(--text-dim)'}}><Target size={16} style={{marginRight:6, verticalAlign: 'text-bottom'}}/> Active Savings & Repayments</h3><div className="savings-widget-grid">{savingsGoals.filter(g => g.totalPaid < g.target).map(goal => { const progress = Math.min(100, Math.round((goal.totalPaid / goal.target) * 100)); return ( <div key={goal.id} className="savings-mini-card"> <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}> <span style={{fontWeight: 600}}>{goal.name}</span> <button className="btn-add-quick" onClick={() => openExtraSavingsModal(goal)} title="Throw extra cash at this goal"><Plus size={14}/> Extra</button> </div> <div className="goal-progress-bar"><div className="goal-progress-fill" style={{width: `${progress}%`}}></div></div> <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)'}}><span>${goal.totalPaid} / ${goal.target}</span><span>{progress}%</span></div> </div> ) })}</div></div>)}
                
                <div className="tour-income">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15, marginTop: 10 }}>
                    <Wallet size={24} color="var(--green)" />
                    <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Income & Free Cash</h2>
                  </div>

                  <div className="income-grid">
                    {owners.map(owner => (
                      <div key={owner} className="person-income-card">
                        <div className="person-header"><div style={{display:'flex', alignItems:'center', gap:8}}><User size={18}/> {owner}</div><div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>{getPersonStats(owner).rollover !== 0 && (<span style={{fontSize: '0.75rem', color: getPersonStats(owner).rollover > 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600, marginBottom: 2}}>{getPersonStats(owner).rollover > 0 ? '+' : ''}${getPersonStats(owner).rollover.toFixed(0)} Rolled Over</span>)}<span className={`free-cash-badge ${getPersonStats(owner).totalFree < 0 ? 'neg' : 'pos'}`}>Total Free: ${getPersonStats(owner).totalFree.toFixed(0)}</span></div></div>
                        <div className="income-inputs">
                          <div className="inp-group">
                            <div style={{display: 'flex', justifyContent:'space-between', alignItems:'center'}}><label>Check 1</label><DayPicker value={currentIncomes[`${owner}_p1_date`]} onChange={(day) => handleIncomeChange(owner, 'p1_date', day)} /></div>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}><span style={{ position: 'absolute', left: 10, color: 'var(--text-dim)' }}>$</span><input type="number" style={{ paddingLeft: 25, width: '100%', boxSizing: 'border-box' }} value={currentIncomes[`${owner}_p1`] || ''} placeholder="0" onChange={(e) => handleIncomeChange(owner, 'p1', e.target.value)} /></div>
                            <div className="stats-stack"><div className="mini-due">Due: -${getPersonStats(owner).due1.toFixed(0)}</div><div className={`mini-free ${getPersonStats(owner).free1 < 0 ? 'neg' : 'pos'}`}>Free: ${getPersonStats(owner).free1.toFixed(0)}</div></div>
                          </div>

                          <div className="inp-group">
                            <div style={{display: 'flex', justifyContent:'space-between', alignItems:'center'}}><label>Check 2</label><DayPicker value={currentIncomes[`${owner}_p2_date`]} onChange={(day) => handleIncomeChange(owner, 'p2_date', day)} /></div>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}><span style={{ position: 'absolute', left: 10, color: 'var(--text-dim)' }}>$</span><input type="number" style={{ paddingLeft: 25, width: '100%', boxSizing: 'border-box' }} value={currentIncomes[`${owner}_p2`] || ''} placeholder="0" onChange={(e) => handleIncomeChange(owner, 'p2', e.target.value)} /></div>
                            <div className="stats-stack"><div className="mini-due">Due: -${getPersonStats(owner).due2.toFixed(0)}</div><div className={`mini-free ${getPersonStats(owner).free2 < 0 ? 'neg' : 'pos'}`}>Free: ${getPersonStats(owner).free2.toFixed(0)}</div></div>
                          </div>

                          <div className="inp-group">
                            <label style={{color: 'var(--accent)'}}>Extra</label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}><span style={{ position: 'absolute', left: 10, color: 'var(--accent)' }}>$</span><input type="number" style={{ paddingLeft: 25, width: '100%', boxSizing: 'border-box', borderColor: 'var(--accent)' }} value={currentIncomes[`${owner}_extra`] || ''} placeholder="0" onChange={(e) => handleIncomeChange(owner, 'extra', e.target.value)} /></div>
                            <div className="stats-stack"><div className="mini-due">&nbsp;</div><div className={`mini-free ${getPersonStats(owner).incExtra < 0 ? 'neg' : 'pos'}`}>+ ${getPersonStats(owner).incExtra.toFixed(0)}</div></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <ChecklistWidget title={`${monthLabel} Overview`} todos={currentTodos.filter(t => !t.columnId || t.columnId === 'global')} onAdd={(text) => handleAddTodo(text, hasJointPool ? jointPoolName : owners[0], 'global')} onToggle={handleToggleTodo} onDelete={handleDeleteTodo} variant="global" />
                
                <div className="tour-board">
                  <DragDropContext onDragEnd={onDragEnd}>
                    {hasJointPool && (
                      <BalanceSection 
                        title={
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <span>🏠</span>
                            {isEditingJointPoolName ? (
                              <input autoFocus value={tempJointPoolName} onChange={(e) => setTempJointPoolName(e.target.value)} onBlur={() => { setJointPoolName(tempJointPoolName || 'House Bills'); setIsEditingJointPoolName(false); }} onKeyDown={(e) => { if (e.key === 'Enter') { setJointPoolName(tempJointPoolName || 'House Bills'); setIsEditingJointPoolName(false); } }} style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--accent)', borderRadius: 4, padding: '0px 4px', fontSize: 'inherit', fontWeight: 'inherit', outline: 'none', width: '120px' }} />
                            ) : (
                              <span onClick={() => { setTempJointPoolName(jointPoolName); setIsEditingJointPoolName(true); }} style={{ cursor: 'pointer', borderBottom: '1px dashed var(--accent)' }} title="Click to rename">{jointPoolName}</span>
                            )}
                          </div>
                        } 
                        owner={jointPoolName} bills={currentBills} isShared={true} onTogglePaid={togglePaid} onDelete={deleteFromDashboard} onAddOneTime={openOneTimeModal} onBalance={handleSectionBalance} onAddTodo={(text, col) => handleAddTodo(text, jointPoolName, col)} todos={currentTodos.filter(t => t.owner === jointPoolName)} onToggleTodo={handleToggleTodo} onDeleteTodo={handleDeleteTodo} 
                      />
                    )}
                    {owners.map(owner => (<BalanceSection key={owner} title={`👤 ${owner}'s Bills`} owner={owner} bills={currentBills} isShared={false} onTogglePaid={togglePaid} onDelete={deleteFromDashboard} onAddOneTime={openOneTimeModal} onBalance={handleSectionBalance} onAddTodo={(text, col) => handleAddTodo(text, owner, col)} todos={currentTodos.filter(t => t.owner === owner)} onToggleTodo={handleToggleTodo} onDeleteTodo={handleDeleteTodo} />))}
                  </DragDropContext>
                </div>
              </>
            )}
          </div>
        )}
        
        {view === 'bills' && <RecurringBills bills={recurringBills} onAddBill={addRecurring} onEditBill={updateRecurring} onDeleteBill={deleteRecurring} owners={allEntities} categories={categories} />}
        {view === 'goals' && <SavingsManager goals={savingsGoals} onAddGoal={addGoal} onEditGoal={updateGoal} onDeleteGoal={deleteGoal} owners={allEntities} />}
        {view === 'forecast' && ( <div className="animate-fade-in"> <div className="month-selector"><button onClick={() => changeMonth(-1)}><ChevronLeft size={24}/></button><h2>{monthLabel}</h2><button onClick={() => changeMonth(1)}><ChevronRight size={24}/></button></div> {(() => { let totalRollover = 0; owners.forEach(owner => { totalRollover += getRollover(monthKey, owner); }); return <Forecast bills={currentBills} currentDate={currentDate} monthLabel={monthLabel} incomes={currentIncomes} owners={allEntities} rollover={totalRollover} />; })()} </div> )}
        {view === 'reports' && <Reports monthlyData={monthlyData} owners={allEntities} categories={categories} savingsGoals={savingsGoals} recurringBills={recurringBills} />}
        {view === 'settings' && <Settings currentTheme={theme} setTheme={setTheme} owners={owners} setOwners={setOwners} hasJointPool={hasJointPool} setHasJointPool={setHasJointPool} jointPoolName={jointPoolName} setJointPoolName={setJointPoolName} appStartDate={appStartDate} startingBalances={startingBalances} setStartingBalances={setStartingBalances} categories={categories} setCategories={setCategories} recurringBills={recurringBills} setRecurringBills={setRecurringBills} savingsGoals={savingsGoals} setSavingsGoals={setSavingsGoals} monthlyData={monthlyData} setMonthlyData={setMonthlyData} onReplayTour={() => { setTourStepIndex(0); setHasSeenTour(false); setRunTour(true); setView('dashboard'); }} />}      
      </main>

      {/* MODALS */}
      {isModalOpen && (<div className="modal-overlay"><div className="modal-card animate-fade-in"><div className="modal-header"><h3 style={{margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8}}>{modalType === 'onetime' ? <Plus size={20}/> : <Target size={20}/>} {modalType === 'onetime' ? 'Add One-Time Bill' : 'Throw Extra Cash'}</h3><button className="btn-close" onClick={() => setIsModalOpen(false)}><X size={20} /></button></div><form onSubmit={handleModalSubmit} className="add-bill-form"><p className="subtitle" style={{marginBottom: 20, marginTop: 0}}>{modalType === 'onetime' ? `Adding to ${modalData.owner}'s check.` : `How much extra are you putting towards ${modalData.name.replace('Extra: ', '')}?`}</p>{modalType === 'onetime' && (<input autoFocus className="input-field" placeholder="What is the expense?" value={modalData.name} onChange={(e) => setModalData({ ...modalData, name: e.target.value })} />)}<div className="form-row"><input type="number" autoFocus={modalType !== 'onetime'} className="input-field" placeholder="Amount ($)" value={modalData.amount} onChange={(e) => setModalData({ ...modalData, amount: e.target.value })} /><select className="input-field" value={modalData.columnId} onChange={(e) => setModalData({ ...modalData, columnId: e.target.value })}><option value="pay1">From Paycheck 1</option><option value="pay2">From Paycheck 2</option></select></div>{modalType === 'onetime' && (<div style={{marginTop: 10}}><select className="input-field" value={modalData.category} onChange={e => setModalData({...modalData, category: e.target.value})}>{Object.entries(categories).map(([key, cat]) => (<option key={key} value={key}>{cat.label}</option>))}</select></div>)}<div className="form-actions" style={{justifyContent: 'flex-end', marginTop: 15}}><button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button><button type="submit" className="btn-primary">{modalType === 'onetime' ? 'Add Expense' : 'Add Payment'}</button></div></form></div></div>)}
      {expandedChart && (<div className="chart-modal-overlay"><div className="chart-modal-content animate-fade-in"><button className="btn-close-chart" onClick={() => setExpandedChart(null)}><X size={24} /></button><div className="modal-chart-header" style={{marginBottom: 20, display: 'flex', alignItems: 'center', gap: 15}}><h2 style={{margin: 0}}>{expandedChart === 'breakdown' && 'Spending Breakdown'}{expandedChart === 'cashflow' && 'Money In vs Money Out'}{expandedChart === 'burden' && 'Fixed Bills vs Free Cash'}{expandedChart === 'trend' && '6-Month Financial Trend'}</h2>{expandedChart === 'breakdown' && (<div className="select-wrapper-small" style={{marginRight: 4}}><Layers size={14} className="icon"/><select value={chartGroupBy} onChange={(e) => setChartGroupBy(e.target.value)}><option value="owner">By Owner</option><option value="category">By Category</option></select></div>)}{expandedChart === 'breakdown' && (<div className="select-wrapper-small"><Filter size={14} className="icon"/><select value={breakdownFilter} onChange={(e) => setBreakdownFilter(e.target.value)}><option value="All">All Owners</option>{owners.map(o => <option key={o} value={o}>{o}</option>)}</select></div>)} {expandedChart === 'cashflow' && (<div className="select-wrapper-small"><Filter size={14} className="icon"/><select value={cashFlowFilter} onChange={(e) => setCashFlowFilter(e.target.value)}><option value="All">Household</option>{owners.map(o => <option key={o} value={o}>{o}</option>)}</select></div>)}</div><div style={{flex: 1, width: '100%', minHeight: 0}}>{renderChartContent(expandedChart)}</div></div></div>)}
      {isClosingOpen && (
        <div className="modal-overlay">
          <div className="modal-card animate-fade-in" style={{maxWidth: 500}}>
            <div className="modal-header"><h3 style={{margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8}}><CheckSquare size={20} color="var(--green)"/> Close Books for {monthLabel}</h3><button className="btn-close" onClick={() => setIsClosingOpen(false)}><X size={20} /></button></div>
            <form onSubmit={handleCloseBooks} className="add-bill-form">
              <div className="modal-intro" style={{marginBottom: 20, background: 'var(--bg)', padding: 15, borderRadius: 8, fontSize: '0.9rem', color: 'var(--text)'}}><p style={{margin: 0}}>This will finalize the month. Any difference between your <b>Expected</b> cash and <b>Actual</b> cash will be saved as an adjustment for next month.</p></div>
              {owners.map(owner => { const stats = getPersonStats(owner); const projected = stats.totalFree; return ( <div key={owner} style={{marginBottom: 15}}> <div style={{display:'flex', justifyContent:'space-between', marginBottom: 6, fontSize: '0.9rem'}}> <span style={{fontWeight: 600}}>{owner}</span> <span style={{color: 'var(--text-dim)'}}>Expected: ${projected.toFixed(0)}</span> </div> <div className="form-row"> <input type="number" className="input-field" placeholder="Actual Bank Balance" value={closingBalances[owner] || ''} onChange={(e) => setClosingBalances({...closingBalances, [owner]: parseFloat(e.target.value)})} required autoFocus={owner === owners[0]} /> </div> {closingBalances[owner] !== undefined && ( <div style={{textAlign: 'right', fontSize: '0.8rem', marginTop: 4, color: (closingBalances[owner] - projected) >= 0 ? 'var(--green)' : 'var(--red)'}}> Difference: {(closingBalances[owner] - projected) > 0 ? '+' : ''}${(closingBalances[owner] - projected).toFixed(0)} </div> )} </div> ); })}
              <div className="form-actions" style={{justifyContent: 'flex-end', marginTop: 20}}><button type="button" className="btn-cancel" onClick={() => setIsClosingOpen(false)}>Cancel</button><button type="submit" className="btn-primary">Confirm & Close</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ... Sub-components remain identical ...
function DayPicker({ value, onChange }) { const [isOpen, setIsOpen] = useState(false); const wrapperRef = useRef(null); useEffect(() => { function handleClickOutside(event) { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) { setIsOpen(false); } } document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, [wrapperRef]); const handleDaySelect = (day) => { onChange(day); setIsOpen(false); }; return (<div className="day-picker-container" ref={wrapperRef}><button className="day-picker-trigger" onClick={() => setIsOpen(!isOpen)}><CalendarIcon size={12} className="icon" /><span className="value">{value ? getOrdinal(value) : 'Date'}</span><ChevronDown size={10} className="arrow" /></button>{isOpen && (<div className="day-picker-popover animate-fade-in"><div className="day-grid">{Array.from({ length: 31 }, (_, i) => i + 1).map(day => (<button key={day} className={`day-btn ${value == day ? 'active' : ''}`} onClick={() => handleDaySelect(day)}>{day}</button>))}</div><button className="btn-clear-date" onClick={() => handleDaySelect('')}>Clear Date</button></div>)}</div>); }
function ChecklistWidget({ title, todos, onAdd, onToggle, onDelete, variant = 'global' }) { const [text, setText] = useState(''); const handleSubmit = (e) => { e.preventDefault(); if (text.trim()) { onAdd(text); setText(''); } }; return (<div className={`checklist-widget ${variant}`}>{title && <h4 className="checklist-title">{title}</h4>}<div className="checklist-items">{todos.map(todo => (<div key={todo.id} className="checklist-item"><button onClick={() => onToggle(todo.id)} className="btn-check">{todo.completed ? <CheckCircle2 size={16} color="var(--green)"/> : <Circle size={16} color="var(--text-dim)"/>}</button><span className={todo.completed ? 'completed' : ''}>{todo.text}</span><button onClick={() => onDelete(todo.id)} className="btn-del"><Trash2 size={14}/></button></div>))}</div><form onSubmit={handleSubmit} className="checklist-form"><input placeholder={variant === 'mini' ? "Add note..." : "Add a reminder..."} value={text} onChange={(e) => setText(e.target.value)} /><button type="submit"><Plus size={14}/></button></form></div>); }
function BalanceSection({ title, owner, bills, isShared, onTogglePaid, onDelete, onAddOneTime, onBalance, onAddTodo, todos, onToggleTodo, onDeleteTodo }) { const sectionBills = bills.filter(b => b.owner === owner); const p1Bills = sectionBills.filter(b => b.columnId === 'pay1'); const p2Bills = sectionBills.filter(b => b.columnId === 'pay2'); const p1Total = p1Bills.reduce((sum, b) => sum + b.amount, 0); const p2Total = p2Bills.reduce((sum, b) => sum + b.amount, 0); return (<div className="balance-section"><div className="section-header-row"><h3 style={{color: isShared ? 'var(--accent)' : 'var(--text)'}}>{title}</h3><button className="btn-icon-only" onClick={() => onBalance(owner)} title={`Auto-Balance ${owner}'s Bills Only`} style={{marginLeft: 10}}><RefreshCw size={16} /></button></div><div className="balance-grid"><Droppable droppableId={`${owner}-pay1`}>{(provided, snapshot) => (<div className={`mini-column ${snapshot.isDraggingOver ? 'drag-active' : ''}`} ref={provided.innerRef} {...provided.droppableProps}><div className="mini-header"><div><span>Paycheck 1</span><button className="btn-add-quick" onClick={() => onAddOneTime(owner, 'pay1')} title="Add one-time bill"><Plus size={14}/></button></div><span className="mini-total">Bills: -${p1Total}</span></div>{p1Bills.map((bill, index) => <BillCard key={bill.snapshotId} bill={bill} index={index} onTogglePaid={onTogglePaid} onDelete={onDelete}/>)}{provided.placeholder}<div style={{marginTop: 15}}><ChecklistWidget todos={todos.filter(t => t.columnId === 'pay1')} onAdd={(text) => onAddTodo(text, 'pay1')} onToggle={onToggleTodo} onDelete={onDeleteTodo} variant="mini"/></div></div>)}</Droppable><Droppable droppableId={`${owner}-pay2`}>{(provided, snapshot) => (<div className={`mini-column ${snapshot.isDraggingOver ? 'drag-active' : ''}`} ref={provided.innerRef} {...provided.droppableProps}><div className="mini-header"><div><span>Paycheck 2</span><button className="btn-add-quick" onClick={() => onAddOneTime(owner, 'pay2')} title="Add one-time bill"><Plus size={14}/></button></div><span className="mini-total">Bills: -${p2Total}</span></div>{p2Bills.map((bill, index) => <BillCard key={bill.snapshotId} bill={bill} index={index} onTogglePaid={onTogglePaid} onDelete={onDelete}/>)}{provided.placeholder}<div style={{marginTop: 15}}><ChecklistWidget todos={todos.filter(t => t.columnId === 'pay2')} onAdd={(text) => onAddTodo(text, 'pay2')} onToggle={onToggleTodo} onDelete={onDeleteTodo} variant="mini"/></div></div>)}</Droppable></div></div>); }
function BillCard({ bill, index, onTogglePaid, onDelete }) { const catIcon = getCategoryIcon(bill.category || 'other'); return (<Draggable draggableId={bill.snapshotId} index={index}>{(provided) => (<div className={`draggable-bill mini-bill ${bill.isPaid ? 'is-paid' : ''} ${bill.isSavings ? 'is-savings-bill' : ''}`} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{...provided.draggableProps.style, borderLeft: bill.owner === 'Shared' ? '3px solid var(--accent)' : '1px solid var(--border)'}}><button className="btn-toggle-paid" onClick={() => onTogglePaid(bill.snapshotId)}>{bill.isPaid ? <CheckCircle2 size={18} color="var(--green)"/> : <Circle size={18} color="var(--text-dim)"/>}</button><div className="bill-content"><div className="bill-name">{bill.name}</div><div className="bill-sub">Due the {getOrdinal(bill.dueDate)}</div><div className="bill-owner-label" style={{display: 'flex', alignItems: 'center', gap: 4}}>{catIcon}<span>{bill.originalOwner || bill.owner}</span></div></div><div className="bill-amt">-${bill.amount}</div><button className="btn-del-month" onClick={() => onDelete(bill.snapshotId)} title="Remove from this month only"><Trash2 size={14}/></button></div>)}</Draggable>); }