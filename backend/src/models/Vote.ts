import mongoose, { Document, Schema } from 'mongoose';

export interface IVote extends Document {
  pollId: mongoose.Types.ObjectId;
  encryptedVote: string;
  isFake: boolean;
  createdAt: Date;
}

const voteSchema = new Schema<IVote>({
  pollId: {
    type: Schema.Types.ObjectId,
    ref: 'Poll',
    required: true
  },
  encryptedVote: {
    type: String,
    required: true
  },
  isFake: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
voteSchema.index({ pollId: 1, createdAt: -1 });

export default mongoose.model<IVote>('Vote', voteSchema); 