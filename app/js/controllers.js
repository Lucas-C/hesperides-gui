'use strict';

/* Controllers */

angular.module('Hesperides.controllers', [])
  .controller('AllInstancesCtrl', ['$scope', 'Instance', function($scope, Instance) {
    
	$scope.instances = Instance.all();		
			
  }])
  .controller('SomeOtherCtrl', [function() {

  }]);
