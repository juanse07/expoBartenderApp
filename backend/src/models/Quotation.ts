import mongoose, { Document, Schema } from 'mongoose';

export interface IQuotation extends Document {
  clientName: string;
  email: string;
  phone: string;
  address: string;
  serviceType: string;
  startTime: string;
  endTime: string;
  numberOfRooms: number;
  squareFootage: number;
  notes: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const QuotationSchema: Schema = new Schema(
  {
    clientName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    serviceType: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    numberOfRooms: { type: Number, required: true },
    squareFootage: { type: Number, required: true },
    notes: { type: String },
  },
  { timestamps: true, collection: 'barservicequotations' }
);

export const Quotation = mongoose.model<IQuotation>('Quotation', QuotationSchema);
