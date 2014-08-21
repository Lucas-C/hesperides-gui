'use strict';

var TemplateEntry = function(template) {
	this.name = template.name;
	this.namespace = template.hesnamespace;
	this.filename = template.filename;
	this.location = template.location;
}

angular.module('Hesperides.controllers').controller('TechnosCtrl', ['$scope', '$routeParams', '$modal', 'Template', 'Properties', 'Page', function ($scope, $routeParams, $modal, Template, Properties, Page) {
    Page.setTitle("Technos");
	
	$scope.namespace = "technos."+$routeParams.name+'.'+$routeParams.version
	
	$scope.codeMirrorOptions = {
		mode: 'text',
		lineNumbers: true,
		extraKeys: {
            'F11': function(cm) {
				$('body').append($('#templateContent')); //Change the parent of codemirror because if not, fullscreen is restricted to the modal
                $('#templateContent').children().css("z-index", 100000);
				cm.setOption('fullScreen', true);
				cm.focus();
            },
           'Esc': function(cm) {
				$('#templateContentParent').append($('#templateContent'));
                if (cm.getOption('fullScreen')) cm.setOption('fullScreen', false);
				cm.focus();
            }
        }
	};
	
	
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
		$scope.templateModalInstance = $modal.open({
			templateUrl: 'edit-template-modal.html',
			backdrop: 'static',
			size: 'lg',
			keyboard: false,
			scope: $scope
		});
		
		$scope.templateModalInstance.result.then(function(template){
			$scope.save_template(template);
		});
	};

	$scope.save_template = function(template) {
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

