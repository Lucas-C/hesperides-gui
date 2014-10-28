/**
 * Created by william_montaz on 21/10/2014.
 */

var components = angular.module('hesperides.components', []);

components.directive('listOfItems', ['$parse', function ($parse) {

    return {
        restrict: 'E',
        scope: {
            items: '=',
            selectedItem: '=',
            selectable: '=',
            editable: '='
        },
        templateUrl: 'shared/list-of-items.html',
        link: function (scope, element, attrs) {

            scope.typeahead = attrs.typeaheadexpression;
            if (!_.isUndefined(scope.typeahead)) {
                scope.type = 'search';
            }
            scope.size = attrs.size;
            scope.input = {};

            scope.selfLabel = function (item) {
                return $parse(attrs.label)(scope.$parent, {$item: item});
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
                    var item = $parse(attrs.createfunction)(scope.$parent, {$name: name});
                    if (item) {
                        scope.selectedItem = item;
                        scope.resetAndHideInput();
                    }
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
