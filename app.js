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
["Fe","+2","ferroso"],["Fe","+3","férrico"],["Cu","+1","cuproso"],["Cu","+2","cúprico"],["Hg","+1","mercuroso"],["Hg","+2","mercúrico"],["Sn","+2","estannoso"],["Sn","+4","estánnico"],["Pb","+2","plumboso"],["Pb","+4","plúmbico"],["Au","+1","auroso"],["Au","+3","áurico"],["Co","+2","cobaltoso"],["Co","+3","cobáltico"],["Ni","+2","niqueloso"],["Ni","+3","niquélico"]];
const A=[["F","-1","fluoruro"],["Cl","-1","cloruro"],["Br","-1","bromuro"],["I","-1","yoduro"],["O","-2","óxido"],["S","-2","sulfuro"],["OH","-1","hidróxido"],
["(ClO)","-1","hipoclorito"],["(ClO2)","-1","clorito"],["(ClO3)","-1","clorato"],["(ClO4)","-1","perclorato"],["(IO3)","-1","yodato"],["(IO4)","-1","peryodato"],["(NO2)","-1","nitrito"],["(NO3)","-1","nitrato"],["(SO3)","-2","sulfito"],["(SO4)","-2","sulfato"],["(CO3)","-2","carbonato"],["(PO4)","-3","fosfato"],["(MnO4)","-1","permanganato"],["(CrO4)","-2","cromato"],["(Cr2O7)","-2","dicromato"]];
const LV=[C.slice(0,10),C.slice(10),A.slice(0,7),A.slice(7)];
const REG=["Un catión con una sola valencia lleva el nombre del elemento: Na⁺ → sodio.",
"Si el elemento tiene dos valencias, la menor termina en -oso y la mayor en -ico: Fe⁺² → ferroso, Fe⁺³ → férrico.",
"Los aniones sin oxígeno terminan en -uro: Cl⁻ → cloruro. O⁻² es óxido y OH⁻ es hidróxido.",
"Oxianiones: hipo-…-ito (menos oxígeno), -ito, -ato y per-…-ato (más oxígeno). (ClO)⁻ hipoclorito → (ClO₄)⁻ perclorato."];
const fmt=d=>d[0].replace(/(\d+)/g,"<sub>$1</sub>")+"<sup>"+d[1].replace("-","−")+"</sup>";
let nSel=null,aciertos=0,fallos=0,nivel=0,rondas=0;

function nomRonda(){
  nivel=+$("input[name=niv]:checked").value;
  const ps=shuf(LV[nivel]).slice(0,6);
  $("#rows").innerHTML=ps.map((d,i)=>`<div class="row"><div class="ion ${d[1][0]=="-"?"a":""}">${fmt(d)}</div><div class="slot" data-n="${d[2]}" data-i="${i}">?</div></div>`).join("");
  $("#tray").innerHTML=shuf(ps).map(d=>`<div class="tok" data-n="${d[2]}">${d[2]}</div>`).join("");
  $("#regla").textContent=REG[nivel];$("#nmsg").textContent="";nSel=null;aciertos=0;fallos=0;nScore();
}
function nScore(){$("#score").innerHTML=`Aciertos: ${aciertos}/6<br>Errores: ${fallos}<br>Rondas completas: ${rondas}`}
function intentar(tok,slot){
  if(!slot||slot.classList.contains("ok")){return false}
  if(tok.dataset.n==slot.dataset.n){
    slot.textContent=tok.dataset.n;slot.classList.add("ok");tok.remove();aciertos++;
    if(aciertos==6){rondas++;$("#nmsg").textContent=`¡Muy bien! Completaste la ronda con ${fallos} error${fallos==1?"":"es"}. 🎉`}
    nScore();return true;
  }
  fallos++;nScore();tok.classList.add("bad");tok.style.transform="";setTimeout(()=>tok.classList.remove("bad"),450);return false;
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
function nomReset(){rondas=0;$("input[name=niv][value='0']").checked=true;nomRonda()}
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
$$(".tabs button").forEach(b=>b.onclick=()=>{
  $$(".tabs button").forEach(x=>x.classList.toggle("on",x==b));
  ["bench","tabla","quiz"].forEach(t=>$("#s-"+t).hidden=t!=b.dataset.t);
});
$("#imprimir").onclick=()=>{document.body.classList.add("printing");print()};
window.onafterprint=()=>document.body.classList.remove("printing");
function labReset(){
  if(!confirm("¿Borrar observaciones, tabla y respuestas del laboratorio?"))return;
  obs={};cur=null;store.del("lab:obs");
  ["nombre","fecha",...QS.map((_,i)=>"q"+i)].forEach(id=>{document.getElementById(id).value="";store.del("lab:"+id)});
  $$(".item").forEach(x=>x.classList.remove("on"));
  $("#big").innerHTML='<span class="empty">Elige una sustancia</span>';
  $("#bubble").textContent="Aquí aparecerá lo que percibas.";pintar();
}
pintar();
