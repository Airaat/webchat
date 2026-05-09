import {createYHub} from '@y/hub'
import * as env from 'lib0/environment'

await createYHub({
    redis: {
        url: env.getConf('REDIS'),
        prefix: 'yhub'
    },
    postgres: env.getConf('POSTGRES'),
    persistence: [],
    server: null,  // No server in this process
    worker: {taskConcurrency: 5}
})