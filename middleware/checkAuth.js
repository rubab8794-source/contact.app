// const jwt = require('jsonwebtoken')
// module.exports = async(req,res,next)=>{
//   //verify token
//   try{
//     // console.log("checkauth chal rha hai")
//     // console.log(req.headers.authorization.split(" ")[1])
//     const token = req.headers.authorization.split(" ")[1]
//     await jwt.verify(token,'sbs@satya')
    
//      next()
//   }
//   catch(err){
//     console.log(err)
//     return res.status(500).json({
//         error:'invalid user...'
//     })
//   }
// }

const jwt = require('jsonwebtoken')

module.exports = async(req,res,next)=>{
  try{

    console.log(req.headers.authorization)

    const token = req.headers.authorization.split(" ")[1]

    await jwt.verify(token,'sbs@satya')

    next()

  }catch(err){

    console.log(err)

    return res.status(500).json({
      error:'invalid user...'
    })
  }
}