'use strict';

/* Controllers */

angular.module('Hesperides.controllers', [])
  .controller('AllInstancesCtrl', function($scope) {
	
	$scope.instances = [
		{'name' : 'WDIGSTTOTO42E11',
		'hostname' : 'SKODA'},
		{'name' : 'WDIGSTTOTO43E11',
		'hostname' : 'KAROSA'},
		{'name' : 'WDIGSTTOTO44E11',
		'hostname' : 'TESTAROSSA'}
	];
	
	$scope.name = "Toto";
		
  })
  .controller('SomeOtherCtrl', [function() {

  }]);
