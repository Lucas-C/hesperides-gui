'use strict';

angular.module('Hesperides.controllers').controller('ContextCtrl', ['$scope', '$routeParams', 'Context', 'Page', function ($scope, $routeParams, Context, Page) {
    Page.setTitle("Contextes");
	
	$scope.application = $routeParams.application;
	$scope.component = $routeParams.component;
	$scope.version = $routeParams.version;
	$scope.namespace = "app."+$routeParams.application+"."+$routeParams.version+"."+$routeParams.component;
	
	/* Load technos list */
	Context.get($scope.namespace, $routeParams.name).then(function(context) {
		$scope.context = context;
	});
	
	$scope.save_context = function(context) {
		if(_.isUndefined(context.id)){
			Context.create(context).then(function(){
				$scope.context = context;
				$.notify("Le contexte a bien ete cree", "success");
			}, function(error) {
				$.notify(error.data, "error");
			});
		} else {
			Context.update(context).then(function(){
				$scope.context = context;
				$.notify("Le contexte a bien ete mises a jour", "success");
			}, function(error) {
				$.notify(error.data, "error");
			});
		}
	};	
	
}]);
