const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const shuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const store={get(k){try{return localStorage.getItem(k)}catch(_){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(_){}},del(k){try{localStorage.removeItem(k)}catch(_){}}};

/* Navegación */
function show(id){["home","nom","lab","co2","gas"].forEach(x=>$("#"+x).hidden=x!=id);scrollTo(0,0)}
$$("[data-go]").forEach(b=>b.onclick=()=>show(b.dataset.go));
$$("[data-home]").forEach(b=>b.onclick=()=>show("home"));
$$("[data-reset]").forEach(b=>b.onclick=()=>b.closest("#nom")?nomReset():b.closest("#co2")?co2Reset():b.closest("#gas")?gasReset():labReset());

/* ===== SIM 1: Nomenclatura ===== */
const C=[["Na","+1","sodio"],["K","+1","potasio"],["Li","+1","litio"],["Ag","+1","plata"],["NH4","+1","amonio"],["Mg","+2","magnesio"],["Ca","+2","calcio"],["Ba","+2","bario"],["Zn","+2","zinc"],["Al","+3","aluminio"],
["Fe","+2","ferroso"],["Fe","+3","férrico"],["Cu","+1","cuproso"],["Cu","+2","cúprico"],["Hg","+1","mercuroso"],["Hg","+2","mercúrico"],["Sn","+2","estannoso"],["Sn","+4","estánnico"],["Pb","+2","plumboso"],["Pb","+4","plúmbico"],["Au","+1","auroso"],["Au","+3","áurico"],["Co","+2","cobaltoso"],["Co","+3","cobáltico"],["Ni","+2","niqueloso"],["Ni","+3","niquélico"],["Mn","+2","manganoso"],["Mn","+3","mangánico"],["Cr","+2","cromoso"],["Cr","+3","crómico"]];
const A=[["F","-1","fluoruro"],["Cl","-1","cloruro"],["Br","-1","bromuro"],["I","-1","yoduro"],["S","-2","sulfuro"],["CN","-1","cianuro"],
["(ClO)","-1","hipoclorito"],["(ClO2)","-1","clorito"],["(ClO3)","-1","clorato"],["(ClO4)","-1","perclorato"],
["(BrO)","-1","hipobromito"],["(BrO2)","-1","bromito"],["(BrO3)","-1","bromato"],["(BrO4)","-1","perbromato"],
["(IO)","-1","hipoyodito"],["(IO2)","-1","yodito"],["(IO3)","-1","yodato"],["(IO4)","-1","peryodato"],
["(NO2)","-1","nitrito"],["(NO3)","-1","nitrato"],["(SO3)","-2","sulfito"],["(SO4)","-2","sulfato"],
["(CO3)","-2","carbonato"],["(PO3)","-3","fosfito"],["(PO4)","-3","fosfato"],["(BO3)","-3","borato"],["(SiO3)","-2","silicato"],
["(MnO4)","-1","permanganato"],["(CrO4)","-2","cromato"],["(Cr2O7)","-2","dicromato"],["(C2H3O2)","-1","acetato"]];
const LV=[C.slice(0,10),C.slice(10),A.slice(0,6),A.slice(6),[...C,...A]];
const REG=["Un catión con una sola valencia lleva el nombre del elemento: Na⁺ → sodio.",
"Si el elemento tiene dos valencias, la menor termina en -oso y la mayor en -ico: Fe⁺² → ferroso, Fe⁺³ → férrico.",
"Los aniones de ácidos sin oxígeno (hidrácidos) terminan en -uro: Cl⁻ → cloruro, S⁻² → sulfuro, CN⁻ → cianuro.",
"Oxianiones: hipo-…-ito (menos oxígeno), -ito, -ato y per-…-ato (más oxígeno). (ClO)⁻ hipoclorito → (ClO₄)⁻ perclorato.",
"Mezcla de todo: cationes de una o varias valencias y aniones de ácidos. Aplica las reglas de los niveles anteriores."];
const fmt=d=>d[0].replace(/(\d+)/g,"<sub>$1</sub>")+"<sup>"+d[1].replace("-","−")+"</sup>";
const AC=window.AudioContext||window.webkitAudioContext;let ac;
function beep(f,d){if(!$("#snd").checked||!AC)return;try{ac=ac||new AC();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=.08;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(_){}}
let nSel=null,aciertos=0,fallos=0,nivel=0,rondas=0,pistas=0;

function nomRonda(){
  nivel=+$("input[name=niv]:checked").value;
  const ps=shuf(LV[nivel]).slice(0,6);
  $("#rows").innerHTML=ps.map((d,i)=>`<div class="row"><div class="ion ${d[1][0]=="-"?"a":""}">${fmt(d)}</div><div class="slot" tabindex="0" data-n="${d[2]}" data-i="${i}">?</div></div>`).join("");
  $("#tray").innerHTML=shuf(ps).map(d=>`<div class="tok" tabindex="0" role="button" data-n="${d[2]}">${d[2]}</div>`).join("");
  $("#regla").textContent=REG[nivel];$("#nmsg").textContent="";nSel=null;aciertos=0;fallos=0;pistas=0;nScore();
}
function nScore(){$("#score").innerHTML=`Aciertos: ${aciertos}/6<br>Errores: ${fallos}<br>Pistas: ${pistas}<br>Rondas completas: ${rondas}`}
function intentar(tok,slot){
  if(!slot||slot.classList.contains("ok")){return false}
  if(tok.dataset.n==slot.dataset.n){
    slot.textContent=tok.dataset.n;slot.classList.add("ok");tok.remove();aciertos++;beep(660,.12);
    if(aciertos==6){rondas++;beep(880,.35);const st=fallos==0&&pistas==0?"⭐⭐⭐":fallos<=2?"⭐⭐":"⭐";$("#nmsg").textContent=`¡Muy bien! ${st} Terminaste con ${fallos} error${fallos==1?"":"es"}. 🎉`}
    nScore();return true;
  }
  fallos++;beep(180,.25);nScore();tok.classList.add("bad");tok.style.transform="";setTimeout(()=>tok.classList.remove("bad"),450);return false;
}
let drag=null;
$("#tray").addEventListener("pointerdown",e=>{
  const t=e.target.closest(".tok");if(!t)return;
  e.preventDefault();t.setPointerCapture(e.pointerId);
  drag={t,x:e.clientX,y:e.clientY,moved:false};t.classList.add("drag");
});
$("#tray").addEventListener("pointermove",e=>{
  if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(Math.abs(dx)+Math.abs(dy)>6)drag.moved=true;
  drag.t.style.transform=`translate(${dx}px,${dy}px)`;
  $$(".slot").forEach(s=>s.classList.remove("hot"));
  const s=document.elementsFromPoint(e.clientX,e.clientY).find(n=>n.classList.contains("slot"));
  if(s&&!s.classList.contains("ok"))s.classList.add("hot");
});
$("#tray").addEventListener("pointerup",e=>{
  if(!drag)return;const{t,moved}=drag;drag=null;t.classList.remove("drag");
  $$(".slot").forEach(s=>s.classList.remove("hot"));
  if(moved){const s=document.elementsFromPoint(e.clientX,e.clientY).find(n=>n.classList.contains("slot"));
    if(!(s&&intentar(t,s))&&t.isConnected)t.style.transform="";}
  else{t.style.transform="";if(nSel)nSel.classList.remove("sel");nSel=nSel===t?null:t;if(nSel)t.classList.add("sel")}
});
$("#rows").addEventListener("click",e=>{
  const s=e.target.closest(".slot");if(!s||!nSel)return;
  const t=nSel;nSel=null;t.classList.remove("sel");intentar(t,s);
});
$("#otra").onclick=nomRonda;
$$("input[name=niv]").forEach(r=>r.onchange=()=>{rondas=0;nomRonda()});
function nomReset(){vista("juego");rondas=0;$("input[name=niv][value='0']").checked=true;nomRonda()}
nomRonda();

/* ===== SIM 2: Laboratorio ===== */
const PROPS=["Color","Forma","Textura","Aroma","Sabor","Sensación al tacto*"];
const SENT={vista:[0,1],olfato:[3],tacto:[2,5],gusto:[4]};
const IT=[
{n:"Tomate sin pelar",k:"tom",c:"#d8321f",p:0,d:["Rojo brillante","Esférica, algo achatada","Lisa, brillante y firme","Fresco, ligeramente herbal","Dulce y un poco ácido","Piel lisa, fría y firme"]},
{n:"Tomate pelado",k:"tom",c:"#ee6a4a",p:1,d:["Rojo anaranjado, húmedo","Esférica e irregular","Blanda, jugosa y resbalosa","Fresco e intenso","Ácido y muy jugoso","Húmedo, resbaloso y blando"]},
{n:"Papa sin pelar",k:"pot",c:"#b88a55",p:0,d:["Café claro con manchas","Ovalada e irregular","Áspera y con tierra","A tierra húmeda","Terroso y algo amargo","Seca, áspera y granulosa"]},
{n:"Papa pelada",k:"pot",c:"#f1dc9b",p:1,d:["Amarillo crema","Ovalada, más pareja","Lisa, firme y húmeda","Casi neutro, leve a almidón","Insípido, almidonado","Fría, húmeda y almidonosa"]},
{n:"Naranja sin pelar",k:"ora",c:"#f28c1e",p:0,d:["Naranja intenso","Esférica","Rugosa, con poros","Cítrico muy intenso","Amargo (cáscara)","Rugosa, firme y aceitosa"]},
{n:"Naranja pelada",k:"ora",c:"#f7b04a",p:1,d:["Naranja pálido con fibras blancas","Esférica, en gajos","Lisa, esponjosa y jugosa","Cítrico dulce","Dulce y ácido","Húmeda y pegajosa"]},
{n:"Trozo de pan",k:"pan",c:"#c98a45",p:0,d:["Dorado, corteza café","Alargada, de bordes redondeados","Corteza crujiente y miga esponjosa","A horneado, tostado","Ligeramente dulce y salado","Suave, seca y elástica"]},
{n:"Limón entero",k:"lim",c:"#d8d535",p:0,d:["Amarillo verdoso","Ovalada con puntas","Rugosa y porosa","Cítrico fresco","Muy ácido y amargo","Rugosa, firme y aceitosa"]},
{n:"Limón partido",k:"lim",c:"#f3ee7a",p:1,d:["Amarillo pálido","Circular en el corte, con gajos","Húmeda, jugosa y fibrosa","Cítrico muy intenso","Muy ácido","Húmedo, pegajoso y ácido"]}
];
const segs=(n,r,col)=>Array.from({length:n},(_,i)=>{const a=Math.PI*2*i/n;return`<line x1="60" y1="60" x2="${60+r*Math.cos(a)}" y2="${60+r*Math.sin(a)}" stroke="${col}" stroke-width="2.5"/>`}).join("");
const dots=(n,col,rx,ry)=>Array.from({length:n},(_,i)=>`<circle cx="${60+rx*Math.cos(i*2.4)*(.3+.7*((i*37%10)/10))}" cy="${62+ry*Math.sin(i*2.4)*(.3+.7*((i*53%10)/10))}" r="2.2" fill="${col}"/>`).join("");
function art(it){
  const c=it.c;let s="";
  if(it.k=="tom")s=`<circle cx="60" cy="66" r="44" fill="${c}" stroke="#0003" stroke-width="2"/><ellipse cx="44" cy="48" rx="10" ry="6" fill="#fff" opacity="${it.p?.6:.45}" transform="rotate(-30 44 48)"/>`+(it.p?"":`<polygon points="60,26 66,36 78,32 70,40 80,46 66,44 60,54 54,44 40,46 50,40 42,32 54,36" fill="#3b8f3b"/>`);
  if(it.k=="pot")s=`<ellipse cx="60" cy="64" rx="50" ry="36" fill="${c}" stroke="#0003" stroke-width="2"/>`+(it.p?`<ellipse cx="45" cy="52" rx="14" ry="6" fill="#fff" opacity=".4"/>`:dots(10,"#6b4a22",42,28));
  if(it.k=="ora")s=it.p?`<circle cx="60" cy="62" r="44" fill="#fff3d9"/><circle cx="60" cy="62" r="38" fill="${c}"/>${segs(9,38,"#fff6")}`:`<circle cx="60" cy="62" r="44" fill="${c}" stroke="#0003" stroke-width="2"/>${dots(22,"#c56a00",38,38)}<circle cx="60" cy="20" r="3" fill="#3b8f3b"/>`;
  if(it.k=="lim")s=it.p?`<circle cx="60" cy="62" r="44" fill="#d8d535"/><circle cx="60" cy="62" r="38" fill="#fffbc4"/><circle cx="60" cy="62" r="34" fill="${c}"/>${segs(8,34,"#fffbc4")}`:`<polygon points="6,62 18,56 18,68" fill="${c}"/><polygon points="114,62 102,56 102,68" fill="${c}"/><ellipse cx="60" cy="62" rx="48" ry="36" fill="${c}" stroke="#0003" stroke-width="2"/>${dots(18,"#a8a41a",40,28)}`;
  if(it.k=="pan")s=`<rect x="12" y="38" width="96" height="56" rx="26" fill="${c}" stroke="#0004" stroke-width="2"/><rect x="22" y="44" width="76" height="14" rx="7" fill="#fff" opacity=".25"/><path d="M38 50l10 18M58 48l10 18M78 50l10 18" stroke="#f1c98e" stroke-width="5" stroke-linecap="round"/>`;
  return`<svg viewBox="0 0 120 120" role="img" aria-label="${it.n}">${s}</svg>`;
}
let cur=null,obs=JSON.parse(store.get("lab:obs")||"{}");
const total=IT.length*6;
$("#shelf").innerHTML=IT.map((it,i)=>`<button class="item" data-i="${i}">${art(it)}${it.n}<span class="chk"></span></button>`).join("");
$("#tabla").innerHTML="<tr><th>Sustancia</th>"+PROPS.map(p=>`<th>${p}</th>`).join("")+"</tr>"+IT.map((it,r)=>`<tr><td>${it.n}</td>`+PROPS.map((_,c)=>`<td data-k="${r}_${c}"></td>`).join("")+"</tr>").join("");
const QS=["¿Por qué crees que las sustancias presentan diferentes texturas?","¿Qué diferencias hay entre las sustancias sin pelar y peladas?","¿Qué importancia tiene para la química el análisis organoléptico de las sustancias?","¿Qué importancia química tienen las cáscaras de las frutas, vegetales y tubérculos?","¿Cómo se debe reciclar la materia orgánica que sale del procesamiento de los alimentos en la cocina?","¿Qué aprendiste de esta experiencia? ¿Qué podrías concluir de ella?"];
$("#preguntas").innerHTML=QS.map((q,i)=>`<div class="q2"><label for="q${i}">${i+1}. ${q}</label><textarea id="q${i}"></textarea></div>`).join("");
["nombre","grado","fecha",...QS.map((_,i)=>"q"+i)].forEach(id=>{
  const e=document.getElementById(id),v=store.get("lab:"+id);if(v)e.value=v;
  e.addEventListener("input",()=>store.set("lab:"+id,e.value));
});
function pintar(){
  let n=0;
  IT.forEach((it,r)=>PROPS.forEach((_,c)=>{
    const td=$(`td[data-k="${r}_${c}"]`),ok=obs[r+"_"+c];
    td.textContent=ok?it.d[c]:"?";td.className=ok?"":"q";if(ok)n++;
  }));
  $$(".item").forEach((b,i)=>b.querySelector(".chk").textContent=PROPS.every((_,c)=>obs[i+"_"+c])?"✓":"");
  $("#prog").style.width=n/total*100+"%";
  $("#progTxt").textContent=`${n} de ${total} observaciones`+(n==total?" · ¡Tabla completa! Pasa al cuestionario.":"");
}
$("#shelf").onclick=e=>{
  const b=e.target.closest(".item");if(!b)return;
  $$(".item").forEach(x=>x.classList.remove("on"));b.classList.add("on");
  cur=+b.dataset.i;$("#big").innerHTML=art(IT[cur]);
  $("#bubble").innerHTML=`<b>${IT[cur].n}</b>. Elige un sentido para observarla.`;
};
$$(".senses button").forEach(b=>b.onclick=()=>{
  if(cur==null){$("#bubble").textContent="Primero elige una sustancia del mesón.";return}
  const idx=SENT[b.dataset.s];
  idx.forEach(c=>obs[cur+"_"+c]=1);store.set("lab:obs",JSON.stringify(obs));
  $("#bubble").innerHTML=`<b>${IT[cur].n}</b> · ${b.dataset.s}<br>`+idx.map(c=>`${PROPS[c].replace("*","")}: ${IT[cur].d[c]}`).join("<br>");
  const g=$("#big");g.classList.remove("pulse");void g.offsetWidth;g.classList.add("pulse");pintar();
});
$$("#lab .tabs button").forEach(b=>b.onclick=()=>{
  $$("#lab .tabs button").forEach(x=>x.classList.toggle("on",x==b));
  ["bench","tabla","quiz"].forEach(t=>$("#s-"+t).hidden=t!=b.dataset.t);
});
function armarInforme(){
  const inf=$("#informe");inf.innerHTML="";
  const pag=()=>{const d=document.createElement("div");d.className="hoja";inf.appendChild(d);return d};
  const esc=s=>String(s).replace(/[&<>]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[m]));
  const nombre=$("#nombre").value.trim()||"______________________________";
  const grado=$("#grado").value.trim()||"__________";
  const f=$("#fecha").value?$("#fecha").value.split("-").reverse().join("/"):new Date().toLocaleDateString("es-CO");
  pag().innerHTML=`<div class="portada"><p class="inst">INSTITUCIÓN EDUCATIVA LOS QUINDOS</p><h1>Laboratorio de propiedades organolépticas</h1><p class="sub">Química · Primer periodo</p><div class="datos"><p><b>Estudiante:</b> ${esc(nombre)}</p><p><b>Grado:</b> ${esc(grado)}</p><p><b>Fecha:</b> ${f}</p><p><b>Docente:</b> Olga Liliana Salinas Casallas</p></div></div>`;
  pag().innerHTML=`<h2>Tabla de resultados</h2><p class="obj"><b>Objetivo:</b> determinar las propiedades organolépticas de diferentes sustancias de uso cotidiano.</p><table><tr><th>Sustancia</th>${PROPS.map(p=>`<th>${p}</th>`).join("")}</tr>${IT.map((it,r)=>`<tr><td>${it.n}</td>${PROPS.map((_,c)=>`<td>${obs[r+"_"+c]?esc(it.d[c]):""}</td>`).join("")}</tr>`).join("")}</table><p class="nota">* Sensación al tacto: la reacción que se siente al tocar, oler o probar una sustancia.</p>`;
  let p=pag();p.innerHTML="<h2>Cuestionario</h2>";
  QS.forEach((q,i)=>{
    const b=document.createElement("div");b.className="qa";
    b.innerHTML=`<b>${i+1}. ${q}</b><div class="ans"></div>`;
    const a=b.lastChild;a.textContent=document.getElementById("q"+i).value;
    p.appendChild(b);
    if(p.scrollHeight>p.clientHeight+1){p.removeChild(b);p=pag();p.appendChild(b);let fs=11;while(p.scrollHeight>p.clientHeight+1&&fs>6){fs-=.5;a.style.fontSize=fs+"pt"}}
  });
}
$("#imprimir").onclick=()=>{
  if(!$("#nombre").value.trim()){const n=prompt("¿Cuál es tu nombre para la portada?");if(n){$("#nombre").value=n;store.set("lab:nombre",n)}}
  if(!$("#grado").value.trim()){const g=prompt("¿Cuál es tu grado para la portada? Ej: 7 A");if(g){$("#grado").value=g;store.set("lab:grado",g)}}
  armarInforme();setTimeout(()=>print(),300);
};
window.onafterprint=()=>{$("#informe").innerHTML=""};
function labReset(){
  if(!confirm("¿Borrar observaciones, tabla y respuestas del laboratorio?"))return;
  obs={};cur=null;store.del("lab:obs");
  ["nombre","grado","fecha",...QS.map((_,i)=>"q"+i)].forEach(id=>{document.getElementById(id).value="";store.del("lab:"+id)});
  $$(".item").forEach(x=>x.classList.remove("on"));
  $("#big").innerHTML='<span class="empty">Elige una sustancia</span>';
  $("#bubble").textContent="Aquí aparecerá lo que percibas.";pintar();
}
pintar();


/* Teclado, pista y explorar (nomenclatura) */
$("#tray").addEventListener("keydown",e=>{const t=e.target.closest(".tok");if(t&&(e.key=="Enter"||e.key==" ")){e.preventDefault();if(nSel)nSel.classList.remove("sel");nSel=nSel===t?null:t;if(nSel)t.classList.add("sel")}});
$("#rows").addEventListener("keydown",e=>{const s=e.target.closest(".slot");if(s&&nSel&&(e.key=="Enter"||e.key==" ")){e.preventDefault();const t=nSel;nSel=null;t.classList.remove("sel");intentar(t,s)}});
$("#pista").onclick=()=>{const s=$$(".slot:not(.ok)")[0];if(!s)return;const t=$$(".tok").find(x=>x.dataset.n==s.dataset.n);if(!t)return;pistas++;nScore();t.classList.add("hint");s.classList.add("hot");setTimeout(()=>{t.classList.remove("hint");s.classList.remove("hot")},1800)};
function vista(v){$("#juegoV").hidden=v!="juego";$("#exploraV").hidden=v!="explora";$$("#nomTabs button").forEach(b=>b.classList.toggle("on",b.dataset.v==v));$("#nom .panel").classList.toggle("dim",v=="explora")}
$$("#nomTabs button").forEach(b=>b.onclick=()=>vista(b.dataset.v));
const norm=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const TODOS=[...C.map(d=>[...d,"c"]),...A.map(d=>[...d,"a"])];
const cara=(d,r)=>r?`<span class="nmv">${d[2]}<small>${d[3]=="c"?"catión":"anión"}</small></span>`:`<span class="ion ${d[3]=="a"?"a":""}">${fmt(d)}</span>`;
let filtro="t",abiertos=false;
function cards(){
  const q=norm($("#buscar").value.trim());
  $("#cards").innerHTML=TODOS.map((d,i)=>[d,i]).filter(([d])=>(filtro=="t"||d[3]==filtro)&&(!q||norm(d[2]).includes(q)||norm(d[0]).includes(q)))
    .map(([d,i])=>`<button class="fc${abiertos?" rev":""}" data-i="${i}">${cara(d,abiertos)}</button>`).join("")||'<p class="small">No hay iones con esa búsqueda.</p>';
}
$("#cards").onclick=e=>{const b=e.target.closest(".fc");if(!b)return;const r=!b.classList.contains("rev");b.classList.toggle("rev",r);b.innerHTML=cara(TODOS[+b.dataset.i],r)};
$("#buscar").oninput=cards;
$$("#exploraV .seg button").forEach(b=>b.onclick=()=>{filtro=b.dataset.f;$$("#exploraV .seg button").forEach(x=>x.classList.toggle("on",x==b));cards()});
$("#voltear").onclick=()=>{abiertos=!abiertos;$("#voltear").textContent=abiertos?"Ocultar nombres":"Mostrar todos los nombres";cards()};
cards();

/* Correo */
$("#correo").href="mailto:olga.salinas@ielosquindos.edu.co?subject="+encodeURIComponent("Informe laboratorio propiedades organolépticas");

/* ===== Utilidades compartidas de los laboratorios de Grado 10 ===== */
const esc=s=>String(s).replace(/[&<>]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[m]));
const atmAlt=h=>Math.pow(1-2.25577e-5*h,5.25588);
const num=s=>parseFloat(String(s).replace(",","."));
const f2=(x,d=2)=>(+x).toLocaleString("es-CO",{minimumFractionDigits:d,maximumFractionDigits:d});
const COL=["#1d4ed8","#c2185b","#2e9e5b","#f5a524","#7b3fa0","#00897b"];
const MAIL="olga.salinas@ielosquindos.edu.co";
const LB={
  tabs(root,pre,cb){const bs=$$("#"+root+" .tabs button");bs.forEach(b=>b.onclick=()=>{bs.forEach(x=>x.classList.toggle("on",x==b));$$("#"+root+" .scr").forEach(s=>s.hidden=s.id!=pre+b.dataset.t);cb&&cb(b.dataset.t)})},
  ident:p=>`<div class="ident"><label>Nombre <input id="${p}n"></label><label>Grado <input id="${p}g" size="8" placeholder="Ej: 10 A"></label><label>Fecha <input id="${p}f" type="date"></label></div>`,
  qs:(p,a,s=0)=>a.map((q,i)=>`<div class="q2"><label for="${p}q${i+s}">${q}</label><textarea id="${p}q${i+s}"></textarea></div>`).join(""),
  keep(p,ids){ids.forEach(id=>{const e=document.getElementById(id);if(!e)return;const v=store.get(p+":"+id);if(v)e.value=v;e.addEventListener("input",()=>store.set(p+":"+id,e.value))})},
  clear(p,ids){ids.forEach(id=>{const e=document.getElementById(id);if(e)e.value="";store.del(p+":"+id)})},
  qa:sel=>$$(sel+" .q2").map(q=>[q.querySelector("label").textContent,q.querySelector("textarea").value]),
  print(p,build){["n","g"].forEach(k=>{const e=$("#"+p+k);if(!e.value.trim()){const v=prompt(k=="n"?"¿Cuál es tu nombre para la portada?":"¿Cuál es tu grado para la portada? Ej: 10 A");if(v){e.value=v;store.set(p+":"+p+k,v)}}});build();setTimeout(()=>print(),300)},
  report(p,titulo,sub,paginas){
    const inf=$("#informe");inf.innerHTML="";
    const pag=()=>{const d=document.createElement("div");d.className="hoja";inf.appendChild(d);return d};
    const g=k=>$("#"+p+k).value.trim()||"______________________";
    const f=$("#"+p+"f").value?$("#"+p+"f").value.split("-").reverse().join("/"):new Date().toLocaleDateString("es-CO");
    pag().innerHTML=`<div class="portada"><p class="inst">INSTITUCIÓN EDUCATIVA LOS QUINDOS</p><h1>${titulo}</h1><p class="sub">${sub}</p><div class="datos"><p><b>Estudiante:</b> ${esc(g("n"))}</p><p><b>Grado:</b> ${esc(g("g"))}</p><p><b>Fecha:</b> ${f}</p><p><b>Docente:</b> Olga Liliana Salinas Casallas</p></div></div>`;
    paginas.forEach(P=>{
      if(P.html){pag().innerHTML=`<h2>${P.h}</h2>`+P.html;return}
      let pg=pag();pg.innerHTML=`<h2>${P.h}</h2>`;
      P.qa.forEach(([q,a])=>{
        const b=document.createElement("div");b.className="qa";b.innerHTML=`<b>${esc(q)}</b><div class="ans"></div>`;
        const an=b.lastChild;an.textContent=a;pg.appendChild(b);
        if(pg.scrollHeight>pg.clientHeight+1){pg.removeChild(b);pg=pag();pg.appendChild(b);let fs=11;while(pg.scrollHeight>pg.clientHeight+1&&fs>6){fs-=.5;an.style.fontSize=fs+"pt"}}
      });
    });
  }
};
function chartSVG({t,xl,yl,bars,series,xmax}){
  const W=420,H=270,L=48,B=44,T=42,R=12,iw=W-L-R,ih=H-T-B;
  const nice=v=>{const e=Math.pow(10,Math.floor(Math.log10(v))),m=v/e;return(m<=1?1:m<=2?2:m<=5?5:10)*e};
  const ymax=nice(Math.max(bars?Math.max(...bars.map(b=>b[1])):Math.max(...series.flatMap(s=>s.p.map(q=>q[1]))),.001));
  const Y=v=>T+ih-v/ymax*ih;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t}"><rect width="${W}" height="${H}" fill="#fff" stroke="#9ab"/><text x="${W/2}" y="17" text-anchor="middle" font-weight="700" font-size="13">${t}</text>`;
  for(let i=0;i<=4;i++){const v=ymax*i/4;s+=`<line x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}" stroke="#ddd"/><text x="${L-4}" y="${Y(v)+4}" text-anchor="end" font-size="10">${+v.toPrecision(3)}</text>`}
  s+=`<line x1="${L}" x2="${L}" y1="${T}" y2="${T+ih}" stroke="#333"/><line x1="${L}" x2="${W-R}" y1="${T+ih}" y2="${T+ih}" stroke="#333"/><text x="${L+iw/2}" y="${H-6}" text-anchor="middle" font-size="11">${xl}</text><text transform="translate(12 ${T+ih/2}) rotate(-90)" text-anchor="middle" font-size="11">${yl}</text>`;
  if(bars){const w=iw/bars.length;bars.forEach((b,i)=>{const x=L+i*w+w*.18;s+=`<rect x="${x}" y="${Y(b[1])}" width="${w*.64}" height="${T+ih-Y(b[1])}" fill="${COL[i%6]}"/><text x="${x+w*.32}" y="${Y(b[1])-4}" text-anchor="middle" font-size="10">${f2(b[1])}</text><text x="${x+w*.32}" y="${T+ih+14}" text-anchor="middle" font-size="10">${esc(b[0])}</text>`})}
  else{const X=v=>L+v/xmax*iw;for(let i=0;i<=xmax;i++)s+=`<text x="${X(i)}" y="${T+ih+14}" text-anchor="middle" font-size="10">${i}</text>`;
    series.forEach((q,k)=>{s+=`<polyline fill="none" stroke="${q.c}" stroke-width="2.5" points="${q.p.map(a=>X(a[0])+","+Y(a[1])).join(" ")}"/><rect x="${L+k*76}" y="26" width="10" height="10" fill="${q.c}"/><text x="${L+k*76+13}" y="35" font-size="10">${esc(q.n)}</text>`})}
  return s+"</svg>";
}

