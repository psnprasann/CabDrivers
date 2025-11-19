import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriver } from '../contexts/DriverContext';
import { Lock, User, Phone, Shield, Truck } from 'lucide-react';

export const LoginScreen = () => {
  const navigate = useNavigate();
  const { login, registerDriver } = useDriver();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(''); // Acts as username for Admin
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isAdmin) {
        // Admin Login
        const success = await login(phone, password); // 'phone' state holds the username input
        if (success) {
          navigate('/admin');
        } else {
          setError('Invalid admin credentials');
        }
      } else {
        // Driver Logic
        if (isRegistering) {
          if (!name || !phone || !password) {
            setError("All fields required");
            setLoading(false);
            return;
          }
          const success = await registerDriver(name, phone, password);
          if (success) navigate('/driver');
          else setError("Phone number already registered");
        } else {
          // Driver Login
          const success = await login(phone, password);
          if (success) navigate('/driver');
          else setError("Invalid phone or password");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className={`py-8 px-8 text-center ${isAdmin ? 'bg-slate-900' : 'bg-blue-600'} transition-colors duration-300`}>
          <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            {isAdmin ? <Shield className="text-white" size={32} /> : <Truck className="text-white" size={32} />}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isAdmin ? 'Admin Portal' : 'Driver Access'}
          </h1>
          <p className="text-white/70 text-sm mt-1">
            {isAdmin ? 'Manage fleet availability' : 'Update your schedule'}
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="flex border-b border-slate-100">
          <button
            type="button"
            onClick={() => { setIsAdmin(false); setIsRegistering(false); setError(''); }}
            className={`flex-1 py-4 text-sm font-bold text-center transition-colors ${
              !isAdmin 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            Driver
          </button>
          <button
            type="button"
            onClick={() => { setIsAdmin(true); setIsRegistering(false); setError(''); }}
            className={`flex-1 py-4 text-sm font-bold text-center transition-colors ${
              isAdmin 
                ? 'text-slate-900 border-b-2 border-slate-900 bg-slate-50' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="bg-rose-50 text-rose-600 text-xs p-3 rounded-lg flex items-center border border-rose-100">
              <span className="mr-2">●</span> {error}
            </div>
          )}

          {/* Name Field - Only for Registration */}
          {!isAdmin && isRegistering && (
            <div className="relative group">
              <User className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          )}

          {/* Identity Field */}
          <div className="relative group">
            {isAdmin ? (
              <Shield className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={20} />
            ) : (
              <Phone className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            )}
            <input
              type="text"
              placeholder={isAdmin ? "Username" : "Phone Number"}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:border-transparent outline-none transition-all ${
                isAdmin ? 'focus:ring-slate-500/20' : 'focus:ring-blue-500/20'
              }`}
            />
          </div>

          {/* Password Field */}
          <div className="relative group">
            <Lock className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:border-transparent outline-none transition-all ${
                isAdmin ? 'focus:ring-slate-500/20' : 'focus:ring-blue-500/20'
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition-transform active:scale-95 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            } ${
              isAdmin 
                ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20' 
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
            }`}
          >
            {loading ? 'Processing...' : (
              isAdmin ? 'Login as Admin' : (isRegistering ? 'Create Account' : 'Login')
            )}
          </button>

          {/* Register Toggle (Driver only) */}
          {!isAdmin && (
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
              >
                {isRegistering ? "Already have an account? Login" : "New driver? Register here"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};