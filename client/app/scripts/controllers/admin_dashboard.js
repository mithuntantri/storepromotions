'use strict';

angular.module('storeApp')
    .controller('AdminDashboardCtrl',
        [ '$scope','$state', '$rootScope', 'Login', 'Toast', 'Sync',
        function ($scope, $state, $rootScope, Login, Toast, Sync) {
        	$scope.Sync = Sync
        	$scope.name = localStorage.getItem('name')
        	$scope.admin_type = localStorage.getItem('admin_type')
        	Login.loggingOut = false
        	$scope.upload_options = [
        		{
        			'name': 'Customer Locations',
        			'selected': $scope.admin_type == 'store'?true:false,
        			'restricted' : false,
        		}
        	]
        	$scope.selected_option = $scope.upload_options[0].name
        	$scope.selectOption = (index)=>{
        		_.each($scope.upload_options, (upload_option, i)=>{
        			upload_option.selected = false
        			if(i == index){
        				upload_option.selected = true
        			}
        		})
        		$scope.selected_option = $scope.upload_options[index].name
        	}
        	$scope.adminLogout = ()=>{
        		Login.loggingOut = true
        		localStorage.removeItem('token')
        		localStorage.removeItem('name')
        		localStorage.removeItem('admin_type')
        		$state.go('login')
        	}

            $scope.sendMessage = (index)=>{
                Sync.sendMessage().then((result)=>{
                    Sync.userDetails = result.data.data
                    if(result.data.status){
                        Toast.showSuccess("Offer Message sent to the mobile number " + Sync.all_locations[index].mobile + " successfully")
                    }else{
                        Toast.showError("No Credits! Offer Message cannot be sent to the mobile number " + Sync.all_locations[index].mobile)
                    }
                })
            }
 
}]);
