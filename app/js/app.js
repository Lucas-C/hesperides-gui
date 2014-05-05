'use strict';


// Declare app level module which depends on filters, and services
angular.module('Hesperides', [
  'ngRoute',
  'Hesperides.filters',
  'Hesperides.services',
  'Hesperides.directives',
  'Hesperides.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.
		when('/instances', {
				templateUrl: 'partials/instance-list.html', 
				controller: 'InstancesCtrl'
		}).
		when('/instance/:id', {
				templateUrl: 'partials/instance.html', 
				controller: 'InstanceCtrl'
		}).
		otherwise({
			redirectTo: '/instances'
		});
}]);
