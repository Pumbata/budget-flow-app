import React, { useState } from 'react';
import { BookOpen, LayoutDashboard, SplitSquareHorizontal, Target, Calculator, PieChart, Settings } from 'lucide-react';

export default function UserGuide() {
  const [activeSection, setActiveSection] = useState('intro');

  const scrollTo = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const Section = ({ id, title, icon: Icon, children }) => (
    <section id={id} style={{ marginBottom: 80, scrollMarginTop: 40, paddingBottom: 40, borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
        <div style={{ padding: 10, background: 'rgba(96, 165, 250, 0.1)', borderRadius: 12 }}>
          <Icon size={32} color="var(--accent)" />
        </div>
        <h2 style={{ fontSize: '2.2rem', margin: 0, letterSpacing: '-1px' }}>{title}</h2>
      </div>
      <div style={{ paddingLeft: 10 }}>
        {children}
      </div>
    </section>
  );

  const Placeholder = ({ label }) => (
    <div style={{ 
      width: '100%', 
      height: 220, 
      background: 'rgba(0,0,0,0.2)', 
      border: '2px dashed var(--border)', 
      borderRadius: 16, 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      margin: '30px 0',
      color: 'var(--text-dim)',
      transition: 'all 0.2s'
    }}>
      <div style={{ fontSize: '2.5rem', opacity: 0.3, marginBottom: 10 }}>📷</div>
      <p style={{ margin: 0, fontWeight: 500 }}>{label}</p>
      <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>(Insert Screenshot Here)</span>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: 40, height: 'calc(100vh - 40px)', overflow: 'hidden' }}>
      
      {/* LEFT: Table of Contents */}
      <aside style={{ width: 260, flexShrink: 0, borderRight: '1px solid var(--border)', paddingRight: 20, overflowY: 'auto' }}>
        <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: 1.5, marginBottom: 20, marginTop: 10 }}>User Manual</h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <NavButton id="intro" active={activeSection} onClick={scrollTo} icon={BookOpen} label="Philosophy" />
          <NavButton id="dashboard" active={activeSection} onClick={scrollTo} icon={LayoutDashboard} label="The Dashboard" />
          <NavButton id="blueprint" active={activeSection} onClick={scrollTo} icon={SplitSquareHorizontal} label="The Blueprint" />
          <NavButton id="savings" active={activeSection} onClick={scrollTo} icon={Target} label="Savings & Goals" />
          <NavButton id="tools" active={activeSection} onClick={scrollTo} icon={Calculator} label="Tools & Sims" />
          <NavButton id="reports" active={activeSection} onClick={scrollTo} icon={PieChart} label="Financial Reports" />
          <NavButton id="settings" active={activeSection} onClick={scrollTo} icon={Settings} label="Settings" />
        </nav>
      </aside>

      {/* RIGHT: Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 40, paddingBottom: 100 }}>
        
        {/* INTRO: THE PHILOSOPHY */}
        <Section id="intro" title="The Philosophy" icon={BookOpen}>
          <p className="lead" style={{ fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '20px' }}>
            Welcome to OmegaBudget. If you have tried other budgeting apps and failed, it likely wasn't your fault. It was the system's fault.
          </p>

          <p style={{ lineHeight: 1.6 }}>
            Most budgeting tools are "Forensic Accounting"—they look backwards at what you already spent. They are autopsies of your bank account. OmegaBudget is different. It is an <strong>Operational Command Center</strong>. It looks forward.
          </p>

          {/* History Section styled as a distinct card */}
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: 25, borderRadius: 16, margin: '30px 0', borderLeft: '4px solid var(--accent)' }}>
            <h3 style={{ marginTop: 0, color: 'var(--accent)' }}>1. The History of Kanban</h3>
            <p style={{ lineHeight: 1.6 }}>
              In post-war Japan, Toyota faced a crisis. They couldn't afford to build thousands of cars and let them sit waiting for buyers. That was "Waste" (or <em>Muda</em>).
            </p>
            <p style={{ lineHeight: 1.6 }}>
              Engineer Taiichi Ohno invented <strong>"Kanban"</strong> (Visual Card) to control the flow. They only built what was needed, when it was needed.
            </p>
            
            <h4 style={{ marginBottom: 10, marginTop: 20 }}>How it Works in a Factory:</h4>
            <ul style={{ paddingLeft: 20, lineHeight: 1.6 }}>
              <li style={{ marginBottom: 8 }}><strong>Visualize the Workflow:</strong> See exactly where the bottlenecks are.</li>
              <li style={{ marginBottom: 8 }}><strong>Limit Work in Progress:</strong> Stop "jams" before they happen.</li>
              <li><strong>Just-In-Time (JIT):</strong> Parts arrive exactly when needed.</li>
            </ul>
          </div>
          
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
  <img 
    src="/kanban-flow.png" 
    alt="Kanban Flow Diagram" 
    style={{ maxWidth: '100%', borderRadius: 12, border: '1px solid var(--border)' }} 
  />
