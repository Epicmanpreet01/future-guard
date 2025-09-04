/* eslint-disable no-unused-vars */
import React from 'react';
import { LogOut, Brain, Shield, X } from 'lucide-react';

// --- SHARED REUSABLE COMPONENTS ---

export const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
);

export const DashboardHeader = ({ userType, user, onLogout, isLoggingOut = false }) => {
    const config = {
        Admin: { icon: <Brain className="w-6 h-6 text-white" />, color: "from-emerald-500 to-teal-500", title: "FutureGuard Admin", subtitle: "Institute Management Dashboard" },
        SuperAdmin: { icon: <Shield className="w-6 h-6 text-white" />, color: "from-blue-700 to-blue-500", title: "FutureGuard SuperAdmin", subtitle: "Global Management Dashboard" }
    };
    const { icon, color, title, subtitle } = config[userType];

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-3">
                        <div className={`flex items-center justify-center w-10 h-10 bg-gradient-to-r ${color} rounded-lg`}>{icon}</div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                            <p className="text-sm text-gray-500">{subtitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.institution}</p>
                        </div>
                        <button onClick={onLogout} disabled={isLoggingOut} className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50">
                            <LogOut className="w-4 h-4 mr-2" />
                            {isLoggingOut ? <LoadingSpinner /> : 'Log Out'}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export const DashboardFooter = () => (
    <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} FutureGuard. All rights reserved.</p>
        </div>
    </footer>
);

export const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
            <div className="flex-shrink-0"><Icon className={`h-8 w-8 ${color}`} /></div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    </div>
);

export const ActionButton = ({ icon: Icon, text, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <Icon className="w-5 h-5 mr-3 text-gray-500" />{text}
    </button>
);

export const Modal = ({ show, onClose, title, children, maxWidth = 'max-w-md' }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className={`bg-white rounded-xl shadow-xl w-full ${maxWidth} p-6`} onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                </div>
                {children}
            </div>
        </div>
    );
};

export const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-gray-900 placeholder-gray-500" />
    </div>
);

