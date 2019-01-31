'use strict';

angular.module('storeApp')
    .controller('AdminLoginCtrl', [ '$scope', '$state', 'Login', 'Toast',
        function ($scope, $state, Login, Toast) {
          console.log("AdminLoginCtrl")
          localStorage.removeItem('token')
          localStorage.removeItem('admin_type')
          localStorage.removeItem('name')
          Login.loggingIn = false
          Login.registering = false
          
          $scope.errorMessage = null
          $scope.Login = Login
          $scope.showSignUp = false

          $scope.login = {
            username : '',
            password : ''
          }

          $scope.register = {
            store_name : '',
            email: '',
            mobile: '',
            username: '',
            password: ''
          }

          $scope.showRegister = ()=>{
            $scope.showSignUp = true
          }

          $scope.showLogin = ()=>{
            $scope.showSignUp = false
          }

          $scope.adminLogin = ()=>{
            Login.loggingIn = true
            $scope.errorMessage = null
            Login.adminLogin($scope.login).then((response)=>{
              if(response.data.status){
                localStorage.setItem('token',response.data.data.token)
                localStorage.setItem('admin_type', response.data.data.admin_type)
                localStorage.setItem('name', response.data.data.name)
                $state.go('dashboard')
              }else{
                Login.loggingIn = false
                $scope.errorMessage = response.data.message
              }
            })
          }

          $scope.adminRegister = ()=>{
            Login.registering = true
            $scope.errorMessage = null
            Login.adminRegister($scope.register).then((response)=>{
              if(response.data.status){
                localStorage.setItem('token',response.data.data.token)
                localStorage.setItem('admin_type', "store")
                localStorage.setItem('name', $scope.register.store_name)
                $state.go('dashboard')
              }else{
                Login.registering = false
                $scope.errorMessage = response.data.message
              }
            })
          }
}]);
