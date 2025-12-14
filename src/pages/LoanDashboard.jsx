import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Font & Custom Styles ---
const FontStyles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    body {
      font-family: 'Inter', sans-serif;
    }

    .chart-segment {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
    }
    .chart-segment:hover {
      opacity: 0.9;
      stroke-width: 24;
    }
    .chart-animate {
      animation: dash 1s ease-out forwards;
    }
    @keyframes dash {
      from { stroke-dashoffset: 1000; }
      to { stroke-dashoffset: 0; }
    }
    
    .progress-circle {
      transition: stroke-dashoffset 0.5s ease-in-out;
    }
  `}</style>
);

const LoanDashboard = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [loans, setLoans] = useState([
        { id: 1, name: 'One card Loan', amount: 12889 },
        { id: 2, name: 'Fed Credit card', amount: 41300 },
        { id: 3, name: 'ICICI Credit card', amount: 19950 },
        { id: 4, name: 'Mannarkkad loan', amount: 15400 },
        { id: 5, name: 'Cred Loan 1', amount: 21885 },
        { id: 6, name: 'Cred Loan 2', amount: 54726 },
        { id: 7, name: 'Education Loan', amount: 140000 },
        { id: 8, name: 'Marriage Loan', amount: 332500 },
        { id: 9, name: 'Kummatti fund', amount: 3000 },
        { id: 10, name: 'Kudumbasree loan', amount: 23800 }
    ]);

    const [loanName, setLoanName] = useState('');
    const [loanAmount, setLoanAmount] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingLoan, setEditingLoan] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingLoan, setDeletingLoan] = useState(null);
    const [selectedSegment, setSelectedSegment] = useState(null);

    // --- LOGIC & CALCULATIONS ---
    const sortedLoans = useMemo(() => [...loans].sort((a, b) => a.amount - b.amount), [loans]);
    const totalAmount = useMemo(() => loans.reduce((sum, loan) => sum + loan.amount, 0), [loans]);
    const priorityLoans = useMemo(() => sortedLoans.slice(0, 3), [sortedLoans]);

    // Chart Calculations
    const chartSegments = useMemo(() => {
        if (totalAmount === 0) return [];
        let accumulatedPercent = 0;
        const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1', '#84cc16'];

        return sortedLoans.map((loan, index) => {
            const percent = loan.amount / totalAmount;
            const start = accumulatedPercent;
            accumulatedPercent += percent;
            return { ...loan, percent, start, color: colors[index % colors.length] };
        });
    }, [sortedLoans, totalAmount]);

    const getCategoryStyle = (name) => {
        const n = name.toLowerCase();
        if (n.includes('card') || n.includes('cred')) return { icon: '💳', bg: 'bg-purple-50', text: 'text-purple-600' };
        if (n.includes('home') || n.includes('house')) return { icon: '🏠', bg: 'bg-blue-50', text: 'text-blue-600' };
        if (n.includes('car') || n.includes('auto')) return { icon: '🚗', bg: 'bg-indigo-50', text: 'text-indigo-600' };
        if (n.includes('edu') || n.includes('school')) return { icon: '🎓', bg: 'bg-green-50', text: 'text-green-600' };
        if (n.includes('marriage') || n.includes('wedding')) return { icon: '💍', bg: 'bg-pink-50', text: 'text-pink-600' };
        if (n.includes('food') || n.includes('grocery')) return { icon: '🛒', bg: 'bg-yellow-50', text: 'text-yellow-600' };
        return { icon: '💸', bg: 'bg-slate-50', text: 'text-slate-600' };
    };

    // --- CRUD FUNCTIONS ---
    const saveLoan = (e) => {
        e.preventDefault();
        if (!loanName.trim() || !loanAmount || parseFloat(loanAmount) <= 0) return;
        if (isEditMode && editingLoan) {
            setLoans(loans.map(loan => loan.id === editingLoan.id ? { ...loan, name: loanName.trim(), amount: parseFloat(loanAmount) } : loan));
        } else {
            setLoans([...loans, { id: Date.now(), name: loanName.trim(), amount: parseFloat(loanAmount) }]);
        }
        closeModal();
    };

    const deleteLoan = (loanId) => {
        setLoans(loans.filter(loan => loan.id !== loanId));
        setShowDeleteConfirm(false);
        setDeletingLoan(null);
    };

    const closeModal = () => { setLoanName(''); setLoanAmount(''); setIsModalOpen(false); setIsEditMode(false); setEditingLoan(null); };

    // --- MAIN CHART COMPONENT ---
    const InteractiveDonutChart = () => {
        const size = 280;
        const strokeWidth = 22;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        let rotationAccumulator = 0;

        return (
            <div className="relative flex items-center justify-center">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 drop-shadow-2xl">
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
                    {chartSegments.map((segment) => {
                        const strokeDasharray = `${segment.percent * circumference} ${circumference}`;
                        const rotation = rotationAccumulator * 360;
                        rotationAccumulator += segment.percent;
                        return (
                            <circle
                                key={segment.id} cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke={segment.color} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} strokeDashoffset={0} className="chart-segment chart-animate"
                                style={{ transformOrigin: 'center', transform: `rotate(${rotation}deg)` }}
                                onClick={(e) => { e.stopPropagation(); setSelectedSegment(selectedSegment?.id === segment.id ? null : segment); }}
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center animate-in fade-in duration-500">
                    {selectedSegment ? (
                        <>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-widest">{selectedSegment.name}</p>
                            <h3 className="text-3xl font-extrabold text-slate-800" style={{ color: selectedSegment.color }}>₹{(selectedSegment.amount / 1000).toFixed(1)}k</h3>
                            <p className="text-xs font-medium text-slate-400 mt-1">{((selectedSegment.amount / totalAmount) * 100).toFixed(1)}% of total</p>
                        </>
                    ) : (
                        <>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-widest">Total Due</p>
                            <h3 className="text-4xl font-extrabold text-slate-800">₹{(totalAmount / 1000).toFixed(0)}k</h3>
                            <p className="text-xs font-medium text-slate-400 mt-1">Tap chart for details</p>
                        </>
                    )}
                </div>
            </div>
        );
    };

    // --- RESPONSIVE PRIORITY LOAN CIRCLE ---
    const LoanCircle = ({ loan, index, isFirst }) => {
        // We use a fixed viewBox coordinate system (200x200) so SVG scales purely via CSS width/height
        const viewBoxSize = 200;
        const strokeWidth = 16;
        const radius = (viewBoxSize - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const percent = loan.amount / totalAmount;
        const strokeDashoffset = circumference - (percent * circumference);
        const color = isFirst ? '#2563eb' : '#8b5cf6';

        return (
            <div
                onClick={(e) => { e.stopPropagation(); setIsEditMode(true); setEditingLoan(loan); setLoanName(loan.name); setLoanAmount(loan.amount); setIsModalOpen(true); }}
                className="relative flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group hover:-translate-y-2 w-full"
            >
                {/* Rank Badge */}
                <div className={`mb-2 sm:mb-4 px-2 sm:px-4 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isFirst ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                    #{index + 1}
                </div>

                {/* Circular Progress Container - Responsive Width */}
                <div className="relative w-full max-w-[90px] sm:max-w-[180px] aspect-square">
                    <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="transform -rotate-90 w-full h-full">
                        {/* Background Circle */}
                        <circle cx={viewBoxSize / 2} cy={viewBoxSize / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
                        {/* Progress Circle */}
                        <circle
                            cx={viewBoxSize / 2} cy={viewBoxSize / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
                            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                            className="progress-circle drop-shadow-sm"
                        />
                    </svg>

                    {/* Center Text - Responsive Typography */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 sm:p-4">
                        <p className="text-slate-500 font-medium text-[9px] sm:text-sm mb-0 sm:mb-1 truncate w-full px-1">{loan.name}</p>
                        <h3 className="text-xs sm:text-2xl font-black text-slate-900 leading-tight">₹{(loan.amount / 1000).toFixed(1)}k</h3>
                        <p className="text-[8px] sm:text-xs font-bold text-slate-400 mt-0.5 sm:mt-1">
                            {(percent * 100).toFixed(0)}%
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800 pb-24" onClick={() => setSelectedSegment(null)}>
            <FontStyles />

            {/* --- TOP SECTION --- */}
            <div className="bg-blue-50 pb-12 rounded-b-[3rem] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <nav className="px-6 py-6 flex items-center justify-between max-w-5xl mx-auto relative z-10">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 cursor-pointer hover:bg-blue-700 transition-colors hover:scale-105 active:scale-95"
                            onClick={() => navigate('/vision-board')}
                            title="View Vision Board"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        </div>
                        <h1 className="font-extrabold text-2xl text-slate-900 tracking-tight">DebtDash</h1>
                    </div>
                </nav>

                <div className="max-w-5xl mx-auto px-6 mt-4">
                    <div className="flex flex-col-reverse md:flex-row items-center justify-center md:justify-between gap-12">
                        <div className="text-center md:text-left flex-1 relative z-10">
                            <p className="text-slate-500 font-medium mb-2 uppercase tracking-wider text-xs">Total Liability</p>
                            <h2 className="text-6xl font-black text-slate-900 tracking-tight mb-6">₹{totalAmount.toLocaleString('en-IN')}</h2>
                            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white/50 px-4 py-2.5 rounded-full shadow-sm">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                </span>
                                <span className="text-sm font-bold text-slate-700">{loans.length} Active Accounts</span>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <InteractiveDonutChart />
                        </div>
                    </div>
                </div>
            </div>

            <br /><br /><br />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-20 space-y-12">

                {/* --- PRIORITY LOAN CIRCLES SECTION --- */}
                {priorityLoans.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-6 px-2">
                            <h3 className="font-semibold text-slate-900 text-xl mb-4">Snowball Focus</h3>
                            <div className="h-px bg-slate-100 flex-1"></div>
                        </div>

                        {/* 3 Columns on ALL screens (grid-cols-3) to force single row on mobile */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-8 justify-items-center">
                            {priorityLoans.map((loan, idx) => (
                                <LoanCircle key={loan.id} loan={loan} index={idx} isFirst={idx === 0} />
                            ))}
                        </div>
                    </section>
                )}

                <br /><br />

                {/* --- ALL LOANS LIST --- */}
                <section>
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <h3 className="font-semibold text-slate-900 text-xl">Detailed Breakdown</h3>
                        <div className="h-px bg-slate-100 flex-1"></div>
                    </div>
                    <br />

                    <div className="flex flex-col gap-4">
                        {sortedLoans.map((loan) => {
                            const style = getCategoryStyle(loan.name);
                            const segment = chartSegments.find(s => s.id === loan.id);
                            return (
                                <div key={loan.id} onClick={(e) => { e.stopPropagation(); setIsEditMode(true); setEditingLoan(loan); setLoanName(loan.name); setLoanAmount(loan.amount); setIsModalOpen(true); }}
                                    className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl ${style.bg} flex items-center justify-center text-xl transition-transform group-hover:scale-110`}>
                                            {style.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-700 text-lg">{loan.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: segment?.color }}></div>
                                                <span className="text-xs text-slate-400 font-medium">{((loan.amount / totalAmount) * 100).toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900 text-xl">₹{loan.amount.toLocaleString()}</p>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="bg-slate-50 p-5 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-between mt-2">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center text-xl text-slate-500">∑</div>
                                <span className="font-bold text-slate-500 text-lg uppercase tracking-wider">Total Outstanding</span>
                            </div>
                            <p className="font-black text-slate-900 text-2xl">₹{totalAmount.toLocaleString()}</p>
                        </div>
                    </div>
                </section>
            </div>

            {/* --- ADD BUTTON --- */}
            <button onClick={(e) => { e.stopPropagation(); setIsEditMode(false); setIsModalOpen(true); }} className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-4 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all z-50 group">
                <svg className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>

            {/* --- MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-[60]" onClick={closeModal}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-extrabold text-slate-900 mb-6">{isEditMode ? 'Edit Loan' : 'Add New Loan'}</h3>
                        <input autoFocus className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 mb-4 font-semibold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500" placeholder="Loan Name" value={loanName} onChange={e => setLoanName(e.target.value)} />
                        <input type="number" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 mb-6 font-bold text-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500" placeholder="₹ Amount" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} />
                        <div className="flex gap-3">
                            {isEditMode && (<button onClick={() => { setDeletingLoan(editingLoan); setShowDeleteConfirm(true); setIsModalOpen(false); }} className="px-4 py-3 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100 transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>)}
                            <button onClick={saveLoan} className="flex-1 bg-blue-600 text-white rounded-xl font-bold py-3 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-[70]" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="bg-white rounded-3xl p-8 max-w-xs w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
                        <p className="font-bold text-lg mb-2">Delete this loan?</p>
                        <p className="text-slate-500 mb-6">This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
                            <button onClick={() => deleteLoan(deletingLoan?.id)} className="flex-1 py-2 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanDashboard;
