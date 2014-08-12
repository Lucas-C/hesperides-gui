'use strict';

var Application = function() {
	this.units = [];
}

var Unit = function() {
	this.technos = [];
	this.hasTechno = function(techno) {
		var namespaces = _.pluck(this.technos, "namespace");
		return  _.contains(namespaces, techno.namespace);
	};
}

angular.module('Hesperides.controllers').controller('ApplicationCtrl', ['$scope', '$routeParams', 'Technos', 'Template', 'Page', function($scope, $routeParams, Technos, Template, Page) {
    
	Page.setTitle($routeParams.application+" version "+$routeParams.version);
	
	$scope.application = new Application();
	
	$scope.get_technos = function(name, chosenTechnos) {
		return Technos.like(name).then(function(technosByName){
			chosenTechnos = _.pluck(chosenTechnos, "namespace");
			return _.chain(technosByName).flatten().reject(function(techno) { 
				return  _.contains(chosenTechnos, techno.namespace);
			}).value();
		});
	};
	
	$scope.add_unit = function(application) {
		var unit = new Unit();
		application.units.push(unit);
		$scope.editingUnit = unit;
	};
	
	$scope.edit_unit = function(unit) {
		$scope.editingUnit = unit;	
	};
	
	$scope.add_techno = function(techno, unit) {
		if(techno instanceof Techno && !unit.hasTechno(techno)) unit.technos.push(techno);
	};
	
	$scope.is_editing = function() {
		return !_.isUndefined($scope.editingUnit);
	}
	
	/* Peut etre factorise avec techno controller */
	$scope.add_template = function() {
		$scope.template = new Template({hesnamespace: $scope.editingUnit.namespace});
		$scope.show_edit_template();
	};
	
	$scope.delete_template = function(namespace, name) {
		Template.delete({namespace: namespace, name: name}).$promise.then(function(){
			$scope.editingUnit.templateEntries = _.reject($scope.editingUnit.templateEntries, function(templateEntry) { return templateEntry.name === name; });
			$.notify("Le template a bien ete supprime", "success"); 
		}, function(error) {
			$.notify(error.data, "error");
		});
	};
	
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
				$scope.editingUnit.templateEntries.push(new TemplateEntry($scope.template));
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

