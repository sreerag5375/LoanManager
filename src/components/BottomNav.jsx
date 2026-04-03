import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNav = () => {
    const items = [
        {
            to: '/',
            label: 'Home',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            )
        },
        {
            to: '/loans',
            label: 'Debt',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            )
        },
        {
            to: '/vision',
            label: 'Vision',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            )
        }
    ];

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <nav className="flex items-center gap-1 bg-white/80 backdrop-blur-xl px-2 py-1.5 rounded-[2rem] shadow-2xl border border-white/50">
                {items.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `
                            flex flex-col items-center justify-center p-3 sm:px-6 rounded-[1.5rem] transition-all duration-300
                            ${isActive ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}
                        `}
                    >
                        <div className="relative">
                            {item.icon}
                        </div>
                        <span className="text-[9px] font-semibold uppercase tracking-wider mt-1 sm:block hidden">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default BottomNav;
