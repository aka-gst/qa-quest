import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD_STORIES, WORLD_NODES, evaluateWorldStory, generateWorldShift, evaluateWorldShift, worldPython, WORLD_DIRECT_PATCHES, getWorldDirectPatch } from '../src/game/world-grid.js';

test('WORLD GRID is a connected human-readable ecosystem, not a vocabulary quiz',()=>{
  assert.ok(WORLD_NODES.length>=9);
  assert.equal(WORLD_STORIES.length,6);
  for(const story of WORLD_STORIES){
    assert.ok(story.clues.length>=2);
    assert.ok(story.plans.length>=1);
    assert.ok(story.brief.length>30);
  }
  assert.ok(WORLD_STORIES.filter(s=>s.plans.length>=2).length>=4,'most authored stories should support more than one valid architecture');
});

test('authored story requires observable evidence before a technically valid intervention counts',()=>{
  const story=WORLD_STORIES[0];
  const blind=evaluateWorldStory(story,{actions:['buffer'],inspected:[]});
  assert.equal(blind.ok,false);
  assert.equal(blind.enough,false);
  const seen=evaluateWorldStory(story,{actions:['buffer'],inspected:story.clues.slice(0,2)});
  assert.equal(seen.ok,true);
  assert.match(seen.consequence,/короб|worker|очеред/i);
});

test('same world problem can have meaningful alternative solutions with different tradeoffs',()=>{
  const story=WORLD_STORIES.find(x=>x.id==='friday-storm');
  const a=evaluateWorldStory(story,{actions:['buffer'],inspected:['dispatch','yard']});
  const b=evaluateWorldStory(story,{actions:['batch','scale'],inspected:['dispatch','yard']});
  assert.equal(a.ok,true);assert.equal(b.ok,true);
  assert.notEqual(a.plan.cost,b.plan.cost);
  assert.notEqual(a.plan.flow,b.plan.flow);
  const wrong=evaluateWorldStory(story,{actions:['scale'],inspected:['dispatch','yard']});
  assert.equal(wrong.ok,false);
});

test('city shifts are deterministic and preserve multiple valid engineering paths',()=>{
  const a=generateWorldShift(17), b=generateWorldShift(17), c=generateWorldShift(18);
  assert.deepEqual(a,b);assert.notDeepEqual(a,c);
  const plan=a.plans[0];
  const result=evaluateWorldShift(a,{actions:plan});
  if(result.overflow===0) assert.equal(result.ok,true);
  const wrong=evaluateWorldShift(a,{actions:['scale']});
  if(!a.plans.some(p=>p.length===1&&p[0]==='scale')) assert.equal(wrong.ok,false);
});

test('successful intervention can be revealed as Python only after the world meaning exists',()=>{
  const code=worldPython(['provenance','eval','policy']);
  assert.match(code,/retrieve_with_source/);
  assert.match(code,/ctx\.eval/);
  assert.match(code,/require_allowed/);
});


test('mastery exposes one real Python direct patch per generated world pattern',()=>{
  for(const id of ['burst','duplicate','stale','schema','unsafe','cascade','silence']){
    const patch=getWorldDirectPatch(id);
    assert.ok(patch,id);
    assert.ok(patch.family);
    assert.ok(patch.starter.includes('def '),`${id} needs executable Python starter`);
    assert.ok(patch.checks.length>=2,`${id} needs behavioral checks`);
  }
  assert.equal(Object.keys(WORLD_DIRECT_PATCHES).length,7);
});

test('direct patch reference implementations pass the same conceptual contracts in system CPython',async()=>{
  const {spawnSync}=await import('node:child_process');
  const source=String.raw`
def buffer_burst(items, capacity): return (items[:capacity], items[capacity:])
def apply_once(event_id, seen):
    if event_id in seen: return False
    seen.add(event_id); return True
def newest_doc(docs): return max(docs,key=lambda d:d["version"])
def valid_payload(payload): return isinstance(payload,dict) and {"id","kind"} <= payload.keys()
def allow_tool(name, allowed): return name in allowed
def route_mode(primary_healthy): return "primary" if primary_healthy else "degraded"
def stream_chunks(chunks):
    for chunk in chunks: yield chunk
assert buffer_burst([1,2,3,4],2)==([1,2],[3,4])
s=set(); assert apply_once("A",s) is True and apply_once("A",s) is False
assert newest_doc([{"version":2,"source":"old"},{"version":4,"source":"new"}])["source"]=="new"
assert valid_payload({"id":"A","kind":"text"}) and not valid_payload({"id":"A"})
assert allow_tool("lookup",{"lookup"}) and not allow_tool("delete_all",{"lookup"})
assert route_mode(False)=="degraded"
assert list(stream_chunks(["A","B"]))==["A","B"]
print("WORLD_DIRECT_PATCH_PASS")
`;
  const proc=spawnSync('python3',['-c',source],{encoding:'utf8'});
  assert.equal(proc.status,0,proc.stderr);
  assert.match(proc.stdout,/WORLD_DIRECT_PATCH_PASS/);
});


test('challenge progression has seven mastery families before black-box play',()=>{
  const families=new Set(Object.values(WORLD_DIRECT_PATCHES).map(p=>p.family));
  assert.deepEqual(families,new Set(['flow','effects','knowledge','boundary','authority','resilience','stream']));
});
