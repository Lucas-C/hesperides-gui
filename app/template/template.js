/**
 * Created by william_montaz on 17/10/2014.
 */
var templateModule = angular.module('hesperides.template', []);

templateModule.factory('HesperidesTemplateModal', ['TemplateService', '$modal', '$rootScope', function (TemplateService, $modal, $rootScope) {

    var defaultScope = {
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
        }
    };

    return {
        edit_template: function (options) {

            var modalScope = $rootScope.$new(true);

            modalScope.template = options.template;

            modalScope.save = options.onSave;

            modalScope.isReadOnly = options.isReadOnly;

            defaultScope.codeMirrorOptions.readOnly = options.isReadOnly;

            angular.extend(modalScope, defaultScope);

            var modal = $modal.open({
                templateUrl: 'template/template-modal.html',
                backdrop: 'static',
                size: 'lg',
                keyboard: false,
                scope: modalScope
            });

            modalScope.$save = function(template){
                modalScope.save(template).then(function(savedTemplate){
                    modalScope.template = savedTemplate;
                });
            };

            //If everything went well (using $close to close the modal), then save the template
            //If we use $dismiss to close the modal, this will not be called
            modal.result.then(function (template) {
                modalScope.$save(template);
            });
        }
    };

}]);

templateModule.directive('hesperidesTemplateList', function () {
    return {
        restrict: 'E',
        scope: {
            templateEntries: '=',
            add: '&',
            delete: '&',
            edit: '&',
            isReadOnly: '='
        },
        templateUrl: "template/template-list.html",
        link: function (scope, element, attr) {

            scope.add_template = function () {
                scope.add()();
            };

            scope.delete_template = function (name) {
                scope.delete()(name);
            };

            scope.edit_template = function (name) {
                scope.edit()(name);
            };

        }
    };
});

templateModule.factory('Template', function () {

    var Template = function (data) {

        angular.extend(this, {
            name: "",
            filename: "",
            location: "",
            content: "",
            versionID: -1
        }, data);

        this.toHesperidesEntity = function(){
          return {
              name: this.name,
              filename: this.filename,
              location: this.location,
              content: this.content,
              versionID: this.versionID
          }
        };

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

templateModule.factory('TemplateService', ['$http', 'Template', 'TemplateEntry', function ($http, Template, TemplateEntry) {

    return {
        get: function (namespace, name) {
            return $http.get('rest/templates/' + encodeURIComponent(namespace) + '/' + encodeURIComponent(name)).then(function (response) {
                return new Template(response.data);
            }, function (error) {
                $.notify(error.data, "error");
            });
        },
        save: function (template) {
            template = template.toHesperidesEntity();
            if (template.versionID < 0) {
                return $http.post('rest/templates/' + encodeURIComponent(template.namespace) + '/' + encodeURIComponent(template.name), template).then(function (response) {
                    $.notify("Le template bien ete cree", "success");
                    return new Template(response.data);
                }, function (error) {
                    if (error.status === 409) {
                        $.notify("Impossible de creer le template car il existe deja un template avec ce nom", "error");
                    } else {
                        $.notify(error.data, "error");
                    }
                });
            } else {
                return $http.put('rest/templates/' + encodeURIComponent(template.namespace) + '/' + encodeURIComponent(template.name), template).then(function (response) {
                    $.notify("Le template a ete mis a jour", "success");
                    return new Template(response.data);
                }, function (error) {
                    $.notify(error.data, "error");
                });
            }
        },
        delete: function (namespace, name) {
            return $http.delete('rest/templates/' + encodeURIComponent(namespace) + '/' + encodeURIComponent(name)).then(function (response) {
                $.notify("Le template a bien ete supprime", "success");
                return response;
            }, function (error) {
                $.notify(error.data, "error");
            });
        },
        all: function (namespace) {
            return $http.get('rest/templates/' + encodeURIComponent(namespace)).then(function (response) {
                return response.data.map(function (data) {
                    return new TemplateEntry(data);
                }, function (error) {
                    if (error.status != 404) {
                        $.notify(error.data, "error");
                    } else {
                        return [];
                    }
                });
            });
        }
    }

}]);
