'use strict';

/* Controllers */

angular.module('Hesperides.controllers', [])
  .controller('InstancesCtrl', ['$scope', 'Instance', function($scope, Instance) {
    
	$scope.instances = Instance.all();		
			
  }])
  .controller('ApplicationCtrl', ['$scope', '$routeParams', '$timeout', 'Search', 'Instance', function($scope, $routeParams, $timeout, Search, Instance) {
    
	//Initial Params
	$scope.application = $routeParams.application;
	$scope.platform = $routeParams.platform;
	$scope.editing = false;
	
	//Define functions for App menu
	$scope.Edit =  function(bool) {
		$scope.editing = bool;
	};
	
	$scope.EditInstance = function(instance){
		$scope.instance = instance;
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
		newInstance.external_links = {
			'jdbc': [],
			'jms': [],
			'jolt': [],
			'was': []
		};
				
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
	
	
	//Load data for app/platform
	$scope.instances = []
	Search.instances($routeParams.application, $routeParams.platform).then(function(instances){
		$scope.instances = instances;
	}, function(response) {
		//failed
	});		
			
  }])
  .directive('guessZone', function() {
		return {
			restrict: 'E',
			scope: {
				instances: '=',
				instance: '=',
				object: '='
			},
			controller: function($scope) {

				this.hideTooltip = function() {
					$scope.tooltipElement.addClass("ng-hide");	
				};
				
				this.showTooltip = function() {
					$scope.tooltipElement.removeClass("ng-hide");
				};
								
				this.hasMatch = function() {
					return this.getMatch().length > 0 && this.getMatch() != $scope.chunck
				};
				
				this.getMatch = function() {
					if($scope.match){
						return $scope.match[$scope.main.prop];
					} else return '';
				};
				
				this.getChunck = function() {
					return $scope.chunck;
				};
				
				this.registerTooltip = function(element) {
					$scope.tooltipElement = element;
					this.hideTooltip();
				};
				
				this.registerMain = function(element, prop) {
					$scope.main = {
						el: element,
						prop: prop
					}
				};
				
				$scope.children = [];
				this.registerChild = function(element, prop) {
					var child = {
						el: element,
						prop: prop
					}
					$scope.children.push(child);
				};
				
				this.updateObject = function() {
					$scope.object[$scope.main.prop] = $scope.match[$scope.main.prop];
					for(var i=0; i < $scope.children.length; i++){
						$scope.object[$scope.children[i].prop] = $scope.match[$scope.children[i].prop];
						$scope.children[i].el.value = $scope.match[$scope.children[i].prop];
					}
					$scope.$apply();
				};
				
				this.showMatch = function(prop, chunck) {
					$scope.chunck = chunck;
					$scope.match = InstanceUtils.findMatch(prop, chunck, $scope.instances, $scope.instance);
					if(this.hasMatch()){
						this.showTooltip();
					} else {
						this.hideTooltip();
					}
				}
				
			}
		};
	})
  .directive('guessTooltip', function(){
		return {
			restrict: 'E',
			scope: {},
			require: '^guessZone',
			templateUrl : 'partials/tooltip.html',
			link: function(scope, element, attr, guessZoneCtrl) {
				
				guessZoneCtrl.registerTooltip(element);
				
				scope.getChunck = function() {
					return guessZoneCtrl.getChunck();
				}
				
				scope.getGuessedPart = function() {
					if(guessZoneCtrl.hasMatch()) return guessZoneCtrl.getMatch().replace(guessZoneCtrl.getChunck(), '');
					else return '';
				}
				
			}
		};
  })
  .directive('guessChild', function() {
		return {
			require: '^guessZone',
			scope: {
				prop: '='
			},
			link: function(scope, element, attr, guessZoneCtrl) {
				
				guessZoneCtrl.registerChild(element, scope.prop);
				
			}
		};
  })
  .directive('guessMain', function() {
		return {
			require: '^guessZone',
			scope: {
				prop: '=',
				path: '='
			},
			link : function(scope, element, attr, guessZoneCtrl) {
				
				guessZoneCtrl.registerMain(element, scope.prop);
				
				element.on('keyup', function(event) {
					if(event.keyCode != 32){ //Not space key
						guessZoneCtrl.showMatch(scope.path, this.value);
					} else {
						if(guessZoneCtrl.hasMatch()){
							this.value = guessZoneCtrl.getMatch();
							guessZoneCtrl.updateObject();
							guessZoneCtrl.hideTooltip();
						}
					}
				});
				
				element.on('blur', function(event) {
					guessZoneCtrl.hideTooltip();
				});
				
				element.on('focus', function(event) {
					guessZoneCtrl.showMatch(scope.path, this.value);
				});
			
			}
		};
  });
  
var InstanceUtils = {};
InstanceUtils.guessInstanceHome = function(instance) {
	var home = "/appl/"+instance.user;
	if(instance.component){
		home += "/"+instance.component;
	}
	return home;
};


InstanceUtils.lookIn = function(item, props, level, chunck) {
	var itemProp = item[props[level]];
	if(level == props.length - 1){ //dernier niveau d'objet
		if(Object.prototype.toString.call( itemProp ) == '[object Array]'){
			return null;
		} else {
			if(itemProp.startsWith(chunck)){
				return item;
			} else {
				return null;
			}
		}
	} else {
		if(Object.prototype.toString.call( itemProp ) == '[object Array]'){//Is an array
			var matchingObject;
			for(var i=0; i < itemProp.length; i++){
				matchingObject = InstanceUtils.lookIn(itemProp[i], props, level+1, chunck);
				if(matchingObject != null) return matchingObject;
			}
			return null;
		} else { //Is an object
			return InstanceUtils.lookIn(itemProp, props, level+1, chunck);
		}
	}
}
				
InstanceUtils.findMatch = function(prop, chunck, instances, instance) {
	var props = prop.split(".");
	var matchingObjects=[];
	var matchingObject;
	for(var i=0; i < instances.length; i++){
		if(instances[i] != instance){
			matchingObject = InstanceUtils.lookIn(instances[i], props, 0, chunck);
			if(matchingObject != null){
				matchingObjects.push(matchingObject);
			}
		}
	}
	if(matchingObjects.length > 0) return matchingObjects[0];
	else return '';
};

if ( typeof String.prototype.startsWith != 'function' ) {
  String.prototype.startsWith = function( str ) {
    return str.length > 0 && this.substring( 0, str.length ) === str;
  }
};
