var rest = require('restling');
var vsct_utils = require('../lib/lib.js');

describe('Preview files', function() {

    beforeAll(function() {
        console.log("START describe Preview files");
        browser.get(hesperides_url+"/#/properties/"+data.new_application+"?platform="+data.new_platform);
    });
    it('should preview files (TREE MODE) and check if template has the right location', function() {
        // set tree mode
        var elm_tree_mode = element(by.id("properties_show-tree-mode-button"));
        vsct_utils.clickOnElement(elm_tree_mode);

        // on déroule l'arbre
        var elm_quick_tree_display = element(by.id("tree-properties_quick-display-button"));
        vsct_utils.clickOnElement(elm_quick_tree_display);
        var elm_module = element(by.id("tree-renderer_tree-sign-"+data.new_module_name));
        vsct_utils.clickOnElement(elm_module);

        vsct_utils.moveMouseOnElement("tree-renderer_edit-properties-"+data.new_instance_name+"-button",2000);

        var elm_preview_button = element(by.id("tree-renderer_preview-properties-"+data.new_instance_name+"-button"));
        vsct_utils.clickOnElement(elm_preview_button);

        var elm_template = element(by.id("file-modal_preview-"+data.new_template_filename+"-button"));
        vsct_utils.clickOnElement(elm_template);

        var elm_location_template = element(by.id("file-modal_template-section-header-path-"+data.new_template_filename));

        expect(elm_location_template.getText()).toBe(data.new_template_location+"/"+data.new_template_filename);
    });
    afterAll(function(done) {
        process.nextTick(done);
    });
});
