/* ═══════════════════════════════════════════════════════
   SABERPRO USER APP v2.1 — Premium + 10 Mejoras
   Sonido, Timer, XP flotante, Racha, Guardadas,
   Dificultad visual, Tips neuro, Partículas, Tema rápido,
   Animaciones respuesta
   ═══════════════════════════════════════════════════════ */

const App = (() => {
  'use strict';

  const PREFIX = 'saberpro_';
  const THEME_KEY = 'saberpro_theme';
  const AREAS = [
    { id:'matematicas', name:'Matematicas', icon:'📐', color:'#4DA6FF', gradient:'linear-gradient(135deg,#4DA6FF,#2563EB)' },
    { id:'lectura', name:'Lectura Critica', icon:'📖', color:'#A855F7', gradient:'linear-gradient(135deg,#A855F7,#7C3AED)' },
    { id:'ciencias', name:'Ciencias Naturales', icon:'🔬', color:'#00C896', gradient:'linear-gradient(135deg,#00C896,#059669)' },
    { id:'sociales', name:'Sociales y Ciudadanas', icon:'🌍', color:'#FFB830', gradient:'linear-gradient(135deg,#FFB830,#F59E0B)' },
    { id:'ingles', name:'Ingles', icon:'🇬🇧', color:'#FF3B5C', gradient:'linear-gradient(135deg,#FF3B5C,#DC2626)' },
  ];
  const CONFIG = {
    VERSION: '2.1.0',
    UPDATE_URL: 'http://TU_IP:8001/updates/update.json',
    XP_CORRECT:10, XP_WRONG:0, XP_SESSION:50, XP_SIMULACRO:200,
    XP_LEVEL:500, SESSION_SIZE:10, SIM_SIZE:20, SIM_TIME:7200
  };

  let state = {
    user:null, progress:null, questions:[], currentTab:'home',
    practice:{ area:null, questions:[], index:0, answers:[], selected:null, xp:0 },
    simulacro:{ questions:[], index:0, answers:[], selected:null, xp:0, timer:null, timeLeft:CONFIG.SIM_TIME },
    saved:[]
  };

  // ═══ STORAGE ═══
  function sk(k){ return PREFIX + k; }
  function loadProgress(){
    try{ const r=localStorage.getItem(sk('progress')); return r?JSON.parse(r):defaultProgress(); }catch(e){ return defaultProgress(); }
  }
  function defaultProgress(){
    const ap={}; AREAS.forEach(a=>ap[a.id]={answered:0,correct:0});
    return { xp:0,level:1,streak:0,maxStreak:0,lastStudyDate:'',badges:[],areaProgress:ap,simulacros:[] };
  }
  function saveProgress(){ localStorage.setItem(sk('progress'),JSON.stringify(state.progress)); }
  function loadUser(){ try{ return JSON.parse(localStorage.getItem(sk('user'))); }catch(e){ return null; } }
  function saveUser(u){ localStorage.setItem(sk('user'),JSON.stringify(u)); }

  // ═══ EMBEDDED QUESTIONS ═══
  function getEmbedded(){
    return [
      {id:'e_mat_1',area:'matematicas',question:'Si f(x)=2x²-3x+1, ¿cual es f(2)?',options:['1','3','5','7'],correctIndex:1,explanation:'f(2)=2(4)-3(2)+1=3',difficulty:1,subcompetencia:'Funciones'},
      {id:'e_mat_2',area:'matematicas',question:'Area de un triangulo con base 8 y altura 5:',options:['20 cm²','40 cm²','13 cm²','16 cm²'],correctIndex:0,explanation:'A=(8x5)/2=20 cm²',difficulty:1,subcompetencia:'Geometria'},
      {id:'e_mat_3',area:'matematicas',question:'Cuantas soluciones reales tiene x²+4x+5=0?',options:['Ninguna','Una','Dos iguales','Dos distintas'],correctIndex:0,explanation:'Discriminante=16-20=-4<0',difficulty:2,subcompetencia:'Algebra'},
      {id:'e_mat_4',area:'matematicas',question:'Catetos 3 y 4. Hipotenusa:',options:['5','6','7','√7'],correctIndex:0,explanation:'c²=9+16=25 -> c=5',difficulty:1,subcompetencia:'Trigonometria'},
      {id:'e_lc_1',area:'lectura',question:'"Efimero" significa:',options:['Eterno','Pasajero','Sorprendente','Valioso'],correctIndex:1,explanation:'Efimero=de corta duracion',difficulty:1,subcompetencia:'Vocabulario'},
      {id:'e_lc_2',area:'lectura',question:'Funcion del contraargumento:',options:['Debilitar la tesis','Presentar posicion contraria y refutarla','Resumir','Nuevos temas'],correctIndex:1,explanation:'Refuerza la tesis al refutar la posicion opuesta',difficulty:2,subcompetencia:'Argumentacion'},
      {id:'e_lc_3',area:'lectura',question:'"A pesar de las dificultades, logro superar metas." Conector:',options:['Causalidad','Consecuencia','Concesion','Condicion'],correctIndex:2,explanation:'"A pesar de"=concesion',difficulty:2,subcompetencia:'Conectores'},
      {id:'e_cn_1',area:'ciencias',question:'Productos de la fotosintesis:',options:['CO₂ y agua','Glucosa y O₂','Proteinas','Nitrogeno'],correctIndex:1,explanation:'CO₂+H₂O+luz->glucosa+O₂',difficulty:1,subcompetencia:'Biologia'},
      {id:'e_cn_2',area:'ciencias',question:'La meiosis produce:',options:['Celulas somaticas','Gametos con mitad del ADN','Bacterias','Todas las celulas'],correctIndex:1,explanation:'Gametos con n cromosomas',difficulty:2,subcompetencia:'Biologia'},
      {id:'e_cn_3',area:'ciencias',question:'El sonido viaja mas rapido en:',options:['Vacio','Aire','Agua','Solido'],correctIndex:3,explanation:'Solidos ~5000 m/s > liquidos > gases',difficulty:2,subcompetencia:'Fisica'},
      {id:'e_sc_1',area:'sociales',question:'Constitucion colombiana vigente:',options:['1886','1948','1991','2001'],correctIndex:2,explanation:'Promulgada el 4 de julio de 1991',difficulty:1,subcompetencia:'Constitucion'},
      {id:'e_sc_2',area:'sociales',question:'La Batalla de Boyaca fue en:',options:['1810','1814','1819','1825'],correctIndex:2,explanation:'7 de agosto de 1819',difficulty:1,subcompetencia:'Historia'},
      {id:'e_sc_3',area:'sociales',question:'Mecanismo de proteccion de derechos:',options:['Referendo','Accion popular','Tutela','Plebiscito'],correctIndex:2,explanation:'Art. 86: accion de tutela',difficulty:1,subcompetencia:'Constitucion'},
      {id:'e_ing_1',area:'ingles',question:'"She ____ to the market yesterday."',options:['go','goes','went','gone'],correctIndex:2,explanation:'Simple past of "go"="went"',difficulty:1,subcompetencia:'Tiempos verbales'},
      {id:'e_ing_2',area:'ingles',question:'Synonym of "enormous":',options:['Small','Beautiful','Huge','Ancient'],correctIndex:2,explanation:'Enormous=very large=huge',difficulty:1,subcompetencia:'Vocabulario'},
      {id:'e_ing_3',area:'ingles',question:'"I have never been to Paris." Tense:',options:['Simple past','Present perfect','Past perfect','Future perfect'],correctIndex:1,explanation:'Have+past participle=present perfect',difficulty:1,subcompetencia:'Present perfect'},
    ];
  }

  // ═══ SOUND SYSTEM ═══
  const AudioCtx=window.AudioContext||window.webkitAudioContext;let audioCtx=null;
  function getAudio(){if(!audioCtx)audioCtx=new AudioCtx();return audioCtx;}
  function playTone(freq,type,dur,vol,delay){
    try{const a=getAudio(),o=a.createOscillator(),g=a.createGain();
    o.type=type;o.frequency.value=freq;delay=delay||0;vol=vol||0.08;
    g.gain.setValueAtTime(0,a.currentTime+delay);g.gain.linearRampToValueAtTime(vol,a.currentTime+delay+0.02);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+delay+dur);
    o.connect(g);g.connect(a.destination);o.start(a.currentTime+delay);o.stop(a.currentTime+delay+dur);}catch(e){}
  }
  function sfxCorrect(){playTone(523,'sine',0.1,0.08);setTimeout(()=>playTone(659,'sine',0.1,0.08),80);setTimeout(()=>playTone(784,'sine',0.15,0.07),160);}
  function sfxWrong(){playTone(200,'triangle',0.25,0.06);setTimeout(()=>playTone(180,'triangle',0.2,0.05),100);}
  function sfxXP(){playTone(880,'sine',0.08,0.05);setTimeout(()=>playTone(1100,'sine',0.1,0.04),60);}
  function sfxBadge(){playTone(523,'sine',0.1,0.06);setTimeout(()=>playTone(659,'sine',0.1,0.06),100);setTimeout(()=>playTone(784,'sine',0.1,0.06),200);setTimeout(()=>playTone(1047,'sine',0.25,0.07),300);}
  function sfxLevelUp(){playTone(440,'sine',0.12,0.05);setTimeout(()=>playTone(554,'sine',0.12,0.05),120);setTimeout(()=>playTone(659,'sine',0.12,0.05),240);setTimeout(()=>playTone(880,'sine',0.2,0.06),360);setTimeout(()=>playTone(1100,'sine',0.3,0.07),480);}
  function sfxClick(){playTone(600,'sine',0.04,0.03);}
  function sfxTimer(){playTone(300,'sine',0.06,0.04);}

  // ═══ NEURO TIPS ═══
  const NEURO_TIPS=['La memoria se consolida mientras duermes. Descansa bien.','Espaciar el estudio en el tiempo multiplica la retencion.','Explicarle un tema a otra persona es la mejor forma de aprenderlo.','El cerebro recuerda mejor lo que asocia con emociones.','Resolver preguntas es mas efectivo que solo leer.','La concentracion maxima dura ~25 min. Toma pausas.','El estres moderado mejora el rendimiento. Confia en ti.','Cada error es oportunidad de aprendizaje.','La hidratacion y buena alimentacion potencian tu cerebro.','Visualizar el exito activa las mismas areas cerebrales.','Alterna materias dificiles con faciles.','El cerebro aprende patrones. Busca conexiones.'];

  // ═══ SAVED QUESTIONS ═══
  function loadSaved(){try{return JSON.parse(localStorage.getItem(sk('saved'))||'[]');}catch(e){return[];}}
  function saveSaved(){localStorage.setItem(sk('saved'),JSON.stringify(state.saved));}
  function toggleSave(qid){const idx=state.saved.indexOf(qid);if(idx>=0){state.saved.splice(idx,1);toast('Quitada de guardadas');}else{state.saved.push(qid);toast('Pregunta guardada!');sfxClick();}saveSaved();updateBookmarkBtn(qid);}
  function isSaved(qid){return state.saved.includes(qid);}

  // ═══ INIT ═══
  async function init(){
    state.saved=loadSaved();
    initCinematicParticles();
    state.questions=getEmbedded();
    try{const resp=await fetch('data/questions.json');if(resp.ok)state.questions=await resp.json();}catch(e){}
    state.user=loadUser();state.progress=loadProgress();
    AREAS.forEach(a=>{if(!state.progress.areaProgress[a.id])state.progress.areaProgress[a.id]={answered:0,correct:0};});
    initTheme();
    checkForUpdate();
    setTimeout(()=>{document.getElementById('splash').classList.add('hide');initBackgroundParticles();if(state.user&&state.user.validated){showApp();}else{showLogin();}},3300);
  }

  function showLogin(){document.getElementById('login-screen').classList.add('active');}
  function showApp(){document.getElementById('login-screen').classList.remove('active');document.getElementById('app-screen').classList.add('active');updateHeader();switchTab('home');}

  function doLogin(){
    const name=document.getElementById('login-name').value.trim(),code=document.getElementById('login-code').value.trim().toUpperCase(),status=document.getElementById('login-status');
    if(!name){status.className='status-msg error';status.textContent='Ingresa tu nombre';return;}
    if(!code){status.className='status-msg error';status.textContent='Ingresa el codigo de acceso';return;}

    // Validar codigo en el registro
    const valid=CodeRegistry.validate(code);
    if(!valid.valid){status.className='status-msg error';status.textContent=valid.reason;return;}

    // Generar huella digital del dispositivo
    const deviceId=DeviceFingerprint.generate();
    const deviceName=DeviceFingerprint.getDeviceName();

    // Verificar vinculacion de dispositivo
    const entry=valid.entry;
    if(entry.deviceId && entry.deviceId!==deviceId){
      // Offer self-service transfer
      const canXfer=DeviceTransfer.canTransfer(code);
      if(canXfer.ok){
      const confirmMsg='Este codigo esta activo en: '+entry.deviceName+'. Quieres transferirlo a este dispositivo? (El anterior se desactivara. Max '+DeviceTransfer.MAX_TRANSFERS_MONTH+' transferencias/mes. '+DeviceTransfer.COOLDOWN_HOURS+'h entre transferencias).';
        if(confirm(confirmMsg)){
          DeviceTransfer.doTransfer(code,entry.deviceId,deviceId,deviceName);
          status.className='status-msg success';
          status.textContent='Transferencia exitosa! Bienvenido/a '+name;
        }else{
          status.className='status-msg error';
          status.textContent='Transferencia cancelada. El codigo sigue en el dispositivo anterior.';
          return;
        }
      }else{
        status.className='status-msg error';
        status.textContent=canXfer.reason;
        return;
      }
    }

    // Vincular si es primera vez en este dispositivo
    if(!entry.deviceId){
      const ok=CodeRegistry.bindDevice(code,deviceId,deviceName,name);
      if(ok){status.className='status-msg success';status.textContent='Dispositivo vinculado! Bienvenido/a '+name;}
      else{status.className='status-msg error';status.textContent='Error al vincular dispositivo';return;}
    }else{
      status.className='status-msg success';status.textContent='Acceso concedido! Bienvenido/a '+name;
    }

    state.user={name,validated:true,code,deviceId,deviceName,loginDate:new Date().toISOString(),_uid:name+'_'+Date.now()};
    saveUser(state.user);
    updateAdminUserRecord(name,code,deviceId,deviceName);
    setTimeout(()=>{showApp();},800);
  }

  function updateAdminUserRecord(name,code,deviceId,deviceName){
    const key='saberpro_admin_user_'+code;
    const record={name,code,deviceId,deviceName,lastLogin:new Date().toISOString(),progress:state.progress};
    localStorage.setItem(key,JSON.stringify(record));
  }

  // ═══ CHECK FOR UPDATE ═══
  function getUpdateURL(){return localStorage.getItem('saberpro_update_url')||CONFIG.UPDATE_URL;}
  function saveUpdateURL(url){localStorage.setItem('saberpro_update_url',url.trim());toast('URL guardada');}
  function checkForUpdate(){
    try{const resp=new XMLHttpRequest();resp.open('GET',getUpdateURL(),true);resp.timeout=5000;
    resp.onload=function(){if(resp.status===200){try{const pkg=JSON.parse(resp.responseText);if(pkg.version!==CONFIG.VERSION){applyUpdate(pkg);}}catch(e){}}};
    resp.send();}catch(e){}
  }

  function tryRemoteUpdate(){
    const url=getUpdateURL();
    if(!url||url.includes('TU_IP')){toast('Configura la URL del servidor arriba primero');return;}
    toast('Conectando al servidor...');
    fetch(url).then(r=>r.json()).then(pkg=>{applyUpdate(pkg);toast('Actualizacion aplicada: '+pkg.questions.length+' preguntas');}).catch(()=>toast('No se pudo conectar. Verifica la URL y que el servidor este activo.'));
  }

  function loadUpdateFile(){
    const input=document.createElement('input');input.type='file';input.accept='.json';
    input.onchange=function(e){const file=e.target.files[0];if(!file)return;const reader=new FileReader();
    reader.onload=function(ev){try{const pkg=JSON.parse(ev.target.result);applyUpdate(pkg);toast('Actualizacion aplicada: '+pkg.questions.length+' preguntas nuevas');}catch(err){toast('Error al cargar actualizacion: '+err.message);}};
    reader.readAsText(file);};input.click();
  }

  function applyUpdate(pkg){
    if(pkg.questions&&pkg.questions.length){const existingIds=new Set(state.questions.map(q=>q.id));const newQs=pkg.questions.filter(q=>!existingIds.has(q.id));state.questions=[...state.questions,...newQs];}
    if(pkg.version)CONFIG.VERSION=pkg.version;updateHeader();
  }

  // ═══ TOAST ═══
  function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);}

  // ═══ CONFETTI ═══
  function launchConfetti(count,type){
    count=count||30;const colors=['#FF3B5C','#FFB830','#00C896','#4DA6FF','#A855F7','#FF7099','#00E5FF'];
    for(let i=0;i<count;i++)setTimeout(()=>{
      const p=document.createElement('div');p.className='confetti';
      if(type==='badge'){p.style.width='10px';p.style.height='10px';p.style.borderRadius='50%';}
      p.style.left=Math.random()*100+'%';p.style.top='100%';
      p.style.backgroundColor=colors[Math.floor(Math.random()*colors.length)];
      p.style.setProperty('--cx',(Math.random()*200-100)+'px');
      p.style.setProperty('--cy',-(300+Math.random()*300)+'px');
      p.style.setProperty('--cr',(Math.random()*720-360)+'deg');
      p.style.animationDuration=(1.5+Math.random()*2.5)+'s';
      document.body.appendChild(p);setTimeout(()=>p.remove(),4000);
    },i*20);
  }

  // ═══ XP SYSTEM ═══
  function floatXP(amount,el){
    const f=document.createElement('div');f.className='float-xp';f.textContent='+'+amount;
    f.style.left=(el.getBoundingClientRect().left+el.getBoundingClientRect().width/2-20)+'px';
    f.style.top=(el.getBoundingClientRect().top)+'px';
    document.body.appendChild(f);setTimeout(()=>f.remove(),1200);
  }

  function addXP(amount){
    const p=state.progress,oldLevel=p.level;p.xp+=amount;
    p.level=Math.floor(p.xp/CONFIG.XP_LEVEL)+1;
    const today=new Date().toDateString(),yesterday=new Date(Date.now()-86400000).toDateString();
    if(p.lastStudyDate===today){}else if(p.lastStudyDate===yesterday)p.streak++;else p.streak=1;
    p.maxStreak=Math.max(p.maxStreak,p.streak);p.lastStudyDate=today;
    const hadBadges=p.badges.length;checkBadges();
    saveProgress();sfxXP();
    if(p.level>oldLevel){sfxLevelUp();setTimeout(()=>toast('Nivel '+p.level+'!'),300);launchConfetti(20);}
    if(p.badges.length>hadBadges){sfxBadge();setTimeout(()=>toast('Logro desbloqueado!'),500);launchConfetti(40,'badge');}
  }

  function checkBadges(){
    const p=state.progress,b=[...p.badges],add=id=>{if(!b.includes(id))b.push(id);};
    if(p.streak>=3)add('s3');if(p.streak>=7)add('s7');if(p.streak>=14)add('s14');if(p.streak>=30)add('s30');
    if(p.xp>=1000)add('xp1k');if(p.xp>=5000)add('xp5k');
    if(p.simulacros.length>=1)add('sim1');
    if(p.simulacros.some(s=>s.score>=300))add('sc300');if(p.simulacros.some(s=>s.score>=400))add('sc400');
    p.badges=b;
  }

  // ═══ DIFFICULTY STARS ═══
  function difficultyStars(d){return d===3?'★★★':d===2?'★★':'★';}

  // ═══ HOME ═══
  function renderHome(){
    const p=state.progress,totalQ=Object.values(p.areaProgress).reduce((s,a)=>s+(a.answered||0),0);
    document.getElementById('s-preguntas').textContent=totalQ;
    document.getElementById('s-simulacros').textContent=p.simulacros.length;
    document.getElementById('s-logros').textContent=p.badges.length;
    const sorted=AREAS.map(a=>{const ap=p.areaProgress[a.id]||{answered:0,correct:0};return{...a,acc:ap.answered>0?ap.correct/ap.answered:1,n:ap.answered};}).sort((a,b)=>a.acc-b.acc).slice(0,3);
    document.getElementById('home-areas').innerHTML=sorted.map(a=>`<div class="area-card" onclick="App.startPractice('${a.id}')" style="border-left:3px solid ${a.color}"><div class="area-icon">${a.icon}</div><div class="area-name">${a.name}</div><div class="area-sub">${a.n===0?'Sin practica':Math.round(a.acc*100)+'% acierto'}</div><div style="height:3px;background:var(--border);margin-top:8px;border-radius:2px;overflow:hidden"><div style="height:100%;width:${Math.round(a.acc*100)}%;background:${a.color};border-radius:2px"></div></div></div>`).join('');
    // Neuro tip
    const tip=NEURO_TIPS[Math.floor(Math.random()*NEURO_TIPS.length)];
    document.getElementById('neuro-tip').innerHTML=`<span style="color:var(--purple)">🧠</span> ${tip}`;
  }

  // ═══ PRACTICA ═══
  function renderPracticaHome(){
    document.getElementById('practica-area-view').style.display='block';document.getElementById('practica-q-view').style.display='none';
    document.getElementById('practica-area-grid').innerHTML=AREAS.map(a=>{const count=state.questions.filter(q=>q.area===a.id).length,ap=state.progress.areaProgress[a.id]||{answered:0,correct:0};return`<div class="area-card" onclick="App.startPractice('${a.id}')" style="border-left:3px solid ${a.color}"><div class="area-icon">${a.icon}</div><div class="area-name">${a.name}</div><div class="area-sub">${count} preguntas</div></div>`;}).join('');
  }

  function startPractice(areaId){
    const pool=state.questions.filter(q=>q.area===areaId);if(!pool.length){toast('No hay preguntas en esta area');return;}
    const shuffled=[...pool].sort(()=>Math.random()-0.5);
    state.practice={area:areaId,questions:shuffled.slice(0,Math.min(CONFIG.SESSION_SIZE,shuffled.length)),index:0,answers:[],selected:null,xp:0};
    document.getElementById('practica-area-view').style.display='none';document.getElementById('practica-q-view').style.display='block';
    const area=AREAS.find(a=>a.id===areaId);document.getElementById('pq-area-name').textContent=area.name;document.getElementById('pq-area-icon').textContent=area.icon;
    renderPQuestion();
  }

  function renderPQuestion(){
    const q=state.practice.questions[state.practice.index],area=AREAS.find(a=>a.id===q.area);state.practice.selected=null;
    document.getElementById('pq-progress').innerHTML=state.practice.questions.map((_,i)=>`<div class="q-dot${i===state.practice.index?' current':''}${i<state.practice.answers.length?(state.practice.answers[i]?' good':' bad'):''}"></div>`).join('');
    document.getElementById('pq-tag').textContent=area.name;document.getElementById('pq-tag').style.background=area.color+'22';document.getElementById('pq-tag').style.color=area.color;
    document.getElementById('pq-num').textContent=state.practice.index+1;document.getElementById('pq-total').textContent=state.practice.questions.length;
    document.getElementById('pq-text').textContent=q.question;
    document.getElementById('pq-diff').textContent=difficultyStars(q.difficulty||1);
    document.getElementById('pq-source').textContent=q.subcompetencia||'';document.getElementById('pq-source').style.display=q.subcompetencia?'block':'none';
    const letters=['A','B','C','D'];document.getElementById('pq-options').innerHTML=q.options.map((opt,i)=>`<button class="option-btn" onclick="App.selectPAnswer(${i})" id="popt-${i}"><span class="opt-letter">${letters[i]}</span>${opt}</button>`).join('');
    document.getElementById('pq-expl').classList.remove('show');document.getElementById('pq-next').style.display='none';
    updateBookmarkBtn(q.id);
  }

  function updateBookmarkBtn(qid){
    const btn=document.getElementById('pq-bookmark');if(!btn)return;
    btn.textContent=isSaved(qid)?'🔖':'🏷';btn.style.opacity=isSaved(qid)?'1':'0.4';
  }

  function selectPAnswer(idx){
    if(state.practice.selected!==null)return;state.practice.selected=idx;
    const q=state.practice.questions[state.practice.index];
    const ci=typeof q.correctIndex==='number'?q.correctIndex:0;
    const correct=idx===ci;
    state.practice.answers.push(correct);state.practice.xp+=correct?CONFIG.XP_CORRECT:CONFIG.XP_WRONG;
    addXP(correct?CONFIG.XP_CORRECT:CONFIG.XP_WRONG);
    if(correct){sfxCorrect();document.getElementById('popt-'+idx).style.animation='pulse 0.4s ease';}
    else{sfxWrong();document.getElementById('popt-'+idx).style.animation='shake 0.4s ease';}
    document.getElementById('popt-'+idx).classList.add('selected');document.getElementById('popt-'+ci).classList.add('right');
    if(!correct)document.getElementById('popt-'+idx).classList.add('wrong');
    document.querySelectorAll('#pq-options .option-btn').forEach(b=>b.classList.add('locked'));
    document.getElementById('pq-expl').classList.add('show');document.getElementById('pq-expl-text').textContent=q.explanation;
    document.getElementById('pq-next').style.display='flex';document.getElementById('pq-next-label').textContent=state.practice.index<state.practice.questions.length-1?'Siguiente':'Ver resultados';
    floatXP(correct?CONFIG.XP_CORRECT:CONFIG.XP_WRONG,document.getElementById('popt-'+idx));
    updateHeader();
  }

  function pNext(){if(state.practice.index<state.practice.questions.length-1){state.practice.index++;renderPQuestion();}else showPResults();}

  function showPResults(){
    const correct=state.practice.answers.filter(Boolean).length,total=state.practice.questions.length,pct=Math.round(correct/total*100);
    addXP(CONFIG.XP_SESSION);
    let grade='Sigue practicando',gColor='#FF3B5C',gEmoji='💪';
    if(pct>=80){grade='Excelente!';gColor='#FFB830';gEmoji='🏆';}else if(pct>=60){grade='Buen trabajo!';gColor='#00C896';gEmoji='👏';}else if(pct>=40){grade='Vas por buen camino';gColor='#4DA6FF';gEmoji='📈';}
    document.getElementById('res-grade').textContent=gEmoji+' '+grade;document.getElementById('res-grade').style.color=gColor;
    document.getElementById('res-score').textContent=correct+' / '+total;document.getElementById('res-pct').textContent=pct+'%';
    document.getElementById('res-xp').textContent='+ '+(state.practice.xp+CONFIG.XP_SESSION)+' XP ganados';
    document.getElementById('practica-q-view').style.display='none';document.getElementById('practica-results').classList.add('active');
    if(pct>=80)launchConfetti(30);
    updateHeader();
  }

  function pAgain(){document.getElementById('practica-results').classList.remove('active');document.getElementById('practica-q-view').style.display='block';startPractice(state.practice.area);}
  function pBack(){document.getElementById('practica-results').classList.remove('active');state.practice.area=null;renderPracticaHome();}

  function diagnoticoRapido(){
    const pool=[];AREAS.forEach(a=>{const aq=state.questions.filter(q=>q.area===a.id),s=[...aq].sort(()=>Math.random()-0.5);pool.push(...s.slice(0,3));});
    const shuffled=[...pool].sort(()=>Math.random()-0.5);
    state.practice={area:'diagnostic',questions:shuffled,index:0,answers:[],selected:null,xp:0};
    document.getElementById('practica-area-view').style.display='none';document.getElementById('practica-q-view').style.display='block';
    document.getElementById('pq-area-name').textContent='Diagnostico Rapido';document.getElementById('pq-area-icon').textContent='🎯';
    renderPQuestion();
  }

  // ═══ SIMULACRO ═══
  function renderSimulacro(){
    const sims=state.progress.simulacros;
    document.getElementById('sim-history').innerHTML=sims.length===0?'<p style="color:var(--text3);text-align:center;padding:20px">Aun no has hecho simulacros</p>':sims.slice(-5).reverse().map(s=>`<div style="display:flex;justify-content:space-between;padding:10px;background:var(--card);border:1px solid var(--border);border-radius:10px;margin-bottom:6px;font-size:12px"><span>${s.date}</span><span style="color:var(--coral);font-weight:700">${Math.round(s.score)} pts</span><span style="color:var(--text3)">${s.correct}/${s.totalQuestions}</span></div>`).join('');
  }

  function startSimulacro(){
    const pool=[];AREAS.forEach(a=>{const aq=state.questions.filter(q=>q.area===a.id),per=Math.ceil(CONFIG.SIM_SIZE/AREAS.length),s=[...aq].sort(()=>Math.random()-0.5);pool.push(...s.slice(0,per));});
    state.simulacro={questions:[...pool].sort(()=>Math.random()-0.5).slice(0,CONFIG.SIM_SIZE),index:0,answers:[],selected:null,xp:0,timer:null,timeLeft:CONFIG.SIM_TIME};
    document.getElementById('sim-home-view').style.display='none';document.getElementById('sim-q-view').style.display='block';
    document.getElementById('timer-wrap').style.display='flex';startTimer();
    renderSQuestion();
  }

  function startTimer(){
    if(state.simulacro.timer)clearInterval(state.simulacro.timer);
    state.simulacro.timer=setInterval(()=>{
      state.simulacro.timeLeft--;updateTimer();
      if(state.simulacro.timeLeft<=300)sfxTimer();
      if(state.simulacro.timeLeft<=0){clearInterval(state.simulacro.timer);showSResults();}
    },1000);
  }

  function updateTimer(){
    const tl=state.simulacro.timeLeft,m=Math.floor(tl/60),s=tl%60;
    document.getElementById('timer-display').textContent=m+':'+String(s).padStart(2,'0');
    document.getElementById('timer-display').style.color=tl<300?'var(--coral)':tl<600?'var(--gold)':'var(--text)';
  }

  function renderSQuestion(){
    const q=state.simulacro.questions[state.simulacro.index],area=AREAS.find(a=>a.id===q.area);state.simulacro.selected=null;
    document.getElementById('sq-progress').innerHTML=state.simulacro.questions.map((_,i)=>`<div class="q-dot${i===state.simulacro.index?' current':''}${i<state.simulacro.answers.length?(state.simulacro.answers[i]?' good':' bad'):''}"></div>`).join('');
    document.getElementById('sq-tag').textContent=area.name;document.getElementById('sq-tag').style.background=area.color+'22';document.getElementById('sq-tag').style.color=area.color;
    document.getElementById('sq-num').textContent=state.simulacro.index+1;document.getElementById('sq-total').textContent=state.simulacro.questions.length;
    document.getElementById('sq-text').textContent=q.question;
    document.getElementById('sq-diff').textContent=difficultyStars(q.difficulty||1);
    const letters=['A','B','C','D'];document.getElementById('sq-options').innerHTML=q.options.map((opt,i)=>`<button class="option-btn" onclick="App.selectSAnswer(${i})" id="sopt-${i}"><span class="opt-letter">${letters[i]}</span>${opt}</button>`).join('');
    document.getElementById('sq-expl').classList.remove('show');document.getElementById('sq-next').style.display='none';
  }

  function selectSAnswer(idx){
    if(state.simulacro.selected!==null)return;state.simulacro.selected=idx;
    const q=state.simulacro.questions[state.simulacro.index];
    const ci=typeof q.correctIndex==='number'?q.correctIndex:0;
    const correct=idx===ci;
    state.simulacro.answers.push(correct);state.simulacro.xp+=correct?CONFIG.XP_CORRECT:CONFIG.XP_WRONG;
    addXP(correct?CONFIG.XP_CORRECT:CONFIG.XP_WRONG);
    if(correct){sfxCorrect();document.getElementById('sopt-'+idx).style.animation='pulse 0.4s ease';}
    else{sfxWrong();document.getElementById('sopt-'+idx).style.animation='shake 0.4s ease';}
    document.getElementById('sopt-'+idx).classList.add('selected');document.getElementById('sopt-'+ci).classList.add('right');
    if(!correct)document.getElementById('sopt-'+idx).classList.add('wrong');
    document.querySelectorAll('#sq-options .option-btn').forEach(b=>b.classList.add('locked'));
    document.getElementById('sq-expl').classList.add('show');document.getElementById('sq-expl-text').textContent=q.explanation;
    document.getElementById('sq-next').style.display='flex';document.getElementById('sq-next-label').textContent=state.simulacro.index<state.simulacro.questions.length-1?'Siguiente':'Ver puntaje';
    floatXP(correct?CONFIG.XP_CORRECT:CONFIG.XP_WRONG,document.getElementById('sopt-'+idx));
    updateHeader();
  }

  function sNext(){if(state.simulacro.index<state.simulacro.questions.length-1){state.simulacro.index++;renderSQuestion();}else showSResults();}

  function showSResults(){
    if(state.simulacro.timer)clearInterval(state.simulacro.timer);
    const correct=state.simulacro.answers.filter(Boolean).length,total=state.simulacro.questions.length,score=Math.round(correct/total*500);
    addXP(CONFIG.XP_SIMULACRO);state.progress.simulacros.push({date:new Date().toLocaleDateString(),score,correct,totalQuestions:total});saveProgress();
    document.getElementById('timer-wrap').style.display='none';
    let grade='Sigue practicando',gColor='#FF3B5C',gEmoji='💪';
    if(score>=400){grade='Excelente!';gColor='#FFB830';gEmoji='🏆';}else if(score>=300){grade='Buen trabajo!';gColor='#00C896';gEmoji='👏';}else if(score>=200){grade='Vas por buen camino';gColor='#4DA6FF';gEmoji='📈';}
    document.getElementById('sres-grade').textContent=gEmoji+' '+grade;document.getElementById('sres-grade').style.color=gColor;
    document.getElementById('sres-score').textContent=score;document.getElementById('sres-correct').textContent=correct+' / '+total+' correctas';
    document.getElementById('sres-xp').textContent='+ '+(state.simulacro.xp+CONFIG.XP_SIMULACRO)+' XP ganados';
    document.getElementById('sim-q-view').style.display='none';document.getElementById('sim-results').style.display='block';
    if(score>=400)launchConfetti(50,'badge');
    updateHeader();
  }

  function sBack(){
    if(state.simulacro.timer)clearInterval(state.simulacro.timer);
    document.getElementById('sim-results').style.display='none';document.getElementById('sim-home-view').style.display='block';document.getElementById('sim-q-view').style.display='none';
    document.getElementById('timer-wrap').style.display='none';renderSimulacro();
  }

  // ═══ PROGRESO ═══
  function renderProgreso(){
    const p=state.progress;
    document.getElementById('prog-areas').innerHTML=AREAS.map(a=>{const ap=p.areaProgress[a.id]||{answered:0,correct:0},acc=ap.answered>0?Math.round(ap.correct/ap.answered*100):0;return`<div class="progress-bar-area"><div class="progress-bar-header"><span class="progress-area-icon">${a.icon}</span><span class="progress-area-name">${a.name}</span><span class="progress-area-pct" style="color:${a.color}">${acc}%</span></div><div class="progress-area-track"><div class="progress-area-fill" style="width:${acc}%;background:${a.color}"></div></div><div style="font-size:10px;color:var(--text3);margin-top:4px">${ap.answered} preguntas · ${ap.correct} correctas</div></div>`;}).join('');
    // Streak calendar
    let calHTML='<div class="streak-cal">';
    for(let i=6;i>=0;i--){const d=new Date(Date.now()-i*86400000),ds=d.toDateString(),isToday=ds===new Date().toDateString(),studied=p.lastStudyDate===ds||(isToday&&p.lastStudyDate===new Date().toDateString());calHTML+=`<div class="cal-day${studied?' studied':''}${isToday?' today':''}">${['Do','Lu','Ma','Mi','Ju','Vi','Sa'][d.getDay()]}<div class="cal-dot"></div></div>`;}
    calHTML+='</div>';
    document.getElementById('streak-cal').innerHTML=calHTML;
    document.getElementById('streak-max').textContent=p.maxStreak+'d';
    const badges=[{id:'s3',name:'Constante',desc:'3 dias',icon:'🔥'},{id:'s7',name:'Dedicado',desc:'7 dias',icon:'🔥'},{id:'s14',name:'Imparable',desc:'14 dias',icon:'⚡'},{id:'s30',name:'Leyenda',desc:'30 dias',icon:'👑'},{id:'sim1',name:'Primer Simulacro',desc:'1 simulacro',icon:'🏆'},{id:'sc300',name:'Candidato',desc:'300+ pts',icon:'⭐'},{id:'sc400',name:'Avanzado',desc:'400+ pts',icon:'🌟'},{id:'xp1k',name:'Explorador',desc:'1000 XP',icon:'✨'},{id:'xp5k',name:'Experto',desc:'5000 XP',icon:'💎'}];
    document.getElementById('badge-grid').innerHTML=badges.map(b=>`<div class="badge-card ${p.badges.includes(b.id)?'unlocked':'locked'}"><div class="badge-icon">${b.icon}</div><div class="badge-name">${b.name}</div><div class="badge-desc">${b.desc}</div></div>`).join('');
    // Saved questions count
    document.getElementById('saved-count').textContent=state.saved.length;
  }

  // ═══ PERFIL ═══
  function renderPerfil(){
    const p=state.progress;
    document.getElementById('prof-name').textContent=state.user?.name||'Estudiante';document.getElementById('prof-xp').textContent=p.xp;
    document.getElementById('prof-level').textContent=p.level;document.getElementById('prof-streak').textContent=p.streak;
    document.getElementById('prof-badges').textContent=p.badges.length;document.getElementById('prof-version').textContent=CONFIG.VERSION;
  }

  // ═══ UPDATE ═══
  function renderUpdate(){
    document.getElementById('update-url-input').value=getUpdateURL();
    document.getElementById('upd-version').textContent=CONFIG.VERSION;
    document.getElementById('upd-q-count').textContent=state.questions.length;
    const activeTheme=getTheme();
    const themes=[{id:'default',name:'SaberPro',color:'#FF3B5C',bg:'linear-gradient(135deg,#FF2D55,#FFB830)'},{id:'cyber',name:'Cyber',color:'#00C8FF',bg:'linear-gradient(135deg,#004488,#00AAFF)'},{id:'emerald',name:'Esmeralda',color:'#00FF88',bg:'linear-gradient(135deg,#006633,#00CC66)'},{id:'sunset',name:'Atardecer',color:'#FF6030',bg:'linear-gradient(135deg,#CC3300,#FF8833)'},{id:'arctic',name:'Artico',color:'#88CCFF',bg:'linear-gradient(135deg,#224488,#66AAFF)'},{id:'amethyst',name:'Amatista',color:'#B366FF',bg:'linear-gradient(135deg,#4422AA,#9966FF)'},{id:'golden',name:'Dorado',color:'#FFB830',bg:'linear-gradient(135deg,#886600,#DAA520)'},{id:'crimson',name:'Carmesi',color:'#DC143C',bg:'linear-gradient(135deg,#660011,#CC2244)'},{id:'ocean',name:'Oceano',color:'#00B4B4',bg:'linear-gradient(135deg,#004444,#009999)'},{id:'rose',name:'Rosa',color:'#FF7099',bg:'linear-gradient(135deg,#882244,#FF5588)'},{id:'void',name:'Abismo',color:'#FFFFFF',bg:'linear-gradient(135deg,#222,#555)'}];
    document.getElementById('theme-grid').innerHTML=themes.map(t=>`<div class="theme-opt ${t.id===activeTheme?'active':''}" style="background:${t.bg}" onclick="App.setTheme('${t.id}')" title="${t.name}">${t.name}</div>`).join('');
  }

  // ═══ THEMES ═══
  function getTheme(){return localStorage.getItem(THEME_KEY)||'default';}
  function setTheme(id){localStorage.setItem(THEME_KEY,id);applyTheme(id);if(state.currentTab==='actualizar')renderUpdate();toast('Tema cambiado!');}
  function applyTheme(id){if(id==='default')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',id);}
  function initTheme(){applyTheme(getTheme());}

  // ═══ SWITCH TAB ═══
  function switchTab(tab){
    state.currentTab=tab;
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    const nav=document.querySelector(`.nav-item[data-tab="${tab}"]`);if(nav)nav.classList.add('active');
    const content=document.getElementById('tab-'+tab);if(content)content.classList.add('active');
    setTimeout(()=>{const cards=document.querySelectorAll('#tab-'+tab+' .area-card, #tab-'+tab+' .badge-card, #tab-'+tab+' .stats-row, #tab-'+tab+' .simulacro-card, #tab-'+tab+' .profile-card, #tab-'+tab+' .update-card');cards.forEach((c,i)=>{c.style.setProperty('--stagger',(i*0.04)+'s');c.style.animation='none';void c.offsetWidth;c.style.animation='';});},50);
    if(tab==='practica'&&!state.practice.area)renderPracticaHome();
    const renderers={home:renderHome,simulacro:renderSimulacro,progreso:renderProgreso,perfil:renderPerfil,actualizar:renderUpdate};
    if(renderers[tab])renderers[tab]();
    updateHeader();
  }

  // ═══ HEADER ═══
  function updateHeader(){
    const p=state.progress;if(!state.user)return;
    document.getElementById('h-name').textContent=state.user.name;document.getElementById('h-xp').textContent=p.xp;document.getElementById('h-streak').textContent=p.streak+'d';
    document.getElementById('xp-level').textContent=p.level;document.getElementById('xp-level-txt').textContent=p.level;
    document.getElementById('xp-cur').textContent=p.xp%CONFIG.XP_LEVEL;document.getElementById('xp-max').textContent=CONFIG.XP_LEVEL;
    document.getElementById('xp-fill').style.width=((p.xp%CONFIG.XP_LEVEL)/CONFIG.XP_LEVEL*100)+'%';
  }

  // ═══ PARTICLES ═══
  function initCinematicParticles(){
    const canvas=document.getElementById('splash-canvas');if(!canvas)return;const ctx=canvas.getContext('2d');let particles=[],streaks=[],w,h;
    function resize(){w=canvas.width=window.innerWidth;h=canvas.height=window.innerHeight;}resize();window.addEventListener('resize',resize);
    class Particle{constructor(){this.reset();this.y=Math.random()*h;}reset(){this.x=Math.random()*w;this.y=-10;this.vx=(Math.random()-0.5)*0.4;this.vy=Math.random()*1.2+0.3;this.size=Math.random()*1.5+0.5;this.alpha=Math.random()*0.6+0.1;this.life=1;this.decay=Math.random()*0.003+0.001;}update(){this.x+=this.vx;this.y+=this.vy;this.life-=this.decay;if(this.y>h+10||this.life<=0)this.reset();}draw(c){c.beginPath();c.arc(this.x,this.y,this.size,0,Math.PI*2);c.fillStyle=`rgba(255,59,92,${this.alpha*this.life})`;c.fill();}}
    class Streak{constructor(){this.reset();}reset(){this.x=Math.random()*w;this.y=Math.random()*h;this.len=Math.random()*60+30;this.angle=Math.random()*0.5-0.25;this.speed=Math.random()*1.5+0.5;this.alpha=0;this.fadeIn=true;this.life=Math.random()*2+1;}update(dt){this.x+=Math.cos(this.angle)*this.speed;this.y+=Math.sin(this.angle)*this.speed;this.life-=dt;if(this.fadeIn){this.alpha+=dt*0.5;if(this.alpha>=0.4)this.fadeIn=false;}else{this.alpha-=dt*0.3;}if(this.x<-50||this.x>w+50||this.y<-50||this.y>h+50||this.life<=0){this.reset();this.alpha=0;this.fadeIn=true;}}draw(c){c.save();c.translate(this.x,this.y);c.rotate(this.angle);const g=c.createLinearGradient(-this.len/2,0,this.len/2,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(0.5,`rgba(255,255,255,${this.alpha})`);g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(-this.len/2,-0.5,this.len,1);c.restore();}}
    for(let i=0;i<80;i++)particles.push(new Particle());for(let i=0;i<5;i++)streaks.push(new Streak());let lt=performance.now();
    (function anim(t){const dt=(t-lt)/1000;lt=t;ctx.fillStyle='rgba(0,0,0,0.15)';ctx.fillRect(0,0,w,h);particles.forEach(p=>{p.update();p.draw(ctx);});streaks.forEach(s=>{s.update(dt);s.draw(ctx);});requestAnimationFrame(anim);})(lt);
  }

  function initBackgroundParticles(){
    const canvas=document.getElementById('bg-particles');if(!canvas)return;const ctx=canvas.getContext('2d');let w,h,pts=[];
    function resize(){w=canvas.width=window.innerWidth;h=canvas.height=window.innerHeight;}resize();window.addEventListener('resize',resize);
    for(let i=0;i<45;i++)pts.push({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.5+0.3,vx:(Math.random()-0.5)*0.2,vy:-Math.random()*0.4-0.1,alpha:Math.random()*0.3+0.05});
    function draw(){if(document.getElementById('splash')&&!document.getElementById('splash').classList.contains('hide')){requestAnimationFrame(draw);return;}ctx.clearRect(0,0,w,h);pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.y<-10||p.x<0||p.x>w){p.y=h+10;p.x=Math.random()*w;}ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,99,132,${p.alpha})`;ctx.fill();});requestAnimationFrame(draw);}draw();
  }

  // ═══ LOGOUT ═══
  function logout(){if(state.simulacro.timer)clearInterval(state.simulacro.timer);localStorage.removeItem(sk('user'));location.reload();}

  return {
    init,doLogin,switchTab,startPractice,diagnoticoRapido,
    selectPAnswer,pNext,pAgain,pBack,toggleSave,
    startSimulacro,selectSAnswer,sNext,sBack,
    loadUpdateFile,tryRemoteUpdate,getUpdateURL,saveUpdateURL,logout,setTheme
  };
})();

document.addEventListener('DOMContentLoaded',()=>App.init());
