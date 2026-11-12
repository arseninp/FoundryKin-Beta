/* Static statue poses from Mojang/bedrock-samples@46ba6ea985fb5a92d79a9419198f10dda14c199d:
   resource_pack/models/entity/copper_golem{,_sitting,_running,_star}.geo.json.
   Cube data is [origin,size,uv,outer-to-inner pivot/rotation chain].
   Cubes use their declared sizes without shrink adjustments.
   No mob animation, held items, flower layer or entity behaviour is included. */
import {composeShape,requireRoles} from './shapes.mjs';
const ID=/^(?:waxed_)?(?:(?:exposed|weathered|oxidized)_)?copper_golem_statue$/;
const FACING=Object.freeze({north:0,east:-Math.PI/2,south:Math.PI,west:Math.PI/2});
const POSES=Object.freeze({
 standing:[
  [[-4,5,-3],[8,6,6],[0,15]],
  [[-4,11,-5],[8,5,10],[0,0]],
  [[-1,10,-6],[2,3,2],[56,0]],
  [[-1,16,-1],[2,4,2],[37,8]],
  [[-2,20,-2],[4,4,4],[37,0]],
  [[-7,2,-2],[3,10,4],[36,16]],
  [[4,2,-2],[3,10,4],[50,16]],
  [[-3.9,0,-1.99],[4,5,4],[0,27]],
  [[-0.1,0,-2],[4,5,4],[16,27]]
 ],
 sitting:[
  [[-3,6,-2.2],[6,1,6],[3,19]],
  [[-4,0,-1.2],[8,6,6],[0,15]],
  [[-4,1,-4.2],[8,6,3],[3,18],[[[0,4,-2],[0,0,-180]]]],
  [[-1,12,-1.175],[2,4,2],[37,8]],
  [[-2,16,-2.175],[4,4,4],[37,0]],
  [[-4,7,-5.2],[8,5,10],[0,0]],
  [[-1,6,-6.2],[2,3,2],[56,0]],
  [[-7.075,-0.516,-1.3518],[3,10,4],[36,16],[[[-4,8.6,0.525],[25,0,0]],[[-4,8.51073,0.6448],[-60,0,0]]]],
  [[4.075,-0.35426,-1.35548],[3,10,4],[50,16],[[[4,8.6,0.625],[25,0,0]],[[4,8.60145,0.54417],[-60,0,0]]]],
  [[-4.05,-1.975,-1],[4,5,4],[0,27],[[[-2.05,4,-1],[-90,0,0]]]],
  [[0.05,-1.975,-1],[4,5,4],[16,27],[[[2.05,4,-1],[-90,0,0]]]]
 ],
 running:[
  [[-4,4.8,-3],[8,6,6],[0,15],[[[0,4.8,0.5],[6.92217,4.59656,-3.86389]]]],
  [[-4.3,10.6,-7],[8,5,10],[0,0]],
  [[-1.3,9.6,-8],[2,3,2],[56,0]],
  [[-1.3,15.6,-3],[2,4,2],[37,8]],
  [[-2.3,19.6,-4],[4,4,4],[37,0]],
  [[-7.4,2,-3],[3,10,4],[36,16],[[[-4.4,11,-1],[57.5,0,0]]]],
  [[3.6,2,-2],[3,10,4],[50,16],[[[3.6,11,0],[-50,0,0]]]],
  [[-3.9,0,-1.99],[4,5,4],[0,27],[[[-2,5,-0.9],[-50,0,0]]]],
  [[-0.1,0,-2],[4,5,4],[16,27],[[[2,5,0],[45,0,0]]]]
 ],
 star:[
  [[-4,5,-3],[8,6,6],[0,15]],
  [[-4,11,-5],[8,5,10],[0,0]],
  [[-1,10,-6],[2,3,2],[56,0]],
  [[-1,16,-1],[2,4,2],[37,8]],
  [[-2,20,-2],[4,4,4],[37,0]],
  [[-4.5,5,-2],[3,10,4],[36,16],[[[-3,10,0],[0,0,110]]]],
  [[1.5,5,-2],[3,10,4],[50,16],[[[3,10,0],[0,0,-110]]]],
  [[-4.65,0.5,-1.99],[4,5,4],[0,27],[[[-2.65,3,0.01],[0,0,15]]]],
  [[0.65,0.5,-2],[4,5,4],[16,27],[[[2.65,3,0],[0,0,-15]]]]
 ]
});
export function createCopperGolemStatueModels(Three) {
 if(!Three||typeof Three.Mesh!=='function'||typeof Three.PlaneGeometry!=='function'||typeof Three.BoxGeometry!=='function'||Three.DoubleSide===undefined)throw new Error('Copper golem statue models require Three');
 function build(E) {
  if(typeof E?.cur!=='string'||!ID.test(E.cur))throw new Error('Unknown copper golem statue object');
  const state=E.state??{};
  if(!state||typeof state!=='object'||Array.isArray(state))throw new Error('Invalid statue state');
  const pose=state.pose??'standing',facing=state.facing??'north';
  if(typeof pose!=='string'||!Object.hasOwn(POSES,pose))throw new Error('Invalid statue pose');
  if(typeof facing!=='string'||!Object.hasOwn(FACING,facing))throw new Error('Invalid statue facing');
  if(typeof Three.Group!=='function'||!E.group||typeof E.group.add!=='function')throw new Error('Missing statue environment');
  const sheet=requireRoles(E,['sheet'],'copper golem statue').sheet,root=new Three.Group();
  root.position.y=-.5;root.rotation.y=FACING[facing];
  try {
   for(const [origin,size,uv,chain=[]] of POSES[pose]) {
    let target=root,pivot=[0,0,0];
    for(const [next,rotation] of chain) {
     const group=new Three.Group();
     group.position.set((next[0]-pivot[0])/16,(next[1]-pivot[1])/16,(next[2]-pivot[2])/16);
     group.rotation.set(-rotation[0]*Math.PI/180,rotation[1]*Math.PI/180,-rotation[2]*Math.PI/180,'ZYX');
     target.add(group);target=group;pivot=next;
    }
    const [w,h,d]=size,[u,v]=uv;
    const rects={east:[u+2*d+w,v+d,u+d+w,v+d+h],west:[u+d,v+d,u,v+d+h],north:[u+d+w,v+d,u+d,v+d+h],south:[u+2*d+2*w,v+d,u+2*d+w,v+d+h],up:[u+d,v+d,u+d+w,v],down:[u+d+w,v,u+d+2*w,v+d]};
    composeShape(Three,{...E,group:target},p=>p.prism(w/16,h/16,d/16,(origin[0]+w/2-pivot[0])/16,(origin[1]+h/2-pivot[1])/16,(origin[2]+d/2-pivot[2])/16,sheet,rects,64));
   }
   E.group.add(root);
  }catch(error) {
   const errors=[error],geometries=new Set();
   try{if(root.parent)root.parent.remove(root);}catch(cleanup){errors.push(cleanup);}
   function visit(node){if(node.geometry)geometries.add(node.geometry);for(const child of node.children??[])visit(child);}
   try{visit(root);}catch(cleanup){errors.push(cleanup);}
   for(const geometry of geometries)try{if(typeof geometry.dispose==='function')geometry.dispose();}catch(cleanup){errors.push(cleanup);}
   if(errors.length>1)throw new AggregateError(errors,'Statue build and cleanup failed');
   throw error;
  }
 }
 return [{id:'copper_golem_statue',scale:1.4,mode:'volume',build}];
}
