import { addDays, addWeeks, addMonths, isBefore, isAfter, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDate, startOfWeek, endOfWeek, isSameMonth, differenceInDays } from 'date-fns';

export const INITIAL_DATA = {
  bankBalance: 4250.00,
  variableBuffer: 200,
  income: {
    type: 'consistent',
    frequency: 'bi-weekly',
    amount: 2800,
    nextPayDate: new Date().toISOString()
  },
  bills: []
};

// HELPER: Fix timezone issues
export function parseLocalYYYYMMDD(dateString) {
  if (!dateString) return new Date();
  if (typeof dateString === 'string' && dateString.includes('T')) return new Date(dateString);
  if (typeof dateString === 'string') return new Date(dateString + 'T12:00:00');
  return new Date(dateString);
}

// 1. GET NEXT PAY DATES (Current + Next)
export function getPaySchedule(incomeSettings) {
  let currentPayDate = parseLocalYYYYMMDD(incomeSettings.nextPayDate);
  const today = new Date();
  
  // If stored date is old, fast forward to next real future payday
  while (isBefore(currentPayDate, today) && !isSameDay(currentPayDate, today)) {
    if (incomeSettings.frequency === 'weekly') currentPayDate = addWeeks(currentPayDate, 1);
    else if (incomeSettings.frequency === 'bi-weekly') currentPayDate = addWeeks(currentPayDate, 2);
    else if (incomeSettings.frequency === 'monthly') currentPayDate = addMonths(currentPayDate, 1);
  }

  // Calculate the Payday AFTER that one (for forecasting)
  let nextPayDate = new Date(currentPayDate);
  if (incomeSettings.frequency === 'weekly') nextPayDate = addWeeks(nextPayDate, 1);
  else if (incomeSettings.frequency === 'bi-weekly') nextPayDate = addWeeks(nextPayDate, 2);
  else if (incomeSettings.frequency === 'monthly') nextPayDate = addMonths(nextPayDate, 1);

  return { currentPayDate, nextPayDate };
}

// 2. BACKWARDS COMPATIBILITY EXPORT (Fixes your error)
export function getNextPaydate(income) {
  const { currentPayDate } = getPaySchedule(income);
  return currentPayDate;
}

// 3. CORE FORECAST ENGINE
export function calculateBudget(balance, income, bills, buffer) {
  const { currentPayDate, nextPayDate } = getPaySchedule(income);
  
  // STEP A: Flatten all bills (Handle Splits)
  let allBills = [];
  bills.forEach(bill => {
    if (bill.splits && bill.splits.length > 0) {
      bill.splits.forEach((split, idx) => {
        if (!split.isPaid) {
           allBills.push({
             ...bill,
             id: `${bill.id}-split-${idx}`,
             name: `${bill.name} (${idx+1}/${bill.splits.length})`,
             amount: parseFloat(split.amount),
             dueDateObj: getNextBillDate(parseInt(split.date)), // Helper to get actual date object
             originalDay: parseInt(split.date),
             isSplit: true
           });
        }
      });
    } else if (!bill.isPaid) {
       allBills.push({
         ...bill,
         dueDateObj: getNextBillDate(bill.dueDate),
         originalDay: bill.dueDate,
         isSplit: false
       });
    }
  });

  // Sort by Date
  allBills.sort((a,b) => a.dueDateObj - b.dueDateObj);

  // STEP B: Bucketing (Current Period vs Next Period)
  let currentPeriodBills = [];
  let nextPeriodBills = [];
  
  allBills.forEach(bill => {
    if (isBefore(bill.dueDateObj, nextPayDate)) {
      currentPeriodBills.push(bill);
    } else {
      const limitDate = addMonths(nextPayDate, 1);
      if (isBefore(bill.dueDateObj, limitDate)) {
        nextPeriodBills.push(bill);
      }
    }
  });

  // STEP C: The "Pay Early" Optimizer
  const projectedIncome = income.amount || 2000;
  const period2Total = nextPeriodBills.reduce((sum, b) => sum + b.amount, 0);
  const period2Buffer = buffer || 0;
  
  let period2FreeCash = projectedIncome - period2Total - period2Buffer;
  const SAFETY_THRESHOLD = 500; 

  while (period2FreeCash < SAFETY_THRESHOLD && nextPeriodBills.length > 0) {
    const billToMove = nextPeriodBills.shift();
    billToMove.isEarlyPay = true; 
    billToMove.originalDue = billToMove.dueDateObj;
    currentPeriodBills.push(billToMove);
    period2FreeCash += billToMove.amount;
  }

  const reservedTotal = currentPeriodBills.reduce((sum, b) => sum + b.amount, 0) + (parseFloat(buffer) || 0);
  const safeToSpend = balance - reservedTotal;

  return {
    safeToSpend,
    reservedTotal,
    currentPayDate,
    nextPayDate,
    currentPeriodBills,
    nextPeriodBills
  };
}

// --- HELPERS ---

function getNextBillDate(dayOfMonth) {
  const today = new Date();
  let targetDate = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
  if (isBefore(targetDate, new Date(today.setHours(0,0,0,0)))) {
    targetDate = addMonths(targetDate, 1);
  }
  return targetDate;
}

export function generateCalendarDays(currentDate, bills, income) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const { currentPayDate } = getPaySchedule(income);

  return days.map(day => {
    const dayNum = getDate(day);
    const isCurrentMonth = isSameMonth(day, monthStart);
    let daysBills = [];

    if (isCurrentMonth) {
      bills.forEach(bill => {
        if (bill.splits?.length > 0) {
          bill.splits.forEach((split, index) => {
            if (parseInt(split.date) === dayNum && !split.isPaid) {
              daysBills.push({
                name: `${bill.name} (${index + 1}/${bill.splits.length})`,
                amount: parseFloat(split.amount),
                isSplit: true
              });
            }
          });
        } 
        else if (bill.dueDate === dayNum && !bill.isPaid) {
          daysBills.push(bill);
        }
      });
    }

    const isPayday = isCurrentMonth && isSameDay(day, currentPayDate);
    
    return {
      date: day,
      dayNum,
      bills: daysBills,
      isPayday,
      isCurrentMonth
    };
  });
}