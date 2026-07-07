/**
   ============================================================
   webhook_functions.gs  –  Kobo Webhook Parser
   ============================================================
 */

/**
 * Handle inbound submissions from Kobo webhooks
 */
/**
 * Handle inbound submissions from Kobo webhooks
 */
function handleSubmission(payload) {
  try {
    Logger.log('📥 handleSubmission payload: ' + JSON.stringify(payload));
    const sheet = safeGetSheet_();
    
    const uuid = payload._uuid || payload.uuid || (payload.meta && payload.meta.instanceID) || '';
    if (!uuid) {
      throw new Error('Missing UUID in webhook payload');
    }
    
    let rowNum = findRowByUuid(sheet, uuid);
    if (rowNum === -1) {
      const rowValues = buildRowFromWebhook_(payload);
      rowNum = Math.max(sheet.getLastRow() + 1, 4);
      Logger.log(`Adding new webhook entry at row: ${rowNum}`);
      sheet.getRange(rowNum, 1, 1, rowValues.length).setValues([rowValues]);
      formatDataRow(sheet, rowNum);
      try {
        writeAttachmentLinks_(sheet, rowNum, payload);
      } catch (attErr) {
        Logger.log(`Failed to process attachments on webhook: ${attErr.message}`);
      }
      writeAuditLog_('WEBHOOK_SUBMIT', uuid, `Processed new webhook entry for child: ${payload.childname || 'N/A'}`);
    } else {
      Logger.log(`Webhook entry with UUID ${uuid} already exists at row ${rowNum}. Skipping to avoid overwriting manually updated values.`);
    }
    
    return { success: true, row: rowNum };
  } catch (e) {
    Logger.log('❌ Error in handleSubmission: ' + e.message);
    throw e;
  }
}

/**
 * Generic recursive builder mapping webhook JSON to COLUMN_MAP columns
 */
function buildRowFromWebhook_(raw) {
  Logger.log('=== buildRowFromWebhook_ starting ===');
  const row = [];
  
  CONFIG.COLUMN_MAP.forEach(([key]) => {
    let val = '';
    
    // Try multiple keys in raw payload
    const possibleKeys = [
      key,
      `grp_consent/${key}`,
      `grp_main/${key}`,
      `grp_main/grp_demographics/${key}`,
      `grp_main/grp_financial/${key}`,
      `grp_main/grp_clinical/${key}`,
      `grp_main/grp_nutrition/${key}`,
      `grp_main/grp_education/${key}`,
      `grp_main/grp_education/grp_edu_current/${key}`,
      `grp_main/grp_education/grp_edu_req/${key}`,
      `grp_main/grp_edu_current/${key}`,
      `grp_main/grp_edu_req/${key}`,
      `grp_main/grp_review/${key}`,
      `grp_main/grp_review/grp_final_review/${key}`,
      `grp_main/grp_final_review/${key}`,
      `grp_review/${key}`,
      `grp_final_review/${key}`
    ];
    
    for (let i = 0; i < possibleKeys.length; i++) {
      const pk = possibleKeys[i];
      if (raw.hasOwnProperty(pk) && raw[pk] !== undefined && raw[pk] !== null) {
        val = raw[pk];
        break;
      }
      
      // Handle nested slash paths
      if (pk.includes('/')) {
        const parts = pk.split('/');
        let current = raw;
        let found = true;
        for (let j = 0; j < parts.length; j++) {
          if (current && typeof current === 'object' && current.hasOwnProperty(parts[j])) {
            current = current[parts[j]];
          } else {
            found = false;
            break;
          }
        }
        if (found && current !== undefined && current !== null) {
          val = current;
          break;
        }
      }
    }
    
    // System fields overrides (only apply to their exact keys)
    if (key === '_uuid') {
      val = val || raw['uuid'] || raw['_uuid'] || (raw.meta && raw.meta.instanceID) || '';
    }
    if (key === '_id') {
      val = val || raw['_id'] || raw['id'] || '';
    }
    if (key === '_submission_time') {
      val = val || raw['_submission_time'] || raw['submission_time'] || new Date().toISOString();
    }
    if (key === '_submitted_by') {
      val = val || raw['_submitted_by'] || raw['submitted_by'] || 'Kobo Webhook';
    }
    if (key === '__sync_needed') {
      val = 'false';
    }
    if (key === '__last_updated') {
      val = new Date().toISOString();
    }
    
    row.push(cleanChoiceValue(key, val));
  });
  
  return row;
}

function getLastDataRow(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 4) return 3;
  return lastRow;
}
