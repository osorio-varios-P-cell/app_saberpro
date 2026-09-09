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
      {id:'e1',area:'matematicas',question:'Un triangulo rectangulo tiene catetos 6 y 8. Hipotenusa?',options:['10','13','11','14'],correctIndex:0,explanation:'h=R(36+64)=10',difficulty:1,subcompetencia:'Geometria',competencia_icfes:'Interpretacion y representacion',source:'embedded'},
      {id:'e2',area:'matematicas',question:'Mediana de {3,7,9,12,15,18,22}:',options:['12','9','15','11'],correctIndex:0,explanation:'Posicion central=12',difficulty:1,subcompetencia:'Estadistica y Probabilidad',competencia_icfes:'Argumentacion',source:'embedded'},
      {id:'e3',area:'matematicas',question:'Se lanzan 2 dados. P(suma=7):',options:['1/6','5/36','1/12','7/36'],correctIndex:0,explanation:'6/36=1/6',difficulty:2,subcompetencia:'Estadistica y Probabilidad',competencia_icfes:'Argumentacion',source:'embedded'},
      {id:'e4',area:'matematicas',question:'Discriminante de x2+4x+5=0 es negativo. Soluciones:',options:['Ninguna real','Una real','Dos iguales','Dos distintas'],correctIndex:0,explanation:'Discriminante=-4<0',difficulty:2,subcompetencia:'Algebra',competencia_icfes:'Formulacion y ejecucion',source:'embedded'},
      {id:'e5',area:'lectura',question:'A pesar de las dificultades, logro superar metas. Conector:',options:['Causalidad','Concesion','Consecuencia','Condicion'],correctIndex:1,explanation:'A pesar de=concesion',difficulty:2,subcompetencia:'Vocabulario y gramatica',competencia_icfes:'Identificar contenidos locales',source:'embedded'},
      {id:'e6',area:'lectura',question:'El autor presenta tesis y argumentos. Tipo textual:',options:['Narrativo','Argumentativo','Descriptivo','Instructivo'],correctIndex:1,explanation:'Tesis+argumentos=argumentativo',difficulty:1,subcompetencia:'Tipologia textual',competencia_icfes:'Comprender sentido global',source:'embedded'},
      {id:'e7',area:'lectura',question:'Efimero significa:',options:['Eterno','Pasajero','Sorprendente','Valioso'],correctIndex:1,explanation:'Efimero=de corta duracion',difficulty:1,subcompetencia:'Vocabulario y gramatica',competencia_icfes:'Identificar contenidos locales',source:'embedded'},
      {id:'e8',area:'ciencias',question:'Productos de la fotosintesis:',options:['CO2 y agua','Glucosa y O2','Proteinas','Nitrogeno'],correctIndex:1,explanation:'CO2+H2O+luz->glucosa+O2',difficulty:1,subcompetencia:'Biologia',competencia_icfes:'Uso comprensivo del conocimiento cientifico',source:'embedded'},
      {id:'e9',area:'ciencias',question:'El sonido viaja mas rapido en:',options:['Liquido','Gas','Solido','Vacio'],correctIndex:2,explanation:'Solidos~5000m/s>liquidos>gases',difficulty:2,subcompetencia:'Fisica',competencia_icfes:'Uso comprensivo del conocimiento cientifico',source:'embedded'},
      {id:'e10',area:'ciencias',question:'Principal gas efecto invernadero de combustibles fosiles:',options:['O2','N2','CO2','O3'],correctIndex:2,explanation:'CO2=~76% de GEI humanos',difficulty:1,subcompetencia:'CTS (Ciencia, Tecnologia y Sociedad)',competencia_icfes:'Explicacion de fenomenos',source:'embedded'},
      {id:'e11',area:'sociales',question:'Constitucion colombiana vigente:',options:['1886','1948','1991','2001'],correctIndex:2,explanation:'Promulgada 4/jul/1991',difficulty:1,subcompetencia:'Constitucion y ciudadania',competencia_icfes:'Pensamiento social',source:'embedded'},
      {id:'e12',area:'sociales',question:'Mecanismo para proteger derechos fundamentales:',options:['Referendo','Accion popular','Tutela','Plebiscito'],correctIndex:2,explanation:'Art.86: accion de tutela',difficulty:1,subcompetencia:'Constitucion y ciudadania',competencia_icfes:'Pensamiento social',source:'embedded'},
      {id:'e13',area:'sociales',question:'Banco de la Republica sube tasas. Objetivo:',options:['Aumentar desempleo','Devaluar peso','Reducir exportaciones','Controlar inflacion'],correctIndex:3,explanation:'Politica contractiva',difficulty:2,subcompetencia:'Economia',competencia_icfes:'Interpretacion y analisis de perspectivas',source:'embedded'},
      {id:'e14',area:'ingles',question:'She ____ to the market yesterday.',options:['goes','go','gone','went'],correctIndex:3,explanation:'Past simple: went',difficulty:1,subcompetencia:'Gramatica',competencia_icfes:'Conocimiento gramatical',source:'embedded'},
      {id:'e15',area:'ingles',question:'Synonym of enormous:',options:['Small','Ancient','Beautiful','Huge'],correctIndex:3,explanation:'Enormous=very large=huge',difficulty:1,subcompetencia:'Vocabulario',competencia_icfes:'Conocimiento lexical',source:'embedded'},
      {id:'e16',area:'ingles',question:'A:Where is the bus station? B:_____',options:['I dont have a car','It is 3 PM','Buses are slow','Go straight and turn left'],correctIndex:3,explanation:'La pregunta pide direcciones',difficulty:1,subcompetencia:'Comunicativo',competencia_icfes:'Conocimiento comunicativo',source:'embedded'},
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
  function mdToHTML(text){
    if(typeof text!=="string")return String(text||"");
    var h=text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");h=h.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,'<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:8px 0;">');
    h=h.replace(/\|[ \t]+\|/g,"|\n|");
    var tipoG="",paramP="";
    h=h.replace(/^\s*\|@(pie|picto|linea|barras)((?::[^|\n]+)?)\|\s*$/gm,function(m,k,pm){if(!tipoG){tipoG=k;paramP=pm?pm.slice(1):"";}return "";});
    h=h.replace(/^\s*\|@fig:([a-z]+)((?:\|[a-z]+=[^|\n]*)*)\|\s*$/gm,function(m,sh,prm){return buildFig(sh,prm)||"";});
    if(h.indexOf("|")>-1){
      var lines=h.split("\n"),inT=false,tL=[],res=[];
      var flushT=function(){
        if(!inT||!tL.length)return;
        if(tipoG==="picto"){res.push(buildPicto(tL,paramP));}
        else{res.push(buildChart(tL,tipoG==="pie"?"pie":tipoG==="linea"?"xy":"")+renderTable(tL));}
        tL=[];inT=false;
      };
      for(var i=0;i<lines.length;i++){
        var l=lines[i].trim();
        if(l.charAt(0)!=="|"&&l.indexOf("|")>0){var fi=l.indexOf("|");var rest=l.slice(fi);if(rest.split("|").length>=4){lines.splice(i,1,l.slice(0,fi),rest);continue;}}
        if(l.charAt(0)==="|"&&l.charAt(l.length-1)!=="|"&&l.lastIndexOf("|")>0){var cut=l.lastIndexOf("|")+1;lines.splice(i+1,0,l.slice(cut));l=l.slice(0,cut);}
        if(l.charAt(0)==="|"&&l.charAt(l.length-1)==="|"){
          if(!inT){inT=true;tL=[];}
          tL.push(l);
        }else{
          flushT();
          res.push(l);
        }
      }
      flushT();
      h=res.join("<br>");
    }
    if(h.indexOf("<table")===-1)h=h.replace(/\n\n/g,"<br><br>").replace(/\n/g,"<br>");
    h=h.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>");
    return h;
  }
  function esSepRow(l){var cs=l.slice(1,-1).split("|").map(function(x){return x.trim();});return cs.length>0&&cs.every(function(x){return /^:?-+:?$/.test(x);});}
  function renderTable(lines){
    var c=[],align=null;
    for(var i=0;i<lines.length;i++){
      if(esSepRow(lines[i])){if(!align){align=lines[i].slice(1,-1).split("|").map(function(x){x=x.trim();if(/^:-+:$/.test(x))return"center";if(/-+:$/.test(x))return"right";return"left";});}continue;}
      c.push(lines[i]);
    }
    function al(j){return align&&align[j]?align[j]:"left";}
    return "<div class=\"q-table-wrap\"><table class=\"q-table\">"+c.map(function(l,i){var cells=l.slice(1,-1).split("|").map(function(x){return x.trim();});var t=i===0?"th":"td";return "<tr>"+cells.map(function(x,j){var a=t==="th"?"center":al(j);return "<"+t+(a!=="left"?" style=\"text-align:"+a+"\"":"")+">"+x+"</"+t+">";}).join("")+"</tr>";}).join("")+"</table></div>";
  }
  function buildXY(pts){
    try{
      pts=pts.slice().sort(function(a,b){return a.x-b.x;});
      var xs=pts.map(function(p){return p.x;}),ys=pts.map(function(p){return p.y;});
      var xmin=Math.min.apply(null,xs),xmax=Math.max.apply(null,xs);
      var ymin=Math.min.apply(null,ys),ymax=Math.max.apply(null,ys);
      if(xmin===xmax&&ymin===ymax)return"";
      ymin=Math.min(0,ymin);ymax=Math.max(0.0001,ymax);
      if(xmin===xmax){xmin-=1;xmax+=1;}
      if(ymin===ymax){ymin-=1;ymax+=1;}
      var W=340,H=210,L=42,R=16,T=12,B=176;
      function sx(v){return L+(v-xmin)/(xmax-xmin)*(W-L-R);}
      function sy(v){return B-(v-ymin)/(ymax-ymin)*(B-T);}
      var s='<svg class="q-chart" viewBox="0 0 340 '+H+'">';
      for(var g=0;g<=4;g++){var gy=T+g*(B-T)/4;s+='<line x1="'+L+'" y1="'+gy.toFixed(1)+'" x2="'+(W-R)+'" y2="'+gy.toFixed(1)+'" stroke="rgba(255,255,255,0.07)"/>';}
      var y0=sy(Math.max(ymin,Math.min(ymax,0)));
      s+='<line x1="'+L+'" y1="'+B+'" x2="'+(W-R)+'" y2="'+B+'" stroke="rgba(255,255,255,0.45)" stroke-width="1.3"/>';
      s+='<line x1="'+L+'" y1="'+T+'" x2="'+L+'" y2="'+B+'" stroke="rgba(255,255,255,0.45)" stroke-width="1.3"/>';
      if(ymin<0)s+='<line x1="'+L+'" y1="'+y0.toFixed(1)+'" x2="'+(W-R)+'" y2="'+y0.toFixed(1)+'" stroke="rgba(255,255,255,0.3)" stroke-dasharray="3 3"/>';
      var d='';
      for(var i2=0;i2<pts.length;i2++){d+=(i2?'L':'M')+sx(pts[i2].x).toFixed(1)+' '+sy(pts[i2].y).toFixed(1)+' ';}
      s+='<path d="'+d+'" fill="none" stroke="#FFB830" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
      for(var i3=0;i3<pts.length;i3++){s+='<circle cx="'+sx(pts[i3].x).toFixed(1)+'" cy="'+sy(pts[i3].y).toFixed(1)+'" r="3.5" fill="#FF6030" stroke="#fff" stroke-width="0.8"/>';}
      s+='<text x="'+L+'" y="'+(B+16)+'" font-size="10">'+xmin+'</text>';
      s+='<text x="'+(W-R)+'" y="'+(B+16)+'" font-size="10" text-anchor="end">'+xmax+'</text>';
      s+='<text x="'+(L-5)+'" y="'+(T+8)+'" font-size="10" text-anchor="end">'+ymax+'</text>';
      s+='<text x="'+(L-5)+'" y="'+B+'" font-size="10" text-anchor="end">'+ymin+'</text>';
      s+='<text x="'+(W-R)+'" y="'+(T+8)+'" font-size="9" text-anchor="end" opacity="0.7">y</text>';
      s+='<text x="'+(W-R)+'" y="'+(B-6)+'" font-size="9" text-anchor="end" opacity="0.7">x</text>';
      return s+'</svg>';
    }catch(e){return"";}
  }
  function buildPie(lines){
    try{
      var total=0,vals=[];
      for(var i=0;i<lines.length;i++){
        var cells=lines[i].slice(1,-1).split("|").map(function(x){return x.trim();});
        if(cells.length<2)continue;
        var v=parseFloat(String(cells[1]).replace(",","."));
        if(isNaN(v)||v<=0)continue;
        vals.push({l:cells[0],v:v});total+=v;
      }
      if(vals.length<2||vals.length>8||total<=0)return"";
      var cols=["#FF3B5C","#FFB830","#00C896","#4DA6FF","#A855F7","#FF7099","#00E5FF","#FF8C30"];
      var R=60,CX=88,CY=100,C=2*Math.PI*R,off=0;
      var s='<svg class="q-chart" viewBox="0 0 340 210">';
      s+='<circle cx="'+CX+'" cy="'+CY+'" r="'+R+'" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="36"/>';
      for(var j=0;j<vals.length;j++){
        var len=(vals[j].v/total)*C;
        s+='<circle cx="'+CX+'" cy="'+CY+'" r="'+R+'" fill="none" stroke="'+cols[j%cols.length]+'" stroke-width="36" stroke-dasharray="'+len.toFixed(1)+' '+(C-len).toFixed(1)+'" stroke-dashoffset="'+(-off).toFixed(1)+'" transform="rotate(-90 '+CX+' '+CY+')"/>';
        off+=len;
      }
      s+='<text x="'+CX+'" y="'+(CY+4)+'" font-size="13" font-weight="bold" text-anchor="middle">'+Math.round(total)+'%</text>';
      var ly=42;
      for(var k2=0;k2<vals.length;k2++){
        var pct=Math.round(vals[k2].v/total*100);
        s+='<rect x="188" y="'+(ly-9)+'" width="12" height="12" rx="3" fill="'+cols[k2%cols.length]+'"/>';
        s+='<text x="206" y="'+ly+'" font-size="11">'+vals[k2].l+' ('+pct+'%)</text>';
        ly+=27;
      }
      return s+'</svg>';
    }catch(e){return"";}
  }
  function buildPicto(lines,glyph){
    try{
      var g=glyph||'★',rows=[],max=0;
      for(var i=0;i<lines.length;i++){
        var cs=lines[i].slice(1,-1).split("|").map(function(x){return x.trim();});
        if(cs.length<2)continue;
        var v=parseInt(cs[1]);if(isNaN(v))continue;
        rows.push({l:cs[0],v:v});if(v>max)max=v;
      }
      if(!rows.length||max<=0||rows.length>8)return"";
      var s='<div class="q-picto">';
      for(var j2=0;j2<rows.length;j2++){
        var n=Math.max(1,Math.round(rows[j2].v/max*10));
        var ico='';for(var m3=0;m3<n;m3++)ico+=g;
        s+='<div class="picto-row"><span class="picto-l">'+rows[j2].l+'</span><span class="picto-i">'+ico+'</span><span class="picto-v">'+rows[j2].v+'</span></div>';
      }
      return s+'</div>';
    }catch(e){return"";}
  }
  function buildFig(shape,params){
    try{
      var p={};(params||"").split("|").forEach(function(kv){if(!kv)return;var pr=kv.split("=");if(pr.length===2)p[pr[0].trim()]=parseFloat(pr[1]);});
      var s='<svg class="q-chart" viewBox="0 0 340 210">';
      if(shape==='triangulo'){
        var b=p.b||8,hh=p.h||5;
        s+='<polygon points="40,170 300,170 170,40" fill="rgba(77,166,255,0.15)" stroke="#4DA6FF" stroke-width="2"/>';
        s+='<line x1="170" y1="170" x2="170" y2="40" stroke="rgba(255,255,255,0.4)" stroke-dasharray="4 3"/>';
        s+='<text x="170" y="192" font-size="11" text-anchor="middle">b = '+b+'</text>';
        s+='<text x="178" y="105" font-size="11">h = '+hh+'</text>';
      }else if(shape==='rectangulo'){
        var a1=p.a||10,b2=p.b||6;
        s+='<rect x="60" y="45" width="220" height="120" fill="rgba(0,200,150,0.12)" stroke="#00C896" stroke-width="2"/>';
        s+='<text x="170" y="188" font-size="11" text-anchor="middle">a = '+a1+'</text>';
        s+='<text x="40" y="110" font-size="11" text-anchor="middle" transform="rotate(-90 40 110)">b = '+b2+'</text>';
      }else if(shape==='circulo'){
        var r=p.r||5;
        s+='<circle cx="140" cy="105" r="78" fill="rgba(168,85,247,0.12)" stroke="#A855F7" stroke-width="2"/>';
        s+='<line x1="140" y1="105" x2="218" y2="105" stroke="#fff" stroke-width="1.5"/>';
        s+='<circle cx="140" cy="105" r="2.5" fill="#fff"/>';
        s+='<text x="180" y="98" font-size="11">r = '+r+'</text>';
      }else{return"";}
      return s+'</svg>';
    }catch(e){return"";}
  }
  function buildChart(lines,tipo){
    try{
      var c=[];for(var i=0;i<lines.length;i++){if(!esSepRow(lines[i]))c.push(lines[i]);}
      if(tipo==="pie"){var pp=buildPie(c);if(pp)return pp;}
      if(c.length<2)return"";
      function num(s){var m=String(s).replace(/,(?=\d{3}\b)/g,"").match(/-?\d+(?:[.,]\d+)?/);return m?parseFloat(m[0].replace(",",".")):null;}
      function cellsOf(l){return l.slice(1,-1).split("|").map(function(x){return x.trim();});}
      var hdr=cellsOf(c[0]);
      var matrix=[];for(var j=1;j<c.length;j++){matrix.push(cellsOf(c[j]));}
      if(matrix.length>=(tipo==="xy"?2:3)){
        var esXY=true;var pts=[];
        for(var w1=0;w1<matrix.length;w1++){
          if(matrix[w1].length<2){esXY=false;break;}
          var xv=num(matrix[w1][0]),yv=num(matrix[w1][1]);
          if(xv===null||yv===null){esXY=false;break;}
          pts.push({x:xv,y:yv});
        }
        if(esXY){var pxy=buildXY(pts);if(pxy)return pxy;}
      }
      var pairs=null;
      if(matrix.length>=2){
        var nCols=0;for(var q1=0;q1<matrix.length;q1++){if(matrix[q1].length>nCols)nCols=matrix[q1].length;}
        var valCol=-1;
        for(var col=1;col<nCols&&valCol<0;col++){
          var cnt=0;for(var r2=0;r2<matrix.length;r2++){if(matrix[r2].length>col&&num(matrix[r2][col])!==null)cnt++;}
          if(cnt>=2&&cnt*2>=matrix.length)valCol=col;
        }
        if(valCol>0){
          pairs=[];
          for(var r3=0;r3<matrix.length;r3++){
            if(matrix[r3].length>valCol&&matrix[r3][0]!==""&&num(matrix[r3][valCol])!==null)pairs.push({l:matrix[r3][0],v:num(matrix[r3][valCol])});
          }
        }
      }else if(matrix.length===1&&hdr.length>=3){
        var row=matrix[0];pairs=[];
        for(var p1=1;p1<hdr.length&&p1<row.length;p1++){
          var v=num(row[p1]);
          if(v!==null&&hdr[p1]!=="")pairs.push({l:String(hdr[p1]),v:v});
        }
      }
      if(!pairs||pairs.length<2||pairs.length>10)return"";
      var neg=false;for(var n2=0;n2<pairs.length;n2++){if(pairs[n2].v<0){neg=true;break;}}
      if(neg)return"";
      var max=-Infinity;for(var n3=0;n3<pairs.length;n3++){if(pairs[n3].v>max)max=pairs[n3].v;}
      if(!isFinite(max)||max===0)return"";
      var longLbl=false;for(var n4=0;n4<pairs.length;n4++){if(String(pairs[n4].l).length>6){longLbl=true;break;}}
      var G1="#FFB830",G2="#FF6030";
      var svg='<svg class="q-chart" viewBox="0 0 340 __H__" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="qgc" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="'+G2+'"/><stop offset="1" stop-color="'+G1+'"/></linearGradient></defs>';
      if(!longLbl){
        var W=340,H=210,L=34,B=176,T=14;
        svg=svg.replace("__H__",String(H));
        var step=(W-L-12)/pairs.length,bw=Math.min(44,step*0.62);
        for(var k=0;k<pairs.length;k++){
          var hh=Math.max(3,(pairs[k].v/max)*(B-T));
          var x=L+step*k+(step-bw)/2,y=B-hh;
          var lbl=String(pairs[k].l);if(lbl.length>8)lbl=lbl.slice(0,7)+'…';
          svg+='<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+hh.toFixed(1)+'" rx="4" fill="url(#qgc)"/>';
          svg+='<text x="'+(x+bw/2).toFixed(1)+'" y="'+(y-5).toFixed(1)+'" font-size="11" font-weight="bold" text-anchor="middle">'+pairs[k].v+'</text>';
          svg+='<text x="'+(x+bw/2).toFixed(1)+'" y="'+(B+14)+'" font-size="10.5" text-anchor="middle">'+lbl+'</text>';
        }
        svg+='<line x1="'+L+'" y1="'+B+'" x2="'+W+'" y2="'+B+'" stroke="rgba(255,255,255,0.3)" stroke-width="1.2"/>';
      }else{
        var H2=210,pad=16,padB=12,usable=H2-pad-padB;
        svg=svg.replace("__H__",String(H2));
        var rowH=usable/pairs.length,maxL=112,bwMax=340-maxL-44;
        for(var m2=0;m2<pairs.length;m2++){
          var y2=pad+m2*rowH;
          var w=Math.max(5,(pairs[m2].v/max)*bwMax);
          var lbl2=String(pairs[m2].l);if(lbl2.length>16)lbl2=lbl2.slice(0,15)+'…';
          svg+='<text x="'+(maxL-6)+'" y="'+(y2+rowH/2+3.5).toFixed(1)+'" font-size="10.5" text-anchor="end">'+lbl2+'</text>';
          svg+='<rect x="'+maxL+'" y="'+(y2+rowH*0.2).toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+(rowH*0.6).toFixed(1)+'" rx="4" fill="url(#qgc)"/>';
          svg+='<text x="'+(maxL+w+6).toFixed(1)+'" y="'+(y2+rowH/2+3.5).toFixed(1)+'" font-size="11" font-weight="bold">'+pairs[m2].v+'</text>';
        }
      }
      return svg+"</svg>";
    }catch(e){return"";}
  }

  async function init(){
    state.saved=loadSaved();
    initCinematicParticles();
    state.questions=getEmbedded();
    try{const resp=await fetch('data/questions.json');if(resp.ok)state.questions=await resp.json();}catch(e){}
    state.user=loadUser();state.progress=loadProgress();
    AREAS.forEach(a=>{if(!state.progress.areaProgress[a.id])state.progress.areaProgress[a.id]={answered:0,correct:0};});
    initTheme();
    window.addEventListener('scroll',updateScrollHint,{passive:true});
    checkForUpdate();
    setTimeout(()=>{document.getElementById('splash').classList.add('hide');initBackgroundParticles();
      const doShowApp = () => { if(state.user&&state.user.validated){showApp();}else{showLogin();} };
      if (window.LicenseClient && LicenseClient.enabled()) {
        LicenseClient.checkExpiry().then(chk => {
          if (!chk.active) {
            if (chk.expired) { state.user = null; saveUser(null); showLogin(); setTimeout(() => { const s = document.getElementById('login-status'); if (s) { s.className = 'status-msg error'; s.textContent = 'Tu licencia de 6 meses venció. Renueva comprando un código nuevo.'; } }, 400); }
            else { doShowApp(); }
            return;
          }
          if (state.user && state.user.validated) { LicenseClient.reactivate().then(r => { if (r.ok) showApp(); else showLogin(); }).catch(() => doShowApp()); return; }
          doShowApp();
        });
        return;
      }
      if(state.user&&state.user.validated){showApp();}else{showLogin();}
    },3300);
  }

  function showLogin(){document.getElementById('login-screen').classList.add('active');}
  function showApp(){document.getElementById('login-screen').classList.remove('active');document.getElementById('app-screen').classList.add('active');updateHeader();switchTab('home');}

  function doLogin(){
    const name=document.getElementById('login-name').value.trim(),code=document.getElementById('login-code').value.trim().toUpperCase(),status=document.getElementById('login-status');
    if(!name){status.className='status-msg error';status.textContent='Ingresa tu nombre';return;}
    if(!code){status.className='status-msg error';status.textContent='Ingresa el codigo de acceso';return;}

    // Modo servidor: activación con licencia firmada (6 meses, 1 dispositivo)
    if (window.LicenseClient && LicenseClient.enabled()) {
      LicenseClient.activate(name, code).then(r => {
        const deviceId2 = DeviceFingerprint.generate(), deviceName2 = DeviceFingerprint.getDeviceName();
        if (r.ok) {
          status.className = 'status-msg success'; status.textContent = 'Licencia activada! Bienvenido/a ' + name;
          state.user = { name, validated: true, code, deviceId: deviceId2, deviceName: deviceName2, loginDate: new Date().toISOString(), _uid: name + '_' + Date.now() };
          saveUser(state.user); updateAdminUserRecord(name, code, deviceId2, deviceName2);
          setTimeout(() => { showApp(); }, 800);
        } else { status.className = 'status-msg error'; status.textContent = r.reason; }
      }).catch(e => { status.className = 'status-msg error'; status.textContent = 'Error de conexión con el servidor de licencias'; });
      return;
    }

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
    const sorted=AREAS.map(a=>{const ap=p.areaProgress[a.id]||{answered:0,correct:0};return{...a,acc:ap.answered>0?ap.correct/ap.answered:1,n:ap.answered};}).sort((a,b)=>a.acc-b.acc);
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
    switchTab('practica');
    const pool=state.questions.filter(q=>q.area===areaId);if(!pool.length){toast('No hay preguntas en esta area');return;}
    const nSes=Math.min(CONFIG.SESSION_SIZE,pool.length);
    const questions=sampleArea(areaId,nSes);
    state.practice={area:areaId,questions:questions,index:0,answers:[],selected:null,xp:0};
    document.getElementById('practica-area-view').style.display='none';document.getElementById('practica-q-view').style.display='block';
    const area=AREAS.find(a=>a.id===areaId);document.getElementById('pq-area-name').textContent=area.name;document.getElementById('pq-area-icon').textContent=area.icon;
    renderPQuestion();
  }

  function renderPQuestion(){
    const q=state.practice.questions[state.practice.index],area=AREAS.find(a=>a.id===q.area)||{name:q.area,icon:"📊",color:"#FFB830"};state.practice.selected=null;
    document.getElementById('pq-progress').innerHTML=state.practice.questions.map((_,i)=>`<div class="q-dot${i===state.practice.index?' current':''}${i<state.practice.answers.length?(state.practice.answers[i]?' good':' bad'):''}"></div>`).join('');
    document.getElementById('pq-tag').textContent=area.name;document.getElementById('pq-tag').style.background=area.color+'22';document.getElementById('pq-tag').style.color=area.color;
    document.getElementById('pq-num').textContent=state.practice.index+1;document.getElementById('pq-total').textContent=state.practice.questions.length;
    document.getElementById('pq-text').innerHTML=mdToHTML(q.question);
    document.getElementById('pq-diff').textContent=difficultyStars(q.difficulty||1);
    document.getElementById('pq-source').textContent=q.subcompetencia||'';document.getElementById('pq-source').style.display=q.subcompetencia?'block':'none';
    const letters=['A','B','C','D'];document.getElementById('pq-options').innerHTML=q.options.map((opt,i)=>`<button class="option-btn" onclick="App.selectPAnswer(${i})" id="popt-${i}"><span class="opt-letter">${letters[i]}</span><span class="opt-body">${mdToHTML(opt)}</span></button>`).join('');
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
    document.getElementById('pq-expl').classList.add('show');document.getElementById('pq-expl-text').innerHTML=(q.competencia_icfes?'<div class="comp-tag">Competencia ICFES: '+q.competencia_icfes+'</div>':'')+mdToHTML(q.explanation);
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
    const aid=state.practice.area||'diagnostic';const ap2=state.progress.areaProgress[aid]||{answered:0,correct:0};ap2.answered+=state.practice.answers.length;ap2.correct+=correct;state.progress.areaProgress[aid]=ap2;saveProgress();document.getElementById('practica-q-view').style.display='none';document.getElementById('practica-results').style.display='block';
    if(pct>=80)launchConfetti(30);
    updateHeader();
  }

  function pAgain(){document.getElementById('practica-results').style.display='none';document.getElementById('practica-q-view').style.display='block';var a=state.practice.area;if(!a||a==='diagnostic'){diagnoticoRapido();}else{startPractice(a);}}
  function pBack(){document.getElementById('practica-results').style.display='none';state.practice.area=null;renderPracticaHome();}
  function startGraphPractice(){
    if(!state._grafPool){
      state._grafPool=state.questions.filter(function(q){var h=mdToHTML(q.question+" "+(q.options||[]).join(" "));return h.indexOf("<svg")>-1||h.indexOf("<table")>-1;});
    }
    var pool=state._grafPool;
    if(!pool.length){toast("Aun no hay preguntas con graficas");return;}
    var shuffled=[...pool].sort(()=>Math.random()-0.5);
    state.practice={area:'graficas',questions:shuffled.slice(0,Math.min(CONFIG.SESSION_SIZE,shuffled.length)),index:0,answers:[],selected:null,xp:0};
    switchTab('practica');
    document.getElementById('practica-area-view').style.display='none';document.getElementById('practica-q-view').style.display='block';
    renderPQuestion();
  }

  function diagnoticoRapido(){
    const areaB=AREAS.map(a=>({match:q=>q.area===a.id,share:OFFICIAL_SHARES[a.id]}));
    const questions=sampleWeighted(state.questions,15,areaB);
    state.practice={area:'diagnostic',questions:questions,index:0,answers:[],selected:null,xp:0};
    document.getElementById('practica-area-view').style.display='none';document.getElementById('practica-q-view').style.display='block';
    document.getElementById('pq-area-name').textContent='Diagnostico Rapido';document.getElementById('pq-area-icon').textContent='🎯';
    renderPQuestion();
  }

  // ═══ SIMULACRO ═══
  function renderSimulacro(){
    const sims=state.progress.simulacros;
    document.getElementById('sim-history').innerHTML=sims.length===0?'<p style="color:var(--text3);text-align:center;padding:20px">Aun no has hecho simulacros</p>':sims.slice(-5).reverse().map(s=>`<div style="display:flex;justify-content:space-between;padding:10px;background:var(--card);border:1px solid var(--border);border-radius:10px;margin-bottom:6px;font-size:12px"><span>${s.date}</span><span style="color:var(--coral);font-weight:700">${Math.round(s.score)} pts</span><span style="color:var(--text3)">${s.correct}/${s.totalQuestions}</span></div>`).join('');
  }

  // ═══ MUESTREO PONDERADO CON PROPORCIONES OFICIALES ICFES 2026 ═══
  function normK(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
  const OFFICIAL_SHARES={matematicas:.1969,lectura:.1614,ciencias:.2283,sociales:.1969,ingles:.2165};
  const COMP_RULES={
    matematicas:[{m:['interpretacion'],s:.34},{m:['formulacion'],s:.43},{m:['argumentacion'],s:.23}],
    lectura:[{m:['locales','explicita'],s:.25},{m:['global','interpretacion'],s:.42},{m:['reflexionar'],s:.33}],
    ciencias:[{m:['explicacion','representacion'],s:.30},{m:['indagacion','formulacion'],s:.40},{m:['uso comprensivo'],s:.30}],
    sociales:[{m:['pensamiento social'],s:.30},{m:['analisis de perspectivas','representacion'],s:.40},{m:['pensamiento reflexivo'],s:.30}],
    ingles:[{m:['parte 1','conocimiento lexical'],s:.11},{m:['parte 2','pragmatico'],s:.11},{m:['parte 3','comunicativo'],s:.11},{m:['parte 4'],s:.18},{m:['parte 5','comprension literal'],s:.16},{m:['parte 6','inferencial'],s:.11},{m:['parte 7','gramatico-lexical'],s:.22}]
  };
  function matchRule(q,rule){
    const c=normK(q.competencia_icfes),s=normK(q.subcompetencia);
    return rule.m.some(m=>c.indexOf(m)>-1||s.indexOf(m)>-1);
  }
  function sampleWeighted(pool,n,buckets){
    const groups=buckets.map(b=>({qs:pool.filter(b.match),share:b.share,target:0}));
    const tsum=groups.reduce((t,g)=>t+g.share,0)||1;
    groups.forEach(g=>g.share=g.share/tsum);
    groups.forEach(g=>g.target=Math.min(g.qs.length,Math.floor(n*g.share+0.5)));
    let guard=0;
    while(groups.reduce((t,g)=>t+g.target,0)<n&&guard<200){
      guard++;
      let best=null,bestDef=-1e9;
      groups.forEach(g=>{
        if(g.target<g.qs.length){const def=g.share*n-g.target;if(def>bestDef){bestDef=def;best=g;}}
      });
      if(!best)break;
      best.target++;
    }
    const picked=[];
    groups.forEach(g=>{const s=[...g.qs].sort(()=>Math.random()-0.5);picked.push(...s.slice(0,g.target));});
    if(picked.length<n){
      const used=new Set(picked);
      const rest=[...pool].filter(q=>!used.has(q)).sort(()=>Math.random()-0.5);
      picked.push(...rest.slice(0,n-picked.length));
    }
    return [...picked].sort(()=>Math.random()-0.5);
  }
  function sampleArea(areaId,n){
    const aq=state.questions.filter(q=>q.area===areaId);
    if(!aq.length)return[];
    const rules=(COMP_RULES[areaId]||[]).map(r=>({match:q=>matchRule(q,r),share:r.s}));
    return rules.length?sampleWeighted(aq,n,rules):[...aq].sort(()=>Math.random()-0.5).slice(0,n);
  }
  function startSimulacro(qCount,simTime){
    qCount=qCount||CONFIG.SIM_SIZE;simTime=simTime||CONFIG.SIM_TIME;
    const pool=[];AREAS.forEach(a=>{pool.push(...sampleArea(a.id,Math.round(qCount*OFFICIAL_SHARES[a.id])));});
    state.simulacro={questions:[...pool].sort(()=>Math.random()-0.5).slice(0,qCount),index:0,answers:[],selected:null,xp:0,timer:null,timeLeft:simTime};
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
    document.getElementById('sq-text').innerHTML=mdToHTML(q.question);
    document.getElementById('sq-diff').textContent=difficultyStars(q.difficulty||1);
    const letters=['A','B','C','D'];document.getElementById('sq-options').innerHTML=q.options.map((opt,i)=>`<button class="option-btn" onclick="App.selectSAnswer(${i})" id="sopt-${i}"><span class="opt-letter">${letters[i]}</span><span class="opt-body">${mdToHTML(opt)}</span></button>`).join('');
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
    document.getElementById('sq-expl').classList.add('show');document.getElementById('sq-expl-text').innerHTML=(q.competencia_icfes?'<div class="comp-tag">Competencia ICFES: '+q.competencia_icfes+'</div>':'')+mdToHTML(q.explanation);
    document.getElementById('sq-next').style.display='flex';document.getElementById('sq-next-label').textContent=state.simulacro.index<state.simulacro.questions.length-1?'Siguiente':'Ver puntaje';
    floatXP(correct?CONFIG.XP_CORRECT:CONFIG.XP_WRONG,document.getElementById('sopt-'+idx));
    updateHeader();
  }

  function sNext(){if(state.simulacro.index<state.simulacro.questions.length-1){state.simulacro.index++;renderSQuestion();}else showSResults();}

  function showSResults(){
    if(state.simulacro.timer)clearInterval(state.simulacro.timer);
    const correct=state.simulacro.answers.filter(Boolean).length,total=state.simulacro.questions.length,score=Math.round(correct/total*500);
    const areaStats={};state.simulacro.questions.forEach((q,i)=>{areaStats[q.area]=areaStats[q.area]||{answered:0,correct:0};areaStats[q.area].answered++;if(state.simulacro.answers[i])areaStats[q.area].correct++;});Object.keys(areaStats).forEach(aid2=>{if(state.progress.areaProgress[aid2]){state.progress.areaProgress[aid2].answered=(state.progress.areaProgress[aid2].answered||0)+areaStats[aid2].answered;state.progress.areaProgress[aid2].correct=(state.progress.areaProgress[aid2].correct||0)+areaStats[aid2].correct;}});saveProgress();addXP(CONFIG.XP_SIMULACRO);state.progress.simulacros.push({date:new Date().toLocaleDateString(),score,correct,totalQuestions:total});saveProgress();
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
    document.getElementById('timer-wrap').style.display='none';switchTab('home');
  }

  function sAgain(){
    document.getElementById('sim-results').style.display='none';
    document.getElementById('sim-home-view').style.display='none';
    startSimulacro();
  }

  // ═══ PROGRESO ═══
  function renderProgreso(){
    const p=state.progress;
    document.getElementById('prog-areas').innerHTML=AREAS.map(a=>{const ap=p.areaProgress[a.id]||{answered:0,correct:0},totalArea=state.questions.filter(q=>q.area===a.id).length,coverage=totalArea>0?(ap.correct/totalArea*100).toFixed(1):0;return`<div class="progress-bar-area"><div class="progress-bar-header"><span class="progress-area-icon">${a.icon}</span><span class="progress-area-name">${a.name}</span><span class="progress-area-pct" style="color:${a.color}">${coverage}%</span></div><div class="progress-area-track"><div class="progress-area-fill" style="width:${coverage}%;background:${a.color}"></div></div><div style="font-size:10px;color:var(--text3);margin-top:4px">${ap.answered} preguntas · ${ap.correct} correctas — ${coverage}% de ${totalArea}</div></div>`;}).join('');
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
  
  function updateScrollHint(){
    const hint=document.getElementById('scroll-hint');
    if(!hint)return;
    const scrollable=document.scrollingElement||document.documentElement;
    const maxScroll=scrollable.scrollHeight-scrollable.clientHeight;
    const scrolled=scrollable.scrollTop;
    // Show when there's content below, hide only when at bottom (within 40px)
    if(maxScroll>60&&scrolled<maxScroll-40){
      hint.classList.remove('hidden');
    }else{
      hint.classList.add('hidden');
    }
  }

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
    setTimeout(updateScrollHint,400);
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
    init,doLogin,switchTab,startPractice,diagnoticoRapido,startGraphPractice,
    selectPAnswer,pNext,pAgain,pBack,toggleSave,
    startSimulacro,selectSAnswer,sNext,sBack,
    loadUpdateFile,tryRemoteUpdate,getUpdateURL,saveUpdateURL,logout,setTheme
  };
})();

document.addEventListener('DOMContentLoaded',()=>App.init());
