/**
 * Created by william_montaz on 20/10/2014.
 */


var modelModule = angular.module('hesperides.model', ['hesperides.properties']);

modelModule.directive('hesperidesModel', function(){
    return {
        restrict: 'E',
        templateUrl: 'model/model.html',
        scope: {
            model: '='
        }
    }
});