import test from 'node:test';
import assert from 'node:assert/strict';
import {createPrimitiveModels} from '../models/primitives.mjs';
import {powerRules,compileStateGroups} from '../catalog/states.mjs';
import {planModelAssignments} from '../catalog/model-policy.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
function three(){return {BoxGeometry:class{constructor(w,h,d){this.size=[w,h,d];this.coords=[];this.rows=[];for(const [axis,sign] of [[0,1],[0,-1],[1,1],[1,-1],[2,1],[2,-1]])for(const a of [-1,1])for(const b of [-1,1]){const point=[0,0,0],normal=[0,0,0],other=[0,1,2].filter(i=>i!==axis),size=[w,h,d];point[axis]=sign*size[axis]/2;point[other[0]]=a*size[other[0]]/2;point[other[1]]=b*size[other[1]]/2;normal[axis]=sign;this.rows.push({point,normal});}const attr=k=>({count:this.rows.length,getX:i=>this.rows[i][k][0],getY:i=>this.rows[i][k][1],getZ:i=>this.rows[i][k][2]});this.attributes={position:attr('point'),normal:attr('normal'),uv:{setXY:(i,u,v)=>{this.coords[i]=[u,v];}}};}},Mesh:class{constructor(geometry,material){this.geometry=geometry;this.material=material;this.position={set:(x,y,z)=>Object.assign(this.position,{x,y,z})};}}};}
const baseIds=['cube','slab','stairs','wall','fence','gate','button','plate','cake','trapdoor','carpet'];
function setup(id,cur='stone'){const model=createPrimitiveModels(three()).find(m=>m.id===id),faceMap=Object.fromEntries(['up','down','north','south','east','west'].map(f=>[f,f]));return {model,env:{cur,faceMap,mats:Object.fromEntries(Object.values(faceMap).map(key=>[key,{key}])),group:{children:[],add(m){this.children.push(m);}}}};}
test('fourteen registrations retain explicit metadata',()=>{const models=createPrimitiveModels(three());assert.deepEqual(models.map(m=>m.id),[...baseIds,'anvil','beacon','pumpkin']);assert.ok(models.every(m=>m.scale===1&&m.mode==='volume'));});
test('accepted primitive sizes, shifts and part counts remain unchanged',()=>{
 const expected={cube:[[1,1,1,0,0,0]],slab:[[1,.5,1,0,0,0]],stairs:[[1,.5,1,0,-.25,0],[1,.5,.5,0,.25,-.25]],carpet:[[1,.0625,1,0,-.01875,0]]};
 for(const [id,parts] of Object.entries(expected)){const {model,env}=setup(id);model.build(env);assert.equal(env.group.children.length,parts.length);env.group.children.forEach((m,i)=>{assert.deepEqual(m.geometry.size,parts[i].slice(0,3));['x','y','z'].forEach((k,j)=>assert.ok(Math.abs(m.position[k]-parts[i][j+3])<1e-12));});}
 for(const [id,count] of Object.entries({wall:2,fence:3,gate:4,button:1,plate:1,cake:1,trapdoor:1})){const {model,env}=setup(id);model.build(env);assert.equal(env.group.children.length,count);}
});
test('all original primitive vertices preserve material order and world UVs',()=>{
 for(const id of baseIds){const {model,env}=setup(id);model.build(env);for(const m of env.group.children){assert.deepEqual(m.material.map(x=>x.key),['east','west','up','down','south','north']);const shift={slab:.25,button:.4,plate:.45,cake:.25,trapdoor:.4,carpet:.45}[id]||0;m.geometry.rows.forEach(({point:[x,y,z],normal:[nx,ny,nz]},i)=>{const X=x+m.position.x,Y=y+m.position.y-shift,Z=z+m.position.z,uv=nx?[nx>0?.5-Z:Z+.5,Y+.5]:nz?[nz>0?X+.5:.5-X,Y+.5]:[X+.5,ny>0?.5-Z:Z+.5];m.geometry.coords[i].forEach((v,k)=>assert.ok(Math.abs(v-uv[k])<1e-12));});}}
});
test('glazed cube keeps all accepted UV rotations',()=>{
 const {model,env}=setup('cube','white_glazed_terracotta');model.build(env);const m=env.group.children[0],angles={east:0,west:180,up:180,down:180,south:90,north:270};
 m.geometry.rows.forEach(({point:[x,y,z],normal:[nx,ny,nz]},i)=>{const f=nx?(nx>0?'east':'west'):ny?(ny>0?'up':'down'):nz>0?'south':'north',uv=nx?[nx>0?.5-z:z+.5,y+.5]:nz?[nz>0?x+.5:.5-x,y+.5]:[x+.5,ny>0?.5-z:z+.5],a=angles[f]*Math.PI/180,u=uv[0]-.5,v=uv[1]-.5,expected=[.5+u*Math.cos(a)-v*Math.sin(a),.5+u*Math.sin(a)+v*Math.cos(a)];m.geometry.coords[i].forEach((v,k)=>assert.ok(Math.abs(v-expected[k])<1e-12));});
});
test('anvil and beacon retain accepted dimensions and material ownership',()=>{
 const a=setup('anvil');a.model.build(a.env);assert.deepEqual(a.env.group.children.map(m=>m.geometry.size),[[.75,.25,.75],[.5,.0625,.625],[.25,.3125,.5],[.625,.375,1]]);assert.deepEqual(a.env.group.children[3].material.map(m=>m.key),['down','down','up','down','down','down']);
 const b=setup('beacon');b.model.build(b.env);assert.deepEqual(b.env.group.children.map(m=>m.geometry.size),[[.75,.1875,.75],[.625,.625,.625],[1,1,1]]);assert.deepEqual(b.env.group.children.map(m=>m.material[0].key),['down','up','east']);
});
test('missing materials fail before any geometry is attached',()=>{assert.throws(()=>createPrimitiveModels({}),/require Three/);for(const id of ['stairs','anvil','beacon','pumpkin']){const {model,env}=setup(id);delete env.mats.up;assert.throws(()=>model.build(env),/Missing primitive material/);assert.equal(env.group.children.length,0);}});
function catalogFixture(){
 const P='textures/blocks/',faces=(top,side,front=side)=>({up:[P+top],down:[P+side],north:[P+side],south:front.map?front.map(x=>P+x):[P+front],east:[P+side],west:[P+side]});
 const data={anvil:faces('anvil_top_damaged_0','anvil_base'),chipped_anvil:faces('anvil_top_damaged_1','anvil_base'),damaged_anvil:faces('anvil_top_damaged_2','anvil_base'),beacon:faces('beacon','glass'),pumpkin:faces('pumpkin_top','pumpkin_side',['pumpkin_face_off','pumpkin_face_on','pumpkin_side'])};data.beacon.down=[P+'obsidian'];data.carved_pumpkin=structuredClone(data.pumpkin);data.lit_pumpkin=structuredClone(data.pumpkin);
 const plan=planModelAssignments(Object.fromEntries(Object.keys(data).map(id=>[id,{}]))),records=Object.fromEntries(Object.entries(data).map(([id,faces])=>[id,{id,model:plan.assignments[id].model,faces,icons:[],paths:[...new Set(Object.values(faces).flat())]}]));
 const states=compileStateGroups(records,powerRules(records)),models=new Map(createPrimitiveModels(three()).map(m=>[m.id,m]));
 const catalog={schema:1,records,items:{},aliases:{},families:{},resources:{},stateGroups:states.groups,stateRoutes:states.routes};
 const registry={get:id=>models.get(id),build:(id,E)=>models.get(id).build(E)},resolve=createPreviewResolver(catalog,registry);
 const env=()=>({mats:Object.fromEntries([...new Set(Object.values(records).flatMap(r=>r.paths))].map(key=>[key,{key}])),group:{children:[],add(m){this.children.push(m);}}});
 return {states,records,resolve,env};
}
test('state groups preserve IDs and all resources with one card per group',()=>{const s=catalogFixture();assert.deepEqual(s.states.cards,['anvil','beacon','pumpkin']);assert.equal(s.states.routes.lit_pumpkin.state.variant,'lit');assert.equal(s.states.routes.chipped_anvil.state.damage,'chipped');for(const [id,r] of Object.entries(s.records))for(const p of r.paths){const route=s.states.routes[id];if(route)assert.ok(s.states.groups[route.card].paths.includes(p));}});
test('pumpkin variants and anvil damage reach the real migrated builders independently of slot',()=>{
 const s=catalogFixture();for(const [variant,name] of [['plain','pumpkin_side'],['carved','pumpkin_face_off'],['lit','pumpkin_face_on']])for(const slot of s.records.pumpkin.paths){const p=s.resolve({id:'pumpkin',state:{variant},slot}),E=s.env();p.build(E);assert.equal(p.faceMap.south,'textures/blocks/'+name);assert.equal(E.group.children.length,1);}
 for(const [damage,index] of [['undamaged',0],['chipped',1],['damaged',2]]){const p=s.resolve({id:'anvil',state:{damage},slot:'textures/blocks/anvil_top_damaged_0'}),E=s.env();p.build(E);assert.equal(E.group.children[3].material[2].key,'textures/blocks/anvil_top_damaged_'+index);}
 assert.throws(()=>s.resolve({id:'pumpkin',state:{variant:'unknown'}}),/Invalid preview state/);
 assert.equal(s.resolve({id:'lit_pumpkin'}).faceMap.south,'textures/blocks/pumpkin_face_on');
});
