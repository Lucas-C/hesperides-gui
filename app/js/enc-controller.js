'use strict';

angular.module('Hesperides.controllers').controller('ENCCtrl', ['$scope', '$routeParams', 'ENC', 'Page', function ($scope, $routeParams, ENC, Page) {

	Page.setTitle("Edition ENC "+$routeParams.hostname);

    $scope.hostname = $routeParams.hostname;
	
	$scope.environments = ["usine", "assemblage", "integration", "preproduction", "production"];
	$scope.environment = $scope.environments[1];

	$scope.$watch('environment', function() {
		saveENC();
	}, true);
	
    var myCodeMirror = CodeMirror.fromTextArea(document.getElementById('source'), {
        mode: "text/x-yaml",
        onKeyEvent: function (_, evt) {


            switch (evt.keyCode) {
                case 37:
                case 38:
                case 39:
                case 40:
                    return;
            }

            if (evt.type === 'keyup') {
                saveENC();
            }
        }
    });
	
	var saveENC = function () {
		var objYaml = {
			'environment': $scope.environment,
			//Normalisation du code et verification Yaml
			'custom': jsyaml.dump(jsyaml.load(myCodeMirror.getValue()))
		};
        ENC.save($scope.hostname, objYaml).then(function(enc){
				updatePreview(enc);
			}
		);
	}
	
	var previewYAML = CodeMirror.fromTextArea(document.getElementById('preview'), {
        mode: "yaml",
		readOnly: true
    });
	
	var updatePreview = function(enc) {
		previewYAML.setValue(enc.custom+enc.generated)
	}
	
	var updateCustom = function(enc) {
		if(enc.custom) {
			myCodeMirror.setValue(enc.custom)
		} else {
			myCodeMirror.setValue("Entrez votre complement ENC ici au format YAML");
		}
	}

    ENC.get($scope.hostname).then(function (enc) {
		updatePreview(enc);
		updateCustom(enc);
    });

}]);
