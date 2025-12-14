import React from 'react';
import { Link } from 'react-router-dom';

const VisionBoard = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 p-6 flex items-center justify-between z-50">
                <Link
                    to="/"
                    className="flex items-center justify-center w-12 h-12 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-blue-600 hover:scale-110"
                    title="Back to Dashboard"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
            </nav>

            {/* Main Content */}
            <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
                <div className="max-w-7xl w-full h-full max-h-[90vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden relative group">

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                    {/* Image Container */}
                    <div className="w-full h-full flex items-center justify-center">
                        <img
                            src="/2026.png"
                            alt="2026 Vision Board"
                            className="w-full h-full object-contain drop-shadow-xl hover:scale-[1.01] transition-transform duration-500"
                        />
                    </div>

                    {/* Title Overlay */}
                    <div className="absolute bottom-6 right-8 pointer-events-none">
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900/10 tracking-tighter">2026 VISION</h1>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisionBoard;
