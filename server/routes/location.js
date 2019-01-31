var express = require('express');
var router = express.Router();
var locationHandler = require('../store/locations')
let moment = require('moment')

router.post('/ping', (req, res, next) => {
  let location = req.body.location
  let mobile = req.body.phone_number
  let timestamp = moment(req.body.detection_time).unix()
  new Promise((resolve, reject)=>{
    if(location && location.latitude && location.longitude && mobile && mobile.length == 10 && timestamp){
      locationHandler.AddLocation(location, mobile, timestamp).then(()=>{
        resolve()
      }).catch((err)=>{
        reject(err)
      })  
    }else{
      reject(`Failed to ping! Please check all the parameters`)
    }
  }).then((data)=>{
    res.json({'status': true, 'message': "location pinged successfully"})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

module.exports = router;
