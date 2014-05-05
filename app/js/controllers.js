'use strict';

/* Controllers */

angular.module('Hesperides.controllers', [])
  .controller('InstancesCtrl', ['$scope', 'Instance', function($scope, Instance) {
    
	$scope.instances = Instance.all();		
			
  }])
  .controller('InstanceCtrl', [function() {

  }]);
