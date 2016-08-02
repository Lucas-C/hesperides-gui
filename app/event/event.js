/**
 * Created by tidiane_sidibe on 02/03/2016.
 */

var eventModule = angular.module ('hesperides.event', []);

/**
 * Hesperides event data type
 *
 */
eventModule.factory('EventEntry', function (){
    var EventEntry = function (data){
        var me = this;

        this.type = data.type;
        this.data = data.data;
        this.timestamp = data.timestamp;
        this.user = data.user;
        this.isGlobal = false; // indicates if this event is about global properties

        // For internal use
        this.id   = 0;
        this.isSelected = false;
        this.isSelectable = true;

        // The simple type of the event
        var tab = data.type.split('.');
        this._type = tab[tab.length - 1];

        // Get the module name of the event if applicable
        if ( !_.isUndefined(this.data.path)){
            if (_.isEqual(this.data.path, '#')){
               if ( _.isEqual (this._type, 'PropertiesSavedEvent')){
                this.isGlobal = true;
               }
            }else{
                var pathsItems = this.data.path.split('#');
                if (!_.isUndefined(pathsItems [3])){
                    me.moduleName = pathsItems [3];
                }
                if (!_.isUndefined(pathsItems [4])){
                    me.moduleVersion = pathsItems [4];
                }
            }
        }
    };

    return EventEntry;
});

/**
 * Hesperides event http service
 */
eventModule.service("EventService", ['$hesperidesHttp', 'EventEntry', 'hesperidesGlobals', function ($http, EventEntry, hesperidesGlobals){
    return {
        /**
         * Get events from the back.
         * @param {String} stream : is the name of the stream, application or module
         * @param {Integer} page : is the page number to retrieve.
         */
        get : function (stream, page) {
            var url =  "rest/events/" + encodeURIComponent(stream) + "?page=" + encodeURIComponent(page) + "&size=" + encodeURIComponent(hesperidesGlobals.eventPaginationSize);
            return $http.get(url).then (function (response){
               return response.data.map (function(item){
                    var event = new EventEntry(item);
                    return event;
               });
            }, function (error){
                $.notify(error.data.message, "error");
                throw error;
            });
        }
    }
}]);

/**
 * This is the list of directives used to display each type of events
 * with custom content.
 */

//
// Platforms
//

/* This is for platform creation event */
eventModule.directive('platformCreated', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/platform/platform-created.html'
    };
});

/* This is for platform update event */
eventModule.directive('platformUpdated', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/platform/platform-updated.html'
    };
});

/* This is for platform deletion event */
eventModule.directive('platformDeleted', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/platform/platform-deleted.html'
    };
});

//
// Modules
//

/* This is for module creation event */
eventModule.directive('moduleCreated', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/module/module-created.html'
    };
});

/* This is for module update event */
eventModule.directive('moduleUpdated', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/module/module-updated.html'
    };
});

//
// Module Working Copy
//

/* This is for module working copy update event */
eventModule.directive('moduleWorkingCopyUpdated', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/module-working-copy/module-working-copy-updated.html'
    };
});

//
// Module Templates
//

/* This is for module template creation event */
eventModule.directive('moduleTemplateCreated', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/module-template/module-template-created.html'
    };
});

/* This is for module template  update event */
eventModule.directive('moduleTemplateUpdated', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/module-template/module-template-updated.html'
    };
});

/* This is for module template  deletion event */
eventModule.directive('moduleTemplateDeleted', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/module-template/module-template-deleted.html'
    };
});

//
// Properties
//

/* This is for properties saved event */
eventModule.directive('propertiesSaved', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/properties/properties-saved.html',
        controller : ['$scope', function ($scope) {
            var _event = $scope.event;

            // Get the scope of the modal
            var modalScope = $scope.$parent.$parent.$parent;

            /**
             * Selectes or unselects the current events for diff.
             */
            $scope.selectOrUnselect = function (){
                if (_event.isSelected){
                    modalScope.selectedEvents.push(_event);
                }else{
                    _.remove(modalScope.selectedEvents, function (item){
                        return item.id == _event.id;
                    });
                }
                modalScope.checkSelectStatus();
            };

            $scope.parseData = function (){
                $scope.moduleName = _event.moduleName;
                $scope.moduleVersion = _event.moduleVersion;
            }

            // Parsing data for this king of events
            $scope.parseData();
        }]
    };
});

//
// Templates (Techno)
//

/* This is for techno creation event */
eventModule.directive('templateCreated', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/template/template-created.html'
    };
});

/* This is for techno  update event */
eventModule.directive('templateUpdated', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/template/template-updated.html'
    };
});

/* This is for techno  deletion event */
eventModule.directive('templateDeleted', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/template/template-deleted.html'
    };
});

//
// Template Package (Techno)
//

/* This is for techno package deletion event */
eventModule.directive('templatePackageDeleted', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/template-package/template-package-deleted.html'
    };
});

/**
 * This for event timestamp formatting and displaying
 */
/* This is for techno package deletion event */
eventModule.directive('eventTime', function (){
    return {
        restrict : 'E',
        scope : {
            timestamp : '='
        },
        templateUrl : 'event/directives/event-time.html'
    };
});

/**
 * This is the events filtering by module name or version
 */
eventModule.filter ('evensFilter', function ($filter){
    return function(events, inputs){

        if ( _.isUndefined(inputs) || _.isEmpty(inputs)) {
            return events;
        }

        // Format the filters to construct the regex
        var _inputs = '.*' + inputs.split(' ').join('.*');

        // Create the regex
        try {
            var regex = new RegExp(_inputs, 'i');

            return _.filter(events, function (item){

                var inputs = item.moduleName ? item.moduleName + " " : "";
                inputs += item.moduleVersion ? item.moduleVersion : "";

                return regex.test(inputs) || regex.test(item.user) || regex.test($filter('date')(item.timestamp, 'd MMMM yyyy'));

            });
        } catch(e) {
            return events;
        }
    };
});

/**
 * This is the events filtering by user name or my events
 */
eventModule.filter ('myEventsFilter', function ($filter){
    return function(events, myevents){

        if ( myevents ) {
           // reuse a above filter
           return $filter('evensFilter')(events, hesperidesUser.username);
        }else{
            return events;
        }
    };
});