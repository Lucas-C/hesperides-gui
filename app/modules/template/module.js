/**
 * Created by william_montaz on 17/10/2014.
 */
var templateModule = angular.module('hesperides.template', []);

templateModule.controller('TemplateCtrl', ['$scope', '$routeParams', 'TemplateService', 'Page', function ($scope, $routeParams, TemplateService, Page) {
    Page.setTitle("Templates");

    /* Instanciate CodeMirror Edition */
    var templateTextArea = CodeMirror.fromTextArea(document.getElementById('template'), {
        mode: "text",
        lineNumbers: true,
        lineWrapping: true
    });

    TemplateService.get({version: $routeParams.version, application: $routeParams.application, name: $routeParams.template_name})
        .$promise.then(function (template) {
            $scope.template = template;
            templateTextArea.setValue(template.template);
        }, function (error) {
            $scope.template = new Template({version: $routeParams.version, application: $routeParams.application, name: $routeParams.template_name});
        });


    //Use saveInProgress variable to avoid double saves
    var saveInProgress = false;
    $scope.SaveCurrentTemplate = function () {
        if ($scope.template && !saveInProgress) {
            saveInProgress = true;
            $scope.template.template = templateTextArea.getValue();
            if ($scope.template.id) {
                $scope.template.$update();
            } else {
                $scope.template.$create();
            }
            saveInProgress = false;
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

        this.namespace = data.hesnamespace;
    };

    return TemplateEntry;
});

templateModule.factory('TemplateService', ['$http', 'Template', 'TemplateEntry', function ($http, Template, TemplateEntry) {

    return {
        get: function (namespace, name) {
            return $http.get('rest/templates/' + namespace + '/' + name).then(function (response) {
                return new Template(response.data);
            });
        },
        save: function (template) {
            if (template.versionID < 0) {
                return $http.post('rest/templates/' + template.namespace + '/' + template.name, template).then(function (response) {
                    return new Template(response.data);
                });
            } else {
                return $http.put('rest/templates/' + template.namespace + '/' + template.name, template).then(function (response) {
                    return new Template(response.data);
                });
            }
        },
        all: function (namespace) {
            return $http.get('rest/templates/' + namespace).then(function (response) {
                return response.data.map(function (data) {
                    return new TemplateEntry(data);
                });
            });
        }
    }

}]);
