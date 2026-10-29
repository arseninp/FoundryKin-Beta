import test from 'node:test';
import assert from 'node:assert/strict';
import {createDoorModels} from '../models/doors.mjs';
import {normalizeBlock} from '../catalog/resources.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
function three(){
 class BoxGeometry{constructor(w,h,d){this.size=[w,h,d];this.rows=[];this.coords=[];this.groups=[];for(const [index,axis,sign] of [[0,0,1],[1,0,-1],[2,1,1],[3,1,-1],[4,2,1],[5,2,-1]]){this.groups.push({start:index*6,count:6,materialIndex:index});for(const a of [-1,1])for(const b of [-1,1]){const p=[0,0,0],n=[0,0,0],other=[0,1,2].filter(i=>i!==axis),size=[w,h,d];p[axis]=sign*size[axis]/2;p[other[0]]=a*size[other[0]]/2;p[other[1]]=b*size[other[1]]/2;n[axis]=sign;this.rows.push({p,n});}}const attr=k=>({count:this.rows.length,getX:i=>this.rows[i][k][0],getY:i=>this.rows[i][k][1],getZ:i=>this.rows[i][k][2]});this.attributes={position:attr('p'),normal:attr('n'),uv:{setXY:(i,u,v)=>{this.coords[i]=[u,v];}}};}dispose(){this.disposed=true;}}
 class Mesh{constructor(geometry,material){this.geometry=geometry;this.material=material;this.position={set:(x,y,z)=>Object.assign(this.position,{x,y,z})};}}
 return {BoxGeometry,Mesh};
}
function env(slot='lower'){return {slot,bindings:{lower:'lower',upper:'upper'},mats:{lower:{id:'lower',map:{image:{width:16,height:16}}},upper:{id:'upper',map:{image:{width:32,height:32}}}},group:{children:[],add(m){this.children.push(m);}}};}
function snapshot(E){return E.group.children.map(m=>({size:m.geometry.size,coords:m.geometry.coords,groups:m.geometry.groups,position:[m.position.x,m.position.y,m.position.z],materials:m.material.map(x=>x.id)}));}
test('door retains accepted dimensions, position and camera scale without a merged texture',()=>{
 const model=createDoorModels(three())[0],E=env();model.build(E);
 assert.equal(model.id,'door');assert.equal(model.scale,1.4);assert.equal(model.mode,'volume');assert.equal(E.group.children.length,2);
 E.group.children.forEach((m,i)=>{assert.deepEqual(m.geometry.size,[1,1,.1875]);assert.equal(m.position.y,i===0?-.5:.5);assert.equal(m.position.z,-.40625);assert.ok(m.material.every(mat=>mat===E.mats[i===0?'lower':'upper']));});
 assert.equal(E.mats.lower.map.image.width,16);assert.equal(E.mats.upper.map.image.width,32);assert.equal(E.mats.__door,undefined);
});
test('every visible vertex is UV-equivalent to the accepted combined 16 by 32 door',()=>{
 const E=env();createDoorModels(three())[0].build(E);
 E.group.children.forEach((m,half)=>{assert.equal(m.geometry.groups.length,5);assert.ok(!m.geometry.groups.some(g=>g.materialIndex===(half===0?2:3)));
 m.geometry.rows.forEach(({p:[x,y,z],n:[nx,ny,nz]},i)=>{
  if((half===0&&ny>0)||(half===1&&ny<0))return;
  const Y=y+m.position.y,Z=z+m.position.z,depth=(z+.09375)/.1875;
  const expected=nx?[nx>0?.5-Z:Z+.5,(Y+1)/2]:nz?[nz>0?x+.5:.5-x,(Y+1)/2]:[x+.5,ny>0?1-.09375*depth:.09375*depth];
  const actual=[m.geometry.coords[i][0],(m.geometry.coords[i][1]+half)/2];
  actual.forEach((v,k)=>assert.ok(Math.abs(v-expected[k])<1e-12));
 });});
});
test('choosing an edited PNG cannot change the model',()=>{const shots=[];for(const slot of ['lower','upper','icon']){const E=env(slot);createDoorModels(three())[0].build(E);shots.push(snapshot(E));}assert.deepEqual(shots[0],shots[1]);assert.deepEqual(shots[1],shots[2]);});
test('missing resources fail atomically and geometry allocation errors dispose prepared buffers',()=>{
 const E=env();delete E.mats.upper;assert.throws(()=>createDoorModels(three())[0].build(E),/Missing door material/);assert.equal(E.group.children.length,0);
 const Three=three(),Base=Three.BoxGeometry,created=[];Three.BoxGeometry=class extends Base{constructor(...args){if(created.length===1)throw new Error('allocation');super(...args);created.push(this);}};
 const failed=env();assert.throws(()=>createDoorModels(Three)[0].build(failed),/allocation/);assert.equal(failed.group.children.length,0);assert.equal(created[0].disposed,true);
 assert.throws(()=>createDoorModels({}),/require Three/);
});
function setup(){
 const P='textures/blocks/',atlas={door_lower:{textures:[P+'door_wood_lower',P+'door_iron_lower']},door_upper:{textures:[P+'door_wood_upper',P+'door_iron_upper']}},definition={textures:{up:'door_lower',down:'door_lower',side:'door_upper'}},icon='textures/items/door_wood';
 const record=normalizeBlock('wooden_door',definition,atlas,{model:'door',icons:[icon]});
 const catalog={schema:1,records:{wooden_door:record},items:{},aliases:{old_door:'wooden_door'},families:{},resources:{}};
 const model=createDoorModels(three())[0],registry={get:id=>id==='door'?model:{scale:1,mode:'sprite'},build:(id,E)=>id==='door'?model.build(E):E};
 return {record,resolve:createPreviewResolver(catalog,registry)};
}
test('normalization and preview pass named halves to the actual builder without unrelated woods',()=>{
 const s=setup(),before=JSON.stringify(s.record);
 assert.deepEqual(s.record.paths,['textures/blocks/door_wood_lower','textures/blocks/door_wood_upper','textures/items/door_wood']);
 for(const slot of s.record.paths){const p=s.resolve({id:'old_door',slot}),E={mats:Object.fromEntries(s.record.paths.map(id=>[id,{id}])),group:{children:[],add(m){this.children.push(m);}}};p.build(E);assert.equal(p.object.id,'wooden_door');assert.equal(E.group.children.length,2);assert.equal(p.bindings.lower,'textures/blocks/door_wood_lower');assert.equal(p.bindings.upper,'textures/blocks/door_wood_upper');}
 assert.equal(JSON.stringify(s.record),before);
});
test('icon view stays separate and malformed or foreign halves are rejected before dispatch',()=>{
 const s=setup();assert.equal(s.resolve({id:'wooden_door',slot:'textures/items/door_wood',view:'sprite'}).model,'sprite');
 s.record.faces.down=[];assert.throws(()=>s.resolve({id:'wooden_door'}),/door halves/);
 const t=setup();t.record.faces.north=['textures/blocks/unrelated'];assert.throws(()=>t.resolve({id:'wooden_door'}),/outside the selected record/);
});

test('explicit named door parts also work for a declared item model',()=>{
 const s=setup(),record={...s.record,bindings:{lower:s.record.faces.down,upper:s.record.faces.north}};delete record.faces;
 const model=createDoorModels(three())[0],resolve=createPreviewResolver({schema:1,records:{},items:{door_item:record},aliases:{},families:{},resources:{}},{get:()=>model,build:(id,E)=>model.build(E)});
 const E={mats:Object.fromEntries(record.paths.map(id=>[id,{id}])),group:{children:[],add(m){this.children.push(m);}}};
 resolve({id:'door_item',kind:'item',view:'model'}).build(E);assert.equal(E.group.children.length,2);
});
