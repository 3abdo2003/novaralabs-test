import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Key, Shield, Loader2, User as UserIcon, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface AdminUser {
    _id: string;
    username: string;
    name: string;
    createdAt: string;
}

const SettingsPage: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState<AdminUser | null>(null);
    const [currentUser, setCurrentUser] = useState<{ id: string, username: string } | null>(null);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: ''
    });

    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUser(payload);
            } catch (e) {
                console.error('Failed to decode token', e);
            }
        }
        fetchUsers();
    }, [token]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) setUsers(json.data);
            else setError(json.error || 'Failed to fetch users');
        } catch (err) {
            setError('Connection failure');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const json = await res.json();
            if (json.success) {
                setSuccessMsg(`User ${formData.username} added successfully`);
                setFormData({ username: '', password: '', name: '' });
                setIsAdding(false);
                fetchUsers();
                setTimeout(() => setSuccessMsg(null), 3000);
            } else {
                setError(json.error);
            }
        } catch (err) {
            setError('Failed to add user');
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setError(null);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: isChangingPassword?._id,
                    password: passwordData.newPassword
                })
            });
            const json = await res.json();
            if (json.success) {
                setSuccessMsg(`Password for ${isChangingPassword?.username} updated`);
                setPasswordData({ newPassword: '', confirmPassword: '' });
                setIsChangingPassword(null);
                setTimeout(() => setSuccessMsg(null), 3000);
            } else {
                setError(json.error);
            }
        } catch (err) {
            setError('Failed to update password');
        }
    };

    const handleDeleteUser = async (id: string, username: string) => {
        if (!window.confirm(`Are you sure you want to delete admin user "${username}"?`)) return;
        setError(null);
        try {
            const res = await fetch(`/api/admin/users?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                setSuccessMsg(`User ${username} deleted`);
                fetchUsers();
                setTimeout(() => setSuccessMsg(null), 3000);
            } else {
                setError(json.error);
            }
        } catch (err) {
            setError('Failed to delete user');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Loading Governance Hub...</p>
        </div>
    );

    return (
        <div className="p-4 sm:p-8 pb-20 max-w-[1200px] mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-1.5 tracking-tight">Security & Governance</h1>
                    <p className="text-zinc-400 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.25em]">Admin Privilege Management</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full sm:w-auto bg-zinc-900 text-white px-6 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2.5 hover:bg-zinc-800 transition-all shadow-xl active:scale-95"
                >
                    <UserPlus className="w-4 h-4" /> New Administrator
                </button>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                    <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600"><X size={16} /></button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user) => (
                    <div key={user._id} className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative">
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                                <UserIcon className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsChangingPassword(user)}
                                    className="p-2 text-zinc-300 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-all"
                                    title="Change Password"
                                >
                                    <Key className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteUser(user._id, user.username)}
                                    disabled={currentUser?.id === user._id}
                                    className={`p-2 rounded-lg transition-all ${currentUser?.id === user._id
                                        ? 'text-zinc-100 cursor-not-allowed'
                                        : 'text-zinc-300 hover:text-red-500 hover:bg-red-50'
                                        }`}
                                    title={currentUser?.id === user._id ? "Cannot delete yourself" : "Delete User"}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                                {user.name}
                                {currentUser?.id === user._id && (
                                    <span className="text-[9px] font-black uppercase tracking-widest bg-zinc-900 text-white px-1.5 py-0.5 rounded leading-none">You</span>
                                )}
                            </h3>
                            <p className="text-zinc-400 text-xs font-medium">@{user.username}</p>
                        </div>

                        <div className="mt-6 pt-6 border-t border-zinc-50 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                <Shield className="w-3 h-3 text-zinc-300" /> Full Access
                            </div>
                            <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-tighter">
                                Added {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add User Modal */}
            {isAdding && (
                <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-zinc-100 animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
                            <div>
                                <h2 className="text-lg font-bold text-zinc-900">New Administrator</h2>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Authorizing Global Access</p>
                            </div>
                            <button onClick={() => setIsAdding(false)} className="text-zinc-400 hover:text-zinc-900 p-2 rounded-lg hover:bg-zinc-100 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddUser} className="p-8 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Full Name</label>
                                <input
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm font-bold text-zinc-900 outline-none focus:bg-white focus:border-orange-300 transition-all"
                                    placeholder="e.g. Alexander Pierce"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Username</label>
                                <input
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm font-bold text-zinc-900 outline-none focus:bg-white focus:border-orange-300 transition-all"
                                    placeholder="e.g. apierce"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Initial Password</label>
                                <input
                                    type="password"
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm font-bold text-zinc-900 outline-none focus:bg-white focus:border-orange-300 transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full bg-zinc-900 text-white p-4 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-zinc-800 transition-all mt-4">
                                Provision Account
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {isChangingPassword && (
                <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-zinc-100 animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
                            <div>
                                <h2 className="text-lg font-bold text-zinc-900">Reset Credentials</h2>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Protecting {isChangingPassword.username}</p>
                            </div>
                            <button onClick={() => setIsChangingPassword(null)} className="text-zinc-400 hover:text-zinc-900 p-2 rounded-lg hover:bg-zinc-100 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleChangePassword} className="p-8 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">New Password</label>
                                <input
                                    type="password"
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm font-bold text-zinc-900 outline-none focus:bg-white focus:border-orange-300 transition-all"
                                    placeholder="••••••••"
                                    value={passwordData.newPassword}
                                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm font-bold text-zinc-900 outline-none focus:bg-white focus:border-orange-300 transition-all"
                                    placeholder="••••••••"
                                    value={passwordData.confirmPassword}
                                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full bg-zinc-900 text-white p-4 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-zinc-800 transition-all mt-4">
                                Update Credentials
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {successMsg && (
                <div className="fixed bottom-8 right-8 z-[70] animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="bg-zinc-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-sm font-bold">{successMsg}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
