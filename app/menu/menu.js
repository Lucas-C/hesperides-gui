/**
 * Created by william_montaz on 17/10/2014.
 */
var menuModule = angular.module('hesperides.menu', ['hesperides.techno', 'hesperides.application', 'hesperides.properties']);

menuModule.controller('MenuTechnoCtrl', ['$scope', '$modal', '$location', 'TechnoService', function ($scope, $modal, $location, TechnoService) {

    var modal;

    $scope.find_technos_by_name = function (name) {
        return TechnoService.with_name_like(name);
    };

    $scope.open_create_techno_dialog = function () {
        modal = $modal.open({
            templateUrl: 'techno-menu-modal.html',
            scope: $scope
        });
    };

    $scope.open_create_techno_from_dialog = function () {
        modal = $modal.open({
            templateUrl: 'techno-menu-modal-from.html',
            scope: $scope
        });
    };

    $scope.create_techno_from = function (name, version, fromName, fromVersion, isFromWorkingCopy) {
        TechnoService.create_workingcopy(name, version, fromName, fromVersion, isFromWorkingCopy).then(function(){
            $scope.open_techno_page(name, version, true);
        });
    };

    $scope.open_techno_page = function (name, version, is_working_copy) {
        if(is_working_copy) {
            $location.path('/techno/' + name + '/' + version).search({type : "workingcopy"});
        } else {
            $location.path('/techno/' + name + '/' + version).search({});
        }
        $scope.technoSearched = "";
        if (modal) modal.close();
    }

}]);

menuModule.controller('MenuModuleCtrl', ['$scope', '$modal', '$location', 'ModuleService', 'Module',  function ($scope, $modal, $location, ModuleService, Module) {

    var modal;

    $scope.find_modules_by_name = function (name) {
        return ModuleService.with_name_like(name);
    };

    $scope.create_module = function(name, version){
        var module = new Module({name: name, version: version});
        ModuleService.save(module).then(function(module){
            $scope.open_module_page(module.name, module.version, module.is_working_copy);
        });
    };

    $scope.open_module_page = function (name, version, is_working_copy) {
        if(is_working_copy){
            $location.path('/module/' + name + '/' + version).search({type : "workingcopy"});
        } else {
            $location.path('/module/' + name + '/' + version).search({});
        }
        $scope.moduleSearched = "";
        if (modal) modal.close();
    };

    $scope.open_create_module_dialog = function () {
        modal = $modal.open({
            templateUrl: 'module-menu-modal.html',
            scope: $scope
        });
    };


}]);

menuModule.controller('MenuPropertiesCtrl', ['$scope', '$modal', '$location', 'ApplicationService', function ($scope, $modal, $location, ApplicationService) {

    var modal;

    $scope.find_applications_by_name = function (name) {
        return ApplicationService.with_name_like(name).then(function (applicationsByName) {
            return _(applicationsByName).flatten().map(function (application) {
                application.title = application.name + ", " + application.version //Display purposes
                return application;
            }).value();
        });
    };

    $scope.open_properties_page = function (name, version, platform) {
        var path = '/properties/' + name + '/' + version;
        if (platform) path += '?platform=' + platform;
        $location.url(path);
        $scope.applicationSearched = "";
        if (modal) modal.close();
    };

    $scope.open_create_properties_dialog = function () {
        modal = $modal.open({
            templateUrl: 'properties-menu-modal.html',
            scope: $scope
        });
    };


}]);


menuModule.controller('MenuContextCtrl', ['$scope', '$location', 'ApplicationService', function ($scope, $location, ApplicationService) {

    var modal;

    $scope.open_context_page = function (name, version) {
        $location.path('/contexts/' + name + '/' + version);
        $scope.applicationSearched = "";
        if (modal) modal.close();
    };

    $scope.find_applications_by_name = function (name) {
        return ApplicationService.with_name_like(name).then(function (applicationsByName) {
            return _(applicationsByName).flatten().map(function (application) {
                application.title = application.name + ", " + application.version //Display purposes
                return application;
            }).value();
        });
    };

}]);







