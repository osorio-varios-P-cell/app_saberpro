# SaberPro — Cómo generar el APK para Android

## Opción 1: Probar AHORA sin APK (más fácil)

1. Instala **Expo Go** en tu celular Android desde Play Store
2. En tu computador instala Node.js desde https://nodejs.org
3. Abre una terminal en la carpeta `saberpro_standalone/`
4. Ejecuta:
   ```
   npm install
   npx expo start
   ```
5. Escanea el código QR con la cámara de tu celular
6. La app abre directamente en Expo Go

---

## Opción 2: Generar APK con EAS Build (gratis)

### Paso 1 — Instalar herramientas
```bash
npm install -g eas-cli
```

### Paso 2 — Crear cuenta Expo (gratis)
Ve a https://expo.dev y crea una cuenta gratuita.

### Paso 3 — Iniciar sesión
```bash
eas login
```

### Paso 4 — Inicializar proyecto en Expo
```bash
eas init
```

### Paso 5 — Generar el APK
```bash
eas build -p android --profile preview
```

El APK se construye en la nube (tarda ~10-15 min).
Al terminar recibirás un enlace para descargarlo.

---

## Notas sobre las preguntas integradas

La app tiene **98 preguntas en total** distribuidas así:

| Área | Preguntas base | Preguntas ICFES oficiales | Total |
|------|---------------|--------------------------|-------|
| Matemáticas | 10 | 7 (Saber 11 & TyT 2026) | 17 |
| Lectura Crítica | 10 | 6 (Saber Pro) | 16 |
| Ciencias Naturales | 10 | 8 (Saber 11) | 18 |
| Sociales / Ciudadanas | 10 | 17 (Saber Pro) | 27 |
| Inglés | 10 | 10 (Saber Pro 2024) | 20 |

Las preguntas ICFES tienen el campo `source` indicando el cuadernillo oficial de origen.
