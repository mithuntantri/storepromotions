class Login{
  constructor($http){
    this.$http = $http
  }
  adminLogin(data){
    return this.$http({
      url: baseUrl + "/api/store/login",
      method: "POST",
      data : data
    })
  }
  adminRegister(data){
    return this.$http({
      url: baseUrl + "/api/store/register",
      method: "POST",
      data : data
    })
  }
  adminLogout(){
    return this.$http({
      url: baseUrl + "/api/store/logout",
      method: "POST"
    })
  }
}
Login.$inject = ['$http']
angular.module('storeApp').service('Login', Login)
