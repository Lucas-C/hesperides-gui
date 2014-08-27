'use strict';

angular.module('Hesperides.controllers').controller('ContextCtrl', ['$scope', '$routeParams', '$location', 'Application', 'Platform', 'Context', 'Page', function ($scope, $routeParams, $location, Application, Platform, Context, Page) {
    Page.setTitle("Instances");
	
	$scope.platforms = []
	
	/* Define these functions now for reuse */
	$scope.$watch('chosen_unit', function() {
		/* Detect if we need to load contexts */
		if($scope.is_platform_chosen() && $scope.is_unit_chosen()){
			Context.all("contexts."+$scope.application.name+"."+$scope.application.version+"."+$scope.chosen_platform+"."+$scope.chosen_unit.name).then(function(contexts){
				$scope.contexts = contexts;
			});
		} else {
			$scope.contexts = undefined;
			$scope.context = undefined;
		}
	});
	
	$scope.is_platform_chosen = function(){
		return !(_.isNull($scope.chosen_platform) || _.isUndefined($scope.chosen_platform));
	};
	
	$scope.is_unit_chosen = function(){
		return !(_.isNull($scope.chosen_unit) || _.isUndefined($scope.chosen_unit));
	};
	
	$scope.is_context_chosen = function(){
		return !(_.isNull($scope.chosen_context) || _.isUndefined($scope.chosen_context));
	};
	
	$scope.display_context = function() {
		return !(_.isNull($scope.context) || _.isUndefined($scope.context));
	}
	
	$scope.choose_platform = function(platform_name){
		$scope.chosen_platform = platform_name;
		$scope.chosen_unit = undefined;
		$scope.chosen_context = undefined;
	};
	
	$scope.choose_unit = function(unit_name){
		$scope.chosen_unit = unit_name;
		$scope.chosen_context = undefined;
	};
	$scope.choose_context = function(context_name){
		return $scope.load_context(context_name).then(function(context){
			$scope.chosen_context = context;
			return context;
		});
	};
	
	Application.get({name: $routeParams.application, version: $routeParams.version}).$promise.then(function(application){		
		$scope.application = application;
		/* If unit was mentionned in the route, try to find it */
		/* If it does not exist show error */
		if($routeParams.unit){
			var actual_unit = _.find(application.units, function(unit){ return unit.name === $routeParams.unit; });
			if(_.isUndefined(actual_unit)){
				$.notify("La brique technique mentionee ddans l'url n'existe pas", "error");
			} else {
				$scope.chosen_unit = actual_unit;
			}
		};	
	}, function(error){
		$.notify(error.data, "error");
	});

	/* Find all the platforms */
	Platform.get($routeParams.application, $routeParams.version).then(function(platforms){
		$scope.platforms = platforms;
		if(_.contains($scope.platforms, $routeParams.platform)){
			$scope.chosen_platform = $routeParams.platform;
		}
	});
	
	$scope.focus_name_context = function() {
		window.setTimeout(function(){
            $('#nameContextInput').focus();
        },80);
	};
	
	$scope.add_context = function(name){
		if(!_.some($scope.contexts, function(context){ return context.name === name; })){
			$scope.choose_context(name).then(function(context) {
				$scope.contexts.push(context);
			});
		}
	};
	
	$scope.load_context = function(name){
		return Context.get("properties."+$scope.application.name+"."+$scope.application.version+"."+$scope.chosen_platform+"."+$scope.chosen_unit.name, 
							"contexts."+$scope.application.name+"."+$scope.application.version+"."+$scope.chosen_platform+"."+$scope.chosen_unit.name, 
							name).then(function(context){
			$scope.context = context;
			return context;
		});
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
