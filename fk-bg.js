/* fk-bg.js v0.8.18: solid background for 3D model stage and cards (drawing canvas #ed is untouched) */
(function(){
var LIGHT='#d9d4cd',DARK='#3a3935';
var A='min-height:18px}\n</style>\n</head>';
var B='min-height:18px}\n'
+':root{--stage:'+LIGHT+';--fkbg:'+LIGHT+'}\n'
+':root[data-theme=dark]{--stage:'+DARK+';--fkbg:'+DARK+'}\n'
+'.fkp{background:var(--fkbg)!important}\n'
+'</style>\n'
+'<script>try{var P=parent.document.documentElement,H=document.documentElement;function S(){H.setAttribute("data-theme",P.getAttribute("data-theme")||"light")}S();new MutationObserver(S).observe(P,{attributes:true,attributeFilter:["data-theme"]})}catch(e){}<\/script>\n'
+'</head>';
if(typeof PATCHES!=='undefined')PATCHES.push([A,B]);
})();
