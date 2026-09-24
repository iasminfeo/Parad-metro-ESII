const K='paradometro.v1',$=s=>document.querySelector(s),pad=n=>String(n).padStart(2,'0');
const dk=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()),tk=d=>dk(d)+'T'+pad(d.getHours())+':'+pad(d.getMinutes());
const uid=()=>Math.random().toString(36).slice(2,9),TD=dk(new Date());
const fm=m=>m<60?Math.round(m)+' min':Math.floor(m/60)+'h '+pad(Math.round(m%60))+'min';
const brl=v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const short=s=>s.length>18?s.slice(0,17)+'…':s,br=d=>d.split('-').reverse().join('/'),brt=t=>t?br(t.slice(0,10))+' '+t.slice(11):'—';
const opts=(l,f,s)=>l.map(x=>`<option value="${x.id}"${x.id==s?' selected':''}>${esc(x[f])}</option>`).join('');

function seed(){
 let a=7;const r=()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
 const E=['Seg. Família — sede (partida)','Rua Peru, 55','Rua X, 5','Av. João César, 50','Rua das Acácias, 120','Av. Amazonas, 900','Praça da Liberdade, 10','Rua Sergipe, 300'];
 const pontos=E.map((e,i)=>({id:'p'+i,end:e,lat:+(-19.92-i*.006).toFixed(5),lng:+(-43.94+i*.005).toFixed(5)}));
 const motoristas=[['Carlos Menezes','(31) 98811-2040','MG-1234567','Fiorino 2021',11.5],['Bruna Tavares','(31) 97722-3081','MG-7654321','Honda CG 160',32],['Diego Salles','(31) 99633-4102','MG-2468013','Fiat Strada 2020',10.2]].map((m,i)=>({id:'m'+i,nome:m[0],tel:m[1],doc:m[2],veic:m[3],kml:m[4]}));
 const roteiros=[];
 for(let k=45;k>=0;k--){const d=new Date(Date.now()-k*864e5),wd=d.getDay();if(wd==0||wd==6)continue;
  motoristas.forEach((m,mi)=>{
   const ids=['p0',...[1,2,3,4,5,6,7].sort(()=>r()-.5).slice(0,3).map(i=>'p'+i)];
   let t=new Date(d.getFullYear(),d.getMonth(),d.getDate(),8,Math.floor(r()*20));
   const paradas=ids.map((id,i)=>{const ch=tk(t),q=i?Math.round(5+r()*(id=='p3'?45:22)):3;t=new Date(+t+q*6e4);const sa=tk(t);t=new Date(+t+(12+Math.floor(r()*14))*6e4);return{pontoId:id,ch,sa}});
   if(k==0&&mi==0)paradas.forEach((p,i)=>{if(i>1)p.ch=p.sa=null;else if(i==1)p.sa=null});
   roteiros.push({id:'r'+uid(),data:dk(d),motoristaId:m.id,km:Math.round(18+r()*27),paradas});
  })}
 return{motoristas,gerentes:[{id:'g0',nome:'Marina Costa',tel:'(31) 3222-1000',email:'marina.costa@exemplo.com.br'}],pontos,roteiros,params:{comb:6.29,ckm:0.35,jorn:8,min:0},audit:[]}}
function load(){try{const j=localStorage.getItem(K);if(j)return JSON.parse(j)}catch(e){}return seed()}
function save(){try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}}

