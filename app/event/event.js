/**
 * Created by tidiane_sidibe on 02/03/2016.
 */

var eventModule = angular.module ('hesperides.event', []);

/**
 * Hesperides event data type
 *
 */
eventModule.factory('EventEntry', ['$filter', function ($filter){
    var EventEntry = function (data){
        var me = this;

        this.type = data.type;
        this.data = data.data;
        this.timestamp = data.timestamp;
        this.user = data.user;

        this.actionMessage = 'not yet processed';

        /**
         * This function will make the events humanly readable
         */
        this.humanize = function (){
            //humanize type
            var _type = undefined;

            /* About Plateforms*/
            if (me.type.endsWith('PlatformCreatedEvent')){
                _type = 'a créé la plateforme ';
            }else if (me.type.endsWith('PlatformUpdatedEvent')){
                _type = 'a modifié la plateforme ';
            }

            /* About Module */
            else if (me.type.endsWith('ModuleCreatedEvent')){
                _type = 'a créé le module ';
            }else if (me.type.endsWith('ModuleDeletedEvent')){
                _type = 'a supprimé le module ';
            }

            /* About Module Working Copy */
            else if (me.type.endsWith('ModuleWorkingCopyUpdatedEvent')){
                _type = 'a modifié une working copy du module ';
            }

            /* About Module Template*/
            else if (me.type.endsWith('ModuleTemplateCreatedEvent')){
                 _type = 'a créé le template du module ';
            }else if (me.type.endsWith('ModuleTemplateUpdatedEvent')){
                _type = 'a modifié le template du module ';
            }else if (me.type.endsWith('ModuleTemplateDeletedEvent')){
                _type = 'a supprimé le template du module ';
            }

            /* About Properties*/
            else if (me.type.endsWith('PropertiesSavedEvent')){
                _type = 'a modifié les properties ';
            }

            else {
                _type = 'Unknown';
            }

            me.actionMessage = _type;
        }
    };

    return EventEntry;
}]);

/**
 * Hesperides event http service
 */
eventModule.service("EventService", ['$http', 'EventEntry', function ($http, EventEntry){
    return {
        get : function (stream) {
            var url =  "rest/events/" + stream;
            return $http.get(url).then (function (response){
               return response.data.map (function(item){
                    var event = new EventEntry(item);
                    event.humanize();
                    return event;
               });
            }, function (error){
                $.notify(error.data.message, "error");
                throw error;
            });
        }
    }
}]);
