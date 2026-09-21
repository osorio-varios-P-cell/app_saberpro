/* ═══════════════════════════════════════════════════════
   SABERPRO — Code Registry (Compartido Admin + User)
   Almacena códigos con estado, dispositivo vinculado y tipo
   ═══════════════════════════════════════════════════════ */

const CodeRegistry = (() => {
  'use strict';
  const KEY = 'saberpro_code_registry';

  function getDefault() {
    // La app del estudiante NO trae codigos maestros (evita puertas traseras):
    // todos los codigos viven en el servidor de licencias (base D1).
    return {};
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return getDefault();
      return JSON.parse(raw);
    } catch (e) {
      return getDefault();
    }
  }

  function save(registry) {
    localStorage.setItem(KEY, JSON.stringify(registry));
  }

  function getCodes() {
    return load();
  }

  function validate(code) {
    const registry = load();
    const entry = registry[code];
    if (!entry) return { valid: false, reason: 'Código no encontrado' };
    if (entry.status === 'blocked') return { valid: false, reason: 'Código bloqueado por el administrador' };
    if (entry.status === 'revoked') return { valid: false, reason: 'Código revocado' };
    return { valid: true, entry };
  }

  function bindDevice(code, deviceId, deviceName, userId) {
    const registry = load();
    const entry = registry[code];
    if (!entry) return false;

    entry.deviceId = deviceId;
    entry.deviceName = deviceName;
    entry.activatedAt = new Date().toISOString();
    entry.userId = userId;
    if (entry.status === 'active' || entry.status === 'unused') {
      entry.status = 'active';
    }
    save(registry);
    return true;
  }

  function checkBinding(code, deviceId) {
    const registry = load();
    const entry = registry[code];
    if (!entry) return { ok: false, reason: 'Codigo no encontrado' };
    if (entry.status === 'blocked') return { ok: false, reason: 'Codigo bloqueado' };
    if (entry.status === 'revoked') return { ok: false, reason: 'Codigo revocado' };
    if (entry.deviceId && entry.deviceId !== deviceId) {
      return { ok: false, reason: 'Este codigo ya esta vinculado a otro dispositivo. Contacta al administrador para desvincularlo.' };
    }
    return { ok: true, entry };
  }

  function isAdmin(code) {
    const registry = load();
    const entry = registry[code];
    return entry && entry.type === 'admin';
  }

  return { getCodes, load, save, validate, bindDevice, checkBinding, isAdmin };
})();
