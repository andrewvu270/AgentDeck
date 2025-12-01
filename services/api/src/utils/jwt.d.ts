export interface TokenPayload {
    userId: string;
    email: string;
}
export declare const generateAccessToken: (payload: TokenPayload) => string;
export declare const generateRefreshToken: (payload: TokenPayload) => string;
export declare const verifyToken: (token: string) => TokenPayload;
export declare const decodeToken: (token: string) => TokenPayload | null;
//# sourceMappingURL=jwt.d.ts.map