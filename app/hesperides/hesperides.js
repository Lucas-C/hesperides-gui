
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
    'hesperides.user',
    'ngMaterial',
    'ngAnimate',
    'xeditable',
    'ui.codemirror',
    'mgo-angular-wizard',
    'vs-repeat',
    'scDateTime',
    'angularjs-datetime-picker',
    'pascalprecht.translate'
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
}).value('scDateTimeI18n', {
    weekdays: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
    calendar: 'Calendrier'
}).value('hesperidesGlobals', {
    versionName: 'PHOBOS',
    eventPaginationSize: 25
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

        if (selectedObj && selectedObj.clientWidth) {
            calendarOffsetMagin = (new Date(calendar._year, calendar._month).getDay() * selectedObj.clientWidth);
        } else {
            calendarOffsetMagin = 0;
        }

        return calendarOffsetMagin + 'px';
    };
});

hesperidesModule.factory('Page', ['hesperidesGlobals', function (hesperidesGlobals) {
    var base  = 'Hesperides'
    var title = base;
    return {
        title: function () {
            return title;
        },
        setTitle: function (newTitle) {
            title = base + " > " + newTitle
        }
    }
}]);

var hesperidesUser = undefined;
hesperidesModule.controller("TitleCtrl", ['$scope', 'Page', 'UserService', function ($scope, Page, UserService) {
    $scope.Page = Page;

    // authenticate the user
    $scope.authenticate = function (){
        UserService.authenticate().then(function (user){
           hesperidesUser = user;
        });
    }
}]);

