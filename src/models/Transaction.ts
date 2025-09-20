import mongoose, { Schema, Document, Model } from 'mongoose';

interface ITaxFee {
  name: string;
  amount: number;
  percentage?: number;
}

interface IPayment {
  method: 'Cash' | 'Bank Transfer' | 'Check' | 'Card' | 'Other';
  amount: number;
  date: Date;
  reference?: string;
}

interface IDocumentReference {
  type: 'Contract' | 'Invoice' | 'Receipt' | 'Registration' | 'Insurance' | 'Other';
  url: string;
  filename: string;
  uploadedAt: Date;
}

export interface ITransaction extends Document {
  vehicleId: mongoose.Types.ObjectId;
  direction: 'IN' | 'OUT';
  counterpartyId: mongoose.Types.ObjectId;
  date: Date;
  location?: string;
  basePrice: number;
  taxes: ITaxFee[];
  fees: ITaxFee[];
  discount: number;
  totalPrice: number;
  payments: IPayment[];
  documents: IDocumentReference[];
  notes?: string;
  previousTransactionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  deletedAt?: Date;
}

const taxFeeSchema = new Schema({
  name: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  percentage: { type: Number, min: 0, max: 100 },
});

const paymentSchema = new Schema({
  method: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Check', 'Card', 'Other'],
    required: true,
  },
  amount: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true },
  reference: { type: String, trim: true },
});

const documentReferenceSchema = new Schema({
  type: {
    type: String,
    enum: ['Contract', 'Invoice', 'Receipt', 'Registration', 'Insurance', 'Other'],
    required: true,
  },
  url: { type: String, required: true },
  filename: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const transactionSchema = new Schema<ITransaction>(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    direction: {
      type: String,
      enum: ['IN', 'OUT'],
      required: true,
    },
    counterpartyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    taxes: [taxFeeSchema],
    fees: [taxFeeSchema],
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      min: 0,
    },
    payments: [paymentSchema],
    documents: [documentReferenceSchema],
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    previousTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ vehicleId: 1, date: -1 });
transactionSchema.index({ direction: 1 });
transactionSchema.index({ counterpartyId: 1, date: -1 });
transactionSchema.index({ date: -1 });
transactionSchema.index({ deletedAt: 1 });

transactionSchema.pre('save', function (next) {
  const taxTotal = this.taxes.reduce((sum, tax) => sum + tax.amount, 0);
  const feeTotal = this.fees.reduce((sum, fee) => sum + fee.amount, 0);
  this.totalPrice = this.basePrice + taxTotal + feeTotal - this.discount;
  next();
});

transactionSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete (ret as any)._id;
    delete (ret as any).__v;
    return ret;
  },
});

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;