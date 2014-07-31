'use strict';

angular.module('Hesperides.controllers').controller('PropertiesCtrl', ['$scope', '$routeParams', 'Properties', 'Template', 'FileGenerator', 'Page',  function ($scope, $routeParams, Properties, Template, FileGenerator, Page) {
    Page.setTitle("Properties");
	
	var preview = CodeMirror.fromTextArea(document.getElementById('preview'), {
        mode: "text",
		readOnly: true,
		lineNumbers: true,
		viewportMargin: Infinity
    });
	
	/* Chargement des properties */
	Properties.get({version: $routeParams.version, application: $routeParams.application, platform: $routeParams.platform, template_name: $routeParams.template_name})
			.$promise.then(function(properties){
				/* retourne les properties existantes */
				return properties;
			}, function(error) {
				/* Pas de properties existante, on créer le wrapper pour les nouvelles */
				return new Properties({version: $routeParams.version, application: $routeParams.application, platform: $routeParams.platform, template_name: $routeParams.template_name});
			}).then(function(properties){
				/* Recherche du template associé */
				Template.get({version: $routeParams.version, application: $routeParams.application, name: $routeParams.template_name})
						.$promise.then(function(template){
									
							properties.rebuildScopeWithTemplate(template);
							$scope.properties = properties;	
								
						}, function(error){
							alert('Aucun template pour '+$routeParams.application+'/'+$routeParams.version+'/'+$routeParams.template_name);
						});
			});
   
   
    //Use save in progress to avoid double saves (when model is updated by server response for instance)
	var saveInProgress = false;
	$scope.SaveCurrentProperties = function() {
		if($scope.properties && !saveInProgress){
			saveInProgress = true;
			if($scope.properties.id){
				$scope.properties.$update();
			} else {
				$scope.properties.$create();
			}
			saveInProgress = false;
		}
	};
	
	$scope.generatePreview = function() {
		FileGenerator.generate($routeParams.application, $routeParams.version, $routeParams.platform, $routeParams.template_name).then(function(filecontent){
			preview.setValue(filecontent);
		});
	};
	
	$scope.addEvaluatedField = function(iterableProperties) {
		var fields = _.reduce(iterableProperties.fields, function(array, field){
			array.push({
				name: field.name,
				value: '',
				comment: field.comment
			});
			return array;
		}, []);
		iterableProperties.evaluatedFields.push(new EvaluatedField('newname', fields));
	};
	
	$scope.removeEvaluatedField = function(iterableProperties, field) {
		iterableProperties.evaluatedFields.splice(iterableProperties.evaluatedFields.indexOf(field),1);
	}
	
	
	//Save properties when it changes, with a 1 second timeout to avoid multiple save
	//var save_timeout = null;
	//$scope.$watch('properties', function(oldVal, newVal){	
	//	if(save_timeout){
	//		$timeout.cancel(save_timeout);
	//	}
			
	//	save_timeout = $timeout($scope.SaveCurrentProperties, 1000);
	//}, true);
  
	
   
   
}]);
