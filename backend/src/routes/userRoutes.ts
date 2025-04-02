import express from 'express';
import { register, login, getCurrentUser, logout } from '../controllers/userController';
import { protect } from '../middleware/auth';

type AsyncRequestHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>;

const router = express.Router();

router.post('/register', register as AsyncRequestHandler);
router.post('/login', login as AsyncRequestHandler);
router.get('/me', protect, getCurrentUser as AsyncRequestHandler);
router.post('/logout', protect, logout as AsyncRequestHandler);

export default router; 