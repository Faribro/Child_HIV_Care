/* ============================================================
   Code.gs  –  KoboToolbox ↔ Google Sheets Integration
   Child HIV Care & Nutrition Registry · v1 (2026-06)
   ============================================================ */

const CONFIG = {
  SPREADSHEET_ID: "1YORdIKiIdSILyOekMJ5BCO5WCujoZ87U7H65x88HKkM",
  SHEET_NAME: "Child_Nutrition",
  TITLE_TEXT: "Child HIV Care & Nutrition Dashboard",
  KOBO_BASE_URL: "https://kf.kobotoolbox.org",
  KOBO_ASSET_UID: "aZ8JH6QMCCy9hXKP8nhdv2", // Configurable
  KOBO_API_TOKEN: "925b27fab79455080ec00c41d47a7dea97598e5c",
  HELPER_KEYS: ["__sync_needed", "__last_updated"],
  
  // Column Map: [internal_key, display_header]
  COLUMN_MAP: [
    ["_uuid", "UUID"],
    ["_id", "Kobo ID"],
    ["_submission_time", "Submission Time"],
    ["_submitted_by", "Submitted By"],
    
    ["consent_obtained", "Consent Obtained"],
    ["thumb_impression", "Signature / Thumb Impression"],
    ["visitdate", "Visit Date"],
    ["childname", "Child Name"],
    ["dateofbirth", "Date of Birth"],
    ["age_calc", "Calculated Age"],
    ["gender", "Gender"],
    ["orphanstatus", "Orphan Status"],
    ["caregivername", "Caregiver Full Name"],
    ["caregiverrelation", "Caregiver Relation"],
    ["caregivercontact", "Caregiver Contact"],
    ["address", "Address"],
    ["addressstate", "State"],
    ["addressdistrict", "District"],
    
    ["householdmembers", "Household Members"],
    ["noofchildren", "No of Children"],
    ["householdincomemonthly", "Monthly Income"],
    ["incomesource", "Income Source"],
    
    ["current_weight", "Current Weight (kg)"],
    ["current_height", "Current Height (cm)"],
    ["bmicalc", "BMI"],
    ["bmicategory", "BMI Category"],
    ["hemoglobin", "Hemoglobin (g/dL)"],
    ["hb_category", "Hb Category"],
    ["comorbidities", "Comorbidities"],
    ["comorbidities_other", "Comorbidities Other"],
    
    ["appetite", "Appetite"],
    ["mealsperday", "Meals per Day"],
    
    ["educationstatus", "Education Status"],
    ["educationstatus_other", "Education Status Other"],
    ["schoolname", "School Name"],
    ["School_Session_Start_Date", "School Session Start Date"],
    ["schooltype", "School Type"],
    ["currentclass", "Current Class"],
    ["attendancestatus", "Attendance Status"],
    
    // Expenses
    ["eduschoolfees", "School Fees"],
    ["private_tution_fee", "Private Tuition Fee"],
    ["edubooks", "School Books"],
    ["edustationery", "School Stationery"],
    ["eduuniform", "School Uniform"],
    ["edutransport", "School Transport"],
    ["eduother", "School Other Expenses"],
    ["edutotalannual", "Total Annual Education Cost"],
    ["school_fee_receipt", "School Fee Receipt Link"],
    ["marksheet_prev_year", "Marksheet Photo Link"],
    ["Remarks_If_Any", "Remarks (If Any)"],
    
    // Required support
    ["reqschoolfees", "Required School Fees"],
    ["reqbooks", "Required Books"],
    ["reqstationery", "Required Stationery"],
    ["requniform", "Required Uniform"],
    ["reqtransport", "Required Transport"],
    ["reqother", "Required Other Support"],
    ["reqtotalsupport", "Required Total Support"],
    
    ["reviewconfirmed", "Review Confirmed"],
    ["organization_name", "Organization Name"],
    ["Form_Submitted_by", "Form Submitted By"],
    ["organization_email", "Organization Email"],
    
    ["__sync_needed", "Sync Needed"],
    ["__last_updated", "Last Updated"]
  ]
};

const DATA_COL_COUNT = CONFIG.COLUMN_MAP.length - CONFIG.HELPER_KEYS.length;

