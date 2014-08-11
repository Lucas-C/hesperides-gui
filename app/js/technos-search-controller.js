'use strict';

angular.module('Hesperides.controllers').controller('TechnosSearchCtrl', ['$scope', '$routeParams', 'Technos', 'Page', function ($scope, $routeParams, Technos, Page) {
    Page.setTitle("Technos");
	
	/* Load technos list */
	Technos.all().then(function(technos) {
		$scope.technos = technos;
	});
	
	
	
}]);
