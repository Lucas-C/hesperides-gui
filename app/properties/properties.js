/**
 * Created by william_montaz on 17/10/2014.
 */
var propertiesModule = angular.module('hesperides.properties', []);

propertiesModule.controller('PropertiesCtrl', ['$scope', '$routeParams', '$modal', '$location', '$route', '$timeout', 'ApplicationService', 'ModuleService', 'ApplicationModule', 'Page', function ($scope, $routeParams, $modal, $location, $route, $timeout, ApplicationService, ModuleService, Module, Page) {
    Page.setTitle("Properties");

    $scope.platform = $routeParams.platform;
    $scope.platforms = [];

    var Box = function (data) {
        return angular.extend(this, {
            parent_box: null,
            name: "",
            children: {},
            modules: [],
            isEmpty: function () {
                return _.keys(this.children).length === 0 && this.modules.length === 0;
            },
            get_path: function () {
                return (this.parent_box == null ? "" : (this.parent_box.get_path() + "#")) + this.name;
            },
            to_modules: function () {
                var me = this;
                _.forEach(this.modules, function (module) {
                    module.path = me.get_path();
                });
                return this.modules.concat(
                    _.flatten(_.map(this.children, function (box) {
                        return box.to_modules();
                    }))
                );
            }
        }, data);
    };

    $scope.update_main_box = function (platform) {

        //Try to build the view depending on the different paths of the modules
        var mainBox = new Box({parent_box: null});

        var add_to_box = function (box, folders, level, module) {
            if (level > folders.length) {
                throw "Should have nether been here, wrong use of add_to_box recursive function";
            }
            if (level === folders.length) {
                //Found terminal level
                box.modules.push(module);
            } else {
                var name = folders[level];
                if (_.isUndefined(box["children"][name])) {
                    box["children"][name] = new Box({parent_box: box, name: name});
                }
                return add_to_box(box["children"][name], folders, level + 1, module);
            }
        };

        _.each(platform.modules, function (module) {
            var path = module.path;
            if (path.charAt(0) === '#') { //Remove possible preceding #
                path = path.substring(1, path.length);
            }
            var folders = path.split('#');
            add_to_box(mainBox, folders, 0, module);
        });

        $scope.mainBox = mainBox;

    };

    $scope.add_box = function (name, box) {
        box["children"][name] = new Box({parent_box: box, name: name});
    };

    $scope.remove_box = function (name, box) {
        delete box.parent_box["children"][name];
    };

    $scope.update_box_name = function (box, old_name, new_name) {
        if(!(old_name === new_name)) {
            box.name = new_name;
            box.parent_box["children"][new_name] = box.parent_box["children"][old_name];
            delete box.parent_box["children"][old_name];
            $scope.save_platform_from_box($scope.mainBox, true);
        }
    };

    $scope.open_add_box_dialog = function (box) {
        var modal = $modal.open({
            templateUrl: 'application/add_box.html',
            backdrop: 'static',
            size: 'sm',
            keyboard: false,
            scope: $scope
        });

        modal.result.then(function (name) {
            $scope.add_box(name, box);
        });
    };

    $scope.open_add_instance_dialog = function (module) {
        var modal = $modal.open({
            templateUrl: 'application/add_instance.html',
            backdrop: 'static',
            size: 'sm',
            keyboard: false,
            scope: $scope
        });

        modal.result.then(function (name) {
            $scope.add_instance(name, module);
        });
    };

    $scope.search_module = function (box) {
        var modal = $modal.open({
            templateUrl: 'application/search_module.html',
            backdrop: 'static',
            size: 'lg',
            keyboard: false,
            scope: $scope
        });

        modal.result.then(function (module) {
            $scope.add_module(module.name, module.version, module.is_working_copy, box);
        });
    };

    $scope.change_module = function (module) {

        var modalScope = $scope.$new();
        modalScope.module = module;

        var modal = $modal.open({
            templateUrl: 'application/change_module_version.html',
            backdrop: 'static',
            size: 'lg',
            keyboard: false,
            scope: modalScope
        });

        modal.result.then(function (modal_data) {
            var new_module = modal_data.new_module;
            module.name = new_module.name;
            module.version = new_module.version;
            module.is_working_copy = new_module.is_working_copy;
            $scope.save_platform_from_box($scope.mainBox, modal_data.copy_properties).then(function (response) {
                $scope.properties = undefined;
                $scope.instance = undefined;
            });
        });
    };

    $scope.diff_properties = function (compare_module) {

        $scope.compare_module = compare_module;

        var modal = $modal.open({
            templateUrl: 'application/properties_diff_wizard.html',
            backdrop: 'static',
            size: 'lg',
            keyboard: false,
            scope: $scope
        });

        modal.result.then(function () {
            $scope.open_diff_page();
        });
    };

    $scope.open_diff_page = function () {
        //Everything is set in the scope by the modal when calling this
        //Not very safe but easier to manage with all scopes genrated
        var urlParams = {
            application: $scope.platform.application_name,
            platform: $scope.platform.name,
            properties_path: $scope.compare_module.properties_path,
            compare_application: $scope.compare_platform.application_name,
            compare_platform: $scope.compare_platform.name,
            compare_path: $scope.compare_platform.chosen_module.properties_path
        };
        if (!_.isUndefined($scope.compare_platform.timestamp)) {
            urlParams.timestamp = $scope.compare_platform.timestamp;
        }
        $location.path('/diff').search(urlParams);
    };

    $scope.find_modules_by_name = function (name) {
        return ModuleService.with_name_like(name);
    };

    $scope.add_module = function (name, version, is_working_copy, box) {
        if (!_.some(box.modules, {'name': name, 'version': version, 'is_working_copy': is_working_copy})) {
            box.modules.push(new Module(
                {
                    name: name,
                    version: version,
                    is_working_copy: is_working_copy,
                    deployment_group: "",
                    path: box.get_path()
                }
            ));
            $scope.save_platform_from_box($scope.mainBox).then(function (response) {
                $scope.properties = undefined;
                $scope.instance = undefined;
            });
        }
    };

    $scope.add_instance = function (name, module) {
        module.create_new_instance(name);
        $scope.save_platform_from_box($scope.mainBox);
    };

    $scope.delete_instance = function (instance, module) {
        module.delete_instance(instance);
        $scope.save_platform_from_box($scope.mainBox);
    };

    $scope.update_instance_name = function (instance, new_name) {
        instance.name = new_name;
        $scope.save_platform_from_box($scope.mainBox);
    };

    $scope.delete_module = function (module, box) {
        _.remove(box.modules, function (existing) {
            return _.isEqual(existing, module);
        });
        $scope.save_platform_from_box($scope.mainBox);
    };

    $scope.save_platform_from_box = function (box, copyPropertiesOfUpdatedModules) {
        $scope.platform.modules = box.to_modules();
        return ApplicationService.save_platform($scope.platform, copyPropertiesOfUpdatedModules).then(function (platform) {
            $scope.platform = platform;
            //Replace platforms in the list by the new one
            var existing_index = 0;
            _.find($scope.platforms, function (existing_platform, index) {
                existing_index = index;
                return existing_platform.name === platform.name;
            });
            $scope.platforms[existing_index] = platform;
            //Update the view
            $scope.update_main_box(platform);
        }, function (error) {
            //If an error occurs, reload the platform, thus avoiding having a non synchronized $scope model object
            $location.url('/properties/' + $scope.platform.application_name).search({platform: $scope.platform.name});
            $route.reload(); //Force reload if needed
        });
    };

    //TODO
    $scope.add_platform = function (platform_name) {
        if (!_.contains($scope.platforms, platform_name)) {
            $scope.platforms.push(platform_name);
        }
    };

    //TODO
    $scope.delete_platform = function (platform) {
        //Might be a bit tricky
    };

    $scope.on_edit_platform = function (platform) {
        $scope.platform = platform;
        $scope.selected_module = undefined;
        $scope.instance = undefined;
        $scope.properties = undefined;
        $scope.update_main_box(platform);
    };

    $scope.edit_properties = function (platform, module) {
        ApplicationService.get_properties($routeParams.application, platform.name, module.properties_path).then(function (properties) {
            ModuleService.get_model(module).then(function (model) {
                $scope.properties = properties.mergeWithModel(model);
                $scope.selected_module = module;
                $scope.instance = undefined; //hide the instance panel if opened

                //Scroll to properties
                $timeout(function () {
                    $('html, body').animate({
                        scrollTop: $('#referenceForPropertiesButtonsInitialPosition').offset().top
                    }, 1000, 'swing');
                }, 0);

            });
        });

    };

    $scope.clean_properties = function(properties){
        //Filter to keep properties only existing in model
        properties.filter_according_to_model();
    };

    $scope.save_properties = function (properties, module) {
        ApplicationService.save_properties($routeParams.application, $scope.platform, properties, module.properties_path).then(function (properties) {
            ModuleService.get_model(module).then(function (model) {
                $scope.properties = properties.mergeWithModel(model);
            });
            //Increase platform number
            $scope.platform.version_id = $scope.platform.version_id + 1;
        }, function (error) {
            //If an error occurs, reload the platform, thus avoiding having a non synchronized $scope model object
            $location.url('/properties/' + $scope.platform.application_name).search({platform: $scope.platform.name});
            $route.reload(); //Force reload if needed
        });
    };

    $scope.edit_instance = function (instance) {
        ApplicationService.get_instance_model($routeParams.application, $scope.platform, instance).then(function (model) {
            $scope.instance = instance.mergeWithModel(model);
            $scope.properties = undefined; //hide the properties panel if opened
        });
    };

    $scope.get_platform_to_compare = function (application, platform, lookPast, date) {
        $scope.loading_compare_platform = true;
        if (lookPast) {
            var platform_promise = ApplicationService.get_platform(application, platform, date.getTime());
        } else {
            var platform_promise = ApplicationService.get_platform(application, platform);
        }

        platform_promise.then(function (platform) {
            $scope.compare_platform = platform;
            $scope.loading_compare_platform = false;
        }).then(function () {
            //Try to detect module
            $scope.compare_platform.chosen_module = _.find($scope.compare_platform.modules, function (module) {
                return module.name == $scope.compare_module.name;
            });
        });
    };

    /* Get the application */
    ApplicationService.get($routeParams.application).then(function (application) {
        $scope.application = application;
        $scope.platforms = application.platforms;
        /* If platform was mentionned in the route, try to find it */
        /* If it does not exist show error */
        if ($routeParams.platform) {
            var selected_platform = _.find($scope.platforms, function (platform) {
                return platform.name === $routeParams.platform;
            });
            if (_.isUndefined(selected_platform)) {
                $.notify("La brique technique mentionee dans l'url n'existe pas", "error");
            } else {
                $scope.platform = selected_platform;
                $scope.update_main_box(selected_platform);
            }
        }

    }, function (error) {
        $.notify(error.data.message, "error");
    });

    $(window).scroll(function () {
        var elementPosition = $('#referenceForPropertiesButtonsInitialPosition').offset();
        var width = $('#referenceForPropertiesButtonsInitialPosition').width();
        if ($(window).scrollTop() > elementPosition.top - 50 && width > 0) {
            $('#propertiesButtonsContainer').css('position', 'fixed').css('top', '50px');
            $('#propertiesButtonsContainer').width(width);
        } else {
            $('#propertiesButtonsContainer').css('position', 'static');
        }
    });

}]);

