import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, BarChart } from '../components/Charts';
import Keypad from '../components/Keypad';

const MoneyFlow = () => {
    // --- STATE ---
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Transaction Form State
    const [amount, setAmount] = useState('0');
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
        e?.preventDefault();
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

        if (!finalCategory || parseFloat(amount) <= 0) {
            alert('Please select a category and enter an amount');
            return;
        }

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
        setAmount('0');
        setType('expense');
        setCategory('');
        setNewCategoryName('');
        setIsAddingCategory(false);
        setDate(new Date().toISOString().split('T')[0]);
        setNotes('');
    };

    // --- KEYPAD LOGIC ---
    const handleNumber = (n) => {
        setAmount(prev => {
            if (prev === '0' && n !== '.') return n;
            if (n === '.' && prev.includes('.')) return prev;
            return prev + n;
        });
    };
    const handleDelete = () => {
        setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    };

    // --- DATE FILTERING ---
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        setCurrentPage(1); // Reset page when month changes
    }, [selectedDate]);

    const availableMonths = useMemo(() => {
        const months = [];
        const startYear = 2026;
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // If we are in 2026 or later, start from Jan 2026
        if (currentYear >= startYear) {
            const endMonth = currentYear > startYear ? 11 : currentMonth;
            for (let m = 0; m <= endMonth; m++) {
                months.push(new Date(startYear, m, 1));
            }
        }
        return months;
    }, []);

    // --- CALCULATIONS ---
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === selectedDate.getMonth() &&
                d.getFullYear() === selectedDate.getFullYear();
        });
    }, [transactions, selectedDate]);

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

    const paginatedTransactions = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredTransactions, currentPage]);

    const monthTotals = useMemo(() => {
        return filteredTransactions.reduce((acc, t) => {
            if (t.type === 'income') acc.income += t.amount;
            else acc.expense += t.amount;
            return acc;
        }, { income: 0, expense: 0 });
    }, [filteredTransactions]);

    const overallTotals = useMemo(() => {
        return transactions.reduce((acc, t) => {
            if (t.type === 'income') acc.income += t.amount;
            else acc.expense += t.amount;
            return acc;
        }, { income: 0, expense: 0 });
    }, [transactions]);

    const overallBalance = overallTotals.income - overallTotals.expense;

    // --- VIEW MODE & CHART DATA ---
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'chart'
    const [isGraphLoading, setIsGraphLoading] = useState(false);

    useEffect(() => {
        if (viewMode === 'chart') {
            setIsGraphLoading(true);
            const timer = setTimeout(() => setIsGraphLoading(false), 400);
            return () => clearTimeout(timer);
        }
    }, [selectedDate, viewMode]);

    const chartData = useMemo(() => {
        const expenseMap = {};
        const incomeMap = {};
        let totalExpense = 0;
        let totalIncome = 0;

        filteredTransactions.forEach(t => {
            if (t.type === 'expense') {
                expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount;
                totalExpense += t.amount;
            } else {
                incomeMap[t.category] = (incomeMap[t.category] || 0) + t.amount;
                totalIncome += t.amount;
            }
        });

        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#64748b'];
        const expenseData = Object.entries(expenseMap).map(([label, value], i) => ({
            label, value, color: colors[i % colors.length]
        })).sort((a, b) => b.value - a.value);

        const incomeData = Object.entries(incomeMap).map(([label, value], i) => ({
            label, value, color: colors[i % colors.length]
        })).sort((a, b) => b.value - a.value);

        return { expenseData, incomeData, totalExpense, totalIncome };
    }, [filteredTransactions]);

    return (
        <div className="min-h-screen pb-32 pt-12 px-6 max-w-md mx-auto overflow-x-hidden">
            {/* 1. Centered Balance Section */}
            <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                <p className="text-slate-400 font-semibold uppercase tracking-[0.2em] text-[10px] mb-3">Total Balance</p>
                <h1 className={`text-4xl font-semibold tracking-tight tabular-nums mb-8 ${overallBalance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                    ₹{overallBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h1>

                {/* Month Summary Boxes */}
                <div className="grid grid-cols-2 gap-4 px-2">
                    <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-[2rem] p-5 text-left">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-[0.1em]">Income</span>
                        </div>
                        <p className="text-xl font-semibold text-emerald-900 tabular-nums tracking-tight">₹{monthTotals.income.toLocaleString()}</p>
                    </div>
                    <div className="bg-red-50/50 border border-red-100/50 rounded-[2rem] p-5 text-left">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-100">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                            </div>
                            <span className="text-[10px] font-semibold text-red-600 uppercase tracking-[0.1em]">Expense</span>
                        </div>
                        <p className="text-xl font-semibold text-red-900 tabular-nums tracking-tight">₹{monthTotals.expense.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* 2. Action Bar */}
            <div className="flex justify-between items-center mb-10 px-2">
                <button onClick={() => { setType('income'); setIsModalOpen(true); }} className="btn-action-round group">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center text-white transition-all group-active:scale-90 group-active:bg-blue-700">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Income</span>
                </button>
                <button onClick={() => { setType('expense'); setIsModalOpen(true); }} className="btn-action-round group">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center text-white transition-all group-active:scale-90 group-active:bg-blue-700">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Expense</span>
                </button>
                <button onClick={() => setViewMode(viewMode === 'list' ? 'chart' : 'list')} className="btn-action-round group">
                    <div className={`w-14 h-14 rounded-2xl shadow-lg border flex items-center justify-center transition-all duration-300 group-active:scale-90 ${viewMode === 'chart' ? 'bg-slate-900 text-white border-slate-900 shadow-slate-200' : 'bg-blue-600 text-white border-transparent shadow-blue-200'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                    </div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider transition-colors ${viewMode === 'chart' ? 'text-slate-900' : 'text-slate-500'}`}>Dashboard</span>
                </button>
                <button className="btn-action-round group opacity-50 cursor-not-allowed">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center text-white">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Invest</span>
                </button>
            </div>

            {/* 3. Month Selector (Replaces Quick Categories) */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">History</h3>
                    <div className="w-6 h-px bg-slate-100"></div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
                    {availableMonths.map((m, i) => {
                        const isActive = m.getMonth() === selectedDate.getMonth() && m.getFullYear() === selectedDate.getFullYear();
                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedDate(m)}
                                className={`
                                    flex-shrink-0 px-6 py-3 rounded-2xl text-xs font-semibold transition-all duration-300
                                    ${isActive ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'}
                                `}
                            >
                                {m.toLocaleDateString(undefined, { month: 'short' })}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 4. Filtered Transactions (With Pagination) */}
            <div className="animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-sm font-semibold text-slate-900">
                        {selectedDate.toLocaleDateString(undefined, { month: 'long' })} Activities
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Page {currentPage} of {totalPages || 1}</span>
                    </div>
                </div>
                <div className="space-y-1 mb-8">
                    {paginatedTransactions.map((t) => (
                        <div key={t._id} className="list-item-clean">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {t.type === 'income' ? '💰' : '💸'}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800 text-sm leading-tight">{t.category}</h4>
                                    <p className="text-[10px] text-slate-400 font-medium">{new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                </div>
                            </div>
                            <p className={`font-semibold text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                {t.type === 'income' ? '+' : ''}₹{t.amount.toLocaleString()}
                            </p>
                        </div>
                    ))}
                    {paginatedTransactions.length === 0 && (
                        <div className="py-12 text-center">
                            <p className="text-slate-300 text-sm italic">No records for this month</p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 pb-8">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div className="flex gap-1.5">
                            {[...Array(totalPages)].map((_, i) => (
                                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentPage === i + 1 ? 'bg-blue-600 w-4' : 'bg-slate-200'}`}></div>
                            ))}
                        </div>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                )}
            </div>

            {/* 5. Graphical Dashboard (Full-Screen Overlay) */}
            {viewMode === 'chart' && (
                <div className="fixed inset-0 bg-white z-[120] animate-in slide-in-from-right duration-500 overflow-y-auto no-scrollbar">
                    <div className="max-w-md mx-auto px-6 pt-12 pb-20">
                        <header className="flex items-center justify-between mb-8">
                            <button onClick={() => setViewMode('list')} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 active:scale-90 transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <h3 className="font-semibold text-slate-900 uppercase tracking-widest text-xs">Graphical Insights</h3>
                            <div className="w-10 h-10"></div>
                        </header>

                        {/* Dashboard Month Switcher (Choice Chips) */}
                        <div className="mb-10 bg-slate-50/50 p-2 rounded-[2rem] border border-slate-100/50">
                            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                                {availableMonths.map((m, i) => {
                                    const isActive = m.getMonth() === selectedDate.getMonth() && m.getFullYear() === selectedDate.getFullYear();
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedDate(m)}
                                            className={`
                                                flex-shrink-0 px-6 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300
                                                ${isActive ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 scale-105' : 'bg-white text-slate-400 hover:text-slate-600'}
                                            `}
                                        >
                                            {m.toLocaleDateString(undefined, { month: 'short' })}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <section className={`space-y-12 transition-all duration-300 ${isGraphLoading ? 'opacity-30 blur-[2px]' : 'opacity-100 blur-0'}`}>
                            {/* Expense Pie */}
                            <div>
                                <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-6 px-2">Month Expense Breakdown</h3>
                                <div className="card-clean py-10 shadow-xl shadow-slate-100">
                                    <PieChart data={chartData.expenseData} total={chartData.totalExpense} />
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 mt-12 px-2">
                                        {chartData.expenseData.slice(0, 4).map((item, i) => (
                                            <div key={i} className="flex flex-col items-start text-left">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate w-20">{item.label}</span>
                                                </div>
                                                <p className="text-xs font-semibold text-slate-900 ml-4 tabular-nums">
                                                    {((item.value / chartData.totalExpense) * 100).toFixed(0)}%
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Income Pie */}
                            <div>
                                <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-6 px-2">Month Income Sources</h3>
                                <div className="card-clean py-10 shadow-xl shadow-emerald-50 !bg-emerald-50/20 border-emerald-100">
                                    <PieChart data={chartData.incomeData} total={chartData.totalIncome} />
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 mt-12 px-2">
                                        {chartData.incomeData.slice(0, 4).map((item, i) => (
                                            <div key={i} className="flex flex-col items-start text-left">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate w-20">{item.label}</span>
                                                </div>
                                                <p className="text-xs font-semibold text-slate-900 ml-4 tabular-nums">
                                                    {((item.value / chartData.totalIncome) * 100).toFixed(0)}%
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            )}

            {/* 6. Keypad Modal (Add Transaction) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-white z-[150] animate-in slide-in-from-bottom duration-500 overflow-y-auto no-scrollbar">
                    <div className="max-w-md mx-auto px-6 pt-12 pb-8 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-12">
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <h3 className="font-semibold text-slate-900 uppercase tracking-widest text-xs">Enter amount</h3>
                            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </button>
                        </div>

                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full mb-8">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-[12px]">{type === 'income' ? '💰' : '💸'}</div>
                                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{type}</span>
                            </div>
                            <h2 className="text-6xl font-semibold text-slate-900 tracking-tight mb-2">₹{amount}</h2>
                        </div>

                        <div className="flex-1 space-y-6 mb-8">
                            <div className="relative">
                                <select
                                    value={category}
                                    onChange={e => e.target.value === 'ADD_NEW' ? setIsAddingCategory(true) : setCategory(e.target.value)}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-semibold text-center text-slate-700 focus:ring-2 focus:ring-blue-600 appearance-none"
                                >
                                    <option value="">Select Category</option>
                                    {dynamicCategories.filter(c => c.type === type).map(c => (
                                        <option key={c._id} value={c.name}>{c.name}</option>
                                    ))}
                                    <option value="ADD_NEW" className="text-blue-600 font-semibold">+ Add New Category</option>
                                </select>
                            </div>
                            {isAddingCategory && (
                                <input autoFocus type="text" placeholder="Category Name" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)}
                                    className="w-full bg-blue-50 border-none rounded-2xl px-6 py-4 font-semibold text-center text-blue-700" />
                            )}
                        </div>

                        <Keypad onNumber={handleNumber} onDelete={handleDelete} />

                        <div className="mt-8">
                            <button onClick={handleSave} className="w-full bg-blue-600 text-white rounded-3xl py-5 font-semibold text-lg shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95">
                                Send money
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MoneyFlow;
