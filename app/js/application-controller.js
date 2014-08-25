'use strict';

angular.module('Hesperides.controllers').controller('ApplicationCtrl', ['$scope', '$routeParams', '$modal', 'Technos', 'Template', 'Application', 'Properties', 'Page', '$q', function($scope, $routeParams, $modal, Technos, Template, Application, Properties, Page, $q) {
    
	Page.setTitle($routeParams.application+" version "+$routeParams.version);
	
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
	
	$scope.focus_choose_techno = function() {
		window.setTimeout(function(){
            $('#chooseTechnoInput').focus();
        },80);
	};
	
	
	Application.get({name: $routeParams.application, version: $routeParams.version}).$promise.then(function(application){		
		$scope.application = application;	
	}, function(error){
		if(error.status != 404){
			$.notify(error.data, "error");
		} else {
			$scope.application = new Application({name: $routeParams.application, version: $routeParams.version, units: []});
		}
	});
	
	$scope.save = function(application) {
		if(application.id){
			application.$update(function(){
				$.notify("L'application a bien ete mise a jour", "success");
			}, function(error) {
				$.notify(error.data, "error");
			});
		} else {
			application.$create(function(){
				$.notify("L'application a bien ete creee", "success");
			}, function(error) {
				$.notify(error.data, "error");
			});
		}
	};
	
	$scope.get_technos = function(name, chosenTechnos) {
		return Technos.like(name).then(function(technosByName){
			return _.chain(technosByName).flatten().reject(function(techno) { 
				return  _.contains(chosenTechnos, techno.namespace);
			}).value();
		});
	};
	
	$scope.add_unit = function(application) {
		var unit = {name:"Change me!", technos: []};
		application.units.push(unit);
		$scope.edit_unit(unit);
	};
	
	$scope.del_unit = function(unit, application) {
		_.remove(application.units, unit);
		$scope.editing_unit = undefined;
	};
	
	$scope.update_unit_title = function(new_title) {
		/* We need to resave the templates with a different namespace 
		   Then save the application with the new unit name
		   Then delete the ones with the old namespace
		   Proceding in this order guaranties no loss of data		   */
		if(new_title === $scope.editing_unit.name){
			return true; /* Display no error but do nothing */
		}
		   
		var new_namespace = "app."+$routeParams.application+"."+$routeParams.version+"."+new_title;   
		   
		return _.reduce($scope.templateEntries, function(promise, tEntry) { 
			return promise.then(function(){ return Template.get({namespace: tEntry.namespace, name: tEntry.name}).$promise; })
						  .then(function(template){
									template.hesnamespace = new_namespace;
									return template.$create();
								})
		}, $q.when()).then(function(){
			/* Update or create the app */
			$scope.editing_unit.name = new_title;
			if($scope.application.id){
				return $scope.application.$update();
			} else {
				return $scope.application.$create();
			}
		}).then(function(){
			/* Construct the chain of deletion */
			return _.reduce($scope.templateEntries, function(promise, tEntry) {
				return promise.then(function() { return Template.delete({namespace: tEntry.namespace, name: tEntry.name}).$promise; });
			}, $q.when());
			
		}).then(function(){
			/* Everything went well, update model*/
			_.each($scope.templateEntries, function(tEntry) { tEntry.namespace = "app."+$routeParams.application+"."+$routeParams.version+"."+new_title; });
			return true;
			
		}, function(error) {
			return "Probleme : "+error.data;
		});
		   
	};
		
	$scope.get_current_unit_namespace = function() {
		return "app."+$routeParams.application+"."+$routeParams.version+"."+$scope.editing_unit.name;
	}
	
	$scope.edit_unit = function(unit) {
		$scope.editing_unit = unit;
		/* Load the templates */
		Template.all({namespace: $scope.get_current_unit_namespace()}).$promise.then(function(templateEntries){
			$scope.templateEntries = templateEntries;
		}, function(error) {
			if(error.status != 404){
				$.notify(error.data, "error");
			}
			$scope.templateEntries = [];
		});
		
		$scope.refresh_unit_properties();
	};
	
	$scope.add_techno = function(techno, unit) {
		if(!_.contains(unit.technos, techno.namespace)){
			unit.technos.push(techno.namespace);
			setTimeout($scope.refresh_unit_properties, 1000);
		}
	};
	
	$scope.del_techno = function(techno_namespace, unit) {
		unit.technos = _.without(unit.technos, techno_namespace);
		setTimeout($scope.refresh_unit_properties, 1000);
	};
	
	$scope.is_editing = function() {
		return !_.isUndefined($scope.editing_unit);
	}
	
	/* Peut etre factorise avec techno controller */
	$scope.add_template = function() {
		$scope.template = new Template({hesnamespace: $scope.get_current_unit_namespace()});
		$scope.show_edit_template();
	};
	
	$scope.delete_template = function(namespace, name) {
		Template.delete({namespace: namespace, name: name}).$promise.then(function(){
			$scope.templateEntries = _.reject($scope.templateEntries, function(templateEntry) { return templateEntry.name === name; });
			$.notify("Le template a bien ete supprime", "success"); 
			setTimeout($scope.refresh_unit_properties, 1000);
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
		$scope.template.template = $scope.templateTextArea.getValue();
		if($scope.template.id){
			$scope.template.$update(function(){
				$.notify("Le template a ete mis a jour", "success");
				setTimeout($scope.refresh_unit_properties, 1000);
			}, function(error){
				$.notify(error.data, "error");
			});
		} else {
			$scope.template.$create(function(){
				$.notify("Le template bien ete cree", "success");
				$scope.templateEntries.push(new TemplateEntry($scope.template));
				setTimeout($scope.refresh_unit_properties, 1000);
			}, function(error){
				if(error.status === 409){
					$.notify("Impossible de creer le template car il existe deja un template avec ce nom", "error");
				} else {
					$.notify(error.data, "error");
				}
			});
		}
	};
	
	/* Properties */
	$scope.refresh_unit_properties = function() {
		var model_namespaces = [];
		model_namespaces.push("app."+$routeParams.application+"."+$routeParams.version+"."+$scope.editing_unit.name);
		_.each($scope.editing_unit.technos, function(techno){ model_namespaces.push(techno) });
		Properties.getModel(model_namespaces).then(function(propertiesModel){
			$scope.propertiesModel = propertiesModel;
		});
	
	};
			
}]);

