'use strict';

angular.module('Hesperides.controllers').controller('PropertiesCtrl', ['$scope', '$routeParams', 'Properties', 'Template', 'FileGenerator', 'Page',  function ($scope, $routeParams, Properties, Template, FileGenerator, Page) {
    Page.setTitle("Properties");
	
	var preview = CodeMirror.fromTextArea(document.getElementById('preview'), {
        mode: "text",
		readOnly: true
    });
	
	Properties.get({version: $routeParams.version, application: $routeParams.application, platform: $routeParams.platform, filename: $routeParams.filename})
								.$promise.then(function(properties){
									return properties;
								}, function(error) {
									return new Properties({version: $routeParams.version, application: $routeParams.application, platform: $routeParams.platform, filename: $routeParams.filename});
								}).then(function(properties){
									Template.get({version: $routeParams.version, application: $routeParams.application, filename: $routeParams.filename})
									.$promise.then(function(template){
										
									//Merge avec la description du template
									//Algo basique :
									//Le template a tjs raison
									//pour les keyValueProperties -> ne garder que celles qui ont le même nom, ajouter les manquantes
									//pour les iterableProperties -> ne garder que celles qui ont le même nom+même fields, ajouter les manquantes
									var propertiesScope = {}; 
									propertiesScope['keyValueProperties'] = [];
									propertiesScope['iterableProperties'] = [];
									template.scope.keyValueProperties.forEach(function(keyValueProp){
										var existing = _.find(properties.scope.keyValueProperties, function(existingProp){
											return existingProp.name === keyValueProp.name;
										})
										if(existing) { 
											propertiesScope['keyValueProperties'].push(existing); 
										} else {
											propertiesScope['keyValueProperties'].push(keyValueProp);
										}
									});
									_.each(template.scope.iterableProperties, function(iterableProp){
										var existing = _.find(properties.scope.iterableProperties, function(existingProp){
											var bool = (existingProp.name === iterableProp.name);
											if(bool){
												/* Check fields */
												if(existingProp.fields){
													bool = existingProp.fields.length === iterableProp.fields.length
												}
												if(bool){
													/* regarder si tous les fields de existing sont dans iterableProp (le template) */
													return _.every(existingProp.fields, function(existingField){
															var result = _.find(iterableProp.fields, function(field){ return field.name === existingField.name });
															if(result) return true; else return false;
														});
												}
											}
											return bool;
										})
										if(existing) { 
											propertiesScope['iterableProperties'].push(existing); 
										} else {
											propertiesScope['iterableProperties'].push(iterableProp);
										}
									});
									
									properties.scope = propertiesScope;
									$scope.properties = properties;	
										
									}, function(error){
										alert('Aucun template pour '+$routeParams.application+'/'+$routeParams.version+'/'+$routeParams.filename);
									})
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
