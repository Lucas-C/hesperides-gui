/**
 * Created by william_montaz on 17/10/2014.
 */
var contextModule = angular.module('hesperides.context', []);

contextModule.controller('ContextCtrl', ['$scope', '$routeParams', '$location', 'ApplicationService', 'PlatformService', 'ContextService', 'Page', function ($scope, $routeParams, $location, ApplicationService, PlatformService, ContextService, Page) {
    Page.setTitle("Instances");

    $scope.platforms = [];
    $scope.contexts = [];
    $scope.selected = {};

    $scope.on_edit_platform = function (platform_name) {
        $scope.selected.unit = undefined;
        $scope.selected.context = undefined;
    };

    $scope.on_edit_unit = function (unit) {
        $scope.selected.context = undefined;
        /* Load contexts */
        ContextService.all($scope.contextNamespace($scope.application, $scope.selected.platform, unit)).then(function (contexts) {
            ContextService.getModel($scope.propertiesNamespaceModel($scope.application, $scope.selected.platform, unit)).then(function(model){
                $scope.contexts = _.map(contexts, function(context){
                    return context.mergeWithModel(model);
                });
            });
        });
    };

    $scope.add_context = function (name) {
        if (!_.some($scope.contexts, function (context) {
            return context.name === name;
        })) {
            /* To add a context just try to load it, it will be merged with the model whatever even if there is no existing context resulting in a new fresh ready to use context */
            ContextService.getContextMergedWithModel($scope.propertiesNamespaceModel($scope.application, $scope.selected.platform, $scope.selected.unit), $scope.contextNamespace($scope.application, $scope.selected.platform, $scope.selected.unit), name).then(function (context) {
                $scope.selected.context = context;
                $scope.contexts.push(context);
            });
        }
    };

    $scope.save_context = function (context) {
        ContextService.save(context).then(function (context) {
            ContextService.getModel($scope.propertiesNamespaceModel($scope.application, $scope.selected.platform, $scope.selected.unit)).then(function (model) {
                $scope.selected.context = context.mergeWithModel(model);
            });
        });
    };

    $scope.propertiesNamespaceModel = function (application, platform, unit) {
        return "properties#" + application.name + "#" + application.version + "#" + platform + "#" + unit.name;
    };

    $scope.contextNamespace = function (application, platform, unit) {
        return "contexts#" + application.name + "#" + application.version + "#" + platform + "#" + unit.name;
    };

    ApplicationService.get($routeParams.application, $routeParams.version).then(function (application) {
        $scope.application = application;
        /* If unit was mentionned in the route, try to find it */
        /* and if it does not exist show error */
        if ($routeParams.unit) {
            var actual_unit = _.find(application.units, function (unit) {
                return unit.name === $routeParams.unit;
            });
            if (_.isUndefined(actual_unit)) {
                $.notify("La brique technique mentionee ddans l'url n'existe pas", "error");
            } else {
                $scope.selected.unit = actual_unit;
                $scope.on_edit_unit(actual_unit);
            }
        }
        ;
    }, function (error) {
        $.notify(error.data, "error");
    });

    /* Find all the platforms and try to select the one in the url */
    PlatformService.get($routeParams.application, $routeParams.version).then(function (platforms) {
        $scope.platforms = platforms;
        if (_.contains($scope.platforms, $routeParams.platform)) {
            $scope.selected.platform = $routeParams.platform;
        }
    });

}]);

contextModule.directive('contextView', function(){

    return {
        restrict: 'E',
        scope: {
            context: '='
        },
        templateUrl: "context/context-view.html",
        link: function(scope, element, attrs){

        }
    };


});

contextModule.factory('ContextModel', function () {

    var ContextModel = function (data) {

        angular.extend(this, {
            keys: []
        }, data);

        this.hasKey = function (name) {
            return this.keys.some(function (key) {
                return key.name === name;
            });
        };

    };

    return ContextModel;

});

contextModule.factory('Context', function () {

    var Context = function (data) {

        angular.extend(this, {
            namespace: "",
            name: "",
            key_values: [],
            versionID: -1
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
            _(model.key_values).filter(function (model_key_value) {
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

        this.toHesperidesEntity = function () {
            return {
                namespace: this.namespace,
                name: this.name,
                versionID: this.versionID,
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

    return Context;

});

contextModule.factory('ContextService', ['$http', 'Context', 'ContextModel', function ($http, Context, ContextModel) {

    return {
        getModel: function (namespace) {
            return $http.get('rest/contexts/model/' + encodeURIComponent(namespace)).then(function (response) {
                return new ContextModel(response.data);
            }, function (error) {
                return new ContextModel();
            });
        },
        get: function (namespace, name) {
            return $http.get('rest/contexts/' + encodeURIComponent(namespace) + '/' + encodeURIComponent(name)).then(function (response) {
                return new Context(response.data);
            }, function (error) {
                $.notify(error.data, "error");
                throw error;
            });
        },
        getContextMergedWithModel: function (model_namespace, namespace, name) {
            var me = this;
            return this.getModel(model_namespace).then(function (model) {

                return me.get(namespace, name).then(function (context) {
                    return context.mergeWithModel(model);
                }, function (error) {
                    var context = new Context({namespace: namespace, name: name});
                    return context.mergeWithModel(model);
                });

            });
        },
        save: function (context) {
            context = context.toHesperidesEntity();
            if (context.versionID < 0) {
                return $http.post('rest/contexts/' + encodeURIComponent(context.namespace) + '/' + encodeURIComponent(context.name), context).then(function (response) {
                    return new Context(response.data);
                }, function (error) {
                    $.notify(error.data, "error");
                });
            } else {
                return $http.put('rest/contexts/' + encodeURIComponent(context.namespace) + '/' + encodeURIComponent(context.name), context).then(function (response) {
                    return new Context(response.data);
                }, function (error) {
                    $.notify(error.data, "error");
                });
            }
        },
        all: function (namespace) {
            return $http.get('rest/contexts/' + encodeURIComponent(namespace)).then(function (response) {
                return response.data.map(function (data) {
                    return new Context(data);
                });
            }, function (error) {
                $.notify(error.data, "error");
            });
        }
    };

}]);