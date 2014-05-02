'use strict';

/* Controllers */

angular.module('Hesperides.controllers', [])
  .controller('AllInstancesCtrl', ['$scope', '$http', function($scope, $http) {

    $http.get('/instances').success(function(data) {
		$scope.instances = data;		
	});
			
  }])
  .controller('SomeOtherCtrl', [function() {

  }]);
