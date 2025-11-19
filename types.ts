export type Role = 'DRIVER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  phone: string;
  password?: string;
  role: Role;
}

export interface Availability {
  driverId: string;
  date: string; // YYYY-MM-DD
  status: 'AVAILABLE' | 'UNAVAILABLE';
}

// Map key helper: `${driverId}_${date}`
export type AvailabilityMap = Record<string, 'AVAILABLE' | 'UNAVAILABLE'>;
