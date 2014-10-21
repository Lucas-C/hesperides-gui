/**
 * Created by william_montaz on 21/10/2014.
 */

var components = angular.module('hesperides.components', []);

components.directive('listOfItems', ['$parse', function ($parse) {

    return {
        restrict: 'E',
        scope: {
            title: '=',
            items: '='
        },
        templateUrl: 'shared/list-of-items.html',
        link: function (scope, element, attrs) {

            scope.typeahead = attrs.typeaheadExpression;
            if(!_.isUndefined(scope.typeahead)){
                scope.type = 'search';
            }
            scope.size = attrs.size;

            scope.focus_name_input = function() {
                window.setTimeout(function(){
                    $('#nameInput').focus();
                },80);
            };

            scope.selfLabel = function(item){
                return $parse(attrs.label)(scope.$parent, {$item: item});
            };

            scope.selfEdit = function(item){
                $parse(attrs.onedit)(scope.$parent, {$item: item});
                scope.selected = item;
            };

            scope.selfDelete = function(item){
                $parse(attrs.ondelete)(scope.$parent, {$item: item});
            };

            scope.selfAdd = function(name){
                $parse(attrs.onadd)(scope.$parent, {$name: name});
                scope.selected = item;
            }

            scope.selfAddSearched = function(item){
                $parse(attrs.onadd)(scope, {$item: item});
            }

        }
    };

}]);