let S=load();
let ui={role:'ger',mot:'',view:'painel',mode:'dia',dia:TD,mes:TD.slice(0,7),de:dk(new Date(Date.now()-29*864e5)),ate:TD,hd:dk(new Date(Date.now()-29*864e5)),ha:TD,hm:'',rd:TD,bo:false,b:{mot:'',data:TD,km:'',ids:[]}};
const NAV={painel:'Painel',roteiros:'Roteiros',hist:'Histórico',cad:'Cadastros',par:'Parâmetros'};
const ACC={adm:['painel','roteiros','hist','cad','par'],ger:['painel','roteiros','hist','cad'],mot:['roteiros','hist']};
const RL={adm:'Administrador',ger:'Gerente/Coordenador',mot:'Motorista/Motoboy'};
const mot=id=>S.motoristas.find(m=>m.id==id)||{nome:'—'},pt=id=>S.pontos.find(p=>p.id==id)||{end:'—'};
const mid=()=>ui.role=='mot'?ui.mot:'';
function tmin(r,i){const p=r.paradas[i];if(!i||!p.ch||!p.sa)return null;const m=(new Date(p.sa)-new Date(p.ch))/6e4;return m<0?null:m>=S.params.min?m:0} // RN01-RN02
const tot=r=>r.paradas.reduce((s,_,i)=>s+(tmin(r,i)||0),0); // RN03
const custo=r=>{const q=S.params;return r.km/(mot(r.motoristaId).kml||1)*q.comb+r.km*q.ckm}; // RN07
function stops(a,b,m){const o=[];S.roteiros.forEach(r=>{if(r.data<a||r.data>b||(m&&r.motoristaId!=m))return;r.paradas.forEach((p,i)=>o.push({r,p,i,d:r.data,m:tmin(r,i)}))});return o.sort((x,y)=>x.d!=y.d?(x.d<y.d?-1:1):(x.p.ch||'')>(y.p.ch||'')?1:-1)}
function aud(x){S.audit.unshift({t:tk(new Date()),u:RL[ui.role],x});S.audit.length=Math.min(S.audit.length,200);save()}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>e.classList.remove('on'),3400)}

function ribbon(r){
 const n=r.paradas.length,x=i=>n<2?320:44+i*552/(n-1);
 const c=r.paradas.map((p,i)=>{const m=tmin(r,i),R=i?12+Math.sqrt(m||0)*3.4:9,cx=x(i),e=pt(p.pontoId).end;
  return `<g><title>${esc(e)}</title><circle cx="${cx}" cy="58" r="${R}" class="${i?(m==null?'nd':'bb'):'ps'}"/>${i&&m!=null?`<text x="${cx}" y="62" class="in">${Math.round(m)}</text>`:''}<text x="${cx}" y="116" class="ad">${esc(short(e))}</text></g>`}).join('');
 return `<section class="rb"><header><b>${esc(mot(r.motoristaId).nome)}</b><span>${r.km} km</span><span>Parado ${fm(tot(r))}</span></header><div class="sc"><svg viewBox="0 0 640 128" role="img" aria-label="Paradas do roteiro"><line x1="44" x2="596" y1="58" y2="58" class="ln"/>${c}</svg></div></section>`}
function bars(it){
 const W=640,H=190,n=it.length,mx=Math.max(...it.map(x=>x.v),1),bw=(W-30)/n;
 return `<div class="sc"><svg viewBox="0 0 ${W} ${H}" style="min-width:${Math.max(520,n*16)}px" role="img" aria-label="Tempo parado">`+it.map((d,i)=>{const h=d.v/mx*(H-60),x=20+i*bw;
  return `<g><title>${d.t}</title><rect x="${x+bw*.15}" y="${H-28-h}" width="${bw*.7}" height="${h}" rx="4" class="bar${d.v==mx?' hi':''}"/>${n<=16?`<text x="${x+bw/2}" y="${H-32-h}" class="in">${Math.round(d.v)}</text>`:''}${n<=16||i%Math.ceil(n/16)==0?`<text x="${x+bw/2}" y="${H-10}" class="ad">${d.l}</text>`:''}</g>`}).join('')+`</svg></div>`}

