import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { gzipSync } from 'node:zlib'
import { chromium } from 'playwright'
import { group } from '../../../../tools/bench-table/heap-group.mjs'

const out = import.meta.dirname
const target = path.join(out, 'native-image-isolation.json')
if (fs.existsSync(target)) throw new Error('Refusing to overwrite isolation evidence')
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
const source = path.resolve(out, '../../../../tools/bench-validation/avatar-memory-audit.mjs')
const text = fs.readFileSync(source, 'utf8')
const start = text.indexOf('async function churn(page, variant) {')
const end = text.indexOf('\ntry {\n\tfor (const variant of [', start)
if (start < 0 || end < 0) throw new Error('Cannot identify frozen churn implementation')
const implementation = text.slice(start, end)
const churn = new Function('return (' + implementation + ')')()
const result = {
  schemaVersion: 1,
  started: new Date().toISOString(),
  command: [process.execPath, ...process.argv.slice(1)],
  collectorHash: hash(import.meta.filename),
  churnSourceHash: hash(source),
  churnImplementation: implementation,
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  node: process.version, platform: process.platform,
  method: 'Fresh Chromium browser per case; about:blank with no library, framework or polyfill imports. Exact native branch of the frozen churn function. 50 copies, warm=2, measured=20, two GC before every point and settle=6000ms before baseline/end. Core/emitters not applicable.',
  cases: [], outputs: [],
}
const write = () => fs.writeFileSync(target, JSON.stringify(result) + '\n')
for (const variant of ['native-svg', 'native-png', 'native-svg-wait', 'native-png-wait']) {
  const browser = await chromium.launch()
  const page = await browser.newPage({viewport: {width:1600,height:1000}})
  await page.goto('about:blank')
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Performance.enable')
  const data = {variant, started:new Date().toISOString(), browser:browser.version(), core:'N/A', emitters:'N/A', observations:[], points:[], errors:[]}
  page.on('pageerror', e => data.errors.push(e.message))
  page.on('console', m => {if(m.type()==='error')data.errors.push(m.text())})
  result.cases.push(data)
  write()
  const measure = async () => {
    await cdp.send('HeapProfiler.collectGarbage')
    await cdp.send('HeapProfiler.collectGarbage')
    const {metrics} = await cdp.send('Performance.getMetrics')
    const get = key => metrics.find(x=>x.name===key)?.value ?? NaN
    return {heap:get('JSHeapUsedSize'),nodes:get('Nodes'),listeners:get('JSEventListeners')}
  }
  const snapshot = async name => {
    const chunks=[]
    const receive=({chunk})=>chunks.push(chunk)
    cdp.on('HeapProfiler.addHeapSnapshotChunk',receive)
    await cdp.send('HeapProfiler.takeHeapSnapshot',{reportProgress:false})
    cdp.off('HeapProfiler.addHeapSnapshotChunk',receive)
    const text=chunks.join(''),file=path.join(out,name+'.heapsnapshot.gz')
    fs.writeFileSync(file,gzipSync(text))
    result.outputs.push({file:path.basename(file),sha256:hash(file),encoding:'gzip; decompress to Chrome DevTools .heapsnapshot'})
    return {file:path.basename(file),groups:[...group(JSON.parse(text)).groups].map(([name,value])=>({name,...value}))}
  }
  try {
    for(let cycle=0;cycle<22;cycle++){
      data.observations.push(await churn(page,variant))
      data.points.push(await measure())
      if(cycle===1){
        await page.waitForTimeout(6000)
        data.before=await measure()
        if(variant==='native-svg')data.beforeHeap=await snapshot('pure-native-svg-before')
      }
    }
    await page.waitForTimeout(6000)
    data.end=await measure()
    if(variant==='native-svg')data.endHeap=await snapshot('pure-native-svg-end')
    data.growth=Object.fromEntries(['heap','nodes','listeners'].map(k=>[k,data.end[k]-data.before[k]]))
    data.finalDOM=await page.evaluate(()=>({url:location.href,childNodes:document.querySelectorAll('*').length,scripts:document.scripts.length,benchPresent:'bench' in globalThis}))
  }catch(error){data.failure=String(error.stack??error)}
  finally {await browser.close();data.finished=new Date().toISOString();write()}
  console.log(variant,JSON.stringify({growth:data.growth,errors:data.errors,failure:data.failure,finalDOM:data.finalDOM}))
}
result.finished=new Date().toISOString()
write()
if(result.cases.some(x=>x.failure||x.errors.length))process.exitCode=1
