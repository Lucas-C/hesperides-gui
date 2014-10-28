
if ( typeof String.prototype.startsWith != 'function' ) {
    String.prototype.startsWith = function( str ) {
        return str.length > 0 && this.substring( 0, str.length ) === str;
    }
};

var hesperidesModule = angular.module('hesperides', [
    'ngRoute',
    'hesperides.application',
    'hesperides.context',
    'hesperides.file',
    'hesperides.menu',
    'hesperides.platform',
    'hesperides.properties',
    'hesperides.techno',
    'hesperides.template',
    'hesperides.components',
    'ui.bootstrap',
    'xeditable',
    'ui.codemirror'
]);

hesperidesModule.run(function (editableOptions) {
    editableOptions.theme = 'bs3';
});

hesperidesModule.factory('Page', function () {
    var title = 'Hesperides';
    return {
        title: function () {
            return title;
        },
        setTitle: function (newTitle) {
            title = "Hesperides - " + newTitle
        }
    }
});

hesperidesModule.controller("TitleCtrl", ['$scope', 'Page', function ($scope, Page) {
    $scope.Page = Page;
}]);

hesperidesModule.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/application/:application/:version', {
            templateUrl: 'application/application.html',
            controller: 'ApplicationCtrl'
        }).
        when('/properties/:application/:version', {
            templateUrl: 'properties/properties.html',
            controller: 'PropertiesCtrl'
        }).
        when('/contexts/:application/:version', {
            templateUrl: 'context/context.html',
            controller: 'ContextCtrl'
        }).
        when('/technos', {
            templateUrl: 'partials/technos-search.html',
            controller: 'TechnoSearchCtrl'
        }).
        when('/techno/:name/:version', {
            templateUrl: 'techno/techno.html',
            controller: 'TechnoCtrl'
        }).
        when('/help/api', {
            templateUrl: 'partials/help_api.html'
        }).
        otherwise({
            templateUrl: 'partials/welcome_screen.html'
        });
}]);

hesperidesModule.directive('ngReallyClick', [function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.bind('click', function () {
                var message = attrs.ngReallyMessage;
                if (message && confirm(message)) {
                    scope.$apply(attrs.ngReallyClick);
                }
            });
        }
    }
}]);

hesperidesModule.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

hesperidesModule.directive('newChildScope', function () {
    return {
        restrict: 'A',
        scope: true
    };
});

hesperidesModule.filter('interpolate', ['version', function (version) {
    return function (text) {
        return String(text).replace(/\%VERSION\%/mg, version);
    };
}]);

