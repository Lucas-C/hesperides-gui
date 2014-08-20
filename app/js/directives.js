'use strict';

/* Directives */

angular.module('Hesperides.directives', [])
	.directive('codeMirror', function() {
		return {
			
			link: function (scope, element, attrs) {
			
		
				scope.codeMirrorInstance = CodeMirror.fromTextArea(element[0], {
						mode: "text",
						lineNumbers: true
				});
				
				scope.codeMirrorInstance.setValue(scope.text || "");
				
				scope.codeMirrorInstance.on("change", function(codeMirrorInstance, changeObj){
					scope.text = codeMirrorInstance.getValue();
					scope.$apply();
				});
				
				scope.codeMirrorInstance.refresh(scope.codeMirrorInstance);
			
			
			},
			scope: {
				text: '=codeMirrorModel'
			}
		};
	})
	.directive('ngEnter', function () {
		return function (scope, element, attrs) {
			element.bind("keydown keypress", function (event) {
				if(event.which === 13) {
					scope.$apply(function (){
						scope.$eval(attrs.ngEnter);
					});

					event.preventDefault();
				}
			});
		};
	})
    .directive('guessZone', function() {
		return {
			restrict: 'E',
			scope: {},
			controller: function($scope) {
			
				this.hideTooltip = function() {
					$scope.tooltipElement.addClass("ng-hide");	
				};
				
				this.showTooltip = function() {
					$scope.tooltipElement.removeClass("ng-hide");
				};
				
				this.getMatch = function() {
					return $scope.guesser.getMatch();
				};
				
				this.getChunck = function() {
					return $scope.chunck;
				};
				
				this.registerTooltip = function(element) {
					$scope.tooltipElement = element;
					this.hideTooltip();
				};
				
				this.registerInput = function(element) {
					$scope.input = element;
				};
				
				this.registerGuesser = function(guesser) {
					$scope.guesser = guesser;
				}
				
				this.updateObjectIfNeeded = function() {
					
					if($scope.guesser.hasMatch()){
						$scope.guesser.update();
						this.hideTooltip();
					}
					
					//Handle watched properties
					$scope.$apply();
				};
				
				this.displayMatchIfExist = function(chunck) {
					$scope.chunck = chunck;
					$scope.guesser.findMatch(chunck);
					//$scope.match = AutoGuessFormUtils.findMatch(prop, chunck, $scope.instances, $scope.instance);
					if($scope.guesser.hasMatch()){
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
				};
				
				scope.getGuessedPart = function() {
					var match = guessZoneCtrl.getMatch();
					if(match) return match.replace(guessZoneCtrl.getChunck(), '');
					else return '';
				};
				
			}
		};
  })
  .directive('guessInstancebucket', function() {
	return {
		require: '^guessZone',
		restrict: 'E',
		scope: {
			instances: '=',
			instance: '=',
			object: '=',
			field: '=',
			bucket: '='
		},
		link: function(scope, element, attr, guessZoneCtrl) {
			
			guessZoneCtrl.registerGuesser(scope);
			
			var fields = scope.field.split('.');
			scope.prop = fields[fields.length-1];
			
			scope.findMatch = function(chunck) {
				var fields = scope.field.split(".");
				var matchingObjects=[];
				var matchingObject;
				var bucket = [];
				if(scope.bucket){
					for(var i=0; i < scope.instances.length; i++){
						if(scope.instances[i].type == scope.instance.type){
							bucket = bucket.concat(scope.instances[i][scope.bucket]);
						}
					}
				} else {
					bucket = scope.instances.filter(function(instance){ return instance.type == scope.instance.type });
				}
				for(var i=0; i < bucket.length; i++){
					if(scope.findMatchInObject(bucket[i], fields, 0, chunck)){
						matchingObjects.push(bucket[i]);
					}
				}
				if(matchingObjects.length > 0) scope.matchingObject = matchingObjects[0];
				else scope.matchingObject = null;
			};
			
			scope.hasMatch = function() {
				return scope.matchingObject != null;
			};
			
			scope.getMatch = function() {
				var fields = scope.field.split(".");
				if(scope.matchingObject){
					var value = scope.matchingObject[fields[0]];
					for(var i = 1; i<fields.length; i++){
						value = value[fields[i]];
					}
					return value;
				}
				
			};
			
			scope.update = function() {
				//If an object to update was defined, we update the full object
				//Otherwise, we update a single property on instance
				if(scope.object != null){
					for(var prop in scope.matchingObject){
						scope.object[prop] = scope.matchingObject[prop];
					}
				} else {
					scope.instance[scope.prop] = scope.matchingObject[scope.prop];
				}

			};
			
			/* Private method */
			scope.findMatchInObject = function(item, fields, level, chunck) {
				if(scope.object){
					if(item == scope.object) return false;
				} else {
					if(item == scope.instance) return false;
				}
				var itemProp = item[fields[level]];
				if(level == fields.length - 1){ //dernier niveau d'objet
					if(Object.prototype.toString.call( itemProp ) == '[object Array]'){
						return false;
					} else {
						if(itemProp != null && itemProp.startsWith(chunck) && itemProp != chunck){
							return true;
						} else {
							return false;
						}
					}
				} else {
					if(Object.prototype.toString.call( itemProp ) == '[object Array]'){//Is an array
						var matchingObject;
						for(var i=0; i < itemProp.length; i++){
							if(scope.findMatchInObject(itemProp[i], fields, level+1, chunck)){
								return true;
							}
						}
						return false;
					} else { //Is an object
						return scope.findMatchInObject(itemProp, fields, level+1, chunck);
					}
				}
			};
			
			
		}
	}
  })
  .directive('guessInput', function() {
		return {
			require: '^guessZone',
			scope: {},
			link : function(scope, element, attr, guessZoneCtrl) {
				
				guessZoneCtrl.registerInput(element);
				
				element.on('keyup', function(event) {
					if(event.keyCode != 32){ //Not space key
						//guessZoneCtrl.showMatchingValue(this.value);	
						guessZoneCtrl.displayMatchIfExist(this.value);
					} else { // Press space key
						guessZoneCtrl.updateObjectIfNeeded();
					}
				});
				
				element.on('blur', function(event) {
					guessZoneCtrl.hideTooltip();
				});
				
				element.on('focus', function(event) {
					guessZoneCtrl.displayMatchIfExist(this.value);
				});
			
			}
		};
  });
  