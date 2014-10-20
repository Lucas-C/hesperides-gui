/**
 * Created by william_montaz on 17/10/2014.
 */
var fileModule = angular.module('hesperides.file', []);

fileModule.factory('FileService', ['$http', function ($http) {

    return {
        generate: function (application, version, platform, template_name) {
            return $http.get('rest/properties/generated/'+version+'/'+application+'/'+platform+'/'+template_name).then(function(response) {
                return response.data;
            });
        }
    }

}]);
