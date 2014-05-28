'use strict';

angular.module('Hesperides.controllers').controller('SearchCtrl', ['$scope', 'Search', function ($scope, Search) {
    $scope.title = "Recherche";
	
	$scope.search = function (keywords) {
        Search.fulltext(keywords).then(function (searchKeys) {
                $scope.searchKeys = searchKeys;
				$scope.searchType = "AI";
				$scope.hostname = "";
            }
        );
    };
    $scope.searchHostname = function (hostname) {
        Search.fulltextHostname(hostname).then(function (hostname) {
                $scope.hostnames = hostname;
				$scope.searchType = "hostname";
				$scope.keywords = "";
            }
        );
    }
}]);
