import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ServiceQuotation } from '../types';

export class QuotationStorage {
  private static QUOTATIONS_KEY = 'quotations';

  static async saveQuotations(quotations: ServiceQuotation[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(this.QUOTATIONS_KEY, JSON.stringify(quotations));
      return true;
    } catch (error) {
      console.error('Error saving quotations:', error);
      return false;
    }
  }

  static async getQuotations(): Promise<ServiceQuotation[]> {
    try {
      const data = await AsyncStorage.getItem(this.QUOTATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting quotations:', error);
      return [];
    }
  }

  static async addQuotation(quotation: ServiceQuotation): Promise<boolean> {
    try {
      const quotations = await this.getQuotations();
      quotations.push(quotation);
      return this.saveQuotations(quotations);
    } catch (error) {
      console.error('Error adding quotation:', error);
      return false;
    }
  }
  static async isConnected(): Promise<boolean> {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected ?? false;
  }
}