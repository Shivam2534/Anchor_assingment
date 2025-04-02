import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: { 
        _id: string;
        id: string;
      };
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, decoded: any) => {
      if (err) {
        res.status(403).json({ message: 'Invalid token' });
        return;
      }

      req.user = { 
        _id: decoded.id,
        id: decoded.id
      };
      next();
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; 