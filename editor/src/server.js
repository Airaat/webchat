import {createAuthPlugin, createYHub} from '@y/hub';
import * as env from 'lib0/environment';
import jwt from 'jsonwebtoken';

const yhub = await createYHub({
    redis: {
        url: env.getConf('REDIS'),
        prefix: 'yhub'
    },
    postgres: env.getConf('POSTGRES'),
    persistence: [],
    worker: null,
    server: {
        port: 3000,
        auth: createAuthPlugin({
            async readAuthInfo(req) {
                const token = req.getQuery('yauth');

                try {
                    // @see: frontend/src/services/jwtService.ts
                    // @see: com.airaat.webchat.domain.dto.UserPayload
                    const res = jwt.verify(token, env.getConf('JWT_SECRET'));
                    return {userid: res.username}
                } catch (err) {
                    console.error('JWT error details:', err.name, err.message);
                    console.error('Token preview:', token?.substring(0, 20));
                    throw err;
                }
            },
            async getAccessType(authInfo, room) {
                if (!authInfo?.userid) return null;
                return 'rw'; // 'rw' | 'r' | null
            }
        })
    },
});