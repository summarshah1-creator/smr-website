<?php
/* SMR Digital Demo Manager (private admin). */
define('SMR_DEMO', 1);
require dirname(__DIR__) . '/demo-lib/bootstrap.php';
security_headers(true);
header('Cache-Control: no-store');
$tok = admin_token();
$mode = $tok ? 'app' : 'login';
$mark = preg_replace('/<svg /', '<svg aria-hidden="true" ', (string) @file_get_contents(SITE_ROOT . '/assets/smr-mark.svg'), 1);
?><!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#08080f">
<title>Admin</title>
<link rel="icon" href="/demo-admin/icon-192.png">
<link rel="manifest" href="/demo-admin/manifest.webmanifest">
<link rel="apple-touch-icon" href="/demo-admin/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="SMR Admin">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&family=Poppins:wght@300&display=swap" rel="stylesheet">
<style>
html{touch-action:manipulation;-webkit-text-size-adjust:100%}
:root{--bg:#08080f;--bg2:#0e0e1a;--card:#12121e;--line:rgba(255,255,255,.09);--ink:#f2f2fa;--muted:#a3a3bd;--a1:#5b5bff;--a2:#d63bff;--grad:linear-gradient(110deg,var(--a1),var(--a2));--ok:#3ddc97;--warn:#ffb547;--bad:#ff5470}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--ink);font:15px/1.45 Manrope,system-ui,sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh}
body::before{content:"";position:fixed;inset:0;pointer-events:none;background:radial-gradient(60% 40% at 10% 0%,rgba(91,91,255,.18),transparent 70%),radial-gradient(50% 40% at 100% 0%,rgba(214,59,255,.12),transparent 70%)}
a{color:#e3c8ff}
button,input,select,textarea{font:inherit;color:inherit}
button{cursor:pointer;background:none;border:0}
.wrap{position:relative;max-width:1100px;margin:0 auto;padding:0 16px calc(60px + env(safe-area-inset-bottom))}
.top{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:10px;padding:calc(10px + env(safe-area-inset-top)) 16px 10px;background:rgba(8,8,15,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line);margin:0 -16px 18px}
.logo{display:flex;align-items:center;gap:6px;margin-right:auto}
.logo svg{height:15px;width:auto}
.logo span{font-family:Poppins,sans-serif;font-weight:300;font-size:16px;line-height:1.25;padding-bottom:.15em;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.logo b{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-left:6px;font-weight:700}
.tabs{display:flex;gap:4px;padding:4px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid var(--line)}
.tabs button{padding:8px 14px;border-radius:10px;font-weight:700;font-size:13.5px;color:var(--muted)}
.tabs button.on{background:var(--grad);color:#fff}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:42px;padding:0 16px;border-radius:13px;font-weight:700;font-size:14px;border:1px solid var(--line);background:rgba(255,255,255,.04);white-space:nowrap;text-decoration:none;color:var(--ink)}
.btn:hover{border-color:rgba(255,255,255,.2)}
.btn.pri{background:var(--grad);border:0;color:#fff;box-shadow:0 10px 26px -12px rgba(214,59,255,.8)}
.btn.sm{height:34px;padding:0 11px;font-size:13px;border-radius:10px}
.btn.bad{color:#ff9db0}
.btn[disabled]{opacity:.5;pointer-events:none}
.btn svg{width:16px;height:16px}
h1{font-family:Sora,sans-serif;font-size:24px;letter-spacing:-.02em}
h2{font-family:Sora,sans-serif;font-size:18px;letter-spacing:-.01em;margin-bottom:12px}
.sub{color:var(--muted);font-size:14px;margin-top:4px}
.bar{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px}
.panel{background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.02));border:1px solid var(--line);border-radius:20px;padding:18px;margin-bottom:16px}
label.f{display:block;font-size:12.5px;font-weight:700;color:var(--muted);margin:14px 0 6px;letter-spacing:.02em}
input[type=text],input[type=password],input[type=number],input[type=tel],input[type=email],textarea,select{width:100%;height:46px;padding:0 14px;border-radius:13px;border:1px solid var(--line);background:#0c0c16;outline:0;font-size:15px}
textarea{height:auto;min-height:90px;padding:12px 14px;resize:vertical;line-height:1.45}
input:focus,textarea:focus,select:focus{border-color:rgba(214,59,255,.6);box-shadow:0 0 0 3px rgba(214,59,255,.15)}
.pick{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.pick label{position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 10px 12px;border-radius:16px;border:1px solid var(--line);background:rgba(255,255,255,.03);cursor:pointer;text-align:center;transition:.15s}
.pick label:hover{border-color:rgba(255,255,255,.2)}
.pick input{position:absolute;opacity:0;pointer-events:none}
.pick img{width:58px;height:58px;border-radius:15px;object-fit:cover;box-shadow:0 0 0 1px rgba(255,255,255,.08)}
.pick b{font-size:13.5px;line-height:1.2}
.pick small{font-size:11.5px;color:var(--muted);line-height:1.25}
.pick .ck{position:absolute;top:8px;right:8px;width:22px;height:22px;border-radius:7px;border:1.5px solid rgba(255,255,255,.25);display:grid;place-items:center}
.pick .ck svg{width:14px;height:14px;opacity:0}
.pick input:checked+.ck{background:var(--grad);border-color:transparent}
.pick input:checked+.ck svg{opacity:1}
.pick label:has(input:checked){border-color:rgba(214,59,255,.65);background:rgba(214,59,255,.08)}
.pick input:focus-visible+.ck{box-shadow:0 0 0 3px rgba(214,59,255,.35)}
.seg{display:flex;flex-wrap:wrap;gap:8px}
.seg label{flex:1 1 170px;padding:12px 14px;border-radius:14px;border:1px solid var(--line);cursor:pointer;background:rgba(255,255,255,.03)}
.seg label:has(input:checked){border-color:rgba(214,59,255,.65);background:rgba(214,59,255,.08)}
.seg input{accent-color:#d63bff;margin-right:6px}
.seg small{display:block;color:var(--muted);font-size:12px;margin-top:3px}
.chips{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.chips button{height:38px;padding:0 14px;border-radius:11px;border:1px solid var(--line);font-weight:700;font-size:13.5px;background:rgba(255,255,255,.03)}
.chips button.on{background:var(--grad);border-color:transparent;color:#fff}
.chips input{width:90px;height:38px}
.toggle{display:flex;align-items:center;gap:10px;margin-top:14px;font-weight:600;cursor:pointer}
.toggle input{width:20px;height:20px;accent-color:#d63bff}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.list{display:grid;gap:12px}
.lk{border:1px solid var(--line);border-radius:18px;padding:14px;background:rgba(255,255,255,.025)}
.lk .hd{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.lk .hd b{font-size:15.5px;margin-right:auto}
.badge{font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:4px 9px;border-radius:999px;border:1px solid}
.badge.active{color:var(--ok);border-color:rgba(61,220,151,.4);background:rgba(61,220,151,.08)}
.badge.not_activated,.badge.uses_left{color:#cfc4ff;border-color:rgba(207,196,255,.35);background:rgba(207,196,255,.06)}
.badge.expired{color:var(--warn);border-color:rgba(255,181,71,.4);background:rgba(255,181,71,.08)}
.badge.revoked{color:var(--bad);border-color:rgba(255,84,112,.4);background:rgba(255,84,112,.08)}
.icons{display:flex;gap:5px;flex-wrap:wrap;margin:10px 0}
.icons img{width:30px;height:30px;border-radius:9px;box-shadow:0 0 0 1px rgba(255,255,255,.08)}
.meta{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px 14px;font-size:13px;color:var(--muted);margin-bottom:12px}
.meta span b{display:block;color:var(--ink);font-weight:700;font-size:13.5px}
.cred{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:10px 12px;border-radius:13px;background:#0c0c16;border:1px solid var(--line);margin-bottom:12px;font-size:13px}
.cred code{font-family:ui-monospace,Menlo,monospace;font-size:12.5px;word-break:break-all;flex:1;min-width:180px;color:#cfc4ff}
.cred .pin{font-family:Sora,sans-serif;font-size:19px;letter-spacing:.18em}
.acts{display:flex;gap:8px;flex-wrap:wrap}
.dm{display:flex;gap:14px;align-items:flex-start;border:1px solid var(--line);border-radius:18px;padding:14px;background:rgba(255,255,255,.025)}
.dm>img{width:64px;height:64px;border-radius:16px;flex:none;object-fit:cover;box-shadow:0 0 0 1px rgba(255,255,255,.08)}
.dm .tx{flex:1;min-width:0}
.dm .tx b{font-size:16px}
.dm .tx p{color:var(--muted);font-size:13px;margin:4px 0 10px}
.dm form{margin-top:10px}
.dg{border:1px solid var(--line);border-radius:18px;padding:12px;margin-top:14px;background:rgba(255,255,255,.025)}
.dg .dh{display:flex;gap:8px;align-items:center}.dg .dh input{height:40px;font-weight:700}
.dthumbs{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px;margin-top:10px}
.dth{position:relative;border-radius:12px;overflow:hidden;border:1px solid var(--line);background:#0c0c16}
.dth .im{height:110px;display:grid;place-items:center;padding:6px}.dth img{max-width:100%;max-height:98px;border-radius:4px}
.dth .lb{font-size:11.5px;font-weight:800;padding:4px 7px 5px;border-top:1px solid var(--line);line-height:1.25}
.dth .lb small{display:block;color:var(--muted);font-weight:700;font-size:10.5px}
.dth .ctl{position:absolute;top:4px;left:4px;right:4px;display:flex;gap:3px}
.dth .ctl button{width:24px;height:24px;border-radius:7px;background:rgba(8,8,15,.8);display:grid;place-items:center;font-size:13px;font-weight:800}
.dth .ctl button:last-child{margin-left:auto;color:#ff9db0}
.dadd{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:132px;border-radius:12px;border:1.5px dashed rgba(207,196,255,.35);color:#cfc4ff;font-weight:800;font-size:12.5px;text-align:center;padding:8px}
.dadd svg{width:22px;height:22px}
.dadd.drag{background:rgba(214,59,255,.1);border-color:#d63bff}
.dprog{height:8px;border-radius:5px;background:rgba(255,255,255,.08);overflow:hidden;margin:14px 0 8px}.dprog i{display:block;height:100%;width:0;background:var(--grad);transition:width .2s}
.dcard .th{display:flex;gap:5px;margin:10px 0}.dcard .th img{width:46px;height:46px;object-fit:cover;border-radius:9px;box-shadow:0 0 0 1px rgba(255,255,255,.08);background:#0c0c16}
.dpg{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:14px;border-radius:16px;border:1px solid rgba(255,181,71,.4);background:rgba(255,181,71,.07);margin-bottom:14px}
.dpg b{display:block}.dpg span{color:var(--muted);font-size:13px}
.deckbox{margin-top:16px;padding:12px;border-radius:16px;border:1px solid rgba(255,200,87,.45);background:rgba(255,200,87,.07)}
.dkrow{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.dkbtns{display:flex;gap:8px;width:100%}.dkbtns .btn{flex:1}.dkrow+.dkrow{margin-top:10px;padding-top:10px;border-top:1px solid var(--line)}
.dkrow img{width:64px;height:36px;object-fit:cover;border-radius:6px;box-shadow:0 0 0 1px rgba(255,255,255,.12);flex:none;background:#111}
.dkrow .tx{flex:1;min-width:0}.dkrow b{display:block;font-size:13.5px;color:#ffd88a}.dkrow small{display:block;color:var(--muted);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hidden{display:none!important}
.empty{color:var(--muted);text-align:center;padding:30px}
.toast{position:fixed;z-index:99;left:50%;bottom:calc(20px + env(safe-area-inset-bottom));transform:translate(-50%,20px);opacity:0;transition:.25s;padding:12px 18px;border-radius:14px;background:#1b1830;border:1px solid rgba(207,196,255,.4);font-weight:700;pointer-events:none;max-width:calc(100vw - 30px);text-align:center}
.toast.on{opacity:1;transform:translate(-50%,0)}
.toast.bad{background:#2a1420;border-color:rgba(255,84,112,.6)}
.auth{min-height:100vh;display:grid;place-items:center;padding:24px}
.auth .panel{width:100%;max-width:400px}
.auth .logo{justify-content:center;margin:0 0 18px}
.auth .logo svg{height:22px}.auth .logo span{font-size:22px}
.pindots{display:flex;justify-content:center;gap:16px;margin:22px 0 4px}
.pindots i{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.35);transition:.15s}
.pindots i.on{background:linear-gradient(110deg,#5b5bff,#d63bff);border-color:transparent;transform:scale(1.1)}
.pindots.shake{animation:shake .4s}
@keyframes shake{20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
.keys{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:290px;margin:14px auto 0}
.keys button{height:66px;border-radius:50%;width:66px;margin:0 auto;font:600 26px Sora,system-ui,sans-serif;background:rgba(255,255,255,.06);border:1px solid var(--line);-webkit-tap-highlight-color:transparent}
.keys button:active{background:rgba(214,59,255,.3)}
.keys button svg{width:26px;height:26px}
.err{color:#ff9db0;font-weight:600;min-height:20px;margin-top:10px;font-size:14px}
.result{border:1px solid rgba(61,220,151,.4);background:rgba(61,220,151,.06)}
.send{border-color:rgba(214,59,255,.35);background:linear-gradient(180deg,rgba(214,59,255,.08),rgba(91,91,255,.03))}
.two{display:grid;grid-template-columns:1fr;gap:0 14px}@media(min-width:640px){.two{grid-template-columns:1fr 1fr}}
.more{margin-top:14px;border-top:1px solid var(--line);padding-top:12px}
.more summary{cursor:pointer;font-weight:700;color:#cfc4ff;font-size:13.5px}
.btn.big{width:100%;height:52px;font-size:16px;margin-top:6px;border-radius:15px}
.btn.wa{background:#25d366;border:0;color:#062b14}
.msg{min-height:190px;font-size:14px}
.usedbn{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;padding:12px 14px;margin:-4px 0 12px;border-radius:14px;background:rgba(61,220,151,.12);border:1px solid rgba(61,220,151,.45)}
.usedbn b{color:#7ff0bd;font-size:14.5px}.usedbn span{flex:1 1 200px;font-size:13px;color:var(--muted)}
.newpin{font-family:Sora,sans-serif;font-size:34px;letter-spacing:.2em;margin:4px 0 10px}
.prog{height:6px;border-radius:9px;background:rgba(255,255,255,.08);overflow:hidden;margin-top:10px}
.prog i{display:block;height:100%;width:0;background:var(--grad);transition:width .2s}
.filt{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
/* email */
.mrow{display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;padding:12px 14px;border-top:1px solid var(--line);color:var(--ink)}
.mrow:first-child{border-top:0}.mrow:active{background:rgba(255,255,255,.04)}
.mrow .ud{width:8px;height:8px;border-radius:50%;margin-top:7px;flex:none;background:transparent}
.mrow.un .ud{background:var(--a2);box-shadow:0 0 0 3px rgba(214,59,255,.18)}
.mrow .mt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.mrow .l1{display:flex;gap:8px;align-items:baseline}
.mrow .l1 b{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:15px;font-weight:600}
.mrow.un .l1 b,.mrow.un .sj{font-weight:800}
.mrow .l1 em{font-style:normal;font-size:12px;color:var(--muted);flex:none}
.mrow .sj{font-size:13.5px;color:#d9d9ea;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mrow .sj svg{width:13px;height:13px;vertical-align:-2px;margin-right:4px;color:var(--muted)}
.ov{position:fixed;inset:0;z-index:70;background:var(--bg);display:flex;flex-direction:column;transform:translateX(102%);transition:transform .25s ease;visibility:hidden}
.ov.on{transform:none;visibility:visible}
.ovh{display:flex;align-items:center;gap:8px;padding:calc(10px + env(safe-area-inset-top)) 12px 10px;border-bottom:1px solid var(--line);background:rgba(8,8,15,.96)}
.ovh .t{flex:1;min-width:0;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ovb{flex:1;min-height:0;overflow:auto;padding:14px 16px calc(16px + env(safe-area-inset-bottom))}
.rd{flex:1;min-height:0;display:flex;flex-direction:column}
.rdm{padding:14px 16px 12px;border-bottom:1px solid var(--line)}
.rdm h2{margin:0 0 8px;font-size:19px;line-height:1.3;word-break:break-word}
.rdm p{font-size:13px;color:var(--muted);word-break:break-word}.rdm p b{color:var(--ink)}
.atts{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.atts a{display:inline-flex;align-items:center;gap:6px;max-width:100%;padding:7px 10px;border-radius:10px;border:1px solid var(--line);background:rgba(255,255,255,.04);font-size:12.5px;font-weight:700;color:var(--ink);text-decoration:none}
.atts a svg{width:14px;height:14px;flex:none}
.atts a span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.atts a small{color:var(--muted);font-weight:600}
.rd iframe{flex:1;width:100%;border:0;background:#fff;min-height:200px}
.cmp label.f:first-child{margin-top:0}
.cmp textarea{min-height:240px}
.acw{position:relative}.acl{position:absolute;z-index:5;left:0;right:0;top:calc(100% + 4px);background:#171726;border:1px solid var(--line);border-radius:12px;box-shadow:0 16px 36px -12px rgba(0,0,0,.8);overflow:hidden;max-height:264px;overflow-y:auto}
.acl button{display:flex;flex-direction:column;align-items:flex-start;gap:1px;width:100%;padding:9px 13px;background:none;border:0;border-bottom:1px solid var(--line);text-align:left;cursor:pointer}.acl button:last-child{border-bottom:0}
.acl button b{font-size:14px;font-weight:700}.acl button span{font-size:12.5px;color:var(--muted)}.acl button.on,.acl button:hover{background:rgba(155,108,255,.16)}.acl mark{background:none;color:#c9a8ff;font-weight:800}
.rte{border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.035);position:relative}
.rtb{position:sticky;top:0;z-index:3;display:flex;flex-wrap:wrap;gap:2px;padding:6px;background:#12121e;border-bottom:1px solid var(--line);border-radius:14px 14px 0 0}
.rb{height:34px;min-width:34px;padding:0 7px;border:0;border-radius:9px;background:none;color:#d9d9ea;display:inline-flex;align-items:center;justify-content:center;gap:2px;font-size:15px;cursor:pointer;-webkit-tap-highlight-color:transparent}
.rb svg{width:18px;height:18px}.rb .cv{width:12px;height:12px}.rb:hover{background:rgba(255,255,255,.07)}.rb.on{background:rgba(155,108,255,.25);color:#fff}
.rb b,.rb i,.rb u,.rb s{font-family:Georgia,serif;font-size:17px}.tsz{font-weight:800;font-size:14px}
.tcol{position:relative;font-weight:800;font-size:16px;padding-bottom:3px}.tcol i{position:absolute;left:-2px;right:-2px;bottom:0;height:3px;border-radius:2px;background:#ff5470}
.rsep{width:1px;align-self:stretch;margin:5px 3px;background:var(--line)}
.rpop[hidden],.acl[hidden]{display:none}
@media(max-width:760px){.rtb{flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}.rtb::-webkit-scrollbar{display:none}.rb{flex:none}.rsep{flex:none}}
.rbody{min-height:240px;padding:13px 14px;outline:none;line-height:1.55;font-size:15.5px;word-wrap:break-word;overflow-wrap:anywhere;-webkit-user-select:text;user-select:text}
.rbody:empty:before{content:"Write your email…";color:var(--muted)}
.rbody ul,.rbody ol{margin:4px 0;padding-left:24px}.rbody blockquote{margin:4px 0 4px 6px;padding-left:12px;border-left:3px solid #6b5bd6;color:#cfcfe4}.rbody a{color:#b79bff}
.rpop{position:absolute;z-index:6;left:6px;top:50px;background:#1b1b2c;border:1px solid var(--line);border-radius:12px;padding:8px;box-shadow:0 16px 36px -12px rgba(0,0,0,.8);display:flex;flex-wrap:wrap;gap:6px;max-width:292px}
.rpop .sw{width:30px;height:30px;border-radius:50%;border:2px solid rgba(255,255,255,.18);cursor:pointer}.rpop .sz{padding:6px 12px;border-radius:9px;border:1px solid var(--line);background:none;cursor:pointer}
.rpop .lk{display:flex;gap:6px;width:260px}.rpop .lk input{flex:1;height:38px;font-size:14px}
.cpq{margin-top:12px;padding:10px 12px;border-left:3px solid #6b5bd6;border-radius:4px;color:var(--muted);font-size:13.5px;white-space:pre-wrap;max-height:260px;overflow:auto}
html.cpopen,body.cpopen{overscroll-behavior:none}
.cpatt{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px}.cpatt .btn svg{width:16px;height:16px}#cpattsum{font-size:12.5px;color:var(--muted)}#cpattsum.warn{color:var(--warn)}#cpattsum.bad{color:var(--bad)}
.attl{display:grid;gap:8px;margin-top:10px}.attl:empty{display:none}
.atc{position:relative;display:flex;align-items:center;gap:10px;padding:8px 8px 8px 8px;border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.035);overflow:hidden}
.atc .th{flex:none;width:40px;height:40px;border-radius:9px;background:#24243a center/cover no-repeat;display:flex;align-items:center;justify-content:center;font:800 10px/1 Manrope,sans-serif;letter-spacing:.03em;color:#fff;text-transform:uppercase}
.atc .nm{flex:1;min-width:0}.atc .nm b{display:block;font-size:13.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.atc .nm small{font-size:12px;color:var(--muted)}.atc.err .nm small{color:var(--bad)}
.atc .x{flex:none;width:32px;height:32px;border-radius:9px;border:0;background:rgba(255,255,255,.07);color:#fff;font-size:18px;line-height:1;cursor:pointer}
.atc .pb{position:absolute;left:0;bottom:0;height:3px;background:var(--grad);transition:width .2s}
#compose.drop .ovb{outline:2px dashed #9b6cff;outline-offset:-8px}
.cpt{display:flex;flex-direction:column;min-width:0;line-height:1.15}.cpt b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cpt small{font-size:11px;font-weight:600;color:var(--muted);white-space:nowrap;min-height:12px}
#compose .ovh .btn[data-cp=save]{padding:0 11px;white-space:nowrap}@media(max-width:400px){#compose .ovh{gap:6px}#compose .ovh .btn[data-cp=save]{padding:0 9px;font-size:12.5px}}
.dcnt{margin-left:5px;font-size:11px;font-weight:800;opacity:.75}.dcnt:empty{display:none}
.drow{position:relative}.drow .mrow{padding-right:52px}.drow .dx{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:34px;height:34px;border-radius:10px;border:0;background:rgba(255,255,255,.06);color:var(--muted);font-size:18px;cursor:pointer}
.mrow .dr{color:var(--warn);font-weight:800;margin-right:4px}.mrow .sn{display:block;font-size:12.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}#compose .ovb{overscroll-behavior:contain}
.mailfrom{font-size:12.5px;color:var(--muted);margin-bottom:4px}
.sigprev{margin-top:10px;padding:0 0 4px}.sigprev:empty{display:none}
.top .tabs button{padding:8px 4px;white-space:nowrap;font-size:13px}
.filt button{height:32px;padding:0 12px;border-radius:999px;border:1px solid var(--line);font-size:12.5px;font-weight:700;color:var(--muted)}
.filt button.on{color:#fff;border-color:rgba(214,59,255,.6);background:rgba(214,59,255,.12)}
.btn.icon{width:38px;padding:0}
.top{flex-wrap:wrap}
.top .tabs{order:3;width:100%}.top .tabs button{flex:1;position:relative}
.cnt{display:inline-grid;place-items:center;min-width:18px;height:18px;padding:0 5px;margin-left:6px;border-radius:9px;background:#3ddc97;color:#062b14;font-size:11px;font-weight:800;vertical-align:1px}.cnt:empty{display:none}
.rows{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:18px;overflow:hidden;background:rgba(255,255,255,.02)}
.rw{display:flex;align-items:center;gap:6px;padding:0 6px 0 0;border-top:1px solid var(--line)}
.rw:first-child{border-top:0}
.rw .open{flex:1;min-width:0;display:flex;align-items:center;gap:13px;padding:11px 12px;color:var(--ink);text-decoration:none}
.rw .open:active{background:rgba(255,255,255,.04)}
.rw img{width:46px;height:46px;border-radius:12px;object-fit:cover;flex:none;box-shadow:0 0 0 1px rgba(255,255,255,.08)}
.rw span{min-width:0;display:flex;flex-direction:column;gap:2px}
.rw b{font-size:15.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rw small{font-size:12.5px;color:var(--muted)}
.rw.off img{opacity:.45}
.tag{font-style:normal;font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--warn);margin-left:6px}.tag.bad{color:var(--bad)}
.dots{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;color:var(--muted);flex:none}
.dots:hover,.dots:active{background:rgba(255,255,255,.06);color:var(--ink)}
.dots svg,.btn.icon svg{width:20px;height:20px}
.scrim{position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.55);opacity:0;pointer-events:none;transition:.2s}
.scrim.on{opacity:1;pointer-events:auto}
.sheet{position:fixed;z-index:90;left:0;right:0;bottom:0;max-height:88vh;overflow:auto;background:#14141f;border-top-left-radius:22px;border-top-right-radius:22px;border:1px solid var(--line);padding:8px 16px calc(18px + env(safe-area-inset-bottom));transform:translateY(105%);transition:transform .25s ease;max-width:560px;margin:0 auto}
.sheet.on{transform:none}
.grab{width:40px;height:5px;border-radius:3px;background:rgba(255,255,255,.18);margin:4px auto 12px}
.sheet h2{margin-bottom:6px}
.sh-h{display:flex;gap:12px;align-items:center;padding:4px 4px 12px;border-bottom:1px solid var(--line);margin-bottom:6px}
.sh-h img{width:44px;height:44px;border-radius:12px}
.sh-h b{display:block;font-size:16px}.sh-h small{color:var(--muted);font-size:12.5px}
.it{display:flex;width:100%;align-items:center;gap:10px;padding:14px 8px;border-radius:12px;font-weight:700;font-size:15px;text-align:left}
.it:hover,.it:active{background:rgba(255,255,255,.05)}
.it.bad{color:#ff9db0}.it.muted{color:var(--muted);justify-content:center}
.grid4{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}.grid4 .btn{height:56px;font-size:16px}
.notif{display:flex;gap:12px;align-items:center;justify-content:space-between;padding:14px;border-radius:16px;border:1px solid rgba(61,220,151,.35);background:rgba(61,220,151,.06);margin-bottom:14px}
.notif b{display:block}.notif span{font-size:13px;color:var(--muted)}
.lk .icons{align-items:center}.lk .icons span{font-size:13px;color:var(--muted);margin-left:4px}
.lk .line{font-size:13px;color:var(--muted);margin:2px 0 4px}
.lk .views{font-size:13px;color:var(--muted);margin:0 0 10px}.lk .views b{color:#fff;font-size:14px}
.lk .left{display:flex;align-items:baseline;gap:10px;margin:0 0 12px}.lk .left span{font-size:12px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em}
.lk .left b{font-family:Sora,sans-serif;font-size:28px;font-variant-numeric:tabular-nums;color:#7ff0bd}
.lk.low .left b{color:var(--warn)}
.lk.active{border-color:rgba(61,220,151,.35)}
.lk.expired,.lk.revoked{opacity:.75}
.feed{display:flex;flex-direction:column;gap:2px}
.ev{display:flex;align-items:center;gap:10px;padding:10px 4px;border-bottom:1px solid var(--line);font-size:13.5px}
.ev i{width:8px;height:8px;border-radius:50%;background:#cfc4ff;flex:none}.ev.opened i{background:#3ddc97}.ev.low i{background:var(--warn)}.ev.ended i{background:var(--bad)}
.ev span{flex:1;min-width:0}.ev small{color:var(--muted);font-size:12px;white-space:nowrap}
@media(max-width:600px){.logo b{display:none}}
</style>
</head>
<body>
<?php if ($mode !== 'app'): ?>
<div class="auth">
  <form class="panel" id="auth" autocomplete="off">
    <div class="logo"><?= $mark ?><span>Digital</span></div>
    <h1 style="text-align:center">Admin</h1>
    <p class="sub" style="text-align:center">Enter your PIN</p>
    <div class="pindots" id="dots" aria-live="polite"><i></i><i></i><i></i><i></i></div>
    <div class="err" id="err" role="alert" style="text-align:center"></div>
    <div class="keys" id="keys">
      <button type="button" data-k="1">1</button><button type="button" data-k="2">2</button><button type="button" data-k="3">3</button>
      <button type="button" data-k="4">4</button><button type="button" data-k="5">5</button><button type="button" data-k="6">6</button>
      <button type="button" data-k="7">7</button><button type="button" data-k="8">8</button><button type="button" data-k="9">9</button>
      <span></span><button type="button" data-k="0">0</button><button type="button" data-k="del" aria-label="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5H9l-6 7 6 7h12z"/><path d="M14 10l4 4M18 10l-4 4"/></svg></button>
    </div>
  </form>
</div>
<script>
(function(){var err=document.getElementById('err'),dots=document.querySelectorAll('#dots i'),pin='',busy=false;
var paint=function(){dots.forEach(function(d,i){d.classList.toggle('on',i<pin.length)})};
var send=function(){busy=true;
  fetch('api.php?a=login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({pin:pin})})
  .then(function(r){return r.json()}).then(function(j){if(j.ok){location.reload();return}
    err.textContent=j.error||'Something went wrong.';document.getElementById('dots').classList.add('shake');setTimeout(function(){document.getElementById('dots').classList.remove('shake');pin='';paint();busy=false},450)})
  .catch(function(){err.textContent='No connection.';pin='';paint();busy=false})};
var press=function(k){if(busy)return;err.textContent='';if(k==='del')pin=pin.slice(0,-1);else if(pin.length<4)pin+=k;paint();if(pin.length===4)send()};
document.getElementById('keys').addEventListener('click',function(e){var b=e.target.closest('[data-k]');if(b)press(b.dataset.k)});
document.addEventListener('keydown',function(e){if(/^\d$/.test(e.key))press(e.key);else if(e.key==='Backspace')press('del')});
})();
</script>
<?php else: ?>
<div class="wrap">
  <div class="top">
    <div class="logo"><?= $mark ?><span>Digital</span><b>Admin</b></div>
    <button class="btn sm icon" id="refresh" aria-label="Refresh" title="Refresh"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg></button>
    <button class="btn sm icon" id="acct" aria-label="Settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg></button>
    <nav class="tabs" role="tablist">
      <button data-tab="demos" role="tab">My demos</button>
      <button data-tab="send" role="tab">Send</button>
      <button data-tab="live" role="tab">Live<span class="cnt" id="livecnt"></span></button>
      <button data-tab="designs" role="tab">Designs</button>
      <button data-tab="mail" role="tab">Email<span class="cnt" id="mailcnt"></span></button>
    </nav>
  </div>

  <!-- MY DEMOS -->
  <section id="tab-demos" class="tab">
    <div class="bar">
      <div><h1>My demos</h1><p class="sub">Tap an app to open it. No PIN, no time limit.</p></div>
      <button class="btn sm" id="newdemo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Add app</button>
    </div>
    <div class="rows" id="demos"></div>
  </section>

  <!-- SEND -->
  <section id="tab-send" class="tab hidden">
    <form class="panel send" id="linkform">
      <h1>Send demos</h1>
      <p class="sub">Pick the apps, create the link, then send it on WhatsApp with the PIN.</p>
      <div class="row" style="justify-content:space-between;margin-top:16px"><label class="f" style="margin:0">1. Which apps?</label><button type="button" class="btn sm" id="selall">Select all</button></div>
      <div class="pick" id="pick" style="margin-top:8px"></div>
      <div class="two">
        <div><label class="f" for="lb">2. Their name (optional)</label><input type="text" id="lb" placeholder="e.g. Ahmed, Kebab House" maxlength="80"></div>
        <div><label class="f" for="ph">Their WhatsApp number (optional)</label><input type="tel" id="ph" placeholder="07..." inputmode="tel" maxlength="20"></div>
      </div>
      <details class="more"><summary id="moresum">More options (45 minutes, one shared timer)</summary>
        <label class="f">Access type</label>
        <div class="seg">
          <label><input type="radio" name="mode" value="shared" checked>Shared, one timer<small>Works on any of their devices. One clock from the first time the PIN is used.</small></label>
          <label><input type="radio" name="mode" value="single">One device<small>PIN works once, on one device.</small></label>
          <label><input type="radio" name="mode" value="limited">Limited uses<small>PIN works <input type="number" id="maxu" value="3" min="2" max="500" style="width:64px;height:30px;padding:0 6px;display:inline-block"> times, each with its own timer.</small></label>
        </div>
        <label class="f">Session length</label>
        <div class="chips" id="dur"><button type="button" data-m="15">15 min</button><button type="button" data-m="30">30 min</button><button type="button" data-m="45" class="on">45 min</button><button type="button" data-m="60">1 hour</button><button type="button" data-m="120">2 hours</button><button type="button" data-m="1440">1 day</button><button type="button" data-m="10080">1 week</button><button type="button" data-m="43200">30 days</button><button type="button" data-m="0">No limit</button><input type="number" id="durc" min="5" max="43200" placeholder="mins" aria-label="Custom minutes"></div>
      </details>
      <label class="toggle" style="margin-top:16px;align-items:flex-start"><input type="checkbox" id="tips" style="flex:none;margin-top:1px"><span>Show app / website features<small style="display:block;color:var(--muted);font-weight:500;font-size:12.5px;margin-top:2px">Off: no features tab at all. On: a features tab under the bar explains what it does.</small></span></label>
      <div class="deckbox hidden" id="deckrow">
        <div id="decklist"></div>
        <label class="toggle" style="margin-top:12px;align-items:flex-start"><input type="checkbox" id="deckopt" style="flex:none;margin-top:1px"><span>Include the features deck in the link<small style="display:block;color:var(--muted);font-weight:500;font-size:12.5px;margin-top:2px" id="decknote">They'll see a clear "Open presentation" button with the app.</small></span></label>
      </div>
      <label class="toggle" style="margin-top:16px;align-items:flex-start"><input type="checkbox" id="direct" style="flex:none;margin-top:1px"><span>Open straight into it<small style="display:block;color:var(--muted);font-weight:500;font-size:12.5px;margin-top:2px">For one app or website. No demo list or menus, just an SMR Digital Demo bar with the version number, your website and WhatsApp. Always shows the latest version.</small></span></label>
      <label class="toggle" style="margin-top:16px;align-items:flex-start"><input type="checkbox" id="usepin" checked style="flex:none;margin-top:1px"><span>Ask for a PIN<small style="display:block;color:var(--muted);font-weight:500;font-size:12.5px;margin-top:2px">Turn off to send just the link. They tap Open and they're in (with "Open straight into it" there's no tap at all).</small></span></label>
      <div class="err" id="lerr"></div>
      <button class="btn pri big" type="submit">Create link</button>
    </form>
    <div class="panel result hidden" id="created"></div>
  </section>

  <!-- LIVE -->
  <section id="tab-live" class="tab hidden">
    <div class="bar"><div><h1>Live links</h1><p class="sub">Who has opened a demo, how long they have left, and extend or end it.</p></div></div>
    <div class="notif hidden" id="notif"><div><b>Get notified</b><span>When someone opens a demo, and when their time is nearly up.</span></div><button class="btn sm pri" id="notifon">Turn on</button></div>
    <div class="filt" id="filt"><button class="on" data-f="live">Live &amp; waiting</button><button data-f="open">Open links</button><button data-f="ended">Ended</button><button data-f="all">All</button></div>
    <div class="list" id="links"></div>
    <h2 style="margin-top:26px">Recent activity</h2>
    <div class="feed" id="feed"></div>
  </section>

  <!-- DESIGNS -->
  <section id="tab-designs" class="tab hidden">
    <div class="bar">
      <div><h1>Designs</h1><p class="sub">Send finished designs to a client. The link works for 14 days, then the files go to the archive.</p></div>
      <button class="btn sm pri" id="dnewb"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>New</button>
    </div>
    <div id="dpurge"></div>
    <div class="filt" id="dfilt"><button class="on" data-f="live">Active</button><button data-f="arch">Archive</button></div>
    <div class="list" id="dlist"><p class="empty">Loading…</p></div>
  </section>

  <!-- EMAIL -->
  <section id="tab-mail" class="tab hidden">
    <div class="bar">
      <div><h1>Email</h1><p class="sub" id="mailaddr">Your inbox, right here.</p></div>
      <div class="row" id="mailbtns">
        <button class="btn sm icon" id="mailre" aria-label="Check for new email" title="Check for new email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg></button>
        <button class="btn sm icon" id="mailcfg" aria-label="Email settings" title="Email settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></button>
        <button class="btn sm pri" id="mailnew"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>Write</button>
      </div>
    </div>
    <div class="filt" id="mailf"><button class="on" data-f="inbox">Inbox</button><button data-f="sent">Sent</button><button data-f="drafts">Drafts<span class="dcnt" id="draftcnt"></span></button></div>
    <div id="mailbody"><p class="empty">Loading…</p></div>
  </section>
</div>

<!-- email: reader + compose -->
<div class="ov" id="reader" role="dialog" aria-modal="true">
  <div class="ovh">
    <button class="btn sm icon" data-rd="back" aria-label="Back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
    <span class="t">Email</span>
    <button class="btn sm" data-rd="reply"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>Reply</button>
    <button class="btn sm icon" data-rd="more" aria-label="More"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></button>
  </div>
  <div class="rd"><div class="rdm" id="rdmeta"></div><iframe id="rdframe" title="Email" sandbox="allow-popups allow-popups-to-escape-sandbox" referrerpolicy="no-referrer"></iframe></div>
</div>
<div class="ov" id="compose" role="dialog" aria-modal="true">
  <div class="ovh">
    <button class="btn sm icon" data-cp="close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <span class="t cpt"><b id="cptitle">New email</b><small id="cpstat"></small></span>
    <button class="btn sm" data-cp="save" title="Save to drafts">Save draft</button>
    <button class="btn sm icon" data-cp="attach" aria-label="Attach files" title="Attach files"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.4 11.1l-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/></svg></button>
    <button class="btn sm pri" data-cp="send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>Send</button>
  </div>
  <form class="ovb cmp" id="cpform" autocomplete="off">
    <p class="mailfrom" id="cpfrom"></p>
    <label class="f" for="cpto">To</label><div class="acw"><input type="text" id="cpto" inputmode="email" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="name@example.com" data-ac><div class="acl" hidden></div></div>
    <label class="f" for="cpcc">Cc (optional)</label><div class="acw"><input type="text" id="cpcc" inputmode="email" autocapitalize="off" autocorrect="off" spellcheck="false" data-ac><div class="acl" hidden></div></div>
    <label class="f" for="cpsub">Subject</label><input type="text" id="cpsub" maxlength="200">
    <label class="f" for="cpbody">Message</label>
    <div class="rte"><div class="rtb" id="cptb" role="toolbar" aria-label="Formatting"><button type="button" class="rb" data-rt="bold" title="Bold" aria-label="Bold"><b>B</b></button><button type="button" class="rb" data-rt="italic" title="Italic" aria-label="Italic"><i>I</i></button><button type="button" class="rb" data-rt="underline" title="Underline" aria-label="Underline"><u>U</u></button><button type="button" class="rb" data-rt="strikeThrough" title="Strikethrough" aria-label="Strikethrough"><s>S</s></button><i class="rsep"></i><button type="button" class="rb" data-rt="size" title="Text size" aria-label="Text size"><span class="tsz">Aa</span><svg class="cv" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10l5 5 5-5"/></svg></button><button type="button" class="rb" data-rt="color" title="Text colour" aria-label="Text colour"><span class="tcol">A<i id="tcolbar"></i></span></button><button type="button" class="rb" data-rt="hilite" title="Highlight" aria-label="Highlight"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l-4 4v3h3l4-4"/><path d="M14 6l4 4"/><path d="M9 11l5-5 4 4-5 5z"/></svg></button><i class="rsep"></i><button type="button" class="rb" data-rt="insertUnorderedList" title="Bullet list" aria-label="Bullet list"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/></svg></button><button type="button" class="rb" data-rt="insertOrderedList" title="Numbered list" aria-label="Numbered list"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 6h10M10 12h10M10 18h10"/><path d="M4 5h1v4M4 9h2M4 14h2l-2 3h2" stroke-width="1.6"/></svg></button><button type="button" class="rb" data-rt="justifyLeft" title="Align left" aria-label="Align left"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 10h10M4 14h16M4 18h10"/></svg></button><button type="button" class="rb" data-rt="justifyCenter" title="Centre" aria-label="Centre"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M7 10h10M4 14h16M7 18h10"/></svg></button><button type="button" class="rb" data-rt="justifyRight" title="Align right" aria-label="Align right"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M10 10h10M4 14h16M10 18h10"/></svg></button><button type="button" class="rb" data-rt="outdent" title="Decrease indent" aria-label="Decrease indent"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M11 10h9M11 14h9M4 18h16"/><path d="M8 9l-3 3 3 3"/></svg></button><button type="button" class="rb" data-rt="indent" title="Increase indent" aria-label="Increase indent"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M11 10h9M11 14h9M4 18h16"/><path d="M5 9l3 3-3 3"/></svg></button><i class="rsep"></i><button type="button" class="rb" data-rt="link" title="Add link" aria-label="Add link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg></button><button type="button" class="rb" data-rt="quote" title="Quote" aria-label="Quote"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7H4v5h3l-1 4M17 7h-3v5h3l-1 4"/></svg></button><button type="button" class="rb" data-rt="removeFormat" title="Clear formatting" aria-label="Clear formatting"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12M12 4l-4 16M15 15l5 5M20 15l-5 5"/></svg></button><i class="rsep"></i><button type="button" class="rb" data-rt="undo" title="Undo" aria-label="Undo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg></button><button type="button" class="rb" data-rt="redo" title="Redo" aria-label="Redo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/></svg></button></div><div class="rpop" id="cppop" hidden></div><div class="rbody" id="cpbody" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Message"></div></div>
    <div class="cpatt"><button type="button" class="btn sm" data-cp="attach"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.4 11.1l-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/></svg>Attach files</button><span id="cpattsum"></span></div>
    <div class="attl" id="cpattl"></div><input type="file" id="cpfile" multiple hidden>
    <div class="cpq" id="cpquote" hidden></div>
    <div class="sigprev" id="cpsig"></div>
    <div class="err" id="cperr"></div>
  </form>
</div>

<!-- designs: new delivery -->
<div class="ov" id="dnew" role="dialog" aria-modal="true">
  <div class="ovh">
    <button class="btn sm icon" id="dclose" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <span class="t">New designs link</span>
    <button class="btn sm pri" id="dgo">Create link</button>
  </div>
  <div class="ovb">
    <form id="dform" autocomplete="off">
      <div class="two">
        <div><label class="f" for="dcl">Client name</label><input type="text" id="dcl" maxlength="80" placeholder="e.g. Ahmed, Kebab House"></div>
        <div><label class="f" for="dph">Their WhatsApp (optional)</label><input type="tel" id="dph" maxlength="20" inputmode="tel" placeholder="07..."></div>
      </div>
      <label class="f" for="dti">What are they? (optional)</label><input type="text" id="dti" maxlength="100" placeholder="e.g. Ramadan posts">
      <div id="dgroups"></div>
      <button type="button" class="btn" id="dadd" style="width:100%;margin-top:12px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Add another design</button>
      <p class="sub" style="font-size:12.5px;margin-top:10px">Add the Post and Story sizes of a design together. They're sorted by shape (Post, Story, Landscape) and numbered as pages in the order shown. Use the arrows to change the order.</p>
      <div class="err" id="derr"></div>
    </form>
    <div id="ddone" class="hidden"></div>
  </div>
</div>

<!-- bottom sheet -->
<div class="scrim" id="scrim"></div>
<div class="sheet" id="sheet" role="dialog" aria-modal="true"><div class="grab"></div><div id="sheetin"></div></div>
<input type="file" id="fzip" accept=".zip,application/zip,.html,.htm,text/html" hidden>
<input type="file" id="fdeck" accept="application/pdf,image/png,image/jpeg,image/webp" multiple hidden>
<input type="file" id="dfile" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden>
<input type="file" id="ficon" accept="image/png,image/jpeg,image/webp" hidden>
<div class="toast" id="toast"></div>
<script>
(function(){
var CSRF=<?= json_encode($tok['csrf']) ?>,D=[],L=[],E=[],skew=0,filter='live',pushN=0;
var $=function(id){return document.getElementById(id)};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
var toast=function(m,bad){var t=$('toast');t.textContent=m;t.classList.toggle('bad',!!bad);t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove('on')},3200)};
var api=function(a,body,form){
  var o={method:'POST',credentials:'same-origin',headers:{'X-CSRF':CSRF}};
  if(form)o.body=form;else{o.headers['Content-Type']='application/json';o.body=JSON.stringify(body||{})}
  return fetch('api.php?a='+a,o).then(function(r){return r.json().catch(function(){return{error:'Server error ('+r.status+')'}})}).then(function(j){if(j.login){location.reload()}if(j.error)throw new Error(j.error);return j})};
var nowS=function(){return Math.floor(Date.now()/1000+skew)};
var fmtT=function(t){if(!t)return'';var d=new Date(t*1000),td=new Date();var same=d.toDateString()===td.toDateString();return(same?'Today':d.toLocaleDateString('en-GB',{day:'numeric',month:'short'}))+' '+d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})};
var fmtD=function(t){return t?new Date(t*1000).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):''};
var ago=function(t){var s=nowS()-t;if(s<60)return'just now';if(s<3600)return Math.floor(s/60)+' min ago';if(s<86400)return Math.floor(s/3600)+' h ago';return fmtT(t)};
var fmtLeft=function(s){if(s<=0)return'0:00';if(s>=86400)return Math.floor(s/86400)+'d '+Math.floor(s%86400/3600)+'h';var h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return(h?h+':'+String(m).padStart(2,'0'):m)+':'+String(x).padStart(2,'0')};
var demoBy=function(s){for(var i=0;i<D.length;i++)if(D[i].slug===s)return D[i]};
var andList=function(a){return a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1]};
var durTxt=function(m){if(!m)return'no time limit';if(m>=1440&&m%1440===0){var d=m/1440;return d===7?'1 week':d===1?'1 day':d+' days'}return m>=60&&m%60===0?(m===60?'1 hour':(m/60)+' hours'):m+' minutes'};
var shareText=function(l){var names=l.apps.map(function(s){var d=demoBy(s);return d?d.name:s}),one=names.length===1;
  if(l.direct)return "Here's the latest version of "+names[0]+" for you to look over. Let me know what you think."
    +'\n\n'+linkPin(l)
    +deckLine(l)+'\n\nThe same link always shows the newest version, so you can check back after each update.'+(l.duration?' It stays open for '+durTxt(l.duration)+(l.pin?' from when you enter the PIN.':' from when you first open it.'):'')+' Any questions, just message me.\n\nSummar, SMR Digital';
  return (one?"Here's the demo we spoke about ("+names[0]+"). Have a little look around the app."
         :"Here are the demos we spoke about ("+andList(names)+"). Have a look through the apps.")
    +' Let me know what you think.'
    +deckLine(l)
    +'\n\n'+linkPin(l)
    +'\n\n'+(l.duration?'You have '+durTxt(l.duration)+(l.pin?' from when you enter the PIN.':' from when you first open it.')+' ':'There is no time limit, so take a look whenever suits you. ')+'Any questions, just message me.\n\nSummar, SMR Digital'};
var deckLine=function(l){if(!l.deck)return'';var w=l.apps.filter(function(s){var d=demoBy(s);return d&&d.deck});if(!w.length)return'';return l.direct?'\n\nThere\'s also a features presentation in the link. Have a look through it for a breakdown of all the new features and how they help your business.':'\n\nThere\'s also a features presentation in the link. Open it first for a breakdown of all the new features and how they help your business.'};
var linkPin=function(l){return 'Link to demo:\n'+l.url+(l.pin?'\n\nPIN to access demo:\n'+l.pin:'')};
var lpName=function(l){return l.pin?'Link & PIN':'Link'};
var waUrl=function(text,phone){var n=String(phone||'').replace(/\D/g,'');if(n.indexOf('00')===0)n=n.slice(2);else if(n.charAt(0)==='0')n='44'+n.slice(1);
  return 'https://wa.me/'+(n.length>=10?n:'')+'?text='+encodeURIComponent(text)};
var copy=function(t,msg){(navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(t):Promise.reject()).then(function(){toast(msg||'Copied')}).catch(function(){var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');toast(msg||'Copied')}catch(e){}a.remove()})};
var ICON={dots:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>'};

/* ---------- tabs (hash) ---------- */
var showTab=function(t){if(['demos','send','live','designs','mail'].indexOf(t)<0)t='demos';
  document.querySelectorAll('[data-tab]').forEach(function(b){b.classList.toggle('on',b.dataset.tab===t)});
  document.querySelectorAll('.tab').forEach(function(s){s.classList.toggle('hidden',s.id!=='tab-'+t)});window.scrollTo(0,0);if(t==='live'&&typeof load==='function'&&D.length)load();if(t!=='send'&&$('created').dataset.used&&typeof resetSend==='function')resetSend();if(t==='mail'&&typeof mailOpen==='function')mailOpen();if(t==='designs'&&typeof dLoad==='function')dLoad()};
document.querySelectorAll('[data-tab]').forEach(function(b){b.addEventListener('click',function(){if(location.hash!=='#'+b.dataset.tab)history.replaceState(null,'','#'+b.dataset.tab);showTab(b.dataset.tab)})});
window.addEventListener('hashchange',function(){showTab(location.hash.slice(1))});
showTab(location.hash.slice(1));

/* ---------- sheet ---------- */
var sheet=$('sheet'),scrim=$('scrim');
var openSheet=function(html,bind){$('sheetin').innerHTML=html;sheet.classList.add('on');scrim.classList.add('on');if(bind)bind($('sheetin'))};
var closeSheet=function(){sheet.classList.remove('on');scrim.classList.remove('on')};
scrim.addEventListener('click',closeSheet);
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeSheet()});
var item=function(act,label,icon,cls){return '<button class="it'+(cls?' '+cls:'')+'" data-act="'+act+'">'+(icon||'')+'<span>'+label+'</span></button>'};

/* ---------- load ---------- */
var build0=0;
var load=function(){return api('list').then(function(j){if(build0&&j.build&&j.build!==build0&&!cpOpen){location.reload();return}build0=j.build;D=j.demos;L=j.links;E=j.events||[];pushN=j.push_devices||0;skew=j.now-Date.now()/1000;renderDemos();renderPick();renderLinks();renderFeed();renderNotif()}).catch(function(e){toast(e.message,true)})};

/* ---------- my demos ---------- */
var renderDemos=function(){$('demos').innerHTML=D.length?D.map(function(d){
  return '<div class="rw'+(d.enabled?'':' off')+'" data-slug="'+esc(d.slug)+'"><a class="open" href="/demo/?preview=1#app='+esc(d.slug)+'"><img src="'+esc(d.icon)+'" alt=""><span><b>'+esc(d.name)+(d.enabled?'':' <i class="tag">Hidden</i>')+(d.files_ok?'':' <i class="tag bad">Files missing</i>')+'</b><small>v'+esc(d.ver||'1.0')+' · Updated '+fmtD(d.updated_at)+'</small></span></a>'
   +'<button class="dots" data-opts aria-label="Options for '+esc(d.name)+'">'+ICON.dots+'</button></div>'}).join(''):'<div class="empty">No demos yet.</div>'};
var curSlug=null;
$('demos').addEventListener('click',function(e){var b=e.target.closest('[data-opts]');if(!b)return;var slug=b.closest('[data-slug]').dataset.slug,d=demoBy(slug);curSlug=slug;
  openSheet('<div class="sh-h"><img src="'+esc(d.icon)+'" alt=""><div><b>'+esc(d.name)+'</b><small>'+esc(d.tagline)+'</small></div></div>'
    +item('open','Open demo')+item('send','Send this demo')+item('edit','Edit name, text and feature tour')+item('deck',d.deck?'Features presentation ('+d.deck.pages+' slides)':'Add a features presentation')+item('icon','Change icon')+item('zip','Replace with a new file (HTML or ZIP)')
    +item('toggle',d.enabled?'Hide from customers':'Show to customers')+(d.source==='seed'?'':item('del','Delete','', 'bad'))+item('close','Cancel','','muted'),
  function(el){el.addEventListener('click',function(ev){var it=ev.target.closest('[data-act]');if(!it)return;var a=it.dataset.act;
    if(a==='close')closeSheet();
    if(a==='open')location.href='/demo/?preview=1#app='+slug;
    if(a==='send'){closeSheet();document.querySelectorAll('#pick input').forEach(function(i){i.checked=i.value===slug});location.hash='send'}
    if(a==='icon'){closeSheet();$('ficon').click()}
    if(a==='zip'){closeSheet();$('fzip').click()}
    if(a==='toggle')api('demo_save',{slug:slug,enabled:d.enabled?0:1}).then(function(){closeSheet();toast(d.enabled?'Hidden':'Visible again');load()}).catch(function(e){toast(e.message,true)});
    if(a==='del'){if(confirm('Delete '+d.name+' and its files?'))api('demo_delete',{slug:slug}).then(function(){closeSheet();toast('Deleted');load()}).catch(function(e){toast(e.message,true)})}
    if(a==='deck')deckSheet(d);
    if(a==='edit')editDemo(d)})})});
var editDemo=function(d){openSheet('<h2>Edit '+esc(d.name)+'</h2><form id="ef"><label class="f">Name</label><input type="text" name="name" value="'+esc(d.name)+'" maxlength="60">'
   +'<label class="f">Short line</label><input type="text" name="tagline" value="'+esc(d.tagline)+'" maxlength="90">'
   +'<label class="f">Description</label><textarea name="description" maxlength="400">'+esc(d.description)+'</textarea>'
   +'<label class="f">Feature tour (one point per line)</label><textarea name="tips" maxlength="1500" style="min-height:150px">'+esc(d.tips_text)+'</textarea>'
   +'<div class="row" style="margin-top:12px"><label class="f" style="margin:0">Card colour</label><input type="color" name="accent" value="'+esc(d.accent)+'" style="width:48px;height:36px;border:0;background:none"><label class="f" style="margin:0 0 0 10px">Order</label><input type="number" name="sort" value="'+d.sort+'" style="width:90px;height:38px"></div>'
   +'<label class="f">Version (shown on direct links)</label><input type="text" name="ver" value="'+esc(d.ver||'1.0')+'" maxlength="7" inputmode="decimal" style="width:120px"><small class="hint" style="display:block;color:var(--muted);font-size:12px;margin-top:4px">Each update adds .1 by itself (1.1, 1.2…). Set 2.0 for a big change.</small>'
   +'<div class="row" style="margin-top:14px"><button class="btn pri" type="submit">Save</button><button class="btn" type="button" data-x>Cancel</button></div></form>',
  function(el){el.querySelector('[data-x]').onclick=closeSheet;el.querySelector('#ef').addEventListener('submit',function(e){e.preventDefault();var f=e.target,o={slug:d.slug};
    ['name','tagline','description','tips','accent','sort','ver'].forEach(function(k){o[k]=f.elements[k].value});
    api('demo_save',o).then(function(){closeSheet();toast('Saved');load()}).catch(function(er){toast(er.message,true)})})})};
var upload=function(a,fd,done){var x=new XMLHttpRequest();x.open('POST','api.php?a='+a);x.setRequestHeader('X-CSRF',CSRF);
  toast('Uploading…');
  x.upload.onprogress=function(e){if(e.lengthComputable)toast('Uploading '+Math.round(e.loaded/e.total*100)+'%')};
  x.onload=function(){var j;try{j=JSON.parse(x.responseText)}catch(e){j={error:x.status===413?'That file is too big for the server.':'Server error ('+x.status+')'}}if(j.error)toast(j.error,true);else{done(j);load()}};
  x.onerror=function(){toast('Upload failed. Check your connection.',true)};x.send(fd)};
$('ficon').addEventListener('change',function(){if(!this.files[0]||!curSlug)return;var fd=new FormData();fd.append('slug',curSlug);fd.append('icon',this.files[0]);this.value='';upload('demo_icon',fd,function(){toast('Icon updated')})});
$('fzip').addEventListener('change',function(){if(!this.files[0])return;var fd=new FormData();fd.append('zip',this.files[0]);this.value='';
  if(curSlug){fd.append('slug',curSlug);upload('demo_upload',fd,function(j){toast('Demo replaced ('+j.files+' files)')})}
  else{fd.append('name',newName);upload('demo_upload',fd,function(j){toast('Demo added ('+j.files+' files)')})}});
var newName='';
$('newdemo').addEventListener('click',function(){openSheet('<h2>Add an app</h2><p class="sub">Upload the app&#39;s HTML file (for example one downloaded from Claude), or a ZIP of a built website or Flutter Web app (for Flutter, zip the build/web folder).</p><label class="f">App name</label><input type="text" id="nn" maxlength="60" placeholder="e.g. Kebab House"><div class="row" style="margin-top:14px"><button class="btn pri" data-go>Choose file</button><button class="btn" data-x>Cancel</button></div>',
  function(el){el.querySelector('[data-x]').onclick=closeSheet;el.querySelector('[data-go]').onclick=function(){newName=el.querySelector('#nn').value.trim();if(!newName){toast('Give the app a name first',true);return}curSlug=null;closeSheet();$('fzip').click()}})});

/* ---------- send ---------- */
var renderPick=function(){var keep={};document.querySelectorAll('#pick input:checked').forEach(function(i){keep[i.value]=1});
  $('pick').innerHTML=D.filter(function(d){return d.enabled}).map(function(d){return '<label><input type="checkbox" value="'+esc(d.slug)+'"'+(keep[d.slug]?' checked':'')+'><span class="ck"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><img src="'+esc(d.icon)+'" alt=""><b>'+esc(d.name)+'</b><small>'+esc(d.tagline)+'</small></label>'}).join('')||'<p class="sub">No demos yet.</p>'};
$('selall').addEventListener('click',function(){var all=document.querySelectorAll('#pick input'),any=[].some.call(all,function(i){return!i.checked});all.forEach(function(i){i.checked=any});this.textContent=any?'Clear all':'Select all'});
var dur=45;
$('dur').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;dur=+b.dataset.m;$('durc').value='';this.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b)})});
var moreSum=function(){var m=$('moresum');if(m)m.textContent=m.textContent.replace(/\(([^,]*)/,'('+durTxt(dur))};
$('dur').addEventListener('click',moreSum);$('durc').addEventListener('input',moreSum);
$('direct').addEventListener('change',function(){if(this.checked&&dur>0&&dur<1440){var b=$('dur').querySelector('[data-m="43200"]');if(b)b.click()}});
$('durc').addEventListener('input',function(){var v=+this.value;if(v>=5){dur=v;$('dur').querySelectorAll('button').forEach(function(x){x.classList.remove('on')})}});
var resetT;
var resetSend=function(){clearTimeout(resetT);$('deckopt').checked=false;var c=$('created');c.classList.add('hidden');c.innerHTML='';delete c.dataset.used;
  document.querySelectorAll('#pick input').forEach(function(i){i.checked=false});$('lb').value='';$('ph').value='';$('lerr').textContent='';
  if(!$('tab-send').classList.contains('hidden')){window.scrollTo({top:0,behavior:'smooth'});toast('Ready for a new link')}};
var showMessage=function(l,phone){var c=$('created');clearTimeout(resetT);delete c.dataset.used;c.classList.remove('hidden');
  c.innerHTML='<h2>Link ready'+(l.label?' for '+esc(l.label):'')+'</h2><p class="sub">Pick a message, check it, then send it. You can edit it first.</p>'
    +'<div class="filt" style="margin:12px 0 8px"><button class="on" data-kind="short">'+esc(lpName(l))+'</button><button data-kind="full">Full message</button></div>'
    +'<textarea class="msg" id="msgtxt"></textarea>'
    +'<a class="btn big wa" id="wasend" target="_blank" rel="noopener" href="#"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.1L4 20z"/></svg>Send on WhatsApp</a>'
    +'<div class="acts" style="margin-top:10px"><button class="btn sm" data-lp>Copy '+esc(lpName(l).toLowerCase())+'</button><button class="btn sm" data-c>Copy full message</button><button class="btn sm" data-em>Email it</button><button class="btn sm" data-x>Done</button></div>';
  var ta=c.querySelector('#msgtxt'),wa=c.querySelector('#wasend');ta.value=linkPin(l);
  c.querySelectorAll('[data-kind]').forEach(function(k){k.onclick=function(){c.querySelectorAll('[data-kind]').forEach(function(x){x.classList.toggle('on',x===k)});ta.value=k.dataset.kind==='full'?shareText(l):linkPin(l);upd()}});
  var upd=function(){wa.href=waUrl(ta.value,phone)};upd();ta.addEventListener('input',upd);
  /* Once it's been copied or sent, show that clearly and clear the box after 2 minutes so the same link isn't sent twice by mistake. */
  var used=function(how){if(c.dataset.used)return;c.dataset.used='1';
    var bn=document.createElement('div');bn.className='usedbn';bn.innerHTML='<b>✓ '+how+(l.label?' for '+esc(l.label):'')+'</b><span>This link belongs to '+(l.label?esc(l.label):'that person')+'. For someone else, make a new one.</span><button class="btn sm pri" type="button" data-new>New link</button>';
    c.insertBefore(bn,c.firstChild);bn.querySelector('[data-new]').onclick=resetSend;
    clearTimeout(resetT);resetT=setTimeout(resetSend,120000)};
  wa.addEventListener('click',function(){used('Sent on WhatsApp');setTimeout(function(){toast('Sent links are in the Live tab')},800)});
  c.querySelector('[data-c]').onclick=function(){copy(shareText(l),'Full message copied');used('Copied')};c.querySelector('[data-lp]').onclick=function(){copy(linkPin(l),l.pin?'Link and PIN copied':'Link copied');used('Copied')};c.querySelector('[data-x]').onclick=resetSend;
  c.querySelector('[data-em]').onclick=function(){var names=l.apps.map(function(x){var d=demoBy(x);return d?d.name:x});compose({subject:(names.length===1?names[0]+' demo':'Your app demos')+' - SMR Digital',body:ta.value,onSent:function(){used('Emailed')}})};
  c.scrollIntoView({behavior:'smooth',block:'start'})};
$('linkform').addEventListener('submit',function(e){e.preventDefault();$('lerr').textContent='';
  var apps=[].map.call(document.querySelectorAll('#pick input:checked'),function(i){return i.value});
  if(!apps.length){$('lerr').textContent='Choose at least one app.';return}
  var mode=document.querySelector('[name=mode]:checked').value,phone=$('ph').value;
  api('link_create',{label:$('lb').value,apps:apps,mode:mode,max_uses:+$('maxu').value,duration:dur,tips:$('tips').checked,nopin:!$('usepin').checked,direct:$('direct').checked,deck:$('deckopt').checked&&!$('deckrow').classList.contains('hidden')?1:0}).then(function(j){
    $('lb').value='';$('ph').value='';document.querySelectorAll('#pick input').forEach(function(i){i.checked=false});
    load().then(function(){showMessage(j.link,phone)})}).catch(function(er){$('lerr').textContent=er.message})});

/* ---------- live ---------- */
var STAT={active:'Live now',not_activated:'Not opened yet',uses_left:'Waiting',expired:'Ended',revoked:'Ended early'};
var leftOf=function(l){return l.status==='active'?Math.max(0,l.expires_at-nowS()):0};
var isLive=function(l){return l.status==='active'||l.status==='not_activated'||l.status==='uses_left'};
var renderLinks=function(){
  var n=L.filter(function(l){return l.status==='active'}).length;$('livecnt').textContent=n?n:'';
  var list=L.filter(function(l){return filter==='all'||(filter==='open'?l.open:(!l.open&&(filter==='live'?isLive(l):!isLive(l))))});
  var oc=L.filter(function(l){return l.open}).length,ob=document.querySelector('#filt [data-f=open]');if(ob)ob.textContent='Open links'+(oc?' ('+oc+')':'');
  $('links').innerHTML=list.length?list.map(function(l){
    var names=l.apps.map(function(s){var d=demoBy(s);return d?d.name:s});
    var app=l.last_app&&demoBy(l.last_app)?demoBy(l.last_app).name:'';
    var line=l.status==='not_activated'?'Sent '+fmtT(l.created_at)+' · not opened yet'
      :l.status==='active'?'Opened '+fmtT(l.activated_at)+(app?' · last looked at '+esc(app):'')+(l.devices>1?' · '+l.devices+' devices':'')
      :l.activated_at?'Opened '+fmtT(l.activated_at)+(app?' · last looked at '+esc(app):''):'Sent '+fmtT(l.created_at);
    if(l.open){var od=demoBy(l.apps[0]),off=l.status==='revoked';
      return '<div class="lk '+(off?'revoked':'active')+'" data-id="'+l.id+'"><div class="hd"><b>'+esc(l.label||'No name')+'</b><span class="badge '+(off?'revoked':'active')+'">'+(off?'Turned off':'Open link')+'</span></div>'
      +'<div class="icons">'+l.apps.map(function(s){var d=demoBy(s);return d?'<img src="'+esc(d.icon)+'" alt="" title="'+esc(d.name)+'">':''}).join('')+'<span>'+esc(andList(names))+(od&&od.ver?' · v'+esc(od.ver):'')+'</span></div>'
      +'<p class="line">'+(off?'Turned off. Anyone with the link sees that it has ended.':'No time limit. Anyone with the link sees the latest version.')+(l.activated_at?' First opened '+fmtT(l.activated_at)+'.':' Not opened yet.')+'</p>'
      +'<p class="views"><b>'+(l.views||0)+'</b> '+(l.views===1?'click':'clicks')+' on the link'+(l.last_view?' · last opened '+fmtT(l.last_view):'')+'</p>'
      +'<div class="acts">'+(off?'<button class="btn sm pri" data-a="on">Turn back on</button>':'<button class="btn sm pri" data-a="cp">Copy link</button><button class="btn sm bad" data-a="end">Turn off</button>')
      +'<button class="btn sm icon" data-a="more" aria-label="More">'+ICON.dots+'</button></div></div>'}
    return '<div class="lk '+l.status+'" data-id="'+l.id+'"><div class="hd"><b>'+esc(l.label||'No name')+'</b><span class="badge '+l.status+'">'+STAT[l.status]+'</span></div>'
    +'<div class="icons">'+l.apps.map(function(s){var d=demoBy(s);return d?'<img src="'+esc(d.icon)+'" alt="" title="'+esc(d.name)+'">':''}).join('')+'<span>'+esc(andList(names))+'</span></div>'
    +'<p class="line">'+line+'</p>'
    +'<p class="views"><b>'+(l.views||0)+'</b> '+(l.views===1?'click':'clicks')+' on the link'+(l.last_view?' · last opened '+fmtT(l.last_view):'')+'</p>'
    +(l.status==='active'?'<div class="left"><span>Time left</span><b data-left>'+fmtLeft(leftOf(l))+'</b></div>':'')
    +'<div class="acts"><button class="btn sm pri" data-a="extend">'+(l.status==='active'?'Extend':(l.status==='expired'||l.status==='revoked'?'Give more time':'Add time'))+'</button>'
    +(isLive(l)?'<button class="btn sm bad" data-a="end">End now</button>':'')
    +'<button class="btn sm icon" data-a="more" aria-label="More">'+ICON.dots+'</button></div></div>'}).join(''):'<div class="empty">'+(filter==='live'?'No live links. Send some demos from the <b>Send</b> tab.':'Nothing here yet.')+'</div>'};
$('filt').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;filter=b.dataset.f;this.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b)});renderLinks()});
var run=function(act,body,msg){return api(act,body).then(function(){closeSheet();toast(msg);load()}).catch(function(e){toast(e.message,true)})};
$('links').addEventListener('click',function(e){var b=e.target.closest('[data-a]');if(!b)return;var id=+b.closest('[data-id]').dataset.id,l=L.filter(function(x){return x.id===id})[0],a=b.dataset.a;
  if(a==='extend')openSheet('<h2>Add time'+(l.label?' for '+esc(l.label):'')+'</h2><p class="sub">'+(l.status==='active'?'Added on to the time they have left.':(l.activated_at?'Their demo opens again straight away with this much time.':'Makes their session longer when they open it.'))+'</p><div class="grid4"><button class="btn" data-m="10">+10 min</button><button class="btn" data-m="15">+15 min</button><button class="btn" data-m="30">+30 min</button><button class="btn" data-m="60">+1 hour</button></div><button class="btn big" data-x style="margin-top:10px">Cancel</button>',
    function(el){el.querySelector('[data-x]').onclick=closeSheet;el.querySelectorAll('[data-m]').forEach(function(m){m.onclick=function(){run('link_extend',{id:id,minutes:+m.dataset.m},'Added '+m.textContent.replace('+',''))}})});
  if(a==='cp'){copy(linkPin(l),l.pin?'Link and PIN copied':'Link copied');return}
  if(a==='on'){run('link_extend',{id:id,minutes:1},'Link turned back on');return}
  if(a==='end'&&l.open){if(confirm('Turn this link off? Anyone who opens it will see that it has ended. You can turn it back on.'))run('link_revoke',{id:id},'Link turned off');return}
  if(a==='end'&&confirm('End this demo now? They will see the expired screen straight away.'))run('link_revoke',{id:id},'Demo ended');
  if(a==='more')openSheet('<h2>'+esc(l.label||'Demo link')+'</h2><div class="cred"><span class="pin">'+(l.pin?esc(l.pin):'No PIN')+'</span><code>'+esc(l.url)+'</code></div>'
    +item('lp',l.pin?'Copy link & PIN':'Copy link')+item('copy','Copy full message')+item('wa','Send again on WhatsApp')+item('pin',l.pin?'New PIN (old one stops working)':'Restart link (timer resets)')+item('del','Delete link','','bad')+item('close','Cancel','','muted'),
    function(el){el.addEventListener('click',function(ev){var it=ev.target.closest('[data-act]');if(!it)return;var x=it.dataset.act;
      if(x==='close')closeSheet();
      if(x==='copy'){copy(shareText(l),'Message copied');closeSheet()}
      if(x==='lp'){copy(linkPin(l),l.pin?'Link and PIN copied':'Link copied');closeSheet()}
      if(x==='wa'){window.open(waUrl(linkPin(l),''),'_blank');closeSheet()}
      if(x==='pin'&&confirm(l.pin?'Make a new PIN? The old PIN stops working and the timer resets.':'Restart this link? Their timer resets.'))run('link_newpin',{id:id},l.pin?'New PIN made':'Link restarted');
      if(x==='del'&&confirm('Delete this link for good?'+(l.open?' Anyone who opens it will see that it has been removed.':'')))run('link_delete',{id:id},'Link deleted')})})});
setInterval(function(){var reload=false;document.querySelectorAll('#links [data-left]').forEach(function(el){var l=L.filter(function(x){return x.id===+el.closest('[data-id]').dataset.id})[0];if(!l)return;var s=leftOf(l);el.textContent=fmtLeft(s);el.closest('.lk').classList.toggle('low',s<=300);if(s<=0)reload=true});if(reload)load()},1000);
var EV={opened:'opened',deck:'opened',low:'low',ended:'ended'};
var renderFeed=function(){$('feed').innerHTML=E.length?E.map(function(e){var who=e.label||'Someone';return '<div class="ev '+esc(EV[e.type]||'')+'"><i></i><span><b>'+esc(who)+'</b>'+(e.text.charAt(0)==="'"?'':' ')+esc(e.text.replace(' Tap to extend.',''))+'</span><small>'+ago(e.at)+'</small></div>'}).join(''):'<div class="empty">No activity yet.</div>'};

/* ---------- notifications ---------- */
var pushOK='serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
var standalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone;
var renderNotif=function(){var n=$('notif');if(!pushOK){if(/iPhone|iPad/.test(navigator.userAgent)&&!standalone){n.classList.remove('hidden');n.innerHTML='<div><b>Get notified</b><span>Add SMR Admin to your Home Screen first (Share, then Add to Home Screen), open it from there, then turn on notifications.</span></div>'}return}
  navigator.serviceWorker.getRegistration('/demo-admin/').then(function(r){return r&&r.pushManager.getSubscription()}).then(function(sub){n.classList.toggle('hidden',!!sub&&Notification.permission==='granted')})};
var b64=function(s){s=s.replace(/-/g,'+').replace(/_/g,'/');var p=s.length%4?4-s.length%4:0;var r=atob(s+'===='.slice(0,p)),a=new Uint8Array(r.length);for(var i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a};
var enablePush=function(){if(!pushOK){toast('This browser cannot show notifications',true);return Promise.resolve()}
  return Notification.requestPermission().then(function(p){if(p!=='granted')throw new Error('Notifications were not allowed. You can allow them in your phone settings.');
    return Promise.all([navigator.serviceWorker.register('/demo-admin/sw.js',{scope:'/demo-admin/'}).then(function(){return navigator.serviceWorker.ready}),api('push_key')])})
  .then(function(r){return r[0].pushManager.getSubscription().then(function(s){return s||r[0].pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(r[1].key)})})})
  .then(function(sub){return api('push_subscribe',sub.toJSON())}).then(function(){toast('Notifications are on');load()}).catch(function(e){toast(e.message,true)})};
$('notifon').addEventListener('click',enablePush);
if(pushOK)navigator.serviceWorker.register('/demo-admin/sw.js',{scope:'/demo-admin/'}).catch(function(){});

/* ---------- settings ---------- */
$('acct').addEventListener('click',function(){openSheet('<h2>Settings</h2>'
  +'<label class="f">Notifications</label><div class="row"><button class="btn sm pri" data-act="pushon">Turn on for this device</button><button class="btn sm" data-act="pushtest">Send a test</button></div><p class="sub" style="margin-top:6px">'+(pushN?pushN+' device'+(pushN>1?'s':'')+' getting notifications.':'No devices getting notifications yet.')+'</p>'
  +'<label class="f">Change PIN</label><div class="row"><input type="password" id="curpw" placeholder="Current PIN" inputmode="numeric" style="max-width:160px"><input type="password" id="newpw" placeholder="New 4-digit PIN" inputmode="numeric" maxlength="4" style="max-width:180px"><button class="btn sm" data-act="pin">Save</button></div>'
  +'<div class="row" style="margin-top:18px"><button class="btn sm bad" data-act="logout">Log out</button><button class="btn sm" data-act="close">Close</button></div>',
  function(el){el.addEventListener('click',function(e){var b=e.target.closest('[data-act]');if(!b)return;var a=b.dataset.act;
    if(a==='close')closeSheet();
    if(a==='pushon')enablePush().then(closeSheet);
    if(a==='pushtest')api('push_test').then(function(){toast(pushN?'Test sent':'Turn notifications on first')}).catch(function(e){toast(e.message,true)});
    if(a==='pin')api('password',{current:el.querySelector('#curpw').value,'new':el.querySelector('#newpw').value}).then(function(){toast('PIN changed');closeSheet()}).catch(function(e){toast(e.message,true)});
    if(a==='logout')api('logout').then(function(){location.reload()})})})});

/* ---------- email ---------- */
var M={cfg:null,folder:'inbox',rows:[],more:false,at:0,busy:false,cur:null};
var CLIP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11l-8.6 8.6a5 5 0 0 1-7-7L14 4a3.3 3.3 0 0 1 4.7 4.7l-8.6 8.6a1.7 1.7 0 0 1-2.4-2.4L15.6 7"/></svg>';
var mDate=function(t){if(!t)return'';var d=new Date(t*1000),td=new Date();if(d.toDateString()===td.toDateString())return d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});return d.toLocaleDateString('en-GB',d.getFullYear()===td.getFullYear()?{day:'numeric',month:'short'}:{day:'numeric',month:'short',year:'2-digit'})};
var mWho=function(a){return a?(a.name||a.email):''};
var mBadge=function(n){$('mailcnt').textContent=n>0?(n>99?'99+':n):''};
var mailSetup=function(edit){var c=M.cfg||{};$('mailf').classList.add('hidden');$('mailbtns').classList.add('hidden');
  $('mailaddr').textContent=edit?'Email settings':'Read and send your emails from SMR Admin.';
  $('mailbody').innerHTML='<form class="panel" id="msetup" autocomplete="off"><h2>'+(edit?'Email settings':'Connect your email')+'</h2>'
   +'<p class="sub">Uses your SiteGround mailbox. Your password is stored encrypted on your own server and is never shown again.</p>'
   +'<label class="f" for="ms-email">Email address</label><input type="text" id="ms-email" inputmode="email" autocapitalize="off" value="'+esc(c.email||'')+'">'
   +'<label class="f" for="ms-pass">Email password</label><input type="password" id="ms-pass" autocomplete="new-password" placeholder="'+(c.set?'Leave blank to keep the current one':'The password for this mailbox')+'">'
   +'<label class="f" for="ms-host">Mail server</label><input type="text" id="ms-host" autocapitalize="off" value="'+esc(c.host||'')+'">'
   +'<p class="sub" style="font-size:12.5px">If it won\'t connect, use the server name from SiteGround: Site Tools → Email → Accounts → ⋮ → Mail Configuration (it looks like gxxx.siteground.biz).</p>'
   +'<label class="f" for="ms-name">Name people see</label><input type="text" id="ms-name" maxlength="80" value="'+esc(c.name||'')+'">'
   +'<h2 style="margin:22px 0 2px">Signature</h2><p class="sub">Added to the bottom of every email you send from here.</p>'
   +'<label class="toggle"><input type="checkbox" id="ms-sigon"'+(!c.sig||c.sig.on?' checked':'')+'>Add my signature</label>'
   +'<p class="sub" style="font-size:12.5px">To change your name, title or details on it, just message Claude.</p>'
   +(c.sig_html?'<div class="sigprev">'+c.sig_html+'</div>':'')
   +'<div class="err" id="ms-err"></div>'
   +'<div class="row" style="margin-top:6px"><button class="btn pri" type="submit">'+(c.set?'Save':'Connect')+'</button>'+(edit?'<button class="btn" type="button" data-ms="cancel">Cancel</button><button class="btn bad" type="button" data-ms="forget">Disconnect</button>':'')+'</div></form>';
  var f=$('msetup');
  f.addEventListener('click',function(e){var b=e.target.closest('[data-ms]');if(!b)return;
    if(b.dataset.ms==='cancel')mailOpen(true);
    if(b.dataset.ms==='forget'&&confirm('Disconnect your email from SMR Admin? Your emails stay in your mailbox.'))api('mail_forget').then(function(){M.cfg=null;M.rows=[];mBadge(0);toast('Email disconnected');mailInit(true)}).catch(function(er){toast(er.message,true)})});
  f.addEventListener('submit',function(e){e.preventDefault();var btn=f.querySelector('[type=submit]');btn.disabled=true;btn.textContent='Connecting…';$('ms-err').textContent='';
    api('mail_setup',{email:$('ms-email').value,password:$('ms-pass').value,host:$('ms-host').value,name:$('ms-name').value,sig_on:$('ms-sigon').checked})
    .then(function(j){M.cfg=j;M.rows=[];toast('Email connected');mailOpen(true)})
    .catch(function(er){$('ms-err').textContent=er.message;btn.disabled=false;btn.textContent=c.set?'Save':'Connect'})})};
var renderMail=function(){$('mailf').classList.remove('hidden');$('mailbtns').classList.remove('hidden');
  $('mailaddr').textContent=M.cfg.email;
  $('mailf').querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.dataset.f===M.folder)});
  if(M.folder==='drafts'){if(!M.rows.length){$('mailbody').innerHTML='<p class="empty">'+(M.busy?'Loading…':'No drafts. Emails you save, or leave unfinished, show up here.')+'</p>';return}
    $('mailbody').innerHTML='<div class="rows">'+M.rows.map(function(r){return '<div class="drow"><button class="mrow" data-draft="'+esc(r.id)+'"><i class="ud"></i><span class="mt"><span class="l1"><b><span class="dr">Draft</span>'+esc(r.to?'To: '+r.to.replace(/,\s*$/,''):'(no recipient)')+'</b><em>'+esc(mDate(r.updated))+'</em></span><span class="sj">'+(r.atts?CLIP:'')+esc(r.subject||'(no subject)')+'</span>'+(r.snippet?'<span class="sn">'+esc(r.snippet)+'</span>':'')+'</span></button><button class="dx" data-dx="'+esc(r.id)+'" aria-label="Delete draft" title="Delete draft">×</button></div>'}).join('')+'</div>';return}
  if(!M.rows.length){$('mailbody').innerHTML='<p class="empty">'+(M.busy?'Loading…':(M.folder==='sent'?'No sent emails.':'No emails.'))+'</p>';return}
  var sent=M.folder==='sent';
  $('mailbody').innerHTML='<div class="rows">'+M.rows.map(function(r){
    var who=sent?('To: '+(r.to.map(mWho).join(', ')||'')):mWho(r.from);
    return '<button class="mrow'+(!r.seen&&!sent?' un':'')+'" data-uid="'+r.uid+'"><i class="ud"></i><span class="mt"><span class="l1"><b>'+esc(who||'(unknown)')+'</b><em>'+esc(mDate(r.date))+'</em></span><span class="sj">'+(r.att?CLIP:'')+esc(r.subject||'(no subject)')+'</span></span></button>'}).join('')+'</div>'
    +(M.more?'<div style="text-align:center;margin-top:12px"><button class="btn sm" id="mailmore">Load older emails</button></div>':'');
  var mm=$('mailmore');if(mm)mm.onclick=function(){mailLoad(true)}};
var draftCount=function(n){$('draftcnt').textContent=n?n:''};
var mailLoad=function(older){if(M.busy)return Promise.resolve();M.busy=true;if(!older&&!M.rows.length)renderMail();
  if(M.folder==='drafts'){return api('mail_drafts',{}).then(function(j){M.busy=false;M.at=Date.now();M.rows=j.rows;M.more=false;draftCount(j.rows.length);renderMail()}).catch(function(e){M.busy=false;$('mailbody').innerHTML='<div class="panel"><p class="err" style="margin:0">'+esc(e.message)+'</p></div>'})}
  var before=older&&M.rows.length?M.rows[M.rows.length-1].uid:0;
  return api('mail_list',{folder:M.folder,before:before}).then(function(j){M.busy=false;M.at=Date.now();M.rows=older?M.rows.concat(j.rows):j.rows;M.more=j.more;mBadge(j.unread);renderMail()})
  .catch(function(e){M.busy=false;if(/Set up/.test(e.message)){M.cfg=null;mailSetup();return}$('mailbody').innerHTML='<div class="panel"><p class="err" style="margin:0">'+esc(e.message)+'</p><div class="row" style="margin-top:10px"><button class="btn sm" id="mretry">Try again</button><button class="btn sm" id="mfix">Email settings</button></div></div>';$('mretry').onclick=function(){mailLoad()};$('mfix').onclick=function(){mailSetup(true)}})};
var mailOpen=function(force){if(!M.cfg){mailInit(true);return}if(!M.cfg.set){mailSetup();return}
  if(force||!M.rows.length||Date.now()-M.at>60000)mailLoad();else renderMail()};
var mailInit=function(open){return api('mail_cfg').then(function(c){M.cfg=c;if(c.set){mailUnread();cpRecover()}if(open||location.hash==='#mail')mailOpen(true)}).catch(function(){})};
var mailUnread=function(){if(!M.cfg||!M.cfg.set)return;api('mail_unread').then(function(j){mBadge(j.unread)}).catch(function(){})};
$('mailf').addEventListener('click',function(e){var b=e.target.closest('[data-f]');if(!b||b.dataset.f===M.folder)return;M.folder=b.dataset.f;M.rows=[];M.more=false;mailLoad()});
$('mailre').addEventListener('click',function(){mailLoad().then(function(){toast('Up to date')})});
$('mailcfg').addEventListener('click',function(){mailSetup(true)});
$('mailnew').addEventListener('click',function(){compose({})});
$('mailbody').addEventListener('click',function(e){var x=e.target.closest('[data-dx]');
  if(x){if(!confirm('Delete this draft?'))return;api('mail_draft_del',{draft:x.dataset.dx}).then(function(){M.rows=M.rows.filter(function(r){return r.id!==x.dataset.dx});draftCount(M.rows.length);renderMail();toast('Draft deleted')}).catch(function(er){toast(er.message,true)});return}
  var b=e.target.closest('.mrow');if(!b)return;if(b.dataset.draft){openDraft(b.dataset.draft);return}openMail(+b.dataset.uid)});
var openDraft=function(id){toast('Opening draft…');api('mail_draft_get',{draft:id}).then(function(j){compose({resume:j})}).catch(function(er){toast(er.message,true);if(M.folder==='drafts')mailLoad()})};
/* reader */
var ovOpen=function(id){$(id).classList.add('on');document.body.style.overflow='hidden'};
var ovClose=function(id){$(id).classList.remove('on');if(!document.querySelector('.ov.on'))document.body.style.overflow=''};
var openMail=function(uid){var row=M.rows.filter(function(r){return r.uid===uid})[0];M.cur=null;
  $('rdmeta').innerHTML='<h2>'+esc(row?row.subject||'(no subject)':'')+'</h2><p>Loading…</p>';$('rdframe').src='about:blank';ovOpen('reader');
  api('mail_get',{folder:M.folder,uid:uid}).then(function(m){M.cur=m;
    if(row&&!row.seen&&M.folder==='inbox'){row.seen=true;renderMail();var n=+($('mailcnt').textContent)||0;mBadge(n-1)}
    var q='f='+M.folder+'&uid='+uid;
    $('rdmeta').innerHTML='<h2>'+esc(m.subject||'(no subject)')+'</h2>'
      +'<p><b>'+esc(m.from.name||m.from.email)+'</b>'+(m.from.name?' &lt;'+esc(m.from.email)+'&gt;':'')+'</p>'
      +'<p>To: '+esc(m.to.map(function(a){return a.name||a.email}).join(', '))+(m.cc.length?' · Cc: '+esc(m.cc.map(function(a){return a.name||a.email}).join(', ')):'')+' · '+esc(fmtT(m.date))+'</p>'
      +(m.atts.length?'<div class="atts">'+m.atts.map(function(a){return '<a href="mail.php?a=part&'+q+'&p='+encodeURIComponent(a.path)+'" download>'+CLIP+'<span>'+esc(a.name)+'</span><small>'+(a.size>1048576?(a.size/1048576).toFixed(1)+' MB':Math.max(1,Math.round(a.size/1024))+' KB')+'</small></a>'}).join('')+'</div>':'');
    $('rdframe').src='mail.php?a=view&'+q})
  .catch(function(e){$('rdmeta').innerHTML='<p class="err">'+esc(e.message)+'</p>'})};
$('reader').addEventListener('click',function(e){var b=e.target.closest('[data-rd]');if(!b)return;var a=b.dataset.rd,m=M.cur;
  if(a==='back'){ovClose('reader');$('rdframe').src='about:blank'}
  if(!m)return;
  if(a==='reply'){var sent=M.folder==='sent',to=sent?m.to.map(function(x){return x.email}).join(', '):(m.reply_to||m.from.email);
    var quote=m.text.split('\n').slice(0,200).map(function(l){return'> '+l}).join('\n');
    compose({to:to,subject:/^re:/i.test(m.subject)?m.subject:'Re: '+m.subject,body:'\n\n\nOn '+fmtT(m.date)+', '+(m.from.name||m.from.email)+' wrote:\n'+quote,in_reply_to:m.message_id,references:m.references,uid:sent?0:m.uid,reply:true})}
  if(a==='more')openSheet('<h2>Email</h2>'+(M.folder==='inbox'?item('unread','Mark as unread'):'')+item('fwd','Forward')+item('del','Delete','','bad')+item('close','Cancel','','muted'),function(el){el.addEventListener('click',function(ev){var x=ev.target.closest('[data-act]');if(!x)return;x=x.dataset.act;closeSheet();
    if(x==='unread')api('mail_unseen',{folder:M.folder,uid:m.uid}).then(function(){M.rows.forEach(function(r){if(r.uid===m.uid)r.seen=false});renderMail();mailUnread();ovClose('reader');toast('Marked as unread')}).catch(function(er){toast(er.message,true)});
    if(x==='fwd')compose({fwd:(m.atts||[]).map(function(a){return{folder:m.folder==='sent'?'sent':'inbox',uid:m.uid,path:a.path,name:a.name,size:a.size}}),subject:/^fwd?:/i.test(m.subject)?m.subject:'Fwd: '+m.subject,body:'\n\n\n---------- Forwarded email ----------\nFrom: '+(m.from.name?m.from.name+' <'+m.from.email+'>':m.from.email)+'\nDate: '+fmtT(m.date)+'\nSubject: '+m.subject+'\n\n'+m.text});
    if(x==='del'&&confirm('Delete this email?'))api('mail_delete',{folder:M.folder,uid:m.uid}).then(function(){M.rows=M.rows.filter(function(r){return r.uid!==m.uid});renderMail();ovClose('reader');toast('Deleted')}).catch(function(er){toast(er.message,true)})})})});
/* compose */
var CP={},cpOpen=false;
var escH=function(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var cpText=function(){return $('cpbody').innerText.replace(/ /g,' ').replace(/\n{3,}/g,'\n\n').trim()};
var compose=function(o){if(!M.cfg){toast('Loading email…');mailInit().then(function(){compose(o)});return}
  if(!M.cfg.set){toast('Connect your email first');location.hash='mail';return}
  CP=o||{};$('cptitle').textContent=CP.reply?'Reply':'New email';$('cpfrom').textContent='From: '+(M.cfg.name?M.cfg.name+' <'+M.cfg.email+'>':M.cfg.email);
  // the quoted email (reply / forward) sits under the message box; only your own words are editable
  var body=CP.body||'',qi=body.search(/^(On .{3,200} wrote:|-{5,} Forwarded email -{5,})$/m),own=qi>=0?body.slice(0,qi):body;CP.quote=qi>=0?body.slice(qi):'';
  own=own.replace(/\s+$/,'');
  $('cpsig').innerHTML=M.cfg.sig_html||'';$('cpto').value=CP.to||'';$('cpcc').value='';$('cpsub').value=CP.subject||'';
  $('cpbody').innerHTML=own?own.split('\n').map(function(l){return '<div>'+(l?escH(l):'<br>')+'</div>'}).join(''):'';
  CP.draft=Array.from(crypto.getRandomValues(new Uint8Array(12)),function(x){return('0'+x.toString(16)).slice(-2)}).join('');CP.files=[];CP.nextI=0;CP.fwd=(CP.fwd||[]).slice();attQueue=[];attBusy=false;
  CP.saved=false;CP.dirty=false;CP.firstDirty=0;$('cpstat').textContent='';
  if(CP.resume){var R=CP.resume;CP.draft=R.draft;CP.saved=true;CP.reply=R.reply;CP.in_reply_to=R.in_reply_to;CP.references=R.references;CP.uid=R.uid;CP.quote=R.quote||'';CP.fwd=R.fwd||[];
    $('cptitle').textContent=R.reply?'Reply':'New email';$('cpto').value=R.to||'';$('cpcc').value=R.cc||'';$('cpsub').value=R.subject||'';
    $('cpbody').innerHTML=R.html||(R.text?R.text.split('\n').map(function(l){return '<div>'+(l?escH(l):'<br>')+'</div>'}).join(''):'');
    CP.files=(R.atts||[]).map(function(a){return{i:a.i,name:a.name,size:a.size,done:true,sent:a.size}});CP.nextI=CP.files.reduce(function(m,f){return Math.max(m,f.i+1)},0);
    $('cpstat').textContent='Draft · saved '+fmtT(R.updated)}
  attDraw();try{localStorage.setItem('smr_cp_open',CP.draft)}catch(e){}
  CP.start=cpText();$('cpquote').hidden=!CP.quote;$('cpquote').textContent=CP.quote;$('cperr').textContent='';rtPop();
  ovOpen('compose');cpGuard(true);acLoad();
  setTimeout(function(){if(CP.to){var b=$('cpbody');b.focus();var r=document.createRange();r.setStart(b,0);r.collapse(true);var sl=getSelection();sl.removeAllRanges();sl.addRange(r)}else $('cpto').focus();rtState()},260)};
/* the email only closes with the × : back swipe / back button / pull-to-refresh are blocked, and refresh or closing the tab asks first */
var cpHist=false;
var cpGuard=function(on){cpOpen=on;document.documentElement.classList.toggle('cpopen',on);document.body.classList.toggle('cpopen',on);
  if(on&&!cpHist){history.pushState({cp:1},'',location.href);cpHist=true}
  if(!on&&cpHist){cpHist=false;if(history.state&&history.state.cp){cpSkip=true;history.back()}}};
var cpSkip=false;
window.addEventListener('popstate',function(){if(cpSkip){cpSkip=false;return}
  if(cpOpen){history.pushState({cp:1},'',location.href);cpHist=true;toast('Tap × to close the email')}});
window.addEventListener('beforeunload',function(e){if(cpOpen&&(cpText()||$('cpto').value.trim()||$('cpsub').value.trim())){e.preventDefault();e.returnValue='';return ''}});
document.addEventListener('keydown',function(e){if(cpOpen&&(e.key==='F5'||((e.metaKey||e.ctrlKey)&&(e.key==='r'||e.key==='R'||e.key==='w'||e.key==='W')))){e.preventDefault();toast('Tap × to close the email')}},true);
var cpClose=function(){clearTimeout(CP.tm);(CP.files||[]).forEach(function(f){if(f.xhr)try{f.xhr.abort()}catch(e){}});ovClose('compose');cpGuard(false);rtPop();acHide();try{localStorage.removeItem('smr_cp_open');localStorage.removeItem('smr_cp_backup')}catch(e){}};
/* ---- drafts: Save draft button, auto-save a few seconds after you stop typing (and at least every 20 s), local backup, saved when the app closes ---- */
var cpHas=function(){return !!(cpText()||$('cpto').value.trim()||$('cpcc').value.trim()||$('cpsub').value.trim()||(CP.files||[]).length||(CP.fwd||[]).length)};
var cpSnap=function(){return{draft:CP.draft,to:$('cpto').value,cc:$('cpcc').value,subject:$('cpsub').value,html:cpText()?$('cpbody').innerHTML:'',text:cpText(),quote:CP.quote||'',
  in_reply_to:CP.in_reply_to||'',references:CP.references||'',uid:CP.uid||0,reply:!!CP.reply,fwd:CP.fwd||[],ts:Math.floor(Date.now()/1000)}};
var cpSave=function(){clearTimeout(CP.tm);if(!cpOpen||!cpHas())return Promise.resolve(false);var snap=cpSnap();CP.saving=true;
  return api('mail_draft_save',snap).then(function(){CP.saving=false;CP.saved=true;if(CP.lastSnapTs<=snap.ts||!CP.lastSnapTs)CP.dirty=false;$('cpstat').textContent='Draft saved '+new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});try{localStorage.removeItem('smr_cp_backup')}catch(e){}if(M.folder==='drafts'&&!cpOpen)mailLoad();return true})
  .catch(function(){CP.saving=false;$('cpstat').textContent='Not saved yet (offline?) · kept on this device';return false})};
var cpDirty=function(){if(!cpOpen)return;CP.dirty=true;CP.lastSnapTs=Math.floor(Date.now()/1000);var now=Date.now();if(!CP.firstDirty)CP.firstDirty=now;
  clearTimeout(CP.bk);CP.bk=setTimeout(function(){if(cpOpen&&cpHas())try{localStorage.setItem('smr_cp_backup',JSON.stringify(cpSnap()))}catch(e){}},700);
  clearTimeout(CP.tm);var wait=now-CP.firstDirty>20000?0:4000;CP.tm=setTimeout(function(){CP.firstDirty=0;cpSave()},wait)};
['cpto','cpcc','cpsub','cpbody'].forEach(function(id){$(id).addEventListener('input',cpDirty)});
var cpBeacon=function(){if(!cpOpen||!CP.dirty||!cpHas())return;var snap=cpSnap();try{localStorage.setItem('smr_cp_backup',JSON.stringify(snap))}catch(e){}
  try{fetch('api.php?a=mail_draft_save',{method:'POST',keepalive:true,credentials:'same-origin',headers:{'X-CSRF':CSRF,'Content-Type':'application/json'},body:JSON.stringify(snap)})}catch(e){}};
document.addEventListener('visibilitychange',function(){if(document.hidden)cpBeacon()});
window.addEventListener('pagehide',cpBeacon);
/* after a crash / refresh / closed app: put any unsaved copy into Drafts and say so */
var cpRecover=function(){var bk=null,open=null;try{bk=JSON.parse(localStorage.getItem('smr_cp_backup')||'null');open=localStorage.getItem('smr_cp_open')}catch(e){}
  if(cpOpen)return;var done=function(){try{localStorage.removeItem('smr_cp_backup');localStorage.removeItem('smr_cp_open')}catch(e){}
    api('mail_drafts',{}).then(function(j){draftCount(j.rows.length)}).catch(function(){})};
  if(bk&&bk.draft){api('mail_draft_save',bk).then(function(){done();toast('Your unfinished email was saved in Drafts')}).catch(function(){})}
  else if(open){done();toast('Your unfinished email was saved in Drafts')}else done()};
/* ---- attachments: uploaded in 1.5 MB pieces with progress; same limits Gmail / Outlook use ---- */
var ATT_MAX=25*1048576,ATT_WARN=14*1048576,ATT_CHUNK=1.5*1048576;
var ATT_BLOCK='ade adp apk app appx appxbundle bat cab chm cmd com cpl dex diagcab diagcfg diagpack dll dmg ex ex_ exe hta img ins iso isp jar jnlp js jse lib lnk mde msc msi msix msixbundle msp mst nsh pif ps1 psm1 py pyc pyo scr sct shb sys vb vbe vbs vhd vhdx vxd wsc wsf wsh xll'.split(' ');
var fsz=function(n){return n>=1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB'};
var fext=function(n){var m=/\.([a-z0-9_]{1,6})$/i.exec(n||'');return m?m[1].toLowerCase():''};
var ATT_COL={pdf:'#e5484d',doc:'#2b6cdf',docx:'#2b6cdf',xls:'#1f9d55',xlsx:'#1f9d55',xlsm:'#1f9d55',csv:'#1f9d55',numbers:'#1f9d55',ppt:'#e8702a',pptx:'#e8702a',key:'#2b8fe0',zip:'#8a6d3b',rar:'#8a6d3b','7z':'#8a6d3b',mp4:'#7c4dff',mov:'#7c4dff',mp3:'#d63bff',ai:'#ff9a00',psd:'#31a8ff'};
var attTotal=function(){var t=0;(CP.files||[]).forEach(function(f){if(!f.err)t+=f.size});(CP.fwd||[]).forEach(function(f){t+=f.size||0});return t};
var attDraw=function(){var L=$('cpattl'),all=(CP.fwd||[]).map(function(f,k){return{fw:k,name:f.name,size:f.size,done:true}}).concat(CP.files||[]);
  L.innerHTML=all.map(function(f){var e=fext(f.name),img=f.url?'background-image:url('+f.url+')':'background-color:'+(ATT_COL[e]||'#3a3a58');
    var st=f.err?f.err:f.done?fsz(f.size)+(f.fw!=null?' · from the original email':''):'Uploading… '+Math.floor(100*(f.sent||0)/Math.max(1,f.size))+'%';
    return '<div class="atc'+(f.err?' err':'')+'" data-k="'+(f.fw!=null?'f'+f.fw:'u'+f.i)+'"><span class="th" style="'+img+'">'+(f.url?'':escH(e||'file'))+'</span><span class="nm"><b>'+escH(f.name)+'</b><small>'+escH(st)+'</small></span><button type="button" class="x" data-attx aria-label="Remove">×</button>'+(!f.done&&!f.err?'<i class="pb" style="width:'+Math.floor(100*(f.sent||0)/Math.max(1,f.size))+'%"></i>':'')+'</div>'}).join('');
  var t=attTotal(),n=all.filter(function(f){return !f.err}).length,S=$('cpattsum');
  S.className=t>ATT_MAX?'bad':t>ATT_WARN?'warn':'';
  S.textContent=n?n+' file'+(n>1?'s':'')+' · '+fsz(t)+' of 25 MB'+(t>ATT_WARN&&t<=ATT_MAX?' · over 14 MB may not reach Outlook/Hotmail or iCloud addresses':''):''};
var attQueue=[],attBusy=false;
var attNext=function(){if(attBusy)return;var f=attQueue.shift();if(!f)return;if(f.gone){attNext();return}attBusy=true;
  var draft=CP.draft;
  var piece=function(off){if(f.gone||CP.draft!==draft){attBusy=false;attNext();return}
    var fd=new FormData();fd.append('draft',draft);fd.append('i',f.i);fd.append('off',off);fd.append('total',f.size);fd.append('name',f.name);fd.append('file',f.file.slice(off,Math.min(f.size,off+ATT_CHUNK)),'piece');
    var x=new XMLHttpRequest();f.xhr=x;x.open('POST','api.php?a=mail_att_up');x.setRequestHeader('X-CSRF',CSRF);
    x.upload.onprogress=function(ev){f.sent=off+ev.loaded;attDraw()};
    var fail=function(msg){f.err=msg;f.xhr=null;attBusy=false;attDraw();attNext()};
    x.onload=function(){var j={};try{j=JSON.parse(x.responseText)}catch(e){}if(x.status!==200||j.error){fail(j.error||'Upload failed. Remove it and try again.');return}
      var nx=Math.min(f.size,off+ATT_CHUNK);f.sent=nx;if(j.done||nx>=f.size){f.done=true;f.xhr=null;attBusy=false;attDraw();attNext();cpDirty()}else piece(nx)};
    x.onerror=function(){fail('No connection. Remove it and try again.')};x.send(fd)};
  piece(0)};
var attAdd=function(list){list=[].slice.call(list||[]);if(!list.length)return;
  list.forEach(function(file){var name=file.name||('pasted-'+Date.now()+'.'+((file.type.split('/')[1]||'bin').replace('jpeg','jpg')));
    if(ATT_BLOCK.indexOf(fext(name))>=0){toast('"'+name+'" can\'t be emailed: Gmail and Outlook block this type of file. Put it in a ZIP or send a link.',true);return}
    if(file.size===0){toast('"'+name+'" is empty',true);return}
    if(attTotal()+file.size>ATT_MAX){toast('"'+name+'" would take this email over 25 MB, the most Gmail and Outlook accept. Send it as a link instead.',true);return}
    var f={i:CP.nextI++,name:name,size:file.size,file:file,sent:0,done:false};
    if(/^image\/(png|jpe?g|gif|webp)$/.test(file.type))try{f.url=URL.createObjectURL(file)}catch(e){}
    CP.files.push(f);attQueue.push(f)});
  attDraw();attNext();cpDirty()};
$('cpfile').addEventListener('change',function(){attAdd(this.files);this.value=''});
$('cpattl').addEventListener('click',function(e){var b=e.target.closest('[data-attx]');if(!b)return;var k=b.closest('.atc').dataset.k;
  if(k[0]==='f'){CP.fwd.splice(+k.slice(1),1)}else{var i=+k.slice(1),f=CP.files.filter(function(x){return x.i===i})[0];if(f){f.gone=true;if(f.xhr)try{f.xhr.abort()}catch(er){}if(attBusy&&f.xhr){attBusy=false}CP.files=CP.files.filter(function(x){return x!==f});if(f.url)URL.revokeObjectURL(f.url);api('mail_att_del',{draft:CP.draft,i:i}).catch(function(){});attNext()}}
  attDraw();cpDirty()});
(function(){var c=$('compose'),n=0;
  c.addEventListener('dragenter',function(e){if(e.dataTransfer&&[].indexOf.call(e.dataTransfer.types||[],'Files')>=0){e.preventDefault();n++;c.classList.add('drop')}});
  c.addEventListener('dragover',function(e){if(e.dataTransfer&&[].indexOf.call(e.dataTransfer.types||[],'Files')>=0)e.preventDefault()});
  c.addEventListener('dragleave',function(){if(--n<=0){n=0;c.classList.remove('drop')}});
  c.addEventListener('drop',function(e){n=0;c.classList.remove('drop');if(e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files.length){e.preventDefault();attAdd(e.dataTransfer.files)}})})();
/* ---- formatting bar ---- */
var rtSaved=null;
var rtKeep=function(){var sl=getSelection();if(sl.rangeCount&&$('cpbody').contains(sl.anchorNode))rtSaved=sl.getRangeAt(0).cloneRange()};
var rtBack=function(){var b=$('cpbody');b.focus();if(rtSaved){var sl=getSelection();sl.removeAllRanges();sl.addRange(rtSaved)}};
var rtDo=function(c,v){rtBack();try{document.execCommand('styleWithCSS',false,c==='hiliteColor'||c==='foreColor')}catch(e){}document.execCommand(c,false,v==null?null:v);rtKeep();rtState()};
var rtState=function(){['bold','italic','underline','strikeThrough','insertUnorderedList','insertOrderedList','justifyLeft','justifyCenter','justifyRight'].forEach(function(c){var b=document.querySelector('.rb[data-rt="'+c+'"]');var on=false;try{on=document.queryCommandState(c)}catch(e){}if(b)b.classList.toggle('on',!!on)})};
var COLS=['#16161d','#ffffff','#6b6b80','#ff5470','#ff8a3d','#f5c518','#2fbf71','#25a6ff','#5b5bff','#a259ff','#d63bff','#8b5a2b'];
var HIL=['transparent','#fff3a3','#c8f7d4','#cfe8ff','#ffd6e2','#e6d9ff'];
var rtPop=function(kind){var p=$('cppop');if(!kind){p.hidden=true;p.dataset.k='';return}
  if(p.dataset.k===kind&&!p.hidden){p.hidden=true;p.dataset.k='';return}p.dataset.k=kind;
  if(kind==='size')p.innerHTML=[['Small',2],['Normal',3],['Large',5],['Huge',6]].map(function(x){return '<button type="button" class="sz" data-sz="'+x[1]+'" style="font-size:'+[0,0,12,15,0,20,25][x[1]]+'px">'+x[0]+'</button>'}).join('');
  if(kind==='color')p.innerHTML=COLS.map(function(c){return '<button type="button" class="sw" data-col="'+c+'" style="background:'+c+'" aria-label="'+c+'"></button>'}).join('');
  if(kind==='hilite')p.innerHTML=HIL.map(function(c){return '<button type="button" class="sw" data-hil="'+c+'" style="background:'+(c==='transparent'?'repeating-linear-gradient(45deg,#333 0 4px,#555 4px 8px)':c)+'" aria-label="'+(c==='transparent'?'No highlight':c)+'"></button>'}).join('');
  if(kind==='link'){var sel=getSelection().toString();p.innerHTML='<div class="lk"><input type="url" id="rtlink" placeholder="https://…" autocapitalize="off" autocorrect="off" inputmode="url"><button type="button" class="btn sm pri" data-lk="1">Add</button></div>';setTimeout(function(){$('rtlink').focus()},30)}
  var b=document.querySelector('.rb[data-rt="'+kind+'"]');p.style.left=Math.max(6,Math.min(b.offsetLeft-$('cptb').scrollLeft,$('cptb').offsetWidth-300))+'px';p.style.top=(b.offsetTop+b.offsetHeight+6)+'px';p.hidden=false};
$('cptb').addEventListener('mousedown',function(e){if(e.target.closest('.rb'))e.preventDefault()});
$('cppop').addEventListener('mousedown',function(e){if(!e.target.closest('input'))e.preventDefault()});
$('cptb').addEventListener('click',function(e){var b=e.target.closest('.rb');if(!b)return;var c=b.dataset.rt;
  if(c==='size'||c==='color'||c==='hilite'||c==='link'){rtPop(c);return}rtPop();
  if(c==='quote'){rtDo('formatBlock',document.queryCommandValue('formatBlock')==='blockquote'?'div':'blockquote');return}
  if(c==='removeFormat'){rtDo('removeFormat');rtDo('unlink');return}
  rtDo(c)});
$('cppop').addEventListener('click',function(e){var t=e.target.closest('button');if(!t)return;
  if(t.dataset.sz){rtDo('fontSize',t.dataset.sz);rtPop()}
  else if(t.dataset.col){rtDo('foreColor',t.dataset.col);$('tcolbar').style.background=t.dataset.col;rtPop()}
  else if(t.dataset.hil){rtDo('hiliteColor',t.dataset.hil);rtPop()}
  else if(t.dataset.lk){var u=$('rtlink').value.trim();if(!u){rtPop();return}if(!/^(https?:\/\/|mailto:)/i.test(u))u=(/@/.test(u)&&!/\//.test(u)?'mailto:':'https://')+u;
    rtBack();var sl=getSelection();if(sl.isCollapsed){document.execCommand('insertHTML',false,'<a href="'+escH(u)+'">'+escH(u.replace(/^mailto:/,''))+'</a>&nbsp;')}else document.execCommand('createLink',false,u);rtKeep();rtPop()}});
$('cppop').addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.id==='rtlink'){e.preventDefault();$('cppop').querySelector('[data-lk]').click()}});
document.addEventListener('selectionchange',function(){if(cpOpen&&$('cpbody').contains(getSelection().anchorNode)){rtKeep();rtState()}});
$('cpbody').addEventListener('keydown',function(e){if((e.metaKey||e.ctrlKey)&&!e.shiftKey){var k=e.key.toLowerCase();if(k==='b'||k==='i'||k==='u'){e.preventDefault();rtDo({b:'bold',i:'italic',u:'underline'}[k])}if(k==='k'){e.preventDefault();rtKeep();rtPop('link')}}});
$('cpbody').addEventListener('paste',function(e){var d=e.clipboardData;if(!d)return;if(d.files&&d.files.length){e.preventDefault();attAdd(d.files);return}var h=d.getData('text/html');if(h)return;var t=d.getData('text/plain');if(t){e.preventDefault();document.execCommand('insertText',false,t)}});
$('cpbody').addEventListener('focus',function(){rtPop()});
/* ---- To / Cc suggestions from people you've emailed or had email from ---- */
var AC=null,acBusy=null;
var acLoad=function(){if(AC||acBusy)return;acBusy=api('mail_contacts',{}).then(function(j){AC=j.contacts||[]}).catch(function(){}).then(function(){acBusy=null})};
var acHide=function(){document.querySelectorAll('.acl').forEach(function(l){l.hidden=true;l.innerHTML=''})};
var acTok=function(inp){var v=inp.value,cur=inp.selectionStart==null?v.length:inp.selectionStart,st=v.lastIndexOf(',',cur-1)+1;var st2=v.lastIndexOf(';',cur-1)+1;st=Math.max(st,st2);var en=v.indexOf(',',cur);if(en<0)en=v.length;return{st:st,en:en,q:v.slice(st,en).trim().toLowerCase()}};
var acShow=function(inp){var l=inp.parentNode.querySelector('.acl');var t=acTok(inp);if(!AC||t.q.length<1){l.hidden=true;return}
  var have=inp.value.toLowerCase();var hl=function(s){var i=s.toLowerCase().indexOf(t.q);return i<0?escH(s):escH(s.slice(0,i))+'<mark>'+escH(s.slice(i,i+t.q.length))+'</mark>'+escH(s.slice(i+t.q.length))};
  var m=AC.filter(function(c){return (c[0].indexOf(t.q)>=0||(c[1]||'').toLowerCase().indexOf(t.q)>=0)&&have.indexOf(c[0]+',')<0}).sort(function(a,b){var sa=(a[0].indexOf(t.q)===0||(a[1]||'').toLowerCase().indexOf(t.q)===0)?0:1,sb=(b[0].indexOf(t.q)===0||(b[1]||'').toLowerCase().indexOf(t.q)===0)?0:1;return sa-sb}).slice(0,7);
  if(!m.length||(m.length===1&&m[0][0]===t.q)){l.hidden=true;return}
  l.innerHTML=m.map(function(c,i){return '<button type="button" data-em="'+escH(c[0])+'"'+(i===0?' class="on"':'')+'>'+(c[1]?'<b>'+hl(c[1])+'</b><span>'+hl(c[0])+'</span>':'<b>'+hl(c[0])+'</b>')+'</button>'}).join('');l.hidden=false};
var acPick=function(inp,em){var t=acTok(inp),v=inp.value;var before=v.slice(0,t.st).replace(/\s*$/,'');inp.value=(before?before+' ':'')+em+', '+v.slice(t.en).replace(/^[,\s]+/,'');inp.focus();var p=inp.value.length-v.slice(t.en).replace(/^[,\s]+/,'').length;inp.setSelectionRange(p,p);acHide()};
document.querySelectorAll('[data-ac]').forEach(function(inp){var l=inp.parentNode.querySelector('.acl');
  inp.addEventListener('input',function(){acShow(inp)});inp.addEventListener('focus',function(){acLoad()});
  inp.addEventListener('blur',function(){setTimeout(function(){l.hidden=true},180)});
  inp.addEventListener('keydown',function(e){if(l.hidden)return;var bs=[].slice.call(l.querySelectorAll('button')),i=bs.findIndex(function(b){return b.classList.contains('on')});
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(i>=0)bs[i].classList.remove('on');i=(i+(e.key==='ArrowDown'?1:-1)+bs.length)%bs.length;bs[i].classList.add('on');bs[i].scrollIntoView({block:'nearest'})}
    else if((e.key==='Enter'||e.key==='Tab')&&i>=0){e.preventDefault();acPick(inp,bs[i].dataset.em)}else if(e.key==='Escape'){l.hidden=true}});
  l.addEventListener('mousedown',function(e){e.preventDefault()});
  l.addEventListener('click',function(e){var b=e.target.closest('button');if(b)acPick(inp,b.dataset.em)})});
var cpBusy=false;
$('compose').addEventListener('click',function(e){if(!e.target.closest('.rtb,.rpop'))rtPop();var b=e.target.closest('[data-cp]');if(!b)return;
  if(b.dataset.cp==='close'){
    if(!cpHas()){if(CP.saved)api('mail_draft_del',{draft:CP.draft}).catch(function(){});else if(CP.files.length)api('mail_att_del_all',{draft:CP.draft}).catch(function(){});cpClose();return}
    openSheet('<h2>Delete this email?</h2><p class="sub">'+(CP.saved?'It\'s saved in your Drafts. Delete removes it from Drafts too.':'It hasn\'t been sent.')+'</p><div class="row" style="margin-top:14px;flex-wrap:wrap"><button class="btn bad" data-cx="del">Delete</button><button class="btn" data-cx="save">Save to drafts</button><button class="btn" data-cx="keep">Keep writing</button></div>',function(el){
      el.addEventListener('click',function(ev){var q=ev.target.closest('[data-cx]');if(!q)return;closeSheet();
        if(q.dataset.cx==='del'){api('mail_draft_del',{draft:CP.draft}).catch(function(){});cpClose();toast('Email deleted');if(M.folder==='drafts')mailLoad()}
        if(q.dataset.cx==='save'){CP.dirty=true;cpSave().then(function(ok){if(ok){cpClose();toast('Saved to Drafts');api('mail_drafts',{}).then(function(j){draftCount(j.rows.length)}).catch(function(){});if(M.folder==='drafts')mailLoad()}else toast('Couldn\'t save the draft. Check your connection.',true)})}})});
    return}
  if(b.dataset.cp==='save'){if(!cpHas()){toast('Nothing to save yet');return}if(CP.files.some(function(f){return !f.done&&!f.err})){toast('Wait for the attachments to finish uploading',true);return}
    CP.dirty=true;b.disabled=true;cpSave().then(function(ok){b.disabled=false;if(ok){cpClose();toast('Saved to Drafts');api('mail_drafts',{}).then(function(j){draftCount(j.rows.length)}).catch(function(){});if(M.folder==='drafts')mailLoad()}else toast('Couldn\'t save the draft. Check your connection.',true)});return}
  if(b.dataset.cp==='attach'){$('cpfile').click();return}
  if(b.dataset.cp==='send'&&!cpBusy){if(CP.files.some(function(f){return !f.done&&!f.err})){$('cperr').textContent='Wait for the attachments to finish uploading.';return}
    if(CP.files.some(function(f){return f.err})){$('cperr').textContent='Remove the attachment that didn\'t upload (in red) first.';return}
    if(attTotal()>ATT_MAX){$('cperr').textContent='The attachments are over 25 MB. Remove some first.';return}
    cpBusy=true;b.disabled=true;$('cperr').textContent='';
    var own=cpText(),html=$('cpbody').innerHTML,body=own+(CP.quote?'\n\n\n'+CP.quote:'');
    api('mail_send',{to:$('cpto').value,cc:$('cpcc').value,subject:$('cpsub').value,body:body,html:own?html:'',draft:CP.draft,atts:CP.files.map(function(f){return f.i}),fwd:(CP.fwd||[]).map(function(f){return{folder:f.folder,uid:f.uid,path:f.path}}),in_reply_to:CP.in_reply_to||'',references:CP.references||'',uid:CP.uid||0})
    .then(function(j){CP.sent=true;clearTimeout(CP.tm);cpClose();ovClose('reader');if(M.folder==='drafts')mailLoad();api('mail_drafts',{}).then(function(x){draftCount(x.rows.length)}).catch(function(){});toast(j.saved?'Sent':'Sent (could not save a copy in Sent)');AC=null;if(CP.onSent)CP.onSent();if(M.folder==='sent')mailLoad()})
    .catch(function(er){$('cperr').textContent=er.message})
    .then(function(){cpBusy=false;b.disabled=false})}});
/* ---------- features presentation (deck) per demo ---------- */
var deckKey='';
var deckRowUpd=function(){var ds=[];document.querySelectorAll('#pick input:checked').forEach(function(i){var d=demoBy(i.value);if(d&&d.deck)ds.push(d)});
  $('deckrow').classList.toggle('hidden',!ds.length);if(!ds.length){$('deckopt').checked=false;deckKey='';return}
  var key=ds.map(function(d){return d.slug+':'+d.deck.v}).join(',');if(key===deckKey)return;deckKey=key;
  $('decklist').innerHTML=ds.map(function(d){return '<div class="dkrow" data-dk="'+esc(d.slug)+'"><img src="/demo/deck.php?s='+encodeURIComponent(d.slug)+'&p=1&v='+d.deck.v+'" alt=""><span class="tx"><b>Features deck assigned</b><small>'+esc(d.name)+(d.deck.title?' · '+esc(d.deck.title):'')+' · '+d.deck.pages+' slide'+(d.deck.pages>1?'s':'')+'</small></span>'
    +'<span class="dkbtns"><a class="btn sm" href="/demo/?preview=1#deck='+esc(d.slug)+'">See it</a><button type="button" class="btn sm bad" data-dkdel>Delete deck</button></span></div>'}).join('');
  $('decknote').textContent=ds.length>1?'They\'ll see clear "Open presentation" buttons with the apps.':'They\'ll see a clear "Open presentation" button with the app.'};
$('decklist').addEventListener('click',function(e){var b=e.target.closest('[data-dkdel]');if(!b)return;e.preventDefault();var slug=b.closest('[data-dk]').dataset.dk,d=demoBy(slug);
  if(!confirm('Delete the features deck from '+(d?d.name:slug)+'? You can add it again later.'))return;
  api('deck_remove',{slug:slug}).then(function(){toast('Deck deleted');deckKey='';return load()}).then(deckRowUpd).catch(function(er){toast(er.message,true)})});
$('pick').addEventListener('change',deckRowUpd);document.addEventListener('click',function(){setTimeout(deckRowUpd,0)});
var deckSlug=null;
var deckSheet=function(d){deckSlug=d.slug;var k=d.deck;
  openSheet('<div class="sh-h"><img src="'+esc(d.icon)+'" alt=""><div><b>Features presentation</b><small>'+esc(d.name)+'</small></div></div>'
    +(k?'<p class="sub" style="margin:0 0 10px">'+esc(k.title||'Presentation')+' · '+k.pages+' slide'+(k.pages>1?'s':'')+'</p>'
        +'<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:6px">'+[1,2,3,4].filter(function(n){return n<=k.pages}).map(function(n){return '<img src="/demo/deck.php?s='+encodeURIComponent(d.slug)+'&p='+n+'&v='+k.v+'" alt="" style="height:78px;border-radius:8px;box-shadow:0 0 0 1px rgba(255,255,255,.1)">'}).join('')+'</div>'
      :'<p class="sub" style="margin:0 0 12px">Add a slide deck (PDF, or slide pictures) that walks them through the features and benefits. When you send this demo, they get a clear <b>Open presentation</b> button next to the app.</p>')
    +'<div id="dkprog" class="hidden"><div class="dprog"><i id="dkbar"></i></div><p class="sub" id="dkst" style="margin:0"></p></div>'
    +'<div class="err" id="dkerr"></div>'
    +'<button class="btn pri big" id="dkup" style="width:100%;margin-top:10px">'+(k?'Replace with a new PDF':'Choose a PDF')+'</button>'
    +'<p class="sub" style="font-size:12px;margin:8px 0 0">Slides made in Claude or Canva: download them as a PDF first. You can also pick slide pictures (PNG/JPG) in order.</p>'
    +(k?'<div class="row" style="margin-top:12px"><a class="btn" style="flex:1" href="/demo/?preview=1#deck='+esc(d.slug)+'">See it</a><button class="btn bad" id="dkrm">Remove</button></div>':''),
  function(el){el.querySelector('#dkup').onclick=function(){$('fdeck').click()};var rm=el.querySelector('#dkrm');
    if(rm)rm.onclick=function(){if(!confirm('Remove the presentation from '+d.name+'?'))return;api('deck_remove',{slug:d.slug}).then(function(){closeSheet();toast('Presentation removed');load()}).catch(function(e){toast(e.message,true)})}})};
var pdfLib=null;
var loadPdf=function(){if(pdfLib)return pdfLib;pdfLib=new Promise(function(res,rej){var sc=document.createElement('script');sc.src='vendor/pdf.min.js';sc.onload=function(){var L=window.pdfjsLib;if(!L)return rej(new Error('PDF reader did not load'));L.GlobalWorkerOptions.workerSrc='vendor/pdf.worker.min.js';res(L)};sc.onerror=function(){pdfLib=null;rej(new Error('PDF reader did not load'))};document.head.appendChild(sc)});return pdfLib};
var toSlide=function(canvas){return new Promise(function(res){canvas.toBlob(function(b){if(b&&b.type==='image/webp')return res(b);canvas.toBlob(res,'image/jpeg',.88)},'image/webp',.86)})};
var deckBusy=false;
$('fdeck').addEventListener('change',function(){var files=[].slice.call(this.files);this.value='';if(!files.length||deckBusy||!deckSlug)return;var slug=deckSlug,d=demoBy(slug);
  var st=function(t,pc){var p=$('dkprog');if(!p)return;p.classList.remove('hidden');$('dkst').textContent=t;if(pc!=null)$('dkbar').style.width=pc+'%'};
  var errEl=function(m){var e=$('dkerr');if(e)e.textContent=m;else toast(m,true)};
  var pdf=files.filter(function(f){return f.type==='application/pdf'||/\.pdf$/i.test(f.name)})[0];
  var imgs=files.filter(function(f){return/^image\//.test(f.type)}).sort(function(a,b){return a.name.localeCompare(b.name,undefined,{numeric:true})});
  if(!pdf&&!imgs.length){errEl('Choose a PDF or slide pictures.');return}
  deckBusy=true;var up=$('dkup');if(up)up.disabled=true;errEl('');var ratio=16/9,title='',n=0;
  var send=function(i,blob){var fd=new FormData();fd.append('slug',slug);fd.append('n',i);fd.append('file',blob,'slide-'+i);return api('deck_page',null,fd)};
  var job=api('deck_start',{slug:slug}).then(function(){
    if(pdf){st('Opening the PDF…',2);return loadPdf().then(function(L){return pdf.arrayBuffer().then(function(ab){return L.getDocument({data:ab,isEvalSupported:false}).promise})}).then(function(doc){n=doc.numPages;if(n>200)throw new Error('That PDF has over 200 pages.');
        return doc.getMetadata().catch(function(){return{}}).then(function(m){title=(m&&m.info&&m.info.Title)||pdf.name.replace(/\.pdf$/i,'')}).then(function(){
          var chain=Promise.resolve();for(var i=1;i<=n;i++)(function(i){chain=chain.then(function(){st('Making slide '+i+' of '+n+'…',Math.round((i-1)/n*90)+2);
            return doc.getPage(i).then(function(pg){var v0=pg.getViewport({scale:1});if(i===1)ratio=v0.width/v0.height;var sc=Math.min(1920/v0.width,2400/v0.height,4),v=pg.getViewport({scale:sc});
              var c=document.createElement('canvas');c.width=Math.round(v.width);c.height=Math.round(v.height);var cx=c.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,c.width,c.height);
              return pg.render({canvasContext:cx,viewport:v}).promise.then(function(){return toSlide(c)}).then(function(b){return send(i,b)})})})})(i);
          return chain.then(function(){st('Saving the PDF for download…',94);if(pdf.size>60*1024*1024)return;var fd=new FormData();fd.append('slug',slug);fd.append('file',pdf,'deck.pdf');return api('deck_pdf',null,fd).catch(function(){})})})})}
    n=imgs.length;title=d?d.name+' features':'';
    var chain=Promise.resolve();imgs.forEach(function(f,k){chain=chain.then(function(){st('Uploading slide '+(k+1)+' of '+n+'…',Math.round(k/n*95));
      if(k===0)return createImageBitmap(f).then(function(b){ratio=b.width/b.height}).catch(function(){}).then(function(){return send(1,f)});return send(k+1,f)})});return chain})
  .then(function(){st('Finishing…',98);return api('deck_finish',{slug:slug,pages:n,title:title,ratio:ratio})})
  .then(function(){deckBusy=false;closeSheet();toast('Presentation saved ('+n+' slide'+(n>1?'s':'')+')');load()})
  .catch(function(e){deckBusy=false;if(up)up.disabled=false;errEl(e.message||'Upload failed.')})});

/* ---------- designs ---------- */
var DS={sets:[],f:'live',purge:null,groups:[],busy:false},DAYS=14;
var fmtMB=function(b){return b>=1048576?(b/1048576).toFixed(b>=10485760?0:1)+' MB':Math.max(1,Math.round(b/1024))+' KB'};
var dKind=function(w,h){var r=w/h;if(r>=.5&&r<=.62)return'story';if(r>=.74&&r<=1.02)return'post';if(r>=1.7&&r<=2)return'wide';return'other'};
var dKL={post:'Post',story:'Story',wide:'Landscape'};
var dLabel=function(f){return dKL[f.kind]||(f.w+'×'+f.h)};
var dMsg=function(x){var first=String(x.client||'').trim().split(/[\s,]+/)[0];
  return 'Hi'+(first?' '+first:'')+', your designs are ready'+(x.title?' ('+x.title+')':'')+'.\n\n'+x.url+'\n\nYou can share them straight to Instagram, WhatsApp, TikTok, Facebook and LinkedIn, or save them to your phone. The link works until '+new Date(x.expires_at*1000).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})+'.\n\nSummar, SMR Digital'};
var dLoad=function(){return api('d_list').then(function(j){DS.sets=j.sets;DS.purge=j.purge;DAYS=j.days||14;skew=j.now-Date.now()/1000;dRender()}).catch(function(e){$('dlist').innerHTML='<p class="empty">'+esc(e.message)+'</p>'})};
var dRender=function(){var p=DS.purge;
  $('dpurge').innerHTML=p&&p.ask?'<div class="dpg"><div><b>Clear out the archive?</b><span>'+p.count+' old design link'+(p.count>1?'s were':' was')+' archived over 30 days ago ('+fmtMB(p.bytes)+'). Delete '+(p.count>1?'them':'it')+' for good?</span></div><div class="row"><button class="btn sm bad" data-dp="purge">Delete</button><button class="btn sm" data-dp="snooze">Not now</button></div></div>':'';
  var arch=DS.sets.filter(function(x){return x.archived_at}),live=DS.sets.filter(function(x){return!x.archived_at});
  document.querySelector('#dfilt [data-f=arch]').textContent='Archive'+(arch.length?' ('+arch.length+')':'');
  var list=DS.f==='arch'?arch:live,h='';
  if(DS.f==='arch'&&arch.length)h+='<div class="row" style="justify-content:space-between;margin-bottom:4px"><span class="sub" style="margin:0">Links ended, files kept privately. '+fmtMB(arch.reduce(function(a,x){return a+x.bytes},0))+' in total.</span><button class="btn sm bad" data-dp="all">Empty archive</button></div>';
  h+=list.length?list.map(function(x){var left=x.expires_at-nowS(),days=Math.ceil(left/86400);
    var badge=x.archived_at?'<span class="badge expired">Archived</span>':days<=3?'<span class="badge expired">'+(left<86400?'Ends today':days+' days left')+'</span>':'<span class="badge active">'+days+' days left</span>';
    return '<div class="lk dcard" data-id="'+x.id+'"><div class="hd"><b>'+esc(x.client||x.title||'Designs')+'</b>'+badge+'</div>'
      +(x.client&&x.title?'<div class="sub" style="margin-top:2px">'+esc(x.title)+'</div>':'')
      +'<div class="th">'+x.thumbs.map(function(t){return '<img src="'+esc(t)+'" alt="" loading="lazy">'}).join('')+'</div>'
      +'<div class="meta"><span>Files<b>'+(x.designs>1?x.designs+' designs · ':'')+x.files+' · '+fmtMB(x.bytes)+'</b></span><span>Opened<b>'+(x.views?x.views+'× · '+ago(x.last_view):'Not yet')+'</b></span><span>'+(x.archived_at?'Archived':'Ends')+'<b>'+fmtD(x.archived_at||x.expires_at)+'</b></span></div>'
      +'<div class="acts">'+(x.archived_at?'<button class="btn sm" data-d="reopen">Reopen for '+DAYS+' days</button>':'<button class="btn sm" data-d="copy">Copy message</button><button class="btn sm" data-d="wa">WhatsApp</button>')
      +'<a class="btn sm" href="'+esc(x.url)+'" target="_blank" rel="noopener">Open</a><button class="btn sm icon" data-d="more" aria-label="More">'+ICON.dots+'</button></div></div>'}).join('')
    :'<div class="empty">'+(DS.f==='arch'?'Nothing in the archive.':'No design links yet. Tap <b>New</b> to send some.')+'</div>';
  $('dlist').innerHTML=h};
$('dfilt').addEventListener('click',function(e){var b=e.target.closest('[data-f]');if(!b)return;DS.f=b.dataset.f;$('dfilt').querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b)});dRender()});
var dPurge=function(all){var n=all?DS.sets.filter(function(x){return x.archived_at}).length:DS.purge.count;
  openSheet('<h2>Delete '+n+' archived link'+(n>1?'s':'')+'?</h2><p class="sub">The designs are deleted from the server for good. Your own copies are not touched.</p><div class="row" style="margin-top:14px"><button class="btn bad" data-go>Delete for good</button><button class="btn" data-x>Cancel</button></div>',
    function(el){el.querySelector('[data-x]').onclick=closeSheet;el.querySelector('[data-go]').onclick=function(){api('d_purge',{all:all?1:0}).then(function(j){closeSheet();toast('Deleted '+j.deleted);dLoad()}).catch(function(e){toast(e.message,true)})}})};
$('dpurge').addEventListener('click',function(e){var b=e.target.closest('[data-dp]');if(!b)return;if(b.dataset.dp==='purge')dPurge(false);else api('d_snooze').then(function(){toast('I’ll ask again in 30 days');dLoad()})});
$('dlist').addEventListener('click',function(e){var b=e.target.closest('[data-d],[data-dp]');if(!b)return;if(b.dataset.dp==='all'){dPurge(true);return}
  var x=DS.sets.filter(function(s){return s.id===+b.closest('[data-id]').dataset.id})[0],a=b.dataset.d;if(!x)return;
  if(a==='copy')copy(dMsg(x),'Message copied');
  if(a==='wa')window.open(waUrl(dMsg(x),x.phone),'_blank');
  if(a==='reopen')api('d_extend',{id:x.id,days:DAYS}).then(function(){toast('Link works again for '+DAYS+' days');DS.f='live';$('dfilt').querySelectorAll('button').forEach(function(y){y.classList.toggle('on',y.dataset.f==='live')});dLoad()}).catch(function(e){toast(e.message,true)});
  if(a==='more')openSheet('<h2>'+esc(x.client||x.title||'Designs')+'</h2><div class="cred"><code>'+esc(x.url)+'</code></div>'
      +item('link','Copy link only')+(x.archived_at?'':item('ext','Add '+DAYS+' more days'))+item('edit','Edit name')+(x.archived_at?'':item('end','End the link now'))+item('del','Delete for good','','bad'),
    function(el){el.addEventListener('click',function(ev){var t=ev.target.closest('[data-act]');if(!t)return;var k=t.dataset.act;
      if(k==='link'){copy(x.url,'Link copied');closeSheet()}
      if(k==='ext')api('d_extend',{id:x.id,days:DAYS}).then(function(){closeSheet();toast('Added '+DAYS+' days');dLoad()});
      if(k==='end')api('d_archive',{id:x.id}).then(function(){closeSheet();toast('Link ended, moved to the archive');dLoad()});
      if(k==='del'&&confirm('Delete these designs from the server for good?'))api('d_delete',{id:x.id}).then(function(){closeSheet();toast('Deleted');dLoad()});
      if(k==='edit')openSheet('<h2>Edit</h2><label class="f">Client name</label><input type="text" id="e1" maxlength="80" value="'+esc(x.client)+'"><label class="f">What are they?</label><input type="text" id="e2" maxlength="100" value="'+esc(x.title)+'"><label class="f">Their WhatsApp</label><input type="tel" id="e3" maxlength="20" value="'+esc(x.phone)+'"><button class="btn pri big" id="e4" style="width:100%;margin-top:14px">Save</button>',
        function(e2){e2.querySelector('#e4').onclick=function(){api('d_edit',{id:x.id,client:$('e1').value,title:$('e2').value,phone:$('e3').value}).then(function(){closeSheet();toast('Saved');dLoad()}).catch(function(er){toast(er.message,true)})}})})})});

/* new delivery */
var dGroupHtml=function(g,gi){var cnt={};
  return '<div class="dg" data-g="'+gi+'"><div class="dh"><input type="text" value="'+esc(g.name)+'" maxlength="60" data-gn aria-label="Design name">'+(DS.groups.length>1?'<button type="button" class="btn sm icon bad" data-gx aria-label="Remove design"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button>':'')+'</div>'
    +'<div class="dthumbs">'+g.files.map(function(f,i){var k=f.kind+f.w+'x'+f.h;cnt[k]=(cnt[k]||0)+1;
      return '<div class="dth"><div class="im"><img src="'+f.url+'" alt=""></div><div class="lb"><span>'+esc(dLabel(f))+' '+cnt[k]+'</span><small>'+f.w+'×'+f.h+'</small></div>'
        +'<div class="ctl">'+(i>0?'<button type="button" data-mv="-1" data-i="'+i+'" aria-label="Move earlier">‹</button>':'')+(i<g.files.length-1?'<button type="button" data-mv="1" data-i="'+i+'" aria-label="Move later">›</button>':'')+'<button type="button" data-rm="'+i+'" aria-label="Remove">×</button></div></div>'}).join('')
    +'<button type="button" class="dadd" data-pick><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>'+(g.files.length?'Add more':'Add pictures<br><span style="font-weight:600;color:var(--muted)">or drop them here</span>')+'</button></div></div>'};
var dDraw=function(){$('dgroups').innerHTML=DS.groups.map(dGroupHtml).join('')};
var dReset=function(){DS.groups.forEach(function(g){g.files.forEach(function(f){URL.revokeObjectURL(f.url)})});DS.groups=[{name:'Design 1',files:[]}];$('dcl').value='';$('dph').value='';$('dti').value='';$('derr').textContent='';$('dform').classList.remove('hidden');$('ddone').classList.add('hidden');$('dgo').classList.remove('hidden');$('dgo').disabled=false;dDraw()};
var dPickG=0;
var dRead=function(file){return new Promise(function(res,rej){var url=URL.createObjectURL(file),im=new Image();im.onload=function(){res({file:file,url:url,w:im.naturalWidth,h:im.naturalHeight,kind:dKind(im.naturalWidth,im.naturalHeight),img:im})};im.onerror=function(){URL.revokeObjectURL(url);rej(new Error(file.name+' could not be opened'))};im.src=url})};
var dPrev=function(f){if(f.file.size<600000&&f.w<=1100&&f.h<=1100)return Promise.resolve(null);
  var sc=Math.min(1,1080/Math.max(f.w,f.h)),c=document.createElement('canvas');c.width=Math.round(f.w*sc);c.height=Math.round(f.h*sc);c.getContext('2d').drawImage(f.img,0,0,c.width,c.height);
  return new Promise(function(res){c.toBlob(function(b){if(b&&b.type==='image/webp')return res(b);c.toBlob(function(b2){res(b2)},f.file.type==='image/jpeg'?'image/jpeg':'image/png',.86)},'image/webp',.84)})};
var dAdd=function(gi,files){var list=[].slice.call(files).filter(function(f){return/^image\/(png|jpeg|webp|gif)$/.test(f.type)});
  if(!list.length){toast('Use PNG, JPG, WebP or GIF pictures',true);return}
  list.sort(function(a,b){return a.name.localeCompare(b.name,undefined,{numeric:true})});
  Promise.all(list.map(function(f){return dRead(f).catch(function(e){toast(e.message,true);return null})})).then(function(r){
    var g=DS.groups[gi];r.filter(Boolean).forEach(function(f){g.files.push(f)});
    var ord={post:0,story:1,wide:2,other:3};g.files=g.files.map(function(f,i){return[f,i]}).sort(function(a,b){return(ord[a[0].kind]-ord[b[0].kind])||(a[1]-b[1])}).map(function(x){return x[0]});dDraw()})};
$('dnewb').addEventListener('click',function(){if(!DS.busy)dReset();ovOpen('dnew')});
$('dclose').addEventListener('click',function(){if(DS.busy&&!confirm('Stop uploading?'))return;DS.stop=DS.busy;ovClose('dnew')});
$('dadd').addEventListener('click',function(){DS.groups.push({name:'Design '+(DS.groups.length+1),files:[]});dDraw()});
$('dfile').addEventListener('change',function(){dAdd(dPickG,this.files);this.value=''});
$('dgroups').addEventListener('input',function(e){if(e.target.matches('[data-gn]'))DS.groups[+e.target.closest('[data-g]').dataset.g].name=e.target.value});
$('dgroups').addEventListener('click',function(e){var gEl=e.target.closest('[data-g]');if(!gEl)return;var gi=+gEl.dataset.g,g=DS.groups[gi],b;
  if(e.target.closest('[data-pick]')){dPickG=gi;$('dfile').click();return}
  if((b=e.target.closest('[data-gx]'))){g.files.forEach(function(f){URL.revokeObjectURL(f.url)});DS.groups.splice(gi,1);DS.groups.forEach(function(x,i){if(/^Design \d+$/.test(x.name))x.name='Design '+(i+1)});dDraw();return}
  if((b=e.target.closest('[data-rm]'))){URL.revokeObjectURL(g.files[+b.dataset.rm].url);g.files.splice(+b.dataset.rm,1);dDraw();return}
  if((b=e.target.closest('[data-mv]'))){var i=+b.dataset.i,j=i+ +b.dataset.mv,t=g.files[i];g.files[i]=g.files[j];g.files[j]=t;dDraw()}});
['dragover','dragenter'].forEach(function(ev){$('dgroups').addEventListener(ev,function(e){var d=e.target.closest('.dg');if(!d)return;e.preventDefault();var a=d.querySelector('.dadd');if(a)a.classList.add('drag')})});
$('dgroups').addEventListener('dragleave',function(e){var a=e.target.closest('.dadd');if(a)a.classList.remove('drag')});
$('dgroups').addEventListener('drop',function(e){var d=e.target.closest('.dg');if(!d)return;e.preventDefault();dAdd(+d.dataset.g,e.dataTransfer.files)});
$('dgo').addEventListener('click',function(){if(DS.busy)return;var err=$('derr');err.textContent='';
  var jobs=[];DS.groups.forEach(function(g,gi){g.files.forEach(function(f){jobs.push({g:gi,name:g.name.trim()||('Design '+(gi+1)),f:f})})});
  if(!jobs.length){err.textContent='Add at least one picture.';return}
  if(!$('dcl').value.trim()&&!$('dti').value.trim()){err.textContent='Add the client name (or what the designs are).';$('dcl').focus();return}
  DS.busy=true;DS.stop=false;$('dgo').disabled=true;var id=0,done=0,total=jobs.reduce(function(a,j){return a+j.f.file.size},0),sent=0;
  $('dform').classList.add('hidden');$('ddone').classList.remove('hidden');
  $('ddone').innerHTML='<h2>Uploading…</h2><div class="dprog"><i id="dbar"></i></div><p class="sub" id="dst">Getting ready</p><p class="sub" style="font-size:12.5px">Keep this screen open until it’s done.</p>';
  var fail=function(m){DS.busy=false;$('dgo').disabled=false;if(id)api('d_cancel',{id:id}).catch(function(){});$('dform').classList.remove('hidden');$('ddone').classList.add('hidden');err.textContent=m};
  api('d_create',{client:$('dcl').value,title:$('dti').value,phone:$('dph').value}).then(function(j){id=j.id;
    return jobs.reduce(function(pr,job,k){return pr.then(function(){if(DS.stop)throw new Error('Upload stopped.');
      $('dst').textContent='Uploading '+(k+1)+' of '+jobs.length+' ('+fmtMB(job.f.file.size)+')';
      return dPrev(job.f).then(function(pv){var fd=new FormData();fd.append('id',id);fd.append('design',job.g);fd.append('dname',job.name);fd.append('file',job.f.file,job.f.file.name);if(pv)fd.append('prev',pv,'prev');return api('d_upload',null,fd)})
        .then(function(){sent+=job.f.file.size;$('dbar').style.width=Math.round(sent/total*100)+'%'})})},Promise.resolve())})
  .then(function(){return api('d_finish',{id:id})}).then(function(j){DS.busy=false;var x=j.set;$('dgo').classList.add('hidden');
    $('ddone').innerHTML='<div class="okbox" style="text-align:center;padding:6px 0 4px"><h2 style="margin:0">✓ Link ready'+(x.client?' for '+esc(x.client):'')+'</h2><p class="sub">Works until '+fmtD(x.expires_at)+' ('+DAYS+' days).</p></div>'
      +'<label class="f">Message</label><textarea id="dmsg" style="min-height:190px">'+esc(dMsg(x))+'</textarea>'
      +'<div class="row" style="margin-top:12px"><a class="btn pri" style="flex:1" id="dwa" target="_blank" rel="noopener">Send on WhatsApp</a><button class="btn" id="dcp">Copy</button></div>'
      +'<div class="row" style="margin-top:8px"><a class="btn" style="flex:1" href="'+esc(x.url)+'" target="_blank" rel="noopener">See what they see</a><button class="btn" id="dok">Done</button></div>';
    var upd=function(){$('dwa').href=waUrl($('dmsg').value,x.phone)};upd();$('dmsg').addEventListener('input',upd);
    $('dcp').onclick=function(){copy($('dmsg').value,'Message copied')};$('dok').onclick=function(){ovClose('dnew');dReset()};
    DS.f='live';dLoad()})
  .catch(function(e){fail(e.message||'Upload failed.')})});
if(location.hash==='#designs')dLoad();

mailInit();setInterval(mailUnread,120000);

load();setInterval(load,30000);
/* Refresh: clear anything the browser kept and load the newest version of SMR Admin. */
var hardRefresh=function(){toast('Refreshing…');var tab=location.hash||'#demos';
  var clear=window.caches&&caches.keys?caches.keys().then(function(ks){return Promise.all(ks.map(function(k){return caches.delete(k)}))}):Promise.resolve();
  try{Object.keys(sessionStorage).forEach(function(k){sessionStorage.removeItem(k)})}catch(e){}
  clear.catch(function(){}).then(function(){location.replace(location.pathname+'?r='+Date.now()+tab)})};
$('refresh').addEventListener('click',hardRefresh);
if(/[?&]r=\d/.test(location.search))history.replaceState(null,'',location.pathname+location.hash);
var hiddenAt=0;
document.addEventListener('visibilitychange',function(){if(document.hidden){hiddenAt=Date.now();return}
  if(hiddenAt&&Date.now()-hiddenAt>10*60*1000&&!cpOpen){location.reload();return}load()});
})();
</script>
<?php endif; ?>
<script>/* app feel: no pinch or double-tap zoom */(function(){document.addEventListener('gesturestart',function(e){e.preventDefault()},{passive:false});document.addEventListener('gesturechange',function(e){e.preventDefault()},{passive:false});document.addEventListener('touchmove',function(e){if(e.touches&&e.touches.length>1)e.preventDefault()},{passive:false});})();</script>
</body>
</html>
