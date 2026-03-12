import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface AdminGuardProps {
    children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
    const isAuth = localStorage.getItem('isAdminAuthenticated') === 'true';
    const location = useLocation();
    
    // Subdomain detection logic
    const hostname = window.location.hostname;
    const isMainDomain = hostname === 'novarlabs-copy.vercel.app';
    const isAdminSubdomain = hostname === 'admin.novarlabs-copy.vercel.app';
    
    // In production, force admin subdomain
    useEffect(() => {
        if (isMainDomain && location.pathname.startsWith('/admin')) {
            const newUrl = `https://admin.novarlabs-copy.vercel.app${location.pathname}${location.search}`;
            window.location.href = newUrl;
        }
    }, [isMainDomain, location]);

    // If we are on main domain and it's an admin path, we are already redirecting in useEffect
    // but for the immediate render, we can show nothing or a loader
    if (isMainDomain && location.pathname.startsWith('/admin')) {
        return <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="text-white font-black uppercase tracking-widest animate-pulse">Redirecting to Secure Admin...</div>
        </div>;
    }

    if (!isAuth && location.pathname !== '/admin/login') {
        return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
};

export default AdminGuard;
