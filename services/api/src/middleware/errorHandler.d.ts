import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    code: string;
    details?: any | undefined;
    constructor(statusCode: number, code: string, message: string, details?: any | undefined);
}
export declare const errorHandler: (err: Error | AppError, req: Request, res: Response, _next: NextFunction) => Response<any, Record<string, any>>;
//# sourceMappingURL=errorHandler.d.ts.map