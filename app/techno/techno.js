/**
 * Created by william_montaz on 17/10/2014.
 */
var technoModule = angular.module('hesperides.techno', ['hesperides.template', 'hesperides.properties', 'hesperides.model']);

technoModule.controller('TechnoCtrl',
    ['$scope', '$location', '$mdDialog', '$routeParams', 'Techno', 'Page', 'TechnoService', 'HesperidesTemplateModal', 'Template', 'TemplateEntry', 'FileService',
        function ($scope, $location, $mdDialog, $routeParams, Techno, Page, TechnoService, HesperidesTemplateModal, Template, TemplateEntry, FileService) {
    Page.setTitle("Technos");

    $scope.isWorkingCopy = $routeParams.type === "workingcopy";
    $scope.isRelease = !$scope.isWorkingCopy;
    $scope.techno = new Techno($routeParams.name, $routeParams.version, ($routeParams.type === "workingcopy") ? true : false);
    $scope.templateEntries = [];

    // Label for rights
    $scope.rights = [
        {label: '<default>', value: null},
        {label: 'O', value: true},
        {label: 'N', value: false}
    ];

    if ($scope.techno.is_working_copy) {
        TechnoService.get_all_templates_from_workingcopy($scope.techno.name, $scope.techno.version).then(function (templateEntries) {
            $scope.templateEntries = templateEntries;
        });
    } else {
        TechnoService.get_all_templates_from_release($scope.techno.name, $scope.techno.version).then(function (templateEntries) {
            $scope.templateEntries = templateEntries;
        });
    }

    $scope.refreshModel = function(){
        TechnoService.get_model($scope.techno.name, $scope.techno.version, $scope.techno.is_working_copy).then(function(model){
            $scope.model = model;
        });
    };

    $scope.refreshModel();

    $scope.add_template = function () {
        HesperidesTemplateModal.edit_template({
            template: new Template(),
            isReadOnly: false,
            onSave: $scope.save_template,
            add: true
        });
    };

    $scope.edit_template = function (name) {
        if ($scope.techno.is_working_copy) {
            TechnoService.get_template_from_workingcopy($scope.techno.name, $scope.techno.version, name).then(function (template) {
                HesperidesTemplateModal.edit_template({
                    template: template,
                    isReadOnly: false,
                    onSave: $scope.save_template,
                    add: false
                });
                $scope.refreshModel();
            });
        } else {
            TechnoService.get_template_from_release($scope.techno.name, $scope.techno.version, name).then(function (template) {
                HesperidesTemplateModal.edit_template({
                    template: template,
                    isReadOnly: true,
                    onSave: $scope.save_template,
                    add: false
                });
                $scope.refreshModel();
            });
        }
    };

    $scope.save_template = function(template){
        return TechnoService.save_template_in_workingcopy($scope.techno.name, $scope.techno.version, template).then(function(savedTemplate){
           //MAJ liste de templates
            var entry = _.find($scope.templateEntries, function (templateEntry) {
                return (templateEntry.name === savedTemplate.name);
            });
            if(entry) { //It was an update
                entry.name = savedTemplate.name;
                entry.location = savedTemplate.location;
                entry.filename = savedTemplate.filename;

                entry.rights = FileService.files_rights_to_string(savedTemplate.rights);
            } else {
                var new_entry = new TemplateEntry({
                    name: savedTemplate.name,
                    location: savedTemplate.location,
                    filename: savedTemplate.filename
                });
                $scope.templateEntries.push(new_entry);
            }
            $scope.refreshModel();
            return savedTemplate;
        });
    };

    $scope.delete_template = function (name) {
        TechnoService.delete_template_in_workingcopy($scope.techno.name, $scope.techno.version, name).then(function () {
            $scope.templateEntries = _.reject($scope.templateEntries, function (templateEntry) {
                return (templateEntry.name === name); //MAJ de la liste de templates
            });
            $scope.refreshModel();
        });
    };

    $scope.create_release = function(r_name, r_version) {
        TechnoService.create_release(r_name, r_version).then(function(){
            $location.path('/techno/' + r_name + '/' + r_version).search({});
        });
    }

    /**
     * Affiche la liste des propriétés associées à un module.
     */
    $scope.open_associated_properties_dialog = function(techno){
        var modalScope = $scope.$new(true);

        modalScope.$closeDialog = function() {
            $mdDialog.cancel();
        };

        modalScope.$save = function(release_version) {
            $scope.create_release(module, release_version);
            $mdDialog.cancel();
        };

        $mdDialog.show({
            templateUrl: 'techno/techno-modal.html',
            controller: 'TechnoCtrl',
            clickOutsideToClose:true,
            scope:modalScope
        });
    };

}]);

technoModule.controller('TechnoSearchCtrl', ['$scope', '$routeParams', 'TechnoService', 'Page', function ($scope, $routeParams, TechnoService, Page) {
    Page.setTitle("Technos");

    /* Load technos list */
    TechnoService.all().then(function (technos) {
        $scope.technos = technos;
    });

}]);

technoModule.factory('Techno', function () {

    var Techno = function (name, version, is_working_copy) {
        this.name = name;
        this.version = version;
        this.is_working_copy = is_working_copy;
        this.title = this.name + ", " + this.version + (this.is_working_copy ? " (working copy)" : "");


        this.to_rest_entity = function(){
            return {
                name: this.name,
                version: this.version,
                working_copy: this.is_working_copy
            };
        };

    };

    return Techno;
});