hesperidesModule.config(['$routeProvider', '$mdThemingProvider', '$ariaProvider', '$mdIconProvider', '$translateProvider', function ($routeProvider, $mdThemingProvider, $ariaProvider, $mdIconProvider, $translateProvider) {
    $mdIconProvider.fontSet('fa', 'fontawesome');

    var configureTranslation = function(){
        $translateProvider.useStaticFilesLoader({
            prefix: '/i18n/label_',
            suffix: '.json'
        });
        $translateProvider.fallbackLanguage('fr');
        $translateProvider.determinePreferredLanguage(function(){
            if (window.navigator.language == 'fr') {
                return 'fr'
            }
            return 'en';
        });
    };
    
    $routeProvider.
        when('/module/:name/:version', {
            templateUrl: 'module/module.html',
            controller: 'ModuleCtrl'
        }).
        when('/properties/:application', {
            templateUrl: 'properties/properties.html',
            controller: 'PropertiesCtrl',
            reloadOnSearch: false
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

    
    configureTranslation();
}]);

hesperidesModule.directive('ngReallyClick', ['$mdDialog', '$timeout', function ($mdDialog, $timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.bind('click', function () {
                if (attrs.ngReallyMessage && confirm(attrs.ngReallyMessage)) {
                    scope.$apply(attrs.ngReallyClick);
                }

                /* Why some time working, sometime not working ?
                if (attrs.ngReallyMessage) {
                    var confirm = $mdDialog.confirm()
                        .title('Question ?')
                        .textContent(attrs.ngReallyMessage)
                        .ariaLabel(attrs.ngReallyMessage)
                        //.targetEvent(ev)
                        .theme('confirm-hesperides-dialog')
                        .ok('Oui')
                        .cancel('Non');

                    $mdDialog.show(confirm).then(function() {
                        // To prevent '$digest already in progress' message
                        // see https://stackoverflow.com/questions/12729122/angularjs-prevent-error-digest-already-in-progress-when-calling-scope-apply
                        $timeout(function() {
                            scope.$apply(attrs.ngReallyClick);
                        });
                    }, function() {
                        //$scope.status = 'You decided to keep your debt.';
                    });
                }*/
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

/**
 * Popover button.
 *
 * Partial code from Material Design.
 */
hesperidesModule.factory('$propertyToolButtonService', [function(){
    return { currentPopup: null };
}]);

hesperidesModule.directive('propertyToolButton', function ($mdUtil, $propertyToolButtonService) {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: 'properties/property-tool-button.html'
    };
});

hesperidesModule.directive('propertyToolButtonOver', function ($mdUtil, $propertyToolButtonService,$timeout) {
    return {
        restrict: 'E',
        scope: true,
        template: '<div class="popover" ><property-tool-button /></div>',
        link: function (scope, element) {
            var parent = element.parent();
            var popover = element.children();

            // gestion d'un timer pour afficher la popup après 1 secondes (pour faciliter navigation mode arbre)
            var timer;

            // Display popup
            parent.on('mouseenter', function() {

                timer = $timeout(
                    function() {
                        var tooltipParent = angular.element(document.body);
                        var tipRect = $mdUtil.offsetRect(popover, tooltipParent);
                        var parentRect = $mdUtil.offsetRect(parent, tooltipParent);

                        var newPosition = {
                            left: parentRect.left + parentRect.width / 2 - tipRect.width / 2,
                            top: parentRect.top - tipRect.height
                        };

                        popover.css({
                            left: newPosition.left + 'px',
                            top: newPosition.top + 'px'
                        });

                        if ($propertyToolButtonService.currentPopup)  {
                            $propertyToolButtonService.currentPopup.removeClass('popover-hover');
                        }

                        element.children().addClass('popover-hover');
                        $propertyToolButtonService.currentPopup = element.children();
                    },
                    1000
                );
            });

            // Hide popup
            parent.on('mouseleave', function() {
                $timeout.cancel(timer);
                element.children().removeClass('popover-hover');
                $propertyToolButtonService.currentPopup = null;
            });
        }
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

hesperidesModule.factory('$hesperidesHttp', ['$http', '$q', function($http, $q){
    var returnResponseAndHideLoadingSucces = function(response) {
        $('#loading').hide();
        return $q.resolve(response);
    };

    var returnResponseAndHideLoadingError = function(response) {
        $('#loading').hide();
        return $q.reject(response);
    };

    return {
        get: function(url, config) {
            $('#loading').show();

            return $http.get(url, config).then(returnResponseAndHideLoadingSucces, returnResponseAndHideLoadingError);
        },
        head: function(url, config) {
            $('#loading').show();

            return $http.head(url, config).then(returnResponseAndHideLoadingSucces, returnResponseAndHideLoadingError);
        },
        post: function(url, data, config) {
            $('#loading').show();

            return $http.post(url, data, config).then(returnResponseAndHideLoadingSucces, returnResponseAndHideLoadingError);
        },
        put: function(url, data, config) {
            $('#loading').show();

            return $http.put(url, data, config).then(returnResponseAndHideLoadingSucces, returnResponseAndHideLoadingError);
        },
        delete: function(url, config) {
            $('#loading').show();

            return $http.delete(url, config).then(returnResponseAndHideLoadingSucces, returnResponseAndHideLoadingError);
        },
        jsonp: function(url, config) {
            $('#loading').show();

            return $http.jsonp(url, config).then(returnResponseAndHideLoadingSucces, returnResponseAndHideLoadingError);
        },
        patch: function(url, data, config) {
            $('#loading').show();

            return $http.patch(url, data, config).then(returnResponseAndHideLoadingSucces, returnResponseAndHideLoadingError);
        }
    };
}]);

/**
 * This is used to auto scroll to the bottom of the
 * page when edit button is clicked !
 * Added by Tidane SIDIBE on 04/04/2016
 *
 *
hesperidesModule.directive('hesperidesScroll', function ($timeout){
    return {
        restrict: 'A',
        controller: ['$scope', '$location', '$anchorScroll', function ($scope, $location, $anchorScroll){
            $scope.scroll = function (){
                $location.hash('properties-list');
                $timeout(function (){
                    $anchorScroll();
                }, 500);
            }
        }],
        link: function (scope, element, attr){
            element.on('click', function (){
                scope.scroll();
            })
        }
    }
});
**/
hesperidesModule.directive('hesperidesCompareDateTime', function (){
    return {
        scope: {
            ngModel: '=',
            isValid: '='
        },

        templateUrl: 'hesperides/hesperides-compare-date-time.html',
        link:function (scope, element, attrs, ctrl){
            //-- date for start
            var date = new Date();
            var year = date.getFullYear();
            var month = date.getMonth()+1;
            var day = date.getDate();

            if(day < 10){
                day = '0' + day;
            }

            if(month < 10){
                month = '0' + month;
            }

            //all in scope !
            scope.year = year;
            scope.month = month;
            scope.day = day;
            scope.holder = date;

            // Private function for date validation
            var validate = function (){
                scope.isValid = Date.parse(scope.ngModel) < (new Date()).getTime();
            };

            //Watch the model
            scope.$watch('ngModel', function (newVal, oldVal){
                validate();
            });
        }
    }
});

/**
 * A commom service for color calculation
 */
hesperidesModule.service ('PlatformColorService', function (){
    return {

            /**
             * Getting a color according to input.
             * @param {String} name : the input string
             */
            calculateColor: function (name){

                /**
                 * Private utility function that calculates
                 * a RGB color code according to the input string
                 */
                pastelColour = function(name) {

                    var baseRed = 220;
                    var baseGreen = 220;
                    var baseBlue = 220;

                    //lazy seeded random hack to get values from 0 - 256
                    //for seed just take bitwise XOR of first two chars
                    var seed = name.charCodeAt(0) ^ name.charCodeAt(1) ^ name.charCodeAt(2);
                    var rand_1 = Math.abs((Math.sin(seed++) * 10000)) % 256;
                    var rand_2 = Math.abs((Math.sin(seed++) * 10000)) % 256;
                    var rand_3 = Math.abs((Math.sin(seed++) * 10000)) % 256;

                    //build colour
                    var red = Math.round((rand_1 + baseRed) / 2);
                    var green = Math.round((rand_2 + baseGreen) / 2);
                    var blue = Math.round((rand_3 + baseBlue) / 2);

                    return { red: red, green: green, blue: blue };
                };

                // get the final color in rgb
                var rgb_pastel = pastelColour(name);
                var bgColor = "rgb("+rgb_pastel.red+", "+rgb_pastel.green+", "+rgb_pastel.blue+")";
                return bgColor;
            }
    };
});