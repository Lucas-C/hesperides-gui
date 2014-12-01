/**
 * Created by william_montaz on 20/10/2014.
 */


var modelModule = angular.module('hesperides.model', ['hesperides.properties']);

modelModule.directive('hesperidesModel', ['PropertiesService', function(PropertiesService){
    return {
        restrict: 'E',
        templateUrl: 'model/model.html',
        scope: {
            model: '='
        },
        link: function(scope, element, attr){

            // This function is used to parse the templates and retreived the model associated
            // ie. the properties parsed in the templates
            scope.refresh = function () {
                scope.loading_properties = true;
                PropertiesService.getModel(scope.namespaces).then(function (propertiesModel) {
                    scope.loading_properties = false;
                    scope.model = propertiesModel;
                    /* Force refresh, that might be needed */
                    //if (!scope.$$phase) {
                    //    scope.$apply();
                    //}
                });
            };

        }
    }
}]);