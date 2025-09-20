import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivityLog extends Document {
  actorId: mongoose.Types.ObjectId;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'LOGIN' | 'LOGOUT';
  entity: {
    type: 'User' | 'Person' | 'Vehicle' | 'Transaction' | 'Expense';
    id: mongoose.Types.ObjectId;
  };
  diff?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  at: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'LOGIN', 'LOGOUT'],
      required: true,
    },
    entity: {
      type: {
        type: String,
        enum: ['User', 'Person', 'Vehicle', 'Transaction', 'Expense'],
        required: true,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    },
    diff: {
      type: Schema.Types.Mixed,
    },
    ip: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    at: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

activityLogSchema.index({ actorId: 1, at: -1 });
activityLogSchema.index({ 'entity.type': 1, 'entity.id': 1, at: -1 });
activityLogSchema.index({ action: 1, at: -1 });
activityLogSchema.index({ at: -1 });

activityLogSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete (ret as any)._id;
    delete (ret as any).__v;
    return ret;
  },
});

const ActivityLog: Model<IActivityLog> = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);

export default ActivityLog;