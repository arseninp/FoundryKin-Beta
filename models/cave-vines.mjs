/* Cave vine columns retain the legacy body-above-head composition; native parts remain one block. */
import {composeShape,requireRoles} from './shapes.mjs';
export function createCaveVineModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Cave vine models require Three');
 function build(E) {
  const whole=E?.cur==='cave_vines',body=E?.cur==='cave_vines_body_with_berries',head=E?.cur==='cave_vines_head_with_berries';
  if(!whole&&!body&&!head)throw new Error('Unknown cave vine object');
  const berries=E.state?.berries===undefined?!whole:E.state.berries;
  if(typeof berries!=='boolean')throw new Error('Invalid cave vine berries state');
  const parts=whole?[['body',.5],['head',-.5]]:[[body?'body':'head',0]],suffix=berries?'_berries':'_plain';
  const roles=parts.map(([part])=>part+suffix),f=requireRoles(E,roles,'cave vine');
  composeShape(Three,E,p=>{
   for(const [part,y] of parts) {
    const path=f[part+suffix];
    p.face(path,Math.SQRT2,1,0,y,0,0,0,null,true);p.face(path,Math.SQRT2,1,0,y,0,0,Math.PI/2,null,true);
   }
  });
 }
 return [{id:'cave_vines',scale:1.4,mode:'volume',build},{id:'cave_vines_part',scale:1,mode:'volume',build}];
}
