'use strict';

angular.module('Hesperides.controllers').controller('PropertiesCtrl', ['$scope', '$routeParams', 'Properties', 'Template', 'FileGenerator', 'Page',  function ($scope, $routeParams, Properties, Template, FileGenerator, Page) {
    Page.setTitle("Properties");
	
	var preview = CodeMirror.fromTextArea(document.getElementById('preview'), {
        mode: "text",
		readOnly: true
    });
	
	/* Chargement des properties */
	Properties.get({version: $routeParams.version, application: $routeParams.application, platform: $routeParams.platform, filename: $routeParams.filename})
			.$promise.then(function(properties){
				/* retourne les properties existantes */
				return properties;
			}, function(error) {
				/* Pas de properties existante, on créer le wrapper pour les nouvelles */
				return new Properties({version: $routeParams.version, application: $routeParams.application, platform: $routeParams.platform, filename: $routeParams.filename});
			}).then(function(properties){
				/* Recherche du template associé */
				Template.get({version: $routeParams.version, application: $routeParams.application, filename: $routeParams.filename})
						.$promise.then(function(template){
									
							properties.rebuildScopeWithTemplate(template);
							$scope.properties = properties;	
								
						}, function(error){
							alert('Aucun template pour '+$routeParams.application+'/'+$routeParams.version+'/'+$routeParams.filename);
						});
			});
   
   
    //Use save in progress to avoid double saves (when model is updated by server response for instance)
	var saveInProgress = false;
	$scope.SaveCurrentProperties = function() {
		if($scope.properties && !saveInProgress){
			saveInProgress = true;
			if($scope.properties.id){
				$scope.properties.$save();
			} else {
				$scope.properties.$put();
			}
			saveInProgress = false;
		}
	};
	
	$scope.generatePreview = function() {
		FileGenerator.generate($routeParams.application, $routeParams.version, $routeParams.platform, $routeParams.filename).then(function(filecontent){
			preview.setValue(filecontent);
		});
	};
	
	$scope.addEvaluatedField = function(iterableProperty) {
		var propsSet = _.reduce(iterableProperty.fields, function(array, field){
			array.push({
				name: field.name,
				value: '',
				comment: field.comment
			});
			return array;
		}, []);
		iterableProperty.evaluatedFields['newname']=propsSet;
	};
	
	
	//Save properties when it changes, with a 1 second timeout to avoid multiple save
	//var save_timeout = null;
	//$scope.$watch('properties', function(oldVal, newVal){	
	//	if(save_timeout){
	//		$timeout.cancel(save_timeout);
	//	}
			
	//	save_timeout = $timeout($scope.SaveCurrentProperties, 1000);
	//}, true);
  
	
   
   
}]);
