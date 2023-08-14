require('dotenv').config()
const mongoose = require('mongoose')

const mongoURI = process.env.CONNECTION_STRING
const connect = () => {
    mongoose
    .connect(mongoURI)
    .then(() => {
        console.log("[+] Connected to MongoDB.")
    })
}

module.exports = {connect}