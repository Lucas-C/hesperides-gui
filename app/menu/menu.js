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

    $scope.create_module_from = function (name, version, moduleFrom) {
        ModuleService.create_workingcopy_from(name, version, moduleFrom).then(function(){
            $scope.open_module_page(name, version, true);
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

    $scope.open_create_module_from_dialog = function () {
        modal = $modal.open({
            templateUrl: 'module-menu-modal-from.html',
            scope: $scope
        });
    };


}]);

menuModule.controller('MenuPropertiesCtrl', ['$scope', '$modal', '$location', 'ApplicationService', 'Platform', function ($scope, $modal, $location, ApplicationService, Platform) {

    var modal;

    $scope.find_applications_by_name = function (name) {
        return ApplicationService.with_name_like(name);
    };

    $scope.open_properties_page = function (application_name, platform_name) {
        var path = '/properties/' + application_name;
        $location.url(path).search({platform: platform_name});
        $scope.applicationSearched = "";
        if (modal) modal.close();
    };

    $scope.create_platform = function(application_name, platform_name, application_version){
        var platform = new Platform({name: platform_name, application_name: application_name, application_version: application_version});
        ApplicationService.save_platform(platform).then(function(platform){
            $scope.open_properties_page(platform.application_name, platform.platform_name);
        });
    };

    $scope.open_create_platform_dialog = function () {
        modal = $modal.open({
            templateUrl: 'platform-menu-modal.html',
            scope: $scope
        });
    };


}]);






