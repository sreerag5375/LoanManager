import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Keypad from '../components/Keypad';

const LoanDashboard = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('active'); // 'active' or 'closed'
    const [isSaving, setIsSaving] = useState(false);

    const [loanName, setLoanName] = useState('');
    const [loanAmount, setLoanAmount] = useState('0');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingLoan, setEditingLoan] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingLoan, setDeletingLoan] = useState(null);

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/loans');
            const json = await res.json();
            if (json.success) {
                setLoans(json.data);
            } else {
                setError(json.error);
            }
        } catch (err) {
            setError('Failed to load loans');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- KEYPAD LOGIC ---
    const handleNumber = (n) => {
        setLoanAmount(prev => {
            if (prev === '0' && n !== '.') return n;
            if (n === '.' && prev.includes('.')) return prev;
            return prev + n;
        });
    };
    const handleDelete = () => {
        setLoanAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    };

    // --- LOGIC & CALCULATIONS ---
    const activeLoans = useMemo(() => loans.filter(l => (l.status || 'active') === 'active'), [loans]);
    const closedLoans = useMemo(() => loans.filter(l => l.status === 'closed'), [loans]);
    
    const displayLoans = useMemo(() => {
        const list = view === 'active' ? activeLoans : closedLoans;
        return [...list].sort((a, b) => b.amount - a.amount);
    }, [view, activeLoans, closedLoans]);

    const totalActiveAmount = useMemo(() => activeLoans.reduce((sum, loan) => sum + loan.amount, 0), [activeLoans]);
    const totalClosedAmount = useMemo(() => closedLoans.reduce((sum, loan) => sum + loan.amount, 0), [closedLoans]);

    const smallestLoan = useMemo(() => {
        if (activeLoans.length === 0) return null;
        return [...activeLoans].sort((a, b) => a.amount - b.amount)[0];
    }, [activeLoans]);

    const getCategoryStyle = (name) => {
        const n = name.toLowerCase();
        if (n.includes('card') || n.includes('cred')) return { icon: '💳', bg: 'bg-indigo-50', text: 'text-indigo-600' };
        if (n.includes('home') || n.includes('house')) return { icon: '🏠', bg: 'bg-emerald-50', text: 'text-emerald-600' };
        if (n.includes('car') || n.includes('auto')) return { icon: '🚗', bg: 'bg-blue-50', text: 'text-blue-600' };
        if (n.includes('edu') || n.includes('school')) return { icon: '🎓', bg: 'bg-violet-50', text: 'text-violet-600' };
        return { icon: '💸', bg: 'bg-slate-50', text: 'text-slate-600' };
    };

    const saveLoan = async (e) => {
        e?.preventDefault();
        if (isSaving || !loanName.trim() || parseFloat(loanAmount) <= 0) return;
        
        const loanData = { name: loanName.trim(), amount: parseFloat(loanAmount), status: 'active' };
        
        try {
            setIsSaving(true);
            if (isEditMode && editingLoan) {
                const res = await fetch(`/api/loans?id=${editingLoan._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loanData)
                });
                const json = await res.json();
                if (json.success) {
                    setLoans(loans.map(loan => loan._id === editingLoan._id ? json.data : loan));
                }
            } else {
                const res = await fetch('/api/loans', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loanData)
                });
                const json = await res.json();
                if (json.success) {
                    setLoans([json.data, ...loans]);
                }
            }
            setTimeout(() => {
                closeModal();
                setIsSaving(false);
            }, 600);
        } catch (err) {
            console.error('Error saving loan:', err);
            setIsSaving(false);
            alert('Failed to save loan');
        }
    };

    const closeLoan = async (loanId) => {
        try {
            setIsSaving(true);
            const res = await fetch(`/api/loans?id=${loanId}`, {
                method: 'DELETE'
            });
            const json = await res.json();
            if (json.success) {
                setLoans(loans.map(loan => loan._id === loanId ? { ...loan, status: 'closed' } : loan));
                setTimeout(() => {
                    setShowDeleteConfirm(false);
                    setDeletingLoan(null);
                    setView('active'); // Return home
                    setIsSaving(false);
                }, 800);
            }
        } catch (err) {
            console.error('Error closing loan:', err);
            setIsSaving(false);
            alert('Failed to close loan');
        }
    };

    const closeModal = () => { 
        setLoanName(''); 
        setLoanAmount('0'); 
        setIsModalOpen(false); 
        setIsEditMode(false); 
        setEditingLoan(null); 
    };

    return (
        <div className="min-h-screen pb-32 pt-12 px-6 max-w-md mx-auto">
            {/* 1. Header Balance */}
            <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-3 leading-none">
                    {view === 'active' ? 'Total Liability' : 'Total Paid Off'}
                </p>
                <h1 className={`text-5xl font-extrabold tracking-tight tabular-nums mb-8 ${view === 'active' ? 'text-red-500' : 'text-emerald-500'}`}>
                    ₹{(view === 'active' ? totalActiveAmount : totalClosedAmount).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </h1>
                <div className="flex justify-center">
                    <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-white shadow-xl animate-float transition-all duration-500 ${view === 'active' ? 'bg-slate-900 shadow-slate-200' : 'bg-emerald-600 shadow-emerald-200'}`}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={view === 'active' ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                        </svg>
                    </div>
                </div>
            </div>

            {/* 2. Action Bar */}
            <div className="flex justify-between items-center mb-12 bg-white/60 backdrop-blur-xl p-4 rounded-[2.5rem] border border-white/50 shadow-sm">
                <button onClick={() => { setIsEditMode(false); setIsModalOpen(true); }} className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center text-white transition-all active:scale-90">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">New debt</span>
                </button>
                
                <button onClick={() => setView(view === 'active' ? 'closed' : 'active')} className="flex flex-col items-center gap-2 flex-1 border-x border-slate-100">
                    <div className={`w-12 h-12 rounded-2xl shadow-sm border flex items-center justify-center transition-all active:scale-90 ${view === 'closed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-white border-slate-100 text-slate-400'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${view === 'closed' ? 'text-emerald-600' : 'text-slate-400'}`}>Closed</span>
                </button>

                <button onClick={() => navigate('/')} className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-600 transition-all active:scale-90">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Dashboard</span>
                </button>
            </div>

            {/* 3. Debt Breakdown List */}
            <div className="mb-12">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        {view === 'active' ? 'Active Tracking' : 'Paid History'}
                    </h3>
                    <div className="flex-1 ml-4 h-px bg-slate-100"></div>
                </div>
                <div className="space-y-1.5">
                    {displayLoans.map((loan) => {
                        const style = getCategoryStyle(loan.name);
                        return (
                            <div key={loan._id} onClick={() => { setIsEditMode(true); setEditingLoan(loan); setLoanName(loan.name); setLoanAmount(loan.amount.toString()); setIsModalOpen(true); }}
                                className="list-item-clean group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl ${style.bg} flex items-center justify-center text-xl`}>
                                        {view === 'closed' ? '✨' : style.icon}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-sm tracking-tight leading-tight ${view === 'closed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{loan.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{view === 'active' ? 'Ongoing record' : 'Success cleared'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold text-sm tabular-nums ${view === 'active' ? 'text-red-500' : 'text-slate-400 font-normal'}`}>₹{loan.amount.toLocaleString()}</p>
                                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter opacity-80">
                                        {view === 'active' ? `${((loan.amount / totalActiveAmount) * 100).toFixed(0)}% Weight` : 'PAID OFF'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    {displayLoans.length === 0 && (
                        <div className="py-24 text-center animate-in fade-in duration-1000">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">{view === 'active' ? 'No active debts found' : 'No records archived'}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 4. Strategy Card */}
            {view === 'active' && smallestLoan && (
                <div className="card-clean bg-slate-900 border-none relative overflow-hidden group mb-12 shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[60px] opacity-25 -mr-16 -mt-16 group-hover:blur-[80px] transition-all"></div>
                    <div className="relative z-10">
                        <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3 opacity-60 text-left">Snowball Strategy</h4>
                        <div className="flex items-end justify-between">
                            <div>
                                <h3 className="text-white text-2xl font-bold tracking-tight leading-none mb-1">{smallestLoan.name}</h3>
                                <p className="text-slate-400 text-[10px] font-bold italic tracking-wide uppercase opacity-70">Focus on smallest first</p>
                            </div>
                            <div className="text-right">
                                <p className="text-blue-400 text-2xl font-extrabold tabular-nums leading-none mb-1">₹{smallestLoan.amount.toLocaleString()}</p>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">Current Target</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. Add/Edit Liability Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-white z-[150] animate-in slide-in-from-bottom duration-500 overflow-y-auto no-scrollbar">
                   <div className="max-w-md mx-auto px-6 pt-12 pb-8 h-full min-h-screen flex flex-col">
                        <div className="flex items-center justify-between mb-16">
                            <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 transition-all active:scale-90">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[10px]">{isEditMode ? 'Modify record' : 'Attach Liability'}</h3>
                            {isEditMode && editingLoan.status !== 'closed' ? (
                                <button onClick={() => { setDeletingLoan(editingLoan); setShowDeleteConfirm(true); }} className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 text-red-500 transition-all active:scale-90">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            ) : (
                                <div className="w-10 h-10"></div>
                            )}
                        </div>

                        <div className="text-center mb-16">
                            <input autoFocus type="text" placeholder="Loan source name" value={loanName} onChange={e => setLoanName(e.target.value)}
                                className="w-full bg-transparent border-none text-center text-xl font-bold text-slate-700 placeholder-slate-300 focus:ring-0 mb-6 uppercase tracking-[0.2em]" />
                            <h2 className="text-7xl font-extrabold text-slate-900 tracking-tighter tabular-nums flex items-baseline justify-center">
                                <span className="text-2xl text-slate-400 mr-1">₹</span>
                                {loanAmount}
                            </h2>
                        </div>

                        <div className="flex-1"></div>

                        <Keypad onNumber={handleNumber} onDelete={handleDelete} />

                        <div className="mt-12">
                            <button onClick={saveLoan} disabled={isSaving} className="w-full bg-slate-900 text-white rounded-3xl py-6 font-bold text-lg hover:shadow-2xl active:scale-95 transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                                {isSaving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    isEditMode ? 'Update' : 'Commit'
                                )}
                            </button>
                        </div>
                   </div>
                </div>
            )}

            {/* 6. Soft-Delete Confirmation */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-6 z-[200]" onClick={() => !isSaving && setShowDeleteConfirm(false)}>
                    <div className="bg-white rounded-[3rem] p-12 max-w-xs w-full text-center shadow-3xl animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            {isSaving ? (
                                <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            )}
                        </div>
                        <h4 className="font-extrabold text-2xl text-slate-900 mb-2 leading-tight uppercase tracking-tight">Debt Paid?</h4>
                        <p className="text-slate-500 text-sm mb-10 leading-relaxed font-bold opacity-80 uppercase tracking-tighter italic">This will mark the debt as fully cleared.</p>
                        <div className="flex flex-col gap-4">
                            <button onClick={() => closeLoan(deletingLoan?._id)} disabled={isSaving} className="w-full py-5 rounded-2xl font-extrabold bg-emerald-600 text-white shadow-2xl shadow-emerald-400/30 uppercase tracking-[0.2em] text-xs transition-transform active:scale-95 flex items-center justify-center gap-3">
                                {isSaving ? 'Clearing...' : 'Yes, Paid'}
                            </button>
                            <button onClick={() => setShowDeleteConfirm(false)} disabled={isSaving} className="w-full py-5 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 uppercase tracking-[0.2em] text-[10px]">Still Active</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanDashboard;
