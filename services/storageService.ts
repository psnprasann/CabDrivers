// This service mimics AsyncStorage behavior using localStorage for the web environment.
export const StorageService = {
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error("Error saving to storage", e);
    }
  },

  getItem: async (key: string): Promise<string | null> => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error("Error reading from storage", e);
      return null;
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("Error removing from storage", e);
    }
  }
};
