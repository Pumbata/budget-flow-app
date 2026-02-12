// SMART BALANCER: The "Water Level" Algorithm
export function autoBalanceBudget(paycheck1Income, paycheck2Income, bills) {
  
  // 1. Sort bills largest to smallest (Always place big rocks first)
  const sortedBills = [...bills].sort((a, b) => b.amount - a.amount);
  
  const col1 = [];
  const col2 = [];
  
  // Track "Remaining Free Cash" dynamically as we assign bills
  let p1Free = paycheck1Income;
  let p2Free = paycheck2Income;

  // 2. Distribute
  sortedBills.forEach(bill => {
    // LOGIC: Simply assign the bill to whichever paycheck currently has MORE money.
    // This naturally lowers the high peak until it meets the low one.
    
    if (p1Free >= p2Free) {
      col1.push({ ...bill, columnId: 'pay1' });
      p1Free -= bill.amount;
    } else {
      col2.push({ ...bill, columnId: 'pay2' });
      p2Free -= bill.amount;
    }
  });

  return { col1, col2 };
}

// Initial sorting (No changes here, but keeping it for the import)
export function alignBillsByDate(payDate1, payDate2, bills) {
  const d1 = new Date(payDate1).getDate();
  const d2 = new Date(payDate2).getDate();

  return bills.map(bill => {
    const dist1 = Math.abs(bill.dueDate - d1);
    const dist2 = Math.abs(bill.dueDate - d2);
    
    return { 
      ...bill, 
      columnId: (dist1 <= dist2) ? 'pay1' : 'pay2' 
    };
  });
}