/**
 * Created by william_montaz on 17/10/2014.
 */
var applicationModule = angular.module('hesperides.module', []);


applicationModule.controller('ModuleCtrl', ['$scope', '$routeParams', '$location', 'TechnoService', 'ModuleService', 'HesperidesTemplateModal', 'Template', 'Page', function ($scope, $routeParams, $location, TechnoService, ModuleService, HesperidesTemplateModal, Template, Page) {

    Page.setTitle('Module');

    $scope.is_workingcopy = ($routeParams.type === "workingcopy");
    $scope.is_release = !$scope.is_workingcopy;

    $scope.refreshModel = function () {
        ModuleService.get_model($scope.module).then(function (model) {
            $scope.model = model;
        });
    };

    /* Try to find the corresponding module */
    ModuleService.get($routeParams.name, $routeParams.version, $scope.is_workingcopy).then(function (module) {
        $scope.module = module;
    }).then(function(){
        return ModuleService.get_all_templates($scope.module);
    }).then(function(templateEntries){
        $scope.templateEntries = templateEntries;
    }).then(function(){
        $scope.refreshModel();
    });

    $scope.add_template = function () {
        HesperidesTemplateModal.edit_template({
            template: new Template(),
            isReadOnly: false,
            onSave: $scope.save_template
        });
    };

    $scope.edit_template = function (name) {
        ModuleService.get_template($scope.module, name).then(function (template) {
            HesperidesTemplateModal.edit_template({
                template: template,
                isReadOnly: !$scope.module.is_working_copy,
                onSave: $scope.save_template
            });
            $scope.refreshModel();
        });
    };

    $scope.save_template = function (template) {
        return ModuleService.save_template($scope.module, template).then(function (savedTemplate) {
            //MAJ liste de templates
            var entry = _.find($scope.templateEntries, function (templateEntry) {
                return (templateEntry.name === savedTemplate.name);
            });
            if (entry) { //It was an update
                entry.name = savedTemplate.name;
                entry.location = savedTemplate.location;
                entry.filename = savedTemplate.filename;
            } else {
                var new_entry = {
                    name: savedTemplate.name,
                    location: savedTemplate.location,
                    filename: savedTemplate.filename
                };
                $scope.templateEntries.push(new_entry);
            }
            $scope.refreshModel();
            return savedTemplate;
        });
    };

    $scope.delete_template = function (name) {
        ModuleService.delete_template($scope.module, name).then(function () {
            $scope.templateEntries = _.reject($scope.templateEntries, function (templateEntry) {
                return (templateEntry.name === name); //MAJ de la liste de templates
            });
            $scope.refreshModel();
        });
    };

    /* This function is used to save the module */
    $scope.save = function (module) {
        return ModuleService.save(module).then(function (module) {
            $scope.module = module;
        });
    };

    /* This function is used to find technos not already chosen */
    $scope.search_technos = function (name) {
        return TechnoService.with_name_like(name).then(function (technos) {
            return _.filter(technos, function (techno) {
                return !$scope.module.has_techno(techno);
            });
        });
    };

    $scope.add_techno = function (techno) {
        $scope.module.add_techno(techno);
        $scope.save($scope.module).then(function(){
            $scope.refreshModel();
        });
    };

    $scope.delete_techno = function (techno) {
        $scope.module.remove_techno(techno);
        $scope.save($scope.module).then(function(){
            $scope.refreshModel();
        });
    };

    $scope.create_release = function(module){
        ModuleService.create_release(module).then(function(){
            $location.path('/module/' + module.name + '/' + module.version).search({});
        });
    };

}]);

applicationModule.factory('Module', ['Techno', function (Techno) {

    var Module = function (data) {

        var me = this;

        angular.extend(this, {
            name: "",
            version: "",
            is_working_copy: true,
            technos: [],
            versionID: -1
        }, data);

        if (!_.isUndefined(data.working_copy)) { //When it is created through a rest entity
            this.is_working_copy = data.working_copy;
        }

        /* Object casting when instance is created */
        this.technos = _.map(this.technos, function (data) {
            return new Techno(data.name, data.version, data.working_copy);
        });

        this.add_techno = function (techno) {
            if (!_.some(this.technos, {'name': techno.name, 'version': techno.version, 'is_working_copy': techno.is_working_copy})) {
                this.technos.push(techno);
            }
            return techno;
        };

        this.remove_techno = function (techno) {
            _.remove(this.technos, function (existing) {
                return _.isEqual(existing, techno)
            });
        };

        this.has_techno = function (techno) {
            return _.some(this.technos, {'name': techno.name, 'version': techno.version, 'is_working_copy': techno.is_working_copy});
        };

        this.to_rest_entity = function () {
            return {
                name: this.name,
                version: this.version,
                working_copy: this.is_working_copy,
                versionID: this.versionID,
                technos: _.map(this.technos, function (techno) {
                    return techno.to_rest_entity();
                })
            };
        };

    };

    return Module;

}]);

