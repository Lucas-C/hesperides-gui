var Jasmine2HtmlReporter = require('protractor-jasmine2-html-reporter');

exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  framework: 'jasmine2',
  jasmineNodeOpts: {
    stopSpecOnExpectationFailure: true,
    showColors: true,
    defaultTimeoutInterval: 400000,
    isVerbose: true,
    includeStackTrace: true
  },
  allScriptsTimeout: 400000,
  getPageTimeout: 400000,
  params: {
    data_json: "data/data_hesperides.json"
  },
  // dans le cas d'une plateforme hesperides avec authentification, j'ai pas trouvé mieux que de mettre
  // le test menus dans create_plateforme et create_modules sinon ça ne marche pas pour une raison que j'ignore...
  suites: {
    menus: 'test/e2e/menus/*spec.js',
    create_platforms: ['e2e/menus/*spec.js', 'e2e/platforms/*spec.js'],
    create_modules: ['e2e/menus/*spec.js', 'e2e/modules/*spec.js'],
    logic_representation: 'e2e/logic-representation/*spec.js',
    createPlatforms_linkModules: ['e2e/platforms/*spec.js', 'e2e/modules/*spec.js', 'e2e/logic-representation/*spec.js'],
    createPlatforms_linkModules_fillProperties: ['e2e/platforms/*spec.js', 'e2e/modules/*spec.js', 'e2e/logic-representation/*spec.js','e2e/annotations/*spec.js'],
    properties: 'e2e/properties/*spec.js',
    role_production: 'e2e/role_production/*spec.js',
    all: ['e2e/menus/*spec.js', 'e2e/platforms/*spec.js', 
          'e2e/modules/*spec.js', 'e2e/logic-representation/*spec.js', 
          'e2e/properties/*spec.js', 'e2e/preview-files/*spec.js', 
          'e2e/role_production/*spec.js']
  },
  onPrepare: function() {
    jasmine.getEnv().addReporter(
      new Jasmine2HtmlReporter({
        savePath: 'reports/'
      })
    );
    // load data from json and display for info
    data=require('./'+browser.params.data_json)
    console.log("Using following datas : "+JSON.stringify(data))

    // hesperides_connect_url : init connexion with LDAP username/password
    hesperides_connect_url = data.hesperides_protocol+"://"+data.hesperides_SA_username+":"+data.hesperides_SA_password+"@"+data.hesperides_host+":"+data.hesperides_port;

    hesperides_url = data.hesperides_protocol+"://"+data.hesperides_host+":"+data.hesperides_port;

    rest_options = {"headers": { 'Authorization': data.hesperides_token_auth}};

    // init connexion to hesperides (particularly to authorize user)
    browser.get(hesperides_connect_url);
  }
};
