import { ServiceQuotation } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export const apiService = {
  async fetchQuotations(): Promise<ServiceQuotation[]> {
    try {
      const response = await fetch(`${API_URL}/api/quotations`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching quotations:', error);
      throw error;
    }
  }
};