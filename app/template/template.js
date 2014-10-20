/**
 * Created by william_montaz on 17/10/2014.
 */
var templateModule = angular.module('hesperides.template', []);

templateModule.factory('HesperidesTemplateModal', ['TemplateService', '$modal', '$rootScope', function (TemplateService, $modal, $rootScope) {

    var defaultScope = {
        me: this,
        codeMirrorOptions: {
            mode: 'text',
            lineNumbers: true,
            extraKeys: {
                'F11': function (cm) {
                    $('body').append($('#templateContent')); //Change the parent of codemirror because if not, fullscreen is restricted to the modal
                    $('#templateContent').children().css("z-index", 100000);
                    cm.setOption('fullScreen', true);
                    cm.focus();
                },
                'Esc': function (cm) {
                    $('#templateContentParent').append($('#templateContent'));
                    if (cm.getOption('fullScreen')) cm.setOption('fullScreen', false);
                    cm.focus();
                }
            }
        },
        $save: function (template) {
            TemplateService.save(template).then(function(template){
                this.template = template; //Refresh the template kept in scope
            });
        }
    }

    return {
        edit_template: function (template) {

            var modalScope = $rootScope.$new();

            angular.extend(modalScope, {
                template: template
            }, defaultScope);

            var modal = $modal.open({
                templateUrl: 'template/template-modal.html',
                backdrop: 'static',
                size: 'lg',
                keyboard: false,
                scope: modalScope
            });

            //If everything went well (using $close to close the modal), then save the template
            //If we use $dismiss to close the modal, this will not be called
            modal.result.then(function (template) {
                modalScope.$save(template);
            });
        }
    };

}]);

templateModule.directive('hesperidesTemplateList', ['HesperidesTemplateModal', 'TemplateService', 'Template', function (HesperidesTemplateModal, TemplateService, Template) {
    return {
        restrict: 'E',
        scope: {
            namespace: '='
        },
        templateUrl: "template/template-list.html",
        link: function (scope, element, attr) {

            scope.templateEntries = [];

            // Load template list matching namespace
            // If no template exists (404), just create an empty list
            TemplateService.all(scope.namespace).then(function (templateEntries) {
                scope.templateEntries = templateEntries;
                scope.$emit('HesperidesTemplateListLoaded');
            });

            scope.add_template = function (namespace) {
                HesperidesTemplateModal.edit_template(new Template({namespace: namespace}));
            };

            scope.delete_template = function (namespace, name) {
                TemplateService.delete(namespace, name).then(function () {
                    scope.templateEntries = scope.templateEntries.reject(function (templateEntry) {
                        return (templateEntry.name === name && templateEntry.namespace === namespace);
                    });
                });
            }

            scope.edit_template = function (namespace, name) {
                TemplateService.get(namespace, name).then(function (template) {
                    HesperidesTemplateModal.edit_template(template);
                });
            };
        }
    };
}]);

templateModule.factory('Template', function () {

    var Template = function (data) {

        this.namespace = data.hesnamespace;

        angular.extend(this, {
            name: "",
            filename: "",
            location: "",
            content: "",
            versionID: -1
        }, data);

    };

    return Template;

});

templateModule.factory('TemplateEntry', function () {

    var TemplateEntry = function (data) {
        angular.extend(this, {
            name: "",
            namespace: "",
            filename: "",
            location: ""
        }, data);
    };

    return TemplateEntry;
});

templateModule.factory('TemplateService', ['$http', '$rootScope', 'Template', 'TemplateEntry', function ($http, $rootScope, Template, TemplateEntry) {

    return {
        get: function (namespace, name) {
            return $http.get('rest/templates/' + namespace + '/' + name).then(function (response) {
                return new Template(response.data);
            }, function (error) {
                $.notify(error.data, "error");
            });
        },
        save: function (template) {
            if (template.versionID < 0) {
                return $http.post('rest/templates/' + template.namespace + '/' + template.name, template).then(function (response) {
                    $.notify("Le template bien ete cree", "success");
                    $rootScope.$broadcast("HesperidesTemplateCreated", template);
                    return new Template(response.data);
                }, function (error) {
                    if (error.status === 409) {
                        $.notify("Impossible de creer le template car il existe deja un template avec ce nom", "error");
                    } else {
                        $.notify(error.data, "error");
                    }
                });
            } else {
                return $http.put('rest/templates/' + template.namespace + '/' + template.name, template).then(function (response) {
                    $.notify("Le template a ete mis a jour", "success");
                    $rootScope.$broadcast("HesperidesTemplateUpdated", template);
                    return new Template(response.data);
                }, function (error) {
                    $.notify(error.data, "error");
                });
            }
        },
        delete: function(namespace, name){
            return $http.delete('rest/templates/' + namespace + '/' + name).then(function (response) {
                $.notify("Le template a bien ete supprime", "success");
                $rootScope.$broadcast("HesperidesTemplateDeleted", {namespace: namespace, name: name});
                return response;
            }, function (error) {
                $.notify(error.data, "error");
            });
        },
        all: function (namespace) {
            return $http.get('rest/templates/' + namespace).then(function (response) {
                return response.data.map(function (data) {
                    return new TemplateEntry(data);
                }, function (error) {
                    if (error.status != 404) {
                        $.notify(error.data, "error");
                    }
                });
            });
        }
    }

}]);
