import React, { useState } from 'react';
import { GripVertical } from 'lucide-react';

export default function DemoBoard() {
  // Hardcoded dummy state for the demo
  const [columns, setColumns] = useState({
    unassigned: {
      name: 'Bill Queue',
      items: [
        { id: 'b1', name: 'Mortgage / Rent', amount: 1800 },
        { id: 'b2', name: 'Groceries', amount: 600 },
        { id: 'b3', name: 'Electric Bill', amount: 150 },
        { id: 'b4', name: 'Car Payment', amount: 450 }
      ]
    },
    pay1: { name: 'Paycheck 1 (1st - 15th)', items: [] },
    pay2: { name: 'Paycheck 2 (16th - 31st)', items: [] }
  });

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e, billId, sourceCol) => {
    e.dataTransfer.setData('billId', billId);
    e.dataTransfer.setData('sourceCol', sourceCol);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e, targetCol) => {
    const billId = e.dataTransfer.getData('billId');
    const sourceCol = e.dataTransfer.getData('sourceCol');

    if (sourceCol === targetCol) return;

    // Find the bill
    const sourceItems = [...columns[sourceCol].items];
    const targetItems = [...columns[targetCol].items];
    const billIndex = sourceItems.findIndex(b => b.id === billId);
    const [movedBill] = sourceItems.splice(billIndex, 1);

    // Add to new column
    targetItems.push(movedBill);

    setColumns({
      ...columns,
      [sourceCol]: { ...columns[sourceCol], items: sourceItems },
      [targetCol]: { ...columns[targetCol], items: targetItems }
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, textAlign: 'left', background: 'var(--bg)', padding: 20, borderRadius: 12 }}>
      
      {Object.entries(columns).map(([colId, column]) => (
        <div 
          key={colId}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, colId)}
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border)', borderRadius: 8, padding: 15, minHeight: 300 }}
        >
          <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: 'var(--text-dim)', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
            {column.name}
            <div style={{ float: 'right', color: 'var(--accent)' }}>
              ${column.items.reduce((sum, item) => sum + item.amount, 0)}
            </div>
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {column.items.map(bill => (
              <div
                key={bill.id}
                draggable
                onDragStart={(e) => handleDragStart(e, bill.id, colId)}
                style={{ background: 'var(--border)', padding: '12px', borderRadius: 6, display: 'flex', alignItems: 'center', cursor: 'grab', color: 'var(--text)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <GripVertical size={16} style={{ marginRight: 10, color: 'var(--text-dim)' }} />
                <span style={{ flex: 1 }}>{bill.name}</span>
                <span style={{ fontWeight: 600 }}>${bill.amount}</span>
              </div>
            ))}
            
            {column.items.length === 0 && (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                Drag bills here
              </div>
            )}
          </div>
        </div>
      ))}
      
    </div>
  );
}