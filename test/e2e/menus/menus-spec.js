var rest = require('restling');
var vsct_utils = require('../lib/lib.js');

describe('Manage menus', function() {
    console.log("START describe Manage menus");
    it('should open help menu and check content "about"', function() {
        var elm_helpMenu = element(by.id("menu_help-menu"));
        vsct_utils.clickOnElement(elm_helpMenu);
        var elm_aboutMenu = element(by.id("menu_help-about-menu"));
        vsct_utils.clickOnElement(elm_aboutMenu);

        var elm = element(by.id('dialogContent_7'));
        vsct_utils.checkIfElementContainsText(elm,"About the");
    });
});
