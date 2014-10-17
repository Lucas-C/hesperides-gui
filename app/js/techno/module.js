/**
 * Created by william_montaz on 17/10/2014.
 */
var technoModule = angular.module('hesperides.techno', ['hesperides.template', 'hesperides.properties']);

technoModule.constant('techno.module.const', {
    partialPath: 'modules/techno/'
});

technoModule.controller('TechnosCtrl', ['$scope', '$routeParams', '$modal', 'TemplateService', 'PropertiesService', 'Page', function ($scope, $routeParams, $modal, TemplateService, PropertiesService, Page) {
    Page.setTitle("Technos");

    var namespace = "technos." + $routeParams.name + '.' + $routeParams.version;
    $scope.techno = $routeParams.name;
    $scope.version = $routeParams.version;

    $scope.codeMirrorOptions = {
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
    };

    // Load template list matching namespace
    // If no template exists (404), just create an empty list
    TemplateService.all(namespace).then(function (templateEntries) {
        $scope.templateEntries = templateEntries;
        $scope.refresh_properties();
    }, function (error) {
        if (error.status != 404) {
            $.notify(error.data, "error");
        }
        /* If no template exists then we create an empty list */
        $scope.templateEntries = [];
    });

    /* Functions */

    // This function is used to parse the templates and retreived the model associated
    // ie. the properties parsed in the templates
    $scope.refresh_properties = function () {
        PropertiesService.getModel(namespace).then(function (propertiesModel) {
            $scope.propertiesModel = propertiesModel;
            /* Force refresh, that might be needed */
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }, function (error) {
            $.notify(error.data, "error");
        });
    };

    $scope.add_template = function (namespace) {
        $scope.template = new Template({namespace: namespace});
        $scope.show_edit_template();
    };

    $scope.delete_template = function (namespace, name) {
        Template.delete({namespace: namespace, name: name}).$promise.then(function () {
            $scope.templateEntries = _.reject($scope.templateEntries, function (templateEntry) {
                return templateEntry.name === name;
            });
            $.notify("Le template a bien ete supprime", "success");
            setTimeout($scope.refresh_properties, 1000);
        }, function (error) {
            $.notify(error.data, "error");
        });
    }

    $scope.edit_template = function (namespace, name) {
        Template.get({namespace: namespace, name: name}).$promise.then(function (template) {
            $scope.template = template;
            $scope.show_edit_template();
        }, function (error) {
            $.notify(error.data, "error");
        });
    };

    $scope.show_edit_template = function () {
        $scope.templateModalInstance = $modal.open({
            templateUrl: 'edit-template-modal.html',
            backdrop: 'static',
            size: 'lg',
            keyboard: false,
            scope: $scope
        });

        $scope.templateModalInstance.result.then(function (template) {
            $scope.save_template(template);
        });
    };

    $scope.save_template = function (template) {
        if ($scope.template.id) {
            $scope.template.$update(function () {
                $.notify("Le template a ete mis a jour", "success");
                setTimeout($scope.refresh_properties, 1000);
            }, function (error) {
                $.notify(error.data, "error");
            });
        } else {
            $scope.template.$create(function () {
                $.notify("Le template bien ete cree", "success");
                $scope.templateEntries.push(new TemplateEntry($scope.template));
                setTimeout($scope.refresh_properties, 1000);
            }, function (error) {
                if (error.status === 409) {
                    $.notify("Impossible de creer le template car il existe deja un template avec ce nom", "error");
                } else {
                    $.notify(error.data, "error");
                }
            });
        }
    };

}]);

technoModule.controller('TechnosSearchCtrl', ['$scope', '$routeParams', 'TechnoService', 'Page', function ($scope, $routeParams, TechnoService, Page) {
    Page.setTitle("Technos");

    /* Load technos list */
    TechnoService.all().then(function (technos) {
        $scope.technos = technos;
    });

}]);

technoModule.factory('Techno', function(){

    var Techno = function (namespace) {
        var namespaceTokens = namespace.split(".");
        this.name = namespaceTokens[1];
        this.version = namespaceTokens[2];
        this.namespace = namespace;
        this.title = this.name + ", version " + this.version;
    };

    return Techno;
});

technoModule.factory('TechnoService', ['$http', 'Techno', function ($http, Techno) {

    return {
        all: function () {
            /* NB this is very slow and should be improved server side */
            return $http.get('rest/templates/search/namespace/technos').then(function (response) {
                return _(response.data)
                    .groupBy("namespace")
                    .map(function (templateList) {
                        var template = templateList[0];
                        return new Techno(template.namespace);
                    })
                    .groupBy("name")
                    .sortBy("version")
                    .value();
            });
        },
        withNamelike: function (name) {
            /* NB this is slow and should be improved server side */
            return $http.get('rest/templates/search/namespace/technos.*' + name + '*').then(function (response) {
                return _.chain(response.data)
                    .groupBy("namespace")
                    .map(function (templateList) {
                        var template = templateList[0];
                        return new Techno(template.namespace);
                    })
                    .groupBy("name")
                    .sortBy("version")
                    .value();
            });
        }

    }

}]);