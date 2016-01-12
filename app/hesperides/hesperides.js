
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
}).value('scDateTimeI18n', {
    weekdays: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
    calendar: 'Calendrier'
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
        template: '<div class="popover">' +
                    '        <md-button ng-click="open_add_instance_dialog(module)"' +
                    '        aria-label="Ajouter une instance"' +
                    '        class="md-xs">' +
                    '            <span class="fa fa-plus"></span>' +
                    '            <md-tooltip>Ajouter une instance</md-tooltip>' +
                    '        </md-button>' +
                    '    <md-button class="md-xs" aria-label="Editer les properties"' +
                    '    ng-click="edit_properties(platform, module);movePropertiesDivHolderToCursorPosition($event);"><span' +
                    '    class="fa fa-list"></span>' +
                    '        <md-tooltip>Editer les properties</md-tooltip>' +
                    '    </md-button>' +
                    '        <md-button class="md-xs"' +
                    '        aria-label="Comparer les properties"' +
                    '        ng-click="diff_properties(module)"><span' +
                    '        class="fa fa-exchange"></span>' +
                    '            <md-tooltip>Comparer les properties</md-tooltip>' +
                    '        </md-button>' +
                    '        <md-button ng-really-message="Supprimer le module {{module.title}} et toutes ses instances ?"' +
                    '        aria-label="Supprimer le module"' +
                    '        ng-really-click="delete_module(module, box)"' +
                    '        class="md-xs md-warn">' +
                    '            <span class="fa fa-trash"></span>' +
                    '            <md-tooltip>Supprimer le module</md-tooltip>' +
                    '        </md-button>' +
                    '</div>',
        link: function (scope, element) {
            var parent = element.parent();
            var popover = element.children();

            // Display popup
            parent.on('mouseenter', function() {
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
            });

            // Hide popup
            popover.on('mouseleave', function() {
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

hesperidesModule.config(function($mdIconProvider) {
    $mdIconProvider.fontSet('fa', 'fontawesome');
});