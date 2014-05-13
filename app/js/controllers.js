'use strict';

/* Controllers */

angular.module('Hesperides.controllers', [])
  .controller('InstancesCtrl', ['$scope', 'Instance', function($scope, Instance) {
    
	$scope.instances = Instance.all();		
			
  }])
  .controller('ApplicationCtrl', ['$scope', '$routeParams', 'Search', 'Instance', function($scope, $routeParams, Search, Instance) {
    
	//Initial Params
	$scope.application = $routeParams.application;
	$scope.platform = $routeParams.platform;
	$scope.editing = false;
	
	//Define functions for App menu
	$scope.Edit =  function(bool) {
		$scope.editing = bool;
	}
	
	$scope.EditInstance = function(id){
		$scope.instance = $scope.instances.filter(function(instance){ return instance.id == id })[0];
		$scope.Edit(true);
	}
	
	//Define functions for current instance
	$scope.SaveCurrentInstance = function() {
		if($scope.instance.id){
			Instance.save($scope.instance);
		} else {
			Instance.put($scope.instance);
		}
		
	};
	
	$scope.Add_bin = function() {
		$scope.instance.bins.push({});		
	};
	
	$scope.Add_module = function() {
		$scope.instance.modules.push({});		
	};
	
	$scope.Add_port = function() {
		$scope.instance.ports.push({});		
	};
	
	$scope.Add_jdbc = function() {
		$scope.instance.external_links.jdbc.push({});		
	};
	
	$scope.Add_jms = function() {
		$scope.instance.external_links.jms.push({});		
	};
	
	$scope.Add_jolt = function() {
		$scope.instance.external_links.jolt.push({});		
	};
	
	$scope.Add_was = function() {
		$scope.instance.external_links.was.push({});		
	};
	
	$scope.Del_bin = function(index) {
		$scope.instance.bins.splice(index, 1);		
	};
	
	$scope.Del_module = function(index) {
		$scope.instance.modules.splice(index, 1);		
	};
	
	$scope.Del_port = function(index) {
		$scope.instance.ports.splice(index, 1);	
	};
	
	$scope.Del_jdbc = function(index) {
		$scope.instance.external_links.jdbc.splice(index, 1);		
	};
	
	$scope.Del_jms = function(index) {
		$scope.instance.external_links.jms.splice(index, 1);		
	};
	
	$scope.Del_jolt = function(index) {
		$scope.instance.external_links.jolt.splice(index, 1);		
	};
	
	$scope.Del_was = function(index) {
		$scope.instance.external_links.was.splice(index, 1);		
	};
	
	//Define functions for form edition
	$scope.$watch('instance.user', function(){
		$scope.instance.home = InstanceUtils.guessInstanceHome($scope.instance);
	},true);
	
	$scope.$watch('instance.component', function(){
		$scope.instance.home = InstanceUtils.guessInstanceHome($scope.instance);
	},true);
	
	
	//Load data for app/platform
	Search.instances($routeParams.application, $routeParams.platform).then(function(response){
		$scope.instances = response.data;
	}, function(response) {
		//failed
	});		
			
  }]);
  
var InstanceUtils = {};
InstanceUtils.guessInstanceHome = function(instance) {
	var home = "/appl/"+instance.user;
	if(instance.component){
		home += "/"+instance.component;
	}
	return home;
};
