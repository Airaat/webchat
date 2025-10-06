import {jwtDecode} from 'jwt-decode';
import {toUserRole, type User} from '../types/auth';

export interface JwtPayload {
    sub: string;
    username: string;
    role: string;
    iat: number;
    exp: number;
    iss?: string;
}

class JwtService {
    decodeToken(token: string): JwtPayload | null {
        try {
            return jwtDecode<JwtPayload>(token);
        } catch (e) {
            console.error('Failed to decode jwt: ', e);
            return null;
        }
    }

    getUserFromToken(token: string): User | null {
        const payload = jwtDecode<JwtPayload>(token);
        if (!payload) return null;
        return {
            id: Number.parseInt(payload.sub),
            username: payload.username,
            globalRole: toUserRole(payload.role)
        };
    }

    isTokenExpired(token: string): boolean {
        const payload = this.decodeToken(token);
        if (!payload) return true;

        const currentTime = Date.now() / 1000;
        return payload.exp < currentTime;
    }

    getTokenExpiration(token: string): Date | null {
        const payload = this.decodeToken(token);
        return payload ? new Date(payload.exp * 1000) : null;
    }
}

export const jwtService = new JwtService();