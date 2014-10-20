/**
 * Created by william_montaz on 17/10/2014.
 */
var applicationModule = angular.module('hesperides.application', []);


applicationModule.controller('ApplicationCtrl', ['$scope', '$routeParams', '$modal', 'TechnoService', 'TemplateService', 'ApplicationService', 'PropertiesService', 'Page', '$q', function($scope, $routeParams, $modal, TechnoService, TemplateService, ApplicationService, PropertiesService, Page, $q) {

    Page.setTitle('Applications');

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

    /* Try to find the corresponding application or prepare an object to create it */
    ApplicationService.get($routeParams.application, $routeParams.version).then(function(application){
        $scope.application = application;
    }, function(error){
        if(error.status != 404){
            $.notify(error.data, "error");
        } else {
            $scope.application = new Application({name: $routeParams.application, version: $routeParams.version});
        }
    });

    /* This function is used to save the application */
    $scope.save = function(application) {
        ApplicationService.save(application);
    };

    /* This function is used to find technos not already chosen */
    $scope.get_technos = function(name, chosenTechnos) {
        return Technos.like(name).then(function(technosByName){
            return _.chain(technosByName).flatten().reject(function(techno) {
                return  _.contains(chosenTechnos, techno.namespace);
            }).value();
        });
    };

    // This function is used to add a new unit to the application
    // We set the name change me to force the user to actually change it
    $scope.add_unit = function(name) {
        var unit = $scope.application.add_new_empty_unit(name);
        $scope.edit_unit(unit);
    };

    //This function is used to remove a unit from the application
    $scope.del_unit = function(unit, application) {
        application.remove_unit(unit);
        $scope.editing_unit = undefined;
    };

    //TODO this should be done server side
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

        $scope.refresh_unit_properties(0);
    };

    $scope.add_techno = function(techno, unit) {
        if(!_.contains(unit.technos, techno.namespace)){
            unit.technos.push(techno.namespace);
            $scope.refresh_unit_properties(1000);
        }
    };

    $scope.del_techno = function(techno_namespace, unit) {
        unit.technos = _.without(unit.technos, techno_namespace);
        $scope.refresh_unit_properties(1000);
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
            $scope.refresh_unit_properties(1000);
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
        if($scope.template.id){
            $scope.template.$update(function(){
                $.notify("Le template a ete mis a jour", "success");
                $scope.refresh_unit_properties(1000);
            }, function(error){
                $.notify(error.data, "error");
            });
        } else {
            $scope.template.$create(function(){
                $.notify("Le template bien ete cree", "success");
                $scope.templateEntries.push(new TemplateEntry($scope.template));
                $scope.refresh_unit_properties(1000);
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
    $scope.refresh_unit_properties = function(timeout) {
        $scope.loading_properties = true;
        setTimeout($scope.load_unit_properties, timeout);
    };

    $scope.load_unit_properties = function() {
        var model_namespaces = [];
        model_namespaces.push("app."+$routeParams.application+"."+$routeParams.version+"."+$scope.editing_unit.name);
        _.each($scope.editing_unit.technos, function(techno){ model_namespaces.push(techno) });
        Properties.getModel(model_namespaces).then(function(propertiesModel){
            $scope.propertiesModel = propertiesModel;
        });
        $scope.loading_properties = false;
    };

}]);

applicationModule.factory('Application', function(){

    var Application = function(data) {

        angular.extend(this, {
            name: "",
            version: "",
            units: [],
            versionID: -1
        }, data);

        this.add_new_empty_unit = function(name){
            var unit = {name:name, technos: []};
            this.units.push(unit);
            return unit;
        };

        this.remove_unit = function(unit){
            _.remove(application.units, unit);
        }

    };

    return Application;

});

applicationModule.factory('ApplicationService', ['$http', 'Application', function ($http, Application) {

    return{
        get: function(name, version) {
            return $http.get('rest/applications/'+name+'/'+version).then(function(response) {
                return new Application(response.data);
            });
        },
        save: function(application) {
            if(application.versionID < 0){
                return $http.post('rest/applications/'+application.name+'/'+application.version, application).then(function(response) {
                    $.notify("L'application a bien ete creee", "success");
                    return new Application(response.data);
                }, function(error) {
                    $.notify(error.data, "error");
                });
            } else {
                return $http.put('rest/applications/'+application.name+'/'+application.version, application).then(function(response) {
                    $.notify("L'application a bien ete mise a jour", "success");
                    return new Application(response.data);
                }, function(error) {
                    $.notify(error.data, "error");
                });
            }
        },
        with_name_like: function(name) {
            return $http.get('rest/applications/search/*'+name+'*').then(function(response) {
                return _(response.data)
                    .map(function(data){ return new Application(data); })
                    .groupBy("name")
                    .sortBy("version")
                    .value();
            });
        }

    }

}]);