/* Full-UV aquatic plant previews. State, not the edited PNG, chooses native parts. */
import {composeShape,requireRoles} from './shapes.mjs';
export function createAquaticModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Aquatic models require Three');
 function cross(p,path,y) {
  for(const [i,[angle,mirror]] of [[0,false],[Math.PI,true],[Math.PI/2,false],[-Math.PI/2,true]].entries())p.face(Array.isArray(path)?path[i]:path,Math.SQRT2,1,0,y,0,0,angle,mirror?[16,0,0,16]:[0,0,16,16]);
 }
 function seagrass(E) {
  const state=E?.state??{},tall=state.tall===undefined?false:state.tall,variant=state.variant===undefined?'a':state.variant;
  if(typeof tall!=='boolean'||!['a','b'].includes(variant))throw new Error('Invalid seagrass preview state');
  const lower='lower_'+variant,upper='upper_'+variant,f=requireRoles(E,tall?[lower,upper]:['short'],'seagrass');
  composeShape(Three,E,p=>{if(tall){cross(p,f[lower],-.5);cross(p,f[upper],.5);}else cross(p,f.short,0);});
 }
 // Static kelp candidate: vanilla body A-D are byte-identical, as are top/top_bulb.
 // Keep independent paths for editing. Native animation arrays are not rewritten here.
 // Per-face orientation with edited textures still requires Bedrock visual review.
 function kelp(E) {
  const f=requireRoles(E,['body_a','body_b','body_c','body_d','head','head_bulb'],'kelp');
  composeShape(Three,E,p=>{
   cross(p,[f.body_a,f.body_c,f.body_b,f.body_d],-.5);
   cross(p,[f.head,f.head_bulb,f.head,f.head_bulb],.5);
  });
 }
 return [{id:'seagrass',scale:1.4,mode:'volume',build:seagrass},{id:'kelp',scale:1.4,mode:'volume',build:kelp}];
}
