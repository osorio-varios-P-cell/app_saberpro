/* ═══════════════════════════════════════════════════════
   SABERPRO — Self-Service Device Transfer
   Permite al usuario mover su código a otro celular sin admin
   ═══════════════════════════════════════════════════════ */

const DeviceTransfer = (() => {
  'use strict';
  const KEY = 'saberpro_transfer_log';
  const COOLDOWN_HOURS = 24;
  const MAX_TRANSFERS_MONTH = 3;

  function getLog() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e) { return []; }
  }

  function saveLog(log) {
    localStorage.setItem(KEY, JSON.stringify(log));
  }

  function canTransfer(code) {
    const log = getLog();
    const now = Date.now();
    const cooldown = COOLDOWN_HOURS * 3600000;

    // Check cooldown
    const lastTransfer = log.filter(t => t.code === code).sort((a,b) => b.ts - a.ts)[0];
    if (lastTransfer && (now - lastTransfer.ts) < cooldown) {
      const remaining = Math.ceil((cooldown - (now - lastTransfer.ts)) / 3600000);
      return { ok: false, reason: `Debes esperar ${remaining} hora(s) para transferir de nuevo.` };
    }

    // Check monthly limit
    const monthStart = new Date(now);
    monthStart.setDate(1); monthStart.setHours(0,0,0,0);
    const thisMonth = log.filter(t => t.code === code && t.ts >= monthStart.getTime()).length;
    if (thisMonth >= MAX_TRANSFERS_MONTH) {
      return { ok: false, reason: `Has alcanzado el limite de ${MAX_TRANSFERS_MONTH} transferencias este mes.` };
    }

    return { ok: true };
  }

  function doTransfer(code, oldDeviceId, newDeviceId, newDeviceName) {
    // Update code registry
    const registry = CodeRegistry.getCodes();
    const entry = registry[code];
    if (!entry) return false;

    entry.deviceId = newDeviceId;
    entry.deviceName = newDeviceName;
    entry.activatedAt = new Date().toISOString();
    CodeRegistry.save(registry);

    // Log transfer
    const log = getLog();
    log.push({
      code, oldDeviceId, newDeviceId,
      oldDeviceName: entry._oldDeviceName || 'Desconocido',
      newDeviceName,
      ts: Date.now()
    });
    saveLog(log);

    return true;
  }

  return { canTransfer, doTransfer, getLog, COOLDOWN_HOURS, MAX_TRANSFERS_MONTH };
})();
