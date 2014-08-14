'use strict';

angular.module('Hesperides.controllers').controller('ContextCtrl', ['$scope', '$routeParams', 'Context', 'Page', function ($scope, $routeParams, Context, Page) {
    Page.setTitle("Contextes");
	
	$scope.namespace = "app."+$routeParams.application+"."+$routeParams.version+"."+$routeParams.component;
	
	/* Load technos list */
	Context.get($scope.namespace, $routeParams.name).then(function(context) {
		$scope.context = context;
	});
	
	
	
}]);
