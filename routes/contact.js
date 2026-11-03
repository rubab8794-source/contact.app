
require('dotenv').config();
const express = require('express');
const Router = express.Router();
const Contact = require('../models/Contact');
const checkAuth = require('../middleware/checkAuth')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
})


// add contact
Router.post('/add.contact', checkAuth, async (req, res) => {
  try {
    // console.log(req.files)
    //     console.log(req.headers)
    // console.log(req.headers.authorization)

    const token = req.headers.authorization.split(" ")[1]
    const user = await jwt.verify(token, 'sbs@satya')
    //  console.log(user)
    // console.log(user._id)
    const file = req.files.image
    const uploadImage = await cloudinary.uploader.upload(file.tempFilePath)
    console.log(uploadImage)

    const newContact = new Contact({
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      gender: req.body.gender,
      userId: user._id,
      imageurl: uploadImage.secure_url,
      imageId: uploadImage.public_id
    });


    const result = await newContact.save();
    res.status(200).json({
      newContact: result
    });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({
      error: err
    });
  }
});

// get all contacts
Router.get('/all.contact', checkAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    const skip = (page-1)*limit
    console.log(req.query.page,req.query.limit)
    const token = req.headers.authorization.split(" ")[1]
    const user = await jwt.verify(token, 'sbs@satya')
    // console.log(user)
    console.log(user._id)
    const data = await Contact.find({ userId: user._id }).populate("userId","fullName email phone")
    .select('_id fullName email address phone  gender userId imageurl imageid')
    .skip(skip).limit(limit)
    res.status(200).json({
      ContactList: data
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err
    });
  } // ✅ fixed closing brace here
});

//get contact by id
Router.get('/contactbyid/:id', checkAuth, async (req, res) => {
  try {
    const data = await Contact.findById(req.params.id).select('_id fullName email address gender userId imageurl imageid');

    const token = req.headers.authorization.split(" ")[1]
    const user = await jwt.verify(token, 'sbs@satya')
    // console.log(user)
    console.log(user._id)
    if (data.userId != user._id) {
      return res.status(500).json({
        error: 'invalid user'
      })
    }

    res.status(200).json({
      Contact: data
    })

  }
  catch (err) {
    console.log(err)
    res.status(500).json({
      error: err
    })
  }

})

//get contact by gender

Router.get('/byGender/:gender', checkAuth, async (req, res) => {

  try {

    const token = req.headers.authorization.split(" ")[1]
    const user = await jwt.verify(token, 'sbs@satya')
    // console.log(user)
    console.log(user._id)
    const data = await Contact.find({
      gender: req.params.gender, userId: user._id
    });

    res.status(200).json({
      contact: data
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err
    });

  }

});



// delete data by id
Router.delete('/:id', checkAuth, async (req, res) => {
  try {

    const data = await Contact.findById(req.params.id)
    const token = req.headers.authorization.split(" ")[1]
    const user = await jwt.verify(token, 'sbs@satya')

    console.log(user._id)

    if (data.userId != user._id) {
      return res.status(500).json({
        error: 'invalid user'
      })
    }

    await cloudinary.uploader.destroy(data.imageId)

    await Contact.deleteOne({ _id: req.params.id })

    res.status(200).json({
      message: 'data deleted'
    })

  } catch (err) {
    console.log(err)
    res.status(500).json({
      error: err
    })
  }
})
// delete contact by gender
Router.delete('/deleteByGender/:gender', checkAuth, async (req, res) => {
  try {

    const token = req.headers.authorization.split(" ")[1]
    const user = await jwt.verify(token, 'sbs@satya')
    // console.log(user)

    await Contact.deleteMany({ gender: req.params.gender, userId: user._id }); // ✅ use deleteOne instead of remove
    res.status(200).json({
      message: 'data deleted'
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err
    });
  }
});

//update api
Router.put('/:id', checkAuth, async (req, res) => {
  try {
    const data = await Contact.findById(req.params.id).select('_id fullName email address gender userId imageurl imageid');

    const token = req.headers.authorization.split(" ")[1]
    const user = await jwt.verify(token, 'sbs@satya')
    // console.log(user)
    // console.log(user._id)
    if (data.userId != user._id) {
      return res.status(500).json({
        error: 'invalid user'
      })
    }

    const updatedData = {
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      gender: req.body.gender,
      userId:data.userId
    }
 if (req.files && req.files.image) {

   if (data.imageId) {
      await cloudinary.uploader.destroy(data.imageId);
   }

   const file = req.files.image;

   const result = await cloudinary.uploader.upload(
      file.tempFilePath
   );

   updatedData.imageurl = result.secure_url;
   updatedData.imageId = result.public_id;
}
    const result = await Contact.findByIdAndUpdate(req.params.id,updatedData,{new:true})
    res.status(200).json({
      updatedData : result
    })


  }
  catch (err) {
    console.log(err)
    res.status(500).json({
      error: err
    })
  }
})


//count total contact
Router.get('/count',checkAuth,async(req,res)=>{
  try{
     const data = await Contact.findById(req.params.id).select('_id fullName email address gender userId imageurl imageid');

    const token = req.headers.authorization.split(" ")[1]
    const user = await jwt.verify(token, 'sbs@satya')
   const  total = await Contact.countDocuments({userId:user._id})
   res.status(200).json({
    total:total
   })
  }
  catch(err)
  {
    console.log(err)
    res.status(500).json({
      error:err
    })
  }
})

module.exports = Router;

