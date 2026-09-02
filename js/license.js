// SaberPro License Client — activación contra el servidor de licencias
// El servidor envía un token firmado con Ed25519; la app lo verifica con la clave pública.
const LicenseClient = (() => {
  'use strict';

  // ⚙️ CONFIGURACIÓN: pega aquí la URL de tu Worker desplegado
  const SERVER = localStorage.getItem('saberpro_license_server') || 'https://saberpro-licenses.saberpro-app.workers.dev';
  // ⚙️ CLAVE PÚBLICA: pega aquí la clave pública generada con gen-keys.mjs
  const LICENSE_PUBLIC_KEY = '';
  const KEY_B64URL = ''; // (opcional, si usas formato raw)

  const enc = new TextEncoder();
  function hashHex(str) {
    // Hash corto determinista (funciona en http y https)
    let h1 = 0x811c9dc5, h2 = 0x01000193;
    for (let i = 0; i < str.length; i++) {
      h1 ^= str.charCodeAt(i); h1 = (h1 * 16777619) >>> 0;
      h2 = (h2 + str.charCodeAt(i) * (i + 7)) >>> 0;
    }
    return ('0000000' + h1.toString(16)).slice(-8) + ('0000000' + h2.toString(16)).slice(-8);
  }
  function fingerprint() {
    return hashHex(window.DeviceFingerprint ? DeviceFingerprint.generate() : navigator.userAgent);
  }
  function enabled() { return SERVER && SERVER.indexOf('http') === 0; }
  function store(token, expiresAt, email) {
    localStorage.setItem('saberpro_license', JSON.stringify({ token, expiresAt, email, fingerprint: fingerprint() }));
  }
  function current() {
    try { return JSON.parse(localStorage.getItem('saberpro_license') || 'null'); } catch (e) { return null; }
  }
  function clear() { localStorage.removeItem('saberpro_license'); }
  function expired() { const l = current(); return !l || !l.token || !l.expiresAt || l.expiresAt < Date.now(); }

  async function verifyToken(token) {
    // Solo en contexto seguro (HTTPS) se puede verificar con WebCrypto;
    // en http (LAN) se confía en la respuesta del servidor.
    if (!LICENSE_PUBLIC_KEY || !window.isSecureContext) return { ok: true, verified: false };
    try {
      const [body, sig] = token.split('.');
      const raw = Uint8Array.from(atob(LICENSE_PUBLIC_KEY.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
      const key = await crypto.subtle.importKey('raw', raw, { name: 'Ed25519' }, false, ['verify']);
      const sigB = Uint8Array.from(atob(sig.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
      const ok = await crypto.subtle.verify({ name: 'Ed25519' }, key, sigB, enc.encode(body));
      return { ok, verified: true };
    } catch (e) { return { ok: false, verified: false, error: e.message }; }
  }

  async function api(path, body) {
    const r = await fetch(SERVER + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return r.json();
  }

  async function activate(name, code) {
    const r = await api('/api/activate', { code, fingerprint: fingerprint(), deviceName: window.DeviceFingerprint ? DeviceFingerprint.getDeviceName() : 'Dispositivo', name });
    if (!r.ok) return { ok: false, reason: r.reason };
    const v = await verifyToken(r.token);
    if (!v.ok) return { ok: false, reason: 'Firma de licencia inválida' };
    store(r.token, r.expires_at, r.email || '');
    return { ok: true, verified: v.verified };
  }

  async function reactivate() {
    const r = await api('/api/reactivate', { fingerprint: fingerprint() });
    if (!r.ok) return { ok: false, reason: r.reason };
    const v = await verifyToken(r.token);
    if (!v.ok) return { ok: false, reason: 'Firma de licencia inválida' };
    store(r.token, r.expires_at, r.email || '');
    return { ok: true, verified: v.verified };
  }

  async function checkExpiry() {
    const l = current();
    if (!l) return { active: false };
    if (l.expiresAt < Date.now()) { clear(); return { active: false, expired: true }; }
    return { active: true, expiresAt: l.expiresAt };
  }

  function setServer(url) { localStorage.setItem('saberpro_license_server', String(url || '').trim()); }

  return {
    enabled, fingerprint, activate, reactivate, checkExpiry, current, clear, setServer, verifyToken,
    SERVER_URL: () => SERVER
  };
})();
window.LicenseClient = LicenseClient;
