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

applicationModule.factory('Platform', ['ApplicationModule', function (Module) {

    var Platform = function (data) {

        var me = this;

        angular.extend(this, {
            name: "",
            application_name: "",
            application_version: "",
            modules: [],
            production: false,
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
                production: this.production,
                modules: _.map(this.modules, function (module) {
                    return module.to_rest_entity();
                }),
                version_id: this.version_id
            };
        };

    };

    return Platform;

}]);

applicationModule.factory('ApplicationModule', ['Instance', function (Instance) {

    var ApplicationModule = function (data) {

        var me = this;

        angular.extend(this, {
            id: 0,
            name: "",
            version: "",
            is_working_copy: true,
            instances: []
        }, data);

        if (!_.isUndefined(data.working_copy)) { //When it is created through a rest entity
            this.is_working_copy = data.working_copy;
        }

        /* Object casting when instance is created */
        this.instances = _.map(this.instances, function (data) {
            return new Instance(data);
        });

        this.title = this.name + ', ' + this.version + (this.is_working_copy ? ' (working copy)' : '');

        this.create_new_instance = function(name){
            if(!_.find(this.instances, function(instance) { return instance.name === name; })){
                this.instances.push(new Instance({name: name}));
            }
        };

        this.delete_instance = function(instance){
            this.instances = _.without(this.instances, instance);
        };

        this.to_rest_entity = function () {
            return {
                id: this.id,
                name: this.name,
                version: this.version,
                working_copy: this.is_working_copy,
                deployment_group: this.deployment_group,
                path: this.path,
                instances: _.map(this.instances, function(instance){
                    return instance.to_rest_entity();
                })
            };
        };

        this.get_properties_path = function(){
            return this.path +'#'+this.name+'#'+this.version+'#'+(this.is_working_copy ? "WORKINGCOPY" : "RELEASE");
        };

    };

    return ApplicationModule;

}]);

applicationModule.factory('InstanceModel', function () {

    var InstanceModel = function (data) {

        angular.extend(this, {
            keys: []
        }, data);

        this.hasKey = function (name) {
            return this.keys.some(function (key) {
                return key.name === name;
            });
        };

    };

    return InstanceModel;

});

applicationModule.factory('Instance', function () {

    var Instance = function (data) {

        angular.extend(this, {
            name: "",
            key_values: []
        }, data);

        this.hasKey = function (name) {
            return _.some(this.key_values, function (key) {
                return key.name === name;
            });
        };

        this.mergeWithModel = function (model) {
            var me = this;

            /* Mark key_values that are in the model */
            _.each(this.key_values, function (key_value) {
                key_value.inModel = model.hasKey(key_value.name);
            });

            /* Add key_values that are only in the model */
            _(model.keys).filter(function (model_key_value) {
                return !me.hasKey(model_key_value.name);
            }).each(function (model_key_value) {
                me.key_values.push({
                    name: model_key_value.name,
                    comment: model_key_value.comment,
                    value: "",
                    inModel: true
                });
            });

            return this;
        };

        this.to_rest_entity = function () {
            return {
                name: this.name,
                key_values: _.map(this.key_values, function (kv) {
                    return {
                        name: kv.name,
                        comment: kv.comment,
                        value: kv.value
                    }
                })
            }
        }

    };

    return Instance;

});

applicationModule.factory('ApplicationService', ['$http', 'Application', 'Platform', 'Properties', 'InstanceModel', function ($http, Application, Platform, Properties, InstanceModel) {

    return{
        get: function (name) {
            return $http.get('rest/applications/' + encodeURIComponent(name)).then(function (response) {
                return new Application(response.data);
            }, function (error) {
                $.notify(error.data.message, "error");
                throw error;
            });
        },
        with_name_like: function(name){
            return $http.post('rest/applications/perform_search?name=' + encodeURIComponent(name)).then(function (response) {
                return response.data;
            }, function (error) {
                $.notify(error.data.message, "error");
                throw error;
            });
        },
        get_platform: function (application_name, platform_name) {
            return $http.get('rest/applications/' + encodeURIComponent(application_name) + '/platforms' + encodeURIComponent(platform_name)).then(function (response) {
                return new Platform(response.data);
            }, function (error) {
                $.notify(error.data.message, "error");
                throw error;
            });
        },
        save_platform: function (platform, copyPropertiesOfUpdatedModules) {
            if(_.isUndefined(copyPropertiesOfUpdatedModules)){
                copyPropertiesOfUpdatedModules = false;
            }
            platform = platform.to_rest_entity();
            if (platform.version_id < 0) {
                return $http.post('rest/applications/' + encodeURIComponent(platform.application_name) + '/platforms', platform).then(function (response) {
                    $.notify("La plateforme a bien ete creee", "success");
                    return new Platform(response.data);
                }, function (error) {
                    $.notify(error.data.message, "error");
                    throw error;
                });
            } else {
                return $http.put('rest/applications/' + encodeURIComponent(platform.application_name) + '/platforms?copyPropertiesForUpgradedModules='+copyPropertiesOfUpdatedModules, platform).then(function (response) {
                    $.notify("La plateforme a bien ete mise a jour", "success");
                    return new Platform(response.data);
                }, function (error) {
                    $.notify(error.data.message, "error");
                    throw error;
                });
            }
        },
        create_platform_from: function(platform, from_application, from_platform) {
            platform = platform.to_rest_entity();
            return $http.post('rest/applications/' + encodeURIComponent(platform.application_name) + '/platforms?from_application='+encodeURIComponent(from_application)+'&from_platform='+encodeURIComponent(from_platform), platform).then(function(response){
                $.notify("La plateforme a bien ete creee", "success");
                return new Platform(response.data);
            }, function(error) {
                $.notify(error.data.message, "error");
                throw error;
            });
        },
        get_properties: function (application_name, platform, path) {
            return $http.get('rest/applications/' + encodeURIComponent(application_name) + '/platforms/' + encodeURIComponent(platform.name) + '/properties?path=' + encodeURIComponent(path)).then(function (response) {
                return new Properties(response.data);
            }, function (error) {
                $.notify(error.data.message, "error");
                throw error;
            });
        },
        save_properties: function (application_name, platform, properties, path) {
            properties = properties.to_rest_entity();
            return $http.post('rest/applications/' + encodeURIComponent(application_name) + '/platforms/' + encodeURIComponent(platform.name) + '/properties?path=' + encodeURIComponent(path) + '&platform_vid=' + encodeURIComponent(platform.version_id), properties).then(function (response) {
                $.notify("Les properties ont bien ete sauvegardees", "success");
                return new Properties(response.data);
            }, function (error) {
                $.notify(error.data.message, "error");
                throw error;
            });
        },
        get_instance_model: function (application_name, platform, instance) {
            return $http.get('rest/applications/' + encodeURIComponent(application_name) + '/platforms/' + encodeURIComponent(platform.name) + '/instances/' + encodeURIComponent(instance.name) + '/model').then(function (response) {
                return new InstanceModel(response.data);
            }, function (error) {
                return new InstanceModel({});
            });
        }
    };

}]);