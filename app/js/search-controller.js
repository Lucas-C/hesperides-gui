'use strict';

angular.module('Hesperides.controllers').controller('FulltextCtrl', ['$scope', 'searchFulltext', function ($scope, searchFulltext) {
        $scope.search = function (keywords) {
            searchFulltext(keywords).then(function (searchKeys){
                    $scope.searchKeys = searchKeys;
                }

            ) ;
        }
}]);
