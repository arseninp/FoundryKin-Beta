/* Java-reference stem_growth0..7 and stem_fruit geometry; materials and game tint remain renderer-owned. */
import {composeShape,requireRoles} from './shapes.mjs';
const TURN=Object.freeze({west:0,north:-Math.PI/2,east:Math.PI,south:Math.PI/2});
export function createStemModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Stem models require Three');
 function cross(p,path,height) {
  const y=(height/2-9)/16;
  for(const [angle,mirror] of [[5*Math.PI/4,false],[Math.PI/4,true],[-Math.PI/4,false],[3*Math.PI/4,true]]) {
   p.face(path,Math.SQRT2,height/16,0,y,0,0,angle,mirror?[16,0,0,height]:[0,0,16,height]);
  }
 }
 function build(E) {
  const state=E?.state??{},stage=state.stage===undefined?0:state.stage,attached=state.attached===undefined?false:state.attached,facing=state.facing===undefined?'west':state.facing;
  if(!Number.isInteger(stage)||stage<0||stage>7)throw new Error('Invalid stem stage');
  if(typeof attached!=='boolean')throw new Error('Invalid stem attached state');
  if(typeof facing!=='string'||!Object.hasOwn(TURN,facing))throw new Error('Invalid stem facing');
  const f=requireRoles(E,attached?['stem','upperstem']:['stem'],'stem');
  composeShape(Three,E,p=>{
   if(!attached){cross(p,f.stem,2*(stage+1));return;}
   p.turned(TURN[facing],inner=>{
    cross(inner,f.stem,8);
    inner.face(f.upperstem,9/16,1,-7/32,0,0,0,Math.PI,[9,0,0,16]);
    inner.face(f.upperstem,9/16,1,-7/32,0,0,0,0,[0,0,9,16]);
   });
  });
 }
 return [{id:'stem',scale:1,mode:'volume',build}];
}
