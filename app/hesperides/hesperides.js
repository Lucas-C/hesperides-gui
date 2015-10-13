
if ( typeof String.prototype.startsWith != 'function' ) {
    String.prototype.startsWith = function( str ) {
        return str.length > 0 && this.substring( 0, str.length ) === str;
    }
};

var hesperidesModule = angular.module('hesperides', [
    'ngRoute',
    'ui.bootstrap',
    'hesperides.module',
    'hesperides.menu',
    'hesperides.properties',
    'hesperides.techno',
    'hesperides.template',
    'hesperides.components',
    'ngMaterial',
    'ngAnimate',
    'xeditable',
    'ui.codemirror',
    'mgo-angular-wizard',
    'ui.bootstrap.datetimepicker',
    'vs-repeat'
]);

hesperidesModule.run(function (editableOptions) {
    editableOptions.theme = 'bs3';
    //Init bootstrap ripples
    $(document).ready(function () {
        $.material.init();
    });
    //Prevent anoying behavior of bootstrap with dropdowns
    $(document).unbind('keydown.bs.dropdown.data-api');
});

hesperidesModule.factory('Page', function () {
    var title = 'Hesperides - Release PHOBOS';
    return {
        title: function () {
            return title;
        },
        setTitle: function (newTitle) {
            title = "Hesperides - Release PHOBOS - " + newTitle
        }
    }
});

hesperidesModule.controller("TitleCtrl", ['$scope', 'Page', function ($scope, Page) {
    $scope.Page = Page;
}]);

hesperidesModule.config(['$routeProvider', '$tooltipProvider', '$mdThemingProvider', '$ariaProvider', function ($routeProvider, $tooltipProvider, $mdThemingProvider, $ariaProvider) {
    $routeProvider.
        when('/module/:name/:version', {
            templateUrl: 'module/module.html',
            controller: 'ModuleCtrl'
        }).
        when('/properties/:application', {
            templateUrl: 'properties/properties.html',
            controller: 'PropertiesCtrl'
        }).
        when('/diff', {
            templateUrl: 'properties/diff.html',
            controller: 'DiffCtrl'
        }).
        when('/techno/:name/:version', {
            templateUrl: 'techno/techno.html',
            controller: 'TechnoCtrl'
        }).
        when('/help/swagger', {
            templateUrl: 'swagger/swagger.html'
        }).
        otherwise({
            templateUrl: 'welcome_screen.html'
        });
    //Setup tooltip delay
    $tooltipProvider.options({
        popupDelay: 800
    });

    //Material design theming
    $mdThemingProvider.theme('default')
        .primaryPalette('teal')
        .accentPalette('orange');

    //Deactivate Aria
    $ariaProvider.config({
        ariaHidden: false,
        ariaLabel: false,
        ariaChecked: false,
        ariaDisabled: false,
        ariaRequired: false,
        ariaInvalid: false,
        ariaMultiline: false,
        ariaValue: false,
        tabindex: false,
        bindKeypress: false
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

hesperidesModule.directive('konami', function() {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
            var keys = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
            var i = 0;
            $(document).keydown(function(e) {
                if(e.keyCode === keys[i++]) {
                    if(i === keys.length) {
                        $(document).unbind('keydown', arguments.callee);
                        //Konami code is active, do some fun stuff here
                        element.append('<img src="img/konami_egg.jpg" width="100%"></img>');
                    }
                } else {
                    i = 0;
                }
            });
        }
    }
});

