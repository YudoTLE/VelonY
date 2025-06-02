import dotenv from 'dotenv'
dotenv.config()

import app from './app.js'

const start = async () => {
  try {
    await app.listen({ port: process.env.PORT || 5000 })
    app.log.info(`listening on ${process.env.PORT || 5000}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
start()