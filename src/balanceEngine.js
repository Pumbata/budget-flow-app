// SMART BALANCER: The "Infinite Water Level" Algorithm
export function autoBalanceBudget(incomeBuckets, bills) {
  // incomeBuckets looks like: [{ id: 'pay1', free: 1700 }, { id: 'pay2', free: 1500 }, { id: 'pay3', free: 0 }]
  
  // 1. Sort bills largest to smallest (Always place big rocks first)
  const sortedBills = [...bills].sort((a, b) => b.amount - a.amount);
  const distributedBills = [];
  
  // Clone buckets so we don't accidentally mutate the original data
  const dynamicBuckets = incomeBuckets.map(b => ({ ...b }));

  // 2. Distribute
  sortedBills.forEach(bill => {
    // Sort buckets so the one with the MOST free cash is always at index 0
    dynamicBuckets.sort((a, b) => b.free - a.free);
    
    // Grab the bucket with the highest water level
    const targetBucket = dynamicBuckets[0];
    
    // Assign the bill to this bucket and subtract the cash
    distributedBills.push({ ...bill, columnId: targetBucket.id });
    targetBucket.free -= bill.amount;
  });

  // Returns a flat array of perfectly balanced bills
  return distributedBills; 
}

// Initial sorting by Date (Upgraded to handle infinite pay dates)
export function alignBillsByDate(payDates, bills) {
  // payDates looks like: [{ id: 'pay1', date: 13 }, { id: 'pay2', date: 27 }]
  
  return bills.map(bill => {
    let closestId = payDates[0]?.id || 'pay1';
    let minDiff = Infinity;
    
    payDates.forEach(pd => {
      const diff = Math.abs(bill.dueDate - pd.date);
      if (diff < minDiff) {
        minDiff = diff;
        closestId = pd.id;
      }
    });

    return { ...bill, columnId: closestId };
  });
}