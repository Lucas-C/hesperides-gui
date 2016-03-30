var nexusModule = angular.module('hesperides.nexus', ['xml']);

nexusModule.factory('NexusService', ['$hesperidesHttp', 'x2js', function ($http, x2js) {
    return {

        /**
         * Récupère la liste des versions des notes de livraison dans Nexus.
         *
         * @param application_name nom de l'application
         * @returns la liste des versions des ndl
         */
        getNdlVersions: function (application_name) {
            return $http.get('/nexus-api/service/local/lucene/search',
                {
                    "params": {
                        "g": "com.vsct." + application_name.toLowerCase(),
                        "a": "delivery-notes"
                    }
                })
                .then(function (response) {

                    if (!_.isUndefined(x2js.xml_str2json(response.data).searchNGResponse)){
                        var artifacts = x2js.xml_str2json(response.data).searchNGResponse.data.artifact;

                        if (artifacts.constructor !== Array) {
                            artifacts = [artifacts];
                        }

                        return _.pluck(artifacts, 'version');
                    }else{
                        return [];
                    }

                }, function (error) {
                    // l'erreur n'est pas bloquante
                    return [];
                });
        },

        /**
         * Récupère la note de livraison dans Nexus.
         *
         * @param application_name nom de l'application
         * @param application_version version de l'application
         * @returns la ndl au format json
         */
        getNdl: function (application_name, application_version) {
            return $http.get('/nexus-api/service/local/artifact/maven/content',
                {
                    "params": {
                        "r": "public",
                        "g": "com.vsct." + application_name.toLowerCase(),
                        "a": "delivery-notes",
                        "v": application_version,
                        "e": "json"
                    }
                })
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    $.notify("Impossible de récupérer la note de livraison : " + error.statusText, "error");
                    throw error;
                });
        }

    };
}]);