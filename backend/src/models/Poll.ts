import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto-js';

export interface IOption {
  _id: mongoose.Types.ObjectId;
  text: string;
  votes: number;
}

export interface IPoll extends Document {
  title: string;
  description: string;
  options: IOption[];
  createdBy: mongoose.Types.ObjectId;
  endDate: Date;
  isActive: boolean;
  totalVotes: number;
  votedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  encryptVote(option: string): string;
  addFakeVotes(): Promise<void>;
}

const optionSchema = new Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 }
});

const pollSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  options: [optionSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  totalVotes: { type: Number, default: 0 },
  votedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Method to encrypt votes
pollSchema.methods.encryptVote = function(option: string): string {
  const encryptionKey = process.env.VOTE_ENCRYPTION_KEY || 'default-key';
  return crypto.AES.encrypt(option, encryptionKey).toString();
};

// Method to add fake votes (±5%)
pollSchema.methods.addFakeVotes = async function(): Promise<void> {
  const fakeVotePercentage = 0.05; // 5%
  const fakeVotes = Math.floor(this.totalVotes * fakeVotePercentage);
  
  for (let i = 0; i < fakeVotes; i++) {
    const randomOption = this.options[Math.floor(Math.random() * this.options.length)];
    const encryptedVote = this.encryptVote(randomOption.text);
    
    // Store encrypted vote
    await mongoose.model('Vote').create({
      pollId: this._id,
      encryptedVote,
      isFake: true
    });
  }
  
  this.totalVotes += fakeVotes;
  await this.save();
};

export default mongoose.model<IPoll>('Poll', pollSchema); 