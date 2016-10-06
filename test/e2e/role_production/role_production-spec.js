var rest = require('restling');
var vsct_utils = require('../lib/lib.js');

describe('Checks around production role', function() {

    beforeAll(function() {
        console.log("START Checks around production role");
    });
    beforeEach(function() {
        browser.get(hesperides_url+"/#/properties/"+data.new_application+"?platform="+data.new_platform);
    });
    it('should check on logical representation page that switch "Production platform" is disabled for a "non production" user', function() {
        vsct_utils.checkIfElementIsDisabled("properties_isProduction-switch","true");
    });
    it('should check that a "non production" user cannot create a production platform', function() {
        var elm_applicationMenu = element(by.id("menu_application-menu"));
        vsct_utils.clickOnElement(elm_applicationMenu);
        var elm_createPlatformMenu = element(by.id("menu_application-create-menu"));
        vsct_utils.clickOnElement(elm_createPlatformMenu);
        
        vsct_utils.checkIfElementIsDisabled("platform-menu-modal_is-production-switch","true");
    });
    it('should check that a "non production" user cannot create a production platform from another one', function() {
        var elm_applicationMenu = element(by.id("menu_application-menu"));
        vsct_utils.clickOnElement(elm_applicationMenu);
        var elm_createPlatformFromMenu = element(by.id("menu_application-create-from-menu"));
        vsct_utils.clickOnElement(elm_createPlatformFromMenu);
        
        vsct_utils.checkIfElementIsDisabled("platform-menu-modal-from_is-production-switch","true");
    });
    afterAll(function(done) {
        process.nextTick(done);
    });
});
