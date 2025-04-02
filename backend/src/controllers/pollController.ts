import { Request, Response } from 'express';
import Poll, { IOption } from '../models/Poll';
import Vote from '../models/Vote';
import crypto from 'crypto-js';
import mongoose from 'mongoose';

// Function to check and end expired polls
const checkAndEndExpiredPolls = async () => {
  const now = new Date();
  await Poll.updateMany(
    {
      isActive: true,
      endDate: { $lt: now }
    },
    { isActive: false }
  );
};

// Create a new poll
export const createPoll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, options, endDate } = req.body;
    if (!req.user?.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const poll = await Poll.create({
      title,
      description,
      options: options.map((option: string) => ({ text: option, votes: 0 })),
      createdBy: new mongoose.Types.ObjectId(req.user.id),
      endDate
    });
    res.status(201).json(poll);
  } catch (error) {
    res.status(500).json({ message: 'Error creating poll' });
  }
};

// Get all polls
export const getPolls = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check and end expired polls before fetching
    await checkAndEndExpiredPolls();
    
    const polls = await Poll.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching polls' });
  }
};

// Get a single poll
export const getPoll = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check and end expired polls before fetching
    await checkAndEndExpiredPolls();
    
    const poll = await Poll.findById(req.params.id)
      .populate('createdBy', 'username');
    if (!poll) {
      res.status(404).json({ message: 'Poll not found' });
      return;
    }
    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching poll' });
  }
};

// Vote on a poll
export const vote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { optionId } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      res.status(404).json({ message: 'Poll not found' });
      return;
    }

    // Check if poll has expired
    if (new Date(poll.endDate) < new Date()) {
      poll.isActive = false;
      await poll.save();
      res.status(400).json({ message: 'Poll has ended' });
      return;
    }

    if (!poll.isActive) {
      res.status(400).json({ message: 'Poll has ended' });
      return;
    }

    if (!req.user?.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);

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
    await poll.save();

    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: 'Error voting on poll' });
  }
};

export const deletePoll = async (req: Request, res: Response): Promise<void> => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      res.status(404).json({ message: 'Poll not found' });
      return;
    }

    if (!req.user?.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    if (poll.createdBy.toString() !== userId.toString()) {
      res.status(403).json({ message: 'Not authorized to delete this poll' });
      return;
    }

    await poll.deleteOne();
    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting poll' });
  }
}; 