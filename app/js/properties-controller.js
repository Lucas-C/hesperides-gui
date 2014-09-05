'use strict';

angular.module('Hesperides.controllers').controller('PropertiesCtrl', ['$scope', '$routeParams', 'Properties', 'Application', 'Platform', 'Page',  function ($scope, $routeParams, Properties, Application, Platform, Page) {
    Page.setTitle("Properties");
	
	$scope.chosen_platform = $routeParams.platform;
	$scope.platforms = []
	
	/* Define these functions now for reuse */
	$scope.$watch('chosen_unit', function() {
		/* Detect if we need to load properties */
		if($scope.is_platform_chosen() && $scope.is_unit_chosen()){
			$scope.load_properties($scope.application, $scope.chosen_platform, $scope.chosen_unit);
		} else {
			$scope.properties = undefined;
		}
	});
	
	$scope.is_platform_chosen = function(){
		return !(_.isNull($scope.chosen_platform) || _.isUndefined($scope.chosen_platform));
	};
	
	$scope.is_unit_chosen = function(){
		return !(_.isNull($scope.chosen_unit) || _.isUndefined($scope.chosen_unit));
	};
	
	$scope.display_properties = function() {
		return !(_.isNull($scope.properties) || _.isUndefined($scope.properties));
	}
	
	$scope.choose_platform = function(platform_name){
		$scope.chosen_platform = platform_name;
		$scope.chosen_unit = undefined;
	};
	
	$scope.choose_unit = function(unit_name){
		$scope.chosen_unit = unit_name;
	};
	
	$scope.add_platform = function(platform_name) {
		if(!_.contains($scope.platforms, platform_name)){
			$scope.platforms.push(platform_name);
			$scope.choose_platform(platform_name);
		}
	};
	
	/* Get the application */
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
	}).then(function(){
		/* If platform was mentionned in the route, try to find it or add it */
		if($scope.chosen_platform) $scope.add_platform($scope.chosen_platform);
	});
	
	
	$scope.focus_name_platform = function() {
		window.setTimeout(function(){
            $('#namePlatformInput').focus();
        },80);
	};
	
	/* Properties */
	$scope.load_properties = function(application, platform, unit) {
		var model_namespaces = [];
		model_namespaces.push("app."+application.name+"."+application.version+"."+unit.name);
		_.each(unit.technos, function(techno){ model_namespaces.push(techno) });
		Properties.getProperties("properties."+application.name+"."+application.version+"."+platform+"."+unit.name, model_namespaces).then(function(properties){
			$scope.properties = properties;
		});
	};
	
	$scope.save_properties = function(properties) {
		if(_.isUndefined(properties.id)){
			Properties.create(properties).then(function(){
				$scope.properties = properties;
				$.notify("Les proprietes ont bien ete crees", "success");
			}, function(error) {
				$.notify(error.data, "error");
			});
		} else {
			Properties.update(properties).then(function(){
				$scope.properties = properties;
				$.notify("Les proprietes ont bien ete mises à jour", "success");
			}, function(error) {
				$.notify(error.data, "error");
			});
		}
	};	
   
}]);
