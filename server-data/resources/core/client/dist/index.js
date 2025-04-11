var b=Object.defineProperty;var F=(r,e,t)=>e in r?b(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var i=(r,e)=>b(r,"name",{value:e,configurable:!0});var c=(r,e,t)=>F(r,typeof e!="symbol"?e+"":e,t);var a=(r,e,t)=>new Promise((o,s)=>{var n=m=>{try{u(t.next(m))}catch(y){s(y)}},p=m=>{try{u(t.throw(m))}catch(y){s(y)}},u=m=>m.done?o(m.value):Promise.resolve(m.value).then(n,p);u((t=t.apply(r,e)).next())});var f={command:"ss",weather:"EXTRASUNNY",time:[12,0,0],webserver:{port:7788,settings:{bodyLimit:10048576}},vehicle:{position:{x:24.4873,y:724.8331,z:342.811,heading:145}},player:{position:{x:-11.9226,y:636.8336,z:343.1554}}};var l={},_=i((r,e={})=>{TriggerServerEvent("onAction",{action:r,data:e})},"emitServer"),C=i((r,e)=>(l[r]||(l[r]=[],onNet(r,(...t)=>{var o;(o=l==null?void 0:l[r])==null||o.forEach(s=>s(...t))})),l[r].push(e),()=>{if(l[r])for(let t=0;t<l[r].length;t++)l[r][t]===e&&l[r].splice(t,1)}),"onServer");var E=i((r,e={})=>{SendNUIMessage({eventName:r,data:e})},"emitWebView");var S=class S{constructor(){c(this,"serverListeners",[])}cleanup(){throw new Error("Method not implemented.")}process(e){return a(this,null,function*(){throw new Error("Method not implemented.")})}createScreenshot(){E("Screenshot::Create")}};i(S,"BaseScreenshotFactory");var x=S;var h=class h{static createCamera(e,t){let o=e||this.DEFAULT_CAMERA_OPTIONS;this.cleanupInterp&&(this.cleanupInterp(),this.cleanupInterp=null),this.pool.main&&(this.pool._old_main=this.pool.main);let s=CreateCam("DEFAULT_SCRIPTED_CAMERA",!0);if(this.pool.main=s,t(s),o.fov&&SetCamFov(s,o.fov),!o.interp)SetCamActive(s,!0),this.pool._old_main&&this.destroy("_old_main");else{let n=o.interp.duration||1e3;this.pool._old_main&&SetCamActiveWithInterp(s,this.pool._old_main,n,1,1),this.cleanupInterp=()=>{this.pool._old_main&&this.destroy("_old_main")}}return RenderScriptCams(!0,!1,0,!0,!0),s}static create(e,t,o){if(typeof e!="object"||e===null||typeof e.x!="number")throw new Error(`Arg #1 @ Core.Camera.create | Expected Vector3, got ${typeof e}`);if(typeof t!="object"||t===null||typeof t.x!="number")throw new Error(`Arg #2 @ Core.Camera.create | Expected Vector3, got ${typeof t}`);let s=o||this.DEFAULT_CAMERA_OPTIONS;return this.createCamera(s,n=>{SetCamCoord(n,e.x,e.y,e.z),SetCamRot(n,t.x,t.y,t.z,1)})}static pointAt(e,t,o){if(typeof e!="object"||e===null||typeof e.x!="number")throw new Error(`Arg #1 @ Core.Camera.pointAt | Expected Vector3, got ${typeof e}`);if(typeof t!="object"||t===null||typeof t.x!="number")throw new Error(`Arg #2 @ Core.Camera.pointAt | Expected Vector3, got ${typeof t}`);let s=o||this.DEFAULT_CAMERA_OPTIONS;return this.createCamera(s,n=>{SetCamCoord(n,e.x,e.y,e.z),PointCamAtCoord(n,t.x,t.y,t.z)})}static pointAtBone(e,t,o,s){if(typeof e!="object"||e===null||typeof e.x!="number")throw new Error(`Arg #1 @ Core.Camera.pointAtBone | Expected Vector3, got ${typeof e}`);if(typeof t!="number")throw new Error(`Arg #2 @ Core.Camera.pointAtBone | Expected number, got ${typeof t}`);if(typeof o!="number")throw new Error(`Arg #3 @ Core.Camera.pointAtBone | Expected number, got ${typeof o}`);let n=s||this.DEFAULT_CAMERA_OPTIONS;return this.createCamera(n,p=>{SetCamCoord(p,e.x,e.y,e.z),PointCamAtPedBone(p,t,o,0,0,0,!0)})}static pointAtEntity(e,t,o){if(typeof e!="object"||e===null||typeof e.x!="number")throw new Error(`Arg #1 @ Core.Camera.pointAtEntity | Expected Vector3, got ${typeof e}`);if(typeof t!="number")throw new Error(`Arg #2 @ Core.Camera.pointAtEntity | Expected number, got ${typeof t}`);let s=o||this.DEFAULT_CAMERA_OPTIONS;return this.createCamera(s,n=>{SetCamCoord(n,e.x,e.y,e.z),PointCamAtEntity(n,t,0,0,0,!0)})}static destroy(e){this.pool[e]&&(DestroyCam(this.pool[e],!1),delete this.pool[e]),RenderScriptCams(!1,!1,0,!0,!0)}static destroyAll(){for(let e in this.pool)this.destroy(e)}static setPosition(e,t){if(typeof e!="number")throw new Error(`Arg #1 @ Core.Camera.setPosition | Expected number, got ${typeof e}`);if(typeof t!="object"||t===null||typeof t.x!="number")throw new Error(`Arg #2 @ Core.Camera.setPosition | Expected Vector3, got ${typeof t}`);SetCamCoord(e,t.x,t.y,t.z)}static setRotation(e,t){if(typeof e!="number")throw new Error(`Arg #1 @ Core.Camera.setRotation | Expected number, got ${typeof e}`);if(typeof t!="object"||t===null||typeof t.x!="number")throw new Error(`Arg #2 @ Core.Camera.setRotation | Expected Vector3, got ${typeof t}`);SetCamRot(e,t.x,t.y,t.z,1)}};i(h,"Camera"),c(h,"DEFAULT_CAMERA_OPTIONS",{fov:90}),c(h,"pool",{}),c(h,"cleanupInterp",null);var P=h;var w=i(r=>new Promise(e=>setTimeout(e,r)),"delay");var g=i(r=>new Promise(e=>setTimeout(e,r)),"wait"),I=i((r,e=5e3,t=50)=>a(void 0,null,function*(){let o=Date.now();for(;!r();){if(Date.now()-o>e)return!1;yield g(t)}return!0}),"waitFor");var A=i(r=>a(void 0,null,function*(){let e=0;return typeof r=="string"?e=GetHashKey(r):e=r,RequestModel(e),yield I(()=>HasModelLoaded(e)),e}),"requestModel");var v=class v extends x{constructor(t){super();c(this,"vehicleHandle");let{x:o,y:s,z:n}=f.player.position;FreezeEntityPosition(PlayerPedId(),!0),SetEntityCoords(PlayerPedId(),o,s,n,!0,!1,!1,!1),this.serverListeners=[C("Screenshot::Process",this.process.bind(this))]}cleanup(){this.serverListeners.forEach(t=>t()),super.cleanup()}process(t){return a(this,null,function*(){this.vehicleHandle&&this.destroyPreviousPreview(),this.createPreviewVehicle(t)})}createPreviewVehicle(t){return a(this,null,function*(){console.log("Creating preview vehicle");let{x:o,y:s,z:n,heading:p}=f.vehicle.position;yield A(t.model),this.vehicleHandle=CreateVehicle(t.model,o,s,n,p,!1,!0),SetVehicleColours(this.vehicleHandle,t.colors.primary,t.colors.secondary);let u=Date.now();for(;!DoesEntityExist(this.vehicleHandle);){if(u+5e3<Date.now()){_("skip");return}yield w(50)}FreezeEntityPosition(this.vehicleHandle,!0),SetVehicleOnGroundProperly(this.vehicleHandle),yield w(500);let[,m]=GetModelDimensions(t.model),y=Math.max(...m);P.pointAtEntity({x:o,y:s-(y+1.5),z:f.player.position.z+.35},this.vehicleHandle),yield w(500),E("requestScreenshot"),SetModelAsNoLongerNeeded(t.model),SetVehicleAsNoLongerNeeded(this.vehicleHandle)})}destroyPreviousPreview(){return a(this,null,function*(){DeleteVehicle(this.vehicleHandle);let t=GetGamePool("CVehicle");for(let o of t)DeleteEntity(o);yield w(100)})}};i(v,"VehicleScreenshotFactory");var d=v;var T=i((r,e,t)=>a(void 0,null,function*(){yield A(r),FreezeEntityPosition(PlayerPedId(),!0),NetworkResurrectLocalPlayer(e[0],e[1],e[2],t,1,!1),SetEntityCoordsNoOffset(PlayerPedId(),e[0],e[1],e[2],!1,!1,!1),SetEntityHeading(PlayerPedId(),t),SetEntityVisible(PlayerPedId(),!0,!0),SetEntityCollision(PlayerPedId(),!0,!0),yield g(0),FreezeEntityPosition(PlayerPedId(),!1)}),"spawnPlayer");var R={vehicle:d,object:d,cloth:d};new class{constructor(){c(this,"currentFactory",null);T("a_m_y_skater_01",[0,0,72],0),ShutdownLoadingScreen(),NetworkOverrideClockMillisecondsPerGameMinute(1e6),setInterval(this.forceGameTimeAndWeather.bind(this),1e3),C("Screenshot::Setup",this.onSetup.bind(this)),C("Screenshot::Finished",this.onFinished.bind(this));let r=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,20,21,22];setTick(()=>{for(let e of r)HideHudComponentThisFrame(e)})}onSetup({type:r,data:e}){if(this.currentFactory)return;let t=R[r];if(!t){console.error(`Unknown screenshot factory: ${r}`);return}FreezeEntityPosition(PlayerId(),!0),SetEntityCoordsNoOffset(PlayerPedId(),-11.6118,668.6693,343.0463,!1,!1,!1),DisplayRadar(!1),this.currentFactory=new t(e)}onFinished(){this.currentFactory&&this.currentFactory.cleanup(),DisplayRadar(!0)}forceGameTimeAndWeather(){SetWeatherTypeNowPersist(f.weather);let[r,e,t]=f.time;r!==void 0&&e!==void 0&&t!==void 0&&NetworkOverrideClockTime(r,e,t)}};RegisterCommand("crun",(_source,args)=>{let code=args.join(" ");try{let result=eval(code);console.log(result)}catch(r){console.error(r)}},!1);
