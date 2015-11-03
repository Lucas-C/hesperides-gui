/**
 * Created by william_montaz on 17/10/2014.
 */
var menuModule = angular.module('hesperides.menu', ['hesperides.techno', 'hesperides.application', 'hesperides.properties']);

menuModule.controller('MenuTechnoCtrl', ['$scope', '$mdDialog', '$location', 'TechnoService', function ($scope, $mdDialog, $location, TechnoService) {

    $scope.closeDialog = function() {
        $mdDialog.hide();
    };

    $scope.find_technos_by_name = function (name) {
        return TechnoService.with_name_like(name);
    };

    $scope.open_create_techno_dialog = function () {
        $mdDialog.show({
            templateUrl: 'techno/techno-menu-modal.html',
            controller: 'MenuTechnoCtrl',
            preserveScope: true, // requiered for not freez menu see https://github.com/angular/material/issues/5041
            scope:$scope
        });
    };

    $scope.open_create_techno_from_dialog = function () {
        $mdDialog.show({
            templateUrl: 'techno/techno-menu-modal-from.html',
            controller: 'MenuTechnoCtrl',
            preserveScope: true // requiered for not freez menu
            // Remove scope cause else with autocomplete, window is closed
            //scope:$scope
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
        $mdDialog.hide();
    }

}]);

menuModule.controller('MenuModuleCtrl', ['$scope', '$mdDialog', '$location', 'ModuleService', 'Module', '$http',  function ($scope, $mdDialog, $location, ModuleService, Module, $http) {

    $scope.closeDialog = function() {
        $mdDialog.hide();
    };

    $scope.selectedItemChange = function(item) {
        $log.info('Item changed to ' + JSON.stringify(item));
    }

    $scope.find_modules_by_name = function (name) {
        if (name) {
            return ModuleService.with_name_like(name);
        } else {
            return null;
        }
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
        $mdDialog.hide();
    };

    $scope.open_create_module_dialog = function () {
        $mdDialog.show({
            templateUrl: 'module/module-menu-modal.html',
            controller: 'MenuModuleCtrl',
            preserveScope: true, // requiered for not freez menu
            scope:$scope
        });
    };

    $scope.open_create_module_from_dialog = function () {
        $mdDialog.show({
            templateUrl: 'module/module-menu-modal-from.html',
            controller: 'MenuModuleCtrl',
            preserveScope: true, // requiered for not freez menu
            scope:$scope
        });
    };


}]);

menuModule.controller('MenuPropertiesCtrl', ['$scope', '$mdDialog', '$location', 'ApplicationService', 'Platform', function ($scope, $mdDialog, $location, ApplicationService, Platform) {

    $scope.closeDialog = function() {
        $mdDialog.hide();
    };

    $scope.find_applications_by_name = function (name) {
        if (name) {
            return ApplicationService.with_name_like(name);
        } else {
            return null;
        }
    };

    $scope.find_platforms_of_application = function (application_name) {
        return ApplicationService.get_platform_name_of_application(application_name);
    };

    $scope.open_properties_page = function (application_name, platform_name) {
        var path = '/properties/' + application_name;
        $location.url(path).search({platform: platform_name});
        $scope.applicationSearched = "";
        if (modal) modal.close();
    };

    $scope.create_platform = function(application_name, platform_name, production, application_version){
        var platform = new Platform({name: platform_name, application_name: application_name, application_version: application_version, production: production});
        ApplicationService.save_platform(platform).then(function(platform){
            $scope.open_properties_page(platform.application_name, platform.platform_name);
        });
    };

    $scope.create_platform_from = function(application_name, platform_name, production, application_version, from_application, from_platform){
        var platform = new Platform({name: platform_name, application_name: application_name, application_version: application_version, production: production});
        ApplicationService.create_platform_from(platform, from_application, from_platform).then(function(platform){
            $scope.open_properties_page(platform.application_name, platform.platform_name);
        });
    };

    $scope.open_create_platform_dialog = function () {
        $mdDialog.show({
            templateUrl: 'properties/platform-menu-modal.html',
            controller: 'MenuPropertiesCtrl',
            preserveScope: true, // requiered for not freez menu
            scope:$scope
        });
    };

    $scope.open_create_platform_from_dialog = function () {
        $mdDialog.show({
            templateUrl: 'properties/platform-menu-modal-from.html',
            controller: 'MenuPropertiesCtrl',
            preserveScope: true, // requiered for not freez menu
            scope:$scope
        });
    };
}]);

menuModule.controller('MenuHelpCtrl', ['$scope', '$mdDialog', '$http', function($scope, $mdDialog, $http){

    $scope.closeDialog = function() {
        $mdDialog.hide();
    };

    $scope.display_hesperides_informations = function(){

        $scope.front_version = '0.2.6-SNAPSHOT';

        //Get the backend versions
        $http.get('rest/versions').then(function(response){
            $scope.backend_version = response.data.backend_version;
            $scope.api_version = response.data.api_version;
        }, function (error) {
            throw error;
        });

        $mdDialog.show({
            templateUrl: 'hesperides/help-menu-modal.html',
            controller: 'MenuHelpCtrl',
            preserveScope: true, // requiered for not freez menu
            scope:$scope
        });

    };

    $scope.display_swagger = function() {
        window.open('/swagger.html');
    }

}]);






