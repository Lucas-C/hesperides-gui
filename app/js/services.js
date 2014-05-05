'use strict';

var hesperidesServices = angular.module('Hesperides.services', ['ngResource']).
  value('version', '0.1');
  
hesperidesServices.factory('Instance', ['$resource', function($resource){

		return $resource('/instances/:id', {}, {
			all: {method:'GET', params:{id:''}, isArray:true}
		});

}]);

