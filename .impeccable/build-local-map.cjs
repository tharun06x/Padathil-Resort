// A local vector map from OpenStreetMap geometry, not an embedded map widget.
const fs = require('node:fs');
const bounds = [10.07,76.57,10.185,76.765];
const query = `[out:json][timeout:35];(way[waterway=river](${bounds});way[natural=water](${bounds});way[landuse=forest](${bounds});way[natural=wood](${bounds});way[highway~"^(primary|secondary|tertiary)$"](${bounds}););out geom;`;
(async()=>{
  const {execFile}=require('node:child_process');
  const request=url=>new Promise((resolve,reject)=>execFile('curl.exe',['-s','--fail','--max-time','45',url],{maxBuffer:40*1024*1024},(e,out)=>e?reject(e):resolve(out)));
  const boxes=[];
  for(let x=0;x<3;x++) for(let y=0;y<2;y++) boxes.push([76.57+x*.065,10.07+y*.0575,76.57+(x+1)*.065,10.07+(y+1)*.0575]);
  const xml=fs.existsSync('.impeccable/local-map-data.xml') ? fs.readFileSync('.impeccable/local-map-data.xml','utf8') : (await Promise.all(boxes.map(b=>request('https://api.openstreetmap.org/api/0.6/map?bbox='+b.join(','))))).join('\n');
  fs.writeFileSync('.impeccable/local-map-data.xml',xml);
  const attr = (s,k) => s.match(new RegExp(`${k}="([^"]*)"`))?.[1];
  const nodes=new Map([...xml.matchAll(/<node\b([^>]*)>/g)].map(m=>[attr(m[1],'id'),{lat:+attr(m[1],'lat'),lon:+attr(m[1],'lon')}]));
  const ways=new Map([...xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)].map(m=>[attr(m[1],'id'),{tags:Object.fromEntries([...m[2].matchAll(/<tag\b([^>]*)\/>/g)].map(t=>[attr(t[1],'k'),attr(t[1],'v')])),geometry:[...m[2].matchAll(/<nd\b([^>]*)\/>/g)].map(n=>nodes.get(attr(n[1],'ref'))).filter(Boolean)}]));
  const data={elements:[...ways.values()]};
  const project = p => [((p.lon-bounds[1])/(bounds[3]-bounds[1])*900).toFixed(2),((bounds[2]-p.lat)/(bounds[2]-bounds[0])*540).toFixed(2)];
  const paths = type => data.elements.filter(w=>w.geometry.length&&type(w.tags)).map(w=>`<path d="${w.geometry.map((p,i)=>(i?'L':'M')+project(p).join(',')).join(' ')}${w.tags.natural==='water'||w.tags.landuse==='forest'||w.tags.natural==='wood'?'Z':''}"/>`).join('\n');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540"><metadata>Geographic geometry: OpenStreetMap contributors, ODbL. Downloaded 2026-09-30. Bounds: ${bounds}. Equirectangular local projection. https://www.openstreetmap.org/copyright</metadata><rect width="900" height="540" fill="#ece5d5"/><g fill="#bbc3a7" stroke="#73816c" stroke-width=".5" opacity=".8">${paths(t=>t.landuse==='forest'||t.natural==='wood')}</g><g fill="none" stroke="#c9a466" stroke-width="1.7" opacity=".65">${paths(t=>t.highway)}</g><g fill="#90b5b0" stroke="#507e79" stroke-width="1">${paths(t=>t.natural==='water')}</g><g fill="none" stroke="#507e79" stroke-width="4" stroke-linejoin="round">${paths(t=>t.waterway==='river')}</g></svg>`;
  fs.writeFileSync('images/riparian-local-map.svg',svg);
  fs.writeFileSync('.impeccable/local-map-source.json',JSON.stringify({source:'https://www.openstreetmap.org/copyright',bounds,query,features:data.elements.length},null,2));
  console.log(`Built local map with ${data.elements.length} geographic features and ${nodes.size} nodes.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
