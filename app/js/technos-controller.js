'use strict';

var TemplateEntry = function(template) {
	this.name = template.name;
	this.namespace = template.hesnamespace;
	this.filename = template.filename;
	this.location = template.location;
}

angular.module('Hesperides.controllers').controller('TechnosCtrl', ['$scope', '$routeParams', 'Template', 'Properties', 'Page', function ($scope, $routeParams, Template, Properties, Page) {
    Page.setTitle("Technos");
	
	$scope.namespace = "technos."+$routeParams.name+'.'+$routeParams.version
	
	/* Load template list */
	Template.all({namespace: $scope.namespace}).$promise.then(function(templateEntries){
		$scope.templateEntries = templateEntries;
	}, function(error) {
		if(error.status != 404){
			$.notify(error.data, "error");
		}
		$scope.templateEntries = [];
	});
	
	/* Load Properties */
	Properties.getModel($scope.namespace).then(function(propertiesModel){
		$scope.propertiesModel = propertiesModel;
	}, function(error) {
		$.notify(error.data, "error");
	});
		
	/* Functions */
	$scope.refresh_properties = function() {
		Properties.getModel($scope.namespace).then(function(propertiesModel){
			$scope.propertiesModel = propertiesModel;
			$.notify("Properties mise a jour", "success");
		}, function(error) {
			$.notify(error.data, "error");
		});
	};
			
	$scope.add_template = function(namespace) {
		$scope.template = new Template({hesnamespace: namespace});
		$scope.show_edit_template();
	};
	
	$scope.delete_template = function(namespace, name) {
		Template.delete({namespace: namespace, name: name}).$promise.then(function(){
			$scope.templateEntries = _.reject($scope.templateEntries, function(templateEntry) { return templateEntry.name === name; });
			$.notify("Le template a bien ete supprime", "success"); 
		}, function(error) {
			$.notify(error.data, "error");
		});
	}
	
	$scope.edit_template = function(namespace, name){
		Template.get({namespace: namespace, name: name}).$promise.then(function(template){
			$scope.template = template;
			$scope.show_edit_template();
		}, function(error) {
			$.notify(error.data, "error");
		});
	};
	
	$scope.show_edit_template = function() {
		$('#template-edit-modal').on('shown.bs.modal', function() {
			/* Load CodeMirror */
			if(_.isUndefined($scope.templateTextArea)) $scope.templateTextArea = CodeMirror.fromTextArea(document.getElementById('template-textarea'), {
				mode: "text",
				lineNumbers: true
			});
			$scope.templateTextArea.setValue($scope.template.template || "");
		});
		$('#template-edit-modal').modal('show');
	};

	$scope.save_template = function(template) {
		$scope.template.template = $scope.templateTextArea.getValue();
		if($scope.template.id){
			$scope.template.$update(function(){
				$.notify("Le template a ete mis a jour", "success");
			}, function(error){
				$.notify(error.data, "error");
			});
		} else {
			$scope.template.$create(function(){
				$.notify("Le template bien ete cree", "success");
				$scope.templateEntries.push(new TemplateEntry($scope.template));
			}, function(error){
				if(error.status === 409){
					$.notify("Impossible de creer le template car il existe deja un template avec ce nom", "error");
				} else {
					$.notify(error.data, "error");
				}
			});
		}
	};
	
}]);

