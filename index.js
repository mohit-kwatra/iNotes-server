const db = require('./database/config')
const express = require('express')
const authRouter = require('./routes/auth')
const notesRouter = require('./routes/notes')

/**
 * Database
 */
db.connect()

/**
 * Server
 */
const app = express()
const port = parseInt(process.env.PORT) || 5000

app.use(express.json())

app.listen(port, () => {
    console.log(`[+] Server listening on port ${port}.`)
})
