import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPiglinHead} from '../models/piglin-head.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
const sheet='textures/entity/piglin/piglin';
function build(rotation=0){
 const Three=createThreeMock(),group=new Three.Group(),material=Object.freeze({depthWrite:true,transparent:true,alphaTest:0});
 buildPiglinHead(Three,{group,mats:{[sheet]:material}},sheet,rotation);
 return {root:group.children[0],meshes:meshesOf(group),material};
}
function edge(mesh,axis,side){return mesh.position[axis]+side*mesh.geometry.size[{x:0,y:1,z:2}[axis]]/2;}
test('piglin head, snout and tusks use full source sizes without changing materials',()=>{
 const {root,meshes,material}=build();assert.equal(meshes.length,6);assert.equal(root.position.y,-.5);
 assert.deepEqual(meshes.map(m=>m.geometry.size),[[10,8,8],[4,4,1],[1,2,1],[1,2,1],[1,5,4],[1,5,4]].map(size=>size.map(v=>v/16)));
 assert.ok(meshes.every(m=>m.material===material));assert.equal(material.depthWrite,true);assert.equal(material.transparent,true);assert.equal(material.alphaTest,0);
});
test('full-size piglin tusks meet the snout and head without the former shrink gaps',()=>{
 const {meshes:[head,snout,right,left]}=build();
 for(const piece of [snout,right,left])assert.equal(edge(piece,'z',1),edge(head,'z',-1));
 assert.equal(edge(right,'x',-1),edge(snout,'x',1));assert.equal(edge(left,'x',1),edge(snout,'x',-1));
 for(const piece of [snout,right,left])assert.equal(edge(piece,'y',-1),edge(head,'y',-1));
});
test('piglin UV rectangles, ear pivots and ear rotations remain unchanged',()=>{
 const {root,meshes}=build(7);assert.equal(root.rotation.y,-7*Math.PI/8);
 const ears=root.children.slice(4);assert.equal(ears.length,2);
 assert.deepEqual(ears.map(e=>[e.position.x,e.position.y,e.position.z]),[[5/16,6/16,0],[-5/16,6/16,0]]);
 assert.deepEqual(ears.map(e=>e.rotation.z),[30*Math.PI/180,-30*Math.PI/180]);
 const specs=[[10,8,8,0,0],[4,4,1,31,1],[1,2,1,2,4],[1,2,1,2,0],[1,5,4,51,6],[1,5,4,39,6]];
 for(const [index,[w,h,d,u,v]] of specs.entries()){
  const rects=[[u+2*d+w,v+d,u+d+w,v+d+h],[u+d,v+d,u,v+d+h],[u+d,v+d,u+d+w,v],[u+d+w,v,u+d+2*w,v+d],[u+2*d+2*w,v+d,u+2*d+w,v+d+h],[u+d+w,v+d,u+d,v+d+h]];
  for(const [face,r] of rects.entries()){
   const corners=meshes[index].geometry.rows.slice(face*4,face*4+4);
   const actual=[...new Set(corners.map(([x])=>x))].sort((a,b)=>a-b),expected=[r[0]/64,r[2]/64].sort((a,b)=>a-b);
   assert.deepEqual(actual,expected);
   assert.deepEqual([...new Set(corners.map(([,y])=>y))].sort((a,b)=>a-b),[1-r[1]/64,1-r[3]/64].sort((a,b)=>a-b));
  }
 }
});
