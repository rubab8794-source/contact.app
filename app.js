require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload')


const userRoute = require('./routes/user');
const contactRoute = require('./routes/contact');
const ratelimit = require('express-rate-limit')


const limiter = ratelimit({
    windowMs: 60 * 1000,
    limit: 5,
    message: {
        
        message: 'Too many requests. Try again after 1 minute.'
    }
});



console.log(process.env.DATABASE_URL); 
mongoose.connect(process.env.DATABASE_URL)
.then(() => {
    console.log('connected with database');
})
.catch((err) => {
    console.log(err);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}))

app.use(limiter)
app.use('/user', userRoute);
app.use('/contact', contactRoute);

module.exports = app;
