/**
 * Created by william_montaz on 17/10/2014.
 */
var propertiesModule = angular.module('hesperides.properties', []);

propertiesModule.controller('PropertiesCtrl', ['$scope', '$routeParams', 'PropertiesService', 'ApplicationService', 'PlatformService', 'Page',  function ($scope, $routeParams, PropertiesService, ApplicationService, PlatformService, Page) {
    Page.setTitle("Properties");

    $scope.platform = $routeParams.platform;
    $scope.platforms = []

    $scope.on_edit_platform = function(platform_name){
        /* Reset unit choice */
        $scope.unit = undefined;
    };

    $scope.add_platform = function(platform_name) {
        if(!_.contains($scope.platforms, platform_name)){
             $scope.platforms.push(platform_name);
            return platform_name;
        }
    };

    $scope.delete_platform = function(platform){
        //Might be a bit tricky
    };

    $scope.on_edit_unit = function(unit){
        PropertiesService.getPropertiesMergedWithModel("properties."+$scope.application.name+"."+$scope.application.version+"."+$scope.platform+"."+unit.name, unit.modelNamespaces).then(function(properties){
            $scope.properties = properties;
        });
    };

    /* Get the application */
    ApplicationService.get($routeParams.application, $routeParams.version).then(function(application){
        $scope.application = application;
        /* If unit was mentionned in the route, try to find it */
        /* If it does not exist show error */
        if($routeParams.unit){
            var actual_unit = _.find(application.units, function(unit){ return unit.name === $routeParams.unit; });
            if(_.isUndefined(actual_unit)){
                $.notify("La brique technique mentionee dans l'url n'existe pas", "error");
            } else {
                $scope.unit = actual_unit;
                $scope.on_edit_unit(actual_unit);
            }
        };

    }, function(error){
        $.notify(error.data, "error");
    });

    /* Find all the platforms */
    PlatformService.get($routeParams.application, $routeParams.version).then(function(platforms){
        $scope.platforms = platforms;
    }).then(function(){
        /* If platform was mentionned in the route, try to find it or add it */
        if($scope.platform) $scope.add_platform($scope.platform);
    });


    $scope.save_properties = function(properties) {
        PropertiesService.save(properties).then(function(properties){
           PropertiesService.getModel($scope.unit.modelNamespaces).then(function(model){
               $scope.properties = properties.mergeWithModel(model);
           });
        });
    };

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

    };

    return Properties;

});

propertiesModule.factory('PropertiesService', ['$http', 'Properties', function ($http, Properties) {

    return {
        getModel: function(namespaces) {
            var namespaces_as_string = _.isArray(namespaces) ? namespaces.join(",")  : namespaces;
            return $http.get('rest/properties/model/'+namespaces_as_string).then(function(response){
                return new Properties(response.data);
            }, function (error) {
                $.notify(error.data, "error");
            });
        },
        get: function (namespace) {
            return $http.get('rest/properties/'+namespace).then(function (response) {
                return new Properties(response.data);
            }, function (error) {
                $.notify(error.data, "error");
            });
        },
        getPropertiesMergedWithModel: function(properties_namespace, model_namespaces) {
            var me = this;
            return this.getModel(model_namespaces).then(function(model){

                return me.get(properties_namespace).then(function(properties){
                    return properties.mergeWithModel(model);
                }, function(error){
                    var properties = new Properties({hesnamespace: properties_namespace});
                    return properties.mergeWithModel(model);
                });

            });
        },
        save: function(properties){
            if(properties.versionID < 0){
                return $http.post('rest/properties/'+properties.hesnamespace, properties).then(function(response) {
                    $.notify("Les proprietes ont bien ete crees", "success");
                    return new Properties(response.data);
                }, function(error) {
                    $.notify(error.data, "error");
                });
            } else {
                return $http.put('rest/properties/'+properties.hesnamespace, properties).then(function(response) {
                    $.notify("Les proprietes ont bien ete mises a jour", "success");
                    return new Properties(response.data)
                }, function(error) {
                    $.notify(error.data, "error");
                });
            }
        }
    }

}]);
