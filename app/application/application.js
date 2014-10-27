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
        ApplicationService.save(application).then(function(application){
            $scope.application = application;
        });
    };

    // This function is used to add a new unit to the application
    $scope.create_unit = function(name) {
        return $scope.application.add_unit(name);
    };

    $scope.delete_unit = function(unit) {
        $scope.application.remove_unit(unit);
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

    $scope.is_unit_selected = function() {
        return !_.isUndefined($scope.unit);
    };

    /* This function is used to find technos not already chosen */
    $scope.search_technos = function(name, chosenTechnos) {
        return TechnoService.with_name_like(name).then(function(technosByName){
            return _(technosByName).flatten().reject(function(techno) {
                return  _.contains(chosenTechnos, techno.namespace);
            }).value();
        });
    };

    $scope.create_techno = function(techno) {
        return $scope.unit.add_techno(techno);
    };

    $scope.delete_techno = function(techno){
        $scope.unit.remove_techno(techno);
    };

    $scope.$on("hesperidesTemplateChanged", function(event){
        //Use timeout because of elasticsearch indexation
        setTimeout(function(){
            $scope.$broadcast('hesperidesModelRefresh');
        }, 1000);
    });

    $scope.$watch("unit", function(){
        if($scope.unit){
            $scope.$broadcast('hesperidesModelRefresh');
        }
    }, true);

}]);

applicationModule.factory('Application', ['Unit', function(Unit){

    var Application = function(data) {

        var me = this;

        angular.extend(this, {
            name: "",
            version: "",
            units: [],
            versionID: -1
        }, data);

        //Object casting when application is created
        this.units = _.map(this.units, function(data){
            return new Unit({
                name: data.name,
                technos: data.technos,
                namespace: "app."+me.name+"."+me.version+"."+data.name
            });
        });

        this.remove_unit = function(unit){
            _.remove(this.units, unit);
        };

        this.hasUnit = function(name){
            return _.some(this.units, function(unit){
               return unit.name === name;
            });
        };

        this.add_unit = function(name){
            var unit = new Unit({
                name:name,
                technos: [],
                namespace: "app."+this.name+"."+this.version+"."+name
            });
            if(!this.hasUnit(name)){
              this.units.push(unit);
            }
            return unit;
        };

    };

    return Application;

}]);

applicationModule.factory('Unit', function(){

    var Unit = function(data){

        var me = this;

        angular.extend(this, {
            name: "",
            namespace: "",
            technos: []
        }, data);


        this.modelNamespaces = [];
        this.modelNamespaces.push(this.namespace);
        _.each(this.technos, function(techno){
            me.modelNamespaces.push(techno);
        });

        this.add_techno = function(techno){
            if(!_.contains(this.technos, techno.namespace)){
                this.technos.push(techno.namespace);
                this.modelNamespaces.push(techno.namespace);
            }
            return techno.namespace;
        };

        this.remove_techno = function(techno){
            _.remove(this.technos, function(value){ return value === techno});
            _.remove(this.modelNamespaces, function(value){ return value === techno});
        };

    };

    return Unit;

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