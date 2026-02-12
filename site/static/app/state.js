(function attachKontanaStateIO(global) {
  const DEFAULT_STORAGE_KEY = 'kontana_state_v1';
  const DEFAULT_BACKUP_STORAGE_KEY = 'kontana_state_v1_backup';

  function isQuotaError(error) {
    if (!error) return false;
    if (typeof DOMException !== 'undefined' && error instanceof DOMException) {
      return error.code === 22 || error.code === 1014 || error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED';
    }
    const name = String(error.name || '');
    const message = String(error.message || '');
    return name === 'QuotaExceededError' || /quota/i.test(message);
  }

  function readStateRaw(storageKey = DEFAULT_STORAGE_KEY) {
    let raw = null;
    try {
      raw = global.localStorage.getItem(storageKey);
    } catch {
      return { ok: false, error: 'storage_unavailable', raw: null };
    }
    if (raw == null) {
      return { ok: true, exists: false, raw: null, value: null };
    }
    try {
      const value = JSON.parse(raw);
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return { ok: false, error: 'corrupt_json', raw };
      }
      return { ok: true, exists: true, raw, value };
    } catch {
      return { ok: false, error: 'corrupt_json', raw };
    }
  }

  function writeStateRaw(nextState, storageKey = DEFAULT_STORAGE_KEY) {
    let raw = '';
    try {
      raw = JSON.stringify(nextState);
    } catch {
      return { ok: false, error: 'serialize_failed', raw: null };
    }
    try {
      global.localStorage.setItem(storageKey, raw);
      return { ok: true, raw };
    } catch (error) {
      if (isQuotaError(error)) {
        return { ok: false, error: 'quota', raw };
      }
      return { ok: false, error: 'storage_unavailable', raw };
    }
  }

  function clearStateRaw(storageKey = DEFAULT_STORAGE_KEY) {
    try {
      global.localStorage.removeItem(storageKey);
      return { ok: true };
    } catch {
      return { ok: false, error: 'storage_unavailable' };
    }
  }

  function writeRawStringIfMissing(raw, storageKey = DEFAULT_BACKUP_STORAGE_KEY) {
    if (typeof raw !== 'string') {
      return { ok: false, error: 'invalid_raw' };
    }
    try {
      const existing = global.localStorage.getItem(storageKey);
      if (existing != null) {
        return { ok: true, created: false };
      }
      global.localStorage.setItem(storageKey, raw);
      return { ok: true, created: true };
    } catch (error) {
      if (isQuotaError(error)) {
        return { ok: false, error: 'quota' };
      }
      return { ok: false, error: 'storage_unavailable' };
    }
  }

  function downloadRawData(rawText, filename = 'kontana-raw-data.json') {
    if (typeof rawText !== 'string') return { ok: false, error: 'no_raw_data' };
    try {
      const blob = new Blob([rawText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return { ok: true };
    } catch {
      return { ok: false, error: 'download_failed' };
    }
  }

  global.KontanaStateIO = {
    DEFAULT_STORAGE_KEY,
    DEFAULT_BACKUP_STORAGE_KEY,
    readStateRaw,
    writeStateRaw,
    clearStateRaw,
    writeRawStringIfMissing,
    downloadRawData,
  };
}(window));