propertiesModule.controller('DiffCtrl', ['$scope', '$routeParams', '$timeout', '$route', 'ApplicationService', function ($scope, $routeParams, $timeout, $route, ApplicationService) {

    var DiffContainer = function (status, property_to_modify, property_to_compare_to) {
        // 0 -> only on to_modify
        // 1 -> on both and identical values
        // 2 -> on both and different values
        // 3 -> only on to_compare_to
        this.status = status;
        this.property_to_modify = property_to_modify;
        this.property_to_compare_to = property_to_compare_to;
        this.modified = false;
    };

    $scope.application_name = $routeParams.application;
    $scope.platform_name = $routeParams.platform;
    $scope.properties_path = $routeParams.properties_path;
    $scope.compare_application = $routeParams.compare_application;
    $scope.compare_platform = $routeParams.compare_platform;
    $scope.compare_path = $routeParams.compare_path;

    $scope.show_only_modified = false;
    $scope.identical_values_filter = {'status':'1'};

    $scope.change_identical_values_filter = function(){
       $scope.identical_values_filter = $scope.show_only_modified ? {'status':'1', 'modified': 'true'} : {'status':'1'};;
    }

    //Get the platform to get the version id
    //Then get the properties, version id could have changed but it is really marginal
    ApplicationService.get_platform($routeParams.application, $routeParams.platform).then(function (platform) {
        $scope.platform = platform;
    }).then(function () {
        return ApplicationService.get_properties($routeParams.application, $routeParams.platform, $routeParams.properties_path);
    }).then(function (properties) {
        $scope.properties_to_modify = properties;
    }).then(function () {
        return ApplicationService.get_properties($routeParams.compare_application, $routeParams.compare_platform, $routeParams.compare_path, $routeParams.timestamp);
    }).then(function (properties) {
        $scope.properties_to_compare_to = properties;
    }).then(function () {
        $scope.generate_diff_containers();
    });

    //Everything needs to be in scope for this function to work
    $scope.generate_diff_containers = function () {
        $scope.diff_containers = [];
        //Group properties, this is a O(n^2) algo but is enough for the use case
        //Only focus on key/value properties
        //We set create a container for each property with a diff status, a property_to_modify, a property_to_compare_to
        _.each($scope.properties_to_modify.key_value_properties, function (prop_to_modify) {
            var prop_to_compare_to = _.find($scope.properties_to_compare_to.key_value_properties, function (prop) {
                return prop_to_modify.name === prop.name;
            });

            if (_.isUndefined(prop_to_compare_to)) {
                $scope.diff_containers.push(new DiffContainer(0, prop_to_modify, prop_to_compare_to));
            } else {
                if (prop_to_modify.value === prop_to_compare_to.value) {
                    $scope.diff_containers.push(new DiffContainer(1, prop_to_modify, prop_to_compare_to));
                } else {
                    $scope.diff_containers.push(new DiffContainer(2, prop_to_modify, prop_to_compare_to));
                }
            }
        });

        //Check properties only in compare_to
        _.each($scope.properties_to_compare_to.key_value_properties, function (prop_to_compare_to) {
            var some = _.some($scope.properties_to_modify.key_value_properties, function (prop) {
                return prop_to_compare_to.name === prop.name;
            });

            if (!some) {
                $scope.diff_containers.push(new DiffContainer(3, null, prop_to_compare_to));
            }
        });
    }

    //Helper for diff conainers ids
    $scope.dot_to_underscore = function (string) {
        return string.replace(/\./g, '_');
    }

    $scope.replace_property = function (diff_container) {

        if (_.isUndefined(diff_container.property_to_modify) || diff_container.property_to_modify == null) {
            diff_container.property_to_modify = {};
        }
        diff_container.property_to_modify.name = diff_container.property_to_compare_to.name;

        //There is an animation to trigger before making the actual change
        //Property_to_compare_to will always be here, so use it instead of property_to_modify
        var row = $('#different-row-' + $scope.dot_to_underscore(diff_container.property_to_compare_to.name));
        var value_to_replace = $('#value_to_replace-' + $scope.dot_to_underscore(diff_container.property_to_compare_to.name));
        var value_to_use = $('#value_to_use-' + $scope.dot_to_underscore(diff_container.property_to_compare_to.name));

        var value_to_replace_left = value_to_replace.offset().left;
        var value_to_replace_top = value_to_replace.offset().top;
        var value_to_replace_width = value_to_replace.width();
        var value_to_use_left = value_to_use.offset().left;
        var value_to_use_top = value_to_use.offset().top;
        var value_to_use_width = value_to_use.width();

        var value_to_use_clone = value_to_use.clone();
        value_to_use.parent().append(value_to_use_clone);
        value_to_use_clone.css({position: 'absolute', top: value_to_use.offset().top, left: value_to_use_left});

        var value_to_replace_clone = value_to_replace.clone();
        value_to_replace.parent().prepend(value_to_replace_clone);
        value_to_replace.hide();
        value_to_replace_clone.css({position: 'relative'});
        value_to_replace_clone.animate({
            opacity: 0,
            top: "+=200px"
        }, 500, "swing");

        //Move value_to_use to value_to_replace
        value_to_use_clone.animate({
                opacity: 1,
                left: value_to_replace_left + (value_to_replace_width-value_to_use_width)
            }, 500, "swing"
            , function () {
                //Replace for real
                diff_container.property_to_modify.old_value = diff_container.property_to_modify.value;
                diff_container.property_to_modify.value = diff_container.property_to_compare_to.value;

                $scope.$apply();
                value_to_replace.show();

                value_to_use_clone.remove();


                //Animate row to go up
                $timeout(function() {
                    row.css({position: 'relative'});
                    row.animate({
                        opacity: 0,
                        top: "-=200px"
                    }, 500, "swing", function () {
                        //Change status for real
                        diff_container.modified = true;
                        diff_container.status = 1;

                        $scope.$apply();

                        row.remove();
                    });
                }, 200);
            });

    };

    $scope.undo_diff = function(diff_container){

        var row = $('#identical-row-' + $scope.dot_to_underscore(diff_container.property_to_modify.name));
        var old_value = $('#old_value-' + $scope.dot_to_underscore(diff_container.property_to_modify.name));
        var actual_value = $('#actual_value-' + $scope.dot_to_underscore(diff_container.property_to_modify.name));

        var old_value_left = old_value.offset().left;
        var old_value_top = old_value.offset().top;
        var old_value_width = old_value.width();
        var actual_value_left = actual_value.offset().left;
        var actual_value_top = actual_value.offset().top;
        var actual_value_width = actual_value.width();

        var actual_value_clone = actual_value.clone();
        actual_value.parent().append(actual_value_clone);
        actual_value.hide();
        actual_value_clone.css({position: 'relative'});
        actual_value_clone.animate({
            opacity: 0,
            top: "+=200px"
        }, 500, "swing");

        old_value.css({position: 'absolute', top: old_value_top, left: old_value_left, "text-decoration": 'none'});
        old_value.animate({
            left: actual_value_left + actual_value_width - old_value_width
        }, 500, "swing", function(){

            //Replace for real
            diff_container.property_to_modify.value = diff_container.property_to_modify.old_value;
            delete diff_container.property_to_modify.old_value;

            $scope.$apply();
            actual_value.show();

            old_value.remove();
            actual_value_clone.remove();


            //Animate row to go up
            $timeout(function() {
                row.css({position: 'relative'});
                row.animate({
                    opacity: 0,
                    top: "+=200px"
                }, 500, "swing", function () {
                    //Change status for real
                    diff_container.modified = false;
                    diff_container.status = 2;

                    $scope.$apply();

                    row.remove();
                });
            }, 200);


        });

    };

    $scope.validate_diff = function () {
        //Get all the properties modified
        var key_value_properties = _($scope.diff_containers).filter(function (diff_container) {
            return diff_container.property_to_modify != null;
        }).map(function(diff_container){ return diff_container.property_to_modify; }).value();

        $scope.properties_to_modify.key_value_properties = key_value_properties;
        ApplicationService.save_properties($scope.application_name, $scope.platform, $scope.properties_to_modify, $scope.properties_path).then(function (properties) {
            $route.reload();
        });
    };

}]);

