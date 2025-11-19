import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AvailabilityMap } from '../types';
import { StorageService } from '../services/storageService';

interface DriverContextType {
  user: User | null;
  drivers: User[];
  availability: AvailabilityMap;
  isLoading: boolean;
  login: (nameOrPhone: string, password?: string) => Promise<boolean>;
  logout: () => void;
  registerDriver: (name: string, phone: string, password?: string) => Promise<boolean>;
  deleteDriver: (driverId: string) => Promise<void>;
  setAvailability: (dates: string[], status: 'AVAILABLE' | 'UNAVAILABLE') => Promise<void>;
  getDriverAvailability: (driverId: string, date: string) => 'AVAILABLE' | 'UNAVAILABLE' | null;
}

const DriverContext = createContext<DriverContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'APP_USERS_V1',
  AVAILABILITY: 'APP_AVAILABILITY_V1',
  CURRENT_USER: 'APP_CURRENT_USER_V1'
};

const ADMIN_USER: User = {
  id: 'admin-001',
  name: 'Paramathma',
  phone: 'Paramathma', // Acts as username
  role: 'ADMIN',
};

// Initial seed data for demonstration
const INITIAL_DRIVERS: User[] = [
  { id: 'd1', name: 'John Doe', phone: '555-0101', role: 'DRIVER', password: '123' },
  { id: 'd2', name: 'Jane Smith', phone: '555-0102', role: 'DRIVER', password: '123' }
];

export const DriverProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [availability, setAvailabilityMap] = useState<AvailabilityMap>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load Users
        const usersJson = await StorageService.getItem(STORAGE_KEYS.USERS);
        if (usersJson) {
          setDrivers(JSON.parse(usersJson));
        } else {
          setDrivers(INITIAL_DRIVERS);
          await StorageService.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_DRIVERS));
        }

        // Load Availability
        const availJson = await StorageService.getItem(STORAGE_KEYS.AVAILABILITY);
        if (availJson) {
          setAvailabilityMap(JSON.parse(availJson));
        }

        // Load Session
        const sessionJson = await StorageService.getItem(STORAGE_KEYS.CURRENT_USER);
        if (sessionJson) {
          setUser(JSON.parse(sessionJson));
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const login = async (identifier: string, password?: string): Promise<boolean> => {
    // Admin Check
    if (identifier === 'Paramathma' && password === 'Paramathma') {
      const adminUser = ADMIN_USER;
      setUser(adminUser);
      await StorageService.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(adminUser));
      return true;
    }

    // Driver Check
    const driver = drivers.find(d => d.phone === identifier || d.name === identifier);
    if (driver) {
      // For simplicity in this demo, we are allowing name matches or phone matches
      // In a real app, strict validation and hashing would be used
      if (password && driver.password !== password) {
        return false;
      }
      setUser(driver);
      await StorageService.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(driver));
      return true;
    }

    return false;
  };

  const logout = async () => {
    setUser(null);
    await StorageService.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  const registerDriver = async (name: string, phone: string, password?: string): Promise<boolean> => {
    if (drivers.some(d => d.phone === phone)) {
      return false; // Already exists
    }

    const newDriver: User = {
      id: Date.now().toString(),
      name,
      phone,
      password,
      role: 'DRIVER'
    };

    const updatedDrivers = [...drivers, newDriver];
    setDrivers(updatedDrivers);
    await StorageService.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedDrivers));
    
    // Auto login on register
    setUser(newDriver);
    await StorageService.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newDriver));
    
    return true;
  };

  const deleteDriver = async (driverId: string): Promise<void> => {
    const updatedDrivers = drivers.filter(d => d.id !== driverId);
    setDrivers(updatedDrivers);
    await StorageService.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedDrivers));
  };

  const setAvailability = async (dates: string[], status: 'AVAILABLE' | 'UNAVAILABLE') => {
    if (!user) return;

    const newMap = { ...availability };
    dates.forEach(date => {
      const key = `${user.id}_${date}`;
      newMap[key] = status;
    });

    setAvailabilityMap(newMap);
    await StorageService.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(newMap));
  };

  const getDriverAvailability = (driverId: string, date: string) => {
    const key = `${driverId}_${date}`;
    return availability[key] || null;
  };

  return (
    <DriverContext.Provider value={{
      user,
      drivers,
      availability,
      isLoading,
      login,
      logout,
      registerDriver,
      deleteDriver,
      setAvailability,
      getDriverAvailability
    }}>
      {children}
    </DriverContext.Provider>
  );
};

export const useDriver = () => {
  const context = useContext(DriverContext);
  if (!context) {
    throw new Error('useDriver must be used within a DriverProvider');
  }
  return context;
};