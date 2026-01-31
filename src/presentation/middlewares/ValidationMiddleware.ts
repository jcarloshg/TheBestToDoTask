import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error: unknown) {
      console.log(`error: `, error);
      if (error instanceof Error) {
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          details: error.message,
        });
      } else {
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
        });
      }
    }
  };
}
