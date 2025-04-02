"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const optionSchema = new mongoose_1.Schema({
    text: { type: String, required: true },
    votes: { type: Number, default: 0 }
});
const pollSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    options: [optionSchema],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    totalVotes: { type: Number, default: 0 },
    votedBy: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});
// Method to encrypt votes
pollSchema.methods.encryptVote = function (option) {
    const encryptionKey = process.env.VOTE_ENCRYPTION_KEY || 'default-key';
    return crypto_js_1.default.AES.encrypt(option, encryptionKey).toString();
};
// Method to add fake votes (±5%)
pollSchema.methods.addFakeVotes = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const fakeVotePercentage = 0.05; // 5%
        const fakeVotes = Math.floor(this.totalVotes * fakeVotePercentage);
        for (let i = 0; i < fakeVotes; i++) {
            const randomOption = this.options[Math.floor(Math.random() * this.options.length)];
            const encryptedVote = this.encryptVote(randomOption.text);
            // Store encrypted vote
            yield mongoose_1.default.model('Vote').create({
                pollId: this._id,
                encryptedVote,
                isFake: true
            });
        }
        this.totalVotes += fakeVotes;
        yield this.save();
    });
};
exports.default = mongoose_1.default.model('Poll', pollSchema);
