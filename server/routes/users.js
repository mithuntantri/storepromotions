var express = require('express');
var router = express.Router();
var login = require('../store/login')
var passport = require('passport');
require('../routes/passport')(passport);

router.post('/login', (req, res, next) => {
  let username = req.body.username
  let password = req.body.password
  new Promise((resolve, reject)=>{
    login.AdminLogin(username, password).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})


router.post('/register', (req, res, next) => {
  let request = req.body
  new Promise((resolve, reject)=>{
    login.AdminRegister(request).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.get('/details', passport.authenticate('jwt', {session: true}), (req, res, next) => {
  let username = req.session.passport.user.username;
  console.log(username)
  new Promise((resolve, reject)=>{
    login.getUserDetails(username).then((data)=>{
      resolve(data[0])
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.post('/sendMessage', passport.authenticate('jwt', {session: true}), (req, res, next) => {
  let username = req.session.passport.user.username;
  let mobile = req.body.mobile
  new Promise((resolve, reject)=>{
    login.updateStore(username).then((data)=>{
      resolve(data[0])
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})


module.exports = router;
