GUI pour Hesperides

Il faut installer npm sur son poste pour disposer de tous l'environnement de développement
Puis simplement "npm install"

ATTENTION, chez vsct le protocol "git" est refusé depuis l'extérieur.
Il faut avoir executé la commande suivante au préalable :
git config --global url.https://github.com/.insteadOf git:://github.com

Pour lancer le serveur de développement :
npm start

Pour lancer les tests :
npm test

Cela a pour effet de lancer un serveur karma, qui va se baser sur jasmine pour effectuer les tests JS et va scruter les modifications faites sur les fichiers js


Organisation du code :


app/                --> all of the files to be used in production
  css/              --> css files
    app.css         --> default stylesheet
  img/              --> image files
  index.html        --> app layout file (the main html template file of the app)
  js/               --> javascript files
    app.js          --> application
    controllers.js  --> application controllers
    directives.js   --> application directives
    filters.js      --> custom angular filters
    services.js     --> custom angular services
  partials/             --> angular view partials (partial html templates)

test/               --> test config and source files
  protractor-conf.js    --> config file for running e2e tests with Protractor
  e2e/                  --> end-to-end specs
    scenarios.js
  karma.conf.js         --> config file for running unit tests with Karma
  unit/                 --> unit level specs/tests
    controllersSpec.js      --> specs for controllers
    directivessSpec.js      --> specs for directives
    filtersSpec.js          --> specs for filters
    servicesSpec.js         --> specs for services