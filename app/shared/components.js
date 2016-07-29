/**
 * Created by william_montaz on 21/10/2014.
 */

var components = angular.module('hesperides.components', []);

components.filter('filterPlatform', function () {
    return function (items, filter) {
        return _.filter(items, function(item) {
            if(_.isUndefined(filter) || _.isEmpty(filter)) {
                return item;
            } else {
                var regex_name = new RegExp(filter, 'i');
                return regex_name.test(item.name) || regex_name.test(item.application_version) ? item : undefined;
            }
        });
    };
});

components.directive('listOfItems', ['$parse', 'PlatformColorService', function ($parse, PlatformColorService) {

    return {
        restrict: 'E',
        scope: {
            items: '=',
            selectedItem: '=',
            selectable: '=',
            editable: '=',
            filter: '='
        },
        templateUrl: 'shared/list-of-items.html',
        link: function (scope, element, attrs) {

            scope.typeahead = attrs.typeaheadexpression;
            if (!_.isUndefined(scope.typeahead)) {
                scope.type = 'search';
            }
            scope.size = attrs.size;
            scope.input = {};
            scope.tooltip = attrs.tooltip;

            scope.cssClass = function(item) {
                var listClass = "";

                if (item === scope.selectedItem) {
                    listClass += " " + attrs.css;
                } else {
                    listClass += " md-clear";
                }

                if (scope.selectable == true) {
                    listClass += " md-raised";
                }

                return listClass;
            }

            scope.backgroundColor = function(item) {
                if(store.get('color_active')== false){
                    return PlatformColorService.removeColor();
                }else{
                    return PlatformColorService.calculateColor(item.name);
                }
            }

            scope.selfLabel = function (item) {
                return $parse(attrs.label)(scope.$parent, {$item: item});
            };

            scope.sortOn = function (item) {
                return $parse(attrs.sorton)(scope.$parent, {$item: item});
            };

            scope.selfEdit = function (item) {
                if(scope.selectable){
                    $parse(attrs.onedit)(scope.$parent, {$item: item});
                    scope.selectedItem = item;
                }
            };

            scope.selfDelete = function (item) {
                scope.selectedItem = undefined;
                $parse(attrs.ondelete)(scope.$parent, {$item: item});
            };

            scope.selfAdd = function (name) {
                if (name) {
                    $parse(attrs.createfunction)(scope.$parent, {$name: name});
                    scope.resetAndHideInput();
                }
            };

            scope.resetAndHideInput = function () {
                scope.show_input = false;
                scope.input.inputText = '';
            }

            scope.showInput = function () {
                scope.show_input = true;
                window.setTimeout(function () {
                    $('#nameInput').focus();
                }, 80);
            }

        }
    };

}]);

components.directive('listOfLinks', ['$parse', 'PlatformColorService', '$window', function ($parse, PlatformColorService, $window) {

    return {
        restrict: 'E',
        scope: {
            items: '=',
            selectedItem: '=',
            filter: '='
        },
        templateUrl: 'shared/list-of-links.html',
        link: function (scope, element, attrs) {

            scope.typeahead = attrs.typeaheadexpression;
            if (!_.isUndefined(scope.typeahead)) {
                scope.type = 'search';
            }
            scope.size = attrs.size;
            scope.input = {};
            scope.tooltip = attrs.tooltip;

            scope.cssClass = function(item) {
                var listClass = "";

                if (item === scope.selectedItem) {
                    listClass += " " + attrs.css;
                } else {
                    listClass += " md-clear";
                }

                if (scope.selectable == true) {
                    listClass += " md-raised";
                }

                return listClass;
            }

            scope.backgroundColor = function(item) {
                return PlatformColorService.calculateColor(item.name);
            }

            scope.selfLabel = function (item) {
                return $parse(attrs.label)(scope.$parent, {$item: item});
            };

            scope.sortOn = function (item) {
                return $parse(attrs.sorton)(scope.$parent, {$item: item});
            };

            scope.openLink = function (item) {
                $window.open('/#' + $parse(attrs.href)(scope.$parent, {$item: item}), '_blank');
            }
        }
    };
}]);