</div>

          <h3>2. Your Money is a Supply Chain</h3>
          <p style={{ lineHeight: 1.6 }}>
            Traditional budgeting treats money like a static pile of inventory. It says, <em>"You have $4,000. Good luck!"</em> But your life is a flow:
          </p>
          <ul style={{ lineHeight: 1.6, marginBottom: 20, listStyleType: 'circle', paddingLeft: 20 }}>
            <li>Rent is due on the 1st.</li>
            <li>Car Payment is due on the 15th.</li>
            <li>Paychecks hit on the 1st and 15th.</li>
          </ul>
          <p style={{ lineHeight: 1.6 }}>
            If you ignore the timing, you hit a <strong>"Cash Flow Crunch."</strong> You might have money technically, but it's stuck in the wrong part of the month.
          </p>

          <h3>3. The Omega System: Active Flow Management</h3>
          <p style={{ lineHeight: 1.6 }}>
            OmegaBudget uses a visual Kanban Board to place bills in <strong>Time Slots</strong>.
          </p>

          <div style={{ textAlign: 'center', margin: '30px 0' }}>
  <img 
    src="/visual-vs-list.png" 
    alt="Kanban Flow Diagram" 
    style={{ maxWidth: '100%', borderRadius: 12, border: '1px solid var(--border)' }} 
  />
</div>

          <h4>Why "Active Budgeting" Works</h4>
          <p style={{ lineHeight: 1.6 }}>
            Automation makes you passive. When an app auto-categorizes a transaction, you don't feel it. OmegaBudget forces you to be the <strong>Plant Manager</strong>:
          </p>
          <ul style={{ lineHeight: 1.6, paddingLeft: 20 }}>
            <li style={{ marginBottom: 10 }}><strong>The Visual Board:</strong> You physically see if "Paycheck 1" is overloaded with red cards.</li>
            <li style={{ marginBottom: 10 }}><strong>The Manual Move:</strong> Dragging a bill forces you to acknowledge the trade-off. <em>"If I move this, I have cash now, but less later."</em></li>
            <li><strong>The "Done" State:</strong> Moving a card to "Paid" gives you a dopamine hit.</li>
          </ul>

          <h3>4. Conclusion</h3>
          <p style={{ lineHeight: 1.6 }}>
            Most budgets are about restriction. OmegaBudget is about <strong>optimization</strong>. By visualizing your flow and eliminating "lazy money," you aren't just paying bills. You are running a lean, efficient, wealth-building machine.
          </p>
          <p style={{ fontWeight: 600, color: 'var(--accent)', marginTop: 20 }}>
            Welcome to the assembly line of your future. Welcome to OmegaBudget.
          </p>
        </Section>

        {/* DASHBOARD: YOUR COMMAND CENTER */}
        <Section id="dashboard" title="The Dashboard" icon={LayoutDashboard}>
          <p className="lead" style={{ fontSize: '1.2rem', marginBottom: 20 }}>
            The Dashboard is the heart of OmegaBudget. Unlike other apps that just track what you spent, the Dashboard is an active workspace designed to help you plan your spending before it happens.
          </p>

          <h3>1. Setting Your Income</h3>
          <p>
            At the top of the screen, you will see your Income Cards. This is where you tell the app how much money you have to work with this month.
          </p>
          
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
  <img 
    src="/income.png" 
    alt="Kanban Flow Diagram" 
    style={{ maxWidth: '100%', borderRadius: 12, border: '1px solid var(--border)' }} 
  />
</div>
          
          <ul style={{ lineHeight: 1.8, marginBottom: 20 }}>
            <li><strong>Paycheck 1 & 2:</strong> Enter the expected amount for your first and second paychecks of the month.</li>
            <li><strong>Extra Income:</strong> Did you sell something online or get a bonus? Enter that in the "Extra" field.</li>
            <li><strong>Total Free Cash:</strong> Watch the badge in the top right.
              <ul style={{ marginTop: 5, paddingLeft: 20, color: 'var(--text-dim)' }}>
                <li><span style={{ color: 'var(--green)', fontWeight: 600 }}>Green:</span> You have money left over after bills!</li>
                <li><span style={{ color: 'var(--red)', fontWeight: 600 }}>Red:</span> You have assigned more bills than you have income. You need to move things around.</li>
              </ul>
            </li>
          </ul>

          <h3>2. The Kanban Board (Balancing Your Budget)</h3>
          <p>
            OmegaBudget uses a "Kanban" style board. This allows you to visually move bills between paychecks to ensure you never overdraft.
          </p>
          
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
  <img 
    src="/kanban-board.png" 
    alt="Kanban Flow Diagram" 
    style={{ maxWidth: '100%', borderRadius: 12, border: '1px solid var(--border)' }} 
  />
