const $ = (id) => document.getElementById(id);
const native = window.Capacitor?.isNativePlatform?.();
let api = localStorage.getItem('looperApi') ?? (native ? (window.Capacitor.getPlatform() === 'android' ? 'http://10.0.2.2:3001' : 'http://127.0.0.1:3001') : '');
let state, lastRender, refreshing = false;
$('endpoint').value = api;
if (native) document.querySelectorAll('nav a').forEach(a => { const url = new URL(a.href); url.hostname = window.Capacitor.getPlatform() === 'android' ? '10.0.2.2' : '127.0.0.1'; a.href = url.href; });
async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  let response;
  try { response = await fetch(api + '/api' + path, { ...options, headers: {'Content-Type':'application/json'}, signal: controller.signal }); }
  finally { clearTimeout(timer); }
  if (!response.ok) { const body = await response.json(); throw new Error(body.error || response.statusText); }
  return response.status === 204 ? null : response.json();
}
function node(tag, text, attrs = {}) { const e = document.createElement(tag); e.textContent = text; Object.assign(e,attrs); return e; }
function render() {
  const signature = JSON.stringify(state);
  if (lastRender === signature) return;
  lastRender = signature;
  const selected = $('unit').value;
  $('unit').replaceChildren(...state.units.map(u => node('option',u.name + (u.simulated ? ' · simulated' : ''),{value:u.id})));
  if (state.units.some(u=>u.id===selected)) $('unit').value=selected;
  renderUnit();
  $('timeline').replaceChildren(...state.messages.slice().reverse().map(m => {
    const li=node('li',m.content);
    li.append(node('small',m.source + ' · ' + new Date(m.createdAt).toLocaleTimeString()));
    return li;
  }));
}
function renderUnit() {
  if (!state) return;
  const unit = state.units.find(u=>u.id===$('unit').value);
  const behaviors = state.behaviors.filter(b=>b.unitId===unit?.id);
  $('sequence').replaceChildren(...behaviors.map(b=>{
    const li=node('li',b.title + ' · ' + b.content);
    const remove=node('button','Remove',{className:'secondary',type:'button'});
    remove.onclick=()=>act(()=>request('/behaviors/'+b.id,{method:'DELETE'}));
    li.append(remove); return li;
  }));
  $('empty').hidden=behaviors.length>0;
  const svg=$('scene'); svg.replaceChildren();
  const add=(tag,attrs,text)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);if(text)e.textContent=text;svg.append(e);return e;};
  const colors={red:'#ce5247',green:'#429b71',blue:'#527fd1',white:'#a7b6aa'};
  add('circle',{cx:200,cy:150,r:100,fill:'none',stroke:'#d5e5d9','stroke-width':16});
  add('circle',{cx:200,cy:150,r:67,fill:colors[unit?.color]||colors.green,opacity:.15});
  add('text',{x:200,y:150,'text-anchor':'middle',fill:'#20352e','font-size':19},unit?.name||'No units');
  add('text',{x:200,y:175,'text-anchor':'middle',fill:'#63726a','font-size':13},unit?.simulated?'Local simulator':'Clay unit');
  behaviors.forEach((b,i)=>{const a=i/behaviors.length*Math.PI*2-Math.PI/2,x=200+100*Math.cos(a),y=150+100*Math.sin(a);add('circle',{cx:x,cy:y,r:23,fill:colors[unit?.color]||colors.green});add('text',{x,y:y+5,'text-anchor':'middle',fill:'white','font-size':15},String(i+1));});
}
async function refresh() {
  if (refreshing) return;
  refreshing=true;
  try { state=await request('/state');render();$('status').textContent='Connected · shared local system'; }
  catch(error){$('status').textContent='Disconnected';$('error').textContent=error.message;}
  finally{refreshing=false;}
}
async function act(work) { $('error').textContent='';try{await work();await refresh();}catch(error){$('error').textContent=error.message;} }
$('unit').onchange=renderUnit;
$('command-form').onsubmit=async event=>{event.preventDefault();const content=$('command').value.trim();if(!content)return;await act(async()=>{await request('/messages',{method:'POST',body:JSON.stringify({unitId:$('unit').value,content,source:document.body.dataset.app})});$('command').value='';});};
const defaults={control:'change color to green',time:'wait 500', 'cause/effect':'map channel 1 to 2',message:'hello from Looper',say:'say hello'};
$('kind').onchange=()=>{$('content').value=defaults[$('kind').value];};
$('behavior-form').onsubmit=async event=>{event.preventDefault();await act(()=>request('/behaviors',{method:'POST',body:JSON.stringify({unitId:$('unit').value,title:$('kind').value,content:$('content').value,source:document.body.dataset.app})}));};
$('connection-form').onsubmit=event=>{event.preventDefault();const value=$('endpoint').value.trim().replace(/\/$/,'');if(value&&!/^https?:\/\//.test(value)){$('error').textContent='Enter an http:// or https:// service URL';return;}api=value;localStorage.setItem('looperApi',api);lastRender=null;refresh();};
refresh();setInterval(refresh,1000);
