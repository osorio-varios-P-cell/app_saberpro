/* ═══════════════════════════════════════════════════════
   SABERPRO — Code Registry (Compartido Admin + User)
   Almacena códigos con estado, dispositivo vinculado y tipo
   ═══════════════════════════════════════════════════════ */

const CodeRegistry = (() => {
  'use strict';
  const KEY = 'saberpro_code_registry';

  function getDefault() {
    return {
      'SABER2026': { code: 'SABER2026', status: 'active', deviceId: null, deviceName: null, activatedAt: null, userId: null, type: 'free', notes: 'Código demo' },
      'ICFES2026': { code: 'ICFES2026', status: 'active', deviceId: null, deviceName: null, activatedAt: null, userId: null, type: 'free', notes: 'Código demo' },
      'PREICFES':  { code: 'PREICFES',  status: 'active', deviceId: null, deviceName: null, activatedAt: null, userId: null, type: 'free', notes: 'Código demo' },
      'ADMIN500':  { code: 'ADMIN500',  status: 'active', deviceId: null, deviceName: null, activatedAt: null, userId: null, type: 'admin', notes: 'Admin' },
      'MASTER99':  { code: 'MASTER99',  status: 'active', deviceId: null, deviceName: null, activatedAt: null, userId: null, type: 'admin', notes: 'Admin' },
    };
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
