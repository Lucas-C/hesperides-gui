/**
 * Created by william_montaz on 17/10/2014.
 */
var templateModule = angular.module('hesperides.template', []);

templateModule.factory('HesperidesTemplateModal', ['TemplateService', '$mdDialog', '$timeout', '$mdConstant', '$rootScope', function (TemplateService, $mdDialog, $timeout, $mdConstant, $rootScope) {

    var hesperidesOverlay = {
        startState: function() {
            return {
                inMustache: false
            }
        },
        token: function(stream, state) {
            var ch;
            if (stream.match("{{")){ //We found an hesperides token
                state.inMustache = true; //Remember what we do
                state.inMustacheInner = true;
                return "hesperides";
            }
            if(state.inMustache) {
                while ((ch = stream.next()) != null) { //Read characters through the token
                    if (ch == "}" && stream.next() == "}") { //End of hesperides token
                        if(state.inMustacheInner){
                            stream.backUp(2);
                            state.inMustacheInner = false;
                            return "hesperides-token"; //Color for the inner token
                        } else {
                            stream.eat("}");
                            state.inMustache = false; //Remember to update state
                            state.inMustacheInner = false;
                            return "hesperides"; //Color for the }}
                        }
                    }
                    if(ch == "|"){ //Found an inner item limit
                        if(state.inMustacheInner){
                            stream.backUp(1);
                            state.inMustacheInner = false;
                            return "hesperides-token"; //Color for the inner token
                        } else {
                            state.inMustacheInner = true;
                            return "hesperides"; //Color for the | character
                        }
                    }
                }
                return "hesperides-token"; //return the style for syntax highlight even if we reached end of line
            }
            while (stream.next() != null && !stream.match("{{", false)) {} //Skip everything unless we find an hesperides token or reach the end of line
            return null;
        }
    };

    /* Thisis for the initialization, to make sure we have at least the simple Mustache mode selected */
    CodeMirror.defineMode("hesperides", function(config, parserConfig) {
        return CodeMirror.overlayMode(
            CodeMirror.getMode(config, parserConfig.backdrop || ""),
            hesperidesOverlay
        );
    });

    var defaultScope = {
        codemirrorFullscreenStatus: false,
        codemirrorModes: [
            { name: "Simple Hesperides", mimetype: ""},
            { name: "Properties File", mimetype:"text/x-properties"}
        ],
        codeMirrorOptions: {
            mode: 'hesperides',
            lineNumbers: true,
            extraKeys: {
                'F11': function (cm) {
                    $('body').append($('#templateContent')); //Change the parent of codemirror because if not, fullscreen is restricted to the modal
                    $('#templateContent').children().css("z-index", 100000);
                    cm.setOption('fullScreen', true);
                    cm.focus();
                    defaultScope.codemirrorFullscreenStatus = true;
                },
                'Esc': function (cm) {
                    $('#templateContentParent').append($('#templateContent'));
                    if (cm.getOption('fullScreen')) cm.setOption('fullScreen', false);
                    cm.focus();
                }
            },
            onLoad: function(_editor){
                defaultScope.editor = _editor;
                //This is some trick to avoid a bug. If not refresh, then we have to click on code mirror to see its content
                $timeout(function(){
                    defaultScope.editor.refresh();
                }, 500);
            }
        },
        changeCodeMirrorMode: function(new_mode){
            var mode_name = "hesperides+"+new_mode;
            CodeMirror.defineMode(mode_name, function(config, parserConfig) {
                return CodeMirror.overlayMode(
                    CodeMirror.getMode(config, parserConfig.backdrop || new_mode),
                    hesperidesOverlay
                );
            });
            defaultScope.editor.setOption("mode", mode_name);
        }
    };

    return {
        edit_template: function (options) {

            var modalScope = $rootScope.$new(true);

            modalScope.template = options.template;

            modalScope.save = options.onSave;

            modalScope.isReadOnly = options.isReadOnly;

            modalScope.$closeDialog = function() {
                $mdDialog.hide();
            };

            modalScope.$checkIfCodeMirrorInFullScreen = function($event) {
                if ($event.keyCode === $mdConstant.KEY_CODE.ESCAPE && defaultScope.codemirrorFullscreenStatus) {
                    $event.stopPropagation();
                    defaultScope.codemirrorFullscreenStatus = false;
                }
            };

            defaultScope.codeMirrorOptions.readOnly = options.isReadOnly ? true : false;

            angular.extend(modalScope, defaultScope);

            $mdDialog.show({
                templateUrl: 'template/template-modal.html',
                controller: 'TechnoCtrl',
                preserveScope: true, // requiered for not freez menu see https://github.com/angular/material/issues/5041
                scope:modalScope
            });

            modalScope.$close = function(template) {
                modalScope.save(template).then(function(savedTemplate){
                    modalScope.template = savedTemplate;
                });

                $mdDialog.hide();
            };

            modalScope.$save = function(template){
                modalScope.save(template).then(function(savedTemplate){
                    modalScope.template = savedTemplate;
                });
            };
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
            version_id: -1
        }, data);

        this.toHesperidesEntity = function(){
          return {
              name: this.name,
              filename: this.filename,
              location: this.location,
              content: this.content,
              version_id: this.version_id
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
                $.notify(error.data.message, "error");
            });
        },
        save: function (template) {
            template = template.toHesperidesEntity();
            if (template.version_id < 0) {
                return $http.post('rest/templates/' + encodeURIComponent(template.namespace) + '/' + encodeURIComponent(template.name), template).then(function (response) {
                    $.notify("Le template bien ete cree", "success");
                    return new Template(response.data);
                }, function (error) {
                    if (error.status === 409) {
                        $.notify("Impossible de creer le template car il existe deja un template avec ce nom", "error");
                    } else {
                        $.notify(error.data.message, "error");
                    }
                });
            } else {
                return $http.put('rest/templates/' + encodeURIComponent(template.namespace) + '/' + encodeURIComponent(template.name), template).then(function (response) {
                    $.notify("Le template a ete mis a jour", "success");
                    return new Template(response.data);
                }, function (error) {
                    $.notify(error.data.message, "error");
                });
            }
        },
        delete: function (namespace, name) {
            return $http.delete('rest/templates/' + encodeURIComponent(namespace) + '/' + encodeURIComponent(name)).then(function (response) {
                $.notify("Le template a bien ete supprime", "success");
                return response;
            }, function (error) {
                $.notify(error.data.message, "error");
            });
        },
        all: function (namespace) {
            return $http.get('rest/templates/' + encodeURIComponent(namespace)).then(function (response) {
                return response.data.map(function (data) {
                    return new TemplateEntry(data);
                }, function (error) {
                    if (error.status != 404) {
                        $.notify(error.data.message, "error");
                    } else {
                        return [];
                    }
                });
            });
        }
    }

}]);
