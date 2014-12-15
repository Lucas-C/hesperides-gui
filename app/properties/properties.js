/**
 * Created by william_montaz on 17/10/2014.
 */
var propertiesModule = angular.module('hesperides.properties', []);

propertiesModule.controller('PropertiesCtrl', ['$scope', '$routeParams', 'ApplicationService', 'ModuleService', 'Page',  function ($scope, $routeParams, ApplicationService, ModuleService, Page) {
    Page.setTitle("Properties");

    $scope.platform = $routeParams.platform;
    $scope.platforms = [];

    var Box = function(data){
        return angular.extend(this, {
            parent: null,
            children: {},
            modules: [],
            isEmpty: function(){
                return _.keys(this.children).length === 0 && this.modules.length === 0;
            }
        }, data);
    };

    $scope.on_edit_platform = function(platform){
        /* Reset unit choice */
        //$scope.unit = undefined;

        //Try to build the view depending on the different paths of the modules
        var mainBox = new Box({parent: null});

        var add_to_box = function(box, folders, level, module){
            if(level > folders.length){
                throw "Should have nether been here, wrong use of add_to_box recursive function";
            }
            if(level === folders.length){
                //Found terminal level
                box.modules.push(module);
            } else {
                if(_.isUndefined(box["children"][folders[level]])){
                    box["children"][folders[level]] = new Box({parent: box});
                }
                return add_to_box(box["children"][folders[level]], folders, level+1, module);
            }
        };

        _.each(platform.modules, function(module){
            var path = module.path;
            var folders = path.split('#');
            add_to_box(mainBox, folders, 0, module);
        });

        $scope.mainBox = mainBox;

    };

    $scope.add_box = function(box){
        box["children"]["TO_CHANGE"] = new Box({parent: box});
    };

    $scope.remove_box = function(name, box){
        delete box.parent["children"][name];
    };

    $scope.update_box_name = function(box, old_name, new_name){
        box.parent["children"][new_name] = box.parent["children"][old_name];
        delete box.parent["children"][old_name];
    };

    $scope.add_platform = function(platform_name) {
        if(!_.contains($scope.platforms, platform_name)){
             $scope.platforms.push(platform_name);
        }
    };

    $scope.delete_platform = function(platform){
        //Might be a bit tricky
    };

    $scope.edit_properties = function(platform, module){
        ApplicationService.get_properties($routeParams.application, platform, module.get_properties_path()).then(function(properties){
            ModuleService.get_model(module).then(function(model){
                $scope.properties = properties.mergeWithModel(model);
                $scope.selected_module = module;
            });
        });
    };

    $scope.save_properties = function(properties, module) {
        ApplicationService.save_properties($routeParams.application, $scope.platform, properties, module.get_properties_path()).then(function(properties){
            ModuleService.get_model(module).then(function(model){
                $scope.properties = properties.mergeWithModel(model);
            });
        });
    };

    /* Get the application */
    ApplicationService.get($routeParams.application).then(function(application){
        $scope.application = application;
        $scope.platforms = application.platforms;
        /* If platform was mentionned in the route, try to find it */
        /* If it does not exist show error */
        if($routeParams.platform){
            var selected_platform = _.find($scope.platforms, function(platform){ return platform.name === $routeParams.platform; });
            if(_.isUndefined(selected_platform)){
                $.notify("La brique technique mentionee dans l'url n'existe pas", "error");
            } else {
                $scope.platform = selected_platform;
                $scope.on_edit_platform(selected_platform);
            }
        };

    }, function(error){
        $.notify(error.data, "error");
    });

}]);

propertiesModule.directive('propertiesList', function(){

    return {
        restrict: 'E',
        scope: {
            properties: '='
        },
        templateUrl: "properties/properties-list.html",
        link: function(scope, element, attrs){



        }
    };


});

propertiesModule.factory('Properties', function(){

    var Properties = function(data){

        angular.extend(this, {
            namespace: "",
            key_value_properties: [],
            iterable_properties: [],
            versionID: -1
        }, data);


        this.hasKey = function (name) {
            return _.some(this.key_value_properties, function (key) {
                return key.name === name;
            });
        };

        this.hasIterable = function (name) {
            return _.some(this.iterable_properties, function (key) {
                return key.name === name;
            });
        };

        this.mergeWithModel = function (model) {
            var me = this;
            /* Mark key_values that are in the model */
            _.each(this.key_value_properties, function (key_value) {
                key_value.inModel = model.hasKey(key_value.name);
            });

            _.each(this.iterable_properties, function (iterable) {
                iterable.inModel = model.hasIterable(iterable.name);
            });

            /* Add key_values that are only in the model */
            _(model.key_value_properties).filter(function (model_key_value) {
                return !me.hasKey(model_key_value.name);
            }).each(function (model_key_value) {
                me.key_value_properties.push({
                    name: model_key_value.name,
                    comment: model_key_value.comment,
                    value: "",
                    inModel: true
                });
            });

            _(model.iterable_properties).filter(function (model_iterable) {
                return !me.hasIterable(model_iterable.name);
            }).each(function (model_iterable) {
                me.iterable_properties.push({
                    name: model_iterable.name,
                    comment: model_iterable.comment,
                    fields: model_iterable.fields,
                    inModel: true
                });
            });

            return this;
        };

        this.to_rest_entity = function(){
            return {
                namespace: this.namespace,
                versionID: this.versionID,
                key_value_properties: _.map(this.key_value_properties, function(kvp){
                    return {
                        name: kvp.name,
                        comment: kvp.comment,
                        value: kvp.value
                    }
                }),
                iterable_properties: _.map(this.iterable_properties, function(ip){
                    return {
                        name: ip.name,
                        comment: ip.comment,
                        fields: ip.fields
                    }
                })
            }
        }

    };

    return Properties;

});

propertiesModule.factory('PropertiesService', ['$http', 'Properties', function ($http, Properties) {

    return {
        getModel: function(namespaces) {
            var namespaces_as_string = _.isArray(namespaces) ? namespaces.join(",")  : namespaces;
            return $http.get('rest/properties/model/'+encodeURIComponent(namespaces_as_string)).then(function(response){
                return new Properties(response.data);
            }, function (error) {
                return new Properties({});
            });
        },
        get: function (namespace) {
            return $http.get('rest/properties/'+encodeURIComponent(namespace)).then(function (response) {
                return new Properties(response.data);
            }, function (error) {
                $.notify(error.data, "error");
                throw error;
            });
        },
        getPropertiesMergedWithModel: function(properties_namespace, model_namespaces) {
            var me = this;
            return this.getModel(model_namespaces).then(function(model){

                return me.get(properties_namespace).then(function(properties){
                    return properties.mergeWithModel(model);
                }, function(error){
                    var properties = new Properties({namespace: properties_namespace});
                    return properties.mergeWithModel(model);
                });

            });
        },
        save: function(properties){
            properties = properties.toHesperidesEntity();
            if(properties.versionID < 0){
                return $http.post('rest/properties/'+encodeURIComponent(properties.namespace), properties).then(function(response) {
                    $.notify("Les proprietes ont bien ete crees", "success");
                    return new Properties(response.data);
                }, function(error) {
                    $.notify(error.data, "error");
                });
            } else {
                return $http.put('rest/properties/'+encodeURIComponent(properties.namespace), properties).then(function(response) {
                    $.notify("Les proprietes ont bien ete mises a jour", "success");
                    return new Properties(response.data)
                }, function(error) {
                    $.notify(error.data, "error");
                });
            }
        }
    }

}]);
