/**
 * Created by tidiane_sidibe on 18/01/2015.
 */

var fileModule = angular.module('hesperides.file', []);

fileModule.factory('FileEntry', ['$http', function ($http) {
    var FileEntry = function (data) {
            var me = this;

            this.location = data.location;
            this.url = data.url;
            this.rights = data.rights;
            this.name = "";                                 // the filename, to be displayed on the donwload link
            this.content = "En attente de chargement...";   // the content of the file
            this.on_error = false;                          // indicates if there where an error or not !

            // methods
            this.getContent = function () {
                return $http.get(me.url).then(function (response) {
                    return response;
                },function (error){
                    return error;
                });
            };
    };

    return FileEntry;
}]);

fileModule.factory('FileService', ['$http', 'Application', 'Platform', 'Properties', 'InstanceModel', 'FileEntry', function ($http, Application, Platform, Properties, InstanceModel, FileEntry) {
    // Convert file right to string
    var files_rights_to_string = function(filesRights) {
        var clearRight = function(right) {
            var r = "";

            if (_.isString(right)) {
                var a = _.filter(_.toArray(right), function (c) {
                    return c != ' ' & c != '-'
                });

                for (var i = 0; i < a.length; i++) {
                    r += a[i];
                }
            } else {
                if (right.read) {
                    r += 'r';
                }
                if (right.write) {
                    r += 'w';
                }
                if (right.execute) {
                    r += 'x';
                }

            }

            return r;
        };

        var newRights;

        if (filesRights) {
            var user = clearRight(filesRights.user);
            var group = clearRight(filesRights.group);

            newRights = 'user: ' + user + ' group:' + group;
        } else {
            newRights = 'Aucun droit positionné';
        }

        return newRights;
    };

    // Gets file name
    var get_file_name = function(location) {
        var tabs = location.split("/");
        return tabs[tabs.length - 1];
    };

    return {

        get_files_entries: function (application_name, platform_name, path, module_name, module_version, instance_name, is_working_copy) {
            var url = 'rest/files/applications/' + encodeURIComponent(application_name) + '/platforms/' + encodeURIComponent(platform_name) + '/' + encodeURIComponent(path) + '/' + encodeURIComponent(module_name) + '/' + encodeURIComponent(module_version) + '/instances/' + encodeURIComponent(instance_name) + '?isWorkingCopy=' + encodeURIComponent(is_working_copy);

            return $http.get(url).then(function (response) {
                return response.data.map(function (data) {
                    var entry = new FileEntry(data);
                    entry.rights = files_rights_to_string(data.rights);

                    entry.getContent().then(function(output) {

                        if ( output.status != 200) {
                            entry.on_error = true;
                            entry.content = output.data.message;
                        }else {
                            entry.content = output.data;
                        }
                    });

                    entry.name = get_file_name( data.location );
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
        },
        download_files : function (entries, name){
            // The JSZip Object
            var zip = new JSZip();

            // Adding files to zip
            entries.map(function (entry){
                if ( !entry.on_error ){
                   zip.file(entry.name, entry.content);
                }
            });

            // Generate and save the zip file
            var content = zip.generate({type:"blob"});
            saveAs(content, name + ".zip");

        },
        files_rights_to_string: files_rights_to_string
    };

}]);