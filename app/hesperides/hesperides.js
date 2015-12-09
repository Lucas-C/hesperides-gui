
if ( typeof String.prototype.startsWith != 'function' ) {
    String.prototype.startsWith = function( str ) {
        return str.length > 0 && this.substring( 0, str.length ) === str;
    }
};

var hesperidesModule = angular.module('hesperides', [
    'ngRoute',
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
    'vs-repeat',
    'scDateTime'
]).value('scDateTimeConfig', {
    defaultTheme: 'sc-date-time/hesperides.tpl',
    autosave: false,
    defaultMode: 'date',
    defaultDate: undefined, //should be date object!!
    displayMode: undefined,
    defaultOrientation: false,
    displayTwentyfour: true,
    compact: true,
    autosave:true
});

hesperidesModule.run(function (editableOptions, editableThemes, $rootScope) {
    editableOptions.theme = 'default';

    // overwrite submit button template
    editableThemes['default'].submitTpl = '<md-button class="md-raised md-primary" ng-click="$form.$submit()"><i class="fa fa-check"></i></md-button>';
    editableThemes['default'].cancelTpl = '<md-button class="md-raised md-warn" ng-click="$form.$cancel()"><i class="fa fa-times"></i></md-button>';

    //Init bootstrap ripples
    /*$(document).ready(function () {
        $.material.init();
    });*/
    //Prevent anoying behavior of bootstrap with dropdowns
    $(document).unbind('keydown.bs.dropdown.data-api');

    /**
     * Hack to calculate correctly margin of calendar.
     *
     * @param calendar calendar var in scope of calendar
     * @param cssClass css class of fisrt day
     * @returns {string}
     */
    $rootScope.offsetMargin = function(calendar, cssClass) {
        var obj = $('.' + cssClass);
        var selectedObj;

        for (var index = 0; index < obj.length; index++) {
            selectedObj = obj[index];

            if (selectedObj.getAttribute("aria-label") === "1") {
                break;
            }
        }

        var calendarOffsetMagin;

        if (selectedObj.clientWidth) {
            calendarOffsetMagin = (new Date(calendar._year, calendar._month).getDay() * selectedObj.clientWidth);
        } else {
            calendarOffsetMagin = 0;
        }

        return calendarOffsetMagin + 'px';
    };
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

hesperidesModule.config(['$routeProvider', '$mdThemingProvider', '$ariaProvider', function ($routeProvider, $mdThemingProvider, $ariaProvider) {
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

hesperidesModule.config(function($mdIconProvider) {
    $mdIconProvider.fontSet('fa', 'fontawesome');
});