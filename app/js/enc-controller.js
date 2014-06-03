'use strict';

angular.module('Hesperides.controllers').controller('ENCCtrl', ['$scope', '$routeParams', 'ENC', function ($scope, $routeParams, ENC) {

    $scope.hostname = $routeParams.hostname;

    var resultArea = CodeMirror.fromTextArea(document.getElementById('result'), {
        mode: "yaml",
        readOnly: true

    });
    var sourceArea = CodeMirror.fromTextArea(document.getElementById('source'), {
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
                try {
                    // permet de valider le format yaml
                    var objYaml = jsyaml.load(sourceArea.getValue());
                    // sauvegarde vraiment l'ENC sur ElasticSearch/Hesperides
                    $scope.enc = ENC.save($scope.hostname, sourceArea.getValue())
                        .then(function (storeEnc) {
                            resultArea.setValue(storeEnc.data);
                        }).then(function () {
                            ENC.get($scope.hostname).then(function (enc) {
                                $scope.enc = enc.data;
                                resultArea.setValue($scope.enc);
                            });
                        });
                    console.log("le yaml a été enregistré");

                } catch (exception) {
                    console.log("le yaml de l'enc n'est pas valide " + objYaml);
                }
            }
        }
    });

    ENC.get($scope.hostname).then(function (enc) {
        $scope.enc = enc.data;
        sourceArea.setValue($scope.enc);
        resultArea.setValue($scope.enc);
    }, function (reason) {
        // on fait l'hypothèse que l'enc n'a pas été encore créé
        ENC.save($scope.hostname).then(function (newEnc) {
                $scope.enc = newEnc.data;
                sourceArea.setValue($scope.enc);
            }
        );

    });

}]);
