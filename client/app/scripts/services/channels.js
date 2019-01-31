function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}
class Sync {
  constructor($q, $timeout, $rootScope, $state, $interval, $http) {
    this.$q = $q
    this.$timeout = $timeout
    this.$rootScope = $rootScope
    this.$state = $state
    this.$http = $http
    this.$interval = $interval
    this.channels = []
    this.all_locations = []
    this.makeSocketSession()
  }
  makeSocketSession(){
    if(localStorage.getItem('socket_session')){
      this.socket_session = localStorage.getItem('socket_session')
    }else{
      this.socket_session = randomString(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
      localStorage.setItem('socket_session',this.socket_session)
    }
  }
  subscribeAll(){
    console.log("Subscribe All")
    let deferred = this.$q.defer()
    this.location_channel = this.$rootScope.socket.emit('join',{'channel':`g:all:${this.socket_session}`, 'data': null})
    this.location_channel.on("g:all:u", (payload)=>{
      this.$timeout(()=>{
        this.all_locations = payload.response
      })
    })
    this.sendHeartBeat();
    return deferred.promise
  }
  sendHeartBeat(){
    var socket = this.$rootScope.socket
    var promise = this.$interval(function(){
      socket.emit("heartbeat")
    },15000)
  }
  sendMessage(mobile){
    return this.$http({
      url: `${baseUrl}/api/store/sendMessage`,
      method: 'POST',
      data: {
        mobile: mobile
      }
    })
  }
}
Sync.$inject = ['$q', '$timeout', '$rootScope', '$state', '$interval', '$http']
angular.module('storeApp').service('Sync', Sync)
