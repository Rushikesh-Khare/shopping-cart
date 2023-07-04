
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const {appConfig} = require('aws-sdk');
dotenv.config()
const app = require('./app.js');
const { PORT, URI_CONNECT } = process.env;

const startServer = async () => {
    try {
        mongoose.set('strictQuery', true)
        await mongoose.connect(URI_CONNECT, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("Database Connected")
        app.listen(PORT, () => {
            console.log(`Server Started At Port ${PORT}`)
        })
    } catch (error) {
        console.log(error)
    }
}
startServer();