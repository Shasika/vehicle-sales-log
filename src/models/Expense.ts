import mongoose, { Schema, Document, Model } from 'mongoose';

interface IDocumentReference {
  type: 'Contract' | 'Invoice' | 'Receipt' | 'Registration' | 'Insurance' | 'Other';
  url: string;
  filename: string;
  uploadedAt: Date;
}

export interface IExpense extends Document {
  vehicleId?: mongoose.Types.ObjectId;
  category: 'Repair' | 'Service' | 'Transport' | 'Commission' | 'Other';
  description: string;
  amount: number;
  date: Date;
  payeeId?: mongoose.Types.ObjectId;
  attachments: IDocumentReference[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  deletedAt?: Date;
}

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

const expenseSchema = new Schema<IExpense>(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
    category: {
      type: String,
      enum: ['Repair', 'Service', 'Transport', 'Commission', 'Other'],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
    },
    payeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
    },
    attachments: [documentReferenceSchema],
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

expenseSchema.index({ vehicleId: 1, date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ date: -1 });
expenseSchema.index({ deletedAt: 1 });

expenseSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete (ret as any)._id;
    delete (ret as any).__v;
    return ret;
  },
});

const Expense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>('Expense', expenseSchema);

export default Expense;