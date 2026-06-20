/* ═══════════════════════════════════════════════════════
   SABERPRO — Device Fingerprint + Code Registry
   Genera huella digital unica del dispositivo
   ═══════════════════════════════════════════════════════ */

const DeviceFingerprint = (() => {
  'use strict';

  function generate() {
    const components = [];

    // Screen
    components.push(screen.width + 'x' + screen.height);
    components.push(screen.colorDepth);
    components.push(window.devicePixelRatio || 1);

    // Platform
    components.push(navigator.platform);
    components.push(navigator.hardwareConcurrency || 'unknown');
    components.push(navigator.maxTouchPoints || 0);
    components.push(navigator.language);

    // GPU
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const dbg = gl.getExtension('WEBGL_debug_renderer_info');
        if (dbg) components.push(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL));
      }
    } catch (e) {}

    // Timezone
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

    // Storage estimate
    if (navigator.storage && navigator.storage.estimate) {
      // Async, use default
    }

    const raw = components.join('|');
    return simpleHash(raw);
  }

  function simpleHash(str) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
  }

  function getDeviceName() {
    const ua = navigator.userAgent;
    let name = 'Desconocido';

    if (/Android/.test(ua)) {
      const m = ua.match(/Android\s([\d.]+)/);
      const model = ua.match(/;\s([^;]+)\sBuild/);
      name = 'Android ' + (m ? m[1] : '') + (model ? ' (' + model[1] + ')' : '');
    } else if (/iPhone|iPad|iPod/.test(ua)) {
      name = 'iOS ' + (ua.match(/OS\s([\d_]+)/) || ['',''])[1].replace(/_/g, '.');
    } else if (/Windows/.test(ua)) {
      name = 'Windows PC';
    } else if (/Mac/.test(ua)) {
      name = 'Mac';
    } else if (/Linux/.test(ua)) {
      name = 'Linux';
    }

    return name + ' | ' + screen.width + 'x' + screen.height;
  }

  return { generate, getDeviceName };
})();
