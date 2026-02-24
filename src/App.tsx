import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Joyride, { STATUS } from 'react-joyride';
import { 
  Calculator, LayoutDashboard, Receipt, Wallet, RefreshCw, RefreshCcw, Users, User, 
  Settings as SettingsIcon, ChevronLeft, ChevronRight, CheckCircle2, Circle, Trash2, 
  Plus, X, Target, PieChart as PieChartIcon, Kanban, Filter, Maximize2, CheckSquare, 
  CalendarClock, Calendar as CalendarIcon, ChevronDown, Layers, Tag, Home, Car, Zap, 
  CreditCard, Smile, ShoppingBag, Activity, HelpCircle, Landmark, Lock, Unlock, 
  LogOut, Loader2, TrendingUp, TrendingDown, DollarSign, List, ArrowRight, BookOpen,
  ArrowUpRight, ArrowDownRight, Scissors
} from 'lucide-react';
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
import Tools from './Tools';
import UserGuide from './UserGuide';

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
  const [tourStepIndex, setTourStepIndex] = useState(0); 
  
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
  const [paycheckLabels, setPaycheckLabels] = useState({});

  // --- Modal & Form State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('onetime'); 
  const [modalData, setModalData] = useState({ owner: '', columnId: '', name: '', amount: '', goalId: null, category: 'other' });
  const [isClosingOpen, setIsClosingOpen] = useState(false);
  const [closingBalances, setClosingBalances] = useState({});
  
  // --- Split Bill State ---
  const [isSplitOpen, setIsSplitOpen] = useState(false);
  const [splitBillData, setSplitBillData] = useState(null);
  const [splitAmount, setSplitAmount] = useState('');
  
  const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const monthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // ==========================================
  // 2. EFFECTS (DATA LOADING & SAVING)
  // ==========================================

  useEffect(() => {
    // 1. Initial Load when you first open the website
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadUserData(session.user.id);
      else setIsLoadingData(false);
    });

    // 2. Active Listeners
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setIsRecoveringPassword(true);
      setSession(session);
      
      // THE FIX: We only run the heavy database loader if it's a brand new login.
      // We explicitly ignore 'TOKEN_REFRESHED' which fires every time you switch browser tabs.
      if (event === 'SIGNED_IN' && session && !isRecoveringPassword) {
        loadUserData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setIsLoadingData(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [isRecoveringPassword]);

  const loadUserData = async (userId) => {
    // THE FIX: Only trigger the full-screen loading spinner if we aren't already logged in.
    // This allows the app to sync data in the background when you switch tabs without destroying your child pages!
    if (!session) {
      setIsLoadingData(true);
    }
    
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
        if (data.paycheck_labels) setPaycheckLabels(data.paycheck_labels);
        
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
        paycheck_labels: paycheckLabels,
        has_seen_tour: hasSeenTour, 
        updated_at: new Date()
      };
      const { error } = await supabase.from('user_state').upsert(updates);
      if (error) console.error('Error saving data:', error);
    };
    saveData();
  }, [owners, hasJointPool, jointPoolName, categories, recurringBills, savingsGoals, monthlyData, startingBalances, appStartDate, theme, paycheckLabels, hasSeenTour, session]);

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
       
       const b = mData.bills || []; 
       const inc = mData.incomes || {};
       
       let monthTotalInc = 0;
       Object.keys(inc).forEach(k => {
         if (k.startsWith(`${person}_p`) && !k.endsWith('_date')) monthTotalInc += parseFloat(inc[k] || 0);
       });
       
       const monthPersBills = b.filter(x => x.owner === person).reduce((s, x) => s + x.amount, 0); 
       
       const monthSharedBills = hasJointPool ? b.filter(x => x.owner === jointPoolName).reduce((s, x) => s + x.amount, 0) : 0;
       const monthSharedSplit = hasJointPool ? monthSharedBills / peopleCount : 0;
       
       const generatedThatMonth = monthTotalInc - monthPersBills - monthSharedSplit;
       totalRollover += generatedThatMonth; 
       currentKey = prevKey; 
    }
    return totalRollover;
  };

  const sharedP1 = hasJointPool ? currentBills.filter(b => b.owner === jointPoolName && (b.columnId === 'pay1' || b.columnId === 'p1')).reduce((sum, b) => sum + b.amount, 0) : 0; 
  const sharedP2 = hasJointPool ? currentBills.filter(b => b.owner === jointPoolName && (b.columnId === 'pay2' || b.columnId === 'p2')).reduce((sum, b) => sum + b.amount, 0) : 0; 
  const splitP1 = hasJointPool ? sharedP1 / peopleCount : 0; 
  const splitP2 = hasJointPool ? sharedP2 / peopleCount : 0;

  const getPersonStats = (person) => { 
    const activeColumnsRaw = Object.keys(currentIncomes)
      .filter(k => k.startsWith(`${person}_p`) && !k.endsWith('_date'))
      .map(k => k.split('_')[1]); 

    let columnsToCheck = activeColumnsRaw.length > 0 ? activeColumnsRaw.map(c => c.replace('p', 'pay')) : ['pay1', 'pay2'];
    columnsToCheck.sort((a, b) => parseInt(a.replace('pay', '')) - parseInt(b.replace('pay', '')));

    let totalInc = 0;
    let totalDue = 0;
    let totalFree = 0;

    const pBills = currentBills.filter(b => b.owner === person); 
    const rollover = getRollover(monthKey, person); 

    const columnStats = {};
    columnsToCheck.forEach(col => {
      const incKey = col.replace('pay', 'p');
      const inc = parseFloat(currentIncomes[`${person}_${incKey}`] || 0);
      
      const persBills = pBills.filter(b => b.columnId === col || b.columnId === incKey).reduce((sum, b) => sum + b.amount, 0);
      const sharedSplit = hasJointPool ? (currentBills.filter(b => b.owner === jointPoolName && (b.columnId === col || b.columnId === incKey)).reduce((sum, b) => sum + b.amount, 0) / peopleCount) : 0;
      
      const due = persBills + sharedSplit;
      const free = inc - due;

      columnStats[col] = { due, free };
      totalInc += inc;
      totalDue += due;
    });

    totalFree = totalInc - totalDue + rollover; 
    
    return { 
      rollover, totalFree, 
      columnStats, 
      due1: columnStats['pay1']?.due || 0, 
      due2: columnStats['pay2']?.due || 0,
      columns: columnsToCheck 
    }; 
  };

  const handleAddPaycheck = (owner) => {
    const stats = getPersonStats(owner);
    let maxNum = 0;
    stats.columns.forEach(c => {
      const num = parseInt(c.replace('pay', ''));
      if (num > maxNum) maxNum = num;
    });
    const nextColNumber = maxNum + 1;
    handleIncomeChange(owner, `p${nextColNumber}`, 0); 
  };

  const handleDeletePaycheck = (owner, col) => {
    const customLabel = paycheckLabels[`${monthKey}_${owner}_${col}`] || col;
    if (window.confirm(`Are you sure you want to remove "${customLabel}"? Any bills currently in this column will be moved to Paycheck 1.`)) {
      const incKey = col.replace('pay', 'p');
      
      const updatedBills = currentBills.map(b => {
        if (b.owner === owner && (b.columnId === col || b.columnId === incKey)) {
          return { ...b, columnId: 'pay1' };
        }
        return b;
      });

      const newIncomes = { ...currentIncomes };
      delete newIncomes[`${owner}_${incKey}`];
      delete newIncomes[`${owner}_${incKey}_date`];

      const newLabels = { ...paycheckLabels };
      delete newLabels[`${monthKey}_${owner}_${col}`];
      setPaycheckLabels(newLabels);
      
      updateCurrentMonth(updatedBills, newIncomes);
    }
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
  
  const generateIncomeVsExpenseData = () => { 
    if (cashFlowFilter === 'All') { 
      let totalIncome = 0; let totalExpenses = currentBills.reduce((sum, b) => sum + b.amount, 0); 
      owners.forEach(owner => { 
        const rollover = getRollover(monthKey, owner); 
        let ownerInc = 0;
        Object.keys(currentIncomes).forEach(k => {
          if (k.startsWith(`${owner}_p`) && !k.endsWith('_date')) ownerInc += parseFloat(currentIncomes[k] || 0);
        });
        totalIncome += (ownerInc + (rollover > 0 ? rollover : 0)); 
      }); 
      return [ { name: 'Total In', amount: totalIncome, fill: '#22c55e' }, { name: 'Total Out', amount: totalExpenses, fill: '#ef4444' }, { name: 'Net', amount: totalIncome - totalExpenses, fill: '#3b82f6' } ]; 
    } else { 
      const owner = cashFlowFilter; const stats = getPersonStats(owner); 
      const rollover = getRollover(monthKey, owner); 
      let myIncome = (rollover > 0 ? rollover : 0);
      Object.keys(currentIncomes).forEach(k => {
        if (k.startsWith(`${owner}_p`) && !k.endsWith('_date')) myIncome += parseFloat(currentIncomes[k] || 0);
      });
      const myFixedCosts = Object.values(stats.columnStats).reduce((sum, col) => sum + col.due, 0);
      return [ { name: 'My Income', amount: myIncome, fill: '#22c55e' }, { name: 'My Costs', amount: myFixedCosts, fill: '#ef4444' }, { name: 'My Net', amount: myIncome - myFixedCosts, fill: '#3b82f6' } ]; 
    } 
  };

  const generateBurdenData = () => owners.map(owner => { 
    const stats = getPersonStats(owner); 
    const totalFixed = Object.values(stats.columnStats).reduce((sum, col) => sum + col.due, 0);
    return { name: owner, Fixed: totalFixed, Free: stats.totalFree }; 
  });
  const generateTrendData = () => { 
    const keys = Object.keys(monthlyData).sort(); const recentKeys = keys.slice(-6); 
    return recentKeys.map(key => { 
      const mData = monthlyData[key]; const b = mData.bills || []; const inc = mData.incomes || {}; 
      let mIncome = 0; let mExpenses = b.reduce((sum, item) => sum + item.amount, 0); 
      owners.forEach(owner => { 
        Object.keys(inc).forEach(k => {
          if (k.startsWith(`${owner}_p`) && !k.endsWith('_date')) mIncome += parseFloat(inc[k] || 0);
        });
      }); 
      const [y, m] = key.split('-'); return { name: new Date(y, m - 1).toLocaleString('default', { month: 'short' }), Income: mIncome, Expenses: mExpenses }; 
    }); 
  };
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
  
  const handleSectionBalance = (targetOwner) => { 
    const ownerBills = currentBills.filter(b => b.owner === targetOwner); 
    const otherBills = currentBills.filter(b => b.owner !== targetOwner); 
    const stats = getPersonStats(targetOwner);
    const incomeBuckets = stats.columns.map(col => {
      const incKey = col.replace('pay', 'p');
      const freeCash = targetOwner === jointPoolName ? 0 : parseFloat(currentIncomes[`${targetOwner}_${incKey}`] || 0);
      return { id: col, free: freeCash };
    });
    const balancedBills = autoBalanceBudget(incomeBuckets, ownerBills); 
    updateCurrentMonth([...otherBills, ...balancedBills], undefined); 
  };

  const handleBalanceEverything = () => { 
    let allBalancedBills = []; 
    if (hasJointPool) {
      const sharedBills = currentBills.filter(b => b.owner === jointPoolName); 
      const stats = getPersonStats(jointPoolName);
      const incomeBuckets = stats.columns.map(col => ({ id: col, free: 0 }));
      const sharedBalanced = autoBalanceBudget(incomeBuckets, sharedBills); 
      allBalancedBills.push(...sharedBalanced); 
    }
    owners.forEach(owner => { 
      const ownerBills = currentBills.filter(b => b.owner === owner); 
      const stats = getPersonStats(owner);
      const incomeBuckets = stats.columns.map(col => {
        const incKey = col.replace('pay', 'p');
        return { id: col, free: parseFloat(currentIncomes[`${owner}_${incKey}`] || 0) };
      });
      const ownerBalanced = autoBalanceBudget(incomeBuckets, ownerBills); 
      allBalancedBills.push(...ownerBalanced); 
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
  
  // --- Split Bill Actions ---
  const openSplitModal = (bill) => {
    setSplitBillData(bill);
    setSplitAmount('');
    setIsSplitOpen(true);
  };

  const handleSplitSubmit = (e) => {
    e.preventDefault();
    const amountToSplit = parseFloat(splitAmount);
    
    if (isNaN(amountToSplit) || amountToSplit <= 0 || amountToSplit >= splitBillData.amount) {
      alert("Please enter a valid amount less than the total bill.");
      return;
    }

    // 1. Create the new cloned chunk
    const newClonedBill = {
      ...splitBillData,
      id: `split-${Date.now()}`, // Break the connection to the master recurring bill so syncing doesn't overwrite it
      snapshotId: `split-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      name: `${splitBillData.name} (Part 2)`,
      amount: amountToSplit,
      isPaid: false
    };

    // 2. Reduce the original bill's amount
    const updatedBills = currentBills.map(b => {
      if (b.snapshotId === splitBillData.snapshotId) {
        // Automatically rename the original so it's clear it was split
        const originalName = b.name.includes('(Part') ? b.name : `${b.name} (Part 1)`;
        return { ...b, amount: b.amount - amountToSplit, name: originalName };
      }
      return b;
    });

    // 3. Save it all
    updateCurrentMonth([...updatedBills, newClonedBill], undefined);
    setIsSplitOpen(false);
    setSplitBillData(null);
    setSplitAmount('');
  };

  const handleOnboardingComplete = ({ finalOwners, hasJointPool, jointPoolName, finalBills }) => {
    setOwners(finalOwners);
    setHasJointPool(hasJointPool);
    if (hasJointPool) setJointPoolName(jointPoolName);
    setRecurringBills(finalBills);
    setShowOnboarding(false);
    
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
    { target: '.tour-add-bill', content: "Welcome to the Blueprint! Click 'Add Bill' to input all your standard monthly expenses.", placement: 'bottom' },
    { target: '.tour-blueprint-list', content: "Once added, they live here forever. Your dashboard will copy these every single month so you never have to type them twice. You're all set!", placement: 'top' }
  ];

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data;
    if (type === 'step:after') {
      if (action === 'next' || action === 'close') {
        if (index === 5) {
          setView('bills');
          setTimeout(() => setTourStepIndex(index + 1), 100);
        } else {
          setTourStepIndex(index + 1); 
        }
      } 
      else if (action === 'prev') {
        if (index === 6) {
          setView('dashboard');
          setTimeout(() => setTourStepIndex(index - 1), 100);
        } else {
          setTourStepIndex(index - 1);
        }
      }
    }
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      setHasSeenTour(true);
      setTourStepIndex(0); 
      setView('dashboard'); 
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
        stepIndex={tourStepIndex}
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
        <button className={`nav-item tour-nav-bills ${view === 'bills' ? 'active' : ''}`} onClick={() => setView('bills')}><Receipt size={20} /> Recurring Bills</button>
        <button className={`nav-item ${view === 'goals' ? 'active' : ''}`} onClick={() => setView('goals')}><Target size={20} /> Savings Goals</button>
        <button className={`nav-item ${view === 'reports' ? 'active' : ''}`} onClick={() => setView('reports')}><Activity size={20} /> Reports</button>
        <button className={`nav-item ${view === 'tools' ? 'active' : ''}`} onClick={() => setView('tools')}><Calculator size={20} /> Tools</button>
        <button className={`nav-item ${view === 'settings' ? 'active' : ''}`} onClick={() => setView('settings')}><SettingsIcon size={20} /> Settings</button>
        <button className={`nav-item ${view === 'guide' ? 'active' : ''}`} onClick={() => setView('guide')}><BookOpen size={20} /> Guide</button>        
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
                        
                        {/* THE STRICT 2-COLUMN GRID SYSTEM */}
                        <div className="income-inputs" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '15px', width: '100%' }}>
                          {getPersonStats(owner).columns.map((col, index) => {
                            const incKey = col.replace('pay', 'p');
                            return (
                              <div key={col} className="inp-group" style={{ minWidth: 0, boxSizing: 'border-box' }}>
                                <div style={{display: 'flex', justifyContent:'space-between', alignItems:'center'}}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <input 
                                      type="text"
                                      className="editable-label"
                                      value={paycheckLabels[`${monthKey}_${owner}_${col}`] || `Check ${index + 1}`}
                                      onChange={(e) => setPaycheckLabels({...paycheckLabels, [`${monthKey}_${owner}_${col}`]: e.target.value})}
                                      style={{ background: 'transparent', border: 'none', borderBottom: '1px dashed var(--accent)', color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem', width: '75px', padding: 0 }}
                                    />
                                    {col !== 'pay1' && (
                                      <button className="btn-icon-only" onClick={() => handleDeletePaycheck(owner, col)} title="Remove Paycheck" style={{ padding: 2, border: 'none', background: 'transparent' }}>
                                        <X size={14} color="var(--red)" />
                                      </button>
                                    )}
                                  </div>
                                  <DayPicker value={currentIncomes[`${owner}_${incKey}_date`]} onChange={(day) => handleIncomeChange(owner, `${incKey}_date`, day)} />
                                </div>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginTop: 4 }}>
                                  <span style={{ position: 'absolute', left: 10, color: 'var(--text-dim)' }}>$</span>
                                  <input type="number" style={{ paddingLeft: 25, width: '100%', boxSizing: 'border-box' }} value={currentIncomes[`${owner}_${incKey}`] || ''} placeholder="0" onChange={(e) => handleIncomeChange(owner, incKey, e.target.value)} />
                                </div>
                                <div className="stats-stack" style={{ marginTop: 4 }}>
                                  <div className="mini-due">Due: -${(getPersonStats(owner).columnStats[col]?.due || 0).toFixed(0)}</div>
                                  <div className={`mini-free ${(getPersonStats(owner).columnStats[col]?.free || 0) < 0 ? 'neg' : 'pos'}`}>Free: ${(getPersonStats(owner).columnStats[col]?.free || 0).toFixed(0)}</div>
                                </div>
                              </div>
                            )
                          })}

                          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
                            <button 
                              className="btn-add-quick" 
                              onClick={() => handleAddPaycheck(owner)} 
                              title="Add another paycheck cycle for this month" 
                              style={{ padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', background: 'var(--bg)', border: '1px dashed var(--border)', color: 'var(--text)', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              <Plus size={14} color="var(--text-dim)" /> Add Income
                            </button>
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
                        owner={jointPoolName} 
                        bills={currentBills} 
                        isShared={true} 
                        onTogglePaid={togglePaid} 
                        onDelete={deleteFromDashboard} 
                        onAddOneTime={openOneTimeModal} 
                        onBalance={handleSectionBalance} 
                        onAddTodo={(text, col) => handleAddTodo(text, jointPoolName, col)} 
                        todos={currentTodos.filter(t => t.owner === jointPoolName)} 
                        onToggleTodo={handleToggleTodo} 
                        onDeleteTodo={handleDeleteTodo} 
                        activeColumns={getPersonStats(jointPoolName).columns}
                        paycheckLabels={paycheckLabels}
                        monthKey={monthKey}
                        onSplit={openSplitModal}
                      />
                    )}
                    {owners.map(owner => (
                      <BalanceSection 
                        key={owner} 
                        title={`👤 ${owner}'s Bills`} 
                        owner={owner} 
                        bills={currentBills} 
                        isShared={false} 
                        onTogglePaid={togglePaid} 
                        onDelete={deleteFromDashboard} 
                        onAddOneTime={openOneTimeModal} 
                        onBalance={handleSectionBalance} 
                        onAddTodo={(text, col) => handleAddTodo(text, owner, col)} 
                        todos={currentTodos.filter(t => t.owner === owner)} 
                        onToggleTodo={handleToggleTodo} 
                        onDeleteTodo={handleDeleteTodo} 
                        activeColumns={getPersonStats(owner).columns}
                        paycheckLabels={paycheckLabels}
                        monthKey={monthKey}
                        onSplit={openSplitModal}
                      />
                    ))}
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
        {view === 'tools' && <Tools />}
        {view === 'guide' && <UserGuide />}        
        {view === 'settings' && <Settings currentTheme={theme} setTheme={setTheme} owners={owners} setOwners={setOwners} hasJointPool={hasJointPool} setHasJointPool={setHasJointPool} jointPoolName={jointPoolName} setJointPoolName={setJointPoolName} appStartDate={appStartDate} startingBalances={startingBalances} setStartingBalances={setStartingBalances} categories={categories} setCategories={setCategories} recurringBills={recurringBills} setRecurringBills={setRecurringBills} savingsGoals={savingsGoals} setSavingsGoals={setSavingsGoals} monthlyData={monthlyData} setMonthlyData={setMonthlyData} onReplayTour={() => { setTourStepIndex(0); setHasSeenTour(false); setRunTour(true); setView('dashboard'); }} />}      
      </main>

      {/* MODALS */}
      {isModalOpen && (<div className="modal-overlay"><div className="modal-card animate-fade-in"><div className="modal-header"><h3 style={{margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8}}>{modalType === 'onetime' ? <Plus size={20}/> : <Target size={20}/>} {modalType === 'onetime' ? 'Add One-Time Bill' : 'Throw Extra Cash'}</h3><button className="btn-close" onClick={() => setIsModalOpen(false)}><X size={20} /></button></div><form onSubmit={handleModalSubmit} className="add-bill-form"><p className="subtitle" style={{marginBottom: 20, marginTop: 0}}>{modalType === 'onetime' ? `Adding to ${modalData.owner}'s check.` : `How much extra are you putting towards ${modalData.name.replace('Extra: ', '')}?`}</p>{modalType === 'onetime' && (<input autoFocus className="input-field" placeholder="What is the expense?" value={modalData.name} onChange={(e) => setModalData({ ...modalData, name: e.target.value })} />)}<div className="form-row"><input type="number" autoFocus={modalType !== 'onetime'} className="input-field" placeholder="Amount ($)" value={modalData.amount} onChange={(e) => setModalData({ ...modalData, amount: e.target.value })} /><select className="input-field" value={modalData.columnId} onChange={(e) => setModalData({ ...modalData, columnId: e.target.value })}>
        {modalData.owner && getPersonStats(modalData.owner).columns.map((col, index) => (
          <option key={col} value={col}>
            From {paycheckLabels[`${monthKey}_${modalData.owner}_${col}`] || `Check ${index + 1}`}
          </option>
        ))}
        {!modalData.owner && (
          <>
            <option value="pay1">From Paycheck 1</option>
            <option value="pay2">From Paycheck 2</option>
          </>
        )}
      </select></div>{modalType === 'onetime' && (<div style={{marginTop: 10}}><select className="input-field" value={modalData.category} onChange={e => setModalData({...modalData, category: e.target.value})}>{Object.entries(categories).map(([key, cat]) => (<option key={key} value={key}>{cat.label}</option>))}</select></div>)}<div className="form-actions" style={{justifyContent: 'flex-end', marginTop: 15}}><button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button><button type="submit" className="btn-primary">{modalType === 'onetime' ? 'Add Expense' : 'Add Payment'}</button></div></form></div></div>)}
      
      {/* NEW: THE SPLIT BILL MODAL */}
      {isSplitOpen && splitBillData && (
        <div className="modal-overlay">
          <div className="modal-card animate-fade-in">
            <div className="modal-header">
              <h3 style={{margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8}}>
                <Scissors size={20} color="var(--accent)"/> Split Bill
              </h3>
              <button className="btn-close" onClick={() => { setIsSplitOpen(false); setSplitBillData(null); }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSplitSubmit} className="add-bill-form">
              <p className="subtitle" style={{marginBottom: 10, marginTop: 0}}>
                You are splitting <strong>{splitBillData.name}</strong> (${splitBillData.amount}).
              </p>
              <p style={{fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: 20}}>
                How much do you want to break off into a brand new card?
              </p>
              
              <div className="form-row" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>$</span>
                <input 
                  type="number" 
                  autoFocus 
                  className="input-field" 
                  placeholder="Amount to split off" 
                  value={splitAmount} 
                  onChange={(e) => setSplitAmount(e.target.value)} 
                  max={splitBillData.amount - 0.01} // Prevent splitting the whole thing
                  step="0.01"
                />
              </div>

              {splitAmount && parseFloat(splitAmount) > 0 && parseFloat(splitAmount) < splitBillData.amount && (
                <div style={{ marginTop: 15, padding: 10, background: 'rgba(245, 158, 11, 0.1)', borderRadius: 8, fontSize: '0.85rem' }}>
                  <strong>Result:</strong> You will have one card for ${ (splitBillData.amount - parseFloat(splitAmount)).toFixed(2) } and a new card for ${ parseFloat(splitAmount).toFixed(2) }.
                </div>
              )}

              <div className="form-actions" style={{justifyContent: 'flex-end', marginTop: 20}}>
                <button type="button" className="btn-cancel" onClick={() => { setIsSplitOpen(false); setSplitBillData(null); }}>Cancel</button>
                <button type="submit" className="btn-primary">Split Bill</button>
              </div>
            </form>
          </div>
        </div>
      )}

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

// ... Sub-components ...
function DayPicker({ value, onChange }) { 
  const inputRef = useRef(null);
  let displayValue = 'Date';
  
  if (value) {
    if (!isNaN(value) && !String(value).includes('-')) {
      displayValue = getOrdinal(value); 
    } else {
      const [y, m, d] = value.split('-');
      const dateObj = new Date(y, m - 1, d);
      displayValue = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  const handleOpenPicker = () => {
    if (inputRef.current) {
      try { inputRef.current.showPicker(); } catch (error) { inputRef.current.focus(); }
    }
  };

  return (
    <div className="day-picker-container" style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" className="day-picker-trigger" onClick={handleOpenPicker} style={{ margin: 0, cursor: 'pointer' }}>
        <CalendarIcon size={12} className="icon" />
        <span className="value">{displayValue}</span>
        <ChevronDown size={10} className="arrow" />
      </button>
      <input ref={inputRef} type="date" value={String(value).includes('-') ? value : ''} onChange={(e) => onChange(e.target.value)} style={{ position: 'absolute', bottom: 0, left: 0, opacity: 0, width: '1px', height: '1px', pointerEvents: 'none', border: 'none', padding: 0 }} />
    </div>
  ); 
}

function ChecklistWidget({ title, todos, onAdd, onToggle, onDelete, variant = 'global' }) { const [text, setText] = useState(''); const handleSubmit = (e) => { e.preventDefault(); if (text.trim()) { onAdd(text); setText(''); } }; return (<div className={`checklist-widget ${variant}`}>{title && <h4 className="checklist-title">{title}</h4>}<div className="checklist-items">{todos.map(todo => (<div key={todo.id} className="checklist-item"><button onClick={() => onToggle(todo.id)} className="btn-check">{todo.completed ? <CheckCircle2 size={16} color="var(--green)"/> : <Circle size={16} color="var(--text-dim)"/>}</button><span className={todo.completed ? 'completed' : ''}>{todo.text}</span><button onClick={() => onDelete(todo.id)} className="btn-del"><Trash2 size={14}/></button></div>))}</div><form onSubmit={handleSubmit} className="checklist-form"><input placeholder={variant === 'mini' ? "Add note..." : "Add a reminder..."} value={text} onChange={(e) => setText(e.target.value)} /><button type="submit"><Plus size={14}/></button></form></div>); }

function BalanceSection({ title, owner, bills, isShared, onTogglePaid, onDelete, onAddOneTime, onBalance, onAddTodo, todos, onToggleTodo, onDeleteTodo, activeColumns = ['p1', 'p2'], paycheckLabels = {}, monthKey = '', onSplit }) { 
  const sectionBills = bills.filter(b => b.owner === owner); 
  
  return (
    <div className="balance-section">
      <div className="section-header-row">
        <h3 style={{color: isShared ? 'var(--accent)' : 'var(--text)'}}>{title}</h3>
        <button className="btn-icon-only" onClick={() => onBalance(owner)} title={`Auto-Balance ${owner}'s Bills Only`} style={{marginLeft: 10}}><RefreshCw size={16} /></button>
      </div>
      <div className="balance-grid" style={{ gridTemplateColumns: `repeat(${activeColumns.length}, 1fr)` }}>
        
        {activeColumns.map((col, index) => {
          const incKey = col.replace('pay', 'p');
          const colBills = sectionBills.filter(b => b.columnId === col || b.columnId === incKey);
          const colTotal = colBills.reduce((sum, b) => sum + b.amount, 0);
          const customLabel = paycheckLabels[`${monthKey}_${owner}_${col}`] || `Check ${index + 1}`;

          return (
            <Droppable key={col} droppableId={`${owner}-${col}`}>
              {(provided, snapshot) => (
                <div className={`mini-column ${snapshot.isDraggingOver ? 'drag-active' : ''}`} ref={provided.innerRef} {...provided.droppableProps}>
                  <div className="mini-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600 }}>{customLabel}</span>
                      
                      {/* --- UPDATED BUTTON HERE --- */}
                      <button 
                        className="btn-add-quick" 
                        onClick={() => onAddOneTime(owner, col)} 
                        title="Add one-time bill"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.75rem', borderRadius: '6px' }}
                      >
                        <Plus size={14}/> Add one-time bill
                      </button>
                      
                    </div>
                    <span className="mini-total">Bills: -${colTotal.toFixed(2)}</span>
                  </div>
                  {colBills.map((bill, billIndex) => <BillCard key={bill.snapshotId} bill={bill} index={billIndex} onTogglePaid={onTogglePaid} onDelete={onDelete} onSplit={onSplit}/>)}
                  {provided.placeholder}
                  <div style={{marginTop: 15}}>
                    <ChecklistWidget todos={todos.filter(t => t.columnId === col)} onAdd={(text) => onAddTodo(text, col)} onToggle={onToggleTodo} onDelete={onDeleteTodo} variant="mini"/>
                  </div>
                </div>
              )}
            </Droppable>
          )
        })}
      </div>
    </div>
  ); 
}

function BillCard({ bill, index, onTogglePaid, onDelete, onSplit }) { 
  const catIcon = getCategoryIcon(bill.category || 'other'); 
  
  const handleStatusChange = (e) => {
    const val = e.target.value;
    
    if (val === 'split') {
      e.target.value = bill.isPaid ? 'paid' : 'unpaid'; 
      onSplit(bill); // Trigger the new modal
      return;
    }
    
    if ((val === 'paid' && !bill.isPaid) || (val === 'unpaid' && bill.isPaid)) {
      onTogglePaid(bill.snapshotId);
    }
  };

  return (
    <Draggable draggableId={bill.snapshotId} index={index}>
      {(provided) => (
        <div 
          className={`draggable-bill mini-bill ${bill.isPaid ? 'is-paid' : ''} ${bill.isSavings ? 'is-savings-bill' : ''}`} 
          ref={provided.innerRef} 
          {...provided.draggableProps} 
          {...provided.dragHandleProps} 
          style={{
            ...provided.draggableProps.style, 
            borderLeft: bill.owner === 'Shared' ? '3px solid var(--accent)' : '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center', 
            paddingLeft: '10px'
          }}
        >
          
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginRight: '12px' }}>
            <select 
              value={bill.isPaid ? 'paid' : 'unpaid'}
              onChange={handleStatusChange}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                backgroundColor: bill.isPaid ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg)',
                color: bill.isPaid ? 'var(--green)' : 'var(--text-dim)',
                border: `1px solid ${bill.isPaid ? 'rgba(34, 197, 94, 0.4)' : 'var(--border)'}`,
                borderRadius: '12px',
                padding: '4px 22px 4px 8px', 
                fontSize: '0.7rem',
                fontWeight: '600',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="unpaid">⚪ Unpaid</option>
              <option value="paid">🟢 Paid</option>
              <option value="split">✂️ Split...</option>
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: 6, pointerEvents: 'none', color: bill.isPaid ? 'var(--green)' : 'var(--text-dim)' }} />
          </div>

          <div className="bill-content" style={{ flex: 1, minWidth: 0 }}>
            <div className="bill-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bill.name}</div>
            <div className="bill-sub">Due the {getOrdinal(bill.dueDate)}</div>
            <div className="bill-owner-label" style={{display: 'flex', alignItems: 'center', gap: 4, marginTop: '4px', margin: 0}}>
              {catIcon}<span>{bill.originalOwner || bill.owner}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', marginLeft: '10px' }}>
            <div className="bill-amt">-${bill.amount.toFixed(2)}</div>
            <button className="btn-del-month" onClick={() => onDelete(bill.snapshotId)} title="Remove from this month only" style={{ marginTop: '8px' }}>
              <Trash2 size={14}/>
            </button>
          </div>

        </div>
      )}
    </Draggable>
  ); 
}