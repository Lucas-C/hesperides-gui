'use strict';

/* Controllers */

angular.module('Hesperides.controllers', [])
  .controller('InstancesCtrl', ['$scope', 'Instance', function($scope, Instance) {
    
	$scope.instances = Instance.all();		
			
  }])
  .controller('InstanceCtrl', ['$scope', '$routeParams', 'Instance', function($scope, $routeParams, Instance) {

	$scope.instance = Instance.get({id: $routeParams.id});

  }]);
