'use strict';


// Declare app level module which depends on filters, and services
angular.module('Hesperides', [
        'ngRoute',
        'Hesperides.controllers',
        'Hesperides.filters',
        'Hesperides.services',
        'Hesperides.directives',
		'ui.bootstrap',
		'xeditable',
		'ui.codemirror'
    ]).run(function(editableOptions){
		editableOptions.theme = 'bs3';
	})
	.factory('Page', function() {
		var title = 'Hesperides';
		return {
			title: function() { return title;},
			setTitle: function(newTitle) { title = "Hesperides - "+newTitle }
		}
	}).controller("TitleCtrl", ['$scope', 'Page', function($scope, Page) {
		$scope.Page = Page;
	}]).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.
            when('/application/:application/:version', {
                templateUrl: 'application.html',
                controller: 'ApplicationCtrl'
            }).
            when('/instances', {
                templateUrl: 'partials/instance-list.html',
                controller: 'InstancesCtrl'
            }).
            when('/search', {
                templateUrl: 'partials/search.html',
                controller: 'SearchCtrl'
            }).
            when('/enc/:hostname', {
                templateUrl: 'partials/enc.html',
                controller: 'ENCCtrl'
            }).
			when('/properties/:application/:version/:platform/:template_name', {
				templateUrl: 'partials/properties.html',
				controller: 'PropertiesCtrl'
			}).
			when('/templates/:application/:version/:template_name', {
				templateUrl: 'partials/template.html',
				controller: 'TemplateCtrl'
			}).
			when('/contexts/:application/:version/:component/:name', {
				templateUrl: 'partials/context.html',
				controller: 'ContextCtrl'
			}).
			when('/technos', {
				templateUrl: 'partials/technos-search.html',
				controller: 'TechnosSearchCtrl'
			}).
			when('/technos/:name/:version', {
				templateUrl: 'partials/technos.html',
				controller: 'TechnosCtrl'
			}).
            otherwise({
                redirectTo: '/search'
            });
    }]);

