'use strict';

var hesperidesServices = angular.module('Hesperides.services', ['ngResource']).
    value('version', '0.1');

hesperidesServices.factory('Instance', ['$resource', function ($resource) {

    return $resource('http://localhost:8080/rest/instances/:id', {id: '@id'}, {
        all: {method: 'GET', params: {id: ''}, isArray: true},
        put: {method: 'PUT'}
    });

}]);


hesperidesServices.factory('Search', ['$http', 'Instance', function ($http, Instance) {

    return {
        instances: function (application, component) {
            return $http.get('http://localhost:8080/rest/search?application=' + application + '&platform=' + component).then(function (response) {
                var instances = [];
                for (var i = 0; i < response.data.length; i++) {
                    var instance = new Instance(response.data[i]);
                    instances.push(instance);
                }
                return instances;
            });
        },
        fulltext: function (keywords) {
            return $http.get('http://localhost:8080/rest/search/fulltext/' + keywords).then(function (response) {
                return response.data;
            });
        },
        fulltextHostname: function (hostname) {
            return $http.get('http://localhost:8080/rest/search/fulltext/hostname/' + hostname).then(function (response) {
                return response.data;
            });
        }
    };

}]);

hesperidesServices.factory('ENC', ['$http', '$resource', function ($http, $resource) {
    return {
        get: function (hostname) {
            return $http.get('/rest/enc/' + hostname).then(function (enc) {
                return enc;
            })
        },
        save: function (hostname, enc) {
            return $http({method: 'POST', url: '/rest/enc/' + hostname, data: enc});
        }
    }

}]);
