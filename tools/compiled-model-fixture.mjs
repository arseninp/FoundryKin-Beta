/* Test-only fixture using the production compiler, library and resolver. */
import {fileURLToPath} from 'node:url';
import {readCandidate} from './model-coverage.mjs';
import {compileModelCatalog} from '../models/library.mjs';
import {createCatalogAccess} from '../catalog/access.mjs';
import {createPreviewResolver} from '../catalog/preview.mjs';
import {createPreviewControls} from '../preview-controls.mjs';
import {TEXT} from '../preview-config.mjs';
import {createThreeMock,meshesOf} from './three-mock.mjs';
export function createCompiledModelFixture(ids){
 const input=readCandidate(fileURLToPath(new URL('../data/catalog-candidate/',import.meta.url))),Three=createThreeMock();
 const blocks=ids?Object.fromEntries(ids.map(id=>{if(!Object.hasOwn(input.blocks,id))throw new Error('Missing fixture source: '+id);return [id,input.blocks[id]];})):input.blocks;
 const runtime=compileModelCatalog({...input,blocks},Three),{catalog,registry}=runtime,access=createCatalogAccess(catalog),resolve=createPreviewResolver(catalog,registry,Three),controls=createPreviewControls(TEXT);
 function render(request){const plan=resolve(request),group=new Three.Group(),mats=Object.fromEntries(plan.modelResourcePaths.map(path=>[path,{path}]));plan.build({group,mats});return {plan,group,meshes:meshesOf(group)};}
 return {...runtime,input,Three,access,resolve,controls,render};
}
export function modelSnapshot(node){return {position:[node.position.x,node.position.y,node.position.z],rotation:[node.rotation.x,node.rotation.y,node.rotation.z],...(node.geometry?{size:node.geometry.size,uv:node.geometry.rows,material:Array.isArray(node.material)?node.material.map(m=>m?.path):node.material?.path}:{}),children:(node.children??[]).map(modelSnapshot)};}
