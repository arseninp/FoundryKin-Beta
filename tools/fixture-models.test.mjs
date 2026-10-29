import {createPreviewResolver} from '../catalog/preview.mjs';
import {planModelAssignments} from '../catalog/model-policy.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createFixtureModels} from '../models/fixtures.mjs';
function attr(rows){return {count:rows.length,getX:i=>rows[i][0],getY:i=>rows[i][1],getZ:i=>rows[i][2],setXY(i,x,y){rows[i]=[x,y];},rows};}
function three(){
 class Group {constructor(){this.children=[];this.rotation={};this.position={set:(...v)=>{this.xyz=v;}};}add(m){this.children.push(m);}}
 class BoxGeometry {constructor(w,h,d){this.size=[w,h,d];const pos=[],norm=[];for(const [axis,sign] of [[0,1],[0,-1],[1,1],[1,-1],[2,1],[2,-1]])for(const [a,b] of [[-1,-1],[-1,1],[1,-1],[1,1]]){const v=[0,0,0],n=[0,0,0],other=[0,1,2].filter(i=>i!==axis),size=[w,h,d];v[axis]=sign*size[axis]/2;v[other[0]]=a*size[other[0]]/2;v[other[1]]=b*size[other[1]]/2;n[axis]=sign;pos.push(v);norm.push(n);}this.attributes={position:attr(pos),normal:attr(norm),uv:attr(pos.map(()=>[0,0]))};}}
 class PlaneGeometry {constructor(w,h){this.size=[w,h];this.attributes={uv:attr([[0,1],[1,1],[0,0],[1,0]])};}}
 class Mesh extends Group {constructor(geometry,material){super();this.geometry=geometry;this.material=material;}}
 return {DoubleSide:2,BoxGeometry,PlaneGeometry,Mesh,Group};
}
function setup(id){const Three=three(),group=new Three.Group(),faceMap={east:'edge',south:'glass',north:'stand',down:'base'};const E={faceMap,slot:'icon',hiddenMat:{},mats:Object.fromEntries(['edge','glass','stand','base','icon'].map(id=>[id,{id}])),group};return {E,build:()=>createFixtureModels(Three).find(m=>m.id===id).build(E)};}
function snapshot(group){return group.children.map(m=>({size:m.geometry?.size,uv:m.geometry?.attributes.uv.rows,position:m.xyz,rotation:m.rotation,material:Array.isArray(m.material)?m.material.map(x=>x.id):m.material?.id,children:snapshot(m)}));}
test('pane preserves dimensions and edge/front materials',()=>{const s=setup('pane');s.build();const m=s.E.group.children[0];assert.deepEqual(m.geometry.size,[1,1,.125]);assert.deepEqual(m.material.map(x=>x.id),['edge','edge','edge','edge','glass','glass']);assert.ok(m.geometry.attributes.uv.rows.flat().every(Number.isFinite));});
test('candle preserves body, wick planes and exact UV crop',()=>{const s=setup('candle');s.build();const [body,a,b]=s.E.group.children;assert.deepEqual(body.geometry.size,[.125,.375,.125]);assert.deepEqual(body.xyz,[0,-.3125,0]);assert.deepEqual(a.xyz,[0,-.09375,0]);assert.equal(a.rotation.y,Math.PI/4);assert.equal(b.rotation.y,-Math.PI/4);assert.deepEqual(a.geometry.attributes.uv.rows,[[0,.6875],[.0625,.6875],[0,.625],[.0625,.625]]);});
test('brewing preserves rod, three bases and three mirrored arm pivots',()=>{const s=setup('brewing');s.build();const c=s.E.group.children;assert.equal(c.length,7);assert.deepEqual(c[0].geometry.size,[.125,.875,.125]);assert.deepEqual(c.slice(1,4).map(m=>m.xyz),[[.25,-.4375,0],[-.25,-.4375,-.25],[-.25,-.4375,.25]]);assert.deepEqual(c.slice(4).map(m=>m.rotation.y),[0,Math.PI/4,-Math.PI/4]);assert.deepEqual(c[5].children[0].geometry.attributes.uv.rows,[[1,1],[.5,1],[1,0],[.5,0]]);});
test('editing slot never changes fixture geometry',()=>{for(const id of ['pane','candle','brewing']){const a=setup(id),b=setup(id);b.E.slot='base';a.build();b.build();assert.deepEqual(snapshot(a.E.group),snapshot(b.E.group));}});
test('missing materials and dependencies fail explicitly',()=>{assert.throws(()=>createFixtureModels({}),/require Three/);for(const id of ['pane','candle','brewing']){const s=setup(id);s.E.mats={};assert.throws(s.build,/Missing fixture material/);}});

function previewFixture(id,model,faces) {
 const paths=[...new Set(Object.values(faces).flat())],record={id,model,faces,paths,icons:[]};
 const catalog={schema:1,records:{[id]:record},items:{},aliases:{},families:{},resources:{}};
 const models=new Map(createFixtureModels(three()).map(m=>[m.id,m]));
 const registry={get:id=>models.get(id),build:(id,E)=>models.get(id).build(E)};
 const resolve=createPreviewResolver(catalog,registry);
 const environment=()=>({mats:Object.fromEntries(paths.map(id=>[id,{id}])),group:new (three().Group)()});
 return {resolve,record,environment};
}
test('candle state binds the selected power independently of the edited PNG',()=>{
 const off='textures/blocks/candles/white_candle',on=off+'_lit';
 const faces=Object.fromEntries(['up','down','north','south','east','west'].map(f=>[f,[off,on]]));
 const s=previewFixture('white_candle','candle',faces),before=JSON.stringify(s.record);
 for(const lit of [false,true])for(const slot of [off,on]){
  const p=s.resolve({id:'white_candle',state:{lit},slot}),E=s.environment();p.build(E);
  assert.equal(p.faceMap.east,lit?on:off);assert.equal(E.group.children.length,3);
 }
 assert.equal(s.resolve({id:'white_candle'}).state.lit,false);
 assert.throws(()=>s.resolve({id:'white_candle',state:{lit:'on'}}),/Invalid candle/);
 assert.throws(()=>s.resolve({id:'white_candle',state:{lit:false},faceChoices:{east:on}}),/Explicit face variant/);
 assert.equal(JSON.stringify(s.record),before);
});
test('pane and brewing resources reach the actual fixture builder through preview',()=>{
 for(const [id,model,faces,count] of [
  ['glass_pane','pane',{up:['glass'],down:['glass'],north:['glass'],south:['glass'],east:['edge'],west:['glass']},1],
  ['brewing_stand','brewing',{up:['stand'],down:['base'],north:['stand'],south:['stand'],east:['stand'],west:['stand']},7]
 ]){const s=previewFixture(id,model,faces),E=s.environment();s.resolve({id}).build(E);assert.equal(E.group.children.length,count);}
 const plan=planModelAssignments({brewing_stand:{},glass_pane:{},white_candle:{}});
 assert.deepEqual(plan.unresolved,[]);assert.equal(plan.assignments.brewing_stand.model,'brewing');
});
