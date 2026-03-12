import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface AdminGuardProps {
    children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
    const token = localStorage.getItem('adminToken');
    const isAuth = !!token;
    const location = useLocation();
    
    if (!isAuth && location.pathname !== '/admin/login') {
        return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
};

export default AdminGuard;
