var nexusModule = angular.module('hesperides.nexus', []);

nexusModule.factory('NexusService', ['$http', function ($http) {
    return {

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