/* ===== SIM 3: Estequiometría del CO2 (Grado 10) ===== */
(function(){
const R=.08206,MB=84.01,MC=44.01,MA=60.05,TK=297,PA=atmAlt(1480);
const S={m:5,v:100,run:JSON.parse(store.get("co2:run")||"null")},ok=new Set();
const calc=(m,v)=>{const nB=m/MB,nA=v*.05/MA,n=Math.min(nB,nA);return{nB,nA,n,lim:nB<=nA?"el bicarbonato":"el ácido acético del vinagre",V:n*R*TK/PA}};
const diam=V=>2*Math.cbrt(3*V*1000/(4*Math.PI));
const M=()=>S.run?S.run.m:S.m;
const QA=["1. ¿Por qué se produjo el dióxido de carbono?","2. ¿Qué evidencia demuestra que ocurrió una reacción química?","3. ¿Por qué el globo se infló?","4. ¿Cree que todo el bicarbonato reaccionó? ¿Por qué?","5. ¿Qué ocurriría si se duplicara la cantidad de bicarbonato?","6. ¿Qué variable pudo afectar los resultados?"];
const EPC=["Rutina de pensamiento · Antes pensaba…","Ahora comprendo…","Todavía me pregunto…","Conexión con la vida cotidiana…"];
const EX=["Investigue un ejemplo donde se produzca dióxido de carbono mediante una reacción química (panadería, bebidas gaseosas, extintores, industria, laboratorio)."];
const CON=["Conclusión 1","Conclusión 2","Conclusión 3"];
const NQ=QA.length+EPC.length+EX.length+CON.length;
const IDS=["co2p0","co2p1","co2p2","co2e0","co2e1","co2n","co2g","co2f","co2s1","co2s3","co2s4","co2s5","co2s6",...Array.from({length:NQ},(_,i)=>"co2q"+i)];
const STP=[
 ["co2s3","Paso 3. Moles de NaHCO₃ (M = 84,01 g/mol): n = masa ÷ M","mol",m=>m/MB,m=>`n = ${f2(m)} g ÷ 84,01 g/mol = ${f2(m/MB,4)} mol`],
 ["co2s4","Paso 4. Moles de CO₂ producidos (relación 1 : 1)","mol",m=>m/MB,m=>`1 mol NaHCO₃ → 1 mol CO₂, entonces n(CO₂) = ${f2(m/MB,4)} mol`],
 ["co2s5","Paso 5. Masa de CO₂ (M = 44,01 g/mol): m = n × M","g",m=>m/MB*MC,m=>`m = ${f2(m/MB,4)} mol × 44,01 g/mol = ${f2(m/MB*MC)} g`],
 ["co2s6","Paso 6 (extra). Volumen de CO₂ a 24 °C y "+f2(PA)+" atm (Armenia): V = nRT ÷ P","L",m=>m/MB*R*TK/PA,m=>`V = ${f2(m/MB,4)} × 0,08206 × 297 ÷ ${f2(PA)} = ${f2(m/MB*R*TK/PA)} L`]];

$("#c-exp").innerHTML=`<p class="hint">Partes A–C: prepara el montaje, haz tu predicción y mezcla.</p>
<div class="two"><svg id="cSvg" viewBox="0 0 300 290" role="img" aria-label="Botella con vinagre y globo con bicarbonato"></svg>
<div><label class="rg">Bicarbonato de sodio: <b id="cmv"></b><input type="range" id="cm" min="1" max="15" step="0.5" value="5"></label>
<label class="rg">Vinagre blanco (≈5 % de ácido acético): <b id="cvv"></b><input type="range" id="cv" min="50" max="200" step="10" value="100"></label>
<h3>Parte B · Predicción</h3>
<div class="q2"><label for="co2p0">¿Qué cree que ocurrirá al mezclar el bicarbonato con el vinagre?</label><textarea id="co2p0"></textarea></div>
<div class="q2"><label for="co2p1">¿El globo se inflará?</label><select id="co2p1"><option value="">—</option><option>Sí</option><option>No</option></select> <label for="co2p2">¿Por qué?</label><textarea id="co2p2"></textarea></div>
<button class="btn2" id="cgo">⚗️ Mezclar</button><button class="btn2" id="crs">↺ Preparar de nuevo</button></div></div>
<div id="cobs" class="scroll"></div>`;
$("#c-calc").innerHTML=`<p class="hint">Parte D · Cálculos estequiométricos. Escribe tu resultado y pulsa Comprobar.</p>
<div class="stp"><b>Paso 1.</b> Ecuación balanceada: NaHCO<sub>3</sub> + CH<sub>3</sub>COOH → CH<sub>3</sub>COONa + H<sub>2</sub>O + CO<sub>2</sub> (todos los coeficientes son 1). Relación molar NaHCO₃ : CO₂ = <select id="co2s1"><option value="">—</option><option>1 : 1</option><option>1 : 2</option><option>2 : 1</option></select> <button class="btn2" data-c="s1">Comprobar</button> <span class="rs"></span></div>
<div class="stp"><b>Paso 2.</b> Cantidad de bicarbonato utilizada: <b id="cm2"></b> g (la que elegiste en el experimento)</div>`+
STP.map(s=>`<div class="stp"><label for="${s[0]}"><b>${s[1]}</b></label><br><input id="${s[0]}" size="9" inputmode="decimal"> ${s[2]} <button class="btn2" data-c="${s[0]}">Comprobar</button> <button class="btn2" data-s="${s[0]}">Ver solución</button> <span class="rs"></span><div class="sol" hidden></div></div>`).join("");
$("#c-res").innerHTML=LB.ident("co2")+`<h3>Comparación de resultados</h3><div id="ccmp" class="scroll"></div>
<h3>Parte E · Comparación experimental</h3><p id="cdi"></p>
<div class="q2"><label for="co2e0">¿Considera que la cantidad de gas fue suficiente para inflar el globo completamente?</label><select id="co2e0"><option value="">—</option><option>Sí</option><option>No</option></select> <label for="co2e1">Explique.</label><textarea id="co2e1"></textarea></div>
<h3>Análisis de resultados</h3>`+LB.qs("co2",QA)+`<h3>Rutina de pensamiento (EpC)</h3>`+LB.qs("co2",EPC,QA.length)+`<h3>Conexión con la vida cotidiana</h3>`+LB.qs("co2",EX,QA.length+EPC.length)+`<h3>Conclusiones</h3>`+LB.qs("co2",CON,QA.length+EPC.length+1)+
`<p class="note">Evidencias para entregar: guía diligenciada, fotografías del procedimiento real, cálculos, comparación teórico/experimental y conclusiones, al correo ${MAIL}.</p><div class="noprint"><button class="btn2" id="cpr">🖨️ Imprimir informe / guardar PDF</button> <a class="btn2" id="cmail" href="mailto:${MAIL}?subject=${encodeURIComponent("Laboratorio estequiometría CO2")}">✉️ Abrir correo para la profesora</a></div>`;
LB.keep("co2",IDS);

const bottle=()=>{
  const h=Math.round(48*S.v/200),run=!!S.run,s=run?Math.min(2,Math.max(.25,diam(S.run.Vexp)/12)):.25;
  return`<rect width="300" height="290" fill="#f1f8fd"/>
<g id="cBal" style="transform-origin:150px 178px;transform:scale(${s})"><circle cx="150" cy="138" r="40" fill="#e0407a" opacity=".88"/><ellipse cx="136" cy="122" rx="8" ry="12" fill="#fff" opacity=".4"/><rect x="143" y="172" width="14" height="10" fill="#e0407a"/></g>
<rect x="107" y="${263-h}" width="86" height="${h}" rx="4" fill="#bfe3f5"/>
<g class="bub" style="--d:0s"><circle cx="125" cy="245" r="4" fill="#fff" stroke="#7ab"/></g><g class="bub" style="--d:.3s"><circle cx="150" cy="240" r="3" fill="#fff" stroke="#7ab"/></g><g class="bub" style="--d:.6s"><circle cx="172" cy="248" r="4" fill="#fff" stroke="#7ab"/></g><g class="bub" style="--d:.9s"><circle cx="140" cy="252" r="3" fill="#fff" stroke="#7ab"/></g>
<path d="M138 178h24v20l33 14v43a10 10 0 0 1-10 10h-70a10 10 0 0 1-10-10v-43l33-14z" fill="none" stroke="#456" stroke-width="3"/>
<text x="150" y="283" text-anchor="middle" font-size="11" fill="#345">${f2(S.v,0)} mL de vinagre · ${f2(S.m,1)} g de NaHCO₃ en el globo</text>`;
};
const draw=()=>{$("#cSvg").innerHTML=bottle();$("#cmv").textContent=f2(S.m,1)+" g (≈ "+f2(S.m/5,1)+" cucharadita)";$("#cvv").textContent=S.v+" mL"};
function lock(){$("#cm").disabled=$("#cv").disabled=!!S.run;$("#cgo").disabled=!!S.run}
function obs(){
  const r=S.run;if(!r){$("#cobs").innerHTML="";return}
  const c=calc(r.m,r.v),d=diam(r.Vexp);
  $("#cobs").innerHTML=`<h3>Observaciones (Parte C)</h3><table><tr><th>Observación</th><th>Descripción</th></tr>
<tr><td>Color inicial</td><td>Vinagre incoloro y bicarbonato blanco en polvo</td></tr><tr><td>Formación de burbujas</td><td>Abundantes; la efervescencia comenzó de inmediato</td></tr>
<tr><td>Cambio de temperatura</td><td>Disminuyó ≈ ${f2(r.dT,1)} °C (la botella se sintió más fría)</td></tr><tr><td>Tiempo aproximado de reacción</td><td>${r.t} s</td></tr>
<tr><td>Tamaño del globo</td><td>Diámetro ≈ ${f2(d,1)} cm</td></tr><tr><td>Otras observaciones</td><td>${c.lim=="el bicarbonato"?"Sobró vinagre: el bicarbonato se acabó primero.":"Sobró bicarbonato sin disolver: el vinagre se acabó primero."}</td></tr></table>`;
}
$("#cm").oninput=e=>{S.m=+e.target.value;draw()};
$("#cv").oninput=e=>{S.v=+e.target.value;draw()};
$("#cgo").onclick=()=>{
  if(S.run)return;const c=calc(S.m,S.v),eff=.8+Math.random()*.12;
  S.run={m:S.m,v:S.v,eff,t:Math.round(20+S.m*5+Math.random()*10),dT:+(.6+c.n*12).toFixed(1),Vexp:c.V*eff};
  store.set("co2:run",JSON.stringify(S.run));
  const s=Math.min(2,Math.max(.25,diam(S.run.Vexp)/12)),b=$("#cBal");
  b.style.transition="transform 3s ease-out";$("#cSvg").classList.add("go");
  requestAnimationFrame(()=>requestAnimationFrame(()=>b.style.transform=`scale(${s})`));
  setTimeout(()=>$("#cSvg").classList.remove("go"),3000);
  lock();obs();prog();
};
$("#crs").onclick=()=>{S.run=null;store.del("co2:run");lock();draw();obs();prog()};

$("#c-calc").onclick=e=>{
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.c){
    const id=b.dataset.c,rs=b.parentElement.querySelector(".rs");let good;
    if(id=="s1")good=$("#co2s1").value=="1 : 1";
    else{const s=STP.find(x=>x[0]==id),v=num($("#"+id).value),x=s[3](M());good=!isNaN(v)&&Math.abs(v-x)<=Math.max(x*.03,.0005)}
    rs.textContent=good?"✓ ¡Correcto!":"✗ Revisa el cálculo";rs.className="rs "+(good?"ok":"no");good?ok.add(id):ok.delete(id);prog();
  }else if(b.dataset.s){const s=STP.find(x=>x[0]==b.dataset.s),d=b.parentElement.querySelector(".sol");d.textContent=s[4](M());d.hidden=!d.hidden}
};
function cmp(){
  const m=M(),nB=m/MB,r=S.run;
  const row=(a,t,x)=>`<tr><td>${a}</td><td>${t}</td><td>${r?x:"—"}</td></tr>`;
  const nE=r?r.Vexp*PA/(R*TK):0;
  $("#ccmp").innerHTML=`<table><tr><th></th><th>Resultado teórico (desde el bicarbonato)</th><th>Resultado experimental (globo)</th></tr>
${row("Moles de CO₂",f2(nB,4),f2(nE,4))}${row("Masa de CO₂ (g)",f2(nB*MC),f2(nE*MC))}${row("Volumen de gas (L)",f2(nB*R*TK/PA),r?f2(r.Vexp):"")}${row("Diámetro del globo (cm)",f2(diam(nB*R*TK/PA),1),r?f2(diam(r.Vexp),1):"")}</table>`
  +(r?`<p class="small">Rendimiento aparente: ${f2(r.Vexp/(nB*R*TK/PA)*100,0)} %. Reactivo limitante: ${calc(r.m,r.v).lim}.</p>`:`<p class="hint">Realiza el experimento para ver el resultado experimental.</p>`);
  $("#cdi").innerHTML=r?`Diámetro aproximado del globo: <b>${f2(diam(r.Vexp),1)} cm</b>`:"Diámetro aproximado del globo: (realiza el experimento)";
  $("#cm2").textContent=f2(m,1);
}
function prog(){const n=(S.run?1:0)+["s1","co2s3","co2s4","co2s5","co2s6"].filter(x=>ok.has(x)).length;$("#cprog").style.width=n/6*100+"%";$("#cpt").textContent=`${n} de 6 pasos${n==6?" · ¡Listo! Completa el análisis.":""}`}
LB.tabs("co2","c-",t=>{if(t!="exp")cmp()});
function calcTxt(){const m=M();return`<table><tr><th>Paso</th><th>Tu resultado</th><th>Valor esperado</th></tr><tr><td>2. Masa de NaHCO₃</td><td>${f2(m,1)} g</td><td></td></tr>`+STP.map(s=>`<tr><td>${esc(s[1].split(".")[0]+". "+s[1].split(". ")[1].split(":")[0].split("(")[0])}</td><td>${esc($("#"+s[0]).value||"—")} ${s[2]}</td><td>${f2(s[3](m),4)} ${s[2]}</td></tr>`).join("")+"</table>"}
$("#cpr").onclick=()=>LB.print("co2",()=>{
  cmp();const r=S.run;
  LB.report("co2","Estequiometría: producción de dióxido de carbono","Química grado 10 · Proyecto Síntesis",[
   {h:"Predicción, observaciones y cálculos",html:`<p><b>Predicción:</b> ${esc($("#co2p0").value||"—")}</p><p><b>¿Se inflará el globo?</b> ${esc($("#co2p1").value||"—")}. ${esc($("#co2p2").value)}</p><p><b>Montaje:</b> ${r?`${f2(r.m,1)} g de bicarbonato y ${r.v} mL de vinagre`:"sin realizar"}</p>`+($("#cobs").innerHTML||"")+`<p><b>Ecuación:</b> NaHCO₃ + CH₃COOH → CH₃COONa + H₂O + CO₂</p>`+calcTxt()},
   {h:"Comparación de resultados",html:$("#ccmp").innerHTML+`<p>${$("#cdi").innerHTML}</p><p><b>¿Gas suficiente para inflar el globo?</b> ${esc($("#co2e0").value||"—")}. ${esc($("#co2e1").value)}</p><p class="nota">Las fotografías del procedimiento real se envían por separado al correo ${MAIL}.</p>`},
   {h:"Análisis y conclusiones",qa:LB.qa("#c-res")}]);
});
window.co2Reset=()=>{
  if(!confirm("¿Borrar el experimento, los cálculos y las respuestas de este laboratorio?"))return;
  S.run=null;S.m=5;S.v=100;store.del("co2:run");ok.clear();LB.clear("co2",IDS);
  $("#cm").value=5;$("#cv").value=100;$$("#c-calc .rs").forEach(x=>x.textContent="");$$("#c-calc .sol").forEach(x=>x.hidden=true);lock();draw();obs();cmp();prog();
};
if(S.run){S.m=S.run.m;S.v=S.run.v;$("#cm").value=S.m;$("#cv").value=S.v}
lock();draw();obs();cmp();prog();
})();

