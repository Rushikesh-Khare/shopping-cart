const express = require('express');
const app = express();
const routes = require('../routes/router');
const multer = require('multer');
const { AppConfig } = require('aws-sdk');
//global middleware
app.use(express.json())
app.use(multer().any());
app.use(express.urlencoded({extended : true}))

//route middleware
app.use('/',routes)

module.exports = app