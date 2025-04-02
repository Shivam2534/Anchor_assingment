"use strict";
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
exports.deletePoll = exports.vote = exports.getPoll = exports.getPolls = exports.createPoll = void 0;
const Poll_1 = __importDefault(require("../models/Poll"));
const mongoose_1 = __importDefault(require("mongoose"));
// Function to check and end expired polls
const checkAndEndExpiredPolls = () => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    yield Poll_1.default.updateMany({
        isActive: true,
        endDate: { $lt: now }
    }, { isActive: false });
});
// Create a new poll
const createPoll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, description, options, endDate } = req.body;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const poll = yield Poll_1.default.create({
            title,
            description,
            options: options.map((option) => ({ text: option, votes: 0 })),
            createdBy: new mongoose_1.default.Types.ObjectId(req.user.id),
            endDate
        });
        res.status(201).json(poll);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating poll' });
    }
});
exports.createPoll = createPoll;
// Get all polls
const getPolls = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check and end expired polls before fetching
        yield checkAndEndExpiredPolls();
        const polls = yield Poll_1.default.find()
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });
        res.json(polls);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching polls' });
    }
});
exports.getPolls = getPolls;
// Get a single poll
const getPoll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check and end expired polls before fetching
        yield checkAndEndExpiredPolls();
        const poll = yield Poll_1.default.findById(req.params.id)
            .populate('createdBy', 'username');
        if (!poll) {
            res.status(404).json({ message: 'Poll not found' });
            return;
        }
        res.json(poll);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching poll' });
    }
});
exports.getPoll = getPoll;
// Vote on a poll
const vote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { optionId } = req.body;
        const poll = yield Poll_1.default.findById(req.params.id);
        if (!poll) {
            res.status(404).json({ message: 'Poll not found' });
            return;
        }
        // Check if poll has expired
        if (new Date(poll.endDate) < new Date()) {
            poll.isActive = false;
            yield poll.save();
            res.status(400).json({ message: 'Poll has ended' });
            return;
        }
        if (!poll.isActive) {
            res.status(400).json({ message: 'Poll has ended' });
            return;
        }
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const userId = new mongoose_1.default.Types.ObjectId(req.user.id);
        // Check if user has already voted
        if (poll.votedBy.includes(userId)) {
            res.status(400).json({ message: 'You have already voted on this poll' });
            return;
        }
        const option = poll.options.find(opt => opt._id.toString() === optionId);
        if (!option) {
            res.status(400).json({ message: 'Invalid option' });
            return;
        }
        option.votes += 1;
        poll.totalVotes += 1;
        poll.votedBy.push(userId);
        yield poll.save();
        res.json(poll);
    }
    catch (error) {
        res.status(500).json({ message: 'Error voting on poll' });
    }
});
exports.vote = vote;
const deletePoll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const poll = yield Poll_1.default.findById(req.params.id);
        if (!poll) {
            res.status(404).json({ message: 'Poll not found' });
            return;
        }
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const userId = new mongoose_1.default.Types.ObjectId(req.user.id);
        if (poll.createdBy.toString() !== userId.toString()) {
            res.status(403).json({ message: 'Not authorized to delete this poll' });
            return;
        }
        yield poll.deleteOne();
        res.json({ message: 'Poll deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting poll' });
    }
});
exports.deletePoll = deletePoll;