technoModule.factory('TechnoService',
    ['$hesperidesHttp', '$q', 'Techno', 'Template', 'TemplateEntry', 'Properties', 'FileService',
     function ($http, $q, Techno, Template, TemplateEntry, Properties, FileService) {

    return {
        get_model: function (name, version, isWorkingCopy){
            return $http.get('rest/templates/packages/' + encodeURIComponent(name) + '/' + encodeURIComponent(version) + '/' + (isWorkingCopy ? "workingcopy" : "release") + '/model').then(function(response){
                return new Properties(response.data);
            }, function () {
                return new Properties({});
            });
        },
        get_template_from_workingcopy: function (wc_name, wc_version, template_name) {
            return $http.get('rest/templates/packages/' + encodeURIComponent(wc_name) + '/' + encodeURIComponent(wc_version) + '/workingcopy/templates/' + encodeURIComponent(template_name)).then(function (response) {
                return new Template(response.data);
            }, function (error) {
                $.notify(error.data.message, "error");
                throw error;
            });
        },
        get_template_from_release: function (wc_name, wc_version, template_name) {
            return $http.get('rest/templates/packages/' + encodeURIComponent(wc_name) + '/' + encodeURIComponent(wc_version) + '/release/templates/' + encodeURIComponent(template_name)).then(function (response) {
                return new Template(response.data);
            }, function (error) {
                $.notify(error.data.message, "error");
                throw error;
            });
        },
        get_all_templates_from_workingcopy: function (wc_name, wc_version) {
            var baseUrl = 'rest/templates/packages/' + encodeURIComponent(wc_name) + '/' + encodeURIComponent(wc_version) + '/workingcopy/templates';

            return $http.get(baseUrl).then(function (response) {
                return response.data.map(function (data) {
                    var entry = new TemplateEntry(data);
                    var url = baseUrl + '/' + encodeURIComponent(entry.name);

                    entry.getRights(url).then (function (template){
                        entry.rights = FileService.files_rights_to_string(template.rights);
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
        },
        get_all_templates_from_release: function (r_name, r_version) {
            return $http.get('rest/templates/packages/' + encodeURIComponent(r_name) + '/' + encodeURIComponent(r_version) + '/release/templates').then(function (response) {
                return response.data.map(function (data) {
                    var entry = new TemplateEntry(data);
                    var url ='rest/templates/packages/' + encodeURIComponent(r_name) + '/' + encodeURIComponent(r_version) + '/release/templates/' + encodeURIComponent(entry.name);
                    entry.getRights(url).then (function (template){
                        entry.rights = FileService.files_rights_to_string(template.rights);
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
        },
        save_template_in_workingcopy: function (wc_name, wc_version, template) {
            template = template.toHesperidesEntity();
            if (template.version_id < 0) {
                return $http.post('rest/templates/packages/' + encodeURIComponent(wc_name) + '/' + encodeURIComponent(wc_version) + '/workingcopy/templates', template).then(function (response) {
                    $.notify("Le template a bien été crée", "success");
                    return new Template(response.data);
                }, function (error) {
                    if (error.status === 409) {
                        $.notify("Impossible de créer le template car il existe déjà un template avec ce nom", "error");
                    } else {
                        $.notify(error.data.message, "error");
                    }
                    throw error;
                });
            } else {
                return $http.put('rest/templates/packages/' + encodeURIComponent(wc_name) + '/' + encodeURIComponent(wc_version) + '/workingcopy/templates', template).then(function (response) {
                    $.notify("Le template a été mis à jour", "success");
                    return new Template(response.data);
                }, function (error) {
                    $.notify(error.data.message, "error");
                    throw error;
                });
            }
        },
        delete_template_in_workingcopy: function (wc_name, wc_version, template_name) {
            return $http.delete('rest/templates/packages/' + encodeURIComponent(wc_name) + '/' + encodeURIComponent(wc_version) + '/workingcopy/templates/' + encodeURIComponent(template_name)).then(function (response) {
                $.notify("Le template a bien été supprimé", "success");
                return response;
            }, function (error) {
                $.notify(error.data.message, "error");
                throw error;
            });
        },
        create_release: function (r_name, r_version) {
            return $http.post('rest/templates/packages/create_release?package_name=' + encodeURIComponent(r_name) + '&package_version=' + encodeURIComponent(r_version)).then(function (response) {
				if (response.status === 201) {
                    $.notify("La release " + r_name + ", " + r_version + " a bien été créée", "success");
                } else {
                    $.notify(response.data, "warning");
                }
            }, function (error) {
                $.notify(error.data.message, "error");
                throw error;
            });
        },
        create_workingcopy: function (wc_name, wc_version, from_name, from_version, is_from_workingcopy) {
            return $http.post('rest/templates/packages?from_package_name=' + encodeURIComponent(from_name) + '&from_package_version=' + encodeURIComponent(from_version) + '&from_is_working_copy=' + is_from_workingcopy, {name:encodeURIComponent(wc_name), version: encodeURIComponent(wc_version), working_copy:true}).then(function (response) {
                if (response.status === 201) {
                    $.notify("La working copy a bien été créée", "success");
                } else {
                    $.notify(response.data, "warning");
                }
            }, function (error) {
                $.notify(error.data.message, "error");
                throw error;
            });
        },
        with_name_like: function (name) {
            if (!_.isUndefined(name)){
                if(name.length > 2) { //prevent search with too few characters
                    return $http.post('rest/templates/packages/perform_search?terms=' + encodeURIComponent(name.replace(' ', '#').replace('-', '#'))).then(function (response) {
                        return _.map(response.data, function (techno) {
                            return new Techno(techno.name, techno.version, techno.working_copy);
                        });
                    });
                } else {
                    var deferred = $q.defer();
                    deferred.resolve([]);
                    return deferred.promise;
                }
            }
        }
    }

}]);