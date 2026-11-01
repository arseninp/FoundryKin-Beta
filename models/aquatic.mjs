/* Full-UV aquatic plant previews. State, not the edited PNG, chooses native parts. */
import {composeShape,requireRoles} from './shapes.mjs';
export function createAquaticModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Aquatic models require Three');
 function cross(p,path,y) {
  for(const [angle,mirror] of [[0,false],[Math.PI,true],[Math.PI/2,false],[-Math.PI/2,true]])p.face(path,Math.SQRT2,1,0,y,0,0,angle,mirror?[16,0,0,16]:[0,0,16,16]);
 }
 function seagrass(E) {
  const state=E?.state??{},tall=state.tall===undefined?false:state.tall,variant=state.variant===undefined?'a':state.variant;
  if(typeof tall!=='boolean'||!['a','b'].includes(variant))throw new Error('Invalid seagrass preview state');
  const lower='lower_'+variant,upper='upper_'+variant,f=requireRoles(E,tall?[lower,upper]:['short'],'seagrass');
  composeShape(Three,E,p=>{if(tall){cross(p,f[lower],-.5);cross(p,f[upper],.5);}else cross(p,f.short,0);});
 }
 return [{id:'seagrass',scale:1.4,mode:'volume',build:seagrass}];
}
