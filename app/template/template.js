/**
 * Created by william_montaz on 17/10/2014.
 */
var templateModule = angular.module('hesperides.template', []);

templateModule.factory('HesperidesTemplateModal', ['TemplateService', '$modal', function (TemplateService, $modal) {

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
        },
        $save: function (template) {
            var me = this;
            TemplateService.save(template).then(function (savedTemplate) {
                me.template = savedTemplate; //Refresh the template kept in scope
                me.$emit("hesperidesTemplateChanged", template);
            });
        }
    }

    return {
        edit_template: function (options) {

            var modalScope = options.scope;

            angular.extend(modalScope, {
                template: options.template
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
            title: '=',
            namespace: '='
        },
        templateUrl: "template/template-list.html",
        link: function (scope, element, attr) {

            scope.templateEntries = [];

            var reload = function(){
                TemplateService.all(scope.namespace).then(function (templateEntries) {
                    scope.templateEntries = templateEntries;
                });
            };

            scope.add_template = function (namespace) {
                HesperidesTemplateModal.edit_template({
                    scope: scope,
                    template: new Template({namespace: namespace})
                });
            };

            scope.delete_template = function (namespace, name) {
                TemplateService.delete(namespace, name).then(function () {
                    scope.templateEntries = _.reject(scope.templateEntries, function (templateEntry) {
                        scope.$emit("hesperidesTemplateChanged", templateEntry);
                        return (templateEntry.name === name && templateEntry.namespace === namespace);
                    });
                });
            };

            scope.edit_template = function (namespace, name) {
                TemplateService.get(namespace, name).then(function (template) {
                    HesperidesTemplateModal.edit_template({
                        scope: scope,
                        template: template
                    });
                });
            };

            scope.$on('hesperidesTemplateChanged', function (event, data) {
                //Reload with timeout -> time to index data
                setTimeout(reload, 1000);
            });

            reload();
        }
    };
}]);

templateModule.factory('Template', function () {

    var Template = function (data) {

        angular.extend(this, {
            namespace: "",
            name: "",
            filename: "",
            location: "",
            content: "",
            versionID: -1
        }, data);

        this.toHesperidesEntity = function(){
          return {
            namespace: this.namespace,
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
