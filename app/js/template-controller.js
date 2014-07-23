'use strict';

angular.module('Hesperides.controllers').controller('TemplateCtrl', ['$scope', '$routeParams', 'Template', 'Page',  function ($scope, $routeParams, Template, Page) {
    Page.setTitle("Templates");
	
	var templateTextArea = CodeMirror.fromTextArea(document.getElementById('template'), {
        mode: "text",
		lineNumbers: true,
		lineWrapping: true
    });
	
	Template.get({version: $routeParams.version, application: $routeParams.application, filename: $routeParams.filename})
								.$promise.then(function(template){
									$scope.template = template;
									templateTextArea.setValue(template.template);
								}, function(error) {
									$scope.template = new Template({version: $routeParams.version, application: $routeParams.application, filename: $routeParams.filename});
								});
   
   
    //Use save in progress to avoid double saves
	var saveInProgress = false;
	$scope.SaveCurrentTemplate = function() {
		if($scope.template && !saveInProgress){
			saveInProgress = true;
			$scope.template.template = templateTextArea.getValue();
			if($scope.template.id){
				$scope.template.$save();
			} else {
				$scope.template.$put();
			}
			saveInProgress = false;
		}
	};

}]);
