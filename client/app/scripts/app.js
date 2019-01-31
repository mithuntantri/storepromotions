'use strict';

var baseUrl = "http://localhost:8070"
var socketBaseUrl = "http://localhost:8071"

angular.module('storeApp', [
    'ngMaterial',
    'ui.router'
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$mdThemingProvider', '$httpProvider', '$locationProvider',
  function ($stateProvider, $urlRouterProvider, $mdThemingProvider, $httpProvider, $locationProvider) {

    $mdThemingProvider.theme('success-toast');
    $mdThemingProvider.theme('error-toast');
    $httpProvider.interceptors.push('tokenInterceptor');

    // $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise("/");
    $urlRouterProvider.when("/", "/dashboard")
    // $urlRouterProvider.when("/login", "/dashboard")

    $stateProvider
      .state('login', {
        url : '/login',
        controller: 'AdminLoginCtrl',
        templateUrl : 'views/admin/login.html'
      })
      .state('dashboard', {
        url : '/dashboard',
        controller: 'AdminDashboardCtrl',
        templateUrl : 'views/admin/dashboard.html',
        resolve: {
          checkToken : ['$q', function($q){
            let deferred = $q.defer()
            if(localStorage.getItem('token')){
              deferred.resolve()
            }else{
              deferred.reject('tokenexpired')
            }
            return deferred.promise
          }],
          getIserDetails : ['$q', 'Sync', '$http', function($q, Sync, $http){
            let deferred = $q.defer()
            $http({
              method: 'GET',
              url: `${baseUrl}/api/store/details`
            }).then((result)=>{
              if(result.data.status){
                Sync.userDetails = result.data.data
                deferred.resolve()
              }else{
                deferred.reject('tokenexpired')
              }
            })
            return deferred.promise
          }],
          connectSocket : ['$rootScope', '$q', '$state', 'Sync',
            ($rootScope, $q, $state, Sync)=>{
              console.log("Connecting to Websockets", socketBaseUrl, localStorage.getItem('token'))
            let deferred = $q.defer();
            $rootScope.socket = io(socketBaseUrl, {
                path: '/socket',
                query: {
                  token : localStorage.getItem('token')
                }
              });
            console.log($rootScope.socket)
            $rootScope.socket.on('connection', (payload)=>{
              console.log(payload)
              if(payload.status){
                Sync.subscribeAll()
                deferred.resolve();
              }else{
                localStorage.removeItem('token')
                $state.go('login')
                if($rootScope.socket){
                  $rootScope.socket.disconnect()
                }
              }
            })
            return deferred.promise;
          }]
        }
      })
  }])

  .run(['$location','$rootScope','$state','$window',
    function ($location, $rootScope, $state, $window) {
      $rootScope.$on('tokenexpired', function () {
        $state.go('login');
      })
      $rootScope.$on('$stateChangeError', (event, toState, toParams, fromState, fromParams, error)=>{
        $state.go("login")
      })
  }])
