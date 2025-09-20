import mongoose, { Schema, Document, Model } from 'mongoose';

interface IFileReference {
  url: string;
  caption?: string;
  uploadedAt: Date;
}

export interface IPerson extends Document {
  type: 'Individual' | 'Dealer' | 'Company';
  fullName?: string;
  businessName?: string;
  nicOrPassport?: string;
  companyRegNo?: string;
  phone: string[];
  email?: string;
  address?: string;
  images: IFileReference[];
  notes?: string;
  isBlacklisted: boolean;
  riskNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  deletedAt?: Date;
}

const fileReferenceSchema = new Schema({
  url: { type: String, required: true },
  caption: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

const personSchema = new Schema<IPerson>(
  {
    type: {
      type: String,
      enum: ['Individual', 'Dealer', 'Company'],
      required: true,
    },
    fullName: {
      type: String,
      trim: true,
      maxlength: 200,
      validate: {
        validator: function (this: IPerson) {
          return this.type === 'Individual' ? !!this.fullName : true;
        },
        message: 'Full name is required for individuals',
      },
    },
    businessName: {
      type: String,
      trim: true,
      maxlength: 200,
      validate: {
        validator: function (this: IPerson) {
          return this.type !== 'Individual' ? !!this.businessName : true;
        },
        message: 'Business name is required for dealers and companies',
      },
    },
    nicOrPassport: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    companyRegNo: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    phone: [{
      type: String,
      required: true,
      trim: true,
    }],
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: /^\S+@\S+\.\S+$/,
      sparse: true,
      unique: true,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    images: [fileReferenceSchema],
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    isBlacklisted: {
      type: Boolean,
      default: false,
    },
    riskNotes: {
      type: String,
      trim: true,
      maxlength: 500,
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

personSchema.index({ 'fullName': 'text', 'businessName': 'text' });
// Indexes are already defined in schema with unique: true
personSchema.index({ phone: 1 });
personSchema.index({ deletedAt: 1 });

personSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete (ret as any)._id;
    delete (ret as any).__v;
    return ret;
  },
});

const Person: Model<IPerson> = mongoose.models.Person || mongoose.model<IPerson>('Person', personSchema);

export default Person;