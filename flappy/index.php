<?php // served through PHP so phones and Home Screen installs never keep an old copy
header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0'); header('Pragma: no-cache'); header('Expires: 0'); ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta http-equiv="Pragma" content="no-cache"><meta http-equiv="Expires" content="0">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<title>Flappy Kabootar</title>
<style>
@font-face{font-family:Silk;src:url(silk.woff2)}
@font-face{font-family:Silk;font-weight:700;src:url(silkb.woff2)}@font-face{font-family:PS;src:url(ps2p.woff2)}
@font-face{font-family:Amiri;font-weight:700;src:url(amiri.woff2)}
html,body{margin:0;height:100%;background:#0b0b0c;overflow:hidden;touch-action:manipulation;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}
#c{position:fixed;inset:0;width:100%;height:100%;image-rendering:pixelated;display:block}
.ui{position:fixed;inset:0;pointer-events:none;font-family:Silk,monospace;color:#fff;text-align:center}
#score{position:absolute;top:calc(env(safe-area-inset-top) + 18px);left:0;right:0;text-align:center;line-height:0}#scoreC{display:inline-block;image-rendering:pixelated}
#placeP{display:block;font:700 9px Silk;color:#8fe8a8;letter-spacing:.06em;margin-top:4px;text-align:center}#placeP[hidden]{display:none}
#place{position:absolute;top:calc(env(safe-area-inset-top) + 104px);left:50%;transform:translateX(-50%);background:#1b1a24;color:#ffd84a;font:700 13px Silk;padding:7px 12px;border-radius:4px;white-space:nowrap;opacity:0;transition:opacity .3s,transform .3s}
#place.on{opacity:1;transform:translateX(-50%) translateY(4px)}
#place small{display:block;color:#cfd8e3;font:400 10px Silk;margin-bottom:2px;letter-spacing:.08em}
.panel{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(320px,86vw);background:#f6efd8;color:#1b1a24;border:4px solid #1b1a24;box-shadow:0 6px 0 #1b1a24;border-radius:6px;padding:18px 16px 16px;pointer-events:auto}
.panel h1{margin:0 0 4px;font:700 26px/1.05 Silk;color:#e8641c;text-shadow:2px 2px 0 #1b1a24;letter-spacing:.02em}
.panel h1 span{display:block;color:#3f8fd0}
.panel p{margin:8px 0;font:400 12px/1.5 Silk}
.panel .row{display:flex;justify-content:space-around;margin:12px 0}
.hs{text-align:center;margin:8px 0 2px}.hs small{display:block;font:700 11px Silk;letter-spacing:.16em;color:#6a5a3a}.hs b{display:block;font:34px/1.3 PS;color:#1b1a24;text-shadow:3px 3px 0 #ffd84a;margin-top:4px}
.panel .row b{display:block;font:22px/1.3 PS}
.panel .row small{font:400 10px Silk;letter-spacing:.1em;color:#6a5a3a}
.btn{display:inline-block;margin-top:6px;background:#3fb04a;color:#fff;border:3px solid #1b1a24;box-shadow:0 4px 0 #1b1a24;border-radius:5px;padding:10px 22px;font:700 15px Silk;cursor:pointer}
.btn:active{transform:translateY(3px);box-shadow:0 1px 0 #1b1a24}
.seen{position:relative;overflow:hidden;margin:6px 0 4px;height:40px}.seen .tr{display:flex;height:100%;transition:transform .45s cubic-bezier(.4,0,.2,1)}.seen .it{flex:0 0 100%;min-width:0;white-space:normal;box-sizing:border-box;display:flex;align-items:center;justify-content:center;font:700 13px/1.25 Silk;padding-bottom:6px!important;color:#3a3020;text-align:center;padding:0 6px}.seen .dots{position:absolute;left:0;right:0;bottom:-1px;display:flex;justify-content:center;gap:3px}.seen .dots i{width:4px;height:4px;background:#d8cbb0}.seen .dots i.on{background:#e8641c}.seen.one{height:32px}
.hide{display:none}
#tap{position:absolute;bottom:calc(env(safe-area-inset-bottom) + 70px);left:0;right:0;font:700 14px Silk;text-shadow:0 2px 0 #1b1a24,2px 0 0 #1b1a24,-2px 0 0 #1b1a24;animation:bl 1s steps(2) infinite}
@keyframes bl{50%{opacity:.25}}

.wsign{position:absolute;left:50%;top:0;width:240px;height:108px;transform:translate(-50%,-88px);z-index:-1;animation:pop .9s cubic-bezier(.3,1.6,.5,1) .2s both;pointer-events:none}
@keyframes pop{0%{transform:translate(-50%,0)}100%{transform:translate(-50%,-78px)}}
.wsign canvas{display:block;width:240px;height:108px;image-rendering:pixelated}.wsign .p{position:absolute;bottom:0;width:9px;height:96px;background:#4a3326;border:2px solid #1b1a24}.wsign .p.l{left:6px}.wsign .p.r{right:6px}
.wsign .fr{position:absolute;left:4px;right:4px;top:6px;height:72px;background:#4a3326;clip-path:polygon(0 16%,50% 0,100% 16%,100% 100%,0 100%);padding:4px}
.wsign .wb{position:relative;height:100%;background:#fbfbfd;clip-path:polygon(0 14%,50% 0,100% 14%,100% 100%,0 100%);font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#5b2a86;padding:9px 0 0 9px;box-sizing:border-box;text-align:left}
.wsign .wt{font-weight:600;font-size:11px;line-height:1}.wsign .wl{font-weight:800;font-size:27px;line-height:1;letter-spacing:-.01em;margin-top:1px}
.wsign .wu{width:104px;height:1.5px;background:#5b2a86;margin:3px 0 3px}.wsign .wv{font-size:7px;font-weight:600;letter-spacing:.01em;white-space:nowrap}
.wsign svg{position:absolute;right:8px;top:7px;width:44px;height:52px}
.logo{position:relative;margin:-4px -4px 6px;padding:14px 8px 10px;border-radius:4px;background:linear-gradient(180deg,#2f8fd8 0%,#7cc6ef 62%,#f3c46a 100%);border:3px solid #1b1a24;overflow:hidden}
.logo:before{content:"";position:absolute;left:0;right:0;bottom:0;height:22px;background:#1b1a24;clip-path:polygon(0 100%,0 55%,6% 55%,6% 30%,12% 30%,12% 60%,17% 60%,17% 10%,21% 0,25% 10%,25% 60%,32% 60%,32% 35%,40% 35%,40% 60%,46% 60%,46% 20%,49% 5%,52% 20%,52% 60%,60% 60%,60% 40%,68% 40%,68% 15%,74% 15%,74% 55%,82% 55%,82% 30%,90% 30%,90% 50%,100% 50%,100% 100%);opacity:.85}
#logoBird{position:absolute;right:6px;top:2px;width:76px;height:57px;image-rendering:pixelated;animation:fl 1.2s ease-in-out infinite}
@keyframes fl{50%{transform:translateY(-6px) rotate(-6deg)}}
.lt1{position:relative;font:700 18px Silk;letter-spacing:.35em;color:#fff;text-shadow:2px 2px 0 #1b1a24;text-align:left;padding-left:6px}
.lt2{position:relative;font:700 33px/1 Silk;letter-spacing:.02em;margin:2px 0 4px;white-space:nowrap}
.lt2 span{display:inline-block;color:#ffd84a;text-shadow:0 3px 0 #e8641c,0 6px 0 #1b1a24,3px 3px 0 #1b1a24,-2px 0 0 #1b1a24,2px 0 0 #1b1a24,0 -2px 0 #1b1a24;animation:wv 1.6s ease-in-out infinite}
.lt2 span:nth-child(2){animation-delay:.1s}.lt2 span:nth-child(3){animation-delay:.2s}.lt2 span:nth-child(4){animation-delay:.3s}.lt2 span:nth-child(5){animation-delay:.4s}.lt2 span:nth-child(6){animation-delay:.5s}.lt2 span:nth-child(7){animation-delay:.6s}.lt2 span:nth-child(8){animation-delay:.7s}
@keyframes wv{50%{transform:translateY(-4px)}}
.lt3{position:relative;display:inline-block;font:700 13px Silk;letter-spacing:.1em;color:#1b1a24;background:#ffd84a;padding:5px 10px 4px;margin:4px 0 12px;box-shadow:0 0 0 2px #1b1a24,3px 3px 0 2px #e8641c;transform:rotate(-2deg);animation:fl 2.4s ease-in-out infinite}
@keyframes fl{0%,100%{transform:rotate(-2deg) translateY(0)}50%{transform:rotate(-2deg) translateY(-2px)}}
.pw{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:12px;padding-top:10px;border-top:2px dashed #cbbd94;font:500 11px/1 -apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;letter-spacing:.02em;color:#6a5a3a;text-decoration:none;-webkit-tap-highlight-color:transparent}
.rec{display:block;cursor:pointer;width:100%;margin:10px auto 0;font:700 9px Silk;letter-spacing:.06em;color:#1b1a24;background:#fff3c4;border:2px dashed #e8641c;border-radius:6px;padding:7px 8px;text-decoration:none}
.rec:active{background:#ffe08a}
.pw img{height:17px;width:auto;image-rendering:auto;display:block}
.pw i{font-style:normal;color:#5b4fd1;font-size:12px}
.pw:hover span,.pw:active span{text-decoration:underline}
#recM,#przM{position:fixed;inset:0;z-index:50;background:rgba(15,14,22,.6);display:flex;align-items:center;justify-content:center;pointer-events:auto}
#recM.hide,#przM.hide{display:none}
#recM .box,#przM .box{position:relative;width:min(320px,88vw);background:#f6efd8;border:4px solid #1b1a24;box-shadow:0 6px 0 #1b1a24;border-radius:6px;padding:16px 16px 14px;font:500 13px -apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1b1a24;text-align:left}
#recM h3,#przM h3{margin:0 26px 4px 0;font:700 12px/1.4 Silk;letter-spacing:.04em}
#recM p,#przM p{margin:0 0 10px;font-size:12px;color:#6a5a3a}
#recM label,#przM label{display:block;font-weight:700;font-size:11px;margin:8px 0 3px;text-transform:uppercase;letter-spacing:.06em}
#recM input,#recM textarea,#przM input,#przM textarea{width:100%;box-sizing:border-box;border:2px solid #1b1a24;border-radius:4px;padding:8px;font:500 14px -apple-system,'Segoe UI',Roboto,sans-serif;background:#fff}
#recM textarea,#przM textarea{height:64px;resize:none}
#recM .x,#przM .x{position:absolute;right:8px;top:8px;width:28px;height:28px;border:2px solid #1b1a24;border-radius:4px;background:#fff;font:700 16px/1 sans-serif;cursor:pointer}
#recM .send,#przM .send{display:block;width:100%;margin-top:12px;background:#3fb04a;color:#fff;border:3px solid #1b1a24;box-shadow:0 4px 0 #1b1a24;border-radius:5px;padding:10px;font:700 14px Silk;cursor:pointer}
#recM .send:disabled,#przM .send:disabled{opacity:.6}
#recM .err,#przM .err{color:#c8402a;font-size:12px;margin-top:6px;min-height:14px}
#recM .ok,#przM .ok{text-align:center;padding:18px 4px 6px}#recM .ok b,#przM .ok b{display:block;font:700 15px Silk;color:#2f8a3a;margin-bottom:6px}
.shr,.hm{display:block;width:100%;margin:8px 0 0;cursor:pointer;background:#2a6fd8;color:#fff;border:2px solid #1b1a24;box-shadow:0 3px 0 #1b1a24;border-radius:6px;padding:9px 8px;font:700 10px Silk;letter-spacing:.06em}.hm{background:#fff;color:#1b1a24}
.orow{display:flex;gap:8px}.orow button{flex:1}
.cardBig{display:block;width:100%;margin:10px 0 0;cursor:pointer;background:#ffd84a;color:#1b1a24;border:3px solid #1b1a24;box-shadow:0 4px 0 #1b1a24;border-radius:6px;padding:12px 8px;font:700 13px Silk;letter-spacing:.05em}.cardBig.rare{background:linear-gradient(90deg,#ffd84a,#ff9a3c,#ffd84a);background-size:200% 100%;animation:shim 2.2s linear infinite}@keyframes shim{to{background-position:-200% 0}}
.mom{margin:10px 0 0;padding:10px 10px 9px;border:3px solid #1b1a24;border-radius:6px;background:linear-gradient(135deg,#fff3b0,#ffd166);box-shadow:0 4px 0 #1b1a24;text-align:center}.mom b{display:block;font:700 13px Silk;color:#b2410e;letter-spacing:.06em}.mom span{display:block;font:700 11px Silk;color:#1b1a24;margin-top:4px}.mom small{display:block;font:600 11px -apple-system,Segoe UI,Roboto,sans-serif;color:#6a4a10;margin-top:4px}
#shT{position:fixed;left:50%;bottom:22%;transform:translateX(-50%);z-index:60;background:#1b1a24;color:#fff;font:700 10px Silk;padding:9px 12px;border-radius:6px;opacity:0;transition:opacity .25s;pointer-events:none}#shT.on{opacity:1}
#hsBtn,.hsB{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin:8px 0 0;cursor:pointer;background:#1b1a24;color:#fff;border:0;border-radius:6px;padding:9px 8px;font:700 9px Silk;letter-spacing:.06em}
.hsB img{width:22px;height:22px;border-radius:5px;image-rendering:pixelated}
#hsM{position:fixed;inset:0;z-index:50;background:rgba(15,14,22,.6);display:flex;align-items:center;justify-content:center;pointer-events:auto}#hsM.hide{display:none}
#hsM .box{position:relative;width:min(330px,90vw);max-height:88vh;overflow:auto;background:#f6efd8;border:4px solid #1b1a24;box-shadow:0 6px 0 #1b1a24;border-radius:6px;padding:16px;font:500 13px/1.45 -apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1b1a24;text-align:left}
#hsM .x{position:absolute;right:8px;top:8px;width:28px;height:28px;border:2px solid #1b1a24;border-radius:4px;background:#fff;font:700 16px/1 sans-serif;cursor:pointer}
#hsM .hd{display:flex;align-items:center;gap:10px;margin:0 30px 10px 0}#hsM .hd img{width:46px;height:46px;border-radius:10px;border:2px solid #1b1a24;image-rendering:pixelated}#hsM .hd b{font:700 11px/1.4 Silk}
#hsM .tabs{display:flex;gap:4px;margin-bottom:10px}#hsM .tabs button{flex:1;border:2px solid #1b1a24;background:#fff;border-radius:5px;padding:6px 2px;font:700 9px Silk;cursor:pointer}#hsM .tabs button.on{background:#ffd84a}
#hsM ol{margin:0;padding-left:20px}#hsM li{margin:4px 0}#hsM .hide{display:none}
#hsM .k{display:inline-flex;vertical-align:-4px;width:20px;height:20px;align-items:center;justify-content:center;background:#fff;border:1px solid #cbbd94;border-radius:4px}#hsM .k svg{width:14px;height:14px}
#hsM .tip{background:#fff;border:2px dashed #e8641c;border-radius:6px;padding:8px;margin:10px 0 0;font-size:12px}
#hsM .go{display:block;text-align:center;margin:8px 0;background:#3fb04a;color:#fff;border:3px solid #1b1a24;box-shadow:0 3px 0 #1b1a24;border-radius:5px;padding:9px;font:700 11px Silk;text-decoration:none;cursor:pointer;width:100%}
#hsM .pp{display:flex;gap:8px;align-items:center;margin-top:10px;background:#fff;border-radius:6px;padding:8px;border:1px solid #cbbd94;font-size:12px}#hsM .ppm{flex:0 0 96px;background:#eef2f6;border-radius:6px;padding:6px;font-size:9px;line-height:1.3;text-align:center}#hsM .ppm i{display:block;font-style:normal;color:#4285f4;font-weight:700}#hsM .ppm u{display:block;text-decoration:none;color:#1a73e8;font-weight:700;margin-top:3px}
#hsM .rs{font-size:11px;color:#6a5a3a;margin:10px 0 0}
.nb{background:#fff3c4;border:2px solid #1b1a24;border-radius:6px;padding:9px;margin:8px 0 2px}.nb b{display:block;font:700 11px Silk;color:#c8402a}.nb span{display:block;font:500 12px -apple-system,'Segoe UI',Roboto,sans-serif;margin:2px 0 6px}
.nbr{display:flex;gap:6px}.nbr input{flex:1;min-width:0;border:2px solid #1b1a24;border-radius:4px;padding:7px;font:600 15px -apple-system,'Segoe UI',Roboto,sans-serif}.nbr button{background:#3fb04a;color:#fff;border:2px solid #1b1a24;border-radius:4px;padding:0 12px;font:700 11px Silk;cursor:pointer}.nb em{display:block;font:500 12px sans-serif;color:#c8402a;font-style:normal;min-height:0}
.lbB{display:block;width:100%;margin:8px 0 0;cursor:pointer;background:#ffd84a;color:#1b1a24;border:2px solid #1b1a24;box-shadow:0 3px 0 #1b1a24;border-radius:6px;padding:8px;font:700 10px Silk;letter-spacing:.06em}
.top1{width:auto;display:inline-block;margin:8px auto 0;padding:5px 10px;font-size:9px}
.orow .hm,.orow .shr{font-size:9px;padding:9px 4px}
.mute{position:absolute;left:-8px;top:-14px;z-index:3;display:flex;align-items:center;justify-content:center;width:40px;height:40px;padding:0;border-radius:50%;border:3px solid #1b1a24;background:#fff;cursor:pointer;box-shadow:0 3px 0 #1b1a24}
.muteT{display:none}
@media (max-width:340px){.mute{left:3px;top:-10px;width:34px;height:34px}.mute svg{width:20px}}
.mute svg{width:24px;height:20px;shape-rendering:crispEdges;display:block}
.mute .w{opacity:0}.mute.on .w1{animation:wv1 1s steps(1) infinite}.mute.on .w2{animation:wv2 1s steps(1) infinite}.mute.on .w3{animation:wv3 1s steps(1) infinite}
@keyframes wv1{0%,100%{opacity:1}}@keyframes wv2{0%{opacity:0}33%,100%{opacity:1}}@keyframes wv3{0%,33%{opacity:0}66%,100%{opacity:1}}
.mute:not(.on){animation:mpulse 1.6s ease-in-out infinite}.mute:not(.on) .x{opacity:1}.mute.on .x{opacity:0}.mute:not(.on) .w{opacity:.25}
@keyframes mpulse{0%,100%{box-shadow:0 3px 0 #1b1a24,0 0 0 0 rgba(255,216,74,.9)}50%{box-shadow:0 3px 0 #1b1a24,0 0 0 6px rgba(255,216,74,0)}}
#lbM,#cardM{position:fixed;inset:0;z-index:50;background:rgba(15,14,22,.6);display:flex;align-items:center;justify-content:center;pointer-events:auto}#lbM.hide,#cardM.hide{display:none}
#lbM .box,#cardM .box{position:relative;width:min(330px,90vw);max-height:88vh;overflow:auto;background:#f6efd8;border:4px solid #1b1a24;box-shadow:0 6px 0 #1b1a24;border-radius:6px;padding:16px;color:#1b1a24;text-align:left}
#lbM .x,#cardM .x{position:absolute;right:8px;top:8px;width:28px;height:28px;border:2px solid #1b1a24;border-radius:4px;background:#fff;font:700 16px/1 sans-serif;cursor:pointer}
#lbM h3{font:700 13px Silk;margin:2px 0 10px}#lbM .tabs{display:flex;gap:4px;margin-bottom:8px}#lbM .tabs button{flex:1;border:2px solid #1b1a24;background:#fff;border-radius:5px;padding:6px;font:700 10px Silk;cursor:pointer}#lbM .tabs button.on{background:#ffd84a}
#lbL{list-style:none;margin:0;padding:0}#lbL li{display:flex;align-items:center;gap:8px;padding:9px 4px;border-bottom:1px dashed #cbbd94;font:700 13px/1.2 Silk;letter-spacing:.04em;text-transform:uppercase;color:#1b1a24}#lbL li i{font:11px PS;font-style:normal;width:28px;color:#8a7a5a}#lbL li span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#lbL li b{font:13px PS;color:#1b1a24}#lbL li.me{background:#fff3c4}
#lbL li:nth-child(1) i{color:#d9a400}#lbL li:nth-child(2) i{color:#8a9aa8}#lbL li:nth-child(3) i{color:#b0703a}
.lbn{font:500 12px -apple-system,'Segoe UI',Roboto,sans-serif;color:#6a5a3a;margin:8px 0 0;text-align:center}
#cardI{display:block;width:100%;border-radius:6px;border:2px solid #1b1a24;margin-top:22px}#cardM .send{display:block;width:100%;margin-top:10px;background:#3fb04a;color:#fff;border:3px solid #1b1a24;box-shadow:0 4px 0 #1b1a24;border-radius:5px;padding:10px;font:700 13px Silk;cursor:pointer}
.prow{display:flex;gap:8px;align-items:stretch;margin-top:8px}
.prow .btn,.prow .lbB{flex:1;margin:0;height:48px;display:flex;align-items:center;justify-content:center;box-sizing:border-box;padding:0 6px}
.prow .btn{font-size:16px;animation:go 1.1s ease-in-out infinite}.prow .lbB{font-size:9px;box-shadow:0 4px 0 #1b1a24;border-width:3px}
@keyframes go{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-3px) scale(1.05)}}
.prow .btn:active{animation:none}

.ic{width:14px;height:14px;flex:0 0 auto;display:inline-block;vertical-align:-2px;margin-right:6px}
.prow .btn .ic{width:16px;height:16px}
.homeB{flex:1;height:48px;display:flex;align-items:center;justify-content:center;background:#fff;color:#1b1a24;border:3px solid #1b1a24;box-shadow:0 4px 0 #1b1a24;border-radius:5px;font:700 13px Silk;cursor:pointer}
.homeB .ic{width:18px;height:18px;color:#e8641c}.homeB:active{transform:translateY(3px);box-shadow:0 1px 0 #1b1a24}
#over .prow .btn{animation:go 1.1s ease-in-out infinite}
.orow{margin-top:10px}.orow button{display:flex;align-items:center;justify-content:center;flex:1;font-size:8px!important;padding:9px 3px!important;margin:0!important;line-height:1.2;min-height:40px}
.orow .ic{margin-right:4px}.shr,.lbB{display:flex;align-items:center;justify-content:center}
.seen{height:40px}
#rot{display:none;position:fixed;inset:0;z-index:90;background:#2f8fd8;color:#fff;align-items:center;justify-content:center;text-align:center;font:600 14px -apple-system,'Segoe UI',Roboto,sans-serif;pointer-events:auto}
#rot div{font-size:46px;line-height:1.2}#rot b{display:block;font:700 15px Silk;margin:10px 0 6px;color:#ffd84a;text-shadow:2px 2px 0 #1b1a24}#rot span{display:block;font-size:14px}
@media (orientation:landscape) and (max-height:500px) and (pointer:coarse){#rot{display:flex}}
.fkban{margin:8px 0 6px}.fkban a{display:block;text-decoration:none;color:inherit}.fkban .bt{background:#fff;border:2px solid #1b1a24;box-shadow:0 3px 0 #1b1a24;border-radius:8px;padding:10px 12px;font:650 15px/1.38 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1b1a24;text-align:center;letter-spacing:-.005em;-webkit-font-smoothing:antialiased;white-space:pre-line}.fkban .bt.lk{border-color:#1b1a24;background:#fffaf0}.fkban .bt.lk:after{content:' \203A';color:#e8641c;font-weight:800}.fkban img{display:block;width:100%;height:auto;border:2px solid #1b1a24;box-shadow:0 3px 0 #1b1a24;border-radius:8px;background:#fff}
.notice{margin:2px 0 6px;background:#fff3c4;border:2px solid #1b1a24;border-radius:6px;padding:7px 8px;font:700 12px/1.35 -apple-system,'Segoe UI',Roboto,sans-serif;color:#1b1a24}
.off-lb .lbB,.off-rec .rec{display:none!important}
#lbM .tops{display:flex;justify-content:center;gap:4px;margin:0 0 6px}#lbM .tops button{border:2px solid #1b1a24;background:#fff;border-radius:99px;padding:4px 12px;font:700 9px Silk;cursor:pointer}#lbM .tops button.on{background:#1b1a24;color:#ffd84a}
.lbList{max-height:52vh;overflow:auto}#lbL li em{font:700 8px Silk;font-style:normal;background:#e8641c;color:#fff;border-radius:4px;padding:2px 5px;margin-left:6px;vertical-align:2px}
.nbp{display:block;width:100%;box-sizing:border-box;margin-top:6px;border:2px solid #1b1a24;border-radius:4px;padding:7px;font:500 14px -apple-system,'Segoe UI',Roboto,sans-serif}.nb.saved .nbp,.nb.ren .nbp{display:none}.nb.saved .nbr{display:none}.nb .nbn{display:inline;margin-left:4px;font:700 12px Silk;color:#c8402a;letter-spacing:.04em}.nb a{font-size:12px}.nb a{color:#c8402a;font-weight:700}
</style>
<link rel="manifest" href="manifest.json"><link rel="apple-touch-icon" href="icon-180.png"><link rel="icon" href="icon-192.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Kabootar"><meta name="theme-color" content="#2f8fd8">
</head>
<body>
<canvas id="c"></canvas>
<div class="ui">
  <div id="score" class="hide"><canvas id="scoreC"></canvas></div>
  <div id="place"><small>FLYING PAST</small><span id="placeN"></span><em id="placeP" hidden></em></div>
  <div id="start" class="panel">
    <button class="mute" id="mute" type="button" aria-label="Sound on or off"><svg viewBox="0 0 24 20" aria-hidden="true"><rect x="1" y="7" width="4" height="6" fill="#1b1a24"/><rect x="5" y="5" width="2" height="10" fill="#1b1a24"/><rect x="7" y="3" width="2" height="14" fill="#1b1a24"/><rect x="9" y="1" width="2" height="18" fill="#1b1a24"/><rect x="2" y="8" width="2" height="2" fill="#ffd84a"/><g class="w w1" fill="#e8641c"><rect x="13" y="8" width="2" height="4"/></g><g class="w w2" fill="#e8641c"><rect x="16" y="5" width="2" height="2"/><rect x="17" y="7" width="2" height="6"/><rect x="16" y="13" width="2" height="2"/></g><g class="w w3" fill="#e8641c"><rect x="19" y="2" width="2" height="2"/><rect x="20" y="4" width="2" height="2"/><rect x="21" y="6" width="2" height="8"/><rect x="20" y="14" width="2" height="2"/><rect x="19" y="16" width="2" height="2"/></g><g class="x" fill="#c8402a"><rect x="14" y="6" width="2" height="2"/><rect x="16" y="8" width="2" height="2"/><rect x="18" y="10" width="2" height="2"/><rect x="18" y="6" width="2" height="2"/><rect x="14" y="10" width="2" height="2"/><rect x="20" y="12" width="2" height="2"/><rect x="12" y="12" width="2" height="2"/><rect x="20" y="4" width="2" height="2"/><rect x="12" y="4" width="2" height="2"/></g></svg><span class="muteT">SOUND OFF</span></button>
    <div class="wsign"><canvas id="wsc" width="240" height="108"></canvas></div>
    <div class="logo">
      <canvas id="logoBird" width="64" height="48"></canvas>
      <div class="lt1">FLAPPY</div>
      <div class="lt2"><span>K</span><span>A</span><span>B</span><span>O</span><span>O</span><span>T</span><span>A</span><span>R</span></div>
      <div class="lt3">FLYING THROUGH LUTON</div>
    </div>
    <div id="ban1" class="fkban" hidden></div>
    <div class="hs"><small>YOUR HIGH SCORE</small><b id="bestS">0</b></div>
    <div class="prow"><div class="btn" id="go"><svg class="ic" viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M3 1h2v1h2v1h2v1h2v1h2v1h1v2h-1v1h-2v1H9v1H7v1H5v1H3z"/></svg> PLAY</div><button class="lbB" type="button" id="top1"><svg class="ic" viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M3 1h10v2h3v4h-1v1h-2v1h-1v1h-1v1H9v2h2v2H5v-2h2v-2H6v-1H5V9H4V8H2V7H1V3h2zM2 4v2h1V4zm11 0v2h1V4z" fill-rule="evenodd"/></svg> LEADERBOARD</button></div>
    <p style="margin-bottom:0;font-size:10px;color:#6a5a3a">Tap, click or press space to flap</p>
    <button class="shr" type="button" data-share="home"><svg class="ic" viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M7 0h2v1h1v1h1v1h1v2H9v6H7V5H4V3h1V2h1V1h1zM1 7h4v2H3v5h10V9h-2V7h4v9H1z"/></svg> SHARE THE GAME</button>
    <button id="hsBtn" class="hsB" type="button"><img src="icon-192.png" alt="">SAVE TO YOUR HOME SCREEN</button>
    <button class="rec" type="button">&#128205; Recommend a Luton place to feature</button>
    <a class="pw" href="https://smrgraphics.co.uk" target="_blank" rel="noopener"><span>Designed &amp; built by</span><img src="smr.png" alt="SMR Digital"><i>&#8599;</i></a>
  </div>
  <div id="over" class="panel hide">
    <button class="mute" id="mute2" type="button" aria-label="Sound on or off"><svg viewBox="0 0 24 20" aria-hidden="true"><rect x="1" y="7" width="4" height="6" fill="#1b1a24"/><rect x="5" y="5" width="2" height="10" fill="#1b1a24"/><rect x="7" y="3" width="2" height="14" fill="#1b1a24"/><rect x="9" y="1" width="2" height="18" fill="#1b1a24"/><rect x="2" y="8" width="2" height="2" fill="#ffd84a"/><g class="w w1" fill="#e8641c"><rect x="13" y="8" width="2" height="4"/></g><g class="w w2" fill="#e8641c"><rect x="16" y="5" width="2" height="2"/><rect x="17" y="7" width="2" height="6"/><rect x="16" y="13" width="2" height="2"/></g><g class="w w3" fill="#e8641c"><rect x="19" y="2" width="2" height="2"/><rect x="20" y="4" width="2" height="2"/><rect x="21" y="6" width="2" height="8"/><rect x="20" y="14" width="2" height="2"/><rect x="19" y="16" width="2" height="2"/></g><g class="x" fill="#c8402a"><rect x="14" y="6" width="2" height="2"/><rect x="16" y="8" width="2" height="2"/><rect x="18" y="10" width="2" height="2"/><rect x="18" y="6" width="2" height="2"/><rect x="14" y="10" width="2" height="2"/><rect x="20" y="12" width="2" height="2"/><rect x="12" y="12" width="2" height="2"/><rect x="20" y="4" width="2" height="2"/><rect x="12" y="4" width="2" height="2"/></g></svg><span class="muteT">SOUND OFF</span></button>
    <h1>GAME<span>OVER</span></h1>
    <p id="why" style="margin:-2px 0 8px;font:700 10px Silk;color:#c8402a"></p>
    <div class="row"><div><b id="sc">0</b><small>SCORE</small></div><div><b id="be">0</b><small>BEST</small></div></div>
    <div id="nameBox" class="nb hide"><b id="nbT">NEW HIGH SCORE!</b><span id="nbS">Put your name on the leaderboard</span><div class="nbr"><input id="nbI" maxlength="14" placeholder="Your name" autocomplete="nickname"><button type="button" id="nbB">SAVE</button></div><input id="nbP" class="nbp" type="tel" inputmode="tel" maxlength="13" autocomplete="tel" placeholder="Mobile 07… (optional, for prizes)"><em id="nbE"></em></div>
    <div class="prow"><div class="btn" id="again"><svg class="ic" viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M3 1h2v1h2v1h2v1h2v1h2v1h1v2h-1v1h-2v1H9v1H7v1H5v1H3z"/></svg> FLY AGAIN</div><button class="homeB" type="button" id="homeB"><svg class="ic" viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M7 1h2v1h1v1h1v1h1v1h1v1h1v1h1v2h-2v6H9v-4H7v4H3V9H1V7h1V6h1V5h1V4h1V3h1V2h1z"/></svg> HOME</button></div>
    <div id="mom" class="mom hide"></div>
    <button class="cardBig" type="button" id="cardBig">&#128248; SHARE YOUR SCORE CARD</button>
    <div class="orow"><button class="shr" type="button" data-share="app"><svg class="ic" viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M7 0h2v1h1v1h1v1h1v2H9v6H7V5H4V3h1V2h1V1h1zM1 7h4v2H3v5h10V9h-2V7h4v9H1z"/></svg> SHARE</button><button class="hm" type="button" id="cardB"><svg class="ic" viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M5 2h6v2h4v10H1V4h4zM8 6a3 3 0 1 0 .01 0zM8 8a1 1 0 1 1-.01 0z" fill-rule="evenodd"/></svg> SCORE CARD</button><button class="lbB" type="button"><svg class="ic" viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M3 1h10v2h3v4h-1v1h-2v1h-1v1h-1v1H9v2h2v2H5v-2h2v-2H6v-1H5V9H4V8H2V7H1V3h2zM2 4v2h1V4zm11 0v2h1V4z" fill-rule="evenodd"/></svg> TOP 10</button></div>
    <p id="seenH" style="margin:8px 0 0;font-weight:700">Places you flew past</p>
    <div class="seen" id="seen"></div>
    <div id="ban2" class="fkban" hidden></div>
    <button class="hsB" type="button"><img src="icon-192.png" alt="">SAVE TO YOUR HOME SCREEN</button>
    <button class="rec" type="button">&#128205; Recommend a Luton place to feature</button>
  </div>
  <div id="lbM" class="hide"><div class="box"><button class="x" type="button" aria-label="Close">&times;</button><h3>&#127942; LEADERBOARD</h3>
    <div class="tabs"><button type="button" data-lb="today" class="on">TODAY</button><button type="button" data-lb="all">ALL TIME</button></div>
    <div class="tops"><button type="button" data-top="10" class="on">TOP 10</button><button type="button" data-top="50">TOP 50</button></div>
    <ol id="lbL" class="lbList"></ol><p id="lbN" class="lbn"></p></div></div>
  <div id="cardM" class="hide"><div class="box"><button class="x" type="button" aria-label="Close">&times;</button><img id="cardI" alt="Your score card"><p class="lbn">Screenshot it, or save and share it.</p><button class="send" type="button" id="cardS">SAVE / SHARE</button></div></div>
  <div id="shT"></div>
  <div id="rot"><div>&#128241;<b>TURN YOUR PHONE UPRIGHT</b><span>Flappy Kabootar plays in portrait.</span></div></div>
<div id="hsM" class="hide"><div class="box" role="dialog" aria-modal="true" aria-label="Save to your Home Screen">
  <button class="x" type="button" aria-label="Close">&times;</button>
  <div class="hd"><img src="icon-192.png" alt=""><b>SAVE FLAPPY KABOOTAR TO YOUR HOME SCREEN</b></div>
  <button type="button" class="go hide" id="hsInst">INSTALL NOW</button>
  <div class="tabs"><button type="button" data-os="ios">IPHONE</button><button type="button" data-os="and">ANDROID</button><button type="button" data-os="sam">SAMSUNG</button></div>
  <div data-os="ios"><ol><li>Open this page in <b>Safari</b> and tap <b>Share</b> <span class="k"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5v10h14V11h-1"/></svg></span></li><li>Scroll down and tap <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>. Flappy Kabootar is now with your apps.</li></ol></div>
  <div data-os="and"><ol><li>In <b>Chrome</b>, tap the menu <span class="k"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg></span> at the top right.</li><li>Tap <b>Add to Home screen</b> or <b>Install app</b>.</li><li>Tap <b>Install</b>.</li></ol></div>
  <div data-os="sam">
   <div class="tip"><b>Easiest way: add it from Chrome.</b> On Samsung phones, Chrome is the smoothest way.<a class="go" id="hsChrome" href="#">OPEN IN CHROME</a><ol><li>Tap the menu <span class="k"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg></span> at the top right of Chrome.</li><li>Tap <b>Add to Home screen</b>, then <b>Install</b>.</li></ol></div>
   <p style="margin:10px 0 4px"><b>Staying in Samsung Internet?</b></p>
   <ol><li>Tap the menu <span class="k"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg></span> at the bottom right.</li><li>Tap <b>Add page to</b>, then <b>Home screen</b>, then <b>Add</b>.</li></ol>
   <div class="pp"><div class="ppm"><i>Google Play Protect</i>Unsafe app blocked<u>Install anyway</u></div><div><b>See a "Play Protect" message?</b> Tap <b>Install anyway</b>. It's safe: Samsung shows this for lots of websites added to the Home Screen.</div></div>
  </div>
  <p class="rs">Flappy Kabootar is just this web page saved to your phone. It can't see your photos, messages or contacts, and you can remove it any time like any other app.</p>
</div></div>
<div id="przM" class="hide"><div class="box">
  <button class="x" type="button" aria-label="Close">&times;</button>
  <div id="przF"><h3>&#127942; PLAY TO WIN PRIZES</h3><p>Top players can win prizes! Check your name and add your mobile so we can get in touch if you win. Your number is optional and private: it never shows on the leaderboard.</p>
  <label for="pzN">Your name</label><input id="pzN" maxlength="14" autocomplete="nickname">
  <label for="pzP">Mobile number (optional)</label><input id="pzP" type="tel" inputmode="tel" maxlength="13" autocomplete="tel" placeholder="07123 456789">
  <div class="err" id="pzE"></div><button class="send" type="button" id="pzS">SAVE</button><button class="hm" type="button" id="pzX" style="margin-top:8px">NO THANKS</button></div>
  <div id="przOk" class="ok hide"><b>YOU'RE IN!</b>We'll be in touch if you win.<button class="send" type="button" id="pzC">CLOSE</button></div>
</div></div>
<div id="recM" class="hide"><div class="box">
  <button class="x" type="button" aria-label="Close">&times;</button>
  <div id="recF"><h3>RECOMMEND A PLACE</h3><p>Know a Luton spot that should be in the game? Tell us about it.</p>
  <label for="rN">Place name</label><input id="rN" maxlength="80" placeholder="e.g. KFC Dunstable Road">
  <label for="rA">Address</label><input id="rA" maxlength="140" placeholder="Street, area or postcode">
  <label for="rT">Note</label><textarea id="rT" maxlength="400" placeholder="Why should it be featured?"></textarea>
  <div class="err" id="rE"></div><button class="send" type="button" id="rS">SEND</button></div>
  <div id="recOk" class="ok hide"><b>SENT!</b>Thanks, your recommendation is in our inbox.<button class="send" type="button" id="rC">CLOSE</button></div>
</div></div>
  <div id="tap" class="hide">TAP TO FLAP</div>
</div>
<script src="landmarks.js?v=1119b"></script>
<script src="vehicles.js?v=1119"></script>
<script src="namecheck.js"></script>
<script src="sky.js?v=1119c"></script>
<script src="fest.js?v=4"></script>
<script>
(() => {
const H = 300, GY = 250, ROAD = 262;            // world: 300 units tall, pavement top at 250
const cv = document.getElementById('c'); let ctx = cv.getContext('2d');
let S = 1, W = 200, dpr = 1;
const $ = id => document.getElementById(id);
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

let OY = 0, BE = 0;
function resize() { dpr = Math.min(window.devicePixelRatio || 1, 3); cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr); S = Math.min(cv.height / H, cv.width / 250); W = cv.width / S; const extra = cv.height / S - H; BE = Math.min(Math.round(extra * .6), 190); OY = extra - BE; ctx.imageSmoothingEnabled = false; }
addEventListener('resize', resize); resize();

/* ---------- pre-render landmarks and cars once ---------- */
const M = 90, LH = 380;
const sprites = [];
function prerender() {
  LM_ORDER.forEach(k => { const L = LANDMARKS[k]; const oc = document.createElement('canvas'); oc.width = L.w + M * 2; oc.height = LH; const o = oc.getContext('2d'); o.imageSmoothingEnabled = false; L.d(o, M, LH - 6); sprites.push({ k, n: L.n, w: L.w, c: oc }); });
}
const houseSprites = [];
const HOUSE_SCALE = 1.35; // houses sized so their ground floor matches the shops built into houses
function prerenderHouses() { Object.keys(HOUSES).forEach(k => { const Hh = HOUSES[k], w = Math.round(Hh.w * HOUSE_SCALE);
  const oc = document.createElement('canvas'); oc.width = w + M * 2; oc.height = LH; const o = oc.getContext('2d'); o.imageSmoothingEnabled = false;
  window.__CHREC = []; window.drawScaled(o, Hh.d.bind(Hh), M, LH - 6, HOUSE_SCALE); const ch = window.__CHREC.map(([a, b]) => [a * HOUSE_SCALE, b * HOUSE_SCALE]); window.__CHREC = null; houseSprites.push({ k, n: '', w, c: oc, ch }); }); }
const carSprites = [];
function prerenderCars() {
  // every model in every colour; a model's weight is shared between its colours, so supercars and lorries stay rare
  VEHICLE_ORDER.forEach(k => { const V = VEHICLES[k]; V.colours.forEach(col => { const oc = document.createElement('canvas'); oc.width = (V.w + 6) * 2; oc.height = 180; const o = oc.getContext('2d'); o.scale(2, 2); window.__WREC = []; window.__GREC = []; V.d(o, 3, 86, col); const wh = window.__WREC, gl = window.__GREC; window.__WREC = window.__GREC = null;
    const d = o.getImageData(0, 0, oc.width, oc.height).data; let top = oc.height; for (let y = 0; y < oc.height && top === oc.height; y++) for (let x = 0; x < oc.width; x++) if (d[(y * oc.width + x) * 4 + 3] > 40) { top = y; break; }
    carSprites.push({ k, wh, gl, lb: V.lb, w: V.w, c: oc, flip: null, gy: 172, ht: (172 - top) / 2, wt: V.weight / V.colours.length, sp: V.speed }); }); });
  carSprites.forEach(s => { const f = document.createElement('canvas'); f.width = s.c.width; f.height = s.c.height; const o = f.getContext('2d'); o.translate(f.width, 0); o.scale(-1, 1); o.drawImage(s.c, 0, 0); o.setTransform(1, 0, 0, 1, 0, 0);
    if (VEHICLES[s.k].fixMirror) { o.scale(2, 2); VEHICLES[s.k].fixMirror(o, 3, 86, f.width / 2); } s.flip = f; });
}

/* ---------- the kabootar (pigeon) ---------- */
const OUT = '#1b1a24';
const PIG_GOLD = { o: '#3a2808', h: '#e8b830', e: '#f08a2a', k: '#1b1a24', c: '#fff6c8', b: '#7a5a10', n: '#ffe066', p: '#ffcf40', l: '#f8dc78', g: '#e2ad2a', d: '#c8901c', t: '#9a6a10', f: '#ffb08a', w: '#fff0b0', K: '#6a4a08' };
let golden = false; const moments = new Set();
const MOMENT = { golden: 'GOLDEN KABOOTAR', chase: 'POLICE CHASE', crash: 'SPIN-OUT CRASH', headon: 'HEAD-ON CRASH', snow: 'REAL LUTON SNOW', storm: 'THUNDERSTORM' };
const moment = k => { if (state === 'play' || state === 'ready') moments.add(k); };
const PIG_COL = { o: '#1b1a24', h: '#7f899e', e: '#f08a2a', k: '#1b1a24', c: '#eef0f4', b: '#3a3d44', n: '#4fa36a', p: '#8a5fb0', l: '#c3cad8', g: '#9aa3b5', d: '#7d8698', t: '#5a6476', f: '#e88a7a', w: '#d4dae4', K: '#2e3442' };
const PIG_BODY = [
  '...................ooo...',
  '..................ohhhoo.',
  '..................ohekhho',
  '.................oohhhhcbb',
  '...ooooooooooooonnhhhooo.',
  '..otlllllllllllnnnhho....',
  '.ottgglllllllllppnno.....',
  'oKttggggggggggppnnno.....',
  'oKttgggggggggggppgo......',
  '.ooKdgggggggggggggo......',
  '...odddgggggggggggo......',
  '....oodddddddddddo.......',
  '......ooooffoffoo........'];
const PIG_WINGS = [[
  '.oooo.......',
  'owwwwoo.....',
  '.oggwwwoo...',
  '..oKgggwwo..',
  '...ogKKggwo.',
  '....oggKKggo'], [
  'oooooooooo..',
  'owwwwwwwwwoo',
  'oggggggggggo',
  'oKKKgKKKgggo',
  '.ogggggggoo.',
  '..ooooooo...'], [
  'oooooooooo..',
  'owwwwwwwwwoo',
  '.oggggggggo.',
  '..oKKgKKgo..',
  '...oggggo...',
  '....oggo....',
  '.....oo.....']];
function drawPigeon(x, y, rot, frame) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const paint = (rows, ox, oy) => rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const ch = r[i]; if (ch === '.') continue; ctx.fillStyle = (golden ? PIG_GOLD : PIG_COL)[ch]; ctx.fillRect(ox + i, oy + j, 1, 1); } });
  paint(PIG_BODY, -13, -7);
  // neck feathers catch the light: a slow green/purple shimmer
  { const sh = (Math.sin(performance.now() / 260 + x * .02) + 1) / 2; ctx.fillStyle = sh > .5 ? 'rgba(140,255,190,' + ((sh - .5) * .7).toFixed(2) + ')' : 'rgba(210,150,255,' + ((.5 - sh) * .7).toFixed(2) + ')'; ctx.fillRect(2, -3, 3, 2); ctx.fillRect(3, -1, 2, 2); }
  let scarfOn = 0;
  if (!golden && window.SKY) { const w = SKY.cur.rain, sn = Math.max(SKY.cur.snow, SKY.snowAcc * .8);
    if (w > .25 && sn < .2) { ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fillRect(-6, -3, 1, 1); ctx.fillRect(-1, -2, 1, 1); ctx.fillRect(6, -6, 1, 1); ctx.fillStyle = 'rgba(30,40,60,.18)'; ctx.fillRect(-11, -2, 18, 3); }   // wet: glints and darker damp feathers
    if (sn > .2 || MATCH) scarfOn = 1; }
  paint(PIG_WINGS[frame], -8, [-9, -4, -3][frame]);
  if (scarfOn) {   // knitted red scarf: wrapped round the neck, knot at the front, a long striped tail streaming and waving behind
    const t = performance.now() / 110, LT = !!MATCH, RD = LT ? '#f47920' : '#d42a2a', RL = LT ? '#ff9a3c' : '#ee4a3a', DK = LT ? '#b8560f' : '#8e1717', WH = LT ? '#22336e' : '#f4f2ec';   // Luton orange and navy on match days
    for (let i = 11; i >= 0; i--) { const tx = 2 - i, ty = -3 + Math.round(Math.sin(t - i * .6) * i * .16 - i * .55), st = Math.floor(i / 2) % 2;   // tail streaming behind
      ctx.fillStyle = OUT; ctx.fillRect(tx, ty - 1, 1, 4); ctx.fillStyle = st ? WH : RD; ctx.fillRect(tx, ty, 1, 2);
      if (i === 11) { ctx.fillStyle = st ? WH : RD; ctx.fillRect(tx - 1, ty - 1, 1, 1); ctx.fillRect(tx - 1, ty + 2, 1, 1); } }   // frayed end
    ctx.fillStyle = OUT; ctx.fillRect(2, -4, 7, 5);
    for (let k = 0; k < 5; k++) { ctx.fillStyle = k % 2 ? RD : RL; ctx.fillRect(3 + k, -3, 1, 3); }   // knitted ribs
    ctx.fillStyle = WH; ctx.fillRect(3, -2, 5, 1);
    const sw = Math.round(Math.sin(t * .8) * .6); ctx.fillStyle = OUT; ctx.fillRect(6 + sw, 0, 3, 4); ctx.fillStyle = RD; ctx.fillRect(7 + sw, 0, 1, 2); ctx.fillStyle = WH; ctx.fillRect(7 + sw, 2, 1, 1);   // short end hanging at the front
  }
  if (window.FEST && !golden) FEST.hat(ctx);   // Santa hat at Christmas
  ctx.restore();
}

/* ---------- world ---------- */
/* best score: kept in localStorage, a long-life cookie and IndexedDB, so clearing one doesn't lose it; the highest wins */
const BEST = (() => { const ck = () => { const m = document.cookie.match(/(?:^|; )fk_best=(\d+)/); return m ? +m[1] : 0; };
  const idb = (mode, val) => new Promise(res => { try { const r = indexedDB.open('flappy-kabootar', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onerror = () => res(0);
    r.onsuccess = () => { try { const tx = r.result.transaction('kv', mode), st = tx.objectStore('kv'); if (mode === 'readwrite') { st.put(val, 'best'); tx.oncomplete = () => res(val); } else { const g = st.get('best'); g.onsuccess = () => res(+g.result || 0); g.onerror = () => res(0); } } catch (e) { res(0); } }; } catch (e) { res(0); } });
  const save = v => { store.set('fk_best', v); try { document.cookie = 'fk_best=' + v + '; max-age=315360000; path=/; samesite=lax'; } catch (e) {} idb('readwrite', v); };
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {}
  return { now: () => Math.max(+store.get('fk_best', 0) || 0, ck()), save, later: () => idb('readonly') }; })();
let state = 'menu', t = 0, best = BEST.now(), score = 0, speed = 72;
BEST.later().then(v => { if (v > best) { best = v; $('bestS').textContent = best; } if (best > v) BEST.save(best); });
let SC = 0, SCi = 0;   // shared ground scroll (float + whole pixels)
let bird, pipes, lmX, lmIdx, lmQueue, cars, clouds, seen, nextPipe, flashT = 0, placeTimer = 0, dieT = 0;
$('bestS').textContent = best;

function reset() { critters.length = 0; flags.length = 0; flagT = 2; flagDue = false;
  bird = { x: Math.min(W * .32, 90), y: 130, vy: 0, frame: 0, ft: 0 };
  pipes = []; nextPipe = W + 40; score = 0; speed = 72; seen = []; smrDue = t + 30 + Math.random() * 40;
  lmQueue = []; lmX = 20; lmIdx = 0; prevHouses = 0; const at = location.hash.match(/^#at-(\w+)/); playlist = buildPlaylist(at ? at[1] : null); if (at) lmX = Math.round(W * .6);
  while (lmX < W + 600) pushLandmark();
  cars = []; vanT = 0; vanNext = 12; plane = null; bplane = null; for (let i = 0; i < 3; i++) spawnCar(Math.random() * W);
  clouds = []; for (let i = 0; i < 6; i++) clouds.push({ x: Math.random() * (W + 200), y: -OY + 20 + Math.random() * (90 + OY), s: .6 + Math.random() * .8 });
}
const ANIM_K = { townhall: 1, lutonhoo: 1, masjidali: 1, wardown: 1, wardownbridge: 1, funfair: 1 }, CHAIN = ['wardownfield', 'wardown', 'wardownbridge', 'funfair'];
/* ---------- landmark playlist: shuffled every lap, with a few rules so it feels like a real town ----------
   - set pieces stay together: Frasers → Station → Hat Factory (train), Wardown field → lake → bridge → funfair, Welcome sign → Airport
   - never more than 2 big buildings in a row, never two retail-park sheds back to back
   - houses only sometimes (none / one / two), never inside a set piece */
const BIG = new Set(['vauxhall', 'orbital', 'marshfarm', 'galaxy', 'townhall', 'stmarys', 'frasers', 'hatfactory', 'chaiiwala', 'masjid', 'masjidali', 'gurdwara', 'inspire', 'tesco', 'currys', 'bandq', 'matalan', 'lidl', 'jdgyms', 'bigyellow', 'grandbazar', 'lewsey', 'venue', 'chiltern', 'uob', 'sixthform', 'stockwood', 'foodbank', 'airport', 'funfair']);
const SHED = new Set(['orbital', 'tesco', 'currys', 'bandq', 'matalan', 'lidl', 'jdgyms', 'bigyellow', 'grandbazar']);
const SETS = [['frasers', 'station', 'hatfactory'], ['wardownfield', 'wardown', 'wardownbridge', 'funfair'], ['welcome', 'airport']];
let playlist = [], lastUnit = null;
function buildPlaylist(startKey) {
  const inSet = new Set(SETS.flat()), units = SETS.map(u => u.slice()).concat(sprites.map(s => s.k).filter(k => !inSet.has(k) && k !== 'smr').map(k => [k]));
  for (let i = units.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [units[i], units[j]] = [units[j], units[i]]; }
  if (startKey) { const i = units.findIndex(u => u.includes(startKey)); if (i > 0) units.unshift(units.splice(i, 1)[0]); }
  const out = []; let prev = lastUnit, bigRun = 0;
  const ok = u => { const first = u[0], last = prev ? prev[prev.length - 1] : null;
    if (last && SHED.has(last) && SHED.has(first)) return false;
    if (BIG.has(first) && bigRun >= 2) return false;
    if (prev && prev === lastUnit && out.length === 0 && u.join() === (lastUnit || []).join()) return false; return true; };
  while (units.length) { let i = units.findIndex(ok); if (i < 0) i = 0; const u = units.splice(i, 1)[0]; out.push(u);
    const endBig = BIG.has(u[u.length - 1]); bigRun = endBig ? (u.length > 1 ? 1 : bigRun + 1) : 0; prev = u; }
  lastUnit = out[out.length - 1]; return out.flat().map(k => sprites.find(s => s.k === k)).filter(Boolean);
}
const nextSprite = () => { if (!playlist.length) playlist = buildPlaylist(); return playlist.shift(); };
const peekSprite = () => { if (!playlist.length) playlist = buildPlaylist(); return playlist[0]; };
const inSameSet = (a, b) => SETS.some(u => { const i = u.indexOf(a); return i >= 0 && u[i + 1] === b; });
let prevHouses = 0;
// the SMR billboard building isn't in the shuffle: it turns up on its own, roughly every 2 minutes of play
var smrDue = 0;
const DRYC = (h, b) => window.SKY && SKY.dryCol ? SKY.dryCol(h, b) : h;   // grass dries out a little more each week through the winter (sky.js S.dry)
/* Luton Town match days (League One 2026/27, H = Kenilworth Road). Dates can move for TV; cup ties aren't listed. ?match=H / ?match=A to preview */
const LTFC = 'H:2026-11-28,2026-12-12,2026-12-26,2027-01-09,2027-01-16,2027-01-30,2027-02-06,2027-02-20,2027-03-06,2027-03-20,2027-03-26,2027-04-03,2027-04-13,2027-04-24,2027-05-08;A:2026-11-21,2026-12-01,2026-12-19,2026-12-29,2027-01-01,2027-01-19,2027-01-23,2027-02-09,2027-02-13,2027-02-27,2027-03-13,2027-03-29,2027-04-10,2027-04-17,2027-04-27,2027-05-01';
const MATCH = (() => { const f = new URLSearchParams(location.search).get('match'); if (f) return f.toUpperCase() === 'A' ? 'A' : 'H';
  const d = new Date(), ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  for (const part of LTFC.split(';')) { const [k, list] = part.split(':'); if (list.split(',').includes(ds)) return k; } return ''; })();
// fans only walk to the ground in the run-up to kick-off: from 2½ hours before until 15 minutes after (kick-off 3pm at weekends and bank holidays, 7:45pm midweek); ?match=H shows them any time
const FANS_NOW = (() => { if (MATCH !== 'H') return false; if (new URLSearchParams(location.search).get('match')) return true; const d = new Date(), wd = d.getDay(), ds = (d.getMonth() + 1) + '-' + d.getDate(),
  ko = wd === 0 || wd === 6 || ds === '12-26' || ds === '1-1' ? 15 : 19.75, h = d.getHours() + d.getMinutes() / 60; return h >= ko - 2.5 && h <= ko + .25; })();
function pushLandmark() { let sp; if (state === 'play' && t >= smrDue && (sp = sprites.find(s => s.k === 'smr'))) smrDue = t + 70; else sp = nextSprite(); const nx = peekSprite(); lmQueue.push({ sp, x: lmX, passed: false });
  const chain = inSameSet(sp.k, nx.k) && CHAIN.includes(sp.k), tight = inSameSet(sp.k, nx.k) || sp.k === 'station' || nx.k === 'station';
  lmX += Math.round(sp.w + (chain ? 0 : tight ? 10 : 18 + Math.random() * 16)); lmIdx++;
  if (tight) return;
  // houses now and then: none 40%, one 40%, two 20% (never three gaps of nothing in a row, never houses twice in a row more than twice)
  let r = Math.random(), n = r < .4 ? 0 : r < .8 ? 1 : 2; if (prevHouses >= 2 && n) n = 0;
  if (sp.k === 'oak' || nx.k === 'oak') n = 0;   // the Oak Stand house is bigger than the terraces, so never put houses next to it
  prevHouses = n ? prevHouses + 1 : 0;
  for (let i = 0; i < n; i++) { const h = houseSprites[Math.floor(Math.random() * houseSprites.length)]; lmQueue.push({ sp: h, x: lmX, passed: true, house: true }); lmX += Math.round(h.w + 6 + Math.random() * 10); }
  if (n) lmX += 12; }
let lastCarK = '';
let vanT = 0, vanNext = 12, plane = null, bplane = null;
const BANNER_ON = false;   // Donner Rush banner plane over Currys: switched off 18 Nov (owner); set true to bring it back (code kept below)
/* banner plane: text drawn once at 4x, then waved slice by slice behind a small propeller plane */
const BANNER = (() => { const txt = 'DONNER RUSH \u00b7 NOW AT CURRYS', k = 4, o = document.createElement('canvas'), g = o.getContext('2d'), B = { c: o, w: 10, h: 15, k };
  // size it from the real font each time it's drawn (Silk may load after the first draw)
  const draw = () => { g.font = '700 34px Silk'; B.w = Math.ceil(g.measureText(txt).width / k) + 18; o.width = B.w * k; o.height = B.h * k; g.imageSmoothingEnabled = false;
    g.fillStyle = '#1b1a24'; g.fillRect(0, 0, o.width, o.height); g.fillStyle = '#fff6e0'; g.fillRect(k, k, o.width - 2 * k, o.height - 2 * k);
    g.fillStyle = '#e3261c'; g.fillRect(k, k, o.width - 2 * k, k); g.fillRect(k, o.height - 2 * k, o.width - 2 * k, k);
    g.font = '700 34px Silk'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillStyle = '#1b1a24'; g.fillText(txt, o.width / 2, o.height / 2 + k * .5); };
  draw(); if (document.fonts) { document.fonts.ready.then(draw); document.fonts.load('700 8px Silk').then(draw).catch(() => {}); } return B; })();
function drawBannerPlane(px, py, d) { const c = ctx, B = BANNER;
  // tow rope then the waving banner behind (to the right of) the plane
  const bx = px - 46 - B.w; c.strokeStyle = '#3a3a40'; c.lineWidth = .6; c.beginPath(); c.moveTo(px - 34, py + 1); c.lineTo(bx + B.w, py + 1 + Math.sin(t * 7) * .6); c.stroke();
  for (let i = 0; i < B.w; i += 2) { const fromRope = B.w - i, oy = Math.sin(t * 6 + i * .07) * 2 * Math.min(1, fromRope / 30); c.drawImage(B.c, i * B.k, 0, 2 * B.k, B.h * B.k, bx + i, py - B.h / 2 + 1 + oy, 2, B.h); }
  // the plane, facing right: red and white with a spinning propeller
  const R2 = (col, x, y, w, h) => { c.fillStyle = col; c.fillRect(px - (x + w) * 1.4, py + y * 1.4, w * 1.4, h * 1.4); };   // drawn mirrored: nose to the right
  R2('#1b1a24', -1, -3, 26, 7); R2('#f4f2ec', 0, -2, 25, 5); R2('#e3261c', 0, 0, 25, 1.4); R2('#e3261c', 0, -2, 4, 5);
  R2('#1b1a24', 6, -6, 4, 4); R2('#7fb4d8', 7, -5, 2, 2);
  R2('#1b1a24', 8, 1, 10, 3); R2('#e3261c', 9, 1.5, 8, 1.6);
  R2('#1b1a24', 20, -7, 6, 6); R2('#e3261c', 21, -6, 4, 4); R2('#1b1a24', 19, 1, 7, 2); R2('#f4f2ec', 20, 1.4, 5, 1);
  R2('#1b1a24', -3, -1, 3, 2); const sp = Math.floor(t * 30) % 2; R2('rgba(60,60,70,.7)', -4, sp ? -5 : -3, 1, sp ? 10 : 6);
}
function pickCar() { const tot = carSprites.reduce((a, s) => a + s.wt, 0); for (let tries = 0; tries < 4; tries++) { let r = Math.random() * tot, s = carSprites.find(c => c.wt > 0); for (const c of carSprites) { r -= c.wt; if (r <= 0) { s = c; break; } } if (s.k !== lastCarK || tries === 3) { lastCarK = s.k; return s; } } }
function spawnCar(x, key, zoom) { const sp = key ? carSprites.find(s => s.k === key) : pickCar(), far = ROAD + 14 - GY - 1, dir = sp.ht > far ? -1 : Math.random() < .5 ? 1 : -1, lane = dir > 0 ? 0 : 1, sx = x != null ? x : (dir > 0 ? -110 : W + 20);
  if (cars.some(c => c.lane === lane && sx < c.x + c.sp.w + 14 && c.x < sx + sp.w + 14)) return;
  if (zoom && cars.some(c => c.lane === lane && (dir > 0 ? c.x < 60 : c.x > W - 60))) return;
  const quick = !zoom && Math.random() < .15;   // some drivers are just a bit quicker than the rest
  cars.push({ sp, x: sx, dir, v: zoom ? 130 + Math.random() * 110 : (sp.sp[0] + Math.random() * (sp.sp[1] - sp.sp[0])) * (quick ? 1.35 : 1), lane, zoom: !!zoom, yo: 0 }); if (zoom) SFX.zoom(sp.k === 'motorbike');
  const nc = cars[cars.length - 1]; if (EMK[sp.k] && !zoom) { nc.emerg = 1; nc.rolled = 1; nc.headRolled = 1; nc.otRolled = 1;
    if (jamT <= 0 && sp.k !== 'police' && Math.random() < .35) { nc.run = 1;   // police lights and siren only in a chase; ambulances and fire engines still go on blue-light runs
 nc.v = EMK[sp.k]; if (sp.k === 'fire') { SFX.neenaw(); SFX.airhorn(1.2); } else if (sp.k === 'ambulance') SFX.wail(); else SFX.siren(); } }
  return true; }
const EMK = { police: 108, ambulance: 96, fire: 82 };
// now and then a supercar or a motorbike flies past, flat out, with a roar and a puff of exhaust
const critters = [], flags = []; let fanCD = 0, fanOak = null, fanPass = 0, fallCD = 0, kidCD = 8 + Math.random() * 30, foxCD = 25, snowmanCD = 3, flagT = 2, flagDue = false;
window.__flag = () => { flags.push({ x: W * .7 }); }; window.__fl = () => ({ f: flags.map(f => Math.round(f.x)), flagDue, flagT: Math.round(flagT) });
window.__crit = (k, o) => { if (o) { critters.push(o); return; } if (k === 'fox') foxCD = 0; else if (k === 'kid') kidCD = 0; else snowmanCD = 0; };
const roadShut = () => !!(window.FEST && FEST.kind && FEST.kind() === 'carnival');   // carnival: road closed for the parade
let wxSndT = 0; let zoomCD = 20, crashCD = 60, otCD = 6, headCD = 120, jamT = 0, chaseCD = 90, hornT = 2;
function startChase() { const ks = ['lambo', 'f40', 'p911', 'c63', 'a45', 'rs3', 'golf', 'gwagon'], k = ks[Math.random() * ks.length | 0];
    if (spawnCar(null, k, true)) { const f = cars[cars.length - 1]; f.v = 150 + Math.random() * 50; f.flee = 1; const ps = carSprites.find(s => s.k === 'police');
      cars.push({ sp: ps, x: f.dir > 0 ? f.x - ps.w - 46 - Math.random() * 30 : f.x + f.sp.w + 46 + Math.random() * 30, dir: f.dir, v: f.v + 6, lane: f.lane, zoom: true, police: 1, run: 1, emerg: 1, yo: 0, rolled: 1, headRolled: 1 });
      chaseCD = 240 + Math.random() * 300; zoomCD = Math.max(zoomCD, 20); SFX.siren(); }
}
window.__chase = startChase; window.__em = (k, lane) => { const f = __fk(); const sp = f.carSprites.find(s => s.k === k), dir = lane === 1 ? -1 : 1; f.cars.push({ sp, x: dir > 0 ? -sp.w - 10 : f.W + 10, dir, v: EMK[k], lane: lane || 0, yo: 0, emerg: 1, run: 1, rolled: 1, headRolled: 1, otRolled: 1 }); }; const smoke = [];

function flap() { if (window.__flapT) window.__flapT.push(window.__fr);
  if (state === 'menu' || state === 'over') return;
  if (state === 'ready') { state = 'play'; $('tap').classList.add('hide'); if (window.LB && LB.startRun) LB.startRun(); }
  if (state === 'play') { bird.vy = -175; bird.frame = 0; bird.ft = 0; SFX.flap(); }
}
function start() { reset(); moments.clear(); golden = /[?&]golden=1/.test(location.search) || Math.random() < 1 / 500; state = 'ready'; if (golden) { moment('golden'); TRACK.send('golden'); setTimeout(() => { $('place').querySelector('small').textContent = 'ONLY 1 IN 500 GAMES'; $('placeN').textContent = '\u2728 GOLDEN KABOOTAR \u2728'; $('placeP').hidden = true; $('place').classList.add('on'); placeTimer = 3.5; }, 150); } TRACK.send('play'); $('place').classList.remove('on'); placeTimer = 0; $('start').classList.add('hide'); $('over').classList.add('hide'); $('score').classList.remove('hide'); scoreTxt(0); $('tap').classList.remove('hide'); }
$('go').addEventListener('click', e => { e.stopPropagation(); start(); });
$('again').addEventListener('click', e => { e.stopPropagation(); start(); });
const modalOpen = () => ['lbM', 'cardM', 'hsM', 'recM'].some(id => { const m = document.getElementById(id); return m && !m.classList.contains('hide'); });
const down = e => { if (modalOpen()) return; if (e.target.closest && e.target.closest(".btn,a,button,input,select,#pvP,#hsM,#recM,#lbM,#cardM")) return; e.preventDefault(); flap(); };
addEventListener('pointerdown', down, { passive: false });
addEventListener('keydown', e => { if (e.key === 'Escape') { ['lbM', 'cardM', 'hsM', 'recM'].forEach(id => $(id).classList.add('hide')); return; } if (modalOpen() || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return; if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); if (state === 'menu' || (state === 'over' && dieT > .6)) start(); else flap(); } });

const PRAYER_NAME = { fajr: 'FAJR', dhuhr: 'DHUHR', asr: 'ASR', maghrib: 'MAGHRIB', isha: 'ISHA' };
function showPlace(n, k) { $('place').querySelector('small').textContent = 'FLYING PAST'; $('placeN').textContent = n; const p = $('place'), pp = $('placeP');
  // passing a masjid while the adhan is playing: say which prayer is coming up
  let line = ''; if (k && MASJIDS[k] && adhanK) {   // shown to everyone, sound on or off
    const pr = SKY.prayers(new Date())[adhanK], mins = Math.ceil((pr - Date.now()) / 6e4);
    line = PRAYER_NAME[adhanK] + (mins <= 0 && mins >= -1 && !/[?&]prayer=/.test(location.search) ? ' TIME NOW' : ' TIME IS NEAR'); }
  pp.textContent = line; pp.hidden = !line; p.classList.add('on'); placeTimer = line ? 3.5 : 2.2; }

// "Places you flew past": one place at a time, sliding along on its own
const SEENC = (() => { let tm = 0, i = 0, n = 0;
  const show = list => { const el = $('seen'); clearInterval(tm); i = 0; n = list.length;
    if (!n) { el.className = 'seen one'; el.innerHTML = '<div class="tr"><div class="it">Fly further to see Luton!</div></div>'; return; }
    const items = list.map(p => '<div class="it"><span>' + p.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]) + '</span></div>').join('');
    const dots = n > 1 && n <= 24 ? '<div class="dots">' + list.map((_, k) => '<i' + (k ? '' : ' class="on"') + '></i>').join('') + '</div>' : '';
    el.className = 'seen' + (n > 1 && n <= 24 ? '' : ' one'); el.innerHTML = '<div class="tr">' + items + '</div>' + dots;
    if (n > 1) tm = setInterval(() => { if ($('over').classList.contains('hide')) { clearInterval(tm); return; } i = (i + 1) % n; el.firstChild.style.transform = 'translateX(' + (-i * 100) + '%)'; el.querySelectorAll('.dots i').forEach((d, k) => d.classList.toggle('on', k === i)); }, 1700); };
  return { show }; })(); window.SEENC = SEENC;
const feath = [];
function die(why) {
  if (state !== 'play') return; for (let i = 0; i < 7; i++) feath.push({ x: bird.x + (Math.random() - .5) * 8, y: bird.y + (Math.random() - .5) * 6, vx: (Math.random() - .5) * 60, vy: -20 - Math.random() * 30, life: 1.2 + Math.random() * .6 }); deathWhy = why || ''; if (window.__fkLog) window.__fkLog.push({why, y: bird.y, vy: bird.vy, score, pipes: pipes.map(p => [Math.round(p.x), Math.round(p.top)])}); state = 'dead'; dieT = 0; flashT = .15; SFX.hit(); if (why === 'pipe') setTimeout(() => SFX.die(), 260);
  if (score > best) { best = score; BEST.save(best); }
}
function goHome() { reset(); state = 'menu'; $('place').classList.remove('on'); placeTimer = 0; $('start').classList.remove('hide'); $('over').classList.add('hide'); $('score').classList.add('hide'); $('tap').classList.add('hide'); $('bestS').textContent = best; }
$('homeB').addEventListener('click', e => { e.stopPropagation(); goHome(); });
function showOver() {
  { const m = [...moments], el = $('mom'), cb = $('cardBig'); if (m.length) { el.innerHTML = '<b>&#127881; RARE MOMENT!</b>' + m.map(k => '<span>' + MOMENT[k] + '</span>').join('') + '<small>Not many people see this. Share your score card to prove it!</small>'; el.classList.remove('hide'); cb.innerHTML = '&#128248; SHARE YOUR RARE MOMENT'; cb.classList.add('rare'); m.forEach(k => TRACK.send('moment', 0, k)); }
    else { el.classList.add('hide'); cb.innerHTML = '&#128248; SHARE YOUR SCORE CARD'; cb.classList.remove('rare'); } }
  state = 'over'; $('why').textContent = deathWhy === 'ground' ? 'You landed on the pavement!' : 'You clipped a pipe!'; $('sc').textContent = score; $('be').textContent = best; $('bestS').textContent = best;
  SEENC.show(seen); $('over').classList.remove('hide'); $('tap').classList.add('hide');
  SFX.swoosh(); if (!window.__fkNoBoard) LB.check(score); TRACK.send('over', score, seen.length ? seen[seen.length - 1] : '');
}


/* ---------- sound effects (made in the browser, no files): flap, point, hit, fall, swoosh ---------- */
let SFXT = 0;
const SFX = (() => { let WXN = null, ac = null, on = store.get('fk_sound', 0) === 1 || /(?:^|; )fk_sound=1/.test(document.cookie), amb = null, ambKey = '';
  // iPhone: game sounds should play even with the silent switch on (like other games), as long as sound is on in the game.
  // Web Audio follows the ringer switch, so the page asks for 'playback' audio, and a silent looping <audio> keeps that mode on for older iPhones.
  let keep = null; const playback = () => { if (!on) return; try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    try { if (!keep) { const n = 4000, b = new ArrayBuffer(44 + n), v = new DataView(b), w = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
        w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, n, true); for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);
        keep = new Audio(URL.createObjectURL(new Blob([b], { type: 'audio/wav' }))); keep.loop = true; keep.setAttribute('playsinline', ''); keep.preload = 'auto'; }
      if (keep.paused) keep.play().catch(() => {}); } catch (e) {} };
  document.addEventListener('visibilitychange', () => { if (document.hidden && WXN && ac) { const T = ac.currentTime; [WXN.gR, WXN.gF, WXN.gS].forEach(g => { g.gain.cancelScheduledValues(T); g.gain.setValueAtTime(0, T); }); } if (!keep) return; if (document.hidden) keep.pause(); else if (on) playback(); });
  ['touchend', 'pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, playback, { passive: true }));
  const ctxA = () => { playback(); if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } } if (ac && ac.state === 'suspended' && !(window.OfflineAudioContext && ac instanceof OfflineAudioContext)) ac.resume(); return ac; };
  const tone = (f0, f1, dur, type = 'square', vol = .12, delay = 0) => { const a = on && ctxA(); if (!a) return; const t0 = a.currentTime + SFXT + delay, o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t0 + dur); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0008, t0 + dur); o.connect(g).connect(a.destination); o.start(t0); o.stop(t0 + dur + .02); };
  const noise = (dur, f0, f1, vol = .18, delay = 0) => { const a = on && ctxA(); if (!a) return; const t0 = a.currentTime + SFXT + delay, n = a.createBufferSource(), b = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; n.buffer = b; const fl = a.createBiquadFilter(); fl.type = 'bandpass'; fl.Q.value = 1.2; fl.frequency.setValueAtTime(f0, t0); fl.frequency.exponentialRampToValueAtTime(f1, t0 + dur); const g = a.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.001, t0 + dur); n.connect(fl).connect(g).connect(a.destination); n.start(t0); };
  const stopAmb = () => { if (!amb) return; const a = ac, g = amb.g; try { g.gain.cancelScheduledValues(a.currentTime); g.gain.setTargetAtTime(0, a.currentTime, .25); } catch (e) {} const st = amb.stop; setTimeout(st, 1200); amb = null; ambKey = ''; };
  const startAmb = k => { const a = on && ctxA(); if (!a) return; const g = a.createGain(); g.gain.value = 0; g.connect(a.destination); g.gain.setTargetAtTime(.05, a.currentTime, .4); const nodes = [], timers = [];
    const nz = () => { const n = a.createBufferSource(), b = a.createBuffer(1, a.sampleRate * 2, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; n.buffer = b; n.loop = true; return n; };
    if (k === 'train') { const n = nz(), f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260; const m = a.createGain(); m.gain.value = .35; const l = a.createOscillator(), lg = a.createGain(); l.frequency.value = 5.2; lg.gain.value = .4; l.connect(lg).connect(m.gain); n.connect(f).connect(m).connect(g); n.start(); l.start(); nodes.push(n, l);
      timers.push(setTimeout(() => { if (ambKey === 'train') { const o = a.createOscillator(), o2 = a.createOscillator(), hg = a.createGain(); o.type = o2.type = 'sawtooth'; o.frequency.value = 330; o2.frequency.value = 415; hg.gain.setValueAtTime(0, a.currentTime); hg.gain.linearRampToValueAtTime(.35, a.currentTime + .05); hg.gain.setValueAtTime(.35, a.currentTime + .7); hg.gain.linearRampToValueAtTime(0, a.currentTime + .9); const hf = a.createBiquadFilter(); hf.type = 'lowpass'; hf.frequency.value = 1400; o.connect(hf); o2.connect(hf); hf.connect(hg).connect(g); o.start(); o2.start(); o.stop(a.currentTime + 1); o2.stop(a.currentTime + 1); } }, 1200)); }
    if (k === 'plane') { const n = nz(), f = a.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = .7; f.frequency.setValueAtTime(300, a.currentTime); f.frequency.linearRampToValueAtTime(1500, a.currentTime + 6); const m = a.createGain(); m.gain.value = .6; n.connect(f).connect(m).connect(g); n.start(); const o = a.createOscillator(), og = a.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(420, a.currentTime); o.frequency.linearRampToValueAtTime(900, a.currentTime + 6); og.gain.value = .05; o.connect(og).connect(g); o.start(); nodes.push(n, o); }
    if (k === 'crowd') {   // a football crowd: a wide roar of voices that swells, the odd big cheer, a chant and claps
      const n = nz(), bp = a.createBiquadFilter(), lp = a.createBiquadFilter(), m = a.createGain(); bp.type = 'bandpass'; bp.frequency.value = 650; bp.Q.value = .5; lp.type = 'lowpass'; lp.frequency.value = 2200; m.gain.value = .75;
      const lf = a.createOscillator(), lg = a.createGain(); lf.frequency.value = .23; lg.gain.value = .45; lf.connect(lg).connect(m.gain); n.connect(bp).connect(lp).connect(m).connect(g); n.start(); lf.start(); nodes.push(n, lf);
      const voices = (notes, dur) => { const t0 = a.currentTime; notes.forEach(([f, s, d]) => { for (let v = 0; v < 7; v++) { const o = a.createOscillator(), og = a.createGain(), fo = a.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = f * (1 + (Math.random() - .5) * .035); fo.type = 'bandpass'; fo.frequency.value = 900; fo.Q.value = 1.4;
        og.gain.setValueAtTime(0, t0 + s); og.gain.linearRampToValueAtTime(.05, t0 + s + .06); og.gain.setValueAtTime(.05, t0 + s + d - .08); og.gain.linearRampToValueAtTime(0, t0 + s + d); o.connect(fo).connect(og).connect(g); o.start(t0 + s); o.stop(t0 + s + d + .05); } }); };
      const cheer = () => { const c2 = nz(), f2 = a.createBiquadFilter(), g2 = a.createGain(); f2.type = 'bandpass'; f2.frequency.value = 900; f2.Q.value = .6; g2.gain.setValueAtTime(0, a.currentTime); g2.gain.linearRampToValueAtTime(1.2, a.currentTime + .5); g2.gain.setTargetAtTime(0, a.currentTime + 1.4, .7); c2.connect(f2).connect(g2).connect(g); c2.start(); c2.stop(a.currentTime + 5); };
      const claps = () => { for (let i = 0; i < 6; i++) { const t0 = a.currentTime + i * .5, c2 = a.createBufferSource(), b = a.createBuffer(1, a.sampleRate * .08, a.sampleRate), d = b.getChannelData(0); for (let j = 0; j < d.length; j++) d[j] = (Math.random() * 2 - 1) * Math.exp(-j / (a.sampleRate * .012)); c2.buffer = b; const f2 = a.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 1500; const g2 = a.createGain(); g2.gain.value = 1.2; c2.connect(f2).connect(g2).connect(g); c2.start(t0); } };
      let step = 0; const next = () => { if (ambKey !== 'crowd') return; const r = step++ % 4;
        if (r === 0) voices([[294, 0, .45], [294, .5, .45], [330, 1, .45], [294, 1.5, .9]], 2.4); else if (r === 1) claps(); else if (r === 2) cheer(); else voices([[392, 0, .6], [330, .7, .6], [294, 1.4, 1]], 2.4);
        timers.push(setTimeout(next, 2600 + Math.random() * 1400)); }; timers.push(setTimeout(next, 700)); }
    if (k === 'fair') { const tune = [523, 659, 784, 659, 698, 880, 784, 0, 587, 698, 880, 698, 659, 784, 659, 0]; let i = 0; const play = () => { if (ambKey !== 'fair') return; const fq = tune[i++ % tune.length]; if (fq) { const o = a.createOscillator(), og = a.createGain(); o.type = 'triangle'; o.frequency.value = fq; og.gain.setValueAtTime(.5, a.currentTime); og.gain.exponentialRampToValueAtTime(.01, a.currentTime + .24); o.connect(og).connect(g); o.start(); o.stop(a.currentTime + .26); } timers.push(setTimeout(play, 230)); }; play(); }
    amb = { g, stop: () => { nodes.forEach(n => { try { n.stop(); } catch (e) {} }); timers.forEach(clearTimeout); try { g.disconnect(); } catch (e) {} } }; ambKey = k; };
  // the adhan (flappy/adhan.mp3): plays softly while a masjid is on screen at prayer time, fading in and out; everything else ambient goes quiet
  let adh = null, adhG = null, adhOn = false; const ADHAN_FROM = 31.5;   // skip the opening takbir: start at the first "Ashhadu an la ilaha illallah"
  const adhan = (want, vol) => { if (!on) want = false; if (!want && !adh) return; const a = ctxA(); if (!a) return;
    if (want && !adh) { adh = new Audio('adhan.mp3?v=1'); adh.preload = 'auto'; adh.crossOrigin = 'anonymous'; try { const src = a.createMediaElementSource(adh); adhG = a.createGain(); adhG.gain.value = 0;
      // loudspeaker on a minaret: thin horn-speaker band, a little grit, a bright honk around 1.8 kHz, and echoes off the buildings
      const hp = a.createBiquadFilter(), lp = a.createBiquadFilter(), pk = a.createBiquadFilter(), sh = a.createWaveShaper(), cv = new Float32Array(1024);
      hp.type = 'highpass'; hp.frequency.value = 380; hp.Q.value = .8; lp.type = 'lowpass'; lp.frequency.value = 3400; lp.Q.value = .9; pk.type = 'peaking'; pk.frequency.value = 1800; pk.Q.value = 1.1; pk.gain.value = 6;
      for (let i = 0; i < 1024; i++) { const v = i / 511.5 - 1; cv[i] = Math.tanh(v * 1.8) / Math.tanh(1.8); } sh.curve = cv;
      const d1 = a.createDelay(1), d2 = a.createDelay(1), g1 = a.createGain(), g2 = a.createGain(), fb = a.createGain(); d1.delayTime.value = .17; d2.delayTime.value = .41; g1.gain.value = .32; g2.gain.value = .18; fb.gain.value = .22;
      src.connect(hp); hp.connect(pk); pk.connect(sh); sh.connect(lp); lp.connect(adhG); lp.connect(d1); d1.connect(g1); g1.connect(adhG); lp.connect(d2); d2.connect(g2); g2.connect(adhG); d2.connect(fb); fb.connect(d2);
      adhG.connect(a.destination); } catch (e) { adhG = null; } }
    if (want && !adhOn) { adhOn = true; const go = () => { try { adh.currentTime = ADHAN_FROM; } catch (e) {} }; if (adh.readyState >= 1) go(); else adh.addEventListener('loadedmetadata', go, { once: true }); adh.play().catch(() => {}); }
    const g = want ? vol : 0; if (adhG) adhG.gain.setTargetAtTime(g, a.currentTime, want ? 1.4 : 2.2); else adh.volume = g;
    if (!want && adhOn) { adhOn = false; const el = adh; setTimeout(() => { if (!adhOn && el) el.pause(); }, 9000); } };
  const api = { adhan, get adhanOn() { return adhOn; }, ambient(k) { if (!on) { if (amb) stopAmb(); return; } if (k === ambKey) return; if (window.__ambLog) window.__ambLog.push(k); stopAmb(); if (k) startAmb(k); },
    // engine model: a rich harmonic engine note (periodic wave), roughened by the cylinder firing (amplitude wobble at half the note),
    // driven through soft distortion for growl, an exhaust hiss, and a filter that opens as the revs rise; pitch rises as it comes and drops as it goes (doppler)
    engine(at, D, f, vol, bike) { const a = on && ctxA(); if (!a) return; const t0 = a.currentTime + SFXT + (at || 0), N = 28, re = new Float32Array(N), im = new Float32Array(N);
      for (let h = 1; h < N; h++) im[h] = Math.pow(h, bike ? -.75 : -.9) * (h % 2 ? 1 : (bike ? .55 : .8)) * (1 + .35 * Math.sin(h * 1.7));
      const wave = a.createPeriodicWave(re, im), o = a.createOscillator(), o2 = a.createOscillator(); o.setPeriodicWave(wave); o2.setPeriodicWave(wave);
      const set = (p, k) => { p.setValueAtTime(f[0] * k, t0); p.exponentialRampToValueAtTime(f[1] * k, t0 + D * .45); p.exponentialRampToValueAtTime(f[2] * k, t0 + D); };
      set(o.frequency, 1); set(o2.frequency, 1.006);
      const am = a.createGain(), lfo = a.createOscillator(), lg = a.createGain(); am.gain.value = .65; lfo.type = 'triangle'; set(lfo.frequency, .5); lg.gain.value = .35; lfo.connect(lg); lg.connect(am.gain);
      const sh = a.createWaveShaper(), cv = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; cv[i] = Math.tanh(x * (bike ? 3.2 : 2.6)); } sh.curve = cv;
      const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.4; lp.frequency.setValueAtTime(bike ? 1200 : 700, t0); lp.frequency.exponentialRampToValueAtTime(bike ? 4200 : 2600, t0 + D * .45); lp.frequency.exponentialRampToValueAtTime(bike ? 1400 : 650, t0 + D);
      const g = a.createGain(); g.gain.setValueAtTime(vol * .04, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + D * .45); g.gain.exponentialRampToValueAtTime(vol * .03, t0 + D); g.gain.linearRampToValueAtTime(0, t0 + D + .04);
      const og = a.createGain(); og.gain.value = .5; o.connect(og); o2.connect(og); og.connect(am); am.connect(sh); sh.connect(lp); lp.connect(g); g.connect(a.destination);
      const nb = a.createBufferSource(), b = a.createBuffer(1, Math.ceil(a.sampleRate * D), a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; nb.buffer = b;
      const nf = a.createBiquadFilter(); nf.type = 'bandpass'; nf.Q.value = .9; set(nf.frequency, 4); const ng = a.createGain(); ng.gain.value = .18; nb.connect(nf); nf.connect(ng); ng.connect(am);
      [o, o2, lfo, nb].forEach(x => { x.start(t0); x.stop(t0 + D + .05); }); },
    // a car or bike flying past flat out
    zoom(bike, at) { api.engine(at, bike ? 1.6 : 1.9, bike ? [150, 265, 120] : [62, 108, 48], bike ? .16 : .2, bike); noise(1.2, 300, 1500, .03, (at || 0) + .3); },
    // two cars hitting: metal crunch, a heavy thump, then glass and bits tinkling down
    crash(at) { const a = on && ctxA(); if (!a) return; const t0 = a.currentTime + SFXT + (at || 0);
      const nb = a.createBufferSource(), b = a.createBuffer(1, Math.ceil(a.sampleRate * 1.1), a.sampleRate), d = b.getChannelData(0), sr = a.sampleRate;
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / sr * 9);
      for (let k = 0; k < 36; k++) { const p = Math.floor((.05 + Math.pow(Math.random(), 1.6) * .9) * sr), f = 3000 + Math.random() * 4500, A = .1 + Math.random() * .35; for (let i = 0; i < sr * .05 && p + i < d.length; i++) d[p + i] += Math.sin(2 * Math.PI * f * i / sr) * Math.exp(-i / sr * 90) * A; }
      nb.buffer = b; const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1600; f.Q.value = .45; const g = a.createGain(); g.gain.value = .22; nb.connect(f); f.connect(g); g.connect(a.destination); nb.start(t0);
      tone(70, 40, .35, 'sine', .3, at || 0); },
    // a quick rev when a car pulls out to overtake
    rev(bike, at) { api.engine(at, 1.1, bike ? [110, 210, 170] : [45, 82, 66], bike ? .09 : .11, bike); },
    // spin-out: tyre screech, a couple of hits as it tumbles, then the crunch when it lands
    // UK police siren: a fast two-tone yelp that rises as it comes and falls away as it goes
    siren(at) { const a = on && ctxA(); if (!a) return; const t0 = a.currentTime + SFXT + (at || 0), D = 5.5, o = a.createOscillator(), o2 = a.createOscillator(), l = a.createOscillator(), lg = a.createGain(), g = a.createGain(), f = a.createBiquadFilter();
      o.type = 'triangle'; o2.type = 'sawtooth'; l.type = 'triangle'; l.frequency.setValueAtTime(2.6, t0); l.frequency.linearRampToValueAtTime(3.4, t0 + D * .45); lg.gain.value = 340; l.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
      [o, o2].forEach(x => { x.frequency.setValueAtTime(930, t0); x.frequency.linearRampToValueAtTime(1010, t0 + D * .42); x.frequency.linearRampToValueAtTime(860, t0 + D); });
      f.type = 'lowpass'; f.frequency.value = 2600; const m = a.createGain(); m.gain.value = .25; o.connect(f); o2.connect(m); m.connect(f); f.connect(g); g.connect(a.destination);
      g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.036, t0 + D * .45); g.gain.exponentialRampToValueAtTime(.0001, t0 + D); [o, o2, l].forEach(x => { x.start(t0); x.stop(t0 + D + .05); }); },
    // ambulance wail: a slow rise and fall
    wail(at) { const a = on && ctxA(); if (!a) return; const t0 = a.currentTime + SFXT + (at || 0), D = 6, o = a.createOscillator(), o2 = a.createOscillator(), l = a.createOscillator(), lg = a.createGain(), g = a.createGain(), f = a.createBiquadFilter();
      o.type = 'triangle'; o2.type = 'square'; l.type = 'sine'; l.frequency.value = .55; lg.gain.value = 380; l.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
      [o, o2].forEach(x => { x.frequency.setValueAtTime(1050, t0); x.frequency.linearRampToValueAtTime(1110, t0 + D * .45); x.frequency.linearRampToValueAtTime(960, t0 + D); });
      f.type = 'lowpass'; f.frequency.value = 2400; const m = a.createGain(); m.gain.value = .18; o.connect(f); o2.connect(m); m.connect(f); f.connect(g); g.connect(a.destination);
      g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.033, t0 + D * .45); g.gain.exponentialRampToValueAtTime(.0001, t0 + D); [o, o2, l].forEach(x => { x.start(t0); x.stop(t0 + D + .05); }); },
    // fire engine two-tone (nee-naw)
    neenaw(at) { const a = on && ctxA(); if (!a) return; const t0 = a.currentTime + SFXT + (at || 0), D = 6.5, o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter(); o.type = 'sawtooth';
      for (let k = 0, tt = 0; tt < D; k++, tt += .55) o.frequency.setValueAtTime(k % 2 ? 640 : 790, t0 + tt);
      f.type = 'lowpass'; f.frequency.value = 1900; o.connect(f); f.connect(g); g.connect(a.destination);
      g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.03, t0 + D * .45); g.gain.exponentialRampToValueAtTime(.0001, t0 + D); o.start(t0); o.stop(t0 + D + .05); },
    // fire engine air horn: two deep blasts
    airhorn(at) { [0, .45].forEach(d => { tone(233, 228, .38, 'sawtooth', .042, (at || 0) + d); tone(294, 290, .38, 'sawtooth', .036, (at || 0) + d); }); },
    // an ordinary car horn (stuck in traffic), a short beep or two
    horn(v, at) { v = v == null ? .5 : v; const n = v < .5 ? 1 : 2, f = 380 + v * 140; for (let i = 0; i < n; i++) { tone(f, f, .18 + (v > .8 ? .35 : 0), 'square', .021, (at || 0) + i * .28); tone(f * 1.26, f * 1.26, .18 + (v > .8 ? .35 : 0), 'square', .015, (at || 0) + i * .28); } },
    skid(v) { v = v == null ? .5 : v; const a = on && ctxA(); if (!a) return; const t0 = a.currentTime + SFXT, D = .9 + v * .5, n = a.createBufferSource(), b = a.createBuffer(1, Math.ceil(a.sampleRate * D), a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      n.buffer = b; const f = a.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 9; f.frequency.setValueAtTime(1900 + v * 900, t0); f.frequency.linearRampToValueAtTime(1300 + v * 500, t0 + D); const g = a.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(.22, t0 + .06); g.gain.setValueAtTime(.2, t0 + D * .7); g.gain.exponentialRampToValueAtTime(.001, t0 + D);
      n.connect(f); f.connect(g); g.connect(a.destination); n.start(t0); n.stop(t0 + D);
      const o = a.createOscillator(), og = a.createGain(), lf = a.createOscillator(), lg = a.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(820 + v * 400, t0); o.frequency.linearRampToValueAtTime(640 + v * 260, t0 + D); lf.frequency.value = 23; lg.gain.value = 35; lf.connect(lg); lg.connect(o.frequency);
      og.gain.setValueAtTime(0, t0); og.gain.linearRampToValueAtTime(.045, t0 + .05); og.gain.exponentialRampToValueAtTime(.001, t0 + D); o.connect(og); og.connect(a.destination); o.start(t0); lf.start(t0); o.stop(t0 + D); lf.stop(t0 + D); },
    bump() { noise(.12, 900, 300, .14); tone(160, 70, .12, 'square', .05); },
    pop() { noise(.35, 2500, 600, .025); }, bang() { noise(.5, 1800, 120, .07); noise(.9, 6000, 3000, .02, .08); },   // New Year fireworks: rocket hiss, crackling burst
    // a voice going "ow!" (a kid higher, a lad lower): a buzzy voice through two moving formant filters, pitch falling, a little wobble
    ow(p, at, long) { const a = on && ctxA(); if (!a) return; const t0 = a.currentTime + SFXT + (at || 0), D = long ? .75 : .42, f0 = p || 420;
      const o = a.createOscillator(), vib = a.createOscillator(), vg = a.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0 * 1.15, t0); o.frequency.linearRampToValueAtTime(f0 * 1.3, t0 + .06); o.frequency.exponentialRampToValueAtTime(f0 * .7, t0 + D);
      vib.frequency.value = 7; vg.gain.value = f0 * .03; vib.connect(vg); vg.connect(o.frequency);
      const mk = (fa, fb, q, gv) => { const f = a.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = q; f.frequency.setValueAtTime(fa, t0); f.frequency.linearRampToValueAtTime(fb, t0 + D); const g = a.createGain(); g.gain.value = gv; o.connect(f); f.connect(g); return g; };
      const env = a.createGain(); env.gain.setValueAtTime(0, t0); env.gain.linearRampToValueAtTime(.07, t0 + .04); env.gain.setValueAtTime(.065, t0 + D * .55); env.gain.exponentialRampToValueAtTime(.001, t0 + D);
      mk(f0 > 330 ? 850 : 700, f0 > 330 ? 520 : 430, 5, 1).connect(env); mk(f0 > 330 ? 1350 : 1150, f0 > 330 ? 950 : 800, 7, .55).connect(env); env.connect(a.destination);
      o.start(t0); vib.start(t0); o.stop(t0 + D + .05); vib.stop(t0 + D + .05); },
    thud(v) { v = v == null ? .5 : v; if (v > .6) { noise(.6, 6000, 3500, .04, .12); tone(880, 700, .3, 'square', .015, .1); } noise(.3 + v * .25, 1200 + v * 500, 160, .22); tone(120, 45, .3, 'triangle', .16); tone(420, 300, .25, 'square', .03, .02); tone(610, 520, .35, 'square', .02, .05); noise(.5, 5000, 3000, .03, .08); },
    flap: () => noise(.09, 900, 2400, .13), point: () => { tone(988, 988, .09, 'square', .07); tone(1319, 1319, .22, 'square', .07, .08); }, hit: () => { noise(.12, 600, 150, .26); tone(180, 60, .14, 'triangle', .2); }, die: () => tone(720, 140, .45, 'square', .06), swoosh: () => noise(.28, 400, 3000, .1),
    render(seq, secs) { const pa = ac, po = on, A = new OfflineAudioContext(1, Math.ceil(44100 * secs), 44100); ac = A; on = true;
      try { seq.forEach(([t, k, x]) => { SFXT = t; api[k](x); }); } finally { SFXT = 0; ac = pa; on = po; } return A.startRendering().then(b => b.getChannelData(0)); },
    // weather sounds: rain (light patter to a downpour), a soft breeze in fog, a muffled hush in snow; kept low under everything else
    weather(r, fog, sn) { const a = on && !document.hidden && ctxA(); if (!a || (a instanceof (window.OfflineAudioContext || Object) && a !== ac)) return;
      if (!WXN) { if (!(r > .02 || fog > .02 || sn > .02)) return; const sr = a.sampleRate, L = sr * 4, mk = fn => { const b = a.createBuffer(1, L, sr), d = b.getChannelData(0); fn(d, sr); const n = a.createBufferSource(); n.buffer = b; n.loop = true; return n; };
        const rain = mk((d, sr) => { let lp = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; lp += (w - lp) * .08; d[i] = (w - lp) * .5 + lp * .25; }
          for (let k = 0; k < 4 * 900; k++) { const p = Math.floor(Math.random() * (d.length - 400)), f = 1500 + Math.random() * 4500, A = Math.pow(Math.random(), 2.5) * .9, dk = 600 + Math.random() * 900; for (let i = 0; i < 300; i++) d[p + i] += Math.sin(2 * Math.PI * f * i / sr) * Math.exp(-i / sr * dk) * A; } });
        const wind = mk(d => { let lp = 0, lp2 = 0; for (let i = 0; i < d.length; i++) { lp += ((Math.random() * 2 - 1) - lp) * .03; lp2 += (lp - lp2) * .2; d[i] = (lp - lp2) * 6; } });
        const hush = mk(d => { let lp = 0; for (let i = 0; i < d.length; i++) { lp += ((Math.random() * 2 - 1) - lp) * .015; d[i] = lp * 5; } });
        const hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 600; const gR = a.createGain(), gF = a.createGain(), gS = a.createGain(); [gR, gF, gS].forEach(g => { g.gain.value = 0; g.connect(a.destination); });
        rain.connect(hp).connect(gR); wind.connect(gF); hush.connect(gS); [rain, wind, hush].forEach(n => n.start()); WXN = { gR, gF, gS, nodes: [rain, wind, hush] }; }
      const T = a.currentTime; WXN.gR.gain.setTargetAtTime(.05 * Math.min(1, r), T, .8); WXN.gF.gain.setTargetAtTime(.022 * Math.min(1, fog), T, 1); WXN.gS.gain.setTargetAtTime(.014 * Math.min(1, sn), T, 1); },
    weatherOff() { if (!WXN || !ac) return; const T = ac.currentTime; [WXN.gR, WXN.gF, WXN.gS].forEach(g => { g.gain.cancelScheduledValues(T); g.gain.setTargetAtTime(0, T, .2); }); },
    // thunder: a crack when it's close, then a long low rumble rolling away
    thunder(at, near) { const a = on && ctxA(); if (!a) return; const t0 = a.currentTime + SFXT + (at || 0), sr = a.sampleRate, D = 3.4, b = a.createBuffer(1, Math.ceil(sr * D), sr), d = b.getChannelData(0); let lp = 0;
      for (let i = 0; i < d.length; i++) { const t = i / sr; lp += ((Math.random() * 2 - 1) - lp) * .02; const env = Math.min(1, t / .08) * Math.exp(-t * 1.1) * (1 + .5 * Math.sin(t * 7 + Math.sin(t * 3) * 2)); d[i] = lp * 9 * env + (near && t < .25 ? (Math.random() * 2 - 1) * Math.exp(-t * 18) * .5 : 0); }
      const n = a.createBufferSource(); n.buffer = b; const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = near ? 900 : 380; const g = a.createGain(); g.gain.value = near ? .16 : .11; n.connect(f).connect(g).connect(a.destination); n.start(t0); },
    get on() { return on; }, toggle() { on = !on; store.set('fk_sound', on ? 1 : 0); try { document.cookie = 'fk_sound=' + (on ? 1 : 0) + '; max-age=315360000; path=/; samesite=lax'; } catch (e) {} if (on) { ctxA(); api.point(); } else { stopAmb(); api.weatherOff(); if (keep) keep.pause(); } return on; } };
  addEventListener('pointerdown', () => ctxA(), { once: true }); return api; })();
window.SFX = SFX;
const muteUI = on => document.querySelectorAll('.mute').forEach(m => { m.classList.toggle('on', on); m.querySelector('.muteT').textContent = on ? 'SOUND ON' : 'SOUND OFF'; });
muteUI(SFX.on);
document.querySelectorAll('.mute').forEach(m => m.addEventListener('click', e => { e.stopPropagation(); const on = SFX.toggle(); if (on) TRACK.send('sound_on'); muteUI(on); const t = $('shT'); t.textContent = on ? 'SOUND ON' : 'SOUND OFF'; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 1300); }));

/* ---------- leaderboard: today + all time (online on the SMR website, this phone only elsewhere) ---------- */
const LB = (() => { const api = 'api.php'; let run = '', runFor = ''; const startRun = () => { run = ''; fetch(api + '?a=run', { method: 'POST' }).then(r => r.json()).then(j => { if (j && j.run) run = j.run; }).catch(() => {}); }; let online = null, data = { today: [], all: [] }, tab = 'today', top = 10;
  // the device remembers the player: name + a random player id (localStorage, with a cookie copy). Forget = asked again.
  const ck = k => { const m = document.cookie.match(new RegExp('(?:^|; )' + k + '=([^;]*)')); return m ? decodeURIComponent(m[1]) : ''; };
  const keep = (k, v) => { store.set(k, v); try { document.cookie = k + '=' + encodeURIComponent(v) + '; max-age=315360000; path=/; samesite=lax'; } catch (e) {} };
  let name = store.get('fk_name', '') || ck('fk_name'), pid = store.get('fk_pid', '') || ck('fk_pid');
  if (name && !pid) { pid = Math.random().toString(36).slice(2, 14); keep('fk_pid', pid); }
  const day = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
  const localLoad = () => { let l = []; try { l = JSON.parse(localStorage.getItem('fk_board') || '[]'); } catch (e) {} const d = day();
    const best = rows => { const m = new Map(); rows.forEach(r => { const k = r.pid || r.name + r.score; if (!m.has(k) || m.get(k).score < r.score) m.set(k, { name: r.name, score: r.score, mine: !!pid && r.pid === pid }); }); return [...m.values()].sort((a, b) => b.score - a.score).slice(0, 50); };
    data = { today: best(l.filter(r => r.day === d)), all: best(l) }; return l; };
  const load = () => fetch(api + '?a=board&pid=' + encodeURIComponent(pid || ''), { cache: 'no-store' }).then(r => { if (!r.ok) throw 0; return r.json(); }).then(j => { if (!j || !j.today) throw 0; online = true; data = j; render(); }).catch(() => { online = false; localLoad(); render(); });
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const render = () => { const rows = (data[tab] || []).slice(0, top); $('lbL').innerHTML = rows.length ? rows.map((r, i) => '<li' + (r.mine ? ' class="me"' : '') + '><i>' + (i + 1) + '</i><span>' + esc(r.name) + (r.mine ? ' <em>YOU</em>' : '') + '</span><b>' + r.score + '</b></li>').join('') : '<li><span style="text-align:center;color:#8a7a5a">No scores yet. Be the first!</span></li>';
    const me = (data[tab] || []).findIndex(r => r.mine);
    $('lbN').textContent = (me >= top ? 'You are #' + (me + 1) + '. ' : '') + (online ? (tab === 'today' ? 'Resets at midnight.' : 'Best ever in Luton.') : 'Scores saved on this phone.');
    document.querySelectorAll('#lbM .tabs button').forEach(b => b.classList.toggle('on', b.dataset.lb === tab)); document.querySelectorAll('#lbM .tops button').forEach(b => b.classList.toggle('on', +b.dataset.top === top)); };
  const rankOf = (list, sc) => { if (sc < 1) return 0; const others = list.filter(r => !r.mine); let i = others.findIndex(r => sc > r.score); if (i < 0) i = others.length; return i < 50 ? i + 1 : 0; };
  const myBest = list => { const r = list.find(r => r.mine); return r ? r.score : 0; };
  // optional UK mobile for prizes: 07 + 9 more digits, spaces allowed
  const ukMob = v => { const d = String(v || '').replace(/[\s-]/g, ''); return d === '' ? '' : /^07\d{9}$/.test(d) ? d : null; };
  let phoneSet = !!(store.get('fk_phone', '') || ck('fk_phone')), prizeAsked = false;
  const snoozed = () => { const t = +(store.get('fk_przno', '') || ck('fk_przno') || 0); return t && Date.now() - t < 14 * 864e5; };
  const contact = (nm, ph) => fetch(api + '?a=contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pid, name: nm, phone: ph }) }).then(r => r.json()).then(j => { if (j.error) throw new Error(j.error); return j; });
  const prizeAsk = () => { if (prizeAsked || phoneSet || !name || !pid || snoozed() || online === false) return; prizeAsked = true;
    $('pzN').value = name; $('pzP').value = ''; $('pzE').textContent = ''; $('przF').classList.remove('hide'); $('przOk').classList.add('hide'); setTimeout(() => $('przM').classList.remove('hide'), 900); };
  const prizeSave = () => { const nm = $('pzN').value.trim().replace(/\s+/g, ' ').slice(0, 14), ph = ukMob($('pzP').value);
    if (!nm) { $('pzE').textContent = 'Type your name first.'; return; } if (!/^[\p{L}\p{N} ._'-]+$/u.test(nm)) { $('pzE').textContent = 'Letters and numbers only, please.'; return; }
    if (window.NameCheck && NameCheck.bad(nm)) { $('pzE').textContent = "That name isn't allowed."; return; }
    if (ph === null) { $('pzE').textContent = 'Use a UK mobile: 11 digits starting 07, e.g. 07123 456789.'; return; }
    $('pzS').disabled = true; const chg = nm !== name;
    (chg ? submit(nm, 0, true) : Promise.resolve()).then(() => contact(nm, ph)).then(() => { if (chg) { name = nm; keep('fk_name', nm); render(); } if (ph) { phoneSet = true; keep('fk_phone', '1'); } else keep('fk_przno', String(Date.now()));
      $('pzS').disabled = false; $('przF').classList.add('hide'); $('przOk').classList.remove('hide'); })
      .catch(err => { $('pzS').disabled = false; $('pzE').textContent = err && err.message && !/fetch/i.test(err.message) ? err.message : 'Could not save. Check your signal.'; }); };
  $('pzS').addEventListener('click', e => { e.stopPropagation(); prizeSave(); });
  const prizeClose = e => { e.stopPropagation(); $('przM').classList.add('hide'); if (!phoneSet) keep('fk_przno', String(Date.now())); };
  $('pzX').addEventListener('click', prizeClose); $('pzC').addEventListener('click', e => { e.stopPropagation(); $('przM').classList.add('hide'); }); $('przM').querySelector('.x').addEventListener('click', prizeClose);
  ['pzN', 'pzP'].forEach(i => $(i).addEventListener('keydown', e => e.stopPropagation())); $('przM').addEventListener('click', e => e.stopPropagation());
  let pending = 0, renaming = false;
  const submit = (nm, sc, rename) => {
    if (online) return fetch(api + '?a=score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nm, score: sc, pid, rename: rename ? 1 : 0, run: runFor, phone: rename ? '' : (ukMob($('nbP').value) || '') }) }).then(r => r.json()).then(j => { if (j.error) throw new Error(j.error); data = j; return j; });
    const l = localLoad(); if (rename) l.forEach(r => { if (r.pid === pid) r.name = nm; }); else l.push({ name: nm, score: sc, day: day(), pid }); try { localStorage.setItem('fk_board', JSON.stringify(l.sort((a, b) => b.score - a.score).slice(0, 200))); } catch (e) {} localLoad(); return Promise.resolve(data); };
  const title = sc => { const rt = rankOf(data.today, sc), ra = rankOf(data.all, sc); return ra === 1 ? '\u{1F3C6} NEW ALL-TIME HIGH SCORE!' : ra && ra <= 10 ? '\u{1F3C6} #' + ra + ' OF ALL TIME!' : rt === 1 ? '\u{1F3C6} TOP SCORE TODAY!' : rt ? '\u{1F3C6} #' + rt + ' TODAY!' : ra ? '\u{1F3C6} #' + ra + ' OF ALL TIME!' : ''; };
  const showSaved = sc => { $('nbT').textContent = title(sc) || '\u{1F3C6} ON THE LEADERBOARD!'; $('nbS').innerHTML = 'Saved as <span class="nbn">' + esc(name) + '</span><br><a href="#" id="nbChg">Not you? Change name</a>'; $('nameBox').classList.add('saved'); $('nameBox').classList.remove('hide');
    $('nbChg').onclick = e => { e.preventDefault(); e.stopPropagation(); renaming = true; $('nbS').textContent = 'Change the name on your scores'; $('nbI').value = name; $('nameBox').classList.remove('saved'); $('nameBox').classList.add('ren'); $('nbI').focus(); }; };
  const check = sc => { runFor = run; $('nameBox').classList.add('hide'); $('nameBox').classList.remove('saved', 'ren'); $('nbE').textContent = ''; pending = 0; renaming = false; if (sc < 1) return;
    const go = () => { const rt = rankOf(data.today, sc), ra = rankOf(data.all, sc); if (!rt && !ra) return;
      if (name) { if (sc <= myBest(data.today) && sc <= myBest(data.all)) return; // nothing new to save
        const t = title(sc); submit(name, sc).then(() => { TRACK.send('name', sc); $('nbT').textContent = t; render(); showSaved(sc); $('nbT').textContent = t || $('nbT').textContent; }).catch(() => {}); return; }
      pending = sc; $('nbT').textContent = title(sc); $('nbS').textContent = 'Put your name on the leaderboard. We’ll remember it on this phone.'; $('nbI').value = ''; $('nameBox').classList.remove('hide'); };
    load().then(go).then(() => { if (name) prizeAsk(); }); };
  const ren0 = () => renaming;
  const save = () => { const nm = $('nbI').value.trim().replace(/\s+/g, ' ').slice(0, 14); if (!pending && !renaming) return; if (!nm) { $('nbE').textContent = 'Type your name first.'; return; }
    if (!/^[\p{L}\p{N} ._'-]+$/u.test(nm)) { $('nbE').textContent = 'Letters and numbers only, please.'; return; }
    if (window.NameCheck && NameCheck.bad(nm)) { $('nbE').textContent = "That name isn't allowed. Please use your real name or a nickname."; $('nbI').select(); return; }
    if (!ren0() && ukMob($('nbP').value) === null) { $('nbE').textContent = 'Mobile is optional, but use a UK one: 11 digits starting 07.'; return; }
    if (!pid) { pid = Math.random().toString(36).slice(2, 14); keep('fk_pid', pid); }
    $('nbB').disabled = true; const sc = pending, ren = renaming;
    submit(nm, sc, ren).then(() => { name = nm; keep('fk_name', nm); if (!ren && ukMob($('nbP').value)) { phoneSet = true; keep('fk_phone', '1'); } $('nbP').value = ''; if (!ren) TRACK.send('name', sc); $('nbB').disabled = false; pending = 0; renaming = false; $('nbE').textContent = ''; tab = data.today.some(r => r.mine) ? 'today' : 'all'; render(); showSaved(sc); if (!ren) $('lbM').classList.remove('hide'); })
      .catch(err => { $('nbE').textContent = err && err.message && !/fetch/i.test(err.message) ? err.message : 'Could not save. Check your signal.'; $('nbB').disabled = false; }); };
  $('nbB').addEventListener('click', e => { e.stopPropagation(); save(); }); $('nbI').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') save(); });
  document.querySelectorAll('.lbB').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); TRACK.send('lb_open'); load(); render(); $('lbM').classList.remove('hide'); }));
  document.querySelectorAll('#lbM .tabs button').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); tab = b.dataset.lb; render(); }));
  document.querySelectorAll('#lbM .tops button').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); top = +b.dataset.top; render(); }));
  $('lbM').querySelector('.x').addEventListener('click', e => { e.stopPropagation(); $('lbM').classList.add('hide'); });
  $('lbM').addEventListener('pointerdown', e => { e.stopPropagation(); if (e.target === $('lbM')) $('lbM').classList.add('hide'); });
  load(); return { check, load, startRun, get online() { return online; } }; })(); window.LB = LB;


/* ---------- always the latest version, also when saved to the Home Screen ----------
   version.json is rewritten on every deploy; when it changes the page reloads itself (straight away on the menu,
   or right after the current game ends), with a cache-busting query so the phone fetches the new HTML. */
(() => { const BUILD = '11190114'; let pending = false;
  const go = () => { let last = 0; try { last = +sessionStorage.getItem('fk_upd_t') || 0; } catch (e) {} if (Date.now() - last < 60000) return;   // never loop: at most one reload a minute
    try { sessionStorage.setItem('fk_upd_t', String(Date.now())); } catch (e) {} location.replace(location.pathname + '?u=' + Date.now() + location.hash); };
  const check = () => fetch('version.json?ts=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(j => {
    if (!j || !j.v || j.v === BUILD || BUILD.startsWith('__')) return; pending = true; if (typeof state === 'undefined' || state !== 'play') go(); }).catch(() => {});
  setInterval(() => { if (pending && state !== 'play') go(); }, 1500);
  setInterval(check, 60000); document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); }); window.addEventListener('pageshow', check); window.addEventListener('focus', check); check(); })();
/* ---------- score card picture ---------- */
(() => { let blob = null;
  const make = () => { const c = document.createElement('canvas'); c.width = 1080; c.height = 1350; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    const g = x.createLinearGradient(0, 0, 0, 1350); g.addColorStop(0, '#2f8fd8'); g.addColorStop(.62, '#8fd0f2'); g.addColorStop(1, '#f3c46a'); x.fillStyle = g; x.fillRect(0, 0, 1080, 1350);
    x.fillStyle = 'rgba(255,255,255,.9)'; [[90, 160, 1.6], [760, 120, 1.2], [600, 300, .9]].forEach(([cx, cy, s]) => { x.fillRect(cx, cy + 18 * s * 3, 120 * s * 3 / 3 * 3 / 3, 24 * s); x.fillRect(cx + 18 * s, cy + 6 * s, 54 * s, 36 * s); x.fillRect(cx + 54 * s, cy, 42 * s, 42 * s); });
    const last = seen.length ? seen[seen.length - 1] : '', sp = (window.__cardK && sprites.find(p => p.k === window.__cardK)) || sprites.find(p => p.n === last) || sprites[0], k = Math.min(2.6, 1040 / (sp.w + 20)) * (sp.k === 'spudkingz' ? 1.35 : 1);   // Spud Kingz is a small trailer: a bit bigger on the card
    x.drawImage(sp.c, 540 - (sp.w / 2 + M) * k, 1350 - 120 - (LH - 6) * k, sp.c.width * k, LH * k);
    x.fillStyle = '#c9c4b8'; x.fillRect(0, 1230, 1080, 120); x.fillStyle = '#1b1a24'; x.fillRect(0, 1226, 1080, 6);
    const sv = ctx; ctx = x; x.save(); x.translate(540, 420); x.scale(11, 11); drawPigeon(0, 0, -0.18, 0); x.restore(); ctx = sv;
    const box = (y, h) => { x.fillStyle = '#1b1a24'; x.fillRect(110, y + 10, 860, h); x.fillStyle = '#f6efd8'; x.fillRect(100, y, 860, h); x.strokeStyle = '#1b1a24'; x.lineWidth = 8; x.strokeRect(100, y, 860, h); };
    x.textAlign = 'center'; x.textBaseline = 'top';
    x.font = '700 64px Silk'; x.fillStyle = '#1b1a24'; x.fillText('FLAPPY', 543, 63); x.fillStyle = '#fff'; x.fillText('FLAPPY', 540, 60);
    x.font = '700 104px Silk'; x.fillStyle = '#1b1a24'; x.fillText('KABOOTAR', 546, 136); x.fillStyle = '#e8641c'; x.fillText('KABOOTAR', 543, 133); x.fillStyle = '#ffd84a'; x.fillText('KABOOTAR', 540, 130);
    box(560, 300); x.fillStyle = '#6a5a3a'; x.font = '700 34px Silk'; x.fillText('I SCORED', 530, 590); x.fillStyle = '#1b1a24'; x.font = '120px PS'; x.fillText(String(score), 530, 644);
    x.font = '600 34px -apple-system,Segoe UI,Roboto,sans-serif'; x.fillStyle = '#6a5a3a'; x.fillText(last ? 'and flew past ' + last : 'flying through Luton', 530, 795);
    x.fillStyle = '#1b1a24'; x.fillRect(240, 890, 600, 70); x.fillStyle = '#ffd84a'; x.font = '700 30px Silk'; x.fillText('CAN YOU BEAT ME?', 540, 910);
    x.fillStyle = '#1b1a24'; x.font = '600 30px -apple-system,Segoe UI,Roboto,sans-serif'; x.fillText('Play free: smrgraphics.co.uk/flappykabootar', 540, 1275);
    if (golden) { x.lineWidth = 26; x.strokeStyle = '#e8b830'; x.strokeRect(13, 13, 1054, 1324); x.lineWidth = 6; x.strokeStyle = '#fff3b0'; x.strokeRect(30, 30, 1020, 1290); }
    const ms = [...moments]; if (ms.length) { x.save(); x.translate(820, 470); x.rotate(-.18); const lab = MOMENT[ms[0]], w = Math.max(330, lab.length * 22 + 60);
      x.fillStyle = '#1b1a24'; x.fillRect(-w / 2 + 8, -58, w, 128); x.fillStyle = '#ffd84a'; x.fillRect(-w / 2, -66, w, 128); x.lineWidth = 6; x.strokeStyle = '#1b1a24'; x.strokeRect(-w / 2, -66, w, 128);
      x.fillStyle = '#b2410e'; x.font = '700 30px Silk'; x.fillText('RARE MOMENT!', 0, -52); x.fillStyle = '#1b1a24'; x.font = '700 ' + (lab.length > 14 ? 30 : 36) + 'px Silk'; x.fillText(lab, 0, -6); x.restore(); }
    return c; };
  $('cardBig').addEventListener('click', e => { e.stopPropagation(); $('cardB').click(); });
  $('cardB').addEventListener('click', e => { e.stopPropagation(); TRACK.send('card', score); const c = make(); $('cardI').src = c.toDataURL('image/png'); c.toBlob(b => { blob = b; }, 'image/png'); $('cardM').classList.remove('hide'); });
  $('cardS').addEventListener('click', async e => { e.stopPropagation(); if (!blob) return; TRACK.send('card_save', score); const f = new File([blob], 'flappy-kabootar-score.png', { type: 'image/png' });
    try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: 'Flappy Kabootar', text: '\u{1F426} I scored ' + score + ' on Flappy Kabootar! Can you beat me? ' + (/smrgraphics|smrdigital/.test(location.host) ? 'https://smrgraphics.co.uk/flappykabootar' : location.href.split('#')[0]) }); return; } } catch (x) { if (x && x.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = f.name; document.body.appendChild(a); a.click(); a.remove(); });
  $('cardM').querySelector('.x').addEventListener('click', e => { e.stopPropagation(); $('cardM').classList.add('hide'); });
  $('cardM').addEventListener('pointerdown', e => { e.stopPropagation(); if (e.target === $('cardM')) $('cardM').classList.add('hide'); });
})();


/* ---------- analytics (first-party, sent to api.php on the SMR site) + owner settings ---------- */
const TRACK = (() => {
  let vid = store.get('fk_vid', ''); if (!vid) { vid = Math.random().toString(36).slice(2, 12); store.set('fk_vid', vid); }
  const ua = navigator.userAgent, app = !!(matchMedia('(display-mode: standalone)').matches || navigator.standalone);
  const dev = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ? 'ipad' : /iPhone|iPod/.test(ua) ? 'iphone' : /Android/.test(ua) ? 'android' : /Windows|Macintosh|Linux|CrOS/.test(ua) ? 'desktop' : 'other';
  let src = ''; try { src = sessionStorage.getItem('fk_src') || ''; } catch (e) {}
  if (!src) { const q = new URLSearchParams(location.search), tag = (q.get('s') || q.get('src') || q.get('utm_source') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 20);
    const ref = document.referrer ? (() => { try { return new URL(document.referrer).hostname; } catch (e) { return ''; } })() : '';
    src = tag || (/Instagram/.test(ua) ? 'ig' : /FBAN|FBAV|FB_IAB/.test(ua) ? 'fb' : /musical_ly|TikTok|Bytedance/i.test(ua) ? 'tt' : /Snapchat/.test(ua) ? 'sc' : /WhatsApp/i.test(ua) ? 'wa'
      : /smrgraphics|smrdigital/.test(ref) && ref !== location.hostname ? 'site' : /smrgraphics|smrdigital/.test(ref) ? 'site' : /google\./.test(ref) ? 'google' : /instagram/.test(ref) ? 'ig' : /facebook|fb\.com/.test(ref) ? 'fb' : /t\.co|twitter|x\.com/.test(ref) ? 'x' : /tiktok/.test(ref) ? 'tt' : ref ? 'other' : 'direct');
    if (ref && ref === location.hostname && !tag) src = 'site'; try { sessionStorage.setItem('fk_src', src); } catch (e) {} }
  const send = (ev, val, extra) => { try { const body = JSON.stringify({ ev, vid, src, dev, app: app ? 1 : 0, val: val || 0, extra: extra || '' });
    if (navigator.sendBeacon) navigator.sendBeacon('api.php?a=ev', new Blob([body], { type: 'application/json' })); else fetch('api.php?a=ev', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {}); } catch (e) {} };
  send('visit'); window.TRACK_SEND = send; document.querySelectorAll('.pw').forEach(a => a.addEventListener('click', () => send('smr')));
  fetch('api.php?a=cfg', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(c => { if (!c || typeof c !== 'object') return; try { SKY.cfg(c); } catch (e) {}
    // owner's banner: a written notice or an uploaded picture, on the home screen and/or the end screen
    { const mode = c.banner_mode || (c.notice ? 'text' : 'off'), txt = c.banner_text || c.notice || '', lk = c.banner_link || '', wh = c.banner_where || 'both';
      const fill = el => { el.innerHTML = ''; let inner;
        if (mode === 'image' && c.banner_v) { inner = document.createElement('img'); inner.src = 'api.php?a=banner&v=' + c.banner_v; inner.alt = txt || 'Banner'; inner.decoding = 'async'; if (c.banner_ratio) inner.style.aspectRatio = c.banner_ratio; }
        else if (mode === 'text' && txt) { inner = document.createElement('div'); inner.className = 'bt' + (lk ? ' lk' : ''); inner.textContent = txt; }
        else { el.hidden = true; return; }
        if (lk) { const a = document.createElement('a'); a.href = lk; a.target = '_blank'; a.rel = 'noopener'; a.addEventListener('click', e => { e.stopPropagation(); send('ban', 0, el.id); }); a.appendChild(inner); el.appendChild(a); } else el.appendChild(inner);
        el.hidden = false; el.addEventListener('click', e => e.stopPropagation()); };
      if (wh !== 'over') fill($('ban1')); else $('ban1').hidden = true;
      if (wh !== 'home') fill($('ban2')); else $('ban2').hidden = true; }
    document.body.classList.toggle('off-lb', c.show_leaderboard === false); document.body.classList.toggle('off-rec', c.show_recommend === false);
    GAP = c.difficulty === 'easy' ? 96 : c.difficulty === 'hard' ? 74 : 84; window.__fkNoBoard = c.show_leaderboard === false; }).catch(() => {});
  return { send };
})();
window.TRACK = TRACK;

/* ---------- in-game score: hand-drawn pixel digits, white with a dark outline, every number clear (open-top 4) ---------- */
const DIG = { 0: ['01110','10001','10001','10001','10001','10001','01110'], 1: ['00100','01100','00100','00100','00100','00100','01110'], 2: ['01110','10001','00001','00110','01000','10000','11111'],
  3: ['11110','00001','00001','01110','00001','00001','11110'], 4: ['10001','10001','10001','11111','00001','00001','00001'], 5: ['11111','10000','11110','00001','00001','10001','01110'],
  6: ['01110','10000','10000','11110','10001','10001','01110'], 7: ['11111','00001','00010','00100','01000','01000','01000'], 8: ['01110','10001','10001','01110','10001','10001','01110'],
  9: ['01110','10001','10001','01111','00001','00001','01110'] };
function scoreTxt(v) { const s = String(v), cv2 = $('scoreC'); if (!cv2) return; const U = 4, cols = s.length * 14 - 4 + 4, rows = 14 + 5, d = Math.min(3, window.devicePixelRatio || 1);
  const g = []; for (let y = 0; y < rows; y++) g.push(new Uint8Array(cols));
  [...s].forEach((ch, i) => (DIG[ch] || DIG[0]).forEach((r, y) => [...r].forEach((b, x) => { if (b === '1') for (let a = 0; a < 2; a++) for (let c = 0; c < 2; c++) g[2 + y * 2 + a][2 + i * 14 + x * 2 + c] = 2; })));
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (g[y][x] !== 2) { let o = 0; for (let a = -1; a <= 1; a++) for (let c = -1; c <= 1; c++) { const r = g[y + a]; if (r && r[x + c] === 2) o = 1; } if (o) g[y][x] = 1; }
  for (let y = rows - 1; y > 0; y--) for (let x = 0; x < cols; x++) if (!g[y][x] && g[y - 1][x]) g[y][x] = 3;   // drop shadow, one step down
  cv2.width = cols * U * d; cv2.height = rows * U * d; cv2.style.width = cols * U + 'px'; cv2.style.height = rows * U + 'px';
  const x2 = cv2.getContext('2d'); x2.scale(U * d, U * d);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const k = g[y][x]; if (!k) continue; x2.fillStyle = k === 2 ? (g[y + 1] && g[y + 1][x] !== 2 ? '#e2ddcf' : '#ffffff') : '#1b1a24'; x2.fillRect(x, y, 1, 1); } }
scoreTxt(0); window.scoreTxt = scoreTxt;
/* ---------- update ---------- */
let GAP = 84; const PW = 30; let deathWhy = ''; window.__fk = () => ({ flap, spawnCar, setScore: v => { score = v; }, sprites, cars, carSprites, buildPlaylist, lmQueue, state, score, bird, pipes, W, OY, lm: lmQueue.map(l => l.sp.k) });
function update(dt) {
  t += dt;
  const moving = state === 'play' || state === 'ready' || state === 'menu';
  const v = moving ? speed : 0;
  SKY.tick(dt, t, v, W, OY, H, BE, GY, ROAD);
  while (clouds.length < SKY.cloudN) clouds.push({ x: W + 20 + Math.random() * 120, y: -OY + 20 + Math.random() * (90 + OY), s: .6 + Math.random() * .8 });
  if (clouds.length > SKY.cloudN) { const i = clouds.findIndex(cl => cl.x < -40 || cl.x > W + 10); if (i >= 0) clouds.splice(i, 1); }
  clouds.forEach(cl => { cl.x -= v * .12 * cl.s * dt + (moving ? 0 : 0); if (cl.x < -60) { cl.x = W + 20 + Math.random() * 60; cl.y = -OY + 20 + Math.random() * (90 + OY); } });
  // landmarks scroll at 45% speed (parallax)
  // one shared scroll for buildings, pavement, road markings, grass and cars: whole pixels only, so they all move together
  SC += v * .45 * dt; const step = Math.floor(SC) - SCi; SCi += step; lmQueue.forEach(l => l.x -= step); lmX -= step;
  while (lmQueue.length && lmQueue[0].x + lmQueue[0].sp.w < -420) lmQueue.shift();
  while (lmX < W + 600) pushLandmark();
  if (state === 'play') lmQueue.forEach(l => { if (!l.passed && l.sp.n && l.x + l.sp.w / 2 < bird.x) { l.passed = true; if (!seen.includes(l.sp.n)) seen.push(l.sp.n); showPlace(l.sp.n, l.sp.k); } });
  // cars drive both ways on the road
  // no driving through each other: a faster car slows to the speed of the one in front
  const LD = (H - 3) - (ROAD + 14);   // distance between the two lanes
  cars.forEach(c => { let ahead = null, gap = 1e9; cars.forEach(o => { if (o === c || (o.crash && !o.crash.road) || (o.lane !== c.lane && !(o.crash && o.crash.road)) || (o.ot && o.ot.out > .5)) return; const d = c.dir > 0 ? o.x - (c.x + c.sp.w) : c.x - (o.x + o.sp.w); if (d > -4 && d < gap) { gap = d; ahead = o; } });
    if (!c.ot && !c.emerg && jamT <= 0 && ahead && gap < 40 && ((c.zoom && !(c.police && ahead.flee)) || (c.v > (ahead.cv || ahead.v) + 6 && !c.otRolled && (c.otRolled = 1) && otCD <= 0 && Math.random() < .3)) && c.sp.w < 90) {
      // only if the other lane is clear for a good way ahead
      // time to get past = distance to cover / how much faster we go; anything coming the other way closes in at both speeds
      const vo = c.zoom ? c.v : Math.max(c.v, (ahead.cv || ahead.v) + 34) * 1.35, rel = Math.max(20, vo - (ahead.cv || ahead.v)), Tp = (gap + ahead.sp.w + c.sp.w + 30) / rel + .9;
      const need = vo * Tp + 40, x0 = c.dir > 0 ? c.x - 10 : c.x - need, x1 = c.dir > 0 ? c.x + c.sp.w + need : c.x + c.sp.w + 10;
      const clear = !cars.some(o => { if (o === c || o.crash) return false; if (o.lane === c.lane && !(o.ot && o.ot.out > .2)) return false;
        const reach = o.dir === c.dir ? 0 : (o.cv || o.v) * Tp;    // how far an oncoming car travels while we're out there
        return c.dir > 0 ? o.x < x1 + reach && o.x + o.sp.w > c.x - 10 : o.x + o.sp.w > x0 - reach && o.x < c.x + c.sp.w + 10; });
      if (!c.crash && clear) { c.ot = { out: 0, past: ahead }; if (!c.zoom) otCD = 18 + Math.random() * 25; if (!c.zoom && c.x > -40 && c.x < W + 40) SFX.rev(c.sp.k === 'motorbike'); }
    }
    if (c.crash) return;
    if (c.ot) { const o = c.ot; if (!o.abort && !o.force && o.out > .2) { const fx = c.dir > 0 ? c.x + c.sp.w : c.x; if (cars.some(q => q !== c && !q.crash && q.lane !== c.lane && (c.dir > 0 ? q.x > fx - 4 && q.x < fx + 70 : q.x + q.sp.w < fx + 4 && q.x + q.sp.w > fx - 70))) o.abort = true; }
      if (o.abort) { o.out = Math.max(0, o.out - dt * 3); c.yo = (c.lane === 0 ? 1 : -1) * LD * (o.out * o.out * (3 - 2 * o.out)) * .92; c.cv = Math.min(c.v, (o.past.cv || o.past.v)) * .8; if (o.out <= 0) { c.ot = null; c.yo = 0; } return; }
      const passed = !cars.includes(o.past) || (c.dir > 0 ? c.x > o.past.x + o.past.sp.w + 14 : c.x + c.sp.w < o.past.x - 14);
      o.out = Math.max(0, Math.min(1, o.out + (passed ? -dt * 2.2 : dt * 2.4))); c.yo = (c.lane === 0 ? 1 : -1) * LD * (o.out * o.out * (3 - 2 * o.out)) * .92;
      if (o.force && o.out > .55) { const q = cars.find(q => q !== c && !q.crash && q.lane !== c.lane && c.x < q.x + q.sp.w && q.x < c.x + c.sp.w);   // recordings: an overtake that meets an oncoming car
        if (q) { const hit = (car, sp) => { car.crash = { t: 0, rot: 0, st: 'hit', road: true, spin: sp, v0: car.cv || car.v, len: .35, ty: car.yo, fire: car === c, snd: .9 }; car.ot = null; };
          hit(c, 1.6); hit(q, -1.2); SFX.crash(); SFX.thud(1); SFX.bump(); jamT = 45; const cx = c.x + c.sp.w / 2; cars.forEach(k => { if (!k.crash) k.free = k.dir > 0 ? k.x > cx : k.x + k.sp.w < cx; }); return; } }
      c.cv = (c.zoom ? c.v : Math.max(c.v, (o.past.cv || o.past.v) + 34) * 1.35); if (passed && o.out <= 0) { c.ot = null; c.yo = 0; } return; }
    // traffic jam after a crash on the road: everyone who hasn't got past it queues up and waits, then pulls away again
    let tg = ahead && gap < 26 ? Math.min(c.v, ahead.crash ? 0 : ahead.cv != null ? ahead.cv : ahead.v) * (gap < 10 ? .85 : 1) : c.v;
    if (jamT > 0 && !c.free && !ahead && c.x > -10 && c.x + c.sp.w < W + 10 && (c.dir > 0 ? c.x > W * .25 : c.x < W * .75)) tg = 0;
    if (c.drift) tg = c.v; if (c.pull) tg *= 1 - .65 * c.pull; if (c.run && !c.crash) tg = c.v * (c.out > .5 || !ahead ? 1 : .55);
    c.cv = c.cv == null ? tg : c.cv + (tg - c.cv) * Math.min(1, dt * (tg < c.cv ? 5 : 1.1)); if (ahead && gap < 3 && !(c.run && c.out > .4)) c.cv = Math.min(c.cv, ahead.cv || 0); });
  // very rarely a fast driver on the near side loses it: spins across onto the verge (sometimes ends up on its roof)
  // blue lights: cars ahead (and oncoming) slow and tuck in to the kerb; the emergency vehicle goes down the middle and back into its lane
  const RUN = cars.filter(e => e.run && !e.crash);
  cars.forEach(c => { if (c.run || c.crash || c.drift) return; let near = false;
    RUN.forEach(e => { const dd = e.lane === c.lane ? (c.dir > 0 ? c.x - (e.x + e.sp.w) : e.x - (c.x + c.sp.w)) : (e.dir > 0 ? c.x - (e.x + e.sp.w) : e.x - (c.x + c.sp.w)); if (dd > -c.sp.w - e.sp.w && dd < (e.lane === c.lane ? 150 : 110)) near = true; });
    c.pull = (c.pull || 0) + ((near ? 1 : 0) - (c.pull || 0)) * Math.min(1, dt * 2.5); if (c.pull < .01) c.pull = 0; if (!c.ot && c.pull) c.yo = (c.lane === 0 ? -1 : 1) * 3.5 * c.pull; });
  RUN.forEach(e => { if (e.police && e.zoom) return; const blk = cars.some(o => o !== e && !o.crash && o.lane === e.lane && (() => { const g = e.dir > 0 ? o.x - (e.x + e.sp.w) : e.x - (o.x + o.sp.w); return g > -o.sp.w && g < 70; })());
    e.out = (e.out || 0) + ((blk ? 1 : 0) - (e.out || 0)) * Math.min(1, dt * 2); e.yo = (e.lane === 0 ? 1 : -1) * LD * .5 * e.out; });
  // stuck in a jam: now and then someone leans on the horn
  if (jamT > 0 && jamT < 60) { hornT -= dt; if (hornT <= 0) { hornT = 1.5 + Math.random() * 4; SFX.horn(Math.random()); } }
  // very rarely (about 1 in 60 speeding drivers, and never twice close together) a car on the near side loses it and ends up on the verge.
  // every one is a bit different: flat spin, roll onto the roof, onto its side or a sideways slide; where it stops; the sounds; sometimes a small fire
  // a fox trots along the pavement now and then at night; snowmen appear on the verge once snow has settled
  foxCD -= dt; if (moving && foxCD <= 0) { foxCD = 60 + Math.random() * 90; if (SKY.n > .6 && !critters.some(c => c.k === 'fox')) { const d = Math.random() < .5 ? -1 : 1; critters.push({ k: 'fox', x: d < 0 ? W + 20 : -24, d, v: 14 + Math.random() * 8, y: GY + 4 + Math.random() * 3, ph: 0, stop: Math.random() < .5 ? 1.5 + Math.random() * 2 : 0, stopAt: W * (.3 + Math.random() * .4) }); } }
  // kids whizzing along the pavement on kick scooters, either way, on their own or in a little group: at random, but at least once a minute (not late at night)
  fallCD -= dt; kidCD -= dt; if (moving && kidCD <= 0) { kidCD = 12 + Math.random() * 46; if (SKY.n < .85 && !critters.some(c => c.k === 'kid')) { const d = Math.random() < .5 ? -1 : 1, n = Math.random() < .45 ? 1 : Math.random() < .7 ? 2 : 3, v = 46 + Math.random() * 30;
    const TOPS = ['#d42a2a', '#2a6fd8', '#f2c43a', '#1e2024', '#3fae3a', '#e85ca8', '#7a7f87', '#f07a12'], DECK = ['#2fb8e8', '#e8302a', '#9bd832', '#f4f2ec', '#b05ae0', '#1e2024'], SK = ['#8a5a3a', '#c58c5c', '#e8c4a0', '#5a3a24'];
    const faller = Math.random() < 1 / 30 || window.__kidFall ? Math.random() * n | 0 : -1; window.__kidFall = 0; for (let i = 0; i < n; i++) critters.push({ k: 'kid', fallAt: i === faller ? W * (.3 + Math.random() * .35) : null, d, x: (d < 0 ? W + 20 : -30) - d * i * (22 + Math.random() * 18), v: v * (.9 + Math.random() * .22), y: GY + 6 + (i % 2) * 3 + Math.random() * 2, ph: Math.random() * 6, top: TOPS[Math.random() * TOPS.length | 0], deck: DECK[Math.random() * DECK.length | 0], skin: SK[Math.random() * SK.length | 0], hel: Math.random() < .55 ? TOPS[Math.random() * TOPS.length | 0] : null, leg: Math.random() < .5 ? '#2a3a5a' : '#1e2024', s: .85 + Math.random() * .25 }); } }
  // home match days, in the hours before kick-off: Luton fans (mostly orange, some navy, hats and scarves) walking to Kenilworth Road.
  // Before the Oak Stand comes on screen they're heading right towards it; around it there are big crowds going in; after it's passed they come from the other way
  if (FANS_NOW && moving) { const oak = lmQueue.find(l => l.sp.k === 'oak' && l.x + l.sp.w > -40); if (oak) fanOak = oak; else if (fanOak && !fanPass) fanPass = t;
    if (oak && oak.x + oak.sp.w < -40 && !fanPass) fanPass = t;
    const phase = oak ? (oak.x > W + 20 ? 'pre' : 'at') : fanPass && t - fanPass < 14 ? 'post' : ''; fanCD -= dt;
    if (phase && fanCD <= 0) { const big = phase === 'at'; fanCD = big ? .22 + Math.random() * .35 : .8 + Math.random() * .9;
      const fromL = phase === 'pre' ? true : phase === 'post' ? false : Math.random() < (oak.x > W * .45 ? .75 : .3), n = big ? 2 + (Math.random() * 3 | 0) : 1 + (Math.random() * 2 | 0), f = (window.SCALE && SCALE.oak) || 1;
      const SKC = ['#8a5a3a', '#c58c5c', '#e8c4a0', '#5a3a24', '#f0d0b0'], LEG = ['#2a3a5a', '#1e2024', '#5a5f6e', '#3a4a6a'];
      for (let i = 0; i < n; i++) { const navy = Math.random() < .18, hr = Math.random();
        critters.push({ k: 'fan', d: fromL ? 1 : -1, x: (fromL ? -14 : W + 14) - (fromL ? 1 : -1) * i * (9 + Math.random() * 8), y: GY + 5 + Math.random() * 6, v: 20 + Math.random() * 10, ph: Math.random() * 6, oak: oak || null, door: [45, 85, 85, 126][Math.random() * 4 | 0] * f / .82,
          shirt: navy ? '#22336e' : '#f47920', trim: navy ? '#f47920' : '#22336e', skin: SKC[Math.random() * SKC.length | 0], leg: LEG[Math.random() * LEG.length | 0],
          hat: hr < .3 ? 'bob' : hr < .42 ? 'cap' : '', scarf: Math.random() < .4, fist: Math.random() < .3, s: .92 + Math.random() * .16 }); } } }
  for (let i = critters.length - 1; i >= 0; i--) { const c = critters[i]; if (c.k !== 'fan') continue;
    if (c.inT != null) { c.inT += dt; if (c.inT > .45) { critters.splice(i, 1); continue; } }
    else if (c.oak && lmQueue.includes(c.oak) && c.oak.x < W + 40) { const dx = c.oak.x + c.door - c.x; if (Math.abs(dx) < 2.5) c.inT = 0; else { c.d = dx > 0 ? 1 : -1; c.x += c.d * c.v * dt; } }
    else c.x += c.d * c.v * dt;   // stadium still ahead (or behind): keep walking that way
    c.ph += dt * 1.6; }
  snowmanCD -= dt; if (moving && snowmanCD <= 0) { snowmanCD = 14 + Math.random() * 20; if (SKY.snowAcc > .6 && BE > 30) critters.push({ k: 'snowman', x: W + 30, y: H + 14 + BE * (.3 + Math.random() * .3), s: .8 + Math.random() * .4, hat: Math.random() < .5, scarf: ['#e8641c', '#d42a2a', '#2a6fd8'][Math.random() * 3 | 0] }); }
  for (let i = critters.length - 1; i >= 0; i--) { const c = critters[i]; if (c.k === 'kid') { const f = c.f;
      if (!f && c.fallAt != null && (c.d > 0 ? c.x > c.fallAt : c.x < c.fallAt)) { if (fallCD > 0) c.fallAt = null; else { fallCD = 150; c.f = { t: 0, v0: c.v, sx: 0, sv: c.v * .8 }; SFX.bump(); SFX.ow(440 + Math.random() * 120, .35, Math.random() < .4); } }   // clips the kerb and goes over
      if (c.f) { const F = c.f; F.t += dt;
        if (F.t < 3.4) { c.v = Math.max(0, F.v0 * (1 - F.t / .45)); F.sv = Math.max(0, F.sv - dt * 70); F.sx += c.d * F.sv * dt; if (!F.th && F.t > .3) { F.th = 1; SFX.thud(.2); } }
        else { if (!F.up) { F.up = 1; c.x += F.sx; F.sx = 0; } c.v = 16; c.walk = 1; }   // picks the scooter up and walks it off
      }
      c.x += c.d * c.v * dt; c.ph += dt * (c.walk ? 1.4 : 2.2); c.dist = (c.dist || 0) + (c.walk ? 0 : c.v * dt / 1.7); } else if (c.k === 'fox') { const stopping = c.stop > 0 && Math.abs(c.x - c.stopAt) < 3; if (stopping) { c.stop -= dt; c.ph = 0; } else { c.x += c.d * c.v * dt; c.ph += dt * c.v * .35; } }
    c.x -= moving ? step : 0; if (c.x < (c.k === 'kid' ? -140 : -60) || c.x > W + (c.k === 'kid' ? 140 : 80)) critters.splice(i, 1); }
  // a tall flagpole with the Palestine flag comes past about every 30 seconds
  if (moving) { flagT -= dt; if (flagT <= 0) { flagT = 30; flagDue = true; } }
  // the pole gets its own space: the first gap between two buildings just off screen is widened and the flag stands in the middle of it, never over a building
  if (flagDue && !window.__noFlag) for (let i = 0; i < lmQueue.length - 1; i++) { const a = lmQueue[i], b = lmQueue[i + 1], gs = a.x + a.sp.w; if (gs < W + 10) continue;
    if (inSameSet(a.sp.k, b.sp.k) || (LANDMARKS[a.sp.k] && LANDMARKS[a.sp.k].lawn) || (LANDMARKS[b.sp.k] && LANDMARKS[b.sp.k].lawn)) continue;
    const g = b.x - gs, add = 80; for (let j = i + 1; j < lmQueue.length; j++) lmQueue[j].x += add; lmX += add; flags.push({ x: Math.round(gs + (g + add - 60) / 2) }); flagDue = false; break; }
  for (let i = flags.length - 1; i >= 0; i--) { flags[i].x -= moving ? step : 0; if (flags[i].x < -120) flags.splice(i, 1); }
  otCD -= dt; crashCD -= dt; headCD -= dt; if (jamT > 0) { jamT -= dt; if (jamT <= 0) cars.forEach(c => c.free = 0); }
  if (moving && ((headCD <= 0 && jamT <= 0) || window.__headOn)) cars.forEach(c => { if ((headCD > 0 && !window.__headOn) || c.headRolled || c.crash || c.ot || c.drift || c.sp.k === 'bike' || c.sp.k === 'moped' || c.sp.k === 'escooter' || c.sp.k === 'motorbike') return;
    const q = cars.find(o => o.lane !== c.lane && !o.crash && !o.ot && (c.dir > 0 ? o.x - (c.x + c.sp.w) : c.x - (o.x + o.sp.w)) > 50 && (c.dir > 0 ? o.x - (c.x + c.sp.w) : c.x - (o.x + o.sp.w)) < 150);
    if (!q || c.x < 0 || c.x + c.sp.w > W) return; c.headRolled = 1; if (Math.random() < (window.__headOn ? 1 : .005)) { c.drift = { q, out: 0 }; headCD = 300; } });   // window.__headOn = 1: next pair goes (for recordings)
  cars.forEach(c => { const d = c.drift; if (!d) return; const q = d.q; if (!cars.includes(q) || q.crash) { c.drift = null; c.yo = 0; return; }
    d.out = Math.min(.62, d.out + dt * .45); c.yo = (c.lane === 0 ? 1 : -1) * LD * d.out;
    if (d.out > .35 && c.x < q.x + q.sp.w && q.x < c.x + c.sp.w) {   // impact
      c.drift = null; const hit = (car, sp) => { car.crash = { t: 0, rot: 0, st: 'hit', road: true, spin: sp, v0: car.cv || car.v, len: .35, ty: car.yo, fire: window.__headOn ? true : Math.random() < .25, snd: .9 }; car.ot = null; };
      hit(c, (Math.random() < .5 ? 1 : -1) * (1 + Math.random() * 1.5)); hit(q, (Math.random() < .5 ? 1 : -1) * (.8 + Math.random() * 1.2)); q.crash.fire = false; window.__headOn = 0;
      SFX.crash(); SFX.thud(1); SFX.bump(); jamT = 45 + Math.random() * 30; const cx = c.x + c.sp.w / 2; cars.forEach(o => { if (!o.crash) o.free = o.dir > 0 ? o.x > cx : o.x + o.sp.w < cx; });
      for (let i = 0; i < 10; i++) smoke.push({ x: cx + (Math.random() - .5) * 20, y: ROAD + 14 + LD * .5 - 6, r: 2, a: .5, vx: (Math.random() - .5) * 14 }); } });
  cars.forEach(c => { if (c.rolled || c.police || c.crash || c.drift || c.ot || c.sp.w > 90 || c.sp.k === 'motorbike' || c.sp.k === 'bike' || c.sp.k === 'moped' || c.sp.k === 'escooter' || !(c.zoom || c.v > 62) || c.x < W * .35 || c.x > W * .8 || !moving) return; c.rolled = 1;
    if (crashCD > 0 || Math.random() > .017) return;
    const st = ['spin', 'roll', 'roll', 'side', 'slide'][Math.random() * 5 | 0], bike = c.sp.k === 'motorbike';
    c.crash = { t: 0, rot: 0, st: bike && st === 'roll' ? 'side' : st, spin: (Math.random() < .5 ? 1 : -1) * (st === 'slide' ? 1.6 : st === 'spin' ? 4 : 6 + Math.random() * 5), v0: c.cv || c.v, len: 1 + Math.random() * .7,
      ty: c.lane === 1 ? (BE > 26 ? 14 + BE * (.12 + Math.random() * .6) : 9) + 3 : LD * (.3 + Math.random() * .35), road: c.lane === 0, fire: Math.random() < .3, snd: Math.random() };
    crashCD = 240; SFX.skid(c.crash.snd); if (c.lane === 0) { jamT = 25 + Math.random() * 25; const cx = c.x + c.sp.w / 2; cars.forEach(o => { if (!o.crash && o !== c) o.free = o.dir > 0 ? o.x > cx : o.x + o.sp.w < cx; }); } });
  // about 1 in 30 e-scooters: the two lads lose it and go over
  cars.forEach(c => { if (c.sp.k !== 'escooter' || c.lane !== 1 || c.escRolled || c.crash || c.ot || !moving || c.x < W * .3 || c.x > W * .7) return; c.escRolled = 1; if ((Math.random() > 1 / 30 || fallCD > 0) && !window.__escFall) return; window.__escFall = 0; fallCD = 150; SFX.ow(210 + Math.random() * 40, .55, true); SFX.ow(250 + Math.random() * 40, .8, false);
    c.crash = { t: 0, rot: 0, st: 'side', spin: (c.dir > 0 ? 1 : -1) * 6, v0: c.cv || c.v, len: .8, ty: (BE > 26 ? 12 + BE * .2 : 8) + 3, road: false, fire: false, snd: Math.random() }; SFX.skid(c.crash.snd); });
  cars.forEach(c => { const k = c.crash; if (k) { k.t += dt; const sl = Math.max(0, 1 - k.t / k.len); c.cv = k.v0 * sl * sl; c.yo += (k.ty - c.yo) * Math.min(1, dt * 2.2); if (k.st === 'hit') k.rot = k.spin * .12 * Math.min(1, k.t / k.len);
      if (sl > 0) k.rot += k.spin * dt * sl; else if (!k.done) { k.done = true; SFX.thud(k.snd); }
      if (k.st !== 'slide' && k.st !== 'spin' && k.st !== 'hit') { if (!k.b1 && k.t > k.len * .35) { k.b1 = 1; SFX.bump(); } if (!k.b2 && k.t > k.len * .65) { k.b2 = 1; SFX.bump(); } }
      if (k.done && k.st !== 'hit') { const want = k.st === 'roll' ? Math.PI : k.st === 'side' ? Math.PI / 2 * Math.sign(k.spin) : 0, cur = ((k.rot % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); let dlt = want - cur; dlt = ((dlt + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; k.rot += dlt * Math.min(1, dt * 4); }
      if (k.t < (k.fire ? 9 : 4) && Math.random() < dt * (k.fire ? 18 : 14)) smoke.push({ x: c.x + c.sp.w / 2 + (Math.random() - .5) * c.sp.w * .5, y: (c.lane === 0 ? ROAD + 12 : H - 8) + c.yo, r: 2, a: k.fire ? .55 : .4, vx: (Math.random() - .5) * 8, dark: k.fire }); }
    c.x += c.dir * c.cv * dt - (moving ? step : 0); c.dist = (c.dist || 0) + c.dir * c.cv * dt; });
  // police chase now and then: a car flat out with a police car right behind, lights going and siren wailing
  chaseCD -= dt; if (moving && !roadShut() && jamT <= 0 && chaseCD <= 0 && Math.random() < dt * .02) startChase();
  if (moving && jamT <= 0 && !roadShut()) { zoomCD -= dt; if (zoomCD <= 0 && Math.random() < dt * .03) { const ks = ['lambo', 'lambo', 'f40', 'p911', 'c63', 'a45', 'motorbike', 'motorbike'], k = ks[Math.random() * ks.length | 0]; if (spawnCar(null, k, true)) zoomCD = 30 + Math.random() * 40; } }
  cars.forEach(c => { if ((c.zoom && Math.random() < dt * 30) || (c.ot && !c.zoom && c.ot.out > .1 && Math.random() < dt * 16)) { const rx = c.dir > 0 ? c.x - 1 : c.x + c.sp.w + 7, gy = (c.lane === 0 ? ROAD + 12 : H - 5) + (c.yo || 0); smoke.push({ x: rx, y: gy - 2 - Math.random() * 2, r: 1.5, a: .35, vx: -c.dir * (8 + Math.random() * 10) }); } });
  for (let i = smoke.length - 1; i >= 0; i--) { const p = smoke[i]; p.x += p.vx * dt - (moving ? step : 0); p.y -= 6 * dt; p.r += 7 * dt; p.a -= .5 * dt; if (p.a <= 0) smoke.splice(i, 1); }
  cars.forEach(c => { if (c.x + c.sp.w < 0 || c.x > W) return; if (c.police) moment('chase'); if (c.crash) moment(c.crash.st === 'hit' ? 'headon' : 'crash'); });
  if (!/[?&](wx|sky|panel|season)=/.test(location.search)) { if (SKY.cur.snow > .25) moment('snow'); if (SKY.flash > .5) moment('storm'); }
  cars = cars.filter(c => c.x > -220 && c.x < W + 220); if (roadShut()) cars.length = 0; else if (cars.length < (jamT > 0 ? 10 : 4) && Math.random() < dt * (jamT > 0 ? 2.5 : .8)) spawnCar();
  // Mr Rushed ice cream van: its own timer, roughly every 30 seconds (first one a bit sooner)
  // Mr Rushed is parked outside Currys now, so his van never drives on the road
  if (placeTimer > 0) { placeTimer -= dt; if (placeTimer <= 0) $('place').classList.remove('on'); }
  if (flashT > 0) flashT -= dt;

  if (state === 'menu' || state === 'ready') { bird.y = 130 + Math.sin(t * 4) * 6; bird.ft += dt; if (bird.ft > .12) { bird.ft = 0; bird.frame = (bird.frame + 1) % 3; } return; }
  if (state === 'over') return;

  bird.vy += 560 * dt; bird.y += bird.vy * dt;
  bird.ft += dt; if (bird.ft > (bird.vy < 0 ? .07 : .14)) { bird.ft = 0; bird.frame = (bird.frame + 1) % 3; }
  if (state === 'dead') { dieT += dt; if (bird.y > GY - 6) { bird.y = GY - 6; bird.vy = 0; } if (dieT > .8) showOver(); return; }

  speed = Math.min(108, 72 + score * 1.1);
  pipes.forEach(p => p.x -= speed * dt);
  pipes = pipes.filter(p => p.x > -PW - 10);
  nextPipe -= speed * dt;
  if (nextPipe <= W) { const n = pipes.length + score, gap = GAP + Math.max(0, 6 - score) * 3, top = 40 + Math.random() * (GY - gap - 70) * (score < 3 ? .7 : 1) + (score < 3 ? (GY - gap - 70) * .15 : 0); pipes.push({ x: W + 10, top, gap, scored: false }); nextPipe = W + 150; }
  if (bird.y < -OY + 6) { bird.y = -OY + 6; if (bird.vy < 0) bird.vy = 0; }
  if (bird.y > GY - 7) { bird.y = GY - 7; die('ground'); }
  pipes.forEach(p => {
    if (!p.scored && p.x + PW < bird.x - 8) { p.scored = true; score++; scoreTxt(score); SFX.point(); }
    if (bird.x + 6 > p.x && bird.x - 6 < p.x + PW && (bird.y - 4 < p.top || bird.y + 4 > p.top + p.gap)) die('pipe');
  });
}

/* ---------- flagpole: Palestine flag waving in the wind ---------- */
function drawFlag(f) { const X = Math.round(f.x), top = GY - 158, nk = 1 - .45 * SKY.n, wind = 1 + Math.min(1.5, (SKY.wind || 10) / 25);
  const C = (r, g, b, k) => 'rgb(' + Math.min(255, r * k * nk | 0) + ',' + Math.min(255, g * k * nk | 0) + ',' + Math.min(255, b * k * nk | 0) + ')';
  // pole: white with a shaded side, gold ball on top, concrete base
  ctx.fillStyle = C(40, 42, 50, 1); ctx.fillRect(X - 2, top - 1, 5, GY - top + 1); ctx.fillStyle = C(246, 246, 244, 1); ctx.fillRect(X - 1, top, 3, GY - top); ctx.fillStyle = C(200, 202, 206, 1); ctx.fillRect(X + 1, top, 1, GY - top);
  ctx.fillStyle = C(40, 42, 50, 1); ctx.beginPath(); ctx.arc(X + .5, top - 3, 3.4, 0, 7); ctx.fill(); ctx.fillStyle = C(232, 192, 70, 1); ctx.beginPath(); ctx.arc(X + .5, top - 3, 2.5, 0, 7); ctx.fill(); ctx.fillStyle = C(255, 236, 160, 1); ctx.fillRect(X - 1, top - 5, 1, 1);
  ctx.fillStyle = C(40, 42, 50, 1); ctx.fillRect(X - 5, GY - 4, 11, 4); ctx.fillStyle = C(178, 176, 168, 1); ctx.fillRect(X - 4, GY - 3, 9, 3);
  // flag: 72 x 36, black / white / green with the red triangle at the hoist; each column ripples, with light and shade on the folds
  const FW = 54, FH = 27, fy = top + 2;   // 25% smaller flag, same pole
  for (let i = 0; i < FW; i++) { const k = i / FW, ph = t * 5.2 * wind - i * .227, dy = Math.sin(ph) * 2.4 * k + Math.sin(ph * .55 + 1) * 1.05 * k, sh = 1 + Math.cos(ph) * .16 * Math.min(1, k * 3), x = X + 2 + i - Math.round(k * k * 2), y = fy + dy, s3 = FH / 3, droop = k * 1.5;
    ctx.fillStyle = C(20, 20, 22, sh); ctx.fillRect(x, y, 1, s3 + .5); ctx.fillStyle = C(250, 250, 250, sh); ctx.fillRect(x, y + s3, 1, s3 + .5); ctx.fillStyle = C(0, 122, 61, sh); ctx.fillRect(x, y + s3 * 2, 1, s3 + droop);
    if (k < 1 / 3) { const half = FH / 2 * (1 - k * 3); ctx.fillStyle = C(206, 17, 38, sh); ctx.fillRect(x, y + FH / 2 - half, 1, half * 2); } }
  ctx.fillStyle = C(60, 62, 70, 1); ctx.fillRect(X + 1, fy - 1, 2, 2); ctx.fillRect(X + 1, fy + FH - 1, 2, 2); }

/* ---------- little street life ---------- */
// a kid on a kick scooter: one foot on the deck, the other kicking now and then, hands on the bar, hoodie, sometimes a helmet
function drawKid(k) { const d = k.d, X = Math.round(k.x), Y = Math.round(k.y), s = k.s, F = k.f && !k.f.up ? k.f : null;
  if (F) {   // fallen: the scooter skids off on its side, the kid goes over the bars, lies there a moment, then gets up
    ctx.save(); ctx.translate(Math.round(X + F.sx + d * 14 * s), Y); ctx.scale(d * s, s); const Q = (cl, a, b, w, h) => { ctx.fillStyle = cl; ctx.fillRect(a, b, w, h); };
    Q('rgba(0,0,0,.18)', -6, 0, 22, 1); Q('#1b1a24', -6, -3, 15, 2); Q(k.deck, -5, -3, 13, 1); Q('#1b1a24', 8, -3, 12, 1.6); Q(k.deck, 9, -2.6, 10, .8); Q('#1b1a24', 19, -6, 1.6, 6); ctx.restore();
    const a = F.t < .35 ? F.t / .35 : F.t < 2.9 ? 1 : Math.max(0, 1 - (F.t - 2.9) / .5); ctx.save(); ctx.translate(X + d * (6 + a * 6) * s, Y); ctx.scale(d * s, s); ctx.rotate(a * Math.PI / 2 * .96); ctx.translate(-2, 0);
    const P = (cl, a2, b2, w, h) => { ctx.fillStyle = cl; ctx.fillRect(a2, b2, w, h); };
    P(k.leg, 1, -10, 2.4, 9); P(k.leg, -1.5, -10, 2.2, 8 + a * 2); P('#f4f2ec', 0.6, -1.4, 3.4, 1.2);
    P('#1b1a24', -.5, -17.5, 6, 8.5); P(k.top, 0, -17, 5, 7.6); P(k.top, 4, -16 + a * 3, 4, 1.6);
    P('#1b1a24', 0.6, -22.5, 5.6, 5.4); P(k.skin, 1.2, -21.8, 4.4, 4.4); if (k.hel) { P('#1b1a24', 0.2, -23.6, 6.4, 3); P(k.hel, 0.8, -23, 5.2, 2.2); } else P('#2a1a12', 0.8, -23, 5, 2);
    ctx.restore(); return; }
  ctx.save(); ctx.translate(X, Y); ctx.scale(d * s, s);
  const P = (cl, a, b, w, h) => { ctx.fillStyle = cl; ctx.fillRect(a, b, w, h); }, kick = (Math.sin(k.ph * 3) + 1) / 2, push = !k.walk && Math.floor(k.ph * 1.2) % 3 === 0;
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-6, 0, 16, 1);
  const wa = k.dist || 0; for (const wx of [-4.5, 8.5]) { ctx.fillStyle = '#1b1a24'; ctx.beginPath(); ctx.arc(wx, -1.5, 1.7, 0, 7); ctx.fill(); for (const o of [0, Math.PI]) P('#c9ced4', wx + Math.cos(wa + o) * .9 - .4, -1.9 + Math.sin(wa + o) * .9, .8, .8); }   // little wheels, turning
  P('#1b1a24', -6, -4, 15, 2); P(k.deck, -5, -4, 13, 1);                                                         // deck
  P('#1b1a24', 8, -17, 1.6, 14); P(k.deck, 8.2, -16, 1, 12); P('#1b1a24', 6, -18, 6, 1.6);                     // stem + T-bar
  P(k.leg, 1, -10, 2.4, 6); P('#f4f2ec', 0.6, -5, 3.4, 1);                                                     // standing leg on the deck
  if (push) { const fx = -1 - kick * 5; P(k.leg, fx + 1, -9, 2.2, 5 + kick * 2); P('#f4f2ec', fx, -3 + kick * 1.5, 3, 1); } else { P(k.leg, -1, -10, 2.2, 4); P('#f4f2ec', -2, -7, 3, 1); }
  P('#1b1a24', -.5, -17.5, 6, 8.5); P(k.top, 0, -17, 5, 7.6);                                                // hoodie, leaning forward
  P(k.top, 4, -15.5, 3.4, 1.6); P(k.skin, 7, -16, 1.6, 1.4);                                                   // arm to the bar
  P('#1b1a24', 0.6, -22.5, 5.6, 5.4); P(k.skin, 1.2, -21.8, 4.4, 4.4); P('#1b1a24', 4.4, -20.6, .9, .9);      // head
  if (k.hel) { P('#1b1a24', 0.2, -23.6, 6.4, 3); P(k.hel, 0.8, -23, 5.2, 2.2); P('rgba(255,255,255,.45)', 1.6, -22.8, 2, .6); } else { P('#2a1a12', 0.8, -23, 5, 2); P('#2a1a12', 0.8, -21, 1.4, 2); }
  ctx.restore(); }
// a Luton fan walking to the match: orange (or navy) home shirt, jeans, sometimes a bobble hat or cap and a striped scarf, the odd fist in the air
function drawFan(p) { const X = Math.round(p.x), Y = Math.round(p.y), s = p.s, a = p.inT != null ? Math.max(0, 1 - p.inT / .45) : 1; if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(X, Y); ctx.scale(p.d * s, s); const P = (cl, x, y, w, h) => { ctx.fillStyle = cl; ctx.fillRect(x, y, w, h); }, st = Math.sin(p.ph * 9), L = st > 0 ? 1 : 0;
  ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.fillRect(-4, 0, 9, 1);
  P('#1b1a24', -3, -11, 7, 11); P(p.leg, -2.5, -11, 2.6, 10 - L); P(p.leg, .6, -11, 2.6, 9 + L); P('#f4f2ec', -3, -1 - L, 3.4, 1.2); P('#f4f2ec', .4, -2 + L, 3.4, 1.2);   // legs + trainers
  P('#1b1a24', -4, -22, 9, 12); P(p.shirt, -3.5, -21.5, 8, 11); P(p.trim, -3.5, -21.5, 8, 1); P(p.trim, -.5, -21.5, 2, 2); P('#f4f2ec', 1, -18, 2, 2);   // shirt with collar trim + badge
  if (p.fist && Math.sin(p.ph * 2) > .3) { P(p.shirt, 3, -28, 2, 7); P(p.skin, 3, -30, 2.4, 2.4); } else { P(p.shirt, 3.6, -21, 1.6, 6); P(p.skin, 3.6, -15, 1.6, 1.6); }
  P(p.shirt, -4.6, -21, 1.6, 6); P(p.skin, -4.6, -15, 1.6, 1.6);
  P('#1b1a24', -2.6, -28, 6, 6.4); P(p.skin, -2, -27.4, 4.8, 5.2); P('#1b1a24', 1.6, -25.6, .9, .9);   // head
  if (p.hat === 'bob') { P('#1b1a24', -3, -31, 7, 4); P('#f47920', -2.4, -30.4, 5.8, 3); P('#22336e', -2.4, -28.4, 5.8, 1); P('#f47920', -.5, -33, 2.4, 2.4); }
  else if (p.hat === 'cap') { P('#1b1a24', -3, -30, 6.6, 3); P('#22336e', -2.6, -29.6, 5.8, 2.4); P('#22336e', 2, -27.6, 3.4, 1); }
  else P('#2a1a12', -2.2, -28.4, 5, 1.6);
  if (p.scarf) { for (let i = 0; i < 6; i++) P(i % 2 ? '#22336e' : '#f47920', -3 + i, -22.4, 1, 2); const fl = Math.round(Math.sin(p.ph * 6)); for (let i = 0; i < 5; i++) P(i % 2 ? '#22336e' : '#f47920', -4 - i + fl * (i > 2 ? 1 : 0), -21 + (i > 2 ? 1 : 0), 1, 2); }
  ctx.restore(); }
function drawFox(f) { const X = Math.round(f.x), Y = Math.round(f.y), d = f.d, dim = 1, col = h => { const v = parseInt(h.slice(1), 16), r = (v >> 16) * dim | 0, g = (v >> 8 & 255) * dim | 0, b = (v & 255) * dim | 0; return 'rgb(' + r + ',' + g + ',' + b + ')'; };
  const P = (cl, a, b, w, h) => { ctx.fillStyle = col(cl); ctx.fillRect(d > 0 ? X + a : X + 16 - a - w, Y + b, w, h); }, st = Math.floor(f.ph) % 2;
  P('#1b1a24', 1, -7, 14, 1); P('#c8601a', 2, -6, 10, 4); P('#e07a2a', 3, -6, 8, 1); P('#f4ead8', 5, -3, 5, 1);                 // body
  P('#c8601a', -3, -7, 5, 3); P('#c8601a', -5, -6, 3, 2); P('#f4ead8', -6, -6, 2, 2);                                           // bushy tail with a white tip
  P('#c8601a', 11, -9, 5, 4); P('#f4ead8', 13, -6, 3, 1); P('#1b1a24', 16, -7, 1, 1); P('#1b1a24', 11, -11, 2, 2); P('#1b1a24', 14, -11, 2, 2); P('#1b1a24', 13, -8, 1, 1);   // head, ears, nose, eye
  const lg = (a, up) => P('#2a2018', a, -2 - (up ? 1 : 0), 1, 2 + (up ? 0 : 1)); lg(3, st); lg(5, !st); lg(9, !st); lg(11, st);
}
function foxEyes(f) { const X = Math.round(f.x), Y = Math.round(f.y), d = f.d; { const g = ctx.createRadialGradient(d > 0 ? X + 16 : X, Y - 8, 0, d > 0 ? X + 16 : X, Y - 8, 3); g.addColorStop(0, 'rgba(255,240,180,.8)'); g.addColorStop(1, 'rgba(255,240,180,0)'); ctx.fillStyle = g; ctx.fillRect((d > 0 ? X + 16 : X) - 3, Y - 11, 6, 6); } }   // eye shine
function drawSnowman(m) { const X = Math.round(m.x), Y = Math.round(m.y), s = m.s, C = (cx, cy, r, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X + cx * s, Y + cy * s, r * s, 0, 6.3); ctx.fill(); };
  ctx.fillStyle = 'rgba(40,50,70,.18)'; ctx.beginPath(); ctx.ellipse(X, Y + 1, 9 * s, 2 * s, 0, 0, 6.3); ctx.fill();
  C(0, -6, 7.5, '#1b1a24'); C(0, -6, 6.6, '#f6f9ff'); C(0, -17, 5.5, '#1b1a24'); C(0, -17, 4.7, '#f6f9ff'); C(-1.5, -7.5, 4, '#e2eaf6'); C(-1, -18, 3, '#e8eef8');
  ctx.fillStyle = m.scarf; ctx.fillRect(X - 5 * s, Y - 13 * s, 10 * s, 2 * s); ctx.fillRect(X + 2 * s, Y - 12 * s, 2 * s, 5 * s);
  ctx.fillStyle = '#1b1a24'; ctx.fillRect(X - 2 * s, Y - 19 * s, 1.2 * s, 1.2 * s); ctx.fillRect(X + 1 * s, Y - 19 * s, 1.2 * s, 1.2 * s); for (const by of [-9, -6, -3]) ctx.fillRect(X - .6 * s, Y + by * s, 1.2 * s, 1.2 * s);
  ctx.fillStyle = '#f08a2a'; ctx.fillRect(X, Y - 17.5 * s, 4 * s, 1.4 * s);
  ctx.strokeStyle = '#5a3d2a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X - 6 * s, Y - 9 * s); ctx.lineTo(X - 12 * s, Y - 13 * s); ctx.moveTo(X + 6 * s, Y - 9 * s); ctx.lineTo(X + 12 * s, Y - 14 * s); ctx.stroke();
  if (m.hat) { ctx.fillStyle = '#1b1a24'; ctx.fillRect(X - 5 * s, Y - 22 * s, 10 * s, 1.5 * s); ctx.fillRect(X - 3.5 * s, Y - 27 * s, 7 * s, 5 * s); } }

/* ---------- draw ---------- */
function pipe(x, y, h, cap) {
  const P = (c, a, b, w, hh) => { ctx.fillStyle = c; ctx.fillRect(Math.round(a), Math.round(b), w, hh); };
  P(OUT, x - 1, y, PW + 2, h); P('#5bbf3a', x, y, PW, h); P('#86dc5a', x + 3, y, 4, h); P('#3f9a28', x + PW - 6, y, 4, h); P('#2f7a1e', x + PW - 2, y, 2, h);
  const cy = cap === 'top' ? y + h - 12 : y;
  P(OUT, x - 4, cy - 1, PW + 8, 14); P('#5bbf3a', x - 3, cy, PW + 6, 12); P('#86dc5a', x, cy + 1, 4, 10); P('#3f9a28', x + PW - 3, cy + 1, 4, 10); P('#9be86a', x - 3, cy, PW + 6, 2);
  if (cap === 'bottom') SKY.capSnow(ctx, x, cy, PW);
}
function cloud(x, y, s) { ctx.fillStyle = SKY.cloudCol; const r = (a, b, w, h) => ctx.fillRect(Math.round(x + a * s), Math.round(y + b * s), Math.ceil(w * s), Math.ceil(h * s)); r(0, 6, 40, 8); r(6, 2, 18, 12); r(18, 0, 14, 14); }

const AMB = { train: 0, plane: 0, fair: 0, crowd: 0 };
// SMR billboard artwork, drawn 3x sharper than the town so the logo and words read clearly (still a touch pixelated)
const SMRB = (() => { const K = 3, B = LANDMARKS.smr.board, cv2 = document.createElement('canvas'); cv2.width = B.w * K; cv2.height = B.h * K; const g = cv2.getContext('2d'); let ok = false;
  const logo = new Image(); logo.onload = () => paint(); logo.src = 'smr-mark.svg?v=1';
  function paint() { const w = cv2.width, h = cv2.height; g.clearRect(0, 0, w, h);
    const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#16162a'); bg.addColorStop(1, '#0a0a14'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    const rg = g.createRadialGradient(w / 2, h * .32, 10, w / 2, h * .32, w * .55); rg.addColorStop(0, 'rgba(120,80,255,.22)'); rg.addColorStop(1, 'rgba(120,80,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, w, h);
    const lw = 252, lh = Math.round(lw * 256.4 / 1000); g.imageSmoothingEnabled = true; if (logo.complete && logo.naturalWidth) g.drawImage(logo, Math.round((w - lw) / 2), 16, lw, lh);
    g.textAlign = 'center'; g.textBaseline = 'top'; g.font = '700 16px Silk';
    [['WEBSITES / APPS', '#7b6bff', '#e04bff'], ['GRAPHIC DESIGN', '#3a7bff', '#b04bff'], ['PRINTING', '#ff3d8b', '#ff9a3d']].forEach(([t, a, b], i) => {
      const tw = g.measureText(t).width, y = 104 + i * 26, gr = g.createLinearGradient(w / 2 - tw / 2, 0, w / 2 + tw / 2, 0); gr.addColorStop(0, a); gr.addColorStop(1, b);
      g.fillStyle = 'rgba(0,0,0,.6)'; g.fillText(t, w / 2 + 2, y + 2); g.fillStyle = gr; g.fillText(t, w / 2, y); });
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(w / 2 - 110, 186, 220, 2); g.font = '400 16px Silk'; g.fillStyle = '#ffffff'; g.fillText('smrgraphics.co.uk', w / 2, 198);
    // crisp pixel look: drop the smoothing from the logo edges
    const d = g.getImageData(0, 0, w, h), p = d.data; for (let i = 3; i < p.length; i += 4) p[i] = 255; g.putImageData(d, 0, 0); ok = true; }
  if (document.fonts) document.fonts.ready.then(paint); else paint();
  return { B, cv: cv2, get ok() { return ok; } }; })();
/* roller shutters on the small shops when they're shut (closing, opening hour; from their listed opening times, estimates marked) */
window.SHUT_K = { periperi: [22, 11], miamicrispy: [1, 11], chaiikhana: [2, 12], grandbazar: [22, 8] };
// some shops keep different hours on certain days: [day 0 = Sunday] -> [shut from, open at]
const SHUT_DAY = { grandbazar: { 0: [18, 11] } };
Object.assign(SHUT_K, { krispy: [1, 11], kahwa: [23, 18], gna: [1, 11], alquds: [0, 11.5], topspizza: [0, 11], cycleking: [18, 9] });
const shutC = new Map();
// shop fronts in sprite pixels: [left, right, height above the pavement]
const SHUT_R = { krispy: [[97, 198, 29]], kahwa: [[99, 175, 34]], gna: [[96, 212, 32]], alquds: [[97, 216, 30]], topspizza: [[91, 237, 36, 0, 1]],
  grandbazar: [[97, 137, 86]], periperi: [[160, 265, 48]], miamicrispy: [[94, 239, 39, 5]], chaiikhana: [[99, 139, 50, 31]], cycleking: [[92, 150, 45], [155, 212, 45], [225, 309, 45], [324, 369, 45], [375, 422, 45]] };
const SHUT_COL = { krispy: ['#6e1c20', '#561519', '#3e1013'], kahwa: ['#4a3324', '#3a271b', '#2a1c13'], alquds: ['#43464c', '#35383d', '#26282c'], miamicrispy: ['#a8481c', '#8a3a16', '#5e2810'] };
function shutterArt(sp) { if (shutC.has(sp)) return shutC.get(sp); const W0 = sp.c.width, H0 = sp.c.height, gy = H0 - 6, runs = (SHUT_R[sp.k] || []).map(([a, b, h, lo, bars]) => [a, gy - h, b, gy - 1 - (lo || 0), bars]); const [SC, SG, SB] = SHUT_COL[sp.k] || ['#8b9199', '#6c7279', '#5a6068'];
  const cv = document.createElement('canvas'); cv.width = W0; cv.height = H0; const g = cv.getContext('2d');
  runs.forEach(([x0, y0, x1, y1, bars]) => { if (bars) { g.fillStyle = '#121214'; g.fillRect(x0, y0, 5, y1 - y0 + 2); g.fillRect(x1 - 4, y0, 5, y1 - y0 + 2); g.fillStyle = '#26262b'; g.fillRect(x0 + 1, y0, 1, y1 - y0 + 2); g.fillRect(x1 - 3, y0, 1, y1 - y0 + 2); x0 += 6; x1 -= 6; }   // black shop-front posts either side
    const w = x1 - x0 + 1, h = y1 - y0 + 2, x = x0, y = y0 + 3;
    g.fillStyle = '#1b1a24'; g.fillRect(x - 1, y - 4, w + 2, h + 5); g.fillStyle = SB; g.fillRect(x, y - 3, w, 3);   // shutter box on top
    g.fillStyle = SC; g.fillRect(x, y, w, h); g.fillStyle = SG; for (let yy = y + 1; yy < y + h; yy += 2) g.fillRect(x, yy, w, 1);
    g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x, y, 1, h); g.fillStyle = '#4a4f56'; g.fillRect(x, y + h - 2, w, 2); g.fillStyle = '#c9a64a'; g.fillRect(x + (w >> 1) - 1, y + h - 2, 2, 1); });
  const r = { cv, n: runs.length, tint: null, ta: -1 }; shutC.set(sp, r); return r; }
window.CLOSED_K = { karwan: [23, 11] };
window.isClosed = k => { const h = CLOSED_K[k]; if (!h) return false; const now = window.SKY && SKY.hour != null ? SKY.hour : new Date().getHours(); return h[0] < h[1] ? now >= h[0] && now < h[1] : now >= h[0] || now < h[1]; };
const shutNow = k => { const dd = SHUT_DAY[k], h = (dd && dd[new Date().getDay()]) || SHUT_K[k], now = window.SKY && SKY.hour != null ? SKY.hour : new Date().getHours() + new Date().getMinutes() / 60; if (!h) return false; return h[0] < h[1] ? now >= h[0] && now < h[1] : now >= h[0] || now < h[1]; };
function drawShutters(lmq, gy) { lmq.forEach(l => { if (!SHUT_K[l.sp.k] || l.x > W + 20 || l.x + l.sp.w < -20 || !shutNow(l.sp.k)) return; const s = shutterArt(l.sp); if (!s.n) return;
    const a = Math.round((window.SKY ? SKY.tintA || 0 : 0) * 50) / 50; let img = s.cv;
    if (a > .02) { if (s.ta !== a) { if (!s.tint) { s.tint = document.createElement('canvas'); s.tint.width = s.cv.width; s.tint.height = s.cv.height; } const g = s.tint.getContext('2d'); g.globalCompositeOperation = 'copy'; g.drawImage(s.cv, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(10,16,48,' + a + ')'; g.fillRect(0, 0, s.cv.width, s.cv.height); s.ta = a; } img = s.tint; }
    ctx.drawImage(img, Math.round(l.x - M), gy - LH + 6); }); }
window.__shut = () => ({ shutNow, shutterArt, hour: SKY.hour });
/* shop fronts glow softly from inside at night while the shop is open (dimmer than the big lit signs) */
const GLOW_R = Object.assign({}, SHUT_R, { grandbazar: [[97, 137, 86], [207, 427, 86]], karwan: [[95, 310, 48, 4]],
  nadeem: [[127, 283, 50, 5]], orbital: [[558, 662, 62, 0]],   // Coffee Pot: the whole ground floor is one cafe, lit together
  barak: [[112, 192, 50, 20], [213, 239, 40, 18]], toros: [[98, 123, 35, 3], [128, 152, 35, 3], [157, 180, 35, 3], [187, 210, 35, 3], [223, 240, 33, 0]], spudkingz: [[115, 177, 35, 20]], chaiiwala: [[95, 255, 87, 0]], kaya: [[111, 140, 36, 0]] });
// shops whose front is lit only while open (no shutter): [closes, opens]
const GLOW_STR = { kaya: .2,  orbital: .3, nadeem: .42, grandbazar: .3 };   // how warm the inside glow is (default .16)
const GLOW_HOURS = { orbital: [21, 9] /* estimate */, nadeem: [21, 8] /* Coffee Pot, estimate */ };
const glowShut = k => { const h = GLOW_HOURS[k]; if (!h) return false; const now = window.SKY && SKY.hour != null ? SKY.hour : new Date().getHours(); return h[0] < h[1] ? now >= h[0] && now < h[1] : now >= h[0] || now < h[1]; };
function drawShopGlow(lmq, gy) { const n = window.SKY ? SKY.n : 0; if (n < .2) return; lmq.forEach(l => { const r = GLOW_R[l.sp.k]; if (!r || l.x > W + 20 || l.x + l.sp.w < -20) return;
    if ((SHUT_K[l.sp.k] && shutNow(l.sp.k)) || isClosed(l.sp.k) || glowShut(l.sp.k)) return; const ox = Math.round(l.x - M);
    r.forEach(([a, b, h, lo]) => { const w = b - a + 1, hh = h - (lo || 0), sy = l.sp.c.height - 6 - h;
      ctx.globalAlpha = .55 * n; ctx.drawImage(l.sp.c, a, sy, w, hh, ox + a, gy - h, w, hh);   // the inside shows through again
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(255,196,120,' + ((GLOW_STR[l.sp.k] || .16) * n).toFixed(3) + ')'; ctx.fillRect(ox + a, gy - h, w, hh); ctx.globalCompositeOperation = 'source-over';
      if (GLOW_SPILL[l.sp.k]) { const cx = ox + (a + b) / 2, R0 = Math.max(18, w * .9), g = ctx.createRadialGradient(cx, gy - h * .35, 0, cx, gy - h * .35, R0); g.addColorStop(0, 'rgba(255,200,130,' + (.14 * n).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,200,130,0)');   // light pouring out of the open door onto the pavement
        ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(cx - R0, gy - h - 6, R0 * 2, h + 18); ctx.globalCompositeOperation = 'source-over'; } }); });
  ctx.globalAlpha = 1; }
const GLOW_SPILL = { kaya: 1 };
/* Galaxy: a row of bulbs round the GALAXY sign band that chase along at night */
function drawGalaxyLights(lmq, gy) { const n = window.SKY ? SKY.n : 0; if (n < .25) return; const f = (window.SCALE && SCALE.galaxy) || 1; lmq.forEach(l => { if (l.sp.k !== 'galaxy' || l.x > W + 10 || l.x + l.sp.w < -10) return; const ph = Math.floor(t * 9);
    for (let i = 0; i < 40; i++) { const on = ((i + ph) % 5) < 2, bx = Math.round(l.x + (124 - 2 + 3 + i * 5) * f); for (const hh of [149, 142]) { const by = Math.round(gy - hh * f); ctx.fillStyle = on ? 'rgba(255,236,170,' + (.95 * n).toFixed(2) + ')' : 'rgba(150,120,70,' + (.6 * n).toFixed(2) + ')'; ctx.fillRect(bx, by, 2, 1);
      if (on) { ctx.fillStyle = 'rgba(255,220,140,' + (.18 * n).toFixed(2) + ')'; ctx.fillRect(bx - 1, by - 1, 4, 3); } } } }); }
/* chimney smoke from the houses on cold months */
function drawSmoke(l, gy) { if (!l.sp.ch || !l.sp.ch.length || !window.SKY) return; const sea = SKY.season(); if (sea !== 'winter' && sea !== 'lateautumn' && SKY.snowAcc < .2) return;
  if (l.smoke == null) l.smoke = Math.random() < .65 ? Math.random() : -1; if (l.smoke < 0) return; const wind = SKY.wind || 0, dir = wind < 0 ? -1 : 1, drift = 10 + Math.min(20, Math.abs(wind) * 2);
  l.sp.ch.forEach(([cx, cy], k) => { if (k && l.smoke < .5) return; for (let j = 0; j < 6; j++) { const ph = (t * .22 + j / 6 + l.smoke + k * .3) % 1, px = l.x + cx + ph * ph * drift * dir + Math.sin(t * 1.3 + j * 2) * .8, py = gy + cy - ph * 30, r = 1 + ph * 3.4;
    ctx.globalAlpha = .58 * (1 - ph) * Math.min(1, ph * 5); ctx.fillStyle = '#dcdee3'; ctx.beginPath(); ctx.arc(px, py, r, 0, 7); ctx.fill(); } }); ctx.globalAlpha = 1; }
function drawSMRBoard(lx, gy) { const B = SMRB.B, x = Math.round(lx + B.x), y = gy - B.y; ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(SMRB.cv, x, y, B.w, B.h);
  const n = window.SKY ? SKY.n : 0, a = window.SKY ? SKY.tintA || 0 : 0;
  if (a > .02) { ctx.fillStyle = 'rgba(10,16,48,' + (a * (1 - n * .55)).toFixed(3) + ')'; ctx.fillRect(x, y, B.w, B.h); }
  if (n > .2) { const gr = ctx.createLinearGradient(0, y, 0, y + B.h); gr.addColorStop(0, 'rgba(255,240,205,' + (.22 * n).toFixed(3) + ')'); gr.addColorStop(.6, 'rgba(255,240,205,0)'); ctx.fillStyle = gr; ctx.fillRect(x, y, B.w, B.h);
    for (let i = 0; i < 3; i++) { const fx = x + 24 + i * (B.w - 48) / 2 + 9; ctx.fillStyle = 'rgba(255,245,215,' + (.9 * n).toFixed(2) + ')'; ctx.fillRect(Math.round(fx - 3), y - 10, 6, 1); } }
  ctx.restore(); }
function draw() {
  AMB.train = AMB.plane = AMB.fair = 0;
  ctx.setTransform(S, 0, 0, S, 0, OY * S); ctx.imageSmoothingEnabled = false;
  SKY.frame(); SKY.ahead(lmQueue, W);
  SKY.drawSky(ctx, W, OY, GY, t, SC);
  clouds.forEach(cl => cloud(cl.x, cl.y, cl.s));
  const fdt = Math.min(.05, Math.max(0, t - (window.__ft == null ? t : window.__ft))); window.__ft = t; const fstep = SCi - (window.__fsc == null ? SCi : window.__fsc); window.__fsc = SCi;
  if (window.FEST) FEST.sky(ctx, W, GY, t, fdt);   // festival sky: Santa's sleigh, New Year fireworks
  // the town (railway, buildings, planes) goes on its own layer when it needs tinting for night, sunset or a grey day
  const MAIN = ctx, town = SKY.townBegin(W, OY, GY); if (town) ctx = town;
  // railway: viaduct runs behind the building before the station, the station and the building after; train emerges from behind one and vanishes behind the other
  const si = lmQueue.findIndex(l => l.sp.k === 'station' && l.x < W + 400 && l.x + l.sp.w > -400);
  if (si > 0 && lmQueue[si + 1]) { const st = lmQueue[si], pv = lmQueue[si - 1], nx = lmQueue[si + 1], x0 = pv.x + 4, x1 = nx.x + nx.sp.w - 4;
    ctx.fillStyle = OUT; ctx.fillRect(Math.round(x0), GY - 95, Math.round(x1 - x0), 12); ctx.fillStyle = '#b3b8be'; ctx.fillRect(Math.round(x0), GY - 94, Math.round(x1 - x0), 8); ctx.fillStyle = '#8a9098'; ctx.fillRect(Math.round(x0), GY - 86, Math.round(x1 - x0), 2);
    for (let px = x0 + 30; px < x1; px += 60) { ctx.fillStyle = '#9aa0a6'; ctx.fillRect(Math.round(px), GY - 84, 8, 84); }
    // train progress is tied to the scroll: it leaves from behind the first building as that building comes on screen,
    // is right over the station as the station passes the pigeon, then slips behind the next building
    const k = 504 / (0.4 * W + 270), off = (pv.sp.w - 224) + k * (0.7 * W - st.x);
    if (off > 0 && off < x1 - x0) { const tx = x0 + 6 + off; if (tx < W && tx + 218 > 0 && Math.max(tx, pv.x + pv.sp.w) < Math.min(tx + 218, nx.x)) AMB.train = 1; ctx.save(); ctx.beginPath(); ctx.rect(x0, GY - 150, x1 - x0, 70); ctx.clip(); LM_ANIM.train(ctx, Math.round(x0 + 6 + off), GY); ctx.restore(); } }
  // plane: rises from behind the airport (small and low, half hidden by the roof), keeps climbing as the airport scrolls away, leaves off the top
  const PL = plane ? (() => { const d = t - plane.t0, sc = .5 + Math.min(.7, d * .14);
    return { x: Math.round(plane.x + d * 6), y: Math.round(GY - 126 - d * 7 - d * d * 5), a: -0.12 - Math.min(.32, d * .07), sc }; })() : null;
  const drawPlane = P => { ctx.save(); ctx.translate(P.x, P.y); ctx.scale(P.sc, P.sc); LM_ANIM.plane(ctx, 0, 0, P.a); ctx.restore(); };
  let planeDrawn = false;
  if (PL && (PL.y < -OY - 60 || PL.x > W + 80)) plane = null; else if (PL && PL.x > 0 && PL.x < W) AMB.plane = 1;
  // lawns that carry on behind the neighbouring buildings (drawn first so the neighbours sit in front)
  lmQueue.forEach((l, i) => { const LL = LANDMARKS[l.sp.k]; if (!LL || !LL.lawn || l.x > W + 260 || l.x + l.sp.w < -260) return;
    const f = (typeof SCALE !== 'undefined' && SCALE[l.sp.k]) || 1, lh = Math.round(LL.lawn * f), sw = 11 * f, pv = lmQueue[i - 1], nx = lmQueue[i + 1];
    const x0 = Math.round(pv ? pv.x + pv.sp.w - 12 : l.x - 60), x1 = Math.round(nx ? nx.x + 12 : l.x + l.sp.w + 60);
    for (let xx = x0; xx < x1; xx++) { const n = Math.floor((xx - (l.x - 4 * f)) / sw); ctx.fillStyle = n % 2 ? DRYC('#6aa848') : DRYC('#54903a'); ctx.fillRect(xx, GY - lh, 1, lh); }
    ctx.fillStyle = DRYC('#2f5a26', .5); ctx.fillRect(x0, GY - lh - 1, x1 - x0, 2); });
  lmQueue.forEach(l => { if (l.x > W + 260 || l.x + l.sp.w < -260) return;
    if (l.sp.k === 'airport') { const apf = (typeof SCALE !== 'undefined' && SCALE.airport) || 1; if (!l.planeGone && !plane && l.x + 300 * apf < W * .6) { plane = { t0: t, x: l.x + 300 * apf }; l.planeGone = 1; }
      if (PL && plane) { drawPlane(PL); planeDrawn = true; } }   // always drawn just before the airport, so it rises from behind the terminal and never passes in front of it
    if (l.sp.k === 'funfair' && l.x < W * .9 && l.x + l.sp.w > W * .1) AMB.fair = 1; if (l.sp.k === 'oak' && MATCH === 'H' && l.x < W * 1.1 && l.x + l.sp.w > -W * .1) AMB.crowd = 1;
    ctx.drawImage(SKY.seasonal(l.sp, true), Math.round(l.x - M), GY - LH + 6); if (l.house) drawSmoke(l, GY); if (SKY.snowAcc > .02) { const sn = SKY.snow(l.sp, l.x < W); if (sn) { ctx.globalAlpha = Math.min(1, SKY.snowAcc * 1.15); ctx.imageSmoothingEnabled = true; ctx.drawImage(sn, Math.round(l.x - M), GY - LH + 6, sn.width / 3, sn.height / 3); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = 1; } } if (ANIM_K[l.sp.k]) { const af = l.sp.k !== 'lutonhoo' && typeof SCALE !== 'undefined' && SCALE[l.sp.k]; if (af) { ctx.save(); ctx.translate(Math.round(l.x), GY); ctx.scale(af, af); LM_ANIM[l.sp.k](ctx, 0, 0, t); ctx.restore(); } else LM_ANIM[l.sp.k](ctx, Math.round(l.x), GY, t); } });
  if (PL && plane && !planeDrawn) drawPlane(PL);
  // banner plane over Currys: a little propeller plane towing "@DONNERRUSH · OPEN NOW OUTSIDE CURRYS"
  if (!bplane && BANNER_ON) { const cu = lmQueue.find(l => l.sp.k === 'currys' && !l.bannerGone && l.x < W * .75 && l.x + l.sp.w > 0); if (cu) { cu.bannerGone = 1; bplane = { t0: t }; } }   // flies in from the left, against the scroll, so it's always clearly moving
  if (bplane) { const d = t - bplane.t0, px = Math.round(-20 + d * 42), py = Math.round(GY - 238 + Math.sin(d * 1.4) * 3); drawBannerPlane(px, py, d); if (px - 46 - BANNER.w > W + 10) bplane = null; }
  if (town) { ctx = MAIN; SKY.townEnd(ctx, W, OY, GY, lmQueue, M, LH); }
  lmQueue.forEach(l => { if (l.sp.k === 'smr' && l.x < W + 10 && l.x + l.sp.w > -10) drawSMRBoard(l.x, GY); }); drawShopGlow(lmQueue, GY); drawShutters(lmQueue, GY); drawGalaxyLights(lmQueue, GY);
  flags.forEach(drawFlag);
  if (window.FEST) FEST.front(ctx, W, GY, t, SCi, pipes, PW);   // Ramadan lanterns / Carnival bunting
  SKY.drawFog(ctx, W, OY, GY, t);
  // pavement + road
  ctx.fillStyle = '#c9c4b8'; ctx.fillRect(0, GY, W, ROAD - GY); ctx.fillStyle = '#b3ad9f'; const po = SCi % 12; for (let x = -po; x < W; x += 12) ctx.fillRect(Math.round(x), GY, 1, ROAD - GY); ctx.fillRect(0, GY + 6, W, 1);
  ctx.fillStyle = '#8f8a7e'; ctx.fillRect(0, ROAD - 2, W, 2);
  ctx.fillStyle = '#4a4e55'; ctx.fillRect(0, ROAD, W, H - ROAD); ctx.fillStyle = '#e8e6df'; const ro = SCi % 24; for (let x = -ro; x < W; x += 24) ctx.fillRect(Math.round(x), ROAD + 17, 12, 2);
  if (BE > 0) { ctx.fillStyle = '#8f8a7e'; ctx.fillRect(0, H, W, 2); ctx.fillStyle = '#c9c4b8'; ctx.fillRect(0, H + 2, W, 12); ctx.fillStyle = '#b3ad9f'; for (let x = -po; x < W; x += 12) ctx.fillRect(Math.round(x), H + 2, 1, 12);
    ctx.fillStyle = DRYC('#5f9e44', .2); ctx.fillRect(0, H + 14, W, BE); ctx.fillStyle = DRYC('#4f8a36', .75); const go = SCi % 16; for (let y = H + 18; y < H + BE; y += 8) for (let x = -go + ((y / 8) % 2) * 8; x < W; x += 16) ctx.fillRect(Math.round(x), y, 2, 2);
    ctx.fillStyle = DRYC('#3f7d33', .5); for (let x = -go; x < W; x += 16) ctx.fillRect(Math.round(x), H + 14, 14, 4); }
  SKY.drawGround(ctx, W, GY, ROAD, H, BE, SCi, () => { if (window.FEST) FEST.ground(ctx, W, GY, t, SCi, fdt, fstep); critters.forEach(c => { if (c.k === 'fox') drawFox(c); else if (c.k === 'kid') drawKid(c); else if (c.k === 'fan') drawFan(c); else drawSnowman(c); }); });

  SKY.drawPrecip(ctx, S);
  pipes.forEach(p => SKY.pipeShadow(ctx, p.x, PW, ROAD, GY)); pipes.forEach(p => { pipe(p.x, -OY, p.top + OY, 'top'); pipe(p.x, p.top + p.gap, ROAD - 4 - p.top - p.gap, 'bottom'); });
  // vehicles go in front of the pipes
  const CS = .5;
  // turning wheels: repaint each rim with its spokes rotated by how far the car has driven
  const spin = (c, x0, y0, flip) => { (c.sp.wh || []).forEach(w => { const rr = w.r * CS, cx = x0 + (flip ? c.sp.c.width - w.x : w.x) * CS, cy = y0 + w.y * CS, rim = w.rim || '#c9ced4';
    ctx.save(); ctx.translate(cx, cy); ctx.rotate((c.dist || 0) / Math.max(1, rr)); ctx.beginPath(); ctx.arc(0, 0, rr * .64, 0, 7); ctx.fillStyle = rim; ctx.fill();
    if (w.ring) { ctx.strokeStyle = w.ring; ctx.lineWidth = .7 * CS * 2; ctx.stroke(); }
    ctx.strokeStyle = 'rgba(20,20,26,.55)'; ctx.lineWidth = .8; for (let i = 0; i < (w.spokes || 5); i++) { const a = i * 2 * Math.PI / (w.spokes || 5); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * rr * .6, Math.sin(a) * rr * .6); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(0, 0, rr * .16, 0, 7); ctx.fillStyle = '#5a5d66'; ctx.fill(); ctx.restore(); }); };
  // police light bar: two blue lamps flashing in turn, with a glow that's much stronger at night (and a blue wash on the road)
  const blues = (c, x0, gy, flip) => { const wd = c.sp.c.width * CS, nt = SKY.n, ph = Math.floor(t * 9 + (c.x | 0) * .01) % 4, R0 = 15 + nt * 13;
    if (nt > .2) { ctx.fillStyle = 'rgba(60,110,255,' + (.16 * nt).toFixed(2) + ')'; ctx.beginPath(); ctx.ellipse(x0 + wd / 2, gy - 1, wd * .55, 4, 0, 0, 6.3); ctx.fill(); }
    (c.sp.lb || []).forEach(([lx, ly], i) => { if ((ph + i) % 2) return; const X = flip ? x0 + wd - 3 - lx : x0 + 3 + lx, Y = gy + ly + 1;
      const g = ctx.createRadialGradient(X, Y, .5, X, Y, R0); g.addColorStop(0, 'rgba(120,170,255,1)'); g.addColorStop(.35, 'rgba(60,115,255,' + (.6 + .15 * nt).toFixed(2) + ')'); g.addColorStop(1, 'rgba(40,90,255,0)'); ctx.fillStyle = g; ctx.fillRect(X - R0, Y - R0, R0 * 2, R0 * 2);
      ctx.fillStyle = '#2f6bff'; ctx.fillRect(Math.round(X - 2.5), Math.round(Y - 1.2), 5, 2.6); ctx.fillStyle = '#f2f7ff'; ctx.fillRect(Math.round(X - 1.5), Math.round(Y - .7), 3, 1.6); }); };
  // at night each car gets a darker copy over it, then its headlights and tail lights
  const carN = (cnv, x0, y0, sp, flip) => { if (SKY.n > .02) { ctx.globalAlpha = Math.min(1, SKY.n); ctx.drawImage(SKY.carNight(cnv), x0, y0, cnv.width * CS, cnv.height * CS); if (SKY.lightA > .02) { ctx.globalAlpha = SKY.lightA; ctx.drawImage(SKY.carWin(cnv, sp, flip), x0, y0, cnv.width * CS, cnv.height * CS); } ctx.globalAlpha = 1; } };
  smoke.forEach(p => { ctx.fillStyle = (p.dark ? 'rgba(60,58,62,' : 'rgba(190,192,198,') + Math.max(0, p.a).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.3); ctx.fill(); });
  cars.sort((a, b) => (a.zoom ? 1 : 0) - (b.zoom ? 1 : 0));
  const drawC0 = c => { const x0 = Math.round(c.x), y0 = Math.round(ROAD + 14 + (c.yo || 0) - c.sp.gy * CS); SKY.carShadow(ctx, x0 + 3, c.sp.w, ROAD + 14 + (c.yo || 0)); ctx.drawImage(c.sp.c, x0, y0, c.sp.c.width * CS, c.sp.c.height * CS); spin(c, x0, y0, false); carN(c.sp.c, x0, y0, c.sp, false); SKY.carLights(ctx, x0, y0, c.sp.c.width * CS, ROAD + 14 + (c.yo || 0), c.sp.ht, c.dir); if (c.run) blues(c, x0, ROAD + 14 + (c.yo || 0), false); }, drawC1 = c => { const x0 = Math.round(c.x), y0 = Math.round(H - 3 + (c.yo || 0) - c.sp.gy * CS); SKY.carShadow(ctx, x0 + 3, c.sp.w, H - 3 + (c.yo || 0)); ctx.drawImage(c.sp.flip, x0, y0, c.sp.flip.width * CS, c.sp.flip.height * CS); spin(c, x0, y0, true); carN(c.sp.flip, x0, y0, c.sp, true); SKY.carLights(ctx, x0, y0, c.sp.flip.width * CS, H - 3 + (c.yo || 0), c.sp.ht, c.dir); if (c.run) blues(c, x0, H - 3 + (c.yo || 0), true); };
  // an overtaking car is drawn at the depth of the lane it has pulled into: going into the far lane it slips behind the car it passes
  const across = c => c.ot && c.ot.out > .5;
  if (window.FEST && FEST.road) FEST.road(ctx, W, ROAD, H, t, SCi);   // carnival parade on the road
  cars.filter(c => !c.crash && c.lane === 0 && !across(c)).forEach(drawC0); cars.filter(c => !c.crash && c.lane === 1 && across(c)).forEach(drawC1);
  cars.filter(c => c.crash).forEach(c => { const cnv = c.lane === 0 ? c.sp.c : c.sp.flip, w = cnv.width * CS, hgt = cnv.height * CS, gy = (c.lane === 0 ? ROAD + 14 : H - 3) + c.yo, cx = c.x + w / 2, cy = gy - c.sp.ht / 2;
    SKY.carShadow(ctx, Math.round(c.x) + 3, c.sp.w, gy); ctx.save(); ctx.translate(cx, cy); ctx.rotate(c.crash.rot); ctx.drawImage(cnv, -w / 2, -(c.sp.gy * CS - c.sp.ht / 2), w, hgt); if (SKY.n > .02) { ctx.globalAlpha = Math.min(1, SKY.n); ctx.drawImage(SKY.carNight(cnv), -w / 2, -(c.sp.gy * CS - c.sp.ht / 2), w, hgt); ctx.globalAlpha = 1; } ctx.restore();
    if (c.crash.fire && c.crash.done && c.crash.t < 9) { const fx = cx + (c.dir < 0 ? -w * .22 : w * .22), fy = gy - c.sp.ht * .55, fade = Math.min(1, (9 - c.crash.t) / 2);
      for (let i = 0; i < 7; i++) { const ph = t * 11 + i * 1.7, hh = (5 + 4 * Math.sin(ph) + i % 3 * 2) * fade, xx = Math.round(fx + (i - 3) * 2 + Math.sin(ph * .7)), yy = Math.round(fy);
        ctx.fillStyle = 'rgba(232,80,30,.9)'; ctx.fillRect(xx, yy - hh, 2, hh); ctx.fillStyle = 'rgba(255,200,60,.95)'; ctx.fillRect(xx, yy - hh * .55, 2, hh * .55); } } });
  cars.filter(c => !c.crash && c.lane === 1 && !across(c)).forEach(drawC1); cars.filter(c => !c.crash && c.lane === 0 && across(c)).forEach(drawC0);
  const rot = state === 'menu' || state === 'ready' ? 0 : Math.max(-.45, Math.min(1.3, bird.vy / 320));
  if (golden) { for (let i = 0; i < 6; i++) { const a = (t * 2.3 + i * 1.05) % 1, sx = Math.round(bird.x - 10 - a * 34 + Math.sin(t * 5 + i) * 2), sy = Math.round(bird.y + Math.sin(t * 7 + i * 2) * 5); ctx.fillStyle = 'rgba(255,' + (220 + i * 5) + ',120,' + (1 - a).toFixed(2) + ')'; ctx.fillRect(sx, sy, 1, 1); if ((i + Math.floor(t * 6)) % 3 === 0) { ctx.fillRect(sx - 1, sy, 3, 1); ctx.fillRect(sx, sy - 1, 1, 3); } }
    const gl = ctx.createRadialGradient(bird.x, bird.y, 2, bird.x, bird.y, 22); gl.addColorStop(0, 'rgba(255,220,90,.35)'); gl.addColorStop(1, 'rgba(255,220,90,0)'); ctx.fillStyle = gl; ctx.fillRect(bird.x - 22, bird.y - 22, 44, 44); }
  if (window.SKY && performance.now() - wxSndT > 500) { wxSndT = performance.now(); const q = SKY.cur, live = !SFX.adhanOn; SFX.weather(live ? q.rain * (q.drizzle ? .55 : 1) : 0, live ? q.fog : 0, live ? q.snow : 0); }   // weather sounds
  if (window.SKY && SKY.boom) { const bm = SKY.boom; SKY.boom = null; SFX.thunder(bm.d, bm.near); }   // thunder follows each lightning flash
  if (SKY.cur.rain > .25 && Math.random() < .08 && state === 'play') feath.push({ x: bird.x - 2, y: bird.y + 4, vx: 0, vy: 20, life: .5, drip: 1 });
  feath.forEach(f => { f.life -= 1 / 60; f.x += f.vx / 60 - (state === 'play' ? speed / 60 * .2 : 0); f.y += f.vy / 60; f.vy += f.drip ? 6 : -2; f.vx *= .98; ctx.fillStyle = f.drip ? 'rgba(170,200,240,.8)' : 'rgba(225,228,236,' + Math.max(0, f.life).toFixed(2) + ')'; ctx.fillRect(Math.round(f.x), Math.round(f.y), f.drip ? 1 : 2, f.drip ? 2 : 1); });
  for (let i = feath.length - 1; i >= 0; i--) if (feath[i].life <= 0) feath.splice(i, 1);
  drawPigeon(Math.round(bird.x), Math.round(bird.y), rot, bird.frame);
  if (flashT > 0) { ctx.fillStyle = 'rgba(255,255,255,' + (flashT / .15) * .8 + ')'; ctx.fillRect(0, 0, W, H); }
  if (window.SKY && SKY.flash > .3) { const f = SKY.flash > .8 ? 1 : SKY.flash > .62 ? .35 : (SKY.flash - .3) * 1.6; ctx.fillStyle = 'rgba(225,232,255,' + (f * .2).toFixed(3) + ')'; ctx.fillRect(0, -400, W, H + 800); }   // lightning lights up the whole screen for a moment
}

let last = performance.now();
const ambSeen = { train: -9, plane: -9, fair: -9 };
const MASJIDS = { masjid: 1, masjidali: 1, suffa: 1 }; let adhanK = '', adhanCheck = -9;
window.__amb = () => { try { ambTick(); return "ok " + adhanK; } catch (e) { return e.stack; } };
function ambTick() { ['plane', 'train', 'fair', 'crowd'].forEach(k => { if (AMB[k]) ambSeen[k] = t; }); const live = state === 'play' || state === 'ready' || state === 'menu';
  if (t - adhanCheck > 5) { adhanCheck = t; adhanK = SKY.adhanNow(); }
  // a masjid on screen at prayer time: the adhan, loudest when it's in the middle of the screen
  // heard from 2-3 buildings away, getting louder on the way in, loudest as the pigeon passes the masjid, then fading away behind
  let m = 0; if (live && adhanK) lmQueue.forEach(l => { if (!MASJIDS[l.sp.k]) return; const rel = l.x + l.sp.w / 2 - bird.x, k = rel > 0 ? Math.max(0, 1 - rel / 700) : Math.max(0, 1 + rel / 420); m = Math.max(m, k * k * k * (k * (6 * k - 15) + 10)); });
  SFX.adhan(m > .002, .1125 * m);   // gentle; the owner chose this level
  const k = !live || SFX.adhanOn ? '' : ['crowd', 'plane', 'train', 'fair'].find(k => t - (ambSeen[k] || -9) < 1.2) || ''; SFX.ambient(k); }
function loop(now) { const dt = Math.min(.033, (now - last) / 1000); last = now; update(dt); draw(); try { ambTick(); } catch (e) {} requestAnimationFrame(loop); }

Promise.all([document.fonts.load('700 8px Silk'), document.fonts.load('400 8px Silk'), document.fonts.load('24px PS', '&'), document.fonts.load('700 16px Amiri', 'ا')]).catch(() => {}).then(() => {
  prerender(); prerenderHouses(); prerenderCars();
  /* home-screen pigeon: drawn at double size with extra feather detail, and it keeps flapping */
  /* Welcome to Luton road sign, drawn as pixel art in the game's own style */
  (() => { const cv = $('wsc'); if (!cv) return; const k = 3; cv.width = 240 * k; cv.height = 108 * k; const g = cv.getContext('2d'); g.scale(k, k); g.imageSmoothingEnabled = false;
    const O = '#1b1a24', PU = '#5b2a86', PL = '#7a45ab', R = (c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    const draw = () => { g.clearRect(0, 0, 240, 108);
      // wooden posts with grain, bolted on, a little grass at the feet
      for (const px of [26, 206]) { R(O, px - 1, 6, 10, 102); R('#6b4a33', px, 7, 8, 101); R('#8a6244', px + 1, 7, 2, 101); R('#4e3524', px + 6, 7, 2, 101); for (let y = 14; y < 104; y += 9) R('#5a3e2b', px + 3, y, 2, 3); }
      // sign board: outline, shadow, white panel with a pointed top
      const shape = (dx, dy, w, h, peak, col) => { g.beginPath(); g.moveTo(dx, dy + peak); g.lineTo(dx + w / 2, dy); g.lineTo(dx + w, dy + peak); g.lineTo(dx + w, dy + h); g.lineTo(dx, dy + h); g.closePath(); g.fillStyle = col; g.fill(); };
      shape(14, 16, 216, 74, 10, 'rgba(0,0,0,.25)'); shape(10, 12, 216, 74, 10, O); shape(12, 14, 212, 70, 9, '#f6f2ea'); shape(16, 18, 204, 62, 8, '#ffffff');
      R('#e8e2d6', 16, 76, 204, 4); for (const [bx, by] of [[20, 26], [216, 26], [20, 72], [216, 72]]) { R('#9aa0a8', bx, by, 3, 3); R('#c9ced4', bx, by, 2, 2); }
      // lettering
      g.textAlign = 'left'; g.textBaseline = 'top'; g.font = '700 8px Silk'; g.fillStyle = PU; g.fillText('WELCOME TO', 26, 28);
      g.font = '700 24px Silk'; g.fillStyle = '#c9b6dc'; g.fillText('LUTON', 27, 38); g.fillStyle = PU; g.fillText('LUTON', 26, 37);
      R(PU, 26, 63, 138, 2); g.font = '8px Silk'; g.fillStyle = PL; g.fillText('PROUD VIBRANT AMBITIOUS INNOVATIVE', 26, 68);
      // crest: crown over a purple shield with a white cross, ribbon underneath
      const cx = 192, cy = 24; R(O, cx - 9, cy - 1, 18, 7); R('#e8b84a', cx - 8, cy, 16, 5); for (const tx of [cx - 8, cx - 2, cx + 4]) { R(O, tx - 1, cy - 4, 6, 4); R('#e8b84a', tx, cy - 3, 4, 3); } R('#c0392b', cx - 1, cy + 1, 2, 2);
      g.beginPath(); g.moveTo(cx - 13, cy + 7); g.lineTo(cx + 13, cy + 7); g.lineTo(cx + 13, cy + 22); g.quadraticCurveTo(cx + 12, cy + 33, cx, cy + 39); g.quadraticCurveTo(cx - 12, cy + 33, cx - 13, cy + 22); g.closePath(); g.fillStyle = O; g.fill();
      g.beginPath(); g.moveTo(cx - 11, cy + 9); g.lineTo(cx + 11, cy + 9); g.lineTo(cx + 11, cy + 22); g.quadraticCurveTo(cx + 10, cy + 31, cx, cy + 36); g.quadraticCurveTo(cx - 10, cy + 31, cx - 11, cy + 22); g.closePath(); g.fillStyle = PU; g.fill();
      R(PL, cx - 11, cy + 9, 4, 14); R('#ffffff', cx - 2, cy + 12, 4, 20); R('#ffffff', cx - 8, cy + 18, 16, 4); };
    draw(); if (document.fonts) { document.fonts.load('700 24px Silk').then(draw).catch(() => {}); document.fonts.ready.then(draw); } })();
  (() => { const lc = $('logoBird').getContext('2d'); lc.imageSmoothingEnabled = false;
    const TX = { g: ['#aab3c4', '#8e97aa'], l: ['#d3d9e5', '#b1b9c9'], d: ['#8a93a5', '#6c7587'], t: ['#6a7488', '#4b5466'], n: ['#7fd39a', '#3d8a57'], p: ['#b58ad9', '#6f4895'], h: ['#97a1b5', '#6c768b'], w: ['#ffffff', '#b9c1cf'], K: ['#465063', '#22283a'] };
    const paint = (rows, ox, oy, wing) => rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const ch = r[i]; if (ch === '.') continue; const X = (ox + i) * 2, Y = (oy + j) * 2;
      lc.fillStyle = PIG_COL[ch]; lc.fillRect(X, Y, 2, 2); const tx = TX[ch]; if (!tx) continue;
      if (ch === 'n' || ch === 'p') { lc.fillStyle = tx[(i + j) % 2]; lc.fillRect(X + (j % 2), Y, 1, 1); }
      else if (ch === 'w') { lc.fillStyle = tx[0]; lc.fillRect(X, Y, 2, 1); if (i % 2) { lc.fillStyle = tx[1]; lc.fillRect(X + 1, Y + 1, 1, 1); } }
      else if (wing && ch === 'g') { lc.fillStyle = tx[1]; lc.fillRect(X + 1, Y, 1, 2); }
      else if ((i * 3 + j * 2) % 5 === 0) { lc.fillStyle = tx[0]; lc.fillRect(X, Y, 1, 1); }
      else if ((i + j * 3) % 7 === 0) { lc.fillStyle = tx[1]; lc.fillRect(X + 1, Y + 1, 1, 1); } } });
    const OX = 3, OY = 6;   // body offset inside the 32x24 grid
    const draw = f => { lc.clearRect(0, 0, 64, 48); paint(PIG_BODY, OX, OY, false);
      // eye: orange ring, black pupil, white glint; pale cere on the beak; tail bars
      const ex = (OX + 20) * 2, ey = (OY + 2) * 2; lc.fillStyle = '#f08a2a'; lc.fillRect(ex - 1, ey - 1, 4, 4); lc.fillStyle = '#1b1a24'; lc.fillRect(ex + 2, ey, 2, 2); lc.fillStyle = '#ffffff'; lc.fillRect(ex + 2, ey, 1, 1);
      lc.fillStyle = '#ffffff'; lc.fillRect((OX + 24) * 2, (OY + 3) * 2, 2, 1); lc.fillStyle = '#2a2c33'; lc.fillRect((OX + 1) * 2 + 1, (OY + 7) * 2, 1, 4);
      paint(PIG_WINGS[f], OX + 5, OY + 7 + [-9, -4, -3][f], true); }; window.__lbDraw = draw;
    let fi = 0; const seq = [0, 1, 2, 1]; draw(0); setInterval(() => { if (state !== 'menu') return; fi = (fi + 1) % 4; draw(seq[fi]); }, 140); })(); reset(); requestAnimationFrame(loop);
});
})();

/* ---------- recommend-a-place pop-up: saves to the game's inbox (falls back to email) ---------- */
(() => { const $ = id => document.getElementById(id); const m = $('recM'), f = $('recF'), ok = $('recOk'), err = $('rE'), btn = $('rS'); let db = null;
  if (window.claude && claude.use) claude.use('db').then(d => { db = d; }).catch(() => {});
  const open = e => { e.stopPropagation(); err.textContent = ''; f.classList.remove('hide'); ok.classList.add('hide'); m.classList.remove('hide'); setTimeout(() => $('rN').focus(), 50); };
  const close = e => { if (e) e.stopPropagation(); m.classList.add('hide'); };
  document.querySelectorAll('.rec').forEach(b => b.addEventListener('click', open));
  m.querySelector('.x').addEventListener('click', close); $('rC').addEventListener('click', close);
  m.addEventListener('pointerdown', e => { e.stopPropagation(); if (e.target === m) close(); });
  m.addEventListener('keydown', e => e.stopPropagation());
  btn.addEventListener('click', async e => { e.stopPropagation(); const name = $('rN').value.trim(), addr = $('rA').value.trim(), note = $('rT').value.trim();
    if (!name) { err.textContent = 'Please add the place name.'; return; }
    btn.disabled = true; btn.textContent = 'SENDING...'; let saved = false;
    try { const r = await fetch('api.php?a=rec', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, address: addr, note }) }); const j = await r.json(); if (j.ok) saved = true; else if (j.error && r.status === 429) { err.textContent = j.error; btn.disabled = false; btn.textContent = 'SEND'; return; } } catch (x) {}
    if (!saved) {
    try { if (db) { const u = await claude.use('user'), id = u && await u.id(); if (id) { const ref = db.doc('recommendations/' + id); let cur = null; try { cur = await ref.get(); } catch (x) {} const d = cur && (cur.data ? (typeof cur.data === 'function' ? cur.data() : cur.data) : cur) || {}; const list = Array.isArray(d.items) ? d.items.slice(-49) : []; list.push({ name, address: addr, note, at: new Date().toISOString() }); await ref.set({ items: list, updated: new Date().toISOString() }); saved = true; } } } catch (x) { saved = false; }
    if (!saved) { const a = document.createElement('a'); a.href = 'mailto:summar@smrgraphics.co.uk?subject=' + encodeURIComponent('Flappy Kabootar - place to feature: ' + name) + '&body=' + encodeURIComponent('Place name: ' + name + '\nAddress: ' + addr + '\nNote: ' + note); a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove(); }
    }
    if (window.TRACK_SEND) window.TRACK_SEND('rec'); btn.disabled = false; btn.textContent = 'SEND'; $('rN').value = $('rA').value = $('rT').value = ''; f.classList.add('hide'); ok.classList.remove('hide'); });
})();

/* ---------- save to home screen ---------- */
(() => { const $ = id => document.getElementById(id), m = $('hsM'), bs = document.querySelectorAll('.hsB'); if (!m || !bs.length) return;
  if (matchMedia('(display-mode: standalone)').matches || navigator.standalone) { bs.forEach(b => b.remove()); return; }
  const ua = navigator.userAgent, ios = /iP(hone|ad|od)/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1), sam = /SamsungBrowser/i.test(ua) || /SM-[A-Z0-9]/.test(ua);
  const os = k => { m.querySelectorAll('div[data-os]').forEach(d => d.classList.toggle('hide', d.dataset.os !== k)); m.querySelectorAll('.tabs button').forEach(t => t.classList.toggle('on', t.dataset.os === k)); };
  os(ios ? 'ios' : sam ? 'sam' : 'and'); m.querySelectorAll('.tabs button').forEach(t => t.addEventListener('click', e => { e.stopPropagation(); os(t.dataset.os); }));
  $('hsChrome').href = 'intent://' + location.host + location.pathname + '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' + encodeURIComponent('https://play.google.com/store/apps/details?id=com.android.chrome') + ';end';
  let dp = null; addEventListener('beforeinstallprompt', e => { e.preventDefault(); dp = e; $('hsInst').classList.remove('hide'); });
  $('hsInst').addEventListener('click', async e => { e.stopPropagation(); if (!dp) return; dp.prompt(); try { const ch = await dp.userChoice; if (ch && ch.outcome === 'accepted') TRACK.send('install'); } catch (x) {} dp = null; $('hsInst').classList.add('hide'); m.classList.add('hide'); });
  bs.forEach(b => b.addEventListener('click', e => { e.stopPropagation(); m.classList.remove('hide'); TRACK.send('hs_open'); }));
  m.querySelector('.x').addEventListener('click', e => { e.stopPropagation(); m.classList.add('hide'); });
  m.addEventListener('pointerdown', e => { e.stopPropagation(); if (e.target === m) m.classList.add('hide'); }); m.addEventListener('keydown', e => e.stopPropagation());
})();

/* ---------- keep the menus on screen on small phones (scale down, never cut off) ---------- */
(() => { const fit = () => {  ['start', 'over'].forEach(id => { const p = document.getElementById(id); if (!p || p.classList.contains('hide')) return; p.style.transform = 'translate(-50%,-50%)';
    const extra = id === 'start' ? 92 : 24, need = p.offsetHeight + extra, room = innerHeight - 16, k = Math.min(innerWidth > 640 ? Math.min(1.45, innerWidth * .62 / p.offsetWidth) : 1, room / need), dy = id === 'start' ? Math.round(78 * k / 2) : 0;
    p.style.top = 'calc(50% + ' + (id === 'start' ? dy : 0) + 'px)'; p.style.transform = 'translate(-50%,-50%) scale(' + k.toFixed(3) + ')'; }); };
  addEventListener('resize', fit); new MutationObserver(fit).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] }); setTimeout(fit, 50); setTimeout(fit, 600); })();

/* ---------- share + home ---------- */
(() => { const $ = id => document.getElementById(id), toast = m => { const t = $('shT'); t.textContent = m; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 1800); };
  const url = () => /smrgraphics|smrdigital/.test(location.host) ? 'https://smrgraphics.co.uk/flappykabootar' : location.href.split('#')[0];
  document.querySelectorAll('.shr').forEach(b => b.addEventListener('click', async e => { e.stopPropagation(); TRACK.send('share', b.dataset.share === 'app' ? 1 : 0);
    const sc = $('sc') ? $('sc').textContent : '0', text = b.dataset.share === 'app' && +sc > 0 ? '\u{1F426} I just scored ' + sc + ' on Flappy Kabootar, flying through Luton! Think you can beat me? Try it here:' : '\u{1F426} Play Flappy Kabootar: flap your way through Luton and see how many places you can spot! Try it here:';
    try { if (navigator.share) { await navigator.share({ title: 'Flappy Kabootar', text, url: url() }); return; } } catch (x) { if (x && x.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(text + ' ' + url()); toast('LINK COPIED!'); } catch (x) { window.open('https://wa.me/?text=' + encodeURIComponent(text + ' ' + url()), '_blank'); } }));
})();
</script>
</body>
</html>
