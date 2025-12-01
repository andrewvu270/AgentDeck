export interface User {
    id: string;
    email: string;
    email_verified: boolean;
    created_at: Date;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    user: User;
}
export declare class AuthService {
    register(email: string, password: string): Promise<AuthTokens>;
    login(email: string, password: string): Promise<AuthTokens>;
    refreshAccessToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    logout(refreshToken: string): Promise<void>;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=auth.service.d.ts.map