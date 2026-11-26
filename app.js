const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const shuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const store={get(k){try{return localStorage.getItem(k)}catch(_){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(_){}},del(k){try{localStorage.removeItem(k)}catch(_){}}};

/* Navegación */
function show(id){["home","nom","lab"].forEach(x=>$("#"+x).hidden=x!=id);scrollTo(0,0)}
$$("[data-go]").forEach(b=>b.onclick=()=>show(b.dataset.go));
$$("[data-home]").forEach(b=>b.onclick=()=>show("home"));
$$("[data-reset]").forEach(b=>b.onclick=()=>b.closest("#nom")?nomReset():labReset());

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
["nombre","fecha",...QS.map((_,i)=>"q"+i)].forEach(id=>{
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
  const f=$("#fecha").value?$("#fecha").value.split("-").reverse().join("/"):new Date().toLocaleDateString("es-CO");
  pag().innerHTML=`<div class="portada"><p class="inst">INSTITUCIÓN EDUCATIVA LOS QUINDOS</p><h1>Laboratorio de propiedades organolépticas</h1><p class="sub">Química · Grado 7 · Primer periodo</p><div class="datos"><p><b>Estudiante:</b> ${esc(nombre)}</p><p><b>Fecha:</b> ${f}</p><p><b>Docente:</b> Olga Liliana Salinas Casallas</p></div></div>`;
  pag().innerHTML=`<h2>Tabla de resultados</h2><p class="obj"><b>Objetivo:</b> determinar las propiedades organolépticas de diferentes sustancias de uso cotidiano.</p><table><tr><th>Sustancia</th>${PROPS.map(p=>`<th>${p}</th>`).join("")}</tr>${IT.map((it,r)=>`<tr><td>${it.n}</td>${PROPS.map((_,c)=>`<td>${obs[r+"_"+c]?esc(it.d[c]):""}</td>`).join("")}</tr>`).join("")}</table><p class="nota">* Sensación al tacto: la reacción que se siente al tocar, oler o probar una sustancia.</p>`;
  let p=pag();p.innerHTML="<h2>Cuestionario</h2>";
  QS.forEach((q,i)=>{
    const b=document.createElement("div");b.className="qa";
    b.innerHTML=`<b>${i+1}. ${q}</b><div class="ans"></div>`;
    const a=b.lastChild;a.textContent=document.getElementById("q"+i).value;
    p.appendChild(b);
    if(p.scrollHeight>p.clientHeight+1){p.removeChild(b);p=pag();p.appendChild(b);let fs=11;while(p.scrollHeight>p.clientHeight+1&&fs>6){fs-=.5;a.style.fontSize=fs+"pt"}}
  });
  const fotos=[...document.querySelectorAll("#galeria img")].map(i=>i.src),np=Math.max(1,Math.ceil(fotos.length/6));
  for(let k=0;k<np;k++)pag().innerHTML=`<h2>Registro fotográfico${np>1?` (${k+1}/${np})`:""}</h2><div class="fg">`+Array.from({length:6},(_,n)=>{const s=fotos[k*6+n];return`<div class="fc2">${s?`<img src="${s}" alt="Foto ${k*6+n+1}">`:""}</div>`}).join("")+`</div>`;
}
$("#imprimir").onclick=()=>{
  if(!$("#nombre").value.trim()){const n=prompt("¿Cuál es tu nombre para la portada?");if(n){$("#nombre").value=n;store.set("lab:nombre",n)}}
  armarInforme();setTimeout(()=>print(),300);
};
window.onafterprint=()=>{$("#informe").innerHTML=""};
function labReset(){
  if(!confirm("¿Borrar observaciones, tabla y respuestas del laboratorio?"))return;
  obs={};cur=null;store.del("lab:obs");
  ["nombre","fecha",...QS.map((_,i)=>"q"+i)].forEach(id=>{document.getElementById(id).value="";store.del("lab:"+id)});
  $$(".item").forEach(x=>x.classList.remove("on"));
  $("#big").innerHTML='<span class="empty">Elige una sustancia</span>';
  $("#bubble").textContent="Aquí aparecerá lo que percibas.";$("#galeria").innerHTML="";pintar();
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

/* Registro fotográfico y correo (laboratorio) */
$("#fotos").onchange=e=>{[...e.target.files].forEach(f=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.src=r.result;im.alt="Registro fotográfico";im.title="Toca para quitar";im.onclick=()=>im.remove();$("#galeria").appendChild(im)};r.readAsDataURL(f)});e.target.value=""};
$("#correo").href="mailto:olga.salinas@ielosquindos.edu.co?subject="+encodeURIComponent("Informe laboratorio propiedades organolépticas - Grado 7");
