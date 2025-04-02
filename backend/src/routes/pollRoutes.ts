import express from 'express';
import {
  createPoll,
  getPolls,
  getPoll,
  vote,
  deletePoll
} from '../controllers/pollController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getPolls);
router.get('/:id', getPoll);

// Protected routes
router.post('/', protect, createPoll);
router.post('/:id/vote', protect, vote);
router.delete('/:id', protect, deletePoll);

export default router; 