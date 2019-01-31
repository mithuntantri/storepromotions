var sqlQuery = require('../database/sqlWrapper');
var moment = require('moment')
let _ = require("underscore");
var request = require('request');
var websocketServer = require('../store/websocketServer')

var AddLocation = (location, mobile, timestamp)=>{
	return new Promise((resolve, reject)=>{
		let query = `INSERT INTO locations (mobile, latitude, longitude, timestamp) VALUES('${mobile}',${location.latitude},${location.longitude},${timestamp})`
		sqlQuery.executeQuery([query]).then(()=>{
			websocketServer.broadcastAllLocations()
			resolve()
		}).catch((err)=>{
			reject()
		})
	})
}

module.exports = {
	AddLocation: AddLocation
}