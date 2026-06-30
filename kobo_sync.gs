/**
   ============================================================
   kobo_sync.gs  –  Kobo Data Synchronizer
   ============================================================
 */

/**
 * Pull all data from Kobo Toolbox to fill sheet
 */
function pullAllKoboData() {
  let ui = null;
  try {
    ui = SpreadsheetApp.getUi();
  } catch (e) {}

  if (ui) {
    const res = ui.alert(
      '📥 Pull All Kobo Data',
      'This will pull all existing submissions from KoboToolbox and update/add rows in the sheet.\n\nContinue?',
      ui.ButtonSet.YES_NO
    );
    if (res !== ui.Button.YES) return;
  }

  try {
    Logger.log('📥 Starting Kobo data pull');
    const sheet = safeGetSheet_();
    ensureSheetSchema(sheet);

    const submissions = _fetchAllKoboSubmissions();
    Logger.log(`📥 Retrieved ${submissions.length} submissions from Kobo`);

    let addedCount = 0;
    let updatedCount = 0;

    for (let i = 0; i < submissions.length; i++) {
      const sub = submissions[i];
      const uuid = sub._uuid || sub.uuid || (sub.meta && sub.meta.instanceID) || '';
      
      if (!uuid) continue;

      const rowValues = buildRowFromWebhook_(sub);
      let rowNum = findRowByUuid(sheet, uuid);

      if (rowNum === -1) {
        rowNum = Math.max(sheet.getLastRow() + 1, 4);
        addedCount++;
      } else {
        updatedCount++;
      }

      sheet.getRange(rowNum, 1, 1, rowValues.length).setValues([rowValues]);
      formatDataRow(sheet, rowNum);
    }

    if (ui) {
      ui.alert(
        '✅ Pull Complete',
        `Data sync finished successfully:\n- Added: ${addedCount} entries\n- Updated: ${updatedCount} entries`,
        ui.ButtonSet.OK
      );
    }
  } catch (e) {
    Logger.log('❌ pullAllKoboData failed: ' + e.message);
    if (ui) ui.alert('❌ Pull Failed', e.message, ui.ButtonSet.OK);
  }
}

/**
 * Paginate fetch Kobo submissions
 */
function _fetchAllKoboSubmissions() {
  const allResults = [];
  let url = `${CONFIG.KOBO_BASE_URL}/api/v2/assets/${CONFIG.KOBO_ASSET_UID}/data/?format=json&limit=1000`;
  let page = 0;

  while (url) {
    page++;
    Logger.log(`Fetching page ${page} from Kobo...`);

    const options = {
      method: 'get',
      headers: {
        'Authorization': `Token ${CONFIG.KOBO_API_TOKEN}`
      },
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() !== 200) {
      throw new Error(`Kobo API error (${response.getResponseCode()}): ${response.getContentText()}`);
    }

    const json = JSON.parse(response.getContentText());
    const results = json.results || [];
    allResults.push(...results);

    url = json.next || null;
  }

  return allResults;
}