propertiesModule.directive('propertiesList', function () {

    return {
        restrict: 'E',
        scope: {
            properties: '='
        },
        templateUrl: "properties/properties-list.html",
        link: function (scope, element, attrs) {
            scope.propertiesKeyFilter = "";
            scope.propertiesValueFilter = "";

            scope.truePropertiesKeyFilter = "";
            scope.truePropertiesValueFilter = "";

            scope.$watch("propertiesKeyFilter", function (newV, oldV) {
                if (newV.length < 2) {
                    scope.truePropertiesKeyFilter = "";
                } else {
                    scope.truePropertiesKeyFilter = newV;
                }
            });

            scope.$watch("propertiesValueFilter", function (newV, oldV) {
                if (newV.length < 2) {
                    scope.truePropertiesValueFilter = "";
                } else {
                    scope.truePropertiesValueFilter = newV;
                }
            });

        }
    };


});

propertiesModule.factory('Properties', function () {

    var Properties = function (data) {

        angular.extend(this, {
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

        this.filter_according_to_model = function(){
            this.key_value_properties = _.filter(this.key_value_properties, function(property){
                return property.inModel;
            });
            this.iterable_properties = _.filter(this.iterable_properties, function(property){
                return property.inModel;
            });
        }

        this.to_rest_entity = function () {
            return {
                versionID: this.versionID,
                key_value_properties: _.map(this.key_value_properties, function (kvp) {
                    return {
                        name: kvp.name,
                        comment: kvp.comment,
                        value: kvp.value
                    }
                }),
                iterable_properties: _.map(this.iterable_properties, function (ip) {
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