const V={
painel(){
 const m=ui.mode,md=mid();let a,b,ctl;
 if(m=='dia'){a=b=ui.dia;ctl=`<label>Dia<input type="date" value="${ui.dia}" onchange="ui.dia=this.value;render()"></label>`}
 else if(m=='mes'){a=ui.mes+'-01';b=ui.mes+'-31';ctl=`<label>Mês<input type="month" value="${ui.mes}" onchange="ui.mes=this.value;render()"></label>`}
 else{a=ui.de;b=ui.ate;ctl=`<label>De<input type="date" value="${ui.de}" onchange="ui.de=this.value;render()"></label><label>Até<input type="date" value="${ui.ate}" onchange="ui.ate=this.value;render()"></label>`}
 const L=stops(a,b,md),rs=S.roteiros.filter(r=>r.data>=a&&r.data<=b&&(!md||r.motoristaId==md));
 const T=rs.reduce((s,r)=>s+tot(r),0),n=L.filter(x=>x.i&&x.m!=null).length,base=rs.length*S.params.jorn*60,cst=rs.reduce((s,r)=>s+custo(r),0);
 let body='';
 if(!rs.length)body=`<div class="cd"><b>Nenhum roteiro neste recorte.</b><p class="mut">Monte um roteiro em Roteiros e registre chegadas e saídas para ver o tempo parado aqui.</p></div>`;
 else if(m=='dia')body=rs.map(ribbon).join('')+`<p class="mut">Cada círculo é uma parada; o tamanho e o número indicam os minutos parados. O ponto de partida não conta (RN01).</p>`;
 else{
  const g={};L.forEach(x=>{g[x.d]=(g[x.d]||0)+(x.m||0)});
  const it=Object.keys(g).sort().map(d=>({l:d.slice(8),v:g[d],t:br(d)+': '+fm(g[d])}));
  const q={};L.forEach(x=>{if(x.i&&x.m){const e=pt(x.p.pontoId).end;q[e]=(q[e]||0)+x.m}});
  const rk=Object.entries(q).sort((x,y)=>y[1]-x[1]).slice(0,6),mx=rk.length?rk[0][1]:1;
  body=`<div class="ch"><h3>Minutos parados por dia</h3>${bars(it)}</div><div class="ch"><h3>Onde mais se para</h3>${rk.map(([e,v])=>`<div class="rk"><span>${esc(e)}</span><i style="width:${v/mx*100}%"></i><b>${fm(v)}</b></div>`).join('')||'<p class="mut">Sem paradas registradas.</p>'}</div>`}
 return `<h2>Painel de tempo parado</h2><p class="sub">${md?esc(mot(md).nome):'Toda a equipe'}, com base em jornada de ${S.params.jorn} h por dia.</p>
 <div><span class="tabs">${[['dia','Dia'],['mes','Mês'],['per','Período']].map(([k,l])=>`<button class="${m==k?'on':''}" onclick="ui.mode='${k}';render()">${l}</button>`).join('')}</span><span class="ctl">${ctl}<button onclick="exp('${a}','${b}','${md}')">Exportar CSV</button></span></div>
 <div class="kv"><div><b>${fm(T)}</b><span>Tempo parado</span></div><div><b>${base?(T/base*100).toFixed(1).replace('.',',')+'%':'—'}</b><span>Da jornada de ${S.params.jorn} h</span></div><div><b>${n?fm(T/n):'—'}</b><span>Média por parada</span></div><div><b>${brl(cst)}</b><span>Custo estimado dos trajetos</span></div></div>${body}`},

roteiros(){
 const md=mid(),rs=S.roteiros.filter(r=>r.data==ui.rd&&(!md||r.motoristaId==md)),B=ui.b;
 const bld=ui.role=='mot'?'':`<details class="bld" ${ui.bo?'open':''} ontoggle="ui.bo=this.open"><summary>Montar novo roteiro</summary>
 <div class="row"><label>Motorista<select onchange="ui.b.mot=this.value"><option value="">Selecione</option>${opts(S.motoristas,'nome',B.mot)}</select></label><label>Data<input type="date" value="${B.data}" onchange="ui.b.data=this.value"></label><label>Distância total (km)<input type="number" min="0" step="0.1" value="${B.km}" oninput="ui.b.km=this.value"></label></div>
 <div class="row"><label>Adicionar ponto<select id="np">${opts(S.pontos,'end','')}</select></label><button onclick="addp()">Adicionar à sequência</button></div>
 <ol class="seq">${B.ids.map((id,i)=>`<li><span>${esc(pt(id).end)}</span>${i?'':'<em>partida, sem tempo parado</em>'}<button onclick="mv(${i},-1)" aria-label="Subir">↑</button><button onclick="mv(${i},1)" aria-label="Descer">↓</button><button onclick="rmp(${i})" aria-label="Remover">×</button></li>`).join('')||'<li class="mut">Nenhum ponto ainda. O primeiro será a partida.</li>'}</ol>
 <button class="pri" onclick="saveR()">Salvar roteiro</button></details>`;
 const card=r=>`<section class="rb"><header><b>${esc(mot(r.motoristaId).nome)}</b><span>${r.km} km</span><span>Custo estimado ${brl(custo(r))}</span><span>Parado ${fm(tot(r))}</span></header>${r.paradas.map((p,i)=>{const m=tmin(r,i);
  return `<div class="sr"><span class="o">${i+1}</span><div><b>${esc(pt(p.pontoId).end)}</b><br><small>${i?(m==null?'Aguardando registro':'Parado '+fm(m)):'Partida: não conta tempo parado'}</small></div><div class="tm"><label>Chegada<input type="datetime-local" value="${p.ch||''}" onchange="ed('${r.id}',${i},'ch',this.value)"></label><button onclick="st('${r.id}',${i},'ch')">Chegada agora</button><label>Saída<input type="datetime-local" value="${p.sa||''}" onchange="ed('${r.id}',${i},'sa',this.value)"></label><button onclick="st('${r.id}',${i},'sa')">Saída agora</button></div></div>`}).join('')}</section>`;
 return `<h2>${ui.role=='mot'?'Meu dia':'Roteiros'}</h2><p class="sub">Registre chegada e saída em cada ponto. O tempo parado é calculado na hora.</p>${bld}
 <label style="max-width:200px">Roteiros do dia<input type="date" value="${ui.rd}" onchange="ui.rd=this.value;render()"></label>${rs.map(card).join('')||'<div class="cd"><b>Nenhum roteiro nesta data.</b></div>'}`},

hist(){
 const md=ui.role=='mot'?ui.mot:ui.hm,L=stops(ui.hd,ui.ha,md).filter(x=>x.p.ch||x.p.sa),T=L.reduce((s,x)=>s+(x.i?x.m||0:0),0);
 return `<h2>Histórico</h2><p class="sub">Pontos visitados e tempos parados, com endereço e horários registrados.</p>
 <div class="row"><label>De<input type="date" value="${ui.hd}" onchange="ui.hd=this.value;render()"></label><label>Até<input type="date" value="${ui.ha}" onchange="ui.ha=this.value;render()"></label>${ui.role=='mot'?'':`<label>Motorista<select onchange="ui.hm=this.value;render()"><option value="">Todos</option>${opts(S.motoristas,'nome',ui.hm)}</select></label>`}<button onclick="exp('${ui.hd}','${ui.ha}','${md}')">Exportar CSV</button></div>
 <div class="tw"><table><thead><tr><th>Data</th><th>Motorista</th><th>Ordem</th><th>Endereço</th><th>Chegada</th><th>Saída</th><th>Parado</th></tr></thead><tbody>${L.map(x=>`<tr><td>${br(x.d)}</td><td>${esc(mot(x.r.motoristaId).nome)}</td><td>${x.i+1}</td><td>${esc(pt(x.p.pontoId).end)}</td><td>${brt(x.p.ch)}</td><td>${brt(x.p.sa)}</td><td>${x.i?(x.m==null?'—':fm(x.m)):'partida'}</td></tr>`).join('')||'<tr><td colspan="7">Nenhum resultado neste período.</td></tr>'}</tbody></table></div><p><b>Total parado no período: ${fm(T)}</b></p>`},

cad(){
 const F={mot:[['n','Nome'],['t','Telefone','tel'],['d','Documento'],['v','Veículo'],['k','Rendimento (km/l)','number']],ger:[['n','Nome'],['t','Telefone','tel'],['e','E-mail','email']],pt:[['a','Endereço'],['la','Latitude','number'],['lo','Longitude','number']]};
 const f=(k,t,l,hint)=>`<section class="cd"><h3>${t}</h3>${hint?`<small>${hint}</small>`:''}<div class="row">${F[k].map(([i,lb,ty])=>`<label>${lb}<input id="${k}_${i}" type="${ty||'text'}"${ty=='number'?' step="any"':''}></label>`).join('')}</div><button class="pri" onclick="add('${k}')">Cadastrar</button><ul class="ls">${l}</ul></section>`;
 return `<h2>Cadastros</h2><p class="sub">Motoristas, pontos e gerentes usados na montagem dos roteiros.</p>`
 +f('mot','Motoristas e motoboys',S.motoristas.map(m=>`<li><b>${esc(m.nome)}</b> <small>${esc(m.veic)}, ${m.kml} km/l, ${esc(m.doc)}</small></li>`).join(''))
 +f('pt','Pontos',S.pontos.map(p=>`<li><b>${esc(p.end)}</b> <small>${p.lat!=null&&p.lat!==''?p.lat+', '+p.lng:'sem coordenadas'}</small></li>`).join(''),'Se o endereço não for localizado, informe latitude e longitude manualmente.')
 +(ui.role=='adm'?f('ger','Gerentes e coordenadores',S.gerentes.map(g=>`<li><b>${esc(g.nome)}</b> <small>${esc(g.email)}, ${esc(g.tel)}</small></li>`).join('')):'')},

par(){
 const p=S.params,i=(k,l,st)=>`<label>${l}<input id="pr_${k}" type="number" min="0" step="${st}" value="${p[k]}"></label>`;
 return `<h2>Parâmetros</h2><p class="sub">Alterações valem para os próximos cálculos, sem mexer em código.</p>
 <section class="cd"><h3>Custos</h3><div class="row">${i('comb','Combustível (R$/litro)','0.01')}${i('ckm','Outros custos por km (R$/km)','0.01')}</div>
 <h3>Jornada e regras de tempo parado</h3><div class="row">${i('jorn','Jornada padrão (horas/dia)','0.5')}${i('min','Parada mínima contada (min)','1')}</div>
 <button class="pri" onclick="savePar()">Salvar parâmetros</button><p class="mut">Custo do roteiro = km ÷ rendimento do veículo × combustível + km × custo por km. Paradas abaixo do mínimo contam como zero.</p></section>
 <section class="cd"><h3>Auditoria de alterações</h3><ul class="ls">${S.audit.slice(0,12).map(a=>`<li><small>${brt(a.t)} · ${a.u}</small><br>${esc(a.x)}</li>`).join('')||'<li class="mut">Nenhuma alteração registrada ainda.</li>'}</ul></section>
 <button onclick="resetD()">Restaurar dados de exemplo</button>`}};

