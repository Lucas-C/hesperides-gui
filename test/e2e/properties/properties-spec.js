var rest = require('restling');
var vsct_utils = require('../lib/lib.js');

describe('Manage properties (global, module, instance) and annotations (default, comment, required etc ...)', function() {

    beforeAll(function() {
        console.log("START describe Manage annotations");
        browser.get(hesperides_url+"/#/properties/"+data.new_application+"?platform="+data.new_platform);
    });
    beforeEach(function() {
        browser.get(hesperides_url+"/#/properties/"+data.new_application+"?platform="+data.new_platform);

        // set tree mode
        var elm_tree_mode = element(by.id("properties_show-tree-mode-button"));
        vsct_utils.clickOnElement(elm_tree_mode);

        // on déroule l'arbre
        var elm_quick_tree_display = element(by.id("tree-properties_quick-display-button"));
        vsct_utils.clickOnElement(elm_quick_tree_display);

        var elm_module = element(by.id("tree-renderer_edit-properties-module-button-"+data.new_module_name));
        vsct_utils.clickOnElement(elm_module);
    });
    it('should fill in properties with right values (TREE MODE) and check if save event is correctly stored', function() {

        var elm_prop_comment = element(by.id("simple-properties-list_value-property-isnotglobale-input-prop_comment"));
        var elm_prop_default = element(by.id("simple-properties-list_value-property-isnotglobale-input-prop_default"));
        var elm_prop_password = element(by.id("simple-properties-list_value-property-isnotglobale-input-prop_password"));
        var elm_prop_pattern = element(by.id("simple-properties-list_value-property-isnotglobale-input-prop_pattern"));
        var elm_prop_required = element(by.id("simple-properties-list_value-property-isnotglobale-input-prop_required"));
        var elm_prop_simple = element(by.id("simple-properties-list_value-property-isnotglobale-input-prop_simple"));

        // we use random_string for at least 1 property to avoid saving plateform without changes for property values
        var random_string = vsct_utils.getRandomString(20);

        // always clear before sendKeys
        vsct_utils.clearAndSendkeys(elm_prop_comment,random_string);
        vsct_utils.clearAndSendkeys(elm_prop_password,data.simple_value);
        vsct_utils.clearAndSendkeys(elm_prop_pattern,data.value_prop_good_pattern);
        vsct_utils.clearAndSendkeys(elm_prop_required,data.simple_value);
        vsct_utils.clearAndSendkeys(elm_prop_simple,data.simple_value);

        var elm_save_properties = element(by.id("tree-properties_save-module-properties-button"));
        vsct_utils.clickOnElement(elm_save_properties);

        // add comment for saving modifications
        var elm_comment_input = element(by.id("save-properties-modal_comment-input"));
        elm_comment_input.sendKeys(data.comment_for_saving_properties+"_"+random_string);
        var elm_save_comment = element(by.id("save-properties-modal_save-comment-button"));
        vsct_utils.clickOnElement(elm_save_comment);

        // check events if modification is really saved
        var elm_open_event_button = element(by.id("properties_show-platform-event-button"));
        vsct_utils.clickOnElement(elm_open_event_button);

        var elm_found_comment = element(by.id('properties-saved_comment-span-'+data.comment_for_saving_properties+"_"+random_string));
        vsct_utils.checkIfElementContainsText(elm_found_comment,data.comment_for_saving_properties+"_"+random_string);

    });
    it('should find star for a required property (TREE MODE)', function() {
        expect(browser.getPageSource()).toContain('prop_required <span ng-show="key_value_property.required" class="property-required">*');
    });
    it('should not save properties for a wrong pattern (TREE MODE)', function() {
        var elm_prop_pattern = element(by.id("simple-properties-list_value-property-isnotglobale-input-prop_pattern"));

        // we use random_string for at least 1 property to avoid saving plateform without changes for property values
        var random_string = vsct_utils.getRandomString(20);

        // always clear before sendKeys
        vsct_utils.clearAndSendkeys(elm_prop_pattern,data.value_prop_wrong_pattern);

        var elm_save_properties = element(by.id("tree-properties_save-module-properties-button"));
        vsct_utils.clickOnElement(elm_save_properties);

        // add comment for saving modifications
        var elm_comment_input = element(by.id("save-properties-modal_comment-input"));
        elm_comment_input.sendKeys(data.comment_for_saving_properties+"_"+random_string);
        var elm_save_comment = element(by.id("save-properties-modal_save-comment-button"));
        vsct_utils.clickOnElement(elm_save_comment);

        // check events if modification is not saved because of pattern is not correct
        var elm_open_event_button = element(by.id("properties_show-platform-event-button"));
        vsct_utils.clickOnElement(elm_open_event_button);
        element.all(by.id('properties-saved_comment-span-'+data.comment_for_saving_properties+"_"+random_string)).then(function(items) {
            expect(items.length).toBe(0);
        });
    });
    it('should find default value for the property with a default value (TREE MODE)', function() {
        var elm_prop_default = element(by.id("simple-properties-list_value-property-isnotglobale-input-prop_default"));

        elm_prop_default.getAttribute('placeholder').then(function(element){
            // attention aux 2 espaces après le crochet ...
            expect(element).toEqual('[default=default_value]   ');
        });
    });
    // WIP : en attente https://jira.vsct.fr/browse/HES-224
    // it('should add a global property and check that valuation of module property with the same name is set (TREE MODE)', function() {
    //     var elm_display_global_property_button = element(by.id("tree-properties_display-global-properties-button"));
    //     vsct_utils.clickOnElement(elm_display_global_property_button);

    //     var elm_new_global_property_key = element(by.id("new_kv_name"));
    //     var elm_new_global_property_value = element(by.id("new_kv_value"));

    //     elm_new_global_property_key.sendKeys(data.global_property_key);
    //     elm_new_global_property_value.sendKeys(data.global_property_value);

    //     var elm_save_global_properties = element(by.id("tree-properties_save-global-properties-button"));
    //     vsct_utils.clickOnElement(elm_save_global_properties);

    //     // add comment for saving modifications
    //     var elm_comment_input = element(by.id("save-properties-modal_comment-input"));
    //     elm_comment_input.sendKeys(data.comment_for_saving_global_properties);
    //     var elm_save_comment = element(by.id("save-properties-modal_save-comment-button"));
    //     vsct_utils.clickOnElement(elm_save_comment);

    //     vsct_utils.checkIfElementIsPresent("properties-globales_key-property-label-"+data.global_property_key);

    // });
    afterAll(function(done) {
        process.nextTick(done);
    });
});
