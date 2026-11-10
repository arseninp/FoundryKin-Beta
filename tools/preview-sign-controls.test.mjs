import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewControls} from '../preview-controls.mjs';
const c=createPreviewControls({en:{texture:'Texture'},ru:{texture:'Текстура'}});
const plan=(id='acacia_hanging_sign',state={},model='sign')=>({model,object:{id,card:id,form:'native'},state});
test('hanging signs expose the existing mountings with EN/RU and a ceiling default',()=>{
 for(const id of ['oak_hanging_sign','acacia_hanging_sign','dark_oak_hanging_sign']){
  const p=plan(id),spec=c.previewControlSpec({},p);assert.deepEqual(spec.state,{mounting:'ceiling'});
  assert.deepEqual(spec.schema,[{key:'mounting',label:['Mounting','Крепление'],values:[{value:'ceiling',label:['Ceiling','Потолочное']},{value:'attached',label:['Attached','Закреплённое']},{value:'wall',label:['Wall bracket','Настенный кронштейн']}]}]);
 }
});
test('mounting and PNG selection remain independent without losing other placement state',()=>{
 for(const mounting of ['ceiling','attached','wall'])for(const texture of ['sheet.png','icon.png']){
  const p=plan('acacia_hanging_sign',{mounting:'ceiling',rotation:3,facing:'north'}),before=JSON.stringify(p);
  assert.deepEqual(c.previewControlSelection(p,{mounting,texture}),{form:undefined,slot:texture,state:{mounting,rotation:3,facing:'north'}});assert.equal(JSON.stringify(p),before);
 }
 for(const mounting of [null,true,0,'standing',[],{}])assert.throws(()=>c.previewControlSelection(plan(),{mounting}),/Invalid hanging sign control: mounting/);
});
test('ordinary sign families and icon views do not receive duplicate mounting controls',()=>{
 const p={...plan('acacia_standing_sign'),forms:{native:'acacia_standing_sign',wall:'acacia_wall_sign'}};
 assert.deepEqual(c.previewControlSpec({},p).schema.map(field=>field.key),['form']);
 for(const p of [plan('acacia_wall_sign'),plan('acacia_hanging_sign',{},'sprite'),plan('stone',{},'cube')])assert.equal(c.previewControlSpec({},p).schema,null);
});
