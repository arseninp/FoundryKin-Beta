/* fk-gridload.js v0.8.19: loads fk-grid.js and patches the card preview renderer in memory */
(function(){
var P=[
["new T.PerspectiveCamera(35,1,.1,50)","new T.OrthographicCamera(-.95,.95,.95,-.95,.1,50)"],
["new T.Group();g.rotation.set(.45,-.7,0)","new T.Group();g.rotation.set(.6155,-.7854,0)"],
["g.add(plane(st,1,0,Math.PI/4));g.add(plane(st,1,0,-Math.PI/4));","g.add(plane(st,1,0,0));g.add(plane(st,1,0,Math.PI/2));"],
["new T.PlaneGeometry(Math.SQRT2,h)","new T.PlaneGeometry(1,h)"],
["try{o.r.render(o.sc,o.cam);url=o.cv.toDataURL('image/png')}","try{g.updateMatrixWorld(true);var bb=new T.Box3().setFromObject(g),ce=bb.getCenter(new T.Vector3()),kk=Math.min(1,1.78/Math.max(bb.max.x-bb.min.x,bb.max.y-bb.min.y,.001));g.scale.setScalar(kk);g.position.set(-ce.x*kk,-ce.y*kk,0);o.r.render(o.sc,o.cam);url=o.cv.toDataURL('image/png')}"],
["while(g.children.length)g.remove(g.children[0]);","g.scale.setScalar(1);g.position.set(0,0,0);while(g.children.length)g.remove(g.children[0]);"]
];
var code=null,miss=[];
try{
var x=new XMLHttpRequest();
x.open("GET","fk-grid.js?v=0.8.17",false);
x.send(null);
if(!(x.status===200||(x.status===0&&x.responseText)))throw new Error("HTTP "+x.status);
code=x.responseText;
P.forEach(function(p){
if(code.indexOf(p[0])<0){miss.push(p[0].slice(0,40));return}
code=code.split(p[0]).join(p[1]);
});
window.FKGRID_PATCH={n:P.length,missed:miss};
}catch(e){
code=null;
window.FKGRID_PATCH={error:String((e&&e.message)||e)};
}
if(code!==null)(0,eval)(code);
else document.write('<script src="fk-grid.js?v=0.8.17"><\/script>');
})();
