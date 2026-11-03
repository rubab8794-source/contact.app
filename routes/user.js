const express = require('express');
const Router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// SIGNUP
Router.post('/signup', async (req, res) => {
    try {
     
        const users = await User.find({
            email: req.body.email
        });

        if (users.length > 0) {
            return res.status(400).json({
                error: 'Email already registered'
            });
        }

        const hash = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
            fullName: req.body.fullName,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            password: hash
        });

        const data = await newUser.save();

        res.status(201).json({
            newUser: data
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});


// LOGIN
Router.post('/login', async (req, res) => {
    try {
        const user = await User.find({ email: req.body.email });

        console.log(user);

        if (user.length == 0) {
            return res.status(500).json({
                error: 'email not registered...'
            });
        }

        const isPasswordcorrect = await bcrypt.compare(
            req.body.password,
            user[0].password
        );

        console.log(isPasswordcorrect);

        if (!isPasswordcorrect) {
            return res.status(500).json({
                error: 'invalid password'
            });
        }

       const token = await jwt.sign({
        _id:user[0]._id,
        fullName:user[0].fullName,
        email:user[0].email,
        phone:user[0].phone,
        address:user[0].address,
       },'sbs@satya',{expiresIn:'7d'})

       res.status(200).json({
        token:token
       })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: err.message
        });
    }
});


module.exports = Router;
