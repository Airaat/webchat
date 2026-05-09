import {createYHub, createAuthPlugin} from '@y/hub'
import * as env from 'lib0/environment'

const yhub = await createYHub({
    redis: {
        url: env.getConf('REDIS'),           // e.g. 'redis://localhost:6379'
        prefix: 'yhub'
    },
    postgres: env.getConf('POSTGRES'),      // e.g. 'postgres://user:pass@localhost:5432/db'
    persistence: [],
    server: {
        port: 3000,
        auth: createAuthPlugin({
            async readAuthInfo(req) {
                return {userid: 'anonymous'}
            },
            async getAccessType(authInfo, room) {
                return 'rw' // 'rw' | 'r' | null
            }
        })
    },
    worker: {
        taskConcurrency: 5
    }
})