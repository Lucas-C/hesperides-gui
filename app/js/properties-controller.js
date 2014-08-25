'use strict';

angular.module('Hesperides.controllers').controller('PropertiesCtrl', ['$scope', '$routeParams', 'Properties', 'Template', 'FileGenerator', 'Page',  function ($scope, $routeParams, Properties, Template, FileGenerator, Page) {
    Page.setTitle("Properties");
	
	/* Properties */
	$scope.refresh_unit_properties = function() {
		var model_namespaces = [];
		model_namespaces.push("app."+$routeParams.application+"."+$routeParams.version+"."+$scope.editing_unit.name);
		_.each($scope.editing_unit.technos, function(techno){ model_namespaces.push(techno) });
		Properties.getProperties("app."+$routeParams.application+"."+$routeParams.version+"."+$scope.editing_unit.name, model_namespaces).then(function(properties){
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
