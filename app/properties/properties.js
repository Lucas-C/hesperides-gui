/**
 * Created by william_montaz on 17/10/2014.
 */
var propertiesModule = angular.module('hesperides.properties', []);

propertiesModule.controller('PropertiesCtrl', ['$scope', '$routeParams', '$modal', 'ApplicationService', 'ModuleService', 'ApplicationModule', 'Page',  function ($scope, $routeParams, $modal, ApplicationService, ModuleService, Module, Page) {
    Page.setTitle("Properties");

    $scope.platform = $routeParams.platform;
    $scope.platforms = [];

    var Box = function(data){
        return angular.extend(this, {
            parent_box: null,
            name: "",
            children: {},
            modules: [],
            isEmpty: function(){
                return _.keys(this.children).length === 0 && this.modules.length === 0;
            },
            get_path: function(){
                return (this.parent_box == null ? "": (this.parent_box.get_path() + "#")) + this.name;
            },
            to_modules: function(){
                return this.modules.concat(
                    _.flatten(_.map(this.children, function(box){
                        return box.to_modules();
                    }))
                );
            }
        }, data);
    };

    $scope.update_main_box = function(platform){

        //Try to build the view depending on the different paths of the modules
        var mainBox = new Box({parent_box: null});

        var add_to_box = function(box, folders, level, module){
            if(level > folders.length){
                throw "Should have nether been here, wrong use of add_to_box recursive function";
            }
            if(level === folders.length){
                //Found terminal level
                box.modules.push(module);
            } else {
                var name = folders[level];
                if(_.isUndefined(box["children"][name])){
                    box["children"][name] = new Box({parent_box: box, name: name});
                }
                return add_to_box(box["children"][name], folders, level+1, module);
            }
        };

        _.each(platform.modules, function(module){
            var path = module.path;
            if(path.charAt(0) === '#'){ //Remove possible preceding #
                path = path.substring(1, path.length);
            }
            var folders = path.split('#');
            add_to_box(mainBox, folders, 0, module);
        });

        $scope.mainBox = mainBox;

    };

    $scope.add_box = function(name, box){
        box["children"][name] = new Box({parent_box: box, name:name});
    };

    $scope.remove_box = function(name, box){
        delete box.parent_box["children"][name];
    };

    $scope.update_box_name = function(box, old_name, new_name){
        box.name = new_name;
        box.parent_box["children"][new_name] = box.parent_box["children"][old_name];
        delete box.parent_box["children"][old_name];
    };

    $scope.open_add_box_dialog = function(box){
        var modal = $modal.open({
            templateUrl: 'application/add_box.html',
            backdrop: 'static',
            size: 'sm',
            keyboard: false,
            scope: $scope
        });

        modal.result.then(function(name){
            $scope.add_box(name, box);
        });
    };

    $scope.open_add_instance_dialog = function(module){
        var modal = $modal.open({
            templateUrl: 'application/add_instance.html',
            backdrop: 'static',
            size: 'sm',
            keyboard: false,
            scope: $scope
        });

        modal.result.then(function(name){
            $scope.add_instance(name, module);
        });
    };

    $scope.search_module = function(box){
        var modal = $modal.open({
            templateUrl: 'application/search_module.html',
            backdrop: 'static',
            size: 'sm',
            keyboard: false,
            scope: $scope
        });

        modal.result.then(function(module){
            $scope.add_module(module.name, module.version, module.is_working_copy, box);
        });
    };

    $scope.find_modules_by_name = function (name) {
        return ModuleService.with_name_like(name);
    };

    $scope.add_module = function(name, version, is_working_copy, box){
        if(!_.some(box.modules, {'name': name, 'version': version, 'is_working_copy': is_working_copy})){
            box.modules.push(new Module(
                {
                    name: name,
                    version: version,
                    is_working_copy: is_working_copy,
                    deployment_group: "",
                    path: box.get_path()
                }
            ));
            $scope.save_platform_from_box($scope.mainBox);
        }
    };

    $scope.add_instance = function(name, module){
        module.create_new_instance(name);
        $scope.save_platform_from_box($scope.mainBox);
    };

    $scope.delete_instance = function(instance, module){
        module.delete_instance(instance);
    };

    $scope.delete_module = function(module, box){
        _.remove(box.modules, function(existing){
            return _.isEqual(existing, module);
        });
        $scope.save_platform_from_box($scope.mainBox);
    };

    $scope.save_platform_from_box = function(box){
        $scope.platform.modules = box.to_modules();
        ApplicationService.save_platform($scope.platform).then(function(platform){
            $scope.platform = platform;
            //Replace platforms in the list by the new one
            var existing_index = 0;
            _.find($scope.platforms, function(existing_platform, index){ existing_index = index; return existing_platform.name === platform.name; });
            $scope.platforms[existing_index] = platform;
            //Update the view
            $scope.update_main_box(platform);
        });
    };

    //TODO
    $scope.add_platform = function(platform_name) {
        if(!_.contains($scope.platforms, platform_name)){
             $scope.platforms.push(platform_name);
        }
    };

    //TODO
    $scope.delete_platform = function(platform){
        //Might be a bit tricky
    };

    $scope.on_edit_platform = function(platform){
        $scope.platform = platform;
        $scope.selected_module = undefined;
        $scope.instance = undefined;
        $scope.properties = undefined;
        $scope.update_main_box(platform);
    };

    $scope.edit_properties = function(platform, module){
        ApplicationService.get_properties($routeParams.application, platform, module.get_properties_path()).then(function(properties){
            ModuleService.get_model(module).then(function(model){
                $scope.properties = properties.mergeWithModel(model);
                $scope.selected_module = module;
                $scope.instance = undefined; //hide the instanc epanel if opened
            });
        });
    };

    $scope.save_properties = function(properties, module) {
        ApplicationService.save_properties($routeParams.application, $scope.platform, properties, module.get_properties_path()).then(function(properties){
            ModuleService.get_model(module).then(function(model){
                $scope.properties = properties.mergeWithModel(model);
            });
            //Increase platform number
            $scope.platform.version_id = $scope.platform.version_id + 1;
        });
    };

    $scope.edit_instance = function(instance){
        ApplicationService.get_instance_model($routeParams.application, $scope.platform, instance).then(function(model){
                $scope.instance = instance.mergeWithModel(model);
                $scope.properties = undefined; //hide the properties panel if opened
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
                $scope.update_main_box(selected_platform);
            }
        }

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
