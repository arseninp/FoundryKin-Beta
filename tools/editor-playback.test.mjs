import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../fk-core.js',import.meta.url),'utf8');
function section(start,end){
 const first=source.indexOf(start),last=source.indexOf(end,first+start.length);
 assert.notEqual(first,-1,'Missing core section: '+start);
 assert.ok(last>first,'Missing core boundary: '+end);
 return source.slice(first,last);
}
const playback=section('var frameTimer=',"var framePlay=");
const frames=section('function setFrame(',"$('#fPrev').onclick=");
const packing=section('function packCur(','function familyPaths(');

function fixture(){
 let serial=0;
 const timers=new Map(),updates=[],errors=[];
 function canvas(value=0){
  const output={width:16,height:16,value,draws:[]};
  output.getContext=()=>({drawImage(image,x,y){output.draws.push({value:image.value,x,y})}});
  output.toDataURL=()=>JSON.stringify({width:output.width,height:output.height,draws:output.draws});
  return output;
 }
 const images=[canvas(10),canvas(20),canvas(30)];
 const scope={
  API:{busy:false},S:{mode:'edit'},document:{hidden:false,createElement:()=>canvas()},
  choice:{},slot:'a',fr:{a:images},fi:{a:0},cv:{a:images[0]},hs:{a:[]},
  undoS:{a:[]},redoS:{a:[]},slots:[{id:'a'}],ph:{},dirty:{a:true},encoded:{},files:{},
  setTimeout(callback,delay){assert.equal(delay,1000);const id=++serial;timers.set(id,callback);return id},
  clearTimeout(id){timers.delete(id)},frameUi(){},
  refreshTex(){updates.push(scope.cv.a)},drawEd(){},showErr(code,detail){errors.push({code,detail})}
 };
 vm.createContext(scope);vm.runInContext(playback+frames+packing,scope);
 return {scope,timers,updates,errors,images,
  tick(){assert.equal(timers.size,1);const [id,callback]=timers.entries().next().value;timers.delete(id);callback()}
 };
}

test('playback waits one second, cycles physical frames and never duplicates its timer',()=>{
 const f=fixture(),s=f.scope,undo=s.undoS.a,redo=s.redoS.a;
 s.startPlayback();s.startPlayback();assert.equal(f.timers.size,1);assert.equal(f.updates.length,0);
 for(const expected of [1,2,0,1]){f.tick();assert.equal(s.fi.a,expected);assert.equal(s.cv.a,f.images[expected]);assert.equal(f.timers.size,1)}
 assert.equal(s.hs.a[0].u,undo);assert.equal(s.hs.a[0].r,redo);
 s.stopPlayback();assert.equal(f.timers.size,0);
});

test('callbacks from paused or replaced playback cannot change frames or schedule another timer',()=>{
 const f=fixture(),s=f.scope;
 s.startPlayback();const stale=[...f.timers.values()][0];s.stopPlayback();stale();
 assert.equal(s.fi.a,0);assert.equal(f.timers.size,0);
 s.startPlayback();stale();assert.equal(s.fi.a,0);assert.equal(f.timers.size,1);
 f.tick();assert.equal(s.fi.a,1);s.stopPlayback();
});

test('busy, hidden, search and held-pointer states block start and stop an active timer',()=>{
 const invalidations=[s=>{s.API.busy=true},s=>{s.document.hidden=true},s=>{s.S.mode='search'},s=>{s.framePointer=7},s=>{s.choice=null},s=>{s.fr.a=[s.fr.a[0]]}];
 for(const invalidate of invalidations){
  let f=fixture();invalidate(f.scope);f.scope.startPlayback();assert.equal(f.timers.size,0);
  f=fixture();f.scope.startPlayback();invalidate(f.scope);f.tick();assert.equal(f.timers.size,0);assert.equal(f.scope.fi.a,0);
 }
});

test('changing the selected resource or plan invalidates playback before its next frame',()=>{
 for(const invalidate of [s=>{s.slot='other'},s=>{s.choice={}}]){
  const f=fixture();f.scope.startPlayback();invalidate(f.scope);f.tick();
  assert.equal(f.timers.size,0);assert.equal(f.scope.fi.a,0);assert.equal(f.updates.length,0);
 }
});

test('an update failure stops playback and reports the existing render error',()=>{
 const f=fixture();f.scope.refreshTex=()=>{throw new Error('update failed')};
 f.scope.startPlayback();f.tick();assert.equal(f.timers.size,0);
 assert.deepEqual(f.errors,[{code:'render',detail:'update failed'}]);
});

test('setFrame preserves distinct undo and redo stacks for every physical frame',()=>{
 const {scope:s,images}=fixture(),firstUndo=s.undoS.a,firstRedo=s.redoS.a;
 firstUndo.push('first edit');firstRedo.push('first redo');s.setFrame(1);
 const secondUndo=s.undoS.a,secondRedo=s.redoS.a;
 assert.notEqual(firstUndo,secondUndo);assert.notEqual(firstRedo,secondRedo);
 secondUndo.push('second edit');secondRedo.push('second redo');s.setFrame(0);
 assert.equal(s.undoS.a,firstUndo);assert.equal(s.redoS.a,firstRedo);assert.equal(s.cv.a,images[0]);
 s.setFrame(1);assert.equal(s.undoS.a,secondUndo);assert.equal(s.redoS.a,secondRedo);
 assert.equal(firstUndo[0],'first edit');assert.equal(secondUndo[0],'second edit');
});

test('packing while playing composes all physical frames in vertical order, not only the active frame',()=>{
 const f=fixture(),s=f.scope;s.startPlayback();f.tick();assert.equal(s.fi.a,1);
 s.packCur(true);const encoded=JSON.parse(s.files.a.data);
 assert.equal(encoded.width,16);assert.equal(encoded.height,48);assert.equal(s.files.a.frames,3);
 assert.deepEqual(encoded.draws,[{value:10,x:0,y:0},{value:20,x:0,y:16},{value:30,x:0,y:32}]);
 assert.equal(s.cv.a,f.images[1]);assert.equal(s.dirty.a,true);assert.equal(f.timers.size,1);s.stopPlayback();
});
