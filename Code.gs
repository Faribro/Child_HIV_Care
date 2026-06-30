/* ============================================================
   Code.gs  –  KoboToolbox ↔ Google Sheets Integration
   Child HIV Care & Nutrition Registry · v1 (2026-06)
   ============================================================ */

const CONFIG = {
  SHEET_NAME: "Child_Nutrition",
  TITLE_TEXT: "Child HIV Care & Nutrition Dashboard",
  KOBO_BASE_URL: "https://kf.kobotoolbox.org",
  KOBO_ASSET_UID: "aBVsisGciJgQPrwHsTvM98", // Configurable
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
    ["organization_email", "Organization Email"],
    
    ["__sync_needed", "Sync Needed"],
    ["__last_updated", "Last Updated"]
  ]
};

const DATA_COL_COUNT = CONFIG.COLUMN_MAP.length - CONFIG.HELPER_KEYS.length;

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Child Nutrition Registry')
    .addItem('One-Click Setup', 'oneClickSetupAll')
    .addSeparator()
    .addItem('🚀 Sync Kobo Data', 'pullAllKoboData')
    .addToUi();
}

/**
 * Perform one-click setup of sheets & triggers
 */
function oneClickSetupAll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
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
  
  SpreadsheetApp.getUi().alert('✅ Setup Complete', 'All spreadsheet structures initialized successfully!', SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Ensure sheet headers match the column mapping
 */
function ensureSheetSchema(sheet) {
  const numCols = CONFIG.COLUMN_MAP.length;
  
  // Clear layout if empty or raw
  if (sheet.getLastRow() < 3) {
    sheet.clear();
    
    // Title block
    sheet.getRange(1, 1, 1, numCols).merge().setValue(CONFIG.TITLE_TEXT);
    sheet.getRange(1, 1).setFontSize(16).setFontWeight('bold').setFontColor('#FFFFFF').setBackground('#1E3A8A').setHorizontalAlignment('center');
    sheet.setRowHeight(1, 45);
    
    // Headers list
    const headers = CONFIG.COLUMN_MAP.map(c => c[1]);
    sheet.getRange(3, 1, 1, numCols).setValues([headers]);
    sheet.getRange(3, 1, 1, numCols).setFontWeight('bold').setFontColor('#0F172A').setBackground('#F1F5F9').setHorizontalAlignment('center');
    sheet.setRowHeight(3, 28);
    sheet.setFrozenRows(3);
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
        'deleteRecord',
        'loginUser',
        'signupUser'
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

    // Default admin fallback
    if (lowerEmail === 'admin@cloudlogs.com' && password === 'admin') {
      sheet.appendRow(['admin@cloudlogs.com', hashPassword_('admin'), 'System Administrator', 'Admin', new Date().toISOString()]);
      return { success: true, email: 'admin@cloudlogs.com', name: 'System Administrator', role: 'Admin' };
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('User_Profiles');
  if (!sheet) {
    sheet = ss.insertSheet('User_Profiles');
    sheet.appendRow(['Email', 'PasswordHash', 'Name', 'Role', 'CreatedAt']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#1E3A8A').setFontColor('#FFFFFF');
    sheet.appendRow(['admin@cloudlogs.com', hashPassword_('admin'), 'System Administrator', 'Admin', new Date().toISOString()]);
    sheet.hideSheet();
  }
  return sheet;
}

function initAuditSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
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
    const ss = SpreadsheetApp.getActiveSpreadsheet();
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

function doGet() {
  return HtmlService.createHtmlOutput('<h3>Google Web App Active. Connect via Next.js proxy API client.</h3>');
}