function getSpreadsheet_() {
  if (CONFIG.SPREADSHEET_ID) {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Child Nutrition Registry')
    .addItem('📊 Open Dashboard', 'openDashboard')
    .addSeparator()
    .addItem('One-Click Setup', 'oneClickSetupAll')
    .addItem('🚀 Sync Kobo Data', 'pullAllKoboData')
    .addItem('🧹 Migrate Attachment Links', 'migrateExistingAttachmentFilenamesToDriveLinks')
    .addItem('🧹 Clean Choice Labels', 'cleanAllHistoricalSheetChoices')
    .addToUi();
}

/**
 * Perform one-click setup of sheets & triggers
 */
function oneClickSetupAll() {
  const ss = getSpreadsheet_();
  
  // 1. Setup primary sheet
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }
  ensureSheetSchema(sheet);
  
  // 2. Setup user database
  initProfilesSheet_();
  
  // 3. Setup audit logs
  initAuditSheet_();
  
  try {
    SpreadsheetApp.getUi().alert('✅ Setup Complete', 'All spreadsheet structures initialized successfully!', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    Logger.log('oneClickSetupAll completed (non-UI context)');
  }
  
  return { success: true, message: 'All spreadsheet structures initialized successfully!' };
}

/**
 * Migration function to insert missing columns in-place for active sheet with data
 */
function migrateSheetSchema() {
  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return { success: false, error: "Sheet not found" };
  
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  
  // Read current headers from row 3
  const currentHeaders = sheet.getRange(3, 1, 1, Math.max(lastCol, 1)).getValues()[0];
  
  // We want the headers to match CONFIG.COLUMN_MAP exactly
  const targetMap = CONFIG.COLUMN_MAP; // Array of [key, label]
  
  Logger.log("Current headers: " + JSON.stringify(currentHeaders));
  
  // Loop through target columns and compare
  for (let i = 0; i < targetMap.length; i++) {
    const [key, label] = targetMap[i];
    const colIndex = i + 1; // 1-based index in target sheet
    
    // Check if the current column at colIndex matches the target label
    const currentLabel = currentHeaders[colIndex - 1];
    if (currentLabel !== label) {
      Logger.log("Mismatch at column " + colIndex + ". Expected: " + label + ", Found: " + currentLabel);
      sheet.insertColumnBefore(colIndex);
      // Update our local currentHeaders array to reflect the insertion
      currentHeaders.splice(colIndex - 1, 0, label);
      // Set the header in the sheet
      sheet.getRange(3, colIndex).setValue(label);
      sheet.setColumnWidth(colIndex, 100); // Set default width
    }
  }
  
  // Re-write all headers on row 3 to be safe
  const allHeaders = targetMap.map(c => c[1]);
  sheet.getRange(3, 1, 1, allHeaders.length).setValues([allHeaders]);
  
  // Format row 3
  const numCols = targetMap.length;
  const headerRange = sheet.getRange(3, 1, 1, numCols);
  headerRange.setFontWeight('bold')
             .setFontColor('#0F172A')
             .setBackground('#F1F5F9')
             .setHorizontalAlignment('center')
             .setVerticalAlignment('middle')
             .setTextRotation(90);
  sheet.setRowHeight(3, 180);
  
  // Merge row 1 title block across all columns
  sheet.getRange(1, 1, 1, numCols).merge().setValue(CONFIG.TITLE_TEXT);
  
  return { success: true, message: "Migration completed successfully!" };
}

/**
 * Ensure sheet headers match the column mapping and rotate headers vertically
 */
function ensureSheetSchema(sheet) {
  const numCols = CONFIG.COLUMN_MAP.length;
  
  // Clear layout if empty or raw
  if (sheet.getLastRow() < 3) {
    sheet.clear();
    
    // Title block
    sheet.getRange(1, 1, 1, numCols).merge().setValue(CONFIG.TITLE_TEXT);
    sheet.getRange(1, 1).setFontSize(16).setFontWeight('bold').setFontColor('#FFFFFF').setBackground('#1E3A8A').setHorizontalAlignment('center').setVerticalAlignment('middle');
    sheet.setRowHeight(1, 45);
    
    // Blank spacer row 2
    sheet.setRowHeight(2, 15);
    
    // Headers list
    const headers = CONFIG.COLUMN_MAP.map(c => c[1]);
    const headerRange = sheet.getRange(3, 1, 1, numCols);
    headerRange.setValues([headers]);
    headerRange.setFontWeight('bold')
               .setFontColor('#0F172A')
               .setBackground('#F1F5F9')
               .setHorizontalAlignment('center')
               .setVerticalAlignment('middle')
               .setTextRotation(90); // Rotate vertically
    sheet.setRowHeight(3, 180); // Taller height to accommodate vertical text
    sheet.setFrozenRows(3);
    
    // Apply clean default column widths
    for (let c = 1; c <= numCols; c++) {
      const headerVal = headers[c - 1];
      if (headerVal === "UUID") {
        sheet.setColumnWidth(c, 100);
      } else if (headerVal === "Child Name" || headerVal === "Caregiver Full Name" || headerVal === "Address" || headerVal === "Signature / Thumb Impression") {
        sheet.setColumnWidth(c, 160);
      } else if (headerVal === "Kobo ID" || headerVal === "Submission Time" || headerVal === "Submitted By" || headerVal === "Date of Birth" || headerVal === "Last Updated") {
        sheet.setColumnWidth(c, 120);
      } else {
        sheet.setColumnWidth(c, 50); // Rotate headers allow narrow columns
      }
    }
  }
}

/**
 * Read all records from sheet for dashboard
 */
function getRecords() {
  try {
    const sheet = safeGetSheet_();
    const lastRow = sheet.getLastRow();
    const numCols = CONFIG.COLUMN_MAP.length;

    if (lastRow < 4) {
      return { success: true, records: [] };
    }

    const rawData = sheet.getRange(4, 1, lastRow - 3, numCols).getValues();
    const records = [];

    rawData.forEach((row, idx) => {
      const record = {};
      CONFIG.COLUMN_MAP.forEach(([key], i) => {
        let val = row[i];
        if (val instanceof Date) {
          val = !isNaN(val.getTime()) ? val.toISOString() : '';
        } else if (val === null || val === undefined) {
          val = '';
        }
        record[key] = val;
      });
      record.__rowNum = idx + 4;
      records.push(record);
    });

    return { success: true, records };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Retrieve aggregated stats and registry entries
 */
function getDashboardData() {
  try {
    const res = getRecords();
    if (!res.success) throw new Error(res.error);
    const records = res.records;
    
    const stats = {
      totalChildren: records.length,
      totalIncomeAvg: 0,
      avgWeight: 0,
      avgHeight: 0,
      severeAnaemiaCount: 0,
      severelyUnderweightCount: 0,
      educationStatusCounts: { school_going: 0, dropout: 0, never_enrolled: 0, other: 0 },
      states: {},
      districts: {}
    };

    if (records.length === 0) {
      return { success: true, stats, records: [] };
    }

    let incomeSum = 0;
    let weightSum = 0;
    let heightSum = 0;

    records.forEach(r => {
      incomeSum += Number(r.householdincomemonthly || 0);
      weightSum += Number(r.current_weight || 0);
      heightSum += Number(r.current_height || 0);

      const hb = Number(r.hemoglobin || 0);
      if (hb > 0 && hb < 7) stats.severeAnaemiaCount++;

      const bmi = Number(r.bmicalc || 0);
      if (bmi > 0 && bmi < 16) stats.severelyUnderweightCount++;

      const edu = r.educationstatus || 'other';
      if (stats.educationStatusCounts.hasOwnProperty(edu)) {
        stats.educationStatusCounts[edu]++;
      } else {
        stats.educationStatusCounts.other++;
      }

      const state = r.addressstate || 'Unknown';
      stats.states[state] = (stats.states[state] || 0) + 1;

      const district = r.addressdistrict || 'Unknown';
      stats.districts[district] = (stats.districts[district] || 0) + 1;
    });

    stats.totalIncomeAvg = Math.round(incomeSum / records.length);
    stats.avgWeight = parseFloat((weightSum / records.length).toFixed(1));
    stats.avgHeight = parseFloat((heightSum / records.length).toFixed(1));

    return { success: true, stats, records };
  } catch (e) {
    return { success: false, error: e.message, stats: {}, records: [] };
  }
}

/**
 * Edit / Create a child record
 */
function editRecord(uuid, updates) {
  try {
    const sheet = safeGetSheet_();
    let rowNum = findRowByUuid(sheet, uuid);
    const colMap = CONFIG.COLUMN_MAP.reduce((map, col, i) => { map[col[0]] = i; return map; }, {});
    const numCols = CONFIG.COLUMN_MAP.length;

    if (rowNum === -1) {
      // Append new row
      rowNum = Math.max(sheet.getLastRow() + 1, 4);
      const rowValues = Array(numCols).fill('');
      rowValues[colMap['_uuid']] = uuid;
      rowValues[colMap['_submission_time']] = new Date().toISOString();
      sheet.getRange(rowNum, 1, 1, numCols).setValues([rowValues]);
    }

    Object.keys(updates).forEach(key => {
      if (colMap.hasOwnProperty(key)) {
        const col = colMap[key] + 1;
        sheet.getRange(rowNum, col).setValue(updates[key]);
      }
    });

    // Helpers
    const lastUpdatedCol = colMap['__last_updated'] + 1;
    sheet.getRange(rowNum, lastUpdatedCol).setValue(new Date());
    
    const syncNeededCol = colMap['__sync_needed'] + 1;
    sheet.getRange(rowNum, syncNeededCol).setValue('false');

    formatDataRow(sheet, rowNum);
    writeAuditLog_('EDIT', uuid, `Modified child record: ${updates.childname || 'N/A'}`);

    return { success: true, message: 'Record updated successfully' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Delete a child record
 */
function deleteRecord(uuid) {
  try {
    const sheet = safeGetSheet_();
    const rowNum = findRowByUuid(sheet, uuid);
    if (rowNum === -1) throw new Error('Record not found');

    sheet.deleteRow(rowNum);
    writeAuditLog_('DELETE', uuid, `Deleted child record with UUID: ${uuid}`);
    return { success: true, message: 'Record deleted successfully' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * API Gateway routing method
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Empty POST payload.');
    }
    
    const postData = JSON.parse(e.postData.contents);
    
    if (postData && postData.functionName) {
      const funcName = postData.functionName;
      const args = postData.arguments || [];
      const sessionEmail = postData.sessionEmail || '';
      
      const whitelisted = [
        'getDashboardData',
        'getRecords',
        'editRecord',
        'addRecord',
        'deleteRecord',
        'loginUser',
        'signupUser',
        'getRecipientsList',
        'addEmailRecipient',
        'toggleEmailRecipient',
        'deleteEmailRecipient',
        'getScheduledReportConfig',
        'setScheduledReportConfig',
        'deleteUser',
        'oneClickSetupAll',
        'migrateSheetSchema'
      ];
      
      if (!whitelisted.includes(funcName)) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Unauthorized call' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      const result = this[funcName].apply(null, args);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      // Inbound Webhook from Kobo
      const result = handleSubmission(postData);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', row: result.row }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Auth & User Profiles
 */
function loginUser(email, password) {
  try {
    const sheet = initProfilesSheet_();
    const data = sheet.getDataRange().getValues();
    const lowerEmail = email.toLowerCase().trim();
    const hash = hashPassword_(password);

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().toLowerCase().trim() === lowerEmail) {
        if (data[i][1] === hash) {
          return { success: true, email: lowerEmail, name: data[i][2], role: data[i][3] };
        } else {
          return { success: false, error: 'Invalid password.' };
        }
      }
    }

    return { success: false, error: 'User email not found.' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function signupUser(email, password, name, role) {
  try {
    const sheet = initProfilesSheet_();
    const data = sheet.getDataRange().getValues();
    const lowerEmail = email.toLowerCase().trim();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().toLowerCase().trim() === lowerEmail) {
        return { success: false, error: 'Email already registered.' };
      }
    }

    sheet.appendRow([lowerEmail, hashPassword_(password), name.trim(), role, new Date().toISOString()]);
    writeAuditLog_('USER_SIGNUP', lowerEmail, `Registered user: ${name} (${role})`);
    return { success: true, message: 'Account created successfully!' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Helpers
 */
function safeGetSheet_() {
  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) throw new Error(`Registry sheet "${CONFIG.SHEET_NAME}" not found.`);
  return sheet;
}

function findRowByUuid(sheet, uuid) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 4) return -1;
  const uuids = sheet.getRange(4, 1, lastRow - 3, 1).getValues().map(r => r[0]);
  const idx = uuids.indexOf(uuid);
  return idx !== -1 ? idx + 4 : -1;
}

function formatDataRow(sheet, rowNum) {
  const numCols = CONFIG.COLUMN_MAP.length;
  const range = sheet.getRange(rowNum, 1, 1, numCols);
  range.setHorizontalAlignment('center').setVerticalAlignment('middle');
  sheet.getRange(rowNum, 1).setBackground(rowNum % 2 === 0 ? '#FFFFFF' : '#F9FAFB');
}

function initProfilesSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName('User_Profiles');
  if (!sheet) {
    sheet = ss.insertSheet('User_Profiles');
    sheet.appendRow(['Email', 'PasswordHash', 'Name', 'Role', 'CreatedAt']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#1E3A8A').setFontColor('#FFFFFF');
    sheet.hideSheet();
  }
  return sheet;
}

function initAuditSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName('Audit_Logs');
  if (!sheet) {
    sheet = ss.insertSheet('Audit_Logs');
    sheet.appendRow(['Timestamp', 'Action', 'User', 'Details']);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#1E3A8A').setFontColor('#FFFFFF');
    sheet.hideSheet();
  }
  return sheet;
}

function writeAuditLog_(action, user, details) {
  try {
    const ss = getSpreadsheet_();
    let sheet = ss.getSheetByName('Audit_Logs');
    if (!sheet) sheet = initAuditSheet_();
    sheet.appendRow([new Date().toISOString(), action, user, details]);
  } catch (e) {}
}

function hashPassword_(password) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password, Utilities.Charset.UTF_8);
  let hexString = '';
  for (let i = 0; i < digest.length; i++) {
    let byteVal = digest[i];
    if (byteVal < 0) byteVal += 256;
    let byteString = byteVal.toString(16);
    if (byteString.length == 1) byteString = '0' + byteString;
    hexString += byteString;
  }
  return hexString;
}

function doGet(e) {
  try {
    // Handle image proxy requests
    if (e && e.parameter && e.parameter.action === 'getImage' && e.parameter.fileId) {
      return getImageProxy(e.parameter.fileId);
    }
    
    // Handle PDF download requests
    if (e && e.parameter && e.parameter.action === 'downloadPDF' && e.parameter.rowNum) {
      var rowNum = parseInt(e.parameter.rowNum);
      var result = generateBeneficiaryPDF(rowNum);
      if (result.error) {
        return ContentService.createTextOutput('Error: ' + result.error)
          .setMimeType(ContentService.MimeType.TEXT);
      }
      return result.pdf;
    }

    // Handle Flowchart web app view
    if (e && e.parameter && e.parameter.action === 'flowchart') {
      var template = HtmlService.createTemplateFromFile('FlowchartDashboard');
      template.webAppUrl = ScriptApp.getService().getUrl();
      return template.evaluate()
        .setTitle('Data Pipeline & Sync Flowchart')
        .setSandboxMode(HtmlService.SandboxMode.IFRAME)
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    
    // Default dashboard response
    var template = HtmlService.createTemplateFromFile('index');
    template.webAppUrl = ScriptApp.getService().getUrl();
    return template.evaluate()
      .setTitle(CONFIG.TITLE_TEXT)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    return HtmlService.createHtmlOutput('Error loading dashboard: ' + err.message);
  }
}

/* ── DASHBOARD SERVER BINDINGS ──────────────────────────────── */

function openDashboard() {
  var html = HtmlService.createHtmlOutputFromFile('index')
    .setTitle('ChildCare Dashboard')
    .setWidth(1500)
    .setHeight(950);
  SpreadsheetApp.getUi().showModalDialog(html, 'ChildCare Dashboard');
}

function openFlowchartDashboard() {
  var html = HtmlService.createHtmlOutputFromFile('FlowchartDashboard')
    .setTitle('Data Pipeline & Sync Flowchart')
    .setWidth(1350)
    .setHeight(850);
  SpreadsheetApp.getUi().showModalDialog(html, 'Data Pipeline & Sync Flowchart');
}

function getNationalDashboardData() {
  var sheet = safeGetSheet_();
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 4 || lastCol < 1) return emptyDashboardPayload_();

  var data = sheet.getRange(4, 1, lastRow - 3, lastCol).getValues();

  function v(row, key) {
    var idx = safeColIndex_(key);
    return idx > 0 ? row[idx - 1] : '';
  }

  var rows = [];
  var metrics = {
    totalChildren: 0, underweightCount: 0, normalCount: 0,
    overweightCount: 0, obeseCount: 0, vlSuppressedCount: 0,
    vlDetectableCount: 0, attendanceRegular: 0, attendanceIrregular: 0,
    attendanceAbsent: 0, fundingRequested: 0, fundingDisbursed: 0,
    bmiAssessed: 0, schoolSupport: 0, vlTested: 0, bankSubmitted: 0,
    consentGiven: 0, consentNotGiven: 0
  };
  var stateAgg = {};
  var scatter = [];

  data.forEach(function(row) {
    var childName = String(v(row, 'childname') || '').trim();
    var uuid      = String(v(row, '_uuid')     || '').trim();
    if (!childName && !uuid) return;

    var state         = String(v(row, 'addressstate')    || '').trim();
    var district      = String(v(row, 'addressdistrict') || '').trim();
    var schoolName    = String(v(row, 'schoolname')      || '').trim();
    var className     = String(v(row, 'currentclass')    || '').trim();
    var gender        = String(v(row, 'gender')          || '').trim();
    var orphanStatus  = String(v(row, 'orphanstatus')    || '').trim();
    var bmiCategory   = String(v(row, 'bmicategory')     || '').trim();
    var bmi           = parseFloat(v(row, 'bmicalc'));
    var hemoglobin    = parseFloat(v(row, 'hemoglobin'));
    var vlCategory    = String(v(row, 'vl_category') || v(row, 'vlstatus') || '').trim();
    var attendance    = String(v(row, 'attendancestatus') || '').trim();
    var educationStatus = String(v(row, 'educationstatus') || '').trim();
    var schoolType = String(v(row, 'schooltype') || '').trim();
    var hbCategory = String(v(row, 'hb_category') || '').trim();
    var incomeSource = String(v(row, 'incomesource') || '').trim();
    var reqTotal      = parseFloat(v(row, 'reqtotalsupport')) || 0;
    var disbursed     = parseFloat(v(row, 'edutotalannual'))  || 0;
    var age           = v(row, 'age_calc');
    
    // Check if approved
    var approvedVal = v(row, 'approved_alliance_india') || v(row, 'reviewconfirmed');
    var approved = approvedVal === true || approvedVal === 'TRUE' || approvedVal === 'true' || approvedVal === 'Yes' || approvedVal === 'YES' || approvedVal === 'yes';
    
    var consent = String(v(row, 'consent_obtained') || '').trim().toLowerCase();
    if (consent === 'yes') {
      metrics.consentGiven++;
    } else if (consent === 'no') {
      metrics.consentNotGiven++;
    }

    metrics.totalChildren++;
    if (bmiCategory)                          metrics.bmiAssessed++;
    if (schoolName || educationStatus)        metrics.schoolSupport++;
    if (vlCategory)                           metrics.vlTested++;

    if      (/underweight/i.test(bmiCategory)) metrics.underweightCount++;
    else if (/normal/i.test(bmiCategory))      metrics.normalCount++;
    else if (/overweight/i.test(bmiCategory))  metrics.overweightCount++;
    else if (/obese/i.test(bmiCategory))       metrics.obeseCount++;

    if      (/suppressed|undetectable/i.test(vlCategory))       metrics.vlSuppressedCount++;
    else if (/less_than_1000|detectable|high|unsuppressed/i.test(vlCategory))  metrics.vlDetectableCount++;

    if      (/regular|present|good/i.test(attendance))   metrics.attendanceRegular++;
    else if (/irregular|partial/i.test(attendance))      metrics.attendanceIrregular++;
    else if (/absent|drop/i.test(attendance))            metrics.attendanceAbsent++;

    metrics.fundingRequested += reqTotal;
    metrics.fundingDisbursed += disbursed;

    if (!stateAgg[state]) stateAgg[state] = { state: state || 'Unknown', total: 0, bmiSum: 0, bmiCount: 0, vlSuppressed: 0 };
    stateAgg[state].total++;
    if (!isNaN(bmi)) { stateAgg[state].bmiSum += bmi; stateAgg[state].bmiCount++; }
    if (/suppressed|undetectable/i.test(vlCategory)) stateAgg[state].vlSuppressed++;

    if (!isNaN(bmi) && !isNaN(hemoglobin)) scatter.push({ x: bmi, y: hemoglobin });

    var riskLevel = 'normal';
    if (/underweight|obese/i.test(bmiCategory) || /detectable|high|unsuppressed/i.test(vlCategory)) riskLevel = 'high';
    else if (/normal/i.test(bmiCategory) && /suppressed|undetectable/i.test(vlCategory)) riskLevel = 'low';
    else riskLevel = 'medium';

    rows.push({
      uuid: uuid, childName: childName, state: state, district: district,
      schoolName: schoolName, className: className, gender: gender,
      orphanStatus: orphanStatus, bmiCategory: bmiCategory || 'Unknown',
      bmi: isNaN(bmi) ? '' : bmi.toFixed(1),
      hemoglobin: isNaN(hemoglobin) ? '' : hemoglobin.toFixed(1),
      vlCategory: vlCategory || 'Unknown', educationStatus: educationStatus,
      attendance: attendance, age: age || '', riskLevel: riskLevel,
      approved: approved,
      schoolType: schoolType,
      consent: consent,
      hbCategory: hbCategory,
      incomeSource: incomeSource,
      docPhotoLink: String(v(row, 'marksheet_prev_year') || '').trim(),
      docAadhaarLink: String(v(row, 'school_fee_receipt') || '').trim(),
      docPassbookLink: String(v(row, 'thumb_impression') || '').trim()
    });
  });

  var stateSummary = Object.keys(stateAgg).sort().map(function(k) {
    var s = stateAgg[k];
    return {
      state: s.state, total: s.total,
      avgBmi: s.bmiCount ? (s.bmiSum / s.bmiCount).toFixed(1) : '0.0',
      vlSuppressedRate: s.total ? Math.round((s.vlSuppressed / s.total) * 100) : 0
    };
  });

  return {
    syncedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MMM-yyyy HH:mm'),
    metrics: addDerivedDashboardMetrics_(metrics),
    rows: rows,
    trend: buildDashboardTrend_(data),
    scatter: scatter,
    stateSummary: stateSummary.slice(0, 12),
    warnings: buildDashboardWarnings_(rows, metrics)
  };
}

function getChildByUuid(uuid) {
  try {
    if (!uuid || String(uuid).trim() === '' || String(uuid).trim() === 'undefined') return null;
    var sheet = safeGetSheet_();
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow < 4 || lastCol < 1) return null;

    var data = sheet.getRange(4, 1, lastRow - 3, lastCol).getValues();
    
    function v(row, key) {
      var idx = safeColIndex_(key);
      return idx > 0 ? String(row[idx - 1] || '').trim() : '';
    }

    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var rowUuid = String(v(row, '_uuid') || '').trim();
      if (rowUuid === String(uuid).trim() && rowUuid !== '') {
        var childData = {};
        CONFIG.COLUMN_MAP.forEach(([key, label]) => {
          childData[key] = {
            value: v(row, key),
            label: label
          };
        });
        childData._rowNumber = i + 4;
        return childData;
      }
    }
    return null;
  } catch (err) {
    Logger.log("getChildByUuid ERROR: " + err.message);
    return null;
  }
}

function saveChildData(uuid, updatedData) {
  try {
    var sheet = safeGetSheet_();
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow < 4 || lastCol < 1) return false;
    
    var headers = CONFIG.COLUMN_MAP.map(c => c[0]);
    var data = sheet.getRange(4, 1, lastRow - 3, lastCol).getValues();
    
    var uuidColIdx = headers.indexOf('_uuid');
    if (uuidColIdx === -1) return false;
    
    for (var i = 0; i < data.length; i++) {
      var rowUuid = String(data[i][uuidColIdx] || '').trim();
      if (rowUuid === uuid) {
        var rowNumber = i + 4;
        for (var key in updatedData) {
          var colIndex = headers.indexOf(key);
          if (colIndex !== -1) {
            sheet.getRange(rowNumber, colIndex + 1).setValue(updatedData[key]);
          }
        }
        return true;
      }
    }
    return false;
  } catch (err) {
    Logger.log('saveChildData ERROR: ' + err.message);
    return false;
  }
}

function approveChildByUuid(uuid) {
  try {
    var sheet = safeGetSheet_();
    var rowNum = findRowByUuid(sheet, uuid);
    if (rowNum < 4) return { success: false, error: "Child not found" };
    
    var approvedCol = safeColIndex_("reviewconfirmed");
    if (approvedCol < 1) return { success: false, error: "Approved column not found" };
    
    sheet.getRange(rowNum, approvedCol).setValue("yes");
    return { success: true, message: "Child approved successfully" };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function deleteChildByUuid(uuid) {
  try {
    var sheet = safeGetSheet_();
    var rowNum = findRowByUuid(sheet, uuid);
    if (rowNum < 4) throw new Error("Child not found with UUID: " + uuid);
    
    var childNameColIdx = safeColIndex_("childname");
    var childName = childNameColIdx > 0 ? String(sheet.getRange(rowNum, childNameColIdx).getValue() || "").trim() : "Child";
    
    // 1. Delete PDF/receipts from drive if possible (we keep it simple here)
    // 2. Delete row from Sheet
    sheet.deleteRow(rowNum);
    
    return {
      success: true,
      childName: childName,
      koboDeleted: false
    };
  } catch (err) {
    Logger.log("deleteChildByUuid ERROR: " + err.message);
    throw err;
  }
}

function getPDFDownloadUrl(uuid) {
  return "Error: PDF download is currently disabled for this instance.";
}

function generateBeneficiaryPDF(rowNum) {
  return { error: "PDF generation is disabled" };
}

function getImageProxy(fileId) {
  try {
    var file = DriveApp.getFileById(fileId);
    var blob = file.getBlob();
    var bytes = blob.getBytes();
    var mimeType = blob.getContentType();
    return ContentService.createTextOutput()
      .setContent(Utilities.base64Encode(bytes))
      .setMimeType(mimeType);
  } catch(e) {
    return ContentService.createTextOutput('Error loading image: ' + e.message)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

/* ── ATTACHMENT DOWNLOAD & SAVE TO DRIVE HELPERS ─────────────── */

var ATTACHMENT_CONFIG = {
  thumb: {
    koboKey      : "thumb_impression",
    xpathPatterns: ["grp_consent/thumb_impression", "thumb_impression"]
  },
  receipt: {
    koboKey      : "school_fee_receipt",
    xpathPatterns: ["grp_main/grp_edu_current/school_fee_receipt", "school_fee_receipt"]
  },
  marksheet: {
    koboKey      : "marksheet_prev_year",
    xpathPatterns: ["grp_main/grp_edu_current/marksheet_prev_year", "marksheet_prev_year"]
  }
};
var ATTACHMENT_ROLES = ["thumb", "receipt", "marksheet"];

function writeAttachmentLinks_(sheet, rowNum, raw) {
  var links = extractAttachmentLinks_(raw);
  var c = {
    thumb    : safeColIndex_("thumb_impression"),
    receipt  : safeColIndex_("school_fee_receipt"),
    marksheet: safeColIndex_("marksheet_prev_year")
  };
  
  var driveUrls = {
    thumb: downloadAndSaveToDrive_(links.thumb, "signature", rowNum),
    receipt: downloadAndSaveToDrive_(links.receipt, "receipt", rowNum),
    marksheet: downloadAndSaveToDrive_(links.marksheet, "marksheet", rowNum)
  };
  
  if (c.thumb     > 0 && driveUrls.thumb)     sheet.getRange(rowNum, c.thumb).setValue(driveUrls.thumb);
  if (c.receipt   > 0 && driveUrls.receipt)   sheet.getRange(rowNum, c.receipt).setValue(driveUrls.receipt);
  if (c.marksheet > 0 && driveUrls.marksheet) sheet.getRange(rowNum, c.marksheet).setValue(driveUrls.marksheet);
}

function downloadAndSaveToDrive_(koboUrl, fileType, rowNum) {
  if (!koboUrl) return "";
  if (koboUrl.indexOf('drive.google.com') !== -1) return koboUrl;
  
  try {
    var res = UrlFetchApp.fetch(koboUrl, {
      method: "get",
      headers: { Authorization: "Token " + CONFIG.KOBO_API_TOKEN },
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    var code = res.getResponseCode();
    if (code >= 400) return "";
    
    var blob = res.getBlob();
    var mimeType = blob.getContentType() || "image/png";
    var folderName = "ChildCare Attachments";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    
    var ext = mimeType.split("/")[1] || "png";
    var filename = "row" + rowNum + "_" + fileType + "_" + Date.now() + "." + ext;
    var file = folder.createFile(blob.setName(filename));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return "https://drive.google.com/uc?export=view&id=" + file.getId();
  } catch (e) {
    Logger.log("downloadAndSaveToDrive_ ERROR: " + e.message);
    return "";
  }
}

function extractAttachmentLinks_(raw) {
  var out  = { thumb:"", receipt:"", marksheet:"" };
  var atts = [];
  if (raw && Array.isArray(raw._attachments))                         atts = raw._attachments;
  else if (raw && raw.submission && Array.isArray(raw.submission._attachments))
                                                                      atts = raw.submission._attachments;
  if (!atts.length) return out;

  var byPath = {};
  atts.forEach(function(a) {
    if (!a || !a.question_xpath) return;
    byPath[a.question_xpath] = a;
    var short = a.question_xpath.split("/").pop();
    if (short && !byPath[short]) byPath[short] = a;
  });

  ATTACHMENT_ROLES.forEach(function(role) {
    var cfg = ATTACHMENT_CONFIG[role];
    if (!cfg || !Array.isArray(cfg.xpathPatterns)) return;
    for (var i=0; i<cfg.xpathPatterns.length; i++) {
      var a = byPath[cfg.xpathPatterns[i]];
      if (a) { out[role] = a.download_url || a.download_medium_url || a.download_small_url || ""; break; }
    }
  });

  return out;
}

function migrateExistingAttachmentFilenamesToDriveLinks() {
  var sheet = safeGetSheet_();
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 4) return "No data to migrate";
  
  var headers = sheet.getRange(3, 1, 1, lastCol).getValues()[0];
  var uuidColIdx = headers.indexOf('UUID');
  var thumbColIdx = headers.indexOf('Signature / Thumb Impression');
  var receiptColIdx = headers.indexOf('School Fee Receipt Link');
  var marksheetColIdx = headers.indexOf('Marksheet Photo Link');
  
  if (uuidColIdx === -1) return "UUID column not found";
  
  var data = sheet.getRange(4, 1, lastRow - 3, lastCol).getValues();
  var updatedCount = 0;
  
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var uuid = String(row[uuidColIdx] || '').trim();
    if (!uuid) continue;
    
    var rowNum = i + 4;
    var rowUpdated = false;
    
    // Signature / Thumb
    var thumbVal = thumbColIdx !== -1 ? String(row[thumbColIdx] || '').trim() : '';
    var isThumbRaw = thumbVal && !thumbVal.startsWith('http');
    
    // Receipt
    var receiptVal = receiptColIdx !== -1 ? String(row[receiptColIdx] || '').trim() : '';
    var isReceiptRaw = receiptVal && !receiptVal.startsWith('http');
    
    // Marksheet
    var marksheetVal = marksheetColIdx !== -1 ? String(row[marksheetColIdx] || '').trim() : '';
    var isMarksheetRaw = marksheetVal && !marksheetVal.startsWith('http');
    
    if (isThumbRaw || isReceiptRaw || isMarksheetRaw) {
      try {
        var sub = _fetchKoboSubmissionByUuid(uuid);
        if (sub) {
          var links = extractAttachmentLinks_(sub);
          
          if (isThumbRaw && links.thumb && thumbColIdx !== -1) {
            var driveUrl = downloadAndSaveToDrive_(links.thumb, "signature", rowNum);
            if (driveUrl) {
              sheet.getRange(rowNum, thumbColIdx + 1).setValue(driveUrl);
              rowUpdated = true;
            }
          }
          if (isReceiptRaw && links.receipt && receiptColIdx !== -1) {
            var driveUrl = downloadAndSaveToDrive_(links.receipt, "receipt", rowNum);
            if (driveUrl) {
              sheet.getRange(rowNum, receiptColIdx + 1).setValue(driveUrl);
              rowUpdated = true;
            }
          }
          if (isMarksheetRaw && links.marksheet && marksheetColIdx !== -1) {
            var driveUrl = downloadAndSaveToDrive_(links.marksheet, "marksheet", rowNum);
            if (driveUrl) {
              sheet.getRange(rowNum, marksheetColIdx + 1).setValue(driveUrl);
              rowUpdated = true;
            }
          }
        }
      } catch (err) {
        Logger.log("Failed row " + rowNum + ": " + err.message);
      }
      if (rowUpdated) updatedCount++;
    }
  }
  
  return "Successfully migrated raw links in " + updatedCount + " rows.";
}

function _fetchKoboSubmissionByUuid(uuid) {
  var cleanUuid = uuid.replace(/^uuid:/, "");
  var queryObj = { "_uuid": cleanUuid };
  var url = CONFIG.KOBO_BASE_URL + "/api/v2/assets/" + CONFIG.KOBO_ASSET_UID + "/data/?format=json&limit=1&query=" + encodeURIComponent(JSON.stringify(queryObj));
  
  var options = {
    method: "get",
    headers: { "Authorization": "Token " + CONFIG.KOBO_API_TOKEN },
    muteHttpExceptions: true
  };
  
  var response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() === 200) {
    var json = JSON.parse(response.getContentText());
    var results = json.results || [];
    return results.length > 0 ? results[0] : null;
  }
  return null;
}

function safeColIndex_(key) {
  const idx = CONFIG.COLUMN_MAP.findIndex(col => col[0] === key);
  return idx !== -1 ? idx + 1 : -1;
}

function getOrCreateFolder(parentFolder, folderName) {
  var folders = parentFolder.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : parentFolder.createFolder(folderName);
}

/* ── DASHBOARD AGGREGATORS & EMPTY STATE FALLBACKS ───────────── */

function addDerivedDashboardMetrics_(m) {
  var total = Math.max(m.totalChildren || 0, 1);
  m.underweightRate    = Math.round((m.underweightCount   / total) * 100);
  m.vlSuppressedRate   = Math.round((m.vlSuppressedCount  / total) * 100);
  m.goodAttendanceCount = m.attendanceRegular;
  m.goodAttendanceRate  = Math.round((m.attendanceRegular / total) * 100);
  return m;
}

function buildDashboardTrend_(data) {
  var byMonth = {};
  function keyFromDate(val) {
    if (!val) return null;
    var d = (val instanceof Date) ? val : new Date(val);
    if (isNaN(d.getTime())) return null;
    return Utilities.formatDate(d, Session.getScriptTimeZone(), 'MMM yyyy');
  }
  data.forEach(function(row) {
    var dateVal = row[safeColIndex_('visitdate') - 1];
    var k = keyFromDate(dateVal);
    if (!k) return;
    if (!byMonth[k]) byMonth[k] = { bmi: [], attendance: [] };
    var bmi = parseFloat(row[safeColIndex_('bmicalc') - 1]);
    if (!isNaN(bmi)) byMonth[k].bmi.push(bmi);
    var att = String(row[safeColIndex_('attendancestatus') - 1] || '').toLowerCase();
    if (/regular|present|good/.test(att))   byMonth[k].attendance.push(1);
    else if (/irregular|partial/.test(att)) byMonth[k].attendance.push(0.5);
    else if (/absent|drop/.test(att))       byMonth[k].attendance.push(0);
  });
  var labels = Object.keys(byMonth);
  return {
    labels: labels,
    avgBmi: labels.map(function(k) {
      var arr = byMonth[k].bmi;
      return arr.length ? +(arr.reduce(function(a,b){return a+b;},0)/arr.length).toFixed(1) : 0;
    }),
    attendance: labels.map(function(k) {
      var arr = byMonth[k].attendance;
      return arr.length ? Math.round((arr.reduce(function(a,b){return a+b;},0)/arr.length)*100) : 0;
    })
  };
}

function buildDashboardWarnings_(rows, metrics) {
  var out = [];
  rows.forEach(function(r) {
    if (r.riskLevel === 'high') out.push({
      severity: 'high',
      title: r.childName + ' needs priority review',
      detail: [r.state, r.district, r.bmiCategory, r.vlCategory].filter(Boolean).join(' - ')
    });
  });
  if (metrics.attendanceAbsent > 0) out.push({
    severity: 'medium', title: 'Attendance gaps detected',
    detail: metrics.attendanceAbsent + ' records indicate absenteeism or dropout risk.'
  });
  if (metrics.underweightCount > 0) out.push({
    severity: 'medium', title: 'Nutrition risk cluster',
    detail: metrics.underweightCount + ' children are marked underweight.'
  });
  return out.slice(0, 24);
}

function emptyDashboardPayload_() {
  return {
    syncedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MMM-yyyy HH:mm'),
    metrics: addDerivedDashboardMetrics_({
      totalChildren:0, underweightCount:0, normalCount:0, overweightCount:0, obeseCount:0,
      vlSuppressedCount:0, vlDetectableCount:0, attendanceRegular:0, attendanceIrregular:0,
      attendanceAbsent:0, fundingRequested:0, fundingDisbursed:0, bmiAssessed:0, schoolSupport:0, vlTested:0,
      consentGiven:0, consentNotGiven:0
    }),
    rows: [], trend: { labels:[], avgBmi:[], attendance:[] },
    scatter: [], stateSummary: [], warnings: []
  };
}

// ── Add new record (from VoiceForm) ─────────────────────────────
function addRecord(uuid, recordData) {
  try {
    const sheet = safeGetSheet_();
    const existing = findRowByUuid(sheet, uuid);
    if (existing !== -1) return editRecord(uuid, recordData);

    const rowValues = CONFIG.COLUMN_MAP.map(([key]) => {
      const val = recordData[key];
      return (val === undefined || val === null) ? '' : val;
    });
    const newRow = Math.max(sheet.getLastRow() + 1, 4);
    sheet.getRange(newRow, 1, 1, rowValues.length).setValues([rowValues]);
    formatDataRow(sheet, newRow);
    writeAuditLog_('ADD_RECORD', recordData._submitted_by || 'system', `New child record: ${recordData.childname || uuid}`);
    return { success: true, row: newRow };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── Recipients Sheet ─────────────────────────────────────────────
function getRecipientsList() {
  try {
    const ss = getSpreadsheet_();
    let sheet = ss.getSheetByName('Email_Recipients');
    if (!sheet) {
      sheet = ss.insertSheet('Email_Recipients');
      sheet.appendRow(['Email', 'Name', 'Status', 'DateAdded']);
      sheet.getRange(1,1,1,4).setFontWeight('bold').setBackground('#1E3A8A').setFontColor('#FFFFFF');
      sheet.hideSheet();
      return { success: true, recipients: [] };
    }
    const data = sheet.getDataRange().getValues();
    const recipients = data.slice(1).filter(r => r[0]).map(r => ({
      email: r[0], name: r[1], status: r[2] || 'Active', dateAdded: r[3] ? r[3].toString() : ''
    }));
    return { success: true, recipients };
  } catch (e) { return { success: false, error: e.message }; }
}

function addEmailRecipient(email, name) {
  try {
    const ss = getSpreadsheet_();
    let sheet = ss.getSheetByName('Email_Recipients');
    if (!sheet) { getRecipientsList(); sheet = ss.getSheetByName('Email_Recipients'); }
    sheet.appendRow([email.toLowerCase().trim(), name.trim(), 'Active', new Date().toISOString()]);
    return { success: true };
  } catch (e) { return { success: false, error: e.message }; }
}

function toggleEmailRecipient(email, status) {
  try {
    const ss = getSpreadsheet_();
    const sheet = ss.getSheetByName('Email_Recipients');
    if (!sheet) return { success: false, error: 'Recipients sheet not found.' };
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().toLowerCase() === email.toLowerCase()) {
        sheet.getRange(i + 1, 3).setValue(status);
        return { success: true };
      }
    }
    return { success: false, error: 'Recipient not found.' };
  } catch (e) { return { success: false, error: e.message }; }
}

function deleteEmailRecipient(email) {
  try {
    const ss = getSpreadsheet_();
    const sheet = ss.getSheetByName('Email_Recipients');
    if (!sheet) return { success: false, error: 'Recipients sheet not found.' };
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().toLowerCase() === email.toLowerCase()) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    return { success: false, error: 'Recipient not found.' };
  } catch (e) { return { success: false, error: e.message }; }
}

// ── Report Config ────────────────────────────────────────────────
function getScheduledReportConfig() {
  try {
    const props = PropertiesService.getScriptProperties();
    return {
      success: true,
      enabled: props.getProperty('report_enabled') === 'true',
      emailList: props.getProperty('report_email_list') || '',
      frequency: props.getProperty('report_frequency') || 'weekly'
    };
  } catch (e) { return { success: false, error: e.message }; }
}

function setScheduledReportConfig(config) {
  try {
    const props = PropertiesService.getScriptProperties();
    props.setProperty('report_enabled', config.enabled ? 'true' : 'false');
    props.setProperty('report_email_list', config.emailList || '');
    props.setProperty('report_frequency', config.frequency || 'weekly');
    return { success: true };
  } catch (e) { return { success: false, error: e.message }; }
}

function deleteUser(email) {
  try {
    const ss = getSpreadsheet_();
    const sheet = ss.getSheetByName('User_Profiles');
    if (!sheet) return { success: false, error: 'Profiles sheet not found.' };
    const data = sheet.getDataRange().getValues();
    const lowerEmail = email.toLowerCase().trim();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().toLowerCase().trim() === lowerEmail) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'User deleted successfully.' };
      }
    }
    return { success: false, error: 'User not found.' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function cleanChoiceValue(key, val) {
  if (!val || typeof val !== 'string') return val;
  
  const choiceKeys = [
    'consent_obtained', 'gender', 'orphanstatus', 'caregiverrelation', 
    'incomesource', 'appetite', 'mealsperday', 'educationstatus', 'schooltype', 
    'attendancestatus', 'reviewconfirmed', 'bmicategory', 'vlstatus', 'vl_category'
  ];
  
  if (choiceKeys.indexOf(key) !== -1) {
    if (/^[a-z0-9_]+$/.test(val)) {
      return val.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  }
  return val;
}

function cleanAllHistoricalSheetChoices() {
  try {
    var sheet = safeGetSheet_();
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow < 4) return "No data to clean";
    
    var headers = sheet.getRange(3, 1, 1, lastCol).getValues()[0];
    var dataRange = sheet.getRange(4, 1, lastRow - 3, lastCol);
    var values = dataRange.getValues();
    var updatedCount = 0;
    
    for (var r = 0; r < values.length; r++) {
      var row = values[r];
      var rowUpdated = false;
      for (var c = 0; c < headers.length; c++) {
        var headerLabel = headers[c];
        var colPair = CONFIG.COLUMN_MAP.find(pair => pair[1] === headerLabel);
        if (colPair) {
          var key = colPair[0];
          var val = row[c];
          var cleaned = cleanChoiceValue(key, val);
          if (cleaned !== val) {
            row[c] = cleaned;
            rowUpdated = true;
          }
        }
      }
      if (rowUpdated) updatedCount++;
    }
    
    if (updatedCount > 0) {
      dataRange.setValues(values);
    }
    return "Cleaned choice values in " + updatedCount + " rows successfully.";
  } catch (err) {
    Logger.log("cleanAllHistoricalSheetChoices ERROR: " + err.message);
    return "Error: " + err.message;
  }
}