/* ===== SIM 4: Los gases cumplen una función vital (Grado 10) ===== */
(function(){
const R=.082,PR=[["Tú",1.6,16],["Mamá",1.3,18],["Papá",1.9,14],["Hermano/a",1.5,17],["Abuelo/a",1.05,19]];
const CIT=[["Armenia (Quindío)",1480],["Bogotá",2640],["Medellín",1495],["Cali",1018],["Barranquilla",18],["Nivel del mar",0]];
const S=JSON.parse(store.get("gas:st")||"null")||{alt:1480,T:24,d:PR.map(p=>({n:p[0],V:null,r:null}))};
const CQ=["Conclusión 1","Conclusión 2","Conclusión 3"],IDS=["gasn","gasg","gasf",...CQ.map((_,i)=>"gasq"+i)];
const STEPS=["💧 1 · Llenar la vasija y ponerla en la ponchera","🫁 2 · Inspirar y exhalar todo el aire en la bolsa","🪣 3 · Sumergir la bolsa en la vasija","🥛 4 · Medir el agua con el recipiente de 250 mL","⏱️ 5 · Contar las exhalaciones en 1 minuto"];
let sel=0,step=0,busy=false,tmp=null,ea=S.alt;
const save=()=>store.set("gas:st",JSON.stringify(S));
const Pat=()=>atmAlt(S.alt),TK=()=>S.T+273.15,done=d=>d.V!=null&&d.r!=null;
const gen=i=>Math.max(.5,Math.round((PR[i][1]+(Math.random()-.5)*.16)*20)/20);

$("#g-bench").innerHTML=`<p class="hint">Elige quién participa y sigue el procedimiento paso a paso (repítelo con cada integrante).</p>
<div class="chips" id="gChips"></div>
<div class="two"><svg id="gSvg" viewBox="0 0 320 220" role="img" aria-label="Ponchera, vasija con agua y bolsa de aire"></svg>
<div><div class="env"><label>Ciudad <select id="gCity">${CIT.map(c=>`<option value="${c[1]}">${c[0]} · ${c[1]} m</option>`).join("")}</select></label>
<label class="rg">Temperatura ambiente: <b id="gTv"></b><input type="range" id="gT" min="10" max="38" value="${S.T}"></label><p id="gP" class="small"></p></div>
<button class="btn2" id="gNext"></button><div id="gLog" class="bubble"></div></div></div>`;
$("#g-calc").innerHTML=`<div id="gcal"></div>`;
$("#g-gra").innerHTML=`<div id="gch"></div>`;
$("#g-con").innerHTML=LB.ident("gas")+`<h3>Conclusiones</h3>`+LB.qs("gas",CQ)+`<p class="note">Envía las respuestas y el registro fotográfico o video de tu práctica real a ${MAIL}.</p><div class="noprint"><button class="btn2" id="gpr">🖨️ Imprimir informe / guardar PDF</button> <a class="btn2" href="mailto:${MAIL}?subject=${encodeURIComponent("Laboratorio los gases cumplen una función vital")}">✉️ Abrir correo para la profesora</a></div>`;
LB.keep("gas",IDS);
$("#gCity").value=CIT.some(c=>c[1]==S.alt)?S.alt:1480;

function env(){$("#gTv").textContent=S.T+" °C";$("#gP").textContent=`Altura ${S.alt} m · Presión ≈ ${f2(Pat())} atm · T = ${f2(TK(),1)} K`}
function draw(anim){
  const d=S.d[sel],V=tmp??d.V??0,k=Math.min(1,V/2.2),rx=14+V*14,sub=step>=3;
  $("#gSvg").innerHTML=`<rect width="320" height="220" fill="#f1f8fd"/><rect x="10" y="120" width="300" height="92" rx="10" fill="#fff" stroke="#567" stroke-width="3"/>
<rect id="gDis" x="14" y="128" width="292" height="80" fill="#6bb8e8" opacity=".75" style="transform-origin:0 208px;transition:transform 1.5s;transform:scaleY(${sub&&!anim?k:0})"/>
<rect x="110" y="40" width="100" height="168" rx="6" fill="${step>=1?"#8ccaf0":"none"}" fill-opacity=".85" stroke="#345" stroke-width="3"/>
${step>=2?`<g id="gBag" style="transition:transform 1.5s;transform:translate(160px,${sub&&!anim?95:26}px)"><ellipse rx="${rx}" ry="${rx*.8}" fill="#fff" stroke="#889" stroke-width="2" opacity=".92"/><circle cy="${-rx*.8-4}" r="4" fill="#889"/></g>`:""}
${step>=4?`<rect x="250" y="20" width="44" height="52" rx="4" fill="#fff" stroke="#345" stroke-width="2"/><text x="272" y="50" text-anchor="middle" font-size="11">250</text><text x="272" y="63" text-anchor="middle" font-size="9">mL</text>`:""}`;
  if(anim)setTimeout(()=>{const a=$("#gDis"),b=$("#gBag");if(a)a.style.transform=`scaleY(${k})`;if(b)b.style.transform="translate(160px,95px)"},40);
}
function log(){
  const d=S.d[sel],L=["Elige un integrante y empieza con el paso 1.","La vasija está llena de agua dentro de la ponchera.","Exhalaste todo el aire en la bolsa y la amarraste.","El agua desplazada pasó a la ponchera.","","Datos guardados."][step];
  let t=L;if(step==4){const c=Math.floor(d.V/.25+1e-9);t=`Volumen desplazado = volumen de aire exhalado: <b>${f2(d.V)} L</b> (${c} recipientes de 250 mL y ${Math.round((d.V-c*.25)*1000)} mL).`}
  if(step==5)t=`<b>${esc(d.n)}</b>: ${f2(d.V)} L por exhalación y <b>${d.r}</b> exhalaciones por minuto. ¡Datos guardados!`;
  $("#gLog").innerHTML=t;
  $("#gNext").textContent=step<5?STEPS[step]:"✓ Integrante completo";$("#gNext").disabled=step>=5||busy;
  $("#gChips").innerHTML=S.d.map((x,i)=>`<button class="chip${i==sel?" on":""}" data-i="${i}">${done(x)?"✓ ":""}${esc(x.n)}</button>`).join("")+`<button class="chip" data-ren="1" title="Cambiar nombre">✏️</button>`;
  const n=S.d.filter(done).length;$("#gprog").style.width=n/5*100+"%";$("#gpt").textContent=`${n} de 5 integrantes medidos`+(n==5?" · ¡Revisa Cálculos y Gráficas!":"");
}
$("#gChips").onclick=e=>{
  const b=e.target.closest("button");if(!b||busy)return;
  if(b.dataset.ren){const v=prompt("Nombre del integrante seleccionado:",S.d[sel].n);if(v&&v.trim()){S.d[sel].n=v.trim().slice(0,14);save();log()}return}
  sel=+b.dataset.i;const d=S.d[sel];step=done(d)?5:d.V!=null?4:0;tmp=null;draw();log();
};
$("#gNext").onclick=()=>{
  if(busy||step>=5)return;const d=S.d[sel],i=step;
  if(i==1)tmp=gen(sel);
  if(i==3){d.V=tmp;tmp=null;save()}
  if(i==4){busy=true;let c=0;const r=PR[sel][2]+Math.round(Math.random()*2-1);log();
    const iv=setInterval(()=>{c++;$("#gLog").innerHTML=`⏱️ Contando… <b>${c}</b> 🫁`;if(c>=r){clearInterval(iv);d.r=r;save();busy=false;step=5;log();draw()}},140);return}
  step++;draw(i==2);log();
};
$("#gCity").onchange=e=>{S.alt=+e.target.value;save();env()};
$("#gT").oninput=e=>{S.T=+e.target.value;save();env()};

function tbl(){
  const P=Pat(),T=TK(),ds=S.d.filter(done);
  if(!ds.length)return`<p class="hint">Aún no hay datos: mide al menos un integrante en la pestaña Laboratorio.</p>`;
  return`<table><tr><th>Integrante</th><th>V aire (L)</th><th>n aire (mol) = PV/RT</th><th>Exhalaciones/min</th><th>O₂ por minuto (L)</th><th>O₂ por hora (L)</th></tr>`+
  ds.map(d=>`<tr><td>${esc(d.n)}</td><td>${f2(d.V)}</td><td>${f2(P*d.V/(R*T),4)}</td><td>${d.r}</td><td>${f2(d.V*d.r*.2)}</td><td>${f2(d.V*d.r*.2*60,1)}</td></tr>`).join("")+"</table>"+
  `<p class="small">Ejemplo con ${esc(ds[0].n)}: n = (${f2(P)} atm × ${f2(ds[0].V)} L) ÷ (0,082 × ${f2(T,1)} K) = ${f2(P*ds[0].V/(R*T),4)} mol. O₂ por minuto = ${f2(ds[0].V)} L × ${ds[0].r} × 0,20 = ${f2(ds[0].V*ds[0].r*.2)} L.</p>`;
}
const q3=()=>{const Vm=22.4*308.15/273.15,n=1/Vm;return`<div class="stp"><b>Pregunta 3 · O₂ en 1 L de aire al nivel del mar (1 atm, 35 °C)</b><br>1 mol ocupa 22,4 L a 0 °C. A 35 °C (308,15 K): V = 22,4 × 308,15 ÷ 273,15 = ${f2(Vm)} L/mol.<br>n(aire) = 1 L ÷ ${f2(Vm)} L/mol = ${f2(n,4)} mol; n(O₂) = 0,20 × ${f2(n,4)} = ${f2(n*.2,5)} mol = <b>${f2(n*.2*32,3)} g de O₂</b> (M = 32 g/mol).</div>`};
function altRows(){
  const T=TK(),o=h=>.2*atmAlt(h)/(R*T),b=o(0);
  return[["Nivel del mar",0],["Cali",1018],["Armenia",1480],["Bogotá",2640],["Cusco",3400],["La Paz",3640],["Everest",8849]].map(([n,h])=>`<tr><td>${n}</td><td>${h}</td><td>${f2(atmAlt(h))}</td><td>${f2(o(h),5)}</td><td>${f2(o(h)/b*100,0)} %</td></tr>`).join("");
}
function calc(){
  $("#gcal").innerHTML=`<p class="small">Condiciones: T = ${S.T} °C (${f2(TK(),1)} K) · P ≈ ${f2(Pat())} atm (${S.alt} m) · R = 0,082 atm·L/(mol·K) · el aire inspirado tiene 20 % de O₂.</p><h3>Análisis 1 y 2 · Moles de aire y oxígeno respirado</h3><div class="scroll">${tbl()}</div>${q3()}
<h3>Objetivo 2 · El oxígeno a diferentes alturas</h3><p class="small">Con la misma temperatura, la presión baja con la altura, así que cada litro de aire contiene menos moles de O₂.</p>
<label class="rg">Altura explorada: <b id="gaO"></b><input type="range" id="gA" min="0" max="8849" step="10" value="${ea}"></label><p id="gaR" class="regla"></p>
<div class="scroll"><table><tr><th>Lugar</th><th>Altura (m)</th><th>P (atm)</th><th>mol de O₂ por litro</th><th>Respecto al mar</th></tr>${altRows()}</table></div>`;
  const up=()=>{const T=TK(),o=h=>.2*atmAlt(h)/(R*T);$("#gaO").textContent=ea+" m";$("#gaR").textContent=`A ${ea} m: P ≈ ${f2(atmAlt(ea))} atm; 1 L de aire contiene ${f2(o(ea),5)} mol de O₂, el ${f2(o(ea)/o(0)*100,0)} % del que hay al nivel del mar.`};
  $("#gA").oninput=e=>{ea=+e.target.value;up()};up();
}
function charts(){
  const ds=S.d.filter(done);
  if(!ds.length){$("#gch").innerHTML=`<p class="hint">Mide al menos un integrante para ver las gráficas.</p>`;return}
  const ser=f=>ds.map((d,i)=>({n:d.n,c:COL[i%6],p:[0,1,2,3,4,5].map(t=>[t,f(d,t)])}));
  $("#gch").innerHTML=`<div class="chart">${gr().join("")}</div>`;
}
const gr=()=>{const ds=S.d.filter(done),ser=f=>ds.map((d,i)=>({n:d.n,c:COL[i%6],p:[0,1,2,3,4,5].map(t=>[t,f(d,t)])}));
  return[chartSVG({t:"A · Volumen desplazado vs integrantes",xl:"Integrante",yl:"Volumen (L)",bars:ds.map(d=>[d.n,d.V])}),
   chartSVG({t:"B · Tiempo vs número de exhalaciones",xl:"Tiempo (min)",yl:"Exhalaciones",xmax:5,series:ser((d,t)=>d.r*t)}),
   chartSVG({t:"C · Tiempo vs cantidad de oxígeno respirado",xl:"Tiempo (min)",yl:"O₂ respirado (L)",xmax:5,series:ser((d,t)=>d.V*d.r*.2*t)})]};
LB.tabs("gas","g-",t=>{if(t=="calc")calc();if(t=="gra")charts()});
$("#gpr").onclick=()=>LB.print("gas",()=>{
  LB.report("gas","Los gases cumplen una función vital","Química grado 10 · Laboratorio",[
   {h:"Datos y cálculos",html:`<p class="obj"><b>Objetivo:</b> medir el aire que respiramos y determinar el oxígeno que consumimos por minuto y a diferentes alturas.</p><p class="nota">Condiciones: T = ${S.T} °C, P ≈ ${f2(Pat())} atm (${S.alt} m).</p>${tbl()}${q3()}`},
   {h:"Gráficas",html:gr().join("")},
   {h:"Conclusiones",qa:LB.qa("#g-con")}]);
});
window.gasReset=()=>{
  if(!confirm("¿Borrar las mediciones, las gráficas y las conclusiones de este laboratorio?"))return;
  S.d.forEach((d,i)=>{d.V=d.r=null;d.n=PR[i][0]});S.alt=1480;S.T=24;ea=1480;save();LB.clear("gas",IDS);
  $("#gT").value=24;$("#gCity").value=1480;sel=0;step=0;tmp=null;busy=false;env();draw();log();calc();charts();
};
env();draw();log();
})();