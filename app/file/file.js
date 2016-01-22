/**
 * Created by tidiane_sidibe on 18/01/2015.
 */

var fileModule = angular.module('hesperides.file', []);

fileModule.factory('FileEntry', ['$http', function ($http) {

    var clearRight = function(right) {
        var a = _.filter(_.toArray(right), function (c) {
            return c != ' ' & c != '-'
        });

        var r = "";

        for (var i = 0; i < a.length; i++) {
            r += a[i];
        }

        return r;
    }

    var FileEntry = function (data) {
            var me = this;

            var newRights;

            if (data.rights) {
                var user = clearRight(data.rights.user);
                var group = clearRight(data.rights.user);

                newRights = 'user: ' + user + ' group:' + group;
            } else {
                newRights = 'Rien à afficher';
            }

            this.location = data.location;
            this.url = data.url;
            this.rights = newRights;
            this.content = "En attente de chargement...";

            // methods
            this.getContent = function () {
                return $http.get(me.url).then(function (response) {
                    return response.data;
                });
            };
    };

    return FileEntry;
}]);

fileModule.factory('FileService', ['$http', 'Application', 'Platform', 'Properties', 'InstanceModel', 'FileEntry', function ($http, Application, Platform, Properties, InstanceModel, FileEntry) {

    return {

        get_files_entries: function (application_name, platform_name, path, module_name, module_version, instance_name, is_working_copy) {
            var url = 'rest/files/applications/' + encodeURIComponent(application_name) + '/platforms/' + encodeURIComponent(platform_name) + '/' + encodeURIComponent(path) + '/' + encodeURIComponent(module_name) + '/' + encodeURIComponent(module_version) + '/instances/' + encodeURIComponent(instance_name) + '?isWorkingCopy=' + encodeURIComponent(is_working_copy);

            return $http.get(url).then(function (response) {
                return response.data.map(function (data) {
                    var entry = new FileEntry(data);

                    entry.getContent().then(function(data) {
                        entry.content = data;
                    });

                    return entry;
                }, function (error) {
                    if (error.status != 404) {
                        $.notify(error.data.message, "error");
                        throw error;
                    } else {
                        return [];
                    }
                });
            });
        }
    };

}]);