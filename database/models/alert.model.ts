import { Schema, model, models, Document } from 'mongoose';

export interface IAlert extends Document {
    userId: string;
    symbol: string;
    companyName: string;
    alertName?: string;
    alertType: 'price' | 'percent_change' | 'volume';
    condition: 'greater_than' | 'less_than';
    threshold: number;
    frequency: 'once' | 'daily' | 'always';
    createdAt: Date;
    triggered: boolean;
}

const AlertSchema = new Schema<IAlert>({
    userId: { type: String, required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    companyName: { type: String, required: true },
    alertName: { type: String },
    alertType: { type: String, required: true, enum: ['price', 'percent_change', 'volume'], default: 'price' },
    condition: { type: String, required: true, enum: ['greater_than', 'less_than'], default: 'greater_than' },
    threshold: { type: Number, required: true },
    frequency: { type: String, required: true, enum: ['once', 'daily', 'always'], default: 'once' },
    triggered: { type: Boolean, default: false },
}, { timestamps: true });

const Alert = models?.Alert || model<IAlert>('Alert', AlertSchema);
export default Alert;
