'use strict';

/* Controllers */

angular.module('Hesperides.controllers', [])
  .controller('InstancesCtrl', ['$scope', 'Instance', function($scope, Instance) {
    
	$scope.instances = Instance.all();		
			
  }])
    .controller('FulltextCtrl', ['$scope', 'searchFulltext', function ($scope, searchFulltext) {
        $scope.search = function (keywords) {
            searchFulltext(keywords).then(function (searchKeys){
                    $scope.searchKeys = searchKeys;
                }

            ) ;
        }
    }])
  .controller('ApplicationCtrl', ['$scope', '$routeParams', '$timeout', 'Search', 'Instance', function($scope, $routeParams, $timeout, Search, Instance) {
    
	//Initial Params
	$scope.application = $routeParams.application;
	$scope.platform = $routeParams.platform;
	$scope.editing = false;
	
	//Load data for app/platform
	$scope.instances = []
	Search.instances($routeParams.application, $routeParams.platform).then(function(instances){
		$scope.instances = instances;
	}, function(response) {
		//failed
	});
	
	//Define functions for App menu
	$scope.Edit =  function(bool) {
		$scope.editing = bool;
	};
	
	$scope.EditInstance = function(instance){
		$scope.instance = instance;
		$scope.instanceTemplate = 'partials/instance.html';
		$scope.Edit(true);
	};
	
	 var findInstance = function(id){
		return $scope.instances.filter(function(instance){ return instance.id == id })[0];
	};
	
	//Define functions for current instance
	//Use save in progress to avoid double saves (when model is updated by server response for instance)
	var saveInProgress = false;
	$scope.SaveCurrentInstance = function() {
		//if($scope.$instanceForm.$valid && !saveInProgress){
		if($scope.instance && !saveInProgress){
			saveInProgress = true;
			if($scope.instance.id){
				$scope.instance.$save();
			} else {
				$scope.instance.$put();
			}
			saveInProgress = false;
		}
	};
	
	var removeInstanceFromView = function(instance) {
		if($scope.instance && $scope.instance.id == instance.id){
			$scope.instance = null;
			$scope.Edit(false);
		}
		$scope.instances.splice($scope.instances.indexOf(instance), 1);
	}
	
	$scope.DeleteInstance = function(instance) {
		//If the instance was saved, it must have an id
		if(instance.id){
			Instance.delete({id: instance.id}, function(){
				removeInstanceFromView(instance);
		});
		} else {
			//just refresh view without server call
			removeInstanceFromView(instance);
		}
	};
	
	$scope.AddInstance = function(type) {
		var newInstance = new Instance();
		newInstance.type = type;
		newInstance.application = $scope.application;
		newInstance.platform = $scope.platform;
		newInstance.bins = [];
		newInstance.modules = [];
		newInstance.jvm_optjs = { 'tuning': [],	'system': []};
		newInstance.ports = [];
		newInstance.links = [];
		newInstance.schemas = [];
				
		//Try to add more elements if there are instances already existing
		if($scope.instances.length > 0){
			newInstance.client = $scope.instances[0].client;
			newInstance.application_version = $scope.instances[0].application_version;
			newInstance.application_url = $scope.instances[0].application_url;
		}
		
		$scope.instances.push(newInstance);
		$scope.EditInstance(newInstance);
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
	
	$scope.Add_link = function(type) {
		$scope.instance.links.push({"type": type});		
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
	
	$scope.Del_link = function(link) {
		$scope.instance.links.splice($scope.instance.links.indexOf(link), 1);		
	};
	
	$scope.instanceTypeIs = function(types) {
		if($scope.instance == null) return false;
		if(Object.prototype.toString.call( types ) == '[object Array]'){
			for(var i = 0; i<types.length; i++){
				if($scope.instance.type == types[i]) return true;
			}
			return false;
		} else {
			return $scope.instance.type == types;
		}
	}	

	
	//Define functions for form edition
	
	//Save instance when it changes, with a 1 second timeout to avoid multiple save
	var save_timeout = null;
	$scope.$watch('instance', function(oldVal, newVal){
		//We want to save only when the same instance has changed, not when user chooses another instance to modify
		if(oldVal && newVal && oldVal.id == newVal.id){
			if(save_timeout){
				$timeout.cancel(save_timeout);
			}
			
			save_timeout = $timeout($scope.SaveCurrentInstance, 1000);
		}
	}, true);
	
	$scope.$watch('instance.user', function(){
		if($scope.instance){
			$scope.instance.home = InstanceUtils.guessInstanceHome($scope.instance);
		}
	},true);
	
	$scope.$watch('instance.component', function(){
		if($scope.instance){
			$scope.instance.home = InstanceUtils.guessInstanceHome($scope.instance);
		}
	},true);
			
  }]);
 
var InstanceUtils = {};
InstanceUtils.guessInstanceHome = function(instance) {
	var home = "/appl/"+instance.user;
	if(instance.component){
		home += "/"+instance.component;
	}
	return home;
};

if ( typeof String.prototype.startsWith != 'function' ) {
  String.prototype.startsWith = function( str ) {
    return str.length > 0 && this.substring( 0, str.length ) === str;
  }
};
