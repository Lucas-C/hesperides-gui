'use strict';

/* Directives */


angular.module('Hesperides.directives', []).
  directive('guessZone', function() {
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
				
				this.updateObject = function() {
					//One case, we update a single propertie on instance
					//Otherwise, we update a full object
					if($scope.object){
					//This assume the objet guessed has same signature has the object matching
						for(var prop in $scope.match){
							$scope.object[prop] = $scope.match[prop];
						}
					} else {
						$scope.instance[$scope.main.prop] = $scope.match[$scope.main.prop];
					}
					//Handle watched properties
					$scope.$apply();
				};
				
				this.showMatch = function(prop, chunck) {
					$scope.chunck = chunck;
					$scope.match = AutoGuessFormUtils.findMatch(prop, chunck, $scope.instances, $scope.instance);
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
  .directive('guessMain', function() {
		return {
			require: '^guessZone',
			scope: {
				path: '='
			},
			link : function(scope, element, attr, guessZoneCtrl) {
				
				var props = scope.path.split('.');
				var prop = props[props.length-1];
				guessZoneCtrl.registerMain(element, prop);
				
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
 
var AutoGuessFormUtils = {
	lookin: function(item, props, level, chunck) {
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
					matchingObject = this.lookin(itemProp[i], props, level+1, chunck);
					if(matchingObject != null) return matchingObject;
				}
				return null;
			} else { //Is an object
				return this.lookin(itemProp, props, level+1, chunck);
			}
		}
	},
	
	findMatch: function(prop, chunck, instances, instance) {
		var props = prop.split(".");
		var matchingObjects=[];
		var matchingObject;
		for(var i=0; i < instances.length; i++){
			if(instances[i] != instance){
				matchingObject = this.lookin(instances[i], props, 0, chunck);
				if(matchingObject != null){
					matchingObjects.push(matchingObject);
				}
			}
		}
		if(matchingObjects.length > 0) return matchingObjects[0];
		else return '';
	}
};
