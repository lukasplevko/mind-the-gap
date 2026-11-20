import fs from 'node:fs';
const assets=Object.fromEntries(fs.readdirSync('public').map(name=>['/'+name,fs.readFileSync('public/'+name,'utf8')]));
const manifest=JSON.parse(fs.readFileSync('.openai/hosting.json'));
fs.rmSync('dist',{recursive:true,force:true});
fs.mkdirSync('dist/server',{recursive:true});
let logic=fs.readFileSync('public/mission-logic.js','utf8').replaceAll('export ','');
let language=fs.readFileSync('worker/language.js','utf8').replace(/^import .*;\n/,'').replaceAll('export ','');
fs.writeFileSync('dist/server/index.js',`${logic}\n${language}\nconst assets=${JSON.stringify(assets)};\nexport default {async fetch(request,env){ const path=new URL(request.url).pathname; if(path==='/api/language-review')return checkLanguage(request,env);if(path==='/api/language-status')return Response.json({available:Boolean(env.OPENAI_API_KEY)},{headers:{'Cache-Control':'no-store'}});const key=path==='/'?'/index.html':path;if(!Object.hasOwn(assets,key))return new Response('Not found',{status:404});const type=key.endsWith('.js')?'text/javascript':key.endsWith('.css')?'text/css':'text/html';return new Response(assets[key],{headers:{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}})}};`);
fs.mkdirSync('dist/.openai',{recursive:true});fs.writeFileSync('dist/.openai/hosting.json',JSON.stringify(manifest));
