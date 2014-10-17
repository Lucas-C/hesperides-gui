/**
 * Created by william_montaz on 17/10/2014.
 */
var contextModule = angular.module('hesperides.context', []);

contextModule.controller('ContextCtrl', ['$scope', '$routeParams', '$location', 'ApplicationService', 'PlatformService', 'ContextService', 'Page', function ($scope, $routeParams, $location, Application, Platform, Context, Page) {
    Page.setTitle("Instances");

    $scope.platforms = []

    $scope.contextNamespace = "contexts." + $scope.application.name + "." + $scope.application.version + "." + $scope.chosen_platform + "." + $scope.chosen_unit.name;

    /* This function is used to regularly refresh the screen and load the appropriate contexts */
    $scope.$watch('chosen_unit', function () {
        /* We need to load contexts only if a platform and a unit is chosen */
        if ($scope.is_platform_chosen() && $scope.is_unit_chosen()) {
            Context.all($scope.contextNamespace).then(function (contexts) {
                $scope.contexts = contexts;
            });
        } else {
            $scope.contexts = undefined;
            $scope.context = undefined;
        }
    });

    $scope.is_platform_chosen = function () {
        return !(_.isNull($scope.chosen_platform) || _.isUndefined($scope.chosen_platform));
    };

    $scope.is_unit_chosen = function () {
        return !(_.isNull($scope.chosen_unit) || _.isUndefined($scope.chosen_unit));
    };

    $scope.is_context_chosen = function () {
        return !(_.isNull($scope.chosen_context) || _.isUndefined($scope.chosen_context));
    };

    $scope.display_context = function () {
        return !(_.isNull($scope.context) || _.isUndefined($scope.context));
    }

    $scope.choose_platform = function (platform_name) {
        $scope.chosen_platform = platform_name;
        $scope.chosen_unit = undefined;
        $scope.chosen_context = undefined;
    };

    $scope.choose_unit = function (unit_name) {
        $scope.chosen_unit = unit_name;
        $scope.chosen_context = undefined;
    };
    $scope.choose_context = function (context_name) {
        return $scope.load_context(context_name).then(function (context) {
            $scope.chosen_context = context;
            return context;
        });
    };

    Application.get({name: $routeParams.application, version: $routeParams.version}).$promise.then(function (application) {
        $scope.application = application;
        /* If unit was mentionned in the route, try to find it */
        /* If it does not exist show error */
        if ($routeParams.unit) {
            var actual_unit = _.find(application.units, function (unit) {
                return unit.name === $routeParams.unit;
            });
            if (_.isUndefined(actual_unit)) {
                $.notify("La brique technique mentionee ddans l'url n'existe pas", "error");
            } else {
                $scope.chosen_unit = actual_unit;
            }
        }
        ;
    }, function (error) {
        $.notify(error.data, "error");
    });

    /* Find all the platforms */
    Platform.get($routeParams.application, $routeParams.version).then(function (platforms) {
        $scope.platforms = platforms;
        if (_.contains($scope.platforms, $routeParams.platform)) {
            $scope.chosen_platform = $routeParams.platform;
        }
    });

    $scope.focus_name_context = function () {
        window.setTimeout(function () {
            $('#nameContextInput').focus();
        }, 80);
    };

    $scope.add_context = function (name) {
        if (!_.some($scope.contexts, function (context) {
            return context.name === name;
        })) {
            $scope.choose_context(name).then(function (context) {
                $scope.contexts.push(context);
            });
        }
    };

    $scope.load_context = function (name) {
        return Context.get("properties." + $scope.application.name + "." + $scope.application.version + "." + $scope.chosen_platform + "." + $scope.chosen_unit.name,
                "contexts." + $scope.application.name + "." + $scope.application.version + "." + $scope.chosen_platform + "." + $scope.chosen_unit.name,
            name).then(function (context) {
                $scope.context = context;
                return context;
            });
    };

    $scope.save_context = function (context) {
        if (_.isUndefined(context.id)) {
            Context.create(context).then(function () {
                $scope.context = context;
                $.notify("Le contexte a bien ete cree", "success");
            }, function (error) {
                $.notify(error.data, "error");
            });
        } else {
            Context.update(context).then(function () {
                $scope.context = context;
                $.notify("Le contexte a bien ete mises a jour", "success");
            }, function (error) {
                $.notify(error.data, "error");
            });
        }
    };

}]);

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
            return this.key_values.some(function (key) {
                return key.name === name;
            });
        };

        this.mergeWithModel = function (model) {

            /* Mark key_values that are in the model */
            this.key_values.each(function (key_value) {
                key_value.inModel = model.hasKey(key_value.name);
            });

            /* Add key_values that are only in the model */
            model.keys.filter(function (model_key_value) {
                return !this.hasKey(model_key_value.name);
            }).each(function (model_key_value) {
                this.key_values.push({
                    name: model_key_value.name,
                    comment: model_key_value.comment,
                    value: "",
                    inModel: true
                });
            });

            return this;
        };

    };

    return Context;

});

contextModule.factory('ContextService', ['$http', 'Context', function ($http, Context) {

    return {
        getModel: function (namespace) {
            return $http.get('rest/contexts/model/' + namespace).then(function (response) {
                return new ContextModel(response.data);
            }, function (error) {
                $.notify(error.data, "error");
            });
        },
        get: function (namespace, name) {
            return $http.get('rest/contexts/' + namespace + '/' + name).then(function (response) {
                return new Context(response.data);
            }, function (error) {
                $.notify(error.data, "error");
            });
        },
        getContextMergedWithModel: function (model_namespace, namespace, name) {
            var model = this.getModel(model_namespace);

            return $http.get('rest/contexts/' + namespace + '/' + name).then(function (response) {
                return response.data;
            }, function (error) {
                return {hesnamespace: namespace, name: name, key_values: []};
            }).then(function (context) {
                return context.mergeWithModel(model);
            });

        },
        save: function (context) {
            if (context.versionID < 0) {
                return $http.post('rest/contexts/' + context.namespace + '/' + context.name, context).then(function (response) {
                    return new Context(response.data);
                }, function (error) {
                    $.notify(error.data, "error");
                });
            } else {
                return $http.put('rest/contexts/' + context.namespace + '/' + context.name, context).then(function (response) {
                    return new Context(response.data);
                }, function (error) {
                    $.notify(error.data, "error");
                });
            }
        },
        all: function (namespace) {
            return $http.get('rest/contexts/' + namespace).then(function (response) {
                return response.data.map(function (data) {
                    return new Context(data);
                });
            }, function (error) {
                $.notify(error.data, "error");
            });
        }
    };

}]);