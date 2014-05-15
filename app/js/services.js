'use strict';

var hesperidesServices = angular.module('Hesperides.services', ['ngResource']).
  value('version', '0.1');
  
hesperidesServices.factory('Instance', ['$resource', function($resource){

		return $resource('/rest/instances/:id', {id: '@id'}, {
			all: {method:'GET', params:{id:''}, isArray:true},
			put: {method:'PUT'}
		});

}]);


hesperidesServices.factory('Search', ['$http', 'Instance', function($http, Instance){

		return {
			instances: function(application, component) {
				return $http.get('/search?application='+application+'&platform='+component).then(function(response) {
					var instances = [];
					for(var i=0; i<response.data.length; i++){
						var instance = new Instance(response.data[i]);
						instances.push(instance);
					}
					return instances;
				});
			}
		};

}]);

