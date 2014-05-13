'use strict';


// Declare app level module which depends on filters, and services
angular.module('Hesperides', [
  'ngRoute',
  'Hesperides.controllers',
  'Hesperides.filters',
  'Hesperides.services',
  'Hesperides.directives'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.
		when('/application/:application/:platform', {
			templateUrl: 'application.html',
			controller: 'ApplicationCtrl',
		}).
		when('/instances', {
				templateUrl: 'partials/instance-list.html', 
				controller: 'InstancesCtrl'
		}).
		otherwise({
			redirectTo: '/search'
		});
}]);
