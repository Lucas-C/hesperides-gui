'use strict';

angular.module('Hesperides.controllers').controller('SearchCtrl', ['$scope', 'Search', function ($scope, Search) {
        $scope.search = function (keywords) {
            Search.fulltext(keywords).then(function (searchKeys){
                    $scope.searchKeys = searchKeys;
                }
            ) ;
        }
}]);
