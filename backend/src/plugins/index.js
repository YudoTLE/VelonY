import cors     from './cors.js'
import jwt      from './jwt.js'
import oauth2   from './oauth2.js'
import redis    from './redis.js'
import realtime from './realtime/index.js'
import context  from './context.js'
import formbody from './formbody.js'



export default [
  cors,
  jwt,
  oauth2,
  redis,
  realtime,
  context,
  formbody,
]