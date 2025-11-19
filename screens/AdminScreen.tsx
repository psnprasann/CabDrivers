import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriver } from '../contexts/DriverContext';
import { Calendar } from '../components/Calendar';
import { LogOut, Users, Phone, Trash2, Calendar as CalendarIcon, AlertTriangle, X } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

export const AdminScreen = () => {
  const { user, drivers, getDriverAvailability, logout, deleteDriver, isLoading } = useDriver();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [view, setView] = useState<'daily' | 'drivers'>('daily');
  
  // State for custom modals
  const [driverToDelete, setDriverToDelete] = useState<{id: string, name: string} | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'ADMIN') {
        navigate('/login');
      }
    }
  }, [user, isLoading, navigate]);

  // Compute stats for the selected date
  const { availableDrivers, unavailableDrivers, pendingDrivers } = useMemo(() => {
    const avail = [];
    const unavail = [];
    const pending = [];

    for (const driver of drivers) {
      const status = getDriverAvailability(driver.id, selectedDate);
      if (status === 'AVAILABLE') avail.push(driver);
      else if (status === 'UNAVAILABLE') unavail.push(driver);
      else pending.push(driver);
    }

    return { availableDrivers: avail, unavailableDrivers: unavail, pendingDrivers: pending };
  }, [drivers, selectedDate, getDriverAvailability]);

  const promptDelete = (id: string, name: string) => {
    setDriverToDelete({ id, name });
  };

  const confirmDelete = async () => {
    if (driverToDelete) {
      await deleteDriver(driverToDelete.id);
      setDriverToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDriverToDelete(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-slate-50 relative text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-md">
              <Users size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-slate-900">Fleet Manager</h1>
              <p className="text-slate-500 text-xs font-medium">Total Drivers: {drivers.length}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-rose-600 transition-colors flex items-center gap-2 text-slate-600"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        
        {/* View Toggle Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl border border-slate-200 mb-6 w-fit shadow-sm">
          <button
            onClick={() => setView('daily')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === 'daily' 
                ? 'bg-slate-100 text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <CalendarIcon size={16} />
            Daily Status
          </button>
          <button
            onClick={() => setView('drivers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === 'drivers' 
                ? 'bg-slate-100 text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Users size={16} />
            All Drivers
          </button>
        </div>

        {view === 'daily' ? (
          /* Daily View Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Calendar */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Select Date</h2>
                <Calendar 
                  mode="SINGLE"
                  selectedDates={[selectedDate]}
                  onSelectDate={setSelectedDate}
                />
              </div>

              {/* Daily Stats Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                    <div className="text-2xl font-bold text-green-700">{availableDrivers.length}</div>
                    <div className="text-xs text-green-600 font-bold uppercase tracking-wide">Available</div>
                </div>
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-center">
                    <div className="text-2xl font-bold text-rose-700">{unavailableDrivers.length}</div>
                    <div className="text-xs text-rose-600 font-bold uppercase tracking-wide">Unavailable</div>
                </div>
              </div>
            </div>

            {/* Right Column: Driver List */}
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h2 className="font-bold text-slate-800">Status Report</h2>
                  <span className="text-sm text-slate-500 font-mono bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">{selectedDate}</span>
                </div>
                
                <div className="divide-y divide-slate-100">
                  {/* Available Section */}
                  {availableDrivers.length > 0 && (
                    <div>
                      <div className="px-6 py-2 bg-green-50 border-l-4 border-green-500 text-xs font-bold text-green-700 uppercase tracking-wider">
                        Available ({availableDrivers.length})
                      </div>
                      {availableDrivers.map(driver => (
                        <div key={driver.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs">
                              {driver.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{driver.name}</p>
                              <p className="text-xs text-slate-500 font-mono">ID: {driver.id}</p>
                            </div>
                          </div>
                          <a href={`tel:${driver.phone}`} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                            <Phone size={18} />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Unavailable Section */}
                  {unavailableDrivers.length > 0 && (
                    <div>
                      <div className="px-6 py-2 bg-rose-50 border-l-4 border-rose-500 text-xs font-bold text-rose-700 uppercase tracking-wider">
                        Unavailable ({unavailableDrivers.length})
                      </div>
                      {unavailableDrivers.map(driver => (
                        <div key={driver.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors opacity-75">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                              {driver.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{driver.name}</p>
                              <p className="text-xs text-slate-500 font-mono">ID: {driver.id}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pending Section */}
                  {pendingDrivers.length > 0 && (
                    <div>
                      <div className="px-6 py-2 bg-slate-50 border-l-4 border-slate-300 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Not Set ({pendingDrivers.length})
                      </div>
                      {pendingDrivers.map(driver => (
                        <div key={driver.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors opacity-50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
                              {driver.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{driver.name}</p>
                              <p className="text-xs text-slate-500 font-mono">ID: {driver.id}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {drivers.length === 0 && (
                    <div className="p-8 text-center text-slate-400">
                      No drivers registered in the system.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* All Drivers List View */
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-slate-800">Manage Drivers</h2>
              <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold rounded-full">
                {drivers.length} Total
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {drivers.map(driver => (
                <div key={driver.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4 mb-3 sm:mb-0">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      {driver.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{driver.name}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mt-0.5 font-mono">
                        <span className="flex items-center gap-1"><Phone size={14}/> {driver.phone}</span>
                        <span className="text-slate-300">|</span>
                        <span>ID: {driver.id}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button 
                      onClick={() => promptDelete(driver.id, driver.name)}
                      className="flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-rose-100"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {drivers.length === 0 && (
                 <div className="p-12 text-center text-slate-500">
                   <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                     <Users size={32} className="text-slate-400"/>
                   </div>
                   <p>No drivers found in the system.</p>
                 </div>
              )}
            </div>
          </div>
        )}

        {/* Custom Delete Confirmation Modal */}
        {driverToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
              onClick={cancelDelete}
            />
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden transform transition-all">
              <div className="p-6">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="text-rose-600" size={24} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Delete Driver?
                </h3>
                
                <p className="text-slate-500 mb-6 leading-relaxed">
                  Are you sure you want to delete <span className="font-bold text-slate-900">{driverToDelete.name}</span>? 
                  This action will remove their account and all their availability data permanently.
                </p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
              
              <button 
                onClick={cancelDelete}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Custom Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
              onClick={() => setShowLogoutConfirm(false)}
            />
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden transform transition-all">
              <div className="p-6">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <LogOut className="text-slate-600" size={24} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Sign Out?
                </h3>
                
                <p className="text-slate-500 mb-6">
                  Are you sure you want to sign out of the admin portal?
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
                    className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 shadow-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};