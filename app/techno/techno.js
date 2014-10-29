/**
 * Created by william_montaz on 17/10/2014.
 */
var technoModule = angular.module('hesperides.techno', ['hesperides.template', 'hesperides.properties', 'hesperides.model']);

technoModule.controller('TechnoCtrl', ['$scope', '$routeParams', 'Techno', 'Page', function ($scope, $routeParams, Techno, Page) {
    Page.setTitle("Technos");

    var namespace = "technos#" + $routeParams.name + '#' + $routeParams.version;
    $scope.techno = new Techno(namespace);

    $scope.$on("hesperidesTemplateChanged", function(event){
        //Use timeout because of elasticsearch indexation
        setTimeout(function(){
            $scope.$broadcast('hesperidesModelRefresh');
        }, 1000);
    });

}]);

technoModule.controller('TechnoSearchCtrl', ['$scope', '$routeParams', 'TechnoService', 'Page', function ($scope, $routeParams, TechnoService, Page) {
    Page.setTitle("Technos");

    /* Load technos list */
    TechnoService.all().then(function (technos) {
        $scope.technos = technos;
    });

}]);

technoModule.factory('Techno', function(){

    var Techno = function (namespace) {
        var namespaceTokens = namespace.split("#");
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
        with_name_like: function (name) {
            /* NB this is slow and should be improved server side */
            return $http.get('rest/templates/search/namespace/'+encodeURIComponent('technos#*' + name + '*')).then(function (response) {
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