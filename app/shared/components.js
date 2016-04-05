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

components.directive('listOfItems', ['$parse', function ($parse) {

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

            /* fonction utilitaire pour générer un code couleur en fonction de la string passée en paramètre
             * utilisé pour la couleur des plateformes sur l'écran de valorisation
             */

            function pastel_colour(input_str) {

                //TODO: adjust base colour values below based on theme
                var baseRed = 220;
                var baseGreen = 220;
                var baseBlue = 220;

                //lazy seeded random hack to get values from 0 - 256
                //for seed just take bitwise XOR of first two chars
                var seed = input_str.charCodeAt(0) ^ input_str.charCodeAt(1) ^ input_str.charCodeAt(2);
                var rand_1 = Math.abs((Math.sin(seed++) * 10000)) % 256;
                var rand_2 = Math.abs((Math.sin(seed++) * 10000)) % 256;
                var rand_3 = Math.abs((Math.sin(seed++) * 10000)) % 256;

                //build colour
                var red = Math.round((rand_1 + baseRed) / 2);
                var green = Math.round((rand_2 + baseGreen) / 2);
                var blue = Math.round((rand_3 + baseBlue) / 2);

                return { red: red, green: green, blue: blue };
            }

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
                var rgb_pastel = pastel_colour(item.name);
                var bgColor = "rgb("+rgb_pastel.red+", "+rgb_pastel.green+", "+rgb_pastel.blue+")";
                return bgColor;
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
