import { Request, Response, NextFunction } from 'express';
import { TokenPayload } from '../utils/jwt';
export interface AuthRequest extends Request {
    user?: TokenPayload;
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.d.ts.map