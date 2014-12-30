/**
 * Created by william_montaz on 17/10/2014.
 */
var applicationModule = angular.module('hesperides.application', []);


applicationModule.factory('Application', ['Platform', function (Platform) {

    var Application = function (data) {

        var me = this;

        angular.extend(this, {
            name: "",
            platforms: []
        }, data);

        //Object casting when application is created
        this.platforms = _.map(this.platforms, function (data) {
            return new Platform(data);
        });

    };

    return Application;

}]);

applicationModule.factory('Platform', ['Module', function (Module) {

    var Platform = function (data) {

        var me = this;

        angular.extend(this, {
            name: "",
            application_name: "",
            application_version: "",
            modules: [],
            version_id: -1
        }, data);

        if (!_.isUndefined(this.platform_name)) {//When it comes from rest entity
            this.name = this.platform_name;
        }

        //Object casting when application is created
        this.modules = _.map(this.modules, function (data) {
            return new Module(data);
        });

        this.to_rest_entity = function () {
            return {
                platform_name: this.name,
                application_name: this.application_name,
                application_version: this.application_version,
                modules: _.map(this.modules, function (module) {
                    return {
                        name: module.name,
                        version: module.version,
                        working_copy: module.is_working_copy,
                        deployment_group: module.deployment_group,
                        path: module.path
                    }
                }),
                version_id: this.version_id
            };
        };

    };

    return Platform;

}]);

applicationModule.factory('ApplicationService', ['$http', 'Application', 'Platform', 'Properties', function ($http, Application, Platform, Properties) {

    return{
        get: function (name) {
            return $http.get('rest/applications/' + encodeURIComponent(name)).then(function (response) {
                return new Application(response.data);
            }, function (error) {
                $.notify(error.data, "error");
                throw error;
            });
        },
        with_name_like: function(name){
            return $http.post('rest/applications/perform_search?name=' + encodeURIComponent(name)).then(function (response) {
                return response.data;
            }, function (error) {
                $.notify(error.data, "error");
                throw error;
            });
        },
        get_platform: function (application_name, platform_name) {
            return $http.get('rest/applications/' + encodeURIComponent(application_name) + '/platforms' + encodeURIComponent(platform_name)).then(function (response) {
                return new Platform(response.data);
            }, function (error) {
                $.notify(error.data, "error");
                throw error;
            });
        },
        save_platform: function (platform) {
            platform = platform.to_rest_entity();
            if (platform.version_id < 0) {
                return $http.post('rest/applications/' + encodeURIComponent(platform.application_name) + '/platforms', platform).then(function (response) {
                    $.notify("La plateforme a bien ete creee", "success");
                    return new Platform(response.data);
                }, function (error) {
                    $.notify(error.data, "error");
                    throw error;
                });
            } else {
                return $http.put('rest/applications/' + encodeURIComponent(platform.application_name) + '/platforms', platform).then(function (response) {
                    $.notify("La plateforme a bien ete mise a jour", "success");
                    return new Platform(response.data);
                }, function (error) {
                    $.notify(error.data, "error");
                    throw error;
                });
            }
        },
        get_properties: function (application_name, platform, path) {
            return $http.get('rest/applications/' + encodeURIComponent(application_name) + '/platforms/' + encodeURIComponent(platform.name) + '/properties?path=' + encodeURIComponent(path)).then(function (response) {
                return new Properties(response.data);
            }, function (error) {
                $.notify(error.data, "error");
                throw error;
            });
        },
        save_properties: function (application_name, platform, properties, path) {
            properties = properties.to_rest_entity();
            return $http.post('rest/applications/' + encodeURIComponent(application_name) + '/platforms/' + encodeURIComponent(platform.name) + '/properties?path=' + encodeURIComponent(path) + '&platform_vid=' + encodeURIComponent(platform.version_id), properties).then(function (response) {
                $.notify("Les properties ont bien ete sauvegardees", "success");
                return new Properties(response.data);
            }, function (error) {
                $.notify(error.data, "error");
                throw error;
            });
        }
    };

}]);