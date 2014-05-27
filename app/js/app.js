'use strict';


// Declare app level module which depends on filters, and services
angular.module('Hesperides', [
  'ngRoute',
  'Hesperides.controllers',
  'Hesperides.filters',
  'Hesperides.services',
  'Hesperides.directives',
  'ui.bootstrap'
]).
    config(['$routeProvider', function ($routeProvider) {
  $routeProvider.
		when('/application/:application/:platform', {
			templateUrl: 'application.html',
                controller: 'ApplicationCtrl'
		}).
		when('/instances', {
				templateUrl: 'partials/instance-list.html', 
				controller: 'InstancesCtrl'
            }).
        when('/search', {
                templateUrl: 'partials/search.html',
                controller: 'SearchCtrl'
		}).
		otherwise({
			redirectTo: '/search',
		});
}]);