function render(){
 $('#app').innerHTML=`<aside class="rail"><h1>Paradô&shy;metro</h1><p class="tag">Onde o roteiro para, a gente mede.</p>
 <label>Perfil de acesso<select onchange="role(this.value)">${Object.entries(RL).map(([k,v])=>`<option value="${k}"${k==ui.role?' selected':''}>${v}</option>`).join('')}</select></label>
 ${ui.role=='mot'?`<label>Motorista<select onchange="ui.mot=this.value;render()">${opts(S.motoristas,'nome',ui.mot)}</select></label>`:''}
 <nav class="line">${ACC[ui.role].map(v=>`<button class="st${v==ui.view?' on':''}" onclick="go('${v}')">${v=='roteiros'&&ui.role=='mot'?'Meu dia':NAV[v]}</button>`).join('')}</nav>
 <p class="lg">Dados pessoais tratados conforme a LGPD. Alterações de horários ficam em auditoria.</p></aside><main>${V[ui.view]()}</main>`}
const go=v=>{ui.view=v;render()};
function role(v){ui.role=v;if(!ACC[v].includes(ui.view))ui.view=ACC[v][0];if(v=='mot'&&!ui.mot)ui.mot=S.motoristas[0]?.id;render()}
function addp(){const v=$('#np').value;if(!v)return;if(ui.b.ids.includes(v))return toast('Este ponto já está no roteiro.');ui.b.ids.push(v);ui.bo=true;render()}
function mv(i,d){const a=ui.b.ids,j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];ui.bo=true;render()}
function rmp(i){ui.b.ids.splice(i,1);ui.bo=true;render()}
function saveR(){const B=ui.b;
 if(!B.mot||!B.data)return toast('Escolha o motorista e a data.');
 if(B.ids.length<2)return toast('O roteiro precisa de ao menos dois pontos: partida e destino.');
 if(S.roteiros.some(r=>r.motoristaId==B.mot&&r.data==B.data))return toast('Este motorista já tem roteiro nesta data.');
 const km=+B.km;if(B.km===''||!(km>=0))return toast('Informe a distância total em km.');
 const r={id:'r'+uid(),data:B.data,motoristaId:B.mot,km,paradas:B.ids.map(id=>({pontoId:id,ch:null,sa:null}))};
 S.roteiros.push(r);aud('Roteiro criado para '+mot(B.mot).nome+' em '+br(B.data));
 ui.rd=B.data;ui.b={mot:'',data:TD,km:'',ids:[]};ui.bo=false;save();render();
 toast(S.params.comb||S.params.ckm?'Roteiro salvo. Custo estimado: '+brl(custo(r)):'Roteiro salvo sem custo. Defina os parâmetros de custo.')}
