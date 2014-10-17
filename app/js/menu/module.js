/**
 * Created by william_montaz on 17/10/2014.
 */
var menuModule = angular.module('hesperides.menu', []);

menuModule.controller('MenuCtrl', ['$scope', '$location', '$modal', 'Application', 'Technos', 'Context', function ($scope, $location, $modal, Application, Technos, Context) {

    /* Technos */
    $scope.get_technos = function(name) {
        return Technos.like(name).then(function(technosByName){
            return _.flatten(technosByName);
        });
    };

    $scope.open_create_techno_dialog = function(){
        $scope.technoModalInstance = $modal.open({
            templateUrl: 'techno-menu-modal.html',
            scope: $scope
        });
    };

    $scope.open_techno_page = function(name, version) {
        $location.path('/technos/'+name+'/'+version);
        $scope.technoSearched = "";
        if($scope.technoModalInstance) $scope.technoModalInstance.close();
    }

    /* Applications */
    $scope.get_applications = function(name) {
        return Application.like(name).then(function(applicationsByName){
            return _(applicationsByName).flatten().map(function(application){
                application.title = application.name+", "+application.version //Display purposes
                return application;
            }).value();
        });
    };

    $scope.open_application_page = function(name, version) {
        $location.path('/application/'+name+'/'+version);
        $scope.applicationSearched = "";
        if($scope.applicationModalInstance) $scope.applicationModalInstance.close();
    }

    $scope.open_create_application_dialog = function(){
        $scope.applicationModalInstance = $modal.open({
            templateUrl: 'application-menu-modal.html',
            scope: $scope
        });
    };

    /* Properties */
    $scope.open_properties_page = function(name, version, platform) {
        var path = '/properties/'+name+'/'+version;
        if(platform) path += '?platform='+platform;
        $location.url(path);
        $scope.applicationSearched = "";
        if($scope.propertiesModalInstance) $scope.propertiesModalInstance.close();
    }

    $scope.open_create_properties_dialog = function(){
        $scope.propertiesModalInstance = $modal.open({
            templateUrl: 'properties-menu-modal.html',
            scope: $scope
        });
    };

    /* Contexts */
    $scope.open_context_page = function(name, version) {
        $location.path('/application/'+name+'/'+version);
        $scope.applicationSearched = "";
        if($scope.contextModalInstance) $scope.contextModalInstance.close();
    }

}]);







