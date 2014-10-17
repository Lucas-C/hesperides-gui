'use strict';


// Declare app level module which depends on filters, and services
angular.module('hesperides', [
    'ngRoute',
    'hesperides.filters',
    'hesperides.directives',
    'hesperides.application',
    'hesperides.context',
    'hesperides.file',
    'hesperides.menu',
    'hesperides.platform',
    'hesperides.properties',
    'hesperides.techno',
    'hesperides.template',
    'ui.bootstrap',
    'xeditable',
    'ui.codemirror'
]).run(function (editableOptions) {
    editableOptions.theme = 'bs3';
})
    .factory('Page', function () {
        var title = 'Hesperides';
        return {
            title: function () {
                return title;
            },
            setTitle: function (newTitle) {
                title = "Hesperides - " + newTitle
            }
        }
    }).controller("TitleCtrl", ['$scope', 'Page', function ($scope, Page) {
        $scope.Page = Page;
    }]).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.
            when('/application/:application/:version', {
                templateUrl: 'js/application/application.html',
                controller: 'ApplicationCtrl'
            }).
            when('/properties/:application/:version', {
                templateUrl: 'partials/properties.html',
                controller: 'PropertiesCtrl'
            }).
            when('/contexts/:application/:version', {
                templateUrl: 'partials/context.html',
                controller: 'ContextCtrl'
            }).
            when('/technos', {
                templateUrl: 'partials/technos-search.html',
                controller: 'TechnosSearchCtrl'
            }).
            when('/technos/:name/:version', {
                templateUrl: 'js/techno/technos.html',
                controller: 'TechnosCtrl'
            }).
            when('/help/api', {
                templateUrl: 'partials/help_api.html'
            }).
            otherwise({
                templateUrl: 'partials/welcome_screen.html'
            });
    }]);

