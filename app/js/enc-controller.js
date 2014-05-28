'use strict';

angular.module('Hesperides.controllers').controller('ENCCtrl', ['$scope', '$routeParams', 'ENC', function ($scope, $routeParams, ENC) {

    $scope.hostname = $routeParams.hostname;

    var myCodeMirror = CodeMirror.fromTextArea(document.getElementById('source'), {
        mode: "yaml",
        onKeyEvent: function (_, evt) {

            switch (evt.keyCode) {
                case 37:
                case 38:
                case 39:
                case 40:
                    return;
            }

            if (evt.type === 'keyup') {
                var objYaml = jsyaml.load(myCodeMirror.getValue());
                $scope.enc = ENC.save($scope.hostname,objYaml);
                console.log(objYaml);

                // TODO envoie au backend
            }
        }
    });

    ENC.get($scope.hostname).then(function (enc) {
        $scope.enc = enc.data;
        myCodeMirror.setValue(jsyaml.dump($scope.enc));
    });

}]);
