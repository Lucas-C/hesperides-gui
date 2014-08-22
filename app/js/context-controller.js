'use strict';

angular.module('Hesperides.controllers').controller('ContextCtrl', ['$scope', '$routeParams', '$location', 'Application', 'Context', 'Page', function ($scope, $routeParams, $location, Application, Context, Page) {
    Page.setTitle("Contextes");
	
	$scope.application = $routeParams.application;
	$scope.component = $routeParams.component;
	$scope.version = $routeParams.version;
	$scope.namespace = "app."+$routeParams.application+"."+$routeParams.version+"."+$routeParams.component;
	
	Application.get({name: $routeParams.application, version: $routeParams.version}).$promise.then(function(application){		
		$scope.application_object = application;	
	}, function(error){
		$.notify(error.data, "error");
	});	
	
	/* Load context list */
	if($routeParams.context){
		Context.get($scope.namespace, $routeParams.context).then(function(context) {
			$scope.context = context;
		});
	}
	
	$scope.load_context = function(context_name) {
		$location.path("#/contexts/"+$routeParams.application+"/"+$routeParams.version+"/"+$routeParams.component+"?context="+context_name);
	};
		
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
