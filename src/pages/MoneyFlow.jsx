import React, { useState, useEffect, useMemo } from 'react';

const MoneyFlow = () => {
    // --- STATE ---
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Transaction Form State
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    const [dynamicCategories, setDynamicCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    useEffect(() => {
        fetchTransactions();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const json = await res.json();
            if (json.success) setDynamicCategories(json.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/transactions');
            const json = await res.json();
            if (json.success) setTransactions(json.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        let finalCategory = category;

        if (isAddingCategory && newCategoryName.trim()) {
            try {
                const catRes = await fetch('/api/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newCategoryName.trim(), type })
                });
                const catJson = await catRes.json();
                if (catJson.success) {
                    finalCategory = catJson.data.name;
                    setDynamicCategories([...dynamicCategories, catJson.data]);
                } else {
                    alert('Failed to add category');
                    return;
                }
            } catch (err) {
                console.error(err);
                return;
            }
        }

        if (!finalCategory) return;

        const data = {
            amount: parseFloat(amount),
            type,
            category: finalCategory,
            date,
            notes
        };

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const json = await res.json();
            if (json.success) {
                setTransactions([json.data, ...transactions]);
                setIsModalOpen(false);
                resetForm();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const resetForm = () => {
        setAmount('');
        setType('expense');
        setCategory('');
        setNewCategoryName('');
        setIsAddingCategory(false);
        setDate(new Date().toISOString().split('T')[0]);
        setNotes('');
    };

    // --- CALCULATIONS ---
    const totals = useMemo(() => {
        return transactions.reduce((acc, t) => {
            if (t.type === 'income') acc.income += t.amount;
            else acc.expense += t.amount;
            return acc;
        }, { income: 0, expense: 0 });
    }, [transactions]);

    const balance = totals.income - totals.expense;

    const categoryData = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense');
        const counts = expenses.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [transactions]);

    // --- CHART COMPONENTS ---
    const PieChart = ({ data }) => {
        if (data.length === 0) return <div className="text-slate-300 text-sm italic py-10 text-center">No data yet</div>;
        
        const total = data.reduce((sum, d) => sum + d.value, 0);
        const size = 160;
        const radius = 60;
        const strokeWidth = 24;
        const center = size / 2;
        const circumference = 2 * Math.PI * radius;
        
        let accumulatedPercent = 0;
        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

        return (
            <div className="flex flex-col items-center">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                    {data.map((d, i) => {
                        const percent = d.value / total;
                        const strokeDasharray = `${percent * circumference} ${circumference}`;
                        const rotation = accumulatedPercent * 360;
                        accumulatedPercent += percent;
                        return (
                            <circle
                                key={i} cx={center} cy={center} r={radius} fill="none" stroke={colors[i % colors.length]}
                                strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} style={{ transformOrigin: 'center', transform: `rotate(${rotation}deg)` }}
                                className="transition-all duration-500 hover:stroke-[28]"
                            />
                        );
                    })}
                </svg>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {data.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}></div>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase">{d.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-10">
            {/* Header / Summary */}
            <div className="bg-white px-6 pt-10 pb-20 rounded-b-[3rem] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative z-10 max-w-lg mx-auto">
                    <p className="text-slate-400 font-semibold uppercase tracking-widest text-[10px] mb-2">Current Balance</p>
                    <h1 className={`text-5xl font-semibold tracking-tight ${balance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                        ₹{balance.toLocaleString('en-IN')}
                    </h1>
                    
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100/50">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px]">↓</div>
                                <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Income</span>
                            </div>
                            <p className="text-xl font-semibold text-slate-900">₹{totals.income.toLocaleString()}</p>
                        </div>
                        <div className="bg-rose-50 p-4 rounded-3xl border border-rose-100/50">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-white text-[10px]">↑</div>
                                <span className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider">Expense</span>
                            </div>
                            <p className="text-xl font-semibold text-slate-900">₹{totals.expense.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="max-w-lg mx-auto px-6 -mt-12 relative z-20 space-y-8">
                {/* Chart Card */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50">
                    <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                        Spending Analysis
                    </h3>
                    <PieChart data={categoryData} />
                </div>

                {/* Transactions List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-semibold text-slate-900 text-lg uppercase tracking-tight">Recent Activity</h3>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase italic">Timeline</span>
                    </div>

                    <div className="space-y-3">
                        {transactions.map((t) => (
                            <div key={t._id} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between hover:shadow-md transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {t.type === 'income' ? '💰' : '💸'}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800 leading-tight">{t.category}</h4>
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{new Date(t.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-semibold text-lg ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                    </p>
                                    {t.notes && <p className="text-[9px] text-slate-400 truncate max-w-[80px] italic">{t.notes}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Add Button */}
            <button 
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-24 right-6 w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
            >
                <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-20 group-hover:block hidden"></div>
                <svg className="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
            </button>

            {/* Transaction Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] flex items-end sm:items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-semibold text-slate-900 mb-8 uppercase tracking-tighter">Add Money Flow</h3>
                        
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                                <button type="button" onClick={() => setType('income')} className={`flex-1 py-3 rounded-xl font-semibold transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Income</button>
                                <button type="button" onClick={() => setType('expense')} className={`flex-1 py-3 rounded-xl font-semibold transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}>Expense</button>
                            </div>

                            <div className="space-y-4">
                                <input autoFocus type="number" placeholder="₹ Amount" value={amount} onChange={e => setAmount(e.target.value)} 
                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-2xl font-semibold placeholder-slate-300 focus:ring-2 focus:ring-blue-600" />
                                
                                <div className="space-y-3">
                                    {!isAddingCategory ? (
                                        <div className="relative">
                                            <select 
                                                value={category} 
                                                onChange={e => {
                                                    if (e.target.value === 'ADD_NEW') {
                                                        setIsAddingCategory(true);
                                                        setCategory('');
                                                    } else {
                                                        setCategory(e.target.value);
                                                    }
                                                }}
                                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-semibold text-slate-700 focus:ring-2 focus:ring-blue-600 appearance-none"
                                            >
                                                <option value="">{dynamicCategories.filter(c => c.type === type).length === 0 ? 'No categories added yet' : 'Select Category'}</option>
                                                {dynamicCategories.filter(c => c.type === type).map(c => (
                                                    <option key={c._id} value={c.name}>{c.name}</option>
                                                ))}
                                                <option value="ADD_NEW" className="text-blue-600 font-semibold">+ Add New Category</option>
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative animate-in zoom-in-95 duration-200">
                                            <input 
                                                autoFocus
                                                type="text" 
                                                placeholder="Enter Category Name" 
                                                value={newCategoryName} 
                                                onChange={e => setNewCategoryName(e.target.value)}
                                                className="w-full bg-blue-50 border-none rounded-2xl px-6 py-4 font-semibold text-blue-700 placeholder-blue-300 focus:ring-2 focus:ring-blue-600" 
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => { setIsAddingCategory(false); setNewCategoryName(''); }}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 p-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-semibold text-slate-700 focus:ring-2 focus:ring-blue-600" />
                                
                                <input type="text" placeholder="Notes (Optional)" value={notes} onChange={e => setNotes(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-semibold text-slate-700 focus:ring-2 focus:ring-blue-600" />
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white rounded-2xl py-4 font-semibold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">
                                Save Transaction
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MoneyFlow;
