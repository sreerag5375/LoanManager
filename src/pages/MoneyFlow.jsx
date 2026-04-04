import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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

    // --- DETAIL MODAL STATE ---
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // --- SETTINGS STATE ---
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [editingCatId, setEditingCatId] = useState(null);
    const [editingCatName, setEditingCatName] = useState('');
    const [isUpdatingCat, setIsUpdatingCat] = useState(false);
    
    const navigate = useNavigate();

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

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e) => {
        e?.preventDefault();
        if (isSaving) return;

        let finalCategory = category;

        if (isAddingCategory && newCategoryName.trim()) {
            const trimmedName = newCategoryName.trim();
            // Check if category already exists (case-insensitive)
            const existingCat = dynamicCategories.find(
                c => c.name.toLowerCase() === trimmedName.toLowerCase() && c.type === type
            );

            if (existingCat) {
                finalCategory = existingCat.name;
            } else {
                try {
                    setIsSaving(true);
                    const catRes = await fetch('/api/categories', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: trimmedName, type })
                    });
                    const catJson = await catRes.json();
                    if (catJson.success) {
                        finalCategory = catJson.data.name;
                        setDynamicCategories([...dynamicCategories, catJson.data]);
                    } else {
                        alert('Failed to add category');
                        setIsSaving(false);
                        return;
                    }
                } catch (err) {
                    console.error(err);
                    setIsSaving(false);
                    return;
                }
            }
        }

        if (!finalCategory || parseFloat(amount) <= 0) {
            alert('Please select a category and enter an amount');
            setIsSaving(false);
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
            setIsSaving(true);
            const url = isEditing ? `/api/transactions?id=${selectedTransaction._id}` : '/api/transactions';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const json = await res.json();
            if (json.success) {
                if (isEditing) {
                    setTransactions(transactions.map(t => t._id === selectedTransaction._id ? json.data : t));
                } else {
                    setTransactions([json.data, ...transactions]);
                }
                setIsModalOpen(false);
                setIsDetailModalOpen(false);
                resetForm();
            }
        } catch (err) {
            console.error(err);
            alert('Failed to save transaction');
        } finally {
            setIsSaving(false);
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
        setIsEditing(false);
    };

    // --- HANDLERS ---
    const openDetailModal = (t) => {
        setSelectedTransaction(t);
        setIsDetailModalOpen(true);
    };

    const handleEditTransaction = () => {
        if (!selectedTransaction) return;
        setIsEditing(true);
        setAmount(selectedTransaction.amount.toString());
        setType(selectedTransaction.type);
        setCategory(selectedTransaction.category);
        setDate(new Date(selectedTransaction.date).toISOString().split('T')[0]);
        setNotes(selectedTransaction.notes || '');
        setIsModalOpen(true);
        setIsDetailModalOpen(false);
    };

    const handleDeleteTransaction = async () => {
        if (!selectedTransaction || !window.confirm('Delete this transaction?')) return;
        try {
            setIsDeleting(true);
            const res = await fetch(`/api/transactions?id=${selectedTransaction._id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                setTransactions(transactions.filter(t => t._id !== selectedTransaction._id));
                setIsDetailModalOpen(false);
                navigate('/'); // Redirect to home page
            } else {
                alert('Failed to delete: ' + (json.error || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred during deletion');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleUpdateCategory = async (id) => {
        if (!editingCatName.trim()) return;
        try {
            setIsUpdatingCat(true);
            const res = await fetch(`/api/categories?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editingCatName.trim() })
            });
            const json = await res.json();
            if (json.success) {
                setDynamicCategories(dynamicCategories.map(c => c._id === id ? json.data : c));
                // If the updated category name was used in the current list/filter, refresh transactions
                fetchTransactions();
                setEditingCatId(null);
            } else {
                alert('Failed to update category');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsUpdatingCat(false);
        }
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
                <button onClick={() => setIsSettingsModalOpen(true)} className="btn-action-round group">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center text-white transition-all group-active:scale-90 group-active:bg-blue-700">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Settings</span>
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
                        <div key={t._id} className="list-item-clean cursor-pointer active:scale-95 transition-all" onClick={() => openDetailModal(t)}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {t.type === 'income' ? '💰' : '💸'}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-800 text-sm leading-tight">{t.category}</h4>
                                    <p className="text-[10px] text-slate-400 font-medium">
                                        {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <p className={`font-semibold text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
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
                            <button onClick={() => { setIsModalOpen(false); setIsEditing(false); }} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <h3 className="font-semibold text-slate-900 uppercase tracking-widest text-xs">{isEditing ? 'Edit transaction' : 'Enter amount'}</h3>
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
                            <button 
                                onClick={handleSave} 
                                disabled={isSaving}
                                className={`w-full text-white rounded-3xl py-5 font-semibold text-lg shadow-xl transition-all flex items-center justify-center gap-3 ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-200'}`}
                            >
                                {isSaving ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Saving...</span>
                                    </>
                                ) : isEditing ? (
                                    'Update transaction'
                                ) : (
                                    'Send money'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 7. Transaction Detail Modal (Bottom Sheet) */}
            {isDetailModalOpen && selectedTransaction && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[200] flex items-end justify-center animate-in fade-in duration-300" onClick={() => setIsDetailModalOpen(false)}>
                    <div 
                        className="bg-white w-full max-w-md rounded-t-[3rem] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-500 overflow-hidden" 
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Handle bar */}
                        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-8"></div>

                        <div className="flex flex-col items-center text-center mb-8">
                            <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center text-3xl ${selectedTransaction.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                {selectedTransaction.type === 'income' ? '💰' : '💸'}
                            </div>
                            <p className="text-slate-400 font-semibold uppercase tracking-widest text-[10px] mb-2">{selectedTransaction.category}</p>
                            <h2 className={`text-4xl font-semibold tracking-tight ${selectedTransaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {selectedTransaction.type === 'income' ? '+' : '-'}₹{selectedTransaction.amount.toLocaleString()}
                            </h2>
                        </div>

                        <div className="space-y-6 mb-10">
                            <div className="flex items-center justify-between py-4 border-b border-slate-50">
                                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Date</span>
                                <span className="text-slate-900 text-sm font-semibold">
                                    {new Date(selectedTransaction.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-4 border-b border-slate-50">
                                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Type</span>
                                <span className={`text-sm font-semibold capitalize ${selectedTransaction.type === 'income' ? 'text-emerald-600' : 'text-blue-600'}`}>
                                    {selectedTransaction.type}
                                </span>
                            </div>
                            {selectedTransaction.notes && (
                                <div className="py-4">
                                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wider block mb-2">Notes</span>
                                    <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl">{selectedTransaction.notes}</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={handleDeleteTransaction}
                                disabled={isDeleting}
                                className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 text-red-600 font-semibold active:scale-95 transition-all border border-red-100 disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        <span>Delete</span>
                                    </>
                                )}
                            </button>
                            <button 
                                onClick={handleEditTransaction}
                                disabled={isDeleting}
                                className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-100 active:scale-95 transition-all disabled:opacity-50"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                <span>Edit</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 8. Settings Modal (Category Management) */}
            {isSettingsModalOpen && (
                <div className="fixed inset-0 bg-white z-[250] animate-in slide-in-from-right duration-500 overflow-y-auto no-scrollbar">
                    <div className="max-w-md mx-auto px-6 pt-12 pb-20">
                        <header className="flex items-center justify-between mb-10">
                            <button onClick={() => setIsSettingsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 active:scale-90 transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <h3 className="font-semibold text-slate-900 uppercase tracking-widest text-xs">Categories Settings</h3>
                            <div className="w-10 h-10"></div>
                        </header>

                        {['income', 'expense'].map(tType => (
                            <div key={tType} className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">
                                    {tType} Categories
                                </h4>
                                <div className="space-y-2">
                                    {dynamicCategories.filter(cat => cat.type === tType).map(cat => (
                                        <div key={cat._id} className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between transition-all">
                                            {editingCatId === cat._id ? (
                                                <div className="flex items-center gap-2 w-full">
                                                    <input 
                                                        autoFocus
                                                        value={editingCatName}
                                                        onChange={e => setEditingCatName(e.target.value)}
                                                        className="flex-1 bg-white border border-blue-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button 
                                                        onClick={() => handleUpdateCategory(cat._id)}
                                                        disabled={isUpdatingCat}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all active:scale-95 disabled:opacity-50"
                                                    >
                                                        {isUpdatingCat ? '...' : 'Save'}
                                                    </button>
                                                    <button 
                                                        onClick={() => setEditingCatId(null)}
                                                        className="bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all active:scale-95"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="text-sm font-semibold text-slate-800">{cat.name}</span>
                                                    <button 
                                                        onClick={() => { setEditingCatId(cat._id); setEditingCatName(cat.name); }}
                                                        className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:bg-white px-3 py-1.5 rounded-lg transition-all"
                                                    >
                                                        Edit
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                    {dynamicCategories.filter(cat => cat.type === tType).length === 0 && (
                                        <p className="text-xs text-slate-400 italic px-2">No categories found</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MoneyFlow;
