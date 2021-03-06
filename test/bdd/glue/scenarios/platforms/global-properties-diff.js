const api = require('../../helpers/api');
const assert = require('../../helpers/assert');
const get = require('../../helpers/get');
const navigate = require('../../helpers/navigate');
const send = require('../../helpers/send');
const moment = require('moment');

let selectedTimestamp = null;
const globalPropertiesPath = '#';

When('I open the modal to compare global properties', async function () {
    selectedTimestamp = null;
    await send.clickById('e2e-tree-properties-display-global-properties-diff-button');
});

When('I select the platform to compare {string}', async function (platformName) {
    await send.clickById(`e2e-platform-to-compare-button-${ platformName }`);
});

When('I launch the diff of global properties', async function () {
    await send.clickById('e2e-global-properties-diff-runcomparison-button');
});

When('I select the global properties stored values comparison option', async function () {
    await send.clickById('e2e-global-properties-diff-option-stored');
});

When('I select a specific date to compare global properties', async function () {
    await send.clickById('e2e-global-properties-diff-select-date-switch');
    // Vérifie que le calendrier s'affiche automatiquement
    await assert.isPresentByCss('.angularjs-datetime-picker');
    // Sélectionne une date un mois plus tôt
    await send.clickByCss('.adp-prev');
    await send.clickByCssContainingText('.adp-day.selectable', '12');
    // Vérifie que le calendrier se ferme automatiquement
    await assert.isNotPresentByCss('.angularjs-datetime-picker');
    // Récupère la date sélectionnée
    // eslint-disable-next-line no-return-assign
    await get.elementById('look-past-date-time').getAttribute('value').then(function (selectedDate) {
        selectedTimestamp = Number(moment(selectedDate, 'YYYY-MM-DD HH:mm:ss Z'));
    });
});

When('I open the diff of global properties between platform {string} and {string}', /** @this CustomWorld */ async function (fromPlatformName, toPlatformName) {
    const fromPlatformBuilder = this.platformHistory.findPlatformBuilderByName(fromPlatformName);
    const toPlatformBuilder = this.platformHistory.findPlatformBuilderByName(toPlatformName);
    await browser.get(api.buildDiffUrl(fromPlatformBuilder, toPlatformBuilder, globalPropertiesPath, globalPropertiesPath));
    await browser.waitForAngular();
});

Then(/^I get a new page with the global properties( stored values)? diff$/, /** @this CustomWorld */ async function (storedValues) {
    await navigate.toNewTab();
    const fromPlatformBuilder = this.platformHistory.platformBuilders[0];
    const toPlatformBuilder = this.platformHistory.platformBuilders[1];
    const expectedUrl = api.buildDiffUrl(fromPlatformBuilder, toPlatformBuilder, globalPropertiesPath, globalPropertiesPath, storedValues);
    await assert.currentUrlEquals(expectedUrl);
    await navigate.backToFirstTab();
});

Then('I get a new page with the global properties diff with timestamp', /** @this CustomWorld */ async function () {
    await navigate.toNewTab();
    const expectedUrl = api.buildDiffUrl(this.platformBuilder, this.platformBuilder, globalPropertiesPath, globalPropertiesPath, false, selectedTimestamp);
    await assert.currentUrlEquals(expectedUrl);
    await navigate.backToFirstTab();
});
