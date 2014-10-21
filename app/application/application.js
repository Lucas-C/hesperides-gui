/**
 * Created by william_montaz on 17/10/2014.
 */
var applicationModule = angular.module('hesperides.application', []);


applicationModule.controller('ApplicationCtrl', ['$scope', '$routeParams', '$modal', 'TechnoService', 'TemplateService', 'ApplicationService', 'PropertiesService', 'Page', '$q', function($scope, $routeParams, $modal, TechnoService, TemplateService, ApplicationService, PropertiesService, Page, $q) {

    Page.setTitle('Applications');

    /* Try to find the corresponding application */
    ApplicationService.get($routeParams.application, $routeParams.version).then(function(application){
        $scope.application = application;
    });

    /* This function is used to save the application */
    $scope.save = function(application) {
        $scope.application = ApplicationService.save(application);
    };

    // This function is used to add a new unit to the application
    $scope.add_unit = function(name) {
        var unit = $scope.application.add_new_empty_unit(name);
        $scope.edit_unit(unit);
    };

    //This function is used to remove a unit from the application
    $scope.del_unit = function(unit) {
        $scope.application.remove_unit(unit);
        $scope.unit = undefined;
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

    $scope.edit_unit = function(unit) {
        $scope.unit = unit;
    };

    $scope.is_editing = function() {
        return !_.isUndefined($scope.unit);
    };

    /* This function is used to find technos not already chosen */
    $scope.get_technos = function(name, chosenTechnos) {
        return TechnoService.with_name_like(name).then(function(technosByName){
            return _(technosByName).flatten().reject(function(techno) {
                return  _.contains(chosenTechnos, techno.namespace);
            }).value();
        });
    };

    $scope.add_techno = function(techno, unit) {
        if(!_.contains(unit.technos, techno.namespace)){
            unit.technos.push(techno.namespace);
            //$scope.refresh_unit_properties(1000);
        }
    };

    $scope.del_techno = function(techno, unit) {
        unit.technos = _.without(unit.technos, techno.namespace);
        //$scope.refresh_unit_properties(1000);
    };

    $scope.$on("hesperidesTemplateChanged", function(event){
        //Use timeout because of elasticsearch indexation
        setTimeout(function(){
            $scope.$broadcast('hesperidesModelRefresh');
        }, 1000);
    });

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
            _.remove(this.units, unit);
        };

        this.modelNamespacesOfUnit = function(unit){
            var namespaces = [];
            namespaces.push(this.namespaceOfUnit(unit));
            _.each(unit.technos, function(techno){
                namespaces.push(techno);
            });
            return namespaces;
        };

        this.namespaceOfUnit = function(unit){
            return "app."+this.name+"."+this.version+"."+unit.name;
        };

    };

    return Application;

});

applicationModule.factory('ApplicationService', ['$http', 'Application', function ($http, Application) {

    return{
        get: function(name, version) {
            return $http.get('rest/applications/'+name+'/'+version).then(function(response) {
                return new Application(response.data);
            }, function(error){
                if(error.status != 404){
                    $.notify(error.data, "error");
                } else {
                    //If not found return a new Application
                    return new Application({name: name, version: version});
                }
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