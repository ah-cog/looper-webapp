import assert from 'node:assert/strict';
for (const port of [3000,3001,3002]) {
  assert.equal((await fetch(`http://localhost:${port}/health`)).status,200);
  assert.match(await (await fetch(`http://localhost:${port}`)).text(),/Looper/);
}
const api=async(port,route,body,method=body?'POST':'GET')=>{const r=await fetch(`http://localhost:${port}/api${route}`,{method,headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});assert.ok(r.ok,await r.clone().text());return r.status===204?null:r.json();};
const unitId=(await api(3000,'/state')).units[0].id;
const marker=`integration-${Date.now()}`;
const b=await api(3002,'/behaviors',{unitId,title:'message',content:marker,source:'mobile-smoke'});
assert.ok((await api(3000,'/state')).behaviors.some(x=>x.id===b.id));
assert.ok((await api(3001,'/state')).messages.some(x=>x.content===marker));
await api(3000,'/behaviors/'+b.id,null,'DELETE');
assert.ok(!(await api(3002,'/state')).behaviors.some(x=>x.id===b.id));
console.log('PASS: all three services healthy; mobile → API → webapp shared behavior and message; deletion synchronized.');
