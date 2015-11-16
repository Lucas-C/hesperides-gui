/**
 * Created by william_montaz on 17/10/2014.
 */
var propertiesModule = angular.module('hesperides.properties', ['hesperides.nexus']);

propertiesModule.controller('PropertiesCtrl', ['$scope', '$routeParams', '$modal', '$location', '$route', '$timeout', 'ApplicationService', 'ModuleService', 'ApplicationModule', 'Page', 'NexusService', function ($scope, $routeParams, $modal, $location, $route, $timeout, ApplicationService, ModuleService, Module, Page, NexusService) {
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
        if (!(old_name === new_name)) {
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

    /**
     * Met à jour la version de la plateforme.
     *
     * @param platform plateforme courante
     */
    $scope.change_platform_version = function (platform) {

        // récupération des versions des ndl de l'application
        NexusService.getNdlVersions(platform.application_name)
            .then(function (ndlVersions) {
                var modalScope = $scope.$new();
                modalScope.platform = platform;
                modalScope.ndlVersions = ndlVersions;

                var modal = $modal.open({
                    templateUrl: 'application/change_platform_version.html',
                    backdrop: 'static',
                    size: 'lg',
                    keyboard: false,
                    scope: modalScope
                });

                modal.result.then(function (modal_data) {

                    if (modal_data.use_ndl === true) {
                        // on met à jour les modules de l'application à partir des infos de la ndl
                        NexusService.getNdl(platform.application_name, modal_data.new_version)
                            .then(function (ndl) {
                                return ApplicationService.updatePlatformConfig(platform, modal_data.new_version, ndl.NDL_pour_rundeck.packages);
                            })
                            .then(function (updatedModules) {
                                // sauvegarde de la plateforme
                                $scope.save_platform_from_box($scope.mainBox, modal_data.copy_properties)
                                    .then(function (response) {
                                        $scope.properties = undefined;
                                        $scope.instance = undefined;

                                        // notification des modules mis à jour
                                        _.each(updatedModules, function (updatedModule) {
                                            $.notify("Module mis à jour : " + updatedModule.name, "success");
                                        })
                                    });
                            });

                    } else {
                        // sinon, on ne met à jour que la version de l'application
                        platform.application_version = modal_data.new_version;

                        // sauvegarde de la plateforme
                        $scope.save_platform_from_box($scope.mainBox)
                            .then(function (response) {
                                $scope.properties = undefined;
                                $scope.instance = undefined;
                            });
                    }
                });
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

    $scope.diff_global_properties = function (platform) {
        $scope.from = {}
        var modal = $modal.open({
            templateUrl: 'application/global_properties_diff_wizard.html',
            backdrop: 'static',
            size: 'lg',
            keyboard: false,
            scope: $scope
        });

        modal.result.then(function (from) {
            $scope.open_global_diff_page(from);
        });
    };

    $scope.open_global_diff_page = function (from) {
        //Everything is set in the scope by the modal when calling this
        //Not very safe but easier to manage with all scopes genrated
        var urlParams = {
            application: $scope.platform.application_name,
            platform: $scope.platform.name,
            properties_path: '#',
            compare_application: from.application,
            compare_platform: from.platform,
            compare_path: '#'
        };
        if (!_.isUndefined(from.date)) {
            urlParams.timestamp = from.date.getTime();
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
                //Merge with global properties
                $scope.properties = properties.mergeWithGlobalProperties($scope.platform.global_properties);

                $scope.selected_module = module;
                $scope.instance = undefined; //hide the instance panel if opened

                //Scroll to properties
                $timeout(function () {
                    $('html, body').animate({
                        scrollTop: $('#propertiesButtonsContainer').offset().top
                    }, 1000, 'swing');
                }, 0);

            });
        });

    };

    $scope.clean_properties = function (properties) {
        //Filter to keep properties only existing in model
        properties.filter_according_to_model();
    };

    $scope.save_global_properties = function (properties) {
        ApplicationService.save_properties($routeParams.application, $scope.platform, properties, '#').then(function (properties) {
            if (!_.isUndefined($scope.properties)) {
                $scope.properties = $scope.properties.mergeWithGlobalProperties(properties);
            }
            //Increase platform number
            $scope.platform.version_id = $scope.platform.version_id + 1;
        });
    }

    $scope.save_properties = function (properties, module) {
        ApplicationService.save_properties($routeParams.application, $scope.platform, properties, module.properties_path).then(function (properties) {
            //Merge properties with model
            ModuleService.get_model(module).then(function (model) {
                $scope.properties = properties.mergeWithModel(model);
            });

            //Merge with global properties
            $scope.properties = properties.mergeWithGlobalProperties($scope.platform.global_properties);

            //Increase platform number
            $scope.platform.version_id = $scope.platform.version_id + 1;
        }, function (error) {
            //If an error occurs, reload the platform, thus avoiding having a non synchronized $scope model object
            $location.url('/properties/' + $scope.platform.application_name).search({platform: $scope.platform.name});
            $route.reload(); //Force reload if needed
        });
    };

    $scope.edit_instance = function (instance, properties_path) {
        ApplicationService.get_instance_model($routeParams.application, $scope.platform, properties_path).then(function (model) {
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

}]);

propertiesModule.controller('DiffCtrl', ['$scope', '$routeParams', '$timeout', '$route', 'ApplicationService', function ($scope, $routeParams, $timeout, $route, ApplicationService) {

    var DiffContainer = function (status, property_name, property_to_modify, property_to_compare_to) {
        // 0 -> only on to_modify
        // 1 -> on both and identical values
        // 2 -> on both and different values
        // 3 -> only on to_compare_to
        this.status = status;
        this.property_name = property_name;
        this.property_to_modify = property_to_modify;
        this.property_to_compare_to = property_to_compare_to;
        this.modified = false;
        this.selected = false;
    };

    $scope.application_name = $routeParams.application;
    $scope.platform_name = $routeParams.platform;
    $scope.properties_path = $routeParams.properties_path;
    $scope.compare_application = $routeParams.compare_application;
    $scope.compare_platform = $routeParams.compare_platform;
    $scope.compare_path = $routeParams.compare_path;

    $scope.show_only_modified = true;

    $scope.propertiesKeyFilter0 = "";
    $scope.propertiesKeyFilter1 = "";
    $scope.propertiesKeyFilter2 = "";
    $scope.propertiesKeyFilter3 = "";

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
        //First we look in the properties to modify, for each try:
        //  - to check if value is empty -> status 3
        //  - to find a property to compare to
        //        - with identical value -> status 1
        //        - with different value -> status 2
        //  - if no matching property -> status 0
        _.each($scope.properties_to_modify.key_value_properties, function (prop_to_modify) {

            if (prop_to_modify.value === '') {
                //Avoid null pointer create prop to compare to with an empty value
                var prop_to_compare_to = angular.copy(prop_to_modify);
                prop_to_compare_to.value = '';
                $scope.diff_containers.push(new DiffContainer(0, prop_to_modify.name, prop_to_modify, {}));
                return;
            }

            //else try to find a matching prop_to_compare_to
            var prop_to_compare_to = _.find($scope.properties_to_compare_to.key_value_properties, function (prop) {
                return prop_to_modify.name === prop.name;
            });

            if (_.isUndefined(prop_to_compare_to) || prop_to_compare_to.value === '') {
                //Avoid null pointer create prop to compare to with an empty value
                var prop_to_compare_to = angular.copy(prop_to_modify);
                prop_to_compare_to.value = '';
                $scope.diff_containers.push(new DiffContainer(0, prop_to_modify.name, prop_to_modify, {}));
            } else {
                if (prop_to_modify.value === prop_to_compare_to.value) {
                    $scope.diff_containers.push(new DiffContainer(1, prop_to_modify.name, prop_to_modify, prop_to_compare_to));
                } else {
                    $scope.diff_containers.push(new DiffContainer(2, prop_to_modify.name, prop_to_modify, prop_to_compare_to));
                }
            }
        });

        //Check properties remaining in compare_to (not existing or value equals to ''). The one we missed when iterating through properties_to_modify
        _.each($scope.properties_to_compare_to.key_value_properties, function (prop_to_compare_to) {
            var some = _.some($scope.properties_to_modify.key_value_properties, function (prop) {
                return prop_to_compare_to.name === prop.name;
            });

            if (!some) {
                //Avoid null pointer create prop to modify with an empty value
                var prop_to_modify = angular.copy(prop_to_compare_to);
                prop_to_modify.value = '';
                $scope.diff_containers.push(new DiffContainer(3, prop_to_modify.name, prop_to_modify, prop_to_compare_to));
            }
        });
    }

    //Helper for diff conainers ids
    $scope.dot_to_underscore = function (string) {
        return string.replace(/\./g, '_');
    }

    $scope.toggle_selected_to_containers_with_filter = function (filter, selected) {
        _($scope.diff_containers).filter(function (container) {
            for (var key in filter) {
                if (!_.isEqual(filter[key], container[key])) return false;
            }
            return true;
        }).each(function (container) {
            container.selected = selected;
        });
    };

    $scope.apply_diff = function () {
        /* Filter the diff container that have been selected
         depending on the status apply different behaviors
         if status == 0 : this should not happened because it is values that are only in the destination platform, so just ignore it
         if status == 1 : normaly the only selected containers should be the one that have been modified, but it does not really matter
         because the other ones have the same values. We can just apply the 'revert modification' mecanism
         if status == 2 : this is when we want to apply modification from sourc epltfm to destination pltfm
         if status == 3 : same behavior as status == 2
         */
        _($scope.diff_containers).filter(function (diff_container) {
            return diff_container.selected
        }).each(function (diff_container) {
            switch (diff_container.status) {
                case 0:
                    break;
                case 1:
                    //Revert modifs
                    diff_container.property_to_modify.value = diff_container.property_to_modify.old_value;
                    delete diff_container.property_to_modify.old_value;

                    //Change status and reset markers. Keep selected for user experience
                    //Status depends on old_value, if it was empty status is 3 otherwise it is 2
                    diff_container.status = diff_container.property_to_modify.value != '' ? 2 : 3;
                    diff_container.modified = false;
                    break;
                case 2:
                    //Store old value and apply modifs
                    diff_container.property_to_modify.old_value = diff_container.property_to_modify.value;
                    diff_container.property_to_modify.value = diff_container.property_to_compare_to.value;

                    //Change status and reset markers. Keep selected for user experience
                    diff_container.modified = true;
                    diff_container.status = 1;
                    break;
                case 3:
                    //Same as 2, copy paste (bad :p )
                    //Store old value and apply modifs
                    diff_container.property_to_modify.old_value = diff_container.property_to_modify.value;
                    diff_container.property_to_modify.value = diff_container.property_to_compare_to.value;

                    //Change status and reset markers. Keep selected for user experience
                    diff_container.modified = true;
                    diff_container.status = 1;
                    break;
                default:
                    console.error("Diff container with invalid status -> " + container.status + ". It will be ignored");
                    break;
            }
        });

    };

    $scope.save_diff = function () {
        //Get all the properties modified
        var key_value_properties = _($scope.diff_containers).filter(function (diff_container) {
            return diff_container.property_to_modify != null;
        }).map(function (diff_container) {
            return diff_container.property_to_modify;
        }).value();

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
        }
    };


});

propertiesModule.directive('toggleDeletedProperties', function () {

    return {
        restrict: 'E',
        scope: {
            keyValueProperties: '=',
            toggle: '='
        },
        template: '<md-checkbox type="checkbox" ng-model="toggle" ng-init="toggle=false"/> Afficher les propri&eacute;t&eacute;s supprim&eacute;es ({{ getNumberOfDeletedProperties(keyValueProperties) }})',
        link: function (scope, element, attrs) {
            scope.getNumberOfDeletedProperties = function (tab) {
                var count = 0;

                if (tab) {
                    for (var index = 0; index < tab.length; index++) {
                        if (!tab[index].inModel) {
                            count++;
                        }
                    }
                }
                return count;
            };
        }
    }

});

propertiesModule.factory('Properties', function () {

    var Properties = function (data) {

        angular.extend(this, {
            key_value_properties: [],
            iterable_properties: [],
            is_sorted_desc: false,
            versionID: -1
        }, data);

        //Add a property that allows to filter other properties values
        _.each(this.key_value_properties, function (kvp) {
            kvp.filtrable_value = kvp.value;
        });

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

        this.addKeyValue = function (key_value_property) {
            if (!this.hasKey(key_value_property.name)) {
                this.key_value_properties.push(key_value_property);
            }
        }

        this.deleteKeyValue = function (key_value_property) {
            var index = this.key_value_properties.indexOf(key_value_property);
            if (index > -1) {
                this.key_value_properties.splice(index, 1);
            }
        }

        this.mergeWithGlobalProperties = function (global_properties) {
            //Here we just want to mark the one existing identical in the global properties,
            //because they wont be editable
            //Mark also the ones just using a global in their valorisation
            _.each(this.key_value_properties, function (key_value) {
                //First clean, in case there has been updates from the server
                key_value.inGlobal = false;
                key_value.useGlobal = false;

                var existing_global_property = _.find(global_properties.key_value_properties, function (kvp) {
                    return key_value.name === kvp.name;
                }, 'value');
                if (!_.isUndefined(existing_global_property)) {
                    key_value.inGlobal = true;
                    key_value.value = existing_global_property.value;
                } else {
                    //Try to check if it uses a global in the valorisation
                    if (_.some(global_properties.key_value_properties, function (kvp) {
                            return key_value.value.indexOf("{{" + kvp.name + "}}") > -1;
                        })) {
                        key_value.useGlobal = true;
                    }
                }
                ;
            });

            return this;
        }

        this.mergeWithModel = function (model) {
            var me = this;
            /* Mark key_values that are in the model */
            _.each(this.key_value_properties, function (key_value) {
                key_value.inModel = model.hasKey(key_value.name);
                // Add required
                var prop = _.find(model.required, function(kvp) {
                    return kvp.name === key_value.name;
                });

                key_value.required = prop.required;
                key_value.defaultValue = prop.defaultValue;

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
                    inModel: true,
                    required: model_key_value.required,
                    defaultValue: model_key_value.defaultValue
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

        this.filter_according_to_model = function () {
            this.key_value_properties = _.filter(this.key_value_properties, function (property) {
                return property.inModel;
            });
            this.iterable_properties = _.filter(this.iterable_properties, function (property) {
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
                        iterable_valorisation_items: ip.iterable_valorisation_items
                    }
                })
            }
        }

        this.switchOrder = function () {
          this.is_sorted_desc = !this.is_sorted_desc;
        }

        this.isReverseOrder = function () {
          return this.is_sorted_desc;
        }

    };

    return Properties;

});

propertiesModule.filter('displayProperties', function () {
    return function (items, display) {
        var filtered = [];

        angular.forEach(items, function (item) {
            if (display == undefined || display == true) {
                filtered.push(item);
            } else if (item.inModel) {
                filtered.push(item);
            }
        });

        return filtered;
    };
});
