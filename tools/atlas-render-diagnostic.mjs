/* Read-only Chromium/WebGL diagnostic. No pack storage or production renderer changes. */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const temporary=process.env.RUNNER_TEMP;
if(!temporary)throw new Error('Run this diagnostic in its dedicated GitHub Actions job');
const root=resolve('.'),out=join(temporary,'fk-atlas-render');
await mkdir(out,{recursive:true});
const require=createRequire(join(temporary,'fk-atlas-browser','package.json'));
const {chromium}=require('playwright');
const threeFile=join(temporary,'fk-atlas-browser','node_modules','three','build','three.min.js');
const pin='46ba6ea985fb5a92d79a9419198f10dda14c199d';
const cases=[
 {id:'black_bed',path:'textures/entity/bed/black'},
 {id:'piglin_head',path:'textures/entity/piglin/piglin'},
 {id:'dragon_head',path:'textures/entity/dragon/dragon'}
];
const report={commit:process.env.GITHUB_SHA??null,pin,limits:'Diagnostic screenshots only, not Android acceptance or proof of a fix; opaque UV control is synthetic and never saved to packs.',references:[],runs:[],errors:[]};
const references=new Map();
try{
for(const item of cases){
 let bytes,lastError;
 for(const base of ['https://raw.githubusercontent.com/Mojang/bedrock-samples/'+pin+'/resource_pack/','https://cdn.jsdelivr.net/gh/Mojang/bedrock-samples@'+pin+'/resource_pack/']){
  try{
   const response=await fetch(base+item.path+'.png',{signal:AbortSignal.timeout(30000)});
   if(!response.ok)throw new Error('Reference HTTP '+response.status);
   const candidate=Buffer.from(await response.arrayBuffer());
   assert.ok(candidate.length>24&&candidate.length<=16777216,'Invalid reference byte size');
   assert.equal(candidate.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Expected reference PNG');
   bytes=candidate;break;
  }catch(error){lastError=error;}
 }
 if(!bytes)throw lastError;
 references.set('/__reference/'+item.path+'.png',bytes);
 report.references.push({id:item.id,path:item.path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
}catch(error){
 report.status='reference download failed';report.errors.push({kind:'reference',message:String(error).slice(0,2000)});
 await writeFile(join(out,'report.json'),JSON.stringify(report,null,2));throw error;
}
const html=`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#d5d0ca}#stage{width:512px;height:512px}canvas{display:block;width:512px;height:512px}</style><div id="stage"></div>
<script src="/__three.js"></script>
<script>const NativeRenderer=THREE.WebGLRenderer;THREE.WebGLRenderer=function(options){return new NativeRenderer({...options,antialias:window.__mode!=='no-aa'})};</script>
<script src="/fk-catalog-data.js"></script><script src="/fk-view.js"></script>`;
const types={'.js':'application/javascript','.mjs':'application/javascript','.json':'application/json','.css':'text/css','.html':'text/html'};
const server=createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(path==='/__diagnostic'){res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});res.end(html);return;}
  if(path==='/__three.js'){res.writeHead(200,{'Content-Type':'application/javascript','Cache-Control':'no-store'});res.end(await readFile(threeFile));return;}
  if(references.has(path)){res.writeHead(200,{'Content-Type':'image/png','Cache-Control':'no-store'});res.end(references.get(path));return;}
  const file=resolve(root,'.'+path),type=types[extname(file)];
  if(!file.startsWith(root+sep)||!type){res.writeHead(403);res.end();return;}
  res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(await readFile(file));
 }catch(error){if(!res.headersSent)res.writeHead(404);res.end();}
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const origin='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const mode of ['default-aa','no-aa','centroid-aa']){
  const context=await browser.newContext({viewport:{width:512,height:512},deviceScaleFactor:1});
  const page=await context.newPage();
  page.on('pageerror',error=>report.errors.push({mode,kind:'page',message:error.message.slice(0,1000)}));
  page.on('console',message=>{if(message.type()==='error')report.errors.push({mode,kind:'console',message:message.text().slice(0,1000)});});
  await page.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
  await page.addInitScript(value=>{window.__mode=value;},mode);
  await page.goto(origin+'/__diagnostic',{waitUntil:'load'});
  const setup=await page.evaluate(async()=>{
   if(THREE.REVISION!=='128')throw new Error('Expected Three.js r128');
   const runtime=await FKCatalogData.loadCompiled(THREE),view=FKView.createStage();
   FKView.mount(document.getElementById('stage'));
   window.__runtime=runtime;window.__view=view;window.__catalogBefore=JSON.stringify(runtime.catalog);
   const gl=document.querySelector('canvas').getContext('webgl2')||document.querySelector('canvas').getContext('webgl');
   if(!gl)throw new Error('No real WebGL context');
   window.__gl=gl;
   const result={webgl2:typeof WebGL2RenderingContext!=='undefined'&&gl instanceof WebGL2RenderingContext,version:gl.getParameter(gl.VERSION),samples:gl.getParameter(gl.SAMPLES),antialias:gl.getContextAttributes().antialias,renderer:gl.getParameter(gl.RENDERER),cards:runtime.catalog.cards.length};
   if(window.__mode!=='no-aa'&&!result.antialias)throw new Error('Requested antialiasing was unavailable');
   if(window.__mode==='centroid-aa'&&!result.webgl2)throw new Error('Centroid comparison requires WebGL2');
   return result;
  });
  report.runs.push({mode,context:setup,images:[]});
  const run=report.runs[report.runs.length-1];
  for(const item of cases)for(const textureMode of ['original','uv-grid-alpha','uv-grid-opaque'])for(const yawOffset of [0,.55,-.55]){
   const details=await page.evaluate(async({item,textureMode,yawOffset})=>{
    const runtime=window.__runtime,view=window.__view,gl=window.__gl;
    const image=new Image();image.src='/__reference/'+item.path+'.png';await image.decode();
    const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
    const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(image,0,0);
    const data=ctx.getImageData(0,0,canvas.width,canvas.height),histogram=Array(256).fill(0);
    for(let i=0;i<data.data.length;i+=4){
     const alpha=data.data[i+3];histogram[alpha]++;
     if(textureMode!=='original'){
      const pixel=i/4,x=pixel%canvas.width,y=Math.floor(pixel/canvas.width);
      data.data[i]=(x%16)*17;data.data[i+1]=(y%16)*17;data.data[i+2]=((Math.floor(x/8)+Math.floor(y/8))%2)*255;
      if(textureMode==='uv-grid-opaque')data.data[i+3]=255;
     }
    }
    if(textureMode!=='original')ctx.putImageData(data,0,0);
    const plan=runtime.resolve({id:item.id,slot:item.path});
    if(plan.mode!=='volume')throw new Error('Expected volume preview');
    if(plan.modelResourcePaths.length!==1||plan.modelResourcePaths[0]!==item.path)throw new Error('Unexpected diagnostic model resources');
    FKView.build(view,{plan,canvases:{[item.path]:canvas}},true);
    const materials=new Set();view.instance.group.traverse(node=>{if(node.isMesh)for(const mat of Array.isArray(node.material)?node.material:[node.material])materials.add(mat);});
    if(window.__mode==='centroid-aa')for(const mat of materials){
     mat.onBeforeCompile=shader=>{
      for(const [field,chunk] of [['vertexShader','uv_pars_vertex'],['fragmentShader','uv_pars_fragment']]){
       if(!shader[field].includes('#include <'+chunk+'>'))throw new Error('Missing expected UV shader include');
       const replacement=THREE.ShaderChunk[chunk].replace('varying vec2 vUv;','centroid varying vec2 vUv;');
       if(!replacement.includes('centroid varying'))throw new Error('Missing expected UV varying');
       shader[field]=shader[field].replace('#include <'+chunk+'>',replacement);
      }
     };
     mat.customProgramCacheKey=()=> 'fk-diagnostic-centroid-v1';mat.needsUpdate=true;
    }
    view.group.rotation.y+=yawOffset;FKView.render(view,512,1);gl.finish();
    const pixels=new Uint8Array(512*512*4);gl.readPixels(0,0,512,512,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
    if(gl.getError()!==gl.NO_ERROR)throw new Error('WebGL readback failed');
    let visible=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i])visible++;
    if(!visible)throw new Error('Empty rendered image');
    return {id:item.id,textureMode,yawOffset,width:canvas.width,height:canvas.height,sourceTransparent:histogram[0],sourceOpaque:histogram[255],sourceSemi:histogram.slice(1,255).reduce((a,b)=>a+b,0),visiblePixels:visible,materials:[...materials].map(m=>({transparent:m.transparent,alphaTest:m.alphaTest,depthWrite:m.depthWrite,side:m.side}))};
   },{item,textureMode,yawOffset});
   const name=[mode,item.id,textureMode,yawOffset===0?'front':yawOffset>0?'right':'left'].join('--')+'.png';
   await page.locator('#stage').screenshot({path:join(out,name)});
   run.images.push({...details,file:name});
  }
  await page.evaluate(()=>{
   FKView.clear(window.__view);
   if(JSON.stringify(window.__runtime.catalog)!==window.__catalogBefore)throw new Error('Catalog mutated by diagnostic');
  });
  await context.close();
 }
 assert.equal(report.errors.length,0,'Browser or shader errors; inspect report artifact');
 report.status='rendered; visual comparison required, no fix claimed';
}catch(error){report.status='failed';report.errors.push({kind:'runner',message:String(error.stack??error).slice(0,4000)});process.exitCode=1;}
finally{
 if(browser)await browser.close();
 await new Promise(ok=>server.close(ok));
 await writeFile(join(out,'report.json'),JSON.stringify(report,null,2));
}
