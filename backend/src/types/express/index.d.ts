import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

declare module 'express' {
  interface Response {
    json: (body: any) => void;
  }
}

declare module 'express-serve-static-core' {
  interface RequestHandler<
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    LocalsObj extends Record<string, any> = Record<string, any>
  > {
    (
      req: Request<P, ResBody, ReqBody, ReqQuery>,
      res: Response<ResBody>,
      next: NextFunction
    ): void | Promise<void> | any;
  }
}

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