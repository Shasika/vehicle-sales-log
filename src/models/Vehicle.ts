import mongoose, { Schema, Document, Model } from 'mongoose';

interface IImageReference {
  url: string;
  caption?: string;
  isPrimary?: boolean;
  thumbnailUrl?: string;
  uploadedAt: Date;
}

interface IDocumentReference {
  type: 'Contract' | 'Invoice' | 'Receipt' | 'Registration' | 'Insurance' | 'Other';
  url: string;
  filename: string;
  uploadedAt: Date;
}

export interface IVehicle extends Document {
  registrationNumber: string;
  vin?: string;
  make: string;
  vehicleModel: string;
  year: number;
  engineCapacity?: number;
  color?: string;
  mileage?: number;
  transmission?: 'Manual' | 'Automatic' | 'CVT';
  fuelType?: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  bodyType?: string;
  ownershipStatus: 'NotOwned' | 'InStock' | 'Booked' | 'Sold';
  images: IImageReference[];
  documents: IDocumentReference[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  deletedAt?: Date;
}

const imageReferenceSchema = new Schema({
  url: { type: String, required: true },
  caption: { type: String },
  isPrimary: { type: Boolean, default: false },
  thumbnailUrl: { type: String },
  uploadedAt: { type: Date, default: Date.now },
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

const vehicleSchema = new Schema<IVehicle>(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 20,
    },
    vin: {
      type: String,
      trim: true,
      maxlength: 17,
      sparse: true,
      unique: true,
    },
    make: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    vehicleModel: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    year: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 2,
    },
    engineCapacity: {
      type: Number,
      min: 0,
    },
    color: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    mileage: {
      type: Number,
      min: 0,
    },
    transmission: {
      type: String,
      enum: ['Manual', 'Automatic', 'CVT'],
    },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
    },
    bodyType: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    ownershipStatus: {
      type: String,
      enum: ['NotOwned', 'InStock', 'Booked', 'Sold'],
      default: 'NotOwned',
      required: true,
    },
    images: [imageReferenceSchema],
    documents: [documentReferenceSchema],
    tags: [{
      type: String,
      trim: true,
      maxlength: 50,
    }],
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

// Indexes are already defined in schema with unique: true
vehicleSchema.index({ make: 1, vehicleModel: 1, year: 1 });
vehicleSchema.index({ ownershipStatus: 1 });
vehicleSchema.index({ 'make': 'text', 'vehicleModel': 'text', 'tags': 'text' });
vehicleSchema.index({ deletedAt: 1 });

vehicleSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete (ret as any)._id;
    delete (ret as any).__v;
    return ret;
  },
});

const Vehicle: Model<IVehicle> = mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', vehicleSchema);

export default Vehicle;