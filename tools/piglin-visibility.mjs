/* Piglin-only visibility controls. No editor state, pack storage or production changes. */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir,appendFile} from 'node:fs/promises';
import {resolve,join,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const temp=process.env.RUNNER_TEMP;
if(!temp)throw new Error('Run in the dedicated diagnostic Actions job');
const root=resolve('.'),out=join(temp,'fk-piglin-visibility');await mkdir(out,{recursive:true});
const require=createRequire(join(temp,'fk-piglin-browser','package.json'));
const {chromium}=require('playwright');
const pin='46ba6ea985fb5a92d79a9419198f10dda14c199d',path='textures/entity/piglin/piglin';
const urls=['https://raw.githubusercontent.com/Mojang/bedrock-samples/'+pin+'/resource_pack/'+path+'.png','https://cdn.jsdelivr.net/gh/Mojang/bedrock-samples@'+pin+'/resource_pack/'+path+'.png'];
const controls=['original','solid-front','solid-double','original-double','original-cutout'];
const report={commit:process.env.GITHUB_SHA??null,pin,limits:'Static reference piglin only, software Chromium/WebGL, not Android acceptance or proof of a fix. Cutout is a diagnostic override, not an application change.',runs:[],errors:[]};
function compare(a,b){
 assert.equal(a?.frames.length,48);assert.equal(b?.frames.length,48);
 return {framesCompared:48,differentRGBAFrames:a.frames.filter((f,i)=>{assert.equal(f.pitch,b.frames[i].pitch);assert.equal(f.yaw,b.frames[i].yaw);return f.rgbaSha256!==b.frames[i].rgbaSha256;}).length,differentCoverageFrames:a.frames.filter((f,i)=>f.visiblePixels!==b.frames[i].visiblePixels).length};
}
let server,browser;
try{
 let png,lastError;
 for(const url of urls)try{
  const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error('Reference HTTP '+response.status+': '+url);
  const bytes=Buffer.from(await response.arrayBuffer());
  assert.ok(bytes.length>24&&bytes.length<=16777216);assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(bytes.readUInt32BE(16),64);assert.equal(bytes.readUInt32BE(20),64);png=bytes;break;
 }catch(error){lastError=error;}
 if(!png)throw lastError;
 report.reference={path,bytes:png.length,sha256:createHash('sha256').update(png).digest('hex')};
 const html='<!doctype html><meta charset="utf-8"><link rel="icon" href="data:,"><div id="stage"></div><script src="/__three.js"></script><script src="/fk-catalog-data.js"></script><script src="/fk-catalog.js"></script><script src="/fk-view.js"></script>';
 server=createServer(async(req,res)=>{
  try{
   const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   if(name==='/__diagnostic'){res.writeHead(200,{'Content-Type':'text/html'});res.end(html);return;}
   if(name==='/__three.js'){res.writeHead(200,{'Content-Type':'application/javascript'});res.end(await readFile(join(temp,'fk-piglin-browser','node_modules','three','build','three.min.js')));return;}
   const file=resolve(root,'.'+name),type={'.js':'application/javascript','.mjs':'application/javascript','.json':'application/json'}[extname(file)];
   if(!file.startsWith(root+sep)||!type){res.writeHead(403);res.end();return;}
   const bytes=await readFile(file);res.writeHead(200,{'Content-Type':type});res.end(bytes);
  }catch(error){if(!res.headersSent)res.writeHead(404);res.end();}
 });
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:512,height:512},deviceScaleFactor:1});
 page.on('pageerror',error=>report.errors.push({kind:'page',message:error.message.slice(0,2000)}));
 page.on('console',message=>{if(message.type()==='error')report.errors.push({kind:'console',message:message.text().slice(0,2000)});});
 await page.route('**/*',route=>{
  const url=route.request().url();if(new URL(url).origin===origin)return route.continue();
  if(urls.includes(url))return route.fulfill({status:200,headers:{'access-control-allow-origin':'*'},contentType:'image/png',body:png});
  return route.abort();
 });
 await page.goto(origin+'/__diagnostic',{waitUntil:'load'});
 report.context=await page.evaluate(async path=>{
  if(THREE.REVISION!=='128')throw new Error('Expected Three r128');
  const runtime=await FKCatalogData.loadCompiled(THREE),view=FKView.createStage();FKView.mount(document.getElementById('stage'));
  const image=await FKCatalog.loadAny(path);if(!image)throw new Error('Piglin image decode failed');
  const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
  const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(image,0,0);
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let zero=0,opaque=0,semi=0;
  for(let i=3;i<pixels.length;i+=4){if(pixels[i]===0)zero++;else if(pixels[i]===255)opaque++;else semi++;}
  const node=document.querySelector('#stage canvas'),gl=node.getContext('webgl2')||node.getContext('webgl');if(!gl)throw new Error('No WebGL context');
  window.__probe={runtime,view,canvas,gl,node,before:JSON.stringify(runtime.catalog)};
  return {version:gl.getParameter(gl.VERSION),renderer:gl.getParameter(gl.RENDERER),antialias:gl.getContextAttributes().antialias,alpha:{zero,opaque,semi},width:canvas.width,height:canvas.height};
 },path);
 for(const control of controls){
  const result=await page.evaluate(async({control,path})=>{
   const {runtime,view,canvas,gl,node,before}=window.__probe;
   const plan=runtime.resolve({id:'piglin_head',slot:path});
   if(plan.mode!=='volume'||plan.modelResourcePaths.length!==1||plan.modelResourcePaths[0]!==path)throw new Error('Unexpected piglin plan');
   let diagnosticMaterial;
   try{
    FKView.build(view,{plan,canvases:{[path]:canvas}},true);view.scene.updateMatrixWorld(true);
    const meshes=[],materials=new Set();view.instance.group.traverse(n=>{if(n.isMesh){meshes.push(n);for(const m of Array.isArray(n.material)?n.material:[n.material])materials.add(m);}});
    if(meshes.length!==6)throw new Error('Expected six detached piglin head boxes');
    const snapshot=meshes.map(n=>({position:Array.from(n.geometry.attributes.position.array),normal:Array.from(n.geometry.attributes.normal.array),uv:Array.from(n.geometry.attributes.uv.array),index:Array.from(n.geometry.index.array),matrix:Array.from(n.matrixWorld.elements)}));
    async function hash(bytes){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(n=>n.toString(16).padStart(2,'0')).join('');}
    const geometrySha256=await hash(new TextEncoder().encode(JSON.stringify(snapshot)));
    const materialBefore=[...materials].map(m=>({transparent:m.transparent,alphaTest:m.alphaTest,depthWrite:m.depthWrite,side:m.side}));
    if(control.startsWith('solid-')){
     diagnosticMaterial=new THREE.MeshBasicMaterial({color:0xb8b8b8,side:control==='solid-double'?THREE.DoubleSide:THREE.FrontSide,transparent:false,alphaTest:0,depthWrite:true,depthTest:true});
     for(const mesh of meshes)mesh.material=diagnosticMaterial;
    }else if(control!=='original')for(const m of materials){
     if(control==='original-double')m.side=THREE.DoubleSide;
     if(control==='original-cutout'){m.transparent=false;m.alphaTest=.05;m.depthWrite=true;}
     m.needsUpdate=true;
    }
    const sheet=document.createElement('canvas'),tile=512,label=24,header=32;sheet.width=8*tile;sheet.height=header+6*(tile+label);
    const ctx=sheet.getContext('2d');ctx.fillStyle='#d5d0ca';ctx.fillRect(0,0,sheet.width,sheet.height);ctx.fillStyle='#111';ctx.font='16px sans-serif';ctx.fillText(control+' | piglin | original geometry and camera scale | full 512px frames',8,22);
    const frames=[],yawBase=view.group.rotation.y;
    for(const [row,pitch] of [-.7,0,.7].entries())for(let index=0;index<16;index++){
     const yaw=index*Math.PI/8;view.group.rotation.set(pitch,yawBase+yaw,0);FKView.render(view,512,1);gl.finish();
     const pixels=new Uint8Array(512*512*4);gl.readPixels(0,0,512,512,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
     if(gl.getError()!==gl.NO_ERROR)throw new Error('WebGL readback failed');
     let visiblePixels=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i])visiblePixels++;
     if(!visiblePixels)throw new Error('Empty frame: '+control);
     const x=(index%8)*tile,y=header+(row*2+Math.floor(index/8))*(tile+label);
     ctx.fillStyle='#111';ctx.fillText('pitch '+pitch+' | yaw '+(index*22.5)+' deg',x+8,y+18);ctx.drawImage(node,x,y+label,tile,tile);
     frames.push({pitch,yaw,visiblePixels,rgbaSha256:await hash(pixels)});
    }
    if(JSON.stringify(runtime.catalog)!==before)throw new Error('Catalog mutated');
    return {control,geometrySha256,materialBefore,frames,png:sheet.toDataURL('image/png').split(',')[1]};
   }finally{FKView.clear(view);diagnosticMaterial?.dispose();}
  },{control,path});
  const file=control+'.png';await writeFile(join(out,file),Buffer.from(result.png,'base64'));delete result.png;report.runs.push({...result,file});
 }
 assert.equal(report.runs.length,5);assert.equal(new Set(report.runs.map(r=>r.geometrySha256)).size,1,'Geometry changed between controls');
 const run=name=>report.runs.find(r=>r.control===name);
 report.comparisons={solidFrontVsDouble:compare(run('solid-front'),run('solid-double')),originalVsDouble:compare(run('original'),run('original-double')),originalVsCutout:compare(run('original'),run('original-cutout'))};
 assert.equal(report.errors.length,0,'Browser errors; inspect report');report.status='rendered; comparisons are diagnostic, not a fix';
}catch(error){report.status='failed';report.errors.push({kind:'runner',message:String(error.stack??error).slice(0,4000)});process.exitCode=1;}
finally{
 try{if(browser)await browser.close();}catch(error){report.errors.push({kind:'cleanup',message:String(error)});report.status='failed';process.exitCode=1;}
 if(server)await new Promise(ok=>server.close(ok));
 await writeFile(join(out,'report.json'),JSON.stringify(report,null,2));
 const summary={status:report.status,commit:report.commit,limits:report.limits,context:report.context,comparisons:report.comparisons,sheets:report.runs.map(r=>({control:r.control,frames:r.frames.length,file:r.file})),errors:report.errors};
 const text=JSON.stringify(summary,null,2);console.log(text);
 if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,'# Piglin visibility controls\n\n'+text.split('\n').map(line=>'    '+line).join('\n')+'\n');
}
