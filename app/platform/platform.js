/**
 * Created by william_montaz on 17/10/2014.
 */
var platformModule = angular.module('hesperides.platform', []);

platformModule.factory('PlatformService', ['$http', function ($http) {

    return {
        get: function(application, version) {
            application = application.toLowerCase();
            version = version.toLowerCase();//Put this server side
            return $http.get('rest/properties/search/namespace/'+encodeURIComponent('properties#*'+application+'*#'+'*'+version+'*')).then(function(response) {
                return _(response.data).map(function(properties){
                    var splittedNamespace = properties.namespace.split("#");
                    return splittedNamespace[3];
                }).groupBy().keys().value();
            });
        }
    }

}]);