</div>
          
          <p><strong>Drag & Drop:</strong> Click and hold any bill card to move it.</p>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 8, marginBottom: 20 }}>
            <strong>Balancing Strategy:</strong><br/>
            If Paycheck 1 has too many bills (resulting in negative cash), drag a bill over to Paycheck 2. The goal is to keep both columns "Net Positive."
          </div>

          <h3>3. The "Balance All" Button</h3>
          <p>Don't want to do the math yourself? Let our engine do it for you.</p>
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
  <img 
    src="/balance-all-button.png" 
    alt="Kanban Flow Diagram" 
    style={{ maxWidth: '100%', borderRadius: 12, border: '1px solid var(--border)' }} 
  />
</div>
          <p>
            Click the <strong>Balance All</strong> button in the top right. The app will instantly shuffle your bills into the optimal columns to maximize your Free Cash flow for both pay periods.
          </p>

          <h3>4. Tracking Progress</h3>
          <p>
            As you pay bills in real life (via your bank's app or website), mark them as paid in OmegaBudget to keep your board clean.
          </p>
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
  <img 
    src="/mark-paid.png" 
    alt="Kanban Flow Diagram" 
    style={{ maxWidth: '100%', borderRadius: 12, border: '1px solid var(--border)' }} 
  />
</div>
          <ul style={{ lineHeight: 1.8 }}>
            <li><strong>Mark as Paid:</strong> Click the circle icon on the left of any bill card. It will turn green, signaling that money has physically left your account.</li>
            <li><strong>One-Time Expenses:</strong> Did you buy something unexpected? Click the small <strong>+</strong> button in a column header to add a "One-Time Bill" (e.g., "Car Repair - $200") to keep your budget accurate.</li>
          </ul>

          <h3>5. Closing the Books</h3>
          <p>At the end of the month, you need to finalize your budget to prepare for next month.</p>
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
  <img 
    src="/close-books.png" 
    alt="Kanban Flow Diagram" 
    style={{ maxWidth: '100%', borderRadius: 12, border: '1px solid var(--border)' }} 
  />
</div>
          <ol style={{ lineHeight: 1.8, marginBottom: 20 }}>
            <li>Click <strong>Close Books</strong> at the top right.</li>
            <li>Enter your <strong>Actual Bank Balance</strong>.</li>
            <li>The app calculates the difference between what you thought you would have and what you actually have.</li>
          </ol>
          <p>
            <strong>Rollover:</strong> Any extra money (or deficit) will automatically roll over to next month's "Income" section, so your math is always perfect.
          </p>

          <div className="tip-box" style={tipStyle}>
            <strong>Pro Tip:</strong> Use the Checklist Widget on the dashboard to leave notes for yourself or your spouse (e.g., "Remember to cancel Netflix before the 15th!").
          </div>
        </Section>

        {/* BLUEPRINT: RECURRING BILLS */}
        <Section id="blueprint" title="The Blueprint" icon={SplitSquareHorizontal}>
          <p className="lead" style={{ fontSize: '1.2rem', marginBottom: 20 }}>
            Think of this page as the DNA of your budget. You only have to do the work here once.
          </p>
          
          <p>
            The <strong>Recurring Bills</strong> tab is where you define your "Master List" of expenses that happen every single month (Rent, Internet, Netflix, Gym). Once you set them up here, OmegaBudget will automatically copy them to your Dashboard at the start of every new month, saving you from typing them in over and over again.
          </p>

          <h3>1. Adding a New Bill</h3>
          <p>To get started, navigate to the Recurring Bills tab in the sidebar.</p>
          
          <Placeholder label="Recurring Bills Header: 'Add Bill' Button" />
          
          <ol style={{ lineHeight: 1.8, marginBottom: 20 }}>
            <li>Click the blue <strong>+ Add Bill</strong> button in the top right.</li>
            <li>A form will appear. Fill in the standard details for this expense:
              <ul style={{ marginTop: 10, marginBottom: 10, color: 'var(--text-dim)' }}>
                <li><strong>Bill Name:</strong> What is it? (e.g., "State Farm Insurance").</li>
                <li><strong>Amount:</strong> How much is it usually? (If it varies, enter the average).</li>
                <li><strong>Due Day:</strong> What day of the month is it due? (1-31).</li>
                <li><strong>Assigned Owner:</strong> Who is responsible? (You, your partner, or "Shared Pool").</li>
                <li><strong>Category:</strong> Select a tag (e.g., "Housing"). This is crucial for reports!</li>
              </ul>
            </li>
            <li>Click <strong>Save Bill</strong>. It will instantly appear in your list below.</li>
          </ol>

          <h3>2. Managing Your Master List</h3>
          <p>
            Your bills are automatically grouped by Owner. This helps you see exactly who is responsible for what before the month even begins.
          </p>
          
          <Placeholder label="List of Bills Grouped by Owner" />
          
          <ul style={{ lineHeight: 1.8 }}>
            <li><strong>Editing:</strong> Did your internet price go up? Click the <strong>Pencil</strong> icon to update the Master Amount. Future months will use this new price.</li>
            <li><strong>Deleting:</strong> Cancelled a subscription? Click the <strong>Trash</strong> icon to remove it. It will stop appearing in future months.</li>
          </ul>

          <h3>3. The "Sync" Button (Crucial Step!)</h3>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--red)', padding: 15, borderRadius: 8, marginBottom: 20 }}>
            <strong>Important:</strong> Changing a bill in the Recurring Bills tab does <em>not</em> immediately change the current month's Dashboard. This is a safety feature.
          </div>
          
          <p>To push your changes to the active Dashboard:</p>
          <Placeholder label="Dashboard Header: Highlighting 'Sync' Button" />
          
          <ol style={{ lineHeight: 1.8 }}>
            <li>Go back to the Dashboard.</li>
            <li>Click the <strong>Sync Button</strong> (The circular arrow icon) in the top header.</li>
          </ol>
          
          <p><strong>What happens next?</strong></p>
          <ul style={{ lineHeight: 1.8 }}>
            <li>The app checks your Blueprint.</li>
            <li>It looks for any new bills and pulls them into the current month.</li>
            <li>It updates prices for unpaid bills.</li>
            <li><strong>Safe Zone:</strong> It will never change a bill you have already marked as "Paid."</li>
          </ul>

          <div className="tip-box" style={tipStyle}>
            <strong>Pro Tips for Success:</strong><br/>
            <ul style={{ margin: '10px 0 0 0', paddingLeft: 20 }}>
              <li style={{ marginBottom: 10 }}><strong>Variable Bills:</strong> For things like Electric, budget for the <em>highest</em> amount (e.g. $150). It's better to budget $150 and pay $120 (yay, $30 extra!) than to budget $100 and be short.</li>
              <li><strong>Annual Bills:</strong> For once-a-year bills (like Amazon Prime), use the <strong>Savings Goals</strong> section to create a Sinking Fund instead of adding it here!</li>
            </ul>
          </div>
        </Section>

        {/* SAVINGS: SINKING FUNDS */}
        <Section id="savings" title="Savings & Goals" icon={Target}>
          <p className="lead" style={{ fontSize: '1.2rem', marginBottom: 20 }}>
            Most people get into debt because of "surprise" expenses—like Christmas gifts, car tires, or annual insurance premiums. But these aren't actually surprises; they just happen irregularly.
          </p>

          <p>
            The <strong>Savings Goals</strong> tab turns these big, scary future expenses into small, manageable monthly "bills." This technique is called <strong>Sinking Funds</strong>. By the time the bill is due, you have the cash sitting there waiting. No stress, no debt.
          </p>
          
          <Placeholder label="Sinking Fund Graph Visualization" />

          <h3>1. Creating a New Goal</h3>
          <p>Navigate to the Savings Goals tab (Target Icon) in the sidebar.</p>
          
          <Placeholder label="Savings Goals Main Page: 'Add Goal' Button" />
          
          <ol style={{ lineHeight: 1.8, marginBottom: 20 }}>
            <li>Click <strong>+ Add Goal</strong> in the top right.</li>
            <li>Fill in the details for your financial target:
              <ul style={{ marginTop: 10, marginBottom: 10, color: 'var(--text-dim)' }}>
                <li><strong>Goal Name:</strong> Be specific! (e.g., "New Tires" or "Disney Trip").</li>
                <li><strong>Target Amount:</strong> How much do you need total? (e.g., "$800").</li>
                <li><strong>Saved So Far:</strong> Do you already have some cash set aside? Enter it here.</li>
                <li><strong>Target Date:</strong> When do you need the money by? (e.g., "December 15th").</li>
              </ul>
            </li>
            <li><strong>The Magic Calculation:</strong> As soon as you enter a date, OmegaBudget calculates exactly how much you need to save per month to hit that goal on time.</li>
          </ol>

          <h3>2. Your Active Goals List</h3>
          <p>Once saved, your goals appear as progress cards.</p>
          <Placeholder label="Specific Savings Goal Card: Progress Bar & Monthly Requirement" />
          
          <ul style={{ lineHeight: 1.8 }}>
            <li><strong>Progress Bar:</strong> Visualizes how close you are to 100%.</li>
            <li><strong>Monthly Contribution:</strong> This is the most important number. It tells you: <em>"You must save $66/mo to afford those tires by December."</em></li>
            <li><strong>"Pay Yourself" Automation:</strong> The app automatically creates a "Bill" on your Dashboard for this monthly amount. Treat it just like your Rent or Electric bill—it is non-negotiable!</li>
          </ul>

          <h3>3. Funding Your Goals (Two Ways)</h3>
          <p>There are two ways to add money to a goal.</p>

          <h4>Method A: The Monthly "Bill" (Recommended)</h4>
          <p>
            On your Dashboard, you will see a card for your goal (e.g., "🎯 New Tires - $66"). When you physically move that money into your savings account at your bank, click the <strong>Checkmark</strong> on the dashboard card. The app marks it as "Paid" and updates your progress bar.
          </p>

          <h4>Method B: Throwing Extra Cash</h4>
          <p>Did you get a birthday gift or sell something on Marketplace? You can throw that extra cash at a goal to reach it faster.</p>
          <Placeholder label="'Quick Add' Modal for Adding Funds" />
          <ol style={{ lineHeight: 1.8 }}>
            <li>On the Savings Goals page, click the small <strong>+ (Plus)</strong> button on the goal card.</li>
            <li>Select "Throw Extra Cash" and enter the amount.</li>
            <li><strong>Result:</strong> Your "Saved So Far" goes up, and your required "Monthly Contribution" for future months goes down because you are ahead of schedule!</li>
          </ol>

          <h3>4. Editing & Priorities</h3>
          <p>Life happens. Maybe you need to raid the "Vacation Fund" to pay for a "Car Repair."</p>
          <Placeholder label="'Edit Goal' Form" />
          <ul style={{ lineHeight: 1.8 }}>
            <li><strong>Editing:</strong> Click the <strong>Pencil</strong> icon to change the Target Amount or Date. The app will instantly recalculate your new monthly payment.</li>
            <li><strong>Deleting:</strong> Click the <strong>Trash</strong> icon to remove the goal.
              <br/><em style={{ color: 'var(--red)', fontSize: '0.9rem' }}>Warning: This deletes the goal logic, but keeps the history of money you already saved as "Unassigned" cash.</em>
            </li>
          </ul>

          <h3>5. Completed Goals</h3>
          <p>When a progress bar hits 100%, celebrate!</p>
          <Placeholder label="Goal at 100% Completion with Success Badge" />
          <ul style={{ lineHeight: 1.8 }}>
            <li>The goal moves to the <strong>Completed</strong> section at the bottom.</li>
            <li>It stops generating monthly bills on your dashboard.</li>
            <li>You can now spend that money guilt-free because you planned for it.</li>
          </ul>

          <div className="tip-box" style={tipStyle}>
            <strong>Pro Tip:</strong> Create a goal called "Buffer" with no specific date. Put $50/mo into it. This acts as a "mini-emergency fund" for when you accidentally go over budget on groceries or gas!
          </div>
        </Section>

        {/* TOOLS: SIMULATIONS */}
        <Section id="tools" title="Tools & Simulations" icon={Calculator}>
          <p className="lead" style={{ fontSize: '1.2rem', marginBottom: 20 }}>
            Stop guessing and start simulating. The Tools tab is your financial sandbox. Here, you can run "What If?" scenarios to see how small changes today can drastically change your future.
          </p>
          
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 8, marginBottom: 20, borderLeft: '4px solid var(--accent)' }}>
            <strong>Note:</strong> These tools are simulations. They do not automatically move money in your bank account or change your budget. They are for planning and motivation!
          </div>

          <h3>1. The Debt Destroyer 📉</h3>
          <p>Paying off debt is hard, but seeing the finish line makes it easier. This tool proves exactly how fast you can become debt-free.</p>
          
          <Placeholder label="Debt Destroyer Interface: List of Debts & Payoff Chart" />
          
          <ul style={{ lineHeight: 1.8 }}>
            <li><strong>Add Your Debts:</strong> Enter the Name, Balance, Interest Rate (APR), and Minimum Payment for each loan or credit card. Click <strong>+ Add</strong>.</li>
            <li><strong>The "Magic Slider" (Extra Payment):</strong> Move the slider to see what happens if you add extra money to your monthly payments (e.g., $100). Watch the Green Line on the chart drop!</li>
          </ul>

          <h4>Choose Your Strategy:</h4>
          
          <Placeholder label="Debt Snowball vs Avalanche Method Diagram" />

          <ul style={{ lineHeight: 1.8, marginBottom: 20 }}>
            <li><strong>Avalanche 🏔️:</strong> Target the Highest Interest Rate first. (Mathematically saves you the most money).</li>
            <li><strong>Snowball ❄️:</strong> Target the Lowest Balance first. (Psychologically feels faster because you close accounts sooner).</li>
          </ul>
          
          <p><strong>The Result:</strong> Check the "Debt Free By" date and exactly how much Interest You Saved compared to just paying the minimums.</p>

          <h3>2. Millionaire Math 📈</h3>
          <p>Compound interest is the 8th wonder of the world. This tool helps you visualize how your money grows over time.</p>
          
          <Placeholder label="Compound Interest Chart: Principal (Blue) vs Interest (Green)" />
          
          <ul style={{ lineHeight: 1.8 }}>
            <li><strong>Inputs:</strong>
              <ul style={{ marginTop: 5, paddingLeft: 20, color: 'var(--text-dim)' }}>
                <li><em>Initial Investment:</em> How much do you have saved right now?</li>
                <li><em>Monthly Contribution:</em> How much can you save per month?</li>
                <li><em>Rate of Return:</em> 8% is standard for the S&P 500 (Stock Market). 3-4% is typical for a High-Yield Savings Account.</li>
                <li><em>Years:</em> How long will you let it grow?</li>
              </ul>
            </li>
            <li><strong>The Chart:</strong>
              <ul style={{ marginTop: 5, paddingLeft: 20, color: 'var(--text-dim)' }}>
                <li><span style={{ color: '#3b82f6', fontWeight: 600 }}>Blue Area (Principal):</span> This is the actual cash you put in.</li>
                <li><span style={{ color: '#22c55e', fontWeight: 600 }}>Green Area (Interest):</span> This is "Free Money" your money earned for you.</li>
              </ul>
            </li>
          </ul>
          <p><strong>The Lesson:</strong> Notice how after 20+ years, the Green area becomes much bigger than the Blue area. That is the power of starting early!</p>

          <h3>3. Is It Worth It? ⏳</h3>
          <p>This is a "Gut Check" calculator for impulse spending. It translates dollar signs into "Life Hours."</p>
          
          <Placeholder label="Time-Cost Calculator showing 'Hours of Work' Result" />
          
          <ol style={{ lineHeight: 1.8 }}>
            <li><strong>Enter Your Income:</strong> Select Hourly or Salary and enter your rate (e.g., "$25/hr" or "$65,000/yr").</li>
            <li><strong>Enter The Expense:</strong> What do you want to buy? (e.g., "New iPhone") and how much is it? (e.g., "$1,200").</li>
            <li><strong>The Reality Check:</strong> The tool instantly tells you: <em>"That phone will cost you 48 Hours of work."</em></li>
          </ol>
          
          <p>Ask yourself: Is this item worth sitting at my desk for an entire week (plus Monday)? If the answer is "No," don't buy it!</p>

          <div className="tip-box" style={tipStyle}>
            <strong>Pro Tip:</strong> Use the Debt Destroyer first to find extra cash, then use Millionaire Math to see what that cash could turn into if you invested it instead!
          </div>
        </Section>

        {/* REPORTS: ANALYSIS */}
        <Section id="reports" title="Financial Reports" icon={PieChart}>
          <p className="lead" style={{ fontSize: '1.2rem', marginBottom: 20 }}>
            The Reports page is your "State of the Union" address. While the Dashboard is for doing (moving money, paying bills), the Reports page is for learning. It answers the big picture questions: <em>"Are we getting ahead?"</em> and <em>"How long could we survive if we lost our jobs?"</em>
          </p>

          <h3>1. The Executive Summary (The 1-Pager)</h3>
          <p>At the top of the page, you get an instant health check of your finances for the selected month.</p>
          
          <Placeholder label="Top Hero Card: Net Cash Flow, Income, Expenses" />
          
          <ul style={{ lineHeight: 1.8 }}>
            <li><strong>Net Cash Flow:</strong> This is the most important number in the app.
              <ul style={{ marginTop: 5, paddingLeft: 20, color: 'var(--text-dim)' }}>
                <li><span style={{ color: 'var(--green)', fontWeight: 600 }}>Green (+):</span> You spent less than you earned. You are building wealth!</li>
                <li><span style={{ color: 'var(--red)', fontWeight: 600 }}>Red (-):</span> You spent more than you earned. You are burning savings or increasing debt.</li>
              </ul>
            </li>
            <li><strong>Savings Rate:</strong> The percentage of your income that you kept. (Aim for 20% or higher!).</li>
            <li><strong>Total Income vs. Expenses:</strong> A quick comparison to see the raw numbers side-by-side.</li>
          </ul>

          <h3>2. The Lifestyle Audit (Needs vs. Wants)</h3>
          <p>Ever feel like you make good money but still feel broke? This chart explains why.</p>
          
          <Placeholder label="Needs vs. Wants Pie Chart" />
          
          <Placeholder label="Needs vs Wants Budget Pie Chart Diagram" />

          <ul style={{ lineHeight: 1.8 }}>
            <li><strong>Needs (Fixed Costs):</strong> These are bills you must pay to survive (Housing, Utilities, Debt, Groceries).</li>
            <li><strong>Wants (Flexible):</strong> These are lifestyle choices (Dining Out, Hobbies, Subscriptions).</li>
          </ul>
          <p><strong>The Goal:</strong> If your "Needs" slice is huge (over 80%), your fixed costs are too high. If your "Wants" slice is huge, you can cut back to save money quickly.</p>

          <h3>3. The Trend Report (Comparison Mode)</h3>
          <p>Want to see if you did better this month than last month? Use the View Switcher in the top right.</p>
          
          <Placeholder label="View Switcher toggled to 'Comparison' & Trend Table" />
          
          <ol style={{ lineHeight: 1.8 }}>
            <li>Click the <strong>Comparison</strong> button. The view changes to show a Month-over-Month breakdown.</li>
            <li><strong>Read the Arrows:</strong>
              <ul style={{ marginTop: 5, paddingLeft: 20, color: 'var(--text-dim)' }}>
                <li><span style={{ color: 'var(--green)' }}>🔻 Green Arrow:</span> Good job! You spent less in this category than last month.</li>
                <li><span style={{ color: 'var(--red)' }}>🔺 Red Arrow:</span> Warning! You spent more. Did your electric bill spike? Did you eat out too much?</li>
              </ul>
            </li>
            <li><strong>Itemized List:</strong> See exactly which categories changed the most so you can fix the leak.</li>
          </ol>

          <h3>4. Freedom Forecast (Runway)</h3>
          <p>This is your ultimate safety net metric.</p>
          
          <Placeholder label="Freedom Forecast Card: 'Months of Runway'" />
          
          <ul style={{ lineHeight: 1.8 }}>
            <li><strong>Runway:</strong> This calculates how long you could survive without a job.</li>
            <li><strong>The Math:</strong> It takes your Total Liquid Savings (from your Savings Goals) and divides it by your Average Monthly Expenses.</li>
            <li><strong>The Goal:</strong> A healthy runway is 3-6 months. If yours says "0.5 Months," you are living on the edge!</li>
          </ul>

          <h3>5. Exporting to PDF</h3>
          <p>Need to show your budget to a spouse, a loan officer, or just want a physical copy for your records?</p>
          
          <Placeholder label="'Download PDF Report' Button" />
          
          <ul style={{ lineHeight: 1.8 }}>
            <li>Click <strong>Download PDF Report</strong> in the top right corner.</li>
            <li>The app generates a professional, printer-friendly document (white background, crisp text).</li>
            <li>It includes your Executive Summary, your "Needs vs. Wants" tables, and your Savings metrics.</li>
          </ul>

          <div className="tip-box" style={tipStyle}>
            <strong>Pro Tip:</strong> Print your Executive Summary PDF at the end of every month and put it in a binder. After a year, you will have a physical book showing your journey from "struggling" to "thriving"!
          </div>
        </Section>

        {/* SETTINGS: CONFIGURATION */}
        <Section id="settings" title="Settings & Customization" icon={Settings}>
          <p className="lead" style={{ fontSize: '1.2rem', marginBottom: 20 }}>
            The Settings page is the control room for your app's configuration. This is where you manage who is in your budget, what categories you track, and how your data is stored.
          </p>

          <h3>1. Manage Users (Household Members)</h3>
          <p>OmegaBudget is built for real life, which often involves partners, spouses, or roommates.</p>
          
          <Placeholder label="Manage Users Panel: Add/Edit Buttons" />
          
          <ul style={{ lineHeight: 1.8 }}>
            <li><strong>Add User:</strong> Click the <strong>+ Add User</strong> button to invite a spouse or partner. <br/><em style={{ color: 'var(--text-dim)' }}>Tip: Use their first name or nickname (e.g., "Alex").</em></li>
            <li><strong>Edit/Remove:</strong>
              <ul style={{ marginTop: 5, paddingLeft: 20, color: 'var(--text-dim)' }}>
                <li>Click the <strong>Pencil</strong> to rename a user.</li>
                <li>Click the <strong>Trash</strong> to remove them. <span style={{ color: 'var(--red)' }}>Warning: This un-assigns their bills, so re-assign them first!</span></li>
              </ul>
            </li>
            <li><strong>Joint Accounts:</strong> You will see a default user called "Shared" or "Joint." Use this for bills that come out of a shared bank account.</li>
          </ul>

          <h3>2. Customize Categories</h3>
          <p>Your budget, your rules. You can rename the default categories to match your life.</p>
          
          <Placeholder label="Category Customization: Rename & Color Picker" />
          
          <ul style={{ lineHeight: 1.8 }}>
            <li><strong>Rename:</strong> Don't have "Pets"? Rename it to "Hobbies" or "Kids."</li>
            <li><strong>Colors:</strong> Click the color dot to choose a new color. This color will appear on your Reports charts!</li>
            <li><strong>Hidden Categories:</strong> You can toggle visibility for categories you don't use to keep your dropdown menus clean.</li>
          </ul>

          <h3>3. Data Management (Danger Zone)</h3>
          <p>Need a fresh start?</p>
          
          <div style={{ border: '1px solid var(--red)', borderRadius: 8, padding: 15, background: 'rgba(239, 68, 68, 0.05)', marginBottom: 20 }}>
            <h4 style={{ color: 'var(--red)', margin: '0 0 10px 0' }}>⚠️ Danger Zone Actions</h4>
            <ul style={{ lineHeight: 1.8, paddingLeft: 20 }}>
              <li><strong>Clear Current Month:</strong> Wipes the current month's dashboard clean but keeps your recurring bills and history intact. Use this if you made a mess of the board and want to re-sync.</li>
              <li><strong>Factory Reset:</strong> <span style={{ fontWeight: 800 }}>WARNING!</span> This deletes everything—users, bills, history, savings goals. It returns the app to Day 1. Use with caution!</li>
            </ul>
          </div>
          
          <p><strong>Export Data:</strong> Download a raw <code>.json</code> file of your entire financial history. Great for backups or if you want to analyze your data in Excel/Python.</p>

          <h3>4. App Preferences</h3>
          <ul style={{ lineHeight: 1.8 }}>
            <li><strong>Dark Mode:</strong> Toggle between Light and Dark themes. (Dark mode is easier on the eyes for late-night budgeting!).</li>
            <li><strong>Currency:</strong> (Coming Soon) Switch between $, €, £, etc.</li>
          </ul>

          <div className="tip-box" style={tipStyle}>
            <strong>Pro Tip:</strong> If you get a new credit card, go to Manage Users and add it as a "User" (e.g., "Amex Gold"). Then you can assign bills specifically to that card to track exactly which account needs to be paid off!
          </div>
          
          {/* Extra space at the bottom for scrolling */}
          <div style={{ height: 100 }}></div>
        </Section>

      </div>
    </div>
  );
}

// Sub-components for styling
const NavButton = ({ id, active, onClick, icon: Icon, label }) => (
  <button 
    onClick={() => onClick(id)} 
    className={`nav-item ${active === id ? 'active' : ''}`} 
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      padding: '12px 16px',
      background: active === id ? 'var(--card-bg)' : 'transparent',
      border: active === id ? '1px solid var(--accent)' : '1px solid transparent',
      color: active === id ? 'var(--accent)' : 'var(--text-dim)',
      textAlign: 'left',
      cursor: 'pointer',
      borderRadius: 10,
      fontSize: '0.95rem',
      fontWeight: active === id ? 600 : 400,
      transition: 'all 0.2s'
    }}
  >
    <Icon size={18} /> {label}
  </button>
);

const tipStyle = {
  background: 'rgba(16, 185, 129, 0.1)', 
  border: '1px solid rgba(16, 185, 129, 0.3)', 
  color: '#fff', 
  padding: 15, 
  borderRadius: 8, 
  fontSize: '0.9rem', 
  marginTop: 20,
  lineHeight: 1.5
};