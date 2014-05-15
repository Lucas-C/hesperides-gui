'use strict';

var hesperidesServices = angular.module('Hesperides.services', ['ngResource']).
  value('version', '0.1');
  
hesperidesServices.factory('Instance', ['$resource', function($resource){

		return $resource('/rest/instances/:id', {id: '@id'}, {
			all: {method:'GET', params:{id:''}, isArray:true},
			put: {method:'PUT'}
		});

}]);


hesperidesServices.factory('Search', ['$http', function($http){

		return {
			instances: function(application, component) {
				return $http.get('/search?application='+application+'&platform='+component).then(function(result) {
					return result.data;
				});
			}
		};

}]);

