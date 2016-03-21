/**
 * Created by william_montaz on 17/10/2014.
 */
var menuModule = angular.module('hesperides.menu', ['hesperides.techno', 'hesperides.application', 'hesperides.file', 'hesperides.properties']);

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

menuModule.controller('MenuPropertiesCtrl', ['$http','$scope', '$modal', '$location', 'ApplicationService', 'Platform','Properties', function ($http, $scope, $modal, $location, ApplicationService, Platform, properties) {

    var modal;
    var properties;

    /**
     * This set the current page by the created platform page.
     * Used for reloading page after platform creation.
     * This could be improved.
     */
    reload = function (application, platform){
        var path = '/properties/' + application;
        $location.url(path).search({platform: platform});
        location.reload();
    };

    $scope.find_applications_by_name = function (name) {
        return ApplicationService.with_name_like(name);
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

        reload(application_name, platform_name);
    };

    /**
     * Create a new platform from existing platform by copying all the characteristics.
     * This function presents two options to the user: copying the instances or not.
     * Modified by Sahar CHAILLOU on 25/01/2016.
    */
    $scope.create_platform_from = function(application_name, platform_name, production, application_version, from_application, from_platform, copyInstances){
        var platform;

        if (copyInstances){
            // Clone the platform
            platform = new Platform({name: platform_name, application_name: application_name, application_version: application_version, production: production});
            ApplicationService.create_platform_from(platform, from_application, from_platform).then(function(platform){
                $scope.open_properties_page(platform.application_name,  platform.name);
            });

            reload(application_name, platform_name);

        } else {
            //Get the existing platform
            $http.get('rest/applications/' + encodeURIComponent(from_application) + '/platforms/'+ encodeURIComponent(from_platform)).then(function (response) {
                // Create a new platform from the get's response and change the main properties with the target values
                platform = new Platform(response.data);
                platform.name = platform_name;
                platform.application_name = application_name;
                platform.production = production;
                platform.version = application_version;
                platform.version_id = -1;

                //Empty the instances for each module (we don't want to copy the instances)
                _.each(platform.modules, function (module) {
                    module.delete_instances();
                });

                // Saving the platform as a creation
                ApplicationService.save_platform(platform, true);
                platform.version_id = 0;

                // Save the properties for each module
                _.each(platform.modules, function (module) {
                    var module_type;

                    //Get the module's type
                    if(module.is_working_copy){
                        module_type = 'WORKINGCOPY';
                    }else{
                        module_type = 'RELEASE';
                    }

                    // Instantiate the properties path
                    var path = module.path + '#'+module.name + '#' + module.version + '#' + module_type;

                    // Get the properties from the existing platform
                    ApplicationService.get_properties(from_application, from_platform, path).then(function (properties) {
                        properties = properties.to_rest_entity();
                        // Save the properties for the new platform
                        $http.post('rest/applications/' + encodeURIComponent(platform.application_name) + '/platforms/' + encodeURIComponent(platform.name) + '/properties?path=' + encodeURIComponent(path) + '&platform_vid=' + encodeURIComponent(platform.version_id), properties);
                    });

                });

                $scope.open_properties_page(platform.application_name, platform.name);
                reload(application_name, platform_name);
            }, function (error) {
                $.notify(error.data.message, "error");
                throw error;
            })
        }
    };

    $scope.open_create_platform_dialog = function () {
        modal = $modal.open({
            templateUrl: 'platform-menu-modal.html',
            scope: $scope
        });
    };

    $scope.open_create_platform_from_dialog = function () {
        modal = $modal.open({
            templateUrl: 'platform-menu-modal-from.html',
            scope: $scope
        });
    };


}]);

menuModule.controller('MenuHelpCtrl', ['$scope', '$modal', '$http', function($scope, $modal, $http){

    $scope.display_hesperides_informations = function(){

        $scope.front_version = '${project.version}';

        //Get the backend versions
        $http.get('rest/versions').then(function(response){
            $scope.backend_version = response.data.backend_version;
            $scope.api_version = response.data.api_version;
        }, function (error) {
            throw error;
        });

        var modal = $modal.open({
            templateUrl: 'help-menu-modal.html',
            scope: $scope
        });

    };

}]);






