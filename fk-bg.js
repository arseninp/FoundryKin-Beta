/* fk-bg.js v0.8.22: solid background for 3D model stage and cards, sticky search field, removal of the editor 2D view toggle (drawing canvas #ed is untouched) */
(function(){
var LIGHT='#d9d4cd',DARK='#3a3935';
var A='min-height:18px}\n</style>\n</head>';
var B='min-height:18px}\n'
+':root{--stage:'+LIGHT+';--fkbg:'+LIGHT+'}\n'
+':root[data-theme=dark]{--stage:'+DARK+';--fkbg:'+DARK+'}\n'
+'.fkp{background:var(--fkbg)!important}\n'
+'#q{position:sticky;top:8px;z-index:30;box-shadow:0 2px 10px rgba(0,0,0,.28)}\n'
+'</style>\n'
+'<script>try{var P=parent.document.documentElement,H=document.documentElement;function S(){H.setAttribute("data-theme",P.getAttribute("data-theme")||"light")}S();new MutationObserver(S).observe(P,{attributes:true,attributeFilter:["data-theme"]})}catch(e){}<\/script>\n'
+'</head>';
if(typeof PATCHES!=='undefined'){
PATCHES.push([A,B]);
PATCHES.push(['<div class="row"><button class="ghost" id="fbBtn">\u041f\u0435\u0440\u0435\u043a\u043b\u044e\u0447\u0438\u0442\u044c 2D / 3D</button></div>\n','']);
PATCHES.push(['<canvas id="fb" width="300" height="300" style="display:none"></canvas><span class="hint" id="hint">\u0442\u044f\u043d\u0438, \u0447\u0442\u043e\u0431\u044b \u043f\u043e\u043a\u0440\u0443\u0442\u0438\u0442\u044c</span>','']);
PATCHES.push(["showErr('\u0440\u0435\u043d\u0434\u0435\u0440: '+err.message);setFb(true)}","showErr('\u0440\u0435\u043d\u0434\u0435\u0440: '+err.message)}"]);
PATCHES.push(["setTimeout(function(){if(gl&&!fbOn&&frames<2){showErr('3D \u043d\u0435 \u043e\u0442\u0440\u0438\u0441\u043e\u0432\u0430\u043b\u0441\u044f, \u0432\u043a\u043b\u044e\u0447\u0451\u043d \u0437\u0430\u043f\u0430\u0441\u043d\u043e\u0439 2D-\u0432\u0438\u0434');setFb(true)}},2500);\nif(!gl)setFb(true);\n","setTimeout(function(){if(gl&&frames<2)showErr('3D \u043d\u0435 \u043e\u0442\u0440\u0438\u0441\u043e\u0432\u0430\u043b\u0441\u044f')},2500);\nif(!gl)showErr('3D \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e \u043d\u0430 \u044d\u0442\u043e\u043c \u0443\u0441\u0442\u0440\u043e\u0439\u0441\u0442\u0432\u0435');\n"]);
PATCHES.push(["$('#fbBtn').onclick=function(){if(!gl){say('3D \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e \u043d\u0430 \u044d\u0442\u043e\u043c \u0443\u0441\u0442\u0440\u043e\u0439\u0441\u0442\u0432\u0435.');return}setFb(!fbOn)};\n",'']);
}
})();
