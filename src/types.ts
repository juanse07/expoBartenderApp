export interface ServiceQuotation {
    _id: string;
    clientName: string;
    companyName: string;
    email: string;
    phone: string;
    address: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    numberOfGuests: number;
    servicesRequested: string[];
    notes: string;
    createdAt: string;
    updatedAt: string;
  }