applicationModule.factory('ModuleService', ['$http', 'Module', 'Template', 'TemplateEntry', 'Properties', function ($http, Module, Template, TemplateEntry, Properties) {

    return {
        get: function (name, version, is_working_copy) {
            return $http.get('rest/modules/' + encodeURIComponent(name) + '/' + encodeURIComponent(version) + "/" + (is_working_copy ? "workingcopy" : "release")).then(function (response) {
                return new Module(response.data);
            }, function (error) {
                $.notify(error.data, "error");
                throw error;
            });
        },
        save: function (module) {
            if (!module.is_working_copy) {
                $.notify("Operation impossible. Une release ne peut être creee qu'a partir d'une working copy et n'est pas modifiable", "error");
                throw module;
            } else {
                module = module.to_rest_entity();
                if (module.versionID < 0) {
                    return $http.post('rest/modules', module).then(function (response) {
                        $.notify("La workingcopy du module a bien ete creee", "success");
                        return new Module(response.data);
                    }, function (error) {
                        $.notify(error.data, "error");
                    });
                } else {
                    return $http.put('rest/modules', module).then(function (response) {
                        $.notify("La workingcopy du module a bien ete mise a jour", "success");
                        return new Module(response.data);
                    }, function (error) {
                        $.notify(error.data, "error");
                    });
                }
            }
        },
        get_model: function (module){
            var namespaces = "modules#"+module.name+"#"+module.version+"#"+ (module.is_working_copy ? "WORKINGCOPY":"RELEASE");
            _.forEach(module.technos, function(techno){
                namespaces += ",packages#"+techno.name+"#"+techno.version+"#"+ (techno.is_working_copy ? "WORKINGCOPY":"RELEASE");
            });
            return $http.get('rest/properties/model/'+encodeURIComponent(namespaces)).then(function(response){
                return new Properties(response.data);
            }, function (error) {
                return new Properties({});
            });
        },
        get_template: function (module, template_name) {
            return $http.get('rest/modules/' + encodeURIComponent(module.name) + '/' + encodeURIComponent(module.version) + '/'+ (module.is_working_copy ? "workingcopy" : "release") +'/templates/' + encodeURIComponent(template_name)).then(function (response) {
                return new Template(response.data);
            }, function (error) {
                $.notify(error.data, "error");
                throw error;
            });
        },
        get_all_templates: function (module) {
            return $http.get('rest/modules/' + encodeURIComponent(module.name) + '/' + encodeURIComponent(module.version) + '/'+ (module.is_working_copy ? "workingcopy" : "release") +'/templates').then(function (response) {
                return response.data.map(function (data) {
                    return new TemplateEntry(data);
                }, function (error) {
                    if (error.status != 404) {
                        $.notify(error.data, "error");
                        throw error;
                    } else {
                        return [];
                    }
                });
            });
        },
        save_template: function (module, template) {
            if (!module.is_working_copy) {
                $.notify("Operation impossible. On ne peut modifier les templates que dans une workingcopy", "error");
                throw module;
            } else {
                template = template.toHesperidesEntity();
                if (template.versionID < 0) {
                    return $http.post('rest/modules/' + encodeURIComponent(module.name) + '/' + encodeURIComponent(module.version) + '/workingcopy/templates', template).then(function (response) {
                        $.notify("Le template bien ete cree", "success");
                        return new Template(response.data);
                    }, function (error) {
                        if (error.status === 409) {
                            $.notify("Impossible de creer le template car il existe deja un template avec ce nom", "error");
                        } else {
                            $.notify(error.data, "error");
                        }
                        throw error;
                    });
                } else {
                    return $http.put('rest/modules/' + encodeURIComponent(module.name) + '/' + encodeURIComponent(module.version) + '/workingcopy/templates', template).then(function (response) {
                        $.notify("Le template a ete mis a jour", "success");
                        return new Template(response.data);
                    }, function (error) {
                        $.notify(error.data, "error");
                        throw error;
                    });
                }
            }
        },
        delete_template: function (module, template_name) {
            if (!module.is_working_copy) {
                $.notify("Operation impossible. Une release ne peut être creee qu'a partir d'une working copy et n'est pas modifiable", "error");
                throw module;
            } else {
                return $http.delete('rest/modules/' + encodeURIComponent(module.name) + '/' + encodeURIComponent(module.version) + '/workingcopy/templates/' + encodeURIComponent(template_name)).then(function (response) {
                    $.notify("Le template a bien ete supprime", "success");
                    return response;
                }, function (error) {
                    $.notify(error.data, "error");
                    throw error;
                });
            }
        },
        create_release: function (module) {
            if (!module.is_working_copy) {
                $.notify("Operation impossible. Une release ne peut être creee qu'a partir d'une working copy", "error");
                throw module;
            } else {
                return $http.post('rest/modules/create_release?module_name=' + encodeURIComponent(module.name) + '&module_version=' + encodeURIComponent(module.version)).then(function (response) {
                    $.notify("La release " + module.name + ", " + module.version + " a bien ete creee", "success");
                }, function (error) {
                    $.notify(error.data, "error");
                    throw error;
                });
            }
        }


    };

}]);
