import { ServiceQuotation } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8888';

export const apiService = {
  async fetchQuotations(): Promise<ServiceQuotation[]> {
    try {
      console.log('Fetching from:', `${API_URL}/bar-service-quotations`); // Debug URL

      const response = await fetch(`${API_URL}/bar-service-quotations`);
      
      if (!response.ok) {
        // Log more details about the error
        console.error('Response status:', response.status);
        console.error('Response statusText:', response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching quotations:', error);
      throw error;
    }
  }
};