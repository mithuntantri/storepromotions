var express = require('express');
var _ = require('underscore');
var moment = require('moment');
var jwt = require('jwt-simple');
var sqlQuery = require('../database/sqlWrapper');

var io 

var store = {
  clients : []
}

var redis = require('redis');

function getCookie(name, cookie) {
  var value = "; " + cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

var startSocketServer = function(io_param){
  io = io_param

  io.sockets.on('connection', function (socket) {
    return new Promise ((resolve, reject)=>{
      var secret = 'eg[isfd-8axcewfgi43209=1dmnbvcrt67890-[;lkjhyt5432qi24'
      var token = socket.handshake.query.token.split(" ")[1];
      if(!token){
        socket.emit('connection', {'status' : false, 'message': 'No Token Supplied'})
      }else{
        var claims = jwt.decode(token, secret, true)
        if(!claims){
          socket.emit('connection', {'status': false, 'message': 'Invalid Token'})
        }else if(claims.exp <= moment().valueOf()){
          socket.emit('connection', {'status': false, 'message': 'Session Expired. Please Login Again'})
        }else{
          socket.emit('connection', {'status': true, 'message': 'Socket Connection Established'})
          // When the server receives a "join" type signal from the client
          socket.on('join', function (payload) {
            socket.channel_session = payload.channel.split(":")[2]
            socket.channel_user = claims.store_name
            // console.log(">>> Token Expiry ", claims.exp)
            store.clients = _.filter(store.clients, (client)=>{
              return (client.channel_session != socket.channel_session && client.channel_user != socket.channel_user)
            });

            // console.log("**********************SOCKET******************", socket.id);
            // redis_client.set(claims.user_id + "_chat", socket.id);

            store.clients.push(socket)
            var channel = {
              channel_name : payload.channel.split(":")[0],
              channel_type : payload.channel.split(":")[1]
            };
            switchJoin(socket, channel, payload.data).then(()=>{
              resolve()
            })
            let parts = payload.channel.split(":")
            let channel_name = ""
            _.each(parts, (part, i)=>{
              if(i != parts.length -1){
                channel_name += part + ":"                
              }
            })
              socket.join(channel_name + claims.store_name, function (data) {
                  // onlineUser()
              })
          });

          socket.on("heartbeat", function(data) {
            if (parseFloat(claims.exp) <= parseFloat(moment().valueOf())){
              socket.emit("heartbeat", {'expired': true})
            }else{
              socket.emit("heartbeat", {'expired': false})
            }
          });

          // When the server receives a "leave" type signal from the client
          socket.on('leave', function (payload) {
            socket.channel_session = payload.channel.split(":")[2]
            socket.channel_user = claims.store_name
            store.clients = _.filter(store.clients, (client)=>{
              return (client.channel_session != socket.channel_session && client.channel_user != socket.channel_user)
            });
            // redis_client.del(claims.user_id + "_chat");
            let parts = payload.channel.split(":")
            let channel_name = ""
            _.each(parts, (part, i)=>{
              if(i != parts.length -1){
                channel_name += part + ":"                
              }
            })
            socket.leave(channel_name + claims.store_name, function(){
              resolve()
            })
          });

          /* UNCOMMENT WHEN CHAT FROM USER SIDE IS READY #exclusiveChat */
          socket.on('disconnect', function () {
              store.clients = _.filter(store.clients, (client)=>{
                  return (client.channel_session != socket.channel_session && client.channel_user != socket.channel_user)
              });
              resolve()
          });
        }
      }
    })
  })
}

var switchJoin = function (socket, channel, data) {
    return new Promise ((resolve, reject)=>{
      if(channel.channel_name == "g"){
        sendAllLocations(socket.channel_user).then(()=>{
          resolve()
        })
      }
    })
}

var sendAllLocations = (channel_user)=>{
  return new Promise ((resolve, reject)=>{
      var query = "Select * from locations ORDER BY timestamp DESC"
      var all_locations = []
      sqlQuery.executeQuery([query]).then((locations)=> {
              var reply = {
                'event': "g:all:u",
                'payload': {
                  'status': "ok",
                  'response': locations[0]
                }
              }
              io.sockets.in("g:all:"+channel_user).emit(reply.event, reply.payload)
              resolve()
          })
      })
}

var broadcastAllLocations = ()=>{
  return new Promise ((resolve, reject)=>{
      var query = "Select * from locations ORDER BY timestamp DESC"
      var all_locations = []
      sqlQuery.executeQuery([query]).then((locations)=> {
              var reply = {
                'event': "g:all:u",
                'payload': {
                  'status': "ok",
                  'response': locations[0]
                }
              }
              io.sockets.emit(reply.event, reply.payload)
              resolve()
          })
      })
}

module.exports = {
  startSocketServer : startSocketServer,
  switchJoin : switchJoin,
  sendAllLocations: sendAllLocations,
  broadcastAllLocations: broadcastAllLocations
}