function st(rid,i,f){const p=S.roteiros.find(x=>x.id==rid).paradas[i];
 if(f=='sa'&&!p.ch)return toast('Registre a chegada antes da saída, ou informe o horário manualmente.');
 p[f]=tk(new Date());aud((f=='ch'?'Chegada':'Saída')+' registrada em '+pt(p.pontoId).end);save();render()}
function ed(rid,i,f,v){const p=S.roteiros.find(x=>x.id==rid).paradas[i],o=p[f];p[f]=v||null;
 if(p.ch&&p.sa&&p.sa<p.ch){p[f]=o;render();return toast('A saída não pode ser anterior à chegada.')}
 aud('Horário ajustado manualmente ('+(f=='ch'?'chegada':'saída')+') em '+pt(p.pontoId).end+': '+(o||'vazio')+' para '+(v||'vazio'));save();render()}
const val=id=>$('#'+id).value.trim();
function add(k){
 if(k=='mot'){const o={id:'m'+uid(),nome:val('mot_n'),tel:val('mot_t'),doc:val('mot_d'),veic:val('mot_v'),kml:+val('mot_k')};
  if(!o.nome||!o.tel||!o.doc||!o.veic||!(o.kml>0))return toast('Preencha todos os campos; o rendimento deve ser maior que zero.');
  if(S.motoristas.some(m=>m.doc.toLowerCase()==o.doc.toLowerCase()))return toast('Documento já cadastrado.');S.motoristas.push(o)}
 if(k=='ger'){const o={id:'g'+uid(),nome:val('ger_n'),tel:val('ger_t'),email:val('ger_e')};
  if(!o.nome||!o.email)return toast('Informe ao menos nome e e-mail.');
  if(S.gerentes.some(g=>g.email.toLowerCase()==o.email.toLowerCase()))return toast('E-mail já cadastrado.');S.gerentes.push(o)}
 if(k=='pt'){const o={id:'p'+uid(),end:val('pt_a'),lat:val('pt_la')===''?'':+val('pt_la'),lng:val('pt_lo')===''?'':+val('pt_lo')};
  if(!o.end)return toast('Informe o endereço.');
  if(S.pontos.some(p=>p.end.toLowerCase()==o.end.toLowerCase()))return toast('Já existe um ponto com este endereço.');S.pontos.push(o)}
 aud('Cadastro criado em '+({mot:'motoristas',ger:'gerentes',pt:'pontos'})[k]);save();render();toast('Cadastro salvo.')}
