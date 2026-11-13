import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { gunzipSync } from 'node:zlib'
const out=import.meta.dirname
const output=path.join(out,'image-retainers.json')
if(fs.existsSync(output))throw new Error('Existing retainer evidence')
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')
const pairs=[['exact-scenario-before','exact-scenario-end'],['pure-native-svg-before','pure-native-svg-end']]
const result={schemaVersion:1,generated:new Date().toISOString(),collectorHash:hash(import.meta.filename),method:'Offline analysis of preserved actual churn heaps. Select newly retained native img nodes whose snapshot IDs were absent before; traverse incoming edges excluding weak edges. Bounds: 100000 queue entries, depth32, max100 incoming edges per node. A missing path is not proof of collection.',pairs:[]}
for(const [beforeName,endName] of pairs){
 const beforePath=path.join(out,beforeName+'.heapsnapshot.gz'),endPath=path.join(out,endName+'.heapsnapshot.gz')
 const before=JSON.parse(gunzipSync(fs.readFileSync(beforePath))),heap=JSON.parse(gunzipSync(fs.readFileSync(endPath)))
 const meta=heap.snapshot.meta,w=meta.node_fields.length,ew=meta.edge_fields.length
 const field=n=>meta.node_fields.indexOf(n),typeAt=field('type'),nameAt=field('name'),idAt=field('id'),sizeAt=field('self_size'),edgeCountAt=field('edge_count')
 const typeNames=meta.node_types[typeAt],edgeTypeAt=meta.edge_fields.indexOf('type'),toAt=meta.edge_fields.indexOf('to_node'),labelAt=meta.edge_fields.indexOf('name_or_index'),edgeNames=meta.edge_types[edgeTypeAt]
 const describe=at=>({id:heap.nodes[at+idAt],type:typeNames[heap.nodes[at+typeAt]],name:heap.strings[heap.nodes[at+nameAt]],selfSize:heap.nodes[at+sizeAt]})
 const oldIds=new Set(),oldCounts=new Map(),counts=new Map(),targets=[]
 for(let at=0;at<before.nodes.length;at+=w){const name=before.strings[before.nodes[at+nameAt]];if(typeNames[before.nodes[at+typeAt]]==='native'){oldIds.add(before.nodes[at+idAt]);oldCounts.set(name,(oldCounts.get(name)??0)+1)}}
 const incoming=new Map()
 let edge=0
 for(let at=0;at<heap.nodes.length;at+=w){
  const node=describe(at)
  if(node.type==='native'){
   counts.set(node.name,(counts.get(node.name)??0)+1)
   if(node.name.startsWith('<img')&&!oldIds.has(node.id))targets.push(at)
  }
  for(let i=0;i<heap.nodes[at+edgeCountAt];i++,edge+=ew){
   const type=edgeNames[heap.edges[edge+edgeTypeAt]]
   if(type==='weak')continue
   const to=heap.edges[edge+toAt],label=type==='element'||type==='hidden'?String(heap.edges[edge+labelAt]):heap.strings[heap.edges[edge+labelAt]]
   const items=incoming.get(to)??[];items.push({from:at,type,label});incoming.set(to,items)
  }
 }
 const groups=[targets.filter(at=>!describe(at).name.includes('alttext-image')),targets.filter(at=>describe(at).name.includes('alttext-image'))]
 const selected=groups.flatMap(items=>items.slice(-4))
 const chains=selected.map(target=>{
  const queue=[{at:target,path:[describe(target)]}],seen=new Set()
  for(let cursor=0;cursor<queue.length&&cursor<100000;cursor++){
   const item=queue[cursor];if(seen.has(item.at))continue;seen.add(item.at)
   const parents=incoming.get(item.at)??[]
   if(item.at===0||!parents.length)return{target:describe(target),termination:item.at===0?'gc-root':'no-recorded-strong-parent',visited:seen.size,chain:item.path}
   if(item.path.length>=32)continue
   for(const p of parents.slice(0,100))queue.push({at:p.from,path:[...item.path,{...describe(p.from),edgeType:p.type,edge:p.label}]})
  }
  return{target:describe(target),termination:'bounded',visited:seen.size}
 })
 result.pairs.push({before:beforeName,end:endName,beforeHash:hash(beforePath),endHash:hash(endPath),newlyRetainedNativeImages:targets.length,nativeCountChanges:[...counts].map(([name,count])=>({name,delta:count-(oldCounts.get(name)??0)})).filter(x=>x.delta&&(/<img|alttext|ShadowRoot|^Text$|HTMLImageElement::ViewportChangeListener/.test(x.name))),chains})
 console.log(endName,JSON.stringify({newImages:targets.length,chains:chains.map(c=>({name:c.target.name,termination:c.termination,path:c.chain?.map(n=>n.name)}))}))
}
fs.writeFileSync(output,JSON.stringify(result)+'\n')
