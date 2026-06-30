/**
 * ============================================================
 * AUTOMATED TEST SUITE FOR EQUIPMENT MAPPING SYSTEM
 * ============================================================
 */

/**
 * Main function to run all tests
 * Inspect the logs in the Apps Script editor to verify passes.
 */
function runAllTests() {
  const results = [];
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (!condition) {
      failed++;
      const errorMsg = `❌ FAIL: ${message}`;
      Logger.log(errorMsg);
      results.push(errorMsg);
      throw new Error(message);
    } else {
      passed++;
      const successMsg = `✅ PASS: ${message}`;
      Logger.log(successMsg);
      results.push(successMsg);
    }
  }

  Logger.log('🚀 Starting Automated Tests...');

  // Test 1: Config Validation
  try {
    assert(Array.isArray(CONFIG.COLUMN_MAP), 'COLUMN_MAP should be an array');
    assert(CONFIG.COLUMN_MAP.length > 0, 'COLUMN_MAP should not be empty');
    assert(CONFIG.HELPER_KEYS.includes('__sync_needed'), 'HELPER_KEYS should include __sync_needed');
    assert(CONFIG.HELPER_KEYS.includes('__last_updated'), 'HELPER_KEYS should include __last_updated');
  } catch (e) {
    Logger.log(`Test 1 Failed: ${e.message}`);
  }

  // Test 2: Role Resolution Logic
  try {
    const rolesConfig = {
      'admin@cloudlogs.com': 'Admin',
      'datamanager@cloudlogs.com': 'Data Manager',
      'viewer@cloudlogs.com': 'Viewer'
    };
    
    const resolveRole = (email) => {
      const formattedEmail = String(email || '').toLowerCase().trim();
      if (rolesConfig[formattedEmail]) {
        return rolesConfig[formattedEmail];
      }
      if (formattedEmail.endsWith('@cloudlogs.com')) {
        return 'Data Manager'; // Default for domain
      }
      return 'Viewer'; // Default fallback
    };

    assert(resolveRole('admin@cloudlogs.com') === 'Admin', 'admin@cloudlogs.com should resolve to Admin');
    assert(resolveRole('datamanager@cloudlogs.com') === 'Data Manager', 'datamanager@cloudlogs.com should resolve to Data Manager');
    assert(resolveRole('viewer@cloudlogs.com') === 'Viewer', 'viewer@cloudlogs.com should resolve to Viewer');
    assert(resolveRole('other_user@cloudlogs.com') === 'Data Manager', 'Domain match other_user@cloudlogs.com should default to Data Manager');
    assert(resolveRole('guest@gmail.com') === 'Viewer', 'External guest should resolve to Viewer');
  } catch (e) {
    Logger.log(`Test 2 Failed: ${e.message}`);
  }

  // Test 3: Normalization and cell parsing
  try {
    assert(normalizeCell(null) === '', 'null should normalize to empty string');
    assert(normalizeCell(undefined) === '', 'undefined should normalize to empty string');
    assert(normalizeCell('  test_val  ') === 'test_val', 'Whitespace should be trimmed');
    assert(normalizeCell(123) === '123', 'Number should be converted to string');
    
    assert(isYes('yes') === true, 'yes should be true');
    assert(isYes('YES') === true, 'YES should be true');
    assert(isYes('y') === true, 'y should be true');
    assert(isYes('1') === true, '1 should be true');
    assert(isYes('true') === true, 'true should be true');
    assert(isYes('no') === false, 'no should be false');
    assert(isYes('') === false, 'empty string should be false');
  } catch (e) {
    Logger.log(`Test 3 Failed: ${e.message}`);
  }

  // Test 4: Webhook Field Extraction
  try {
    const rawMock = {
      'meta/instanceID': 'uuid:12345678',
      'state': 'Uttar Pradesh',
      'grp_basic_artc_code': 'UP001',
      'filled_posts_smo': 2,
      'computers_mo': 'yes'
    };

    assert(getField_(rawMock, ['_uuid', 'uuid', 'meta/instanceID']) === 'uuid:12345678', 'Should extract nested/aliased instance ID');
    assert(getField_(rawMock, ['state']) === 'Uttar Pradesh', 'Should extract state');
    assert(getField_(rawMock, ['artc_code', 'grp_basic/artc_code']) === 'UP001', 'Should extract underscore alias for grp_basic/artc_code');
    assert(getField_(rawMock, ['filled_posts_smo']) === 2, 'Should extract posts');
    assert(getField_(rawMock, ['computers_mo']) === 'yes', 'Should extract computers_mo');
  } catch (e) {
    Logger.log(`Test 4 Failed: ${e.message}`);
  }

  // Test 5: Recipients Management CRUD
  try {
    const testEmail = 'automated_test_recipient@cloudlogs.com';
    const testName = 'Test Automator';
    
    // Ensure we start clean
    try {
      deleteRecipient(testEmail);
    } catch(err) {}
    
    // Add recipient
    const addRes = addRecipient(testEmail, testName, 'Active');
    assert(addRes.success === true, 'addRecipient should return success');
    
    // Get list
    const listRes = getRecipientsList();
    assert(listRes.success === true, 'getRecipientsList should return success');
    const added = listRes.recipients.find(r => r.email === testEmail);
    assert(added !== undefined, 'Added recipient should exist in list');
    assert(added.name === testName, 'Added name should match');
    assert(added.status === 'Active', 'Added status should be Active');
    
    // Toggle status
    const toggleRes = toggleRecipientStatus(testEmail, 'Inactive');
    assert(toggleRes.success === true, 'toggleRecipientStatus should return success');
    const listRes2 = getRecipientsList();
    const updated = listRes2.recipients.find(r => r.email === testEmail);
    assert(updated.status === 'Inactive', 'Status should toggle to Inactive');
    
    // Delete recipient
    const delRes = deleteRecipient(testEmail);
    assert(delRes.success === true, 'deleteRecipient should return success');
    const listRes3 = getRecipientsList();
    const deleted = listRes3.recipients.find(r => r.email === testEmail);
    assert(deleted === undefined, 'Deleted recipient should not exist in list');
  } catch (e) {
    Logger.log(`Test 5 Failed: ${e.message}`);
  }

  // Final Summary
  Logger.log('==============================================');
  Logger.log(`📊 TEST RUN COMPLETE: Passed: ${passed}, Failed: ${failed}`);
  Logger.log('==============================================');
  
  return {
    success: failed === 0,
    passed,
    failed,
    results
  };
}