function savePar(){const g=k=>$('#pr_'+k).value,p={comb:+g('comb'),ckm:+g('ckm'),jorn:+g('jorn'),min:+g('min')};
 if([p.comb,p.ckm,p.min].some(x=>!(x>=0)))return toast('Custos e parada mínima não podem ser negativos.');
 if(!(p.jorn>0&&p.jorn<=24))return toast('A jornada deve ficar entre 0 e 24 horas.');
 S.params=p;aud('Parâmetros atualizados');save();render();toast('Parâmetros salvos.')}
function resetD(){S=seed();save();render();toast('Dados de exemplo restaurados.')}
async function exp(a,b,m){
 const L=stops(a,b,m).filter(x=>x.p.ch);if(!L.length)return toast('Nenhum registro neste período.');
 const rows=[['Data','Motorista','Ordem','Endereço','Chegada','Saída','Tempo parado (min)']].concat(L.map(x=>[x.d,mot(x.r.motoristaId).nome,x.i+1,pt(x.p.pontoId).end,x.p.ch||'',x.p.sa||'',x.m==null?'':Math.round(x.m)]));
 const csv='\ufeff'+rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(';')).join('\r\n');
 const nome=`paradometro_${a}_a_${b}.csv`;
 try{const d=await window.claude?.use('downloads');
  if(d)await d.save({filename:nome,data:csv});
  else{const u=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),l=document.createElement('a');l.href=u;l.download=nome;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}
  toast('Relatório exportado.')}catch(e){if(!e||e.code!='declined')toast('Não foi possível exportar o relatório.')}}
render();
