import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriver } from '../contexts/DriverContext';
import { Calendar } from '../components/Calendar';
import { LogOut, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export const DriverScreen = () => {
  const { user, logout, setAvailability, getDriverAvailability, isLoading } = useDriver();
  const navigate = useNavigate();
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (!user) return null;

  const handleDateSelect = (date: string) => {
    setMessage(null);
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter(d => d !== date));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const handleSave = async (status: 'AVAILABLE' | 'UNAVAILABLE') => {
    if (selectedDates.length === 0) {
      setMessage({ type: 'error', text: 'Select at least one date first.' });
      return;
    }

    setIsSaving(true);
    try {
      await setAvailability(selectedDates, status);
      setMessage({ 
        type: 'success', 
        text: `Successfully marked ${selectedDates.length} days as ${status.toLowerCase()}` 
      });
      setSelectedDates([]); // Clear selection after save
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to save availability.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Sticky Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 safe-area-top">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">
              Welcome, {user.name.split(' ')[0]}
            </h1>
            <p className="text-xs text-slate-500 font-mono">ID: #{user.id.slice(-4)}</p>
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
            aria-label="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* Stats / Info Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-2">Availability Status</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Select multiple dates on the calendar below, then tap <span className="text-green-600 font-bold">Available</span> or <span className="text-rose-600 font-bold">Unavailable</span> to update your schedule.
          </p>
        </div>

        {/* Feedback Message */}
        {message && (
          <div className={`p-3 rounded-lg text-sm flex items-center animate-fade-in ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-100 text-green-700' 
              : 'bg-rose-50 border border-rose-100 text-rose-700'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={16} className="mr-2" /> : <AlertCircle size={16} className="mr-2" />}
            {message.text}
          </div>
        )}

        {/* Calendar */}
        <div className="mb-8">
          <Calendar 
            mode="MULTI"
            selectedDates={selectedDates}
            onSelectDate={handleDateSelect}
            onSelectedDatesChange={setSelectedDates}
            getDateStatus={(date) => getDriverAvailability(user.id, date)}
          />
        </div>

      </main>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] safe-area-bottom z-30">
        <div className="max-w-3xl mx-auto flex gap-4">
          <button
            onClick={() => handleSave('UNAVAILABLE')}
            disabled={isSaving || selectedDates.length === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-rose-600 py-3.5 rounded-xl font-bold shadow-sm active:bg-rose-50 transition-colors disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <XCircle size={20} />
            Unavailable
          </button>
          <button
            onClick={() => handleSave('AVAILABLE')}
            disabled={isSaving || selectedDates.length === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-green-600/20 active:bg-green-700 transition-colors disabled:opacity-50 disabled:shadow-none"
          >
            <CheckCircle2 size={20} />
            Available
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 overflow-hidden transform transition-all">
            <div className="p-6">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <LogOut className="text-slate-600" size={24} />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Sign Out?
              </h3>
              
              <p className="text-slate-500 mb-6">
                Are you sure you want to end your session? Any unsaved changes to availability will be lost.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};