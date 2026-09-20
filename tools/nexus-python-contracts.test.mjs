import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { PYTHON_CONTRACTS } from '../src/game/python-contracts.js';

const ids = new Set(PYTHON_CONTRACTS.map(c=>c.id));

test('tier 7 translates Factory Nexus mechanics into six real CPython contracts',()=>{
  for(const id of ['py-31','py-32','py-33','py-34','py-35','py-36']) assert.ok(ids.has(id),id);
  const text=PYTHON_CONTRACTS.filter(c=>Number(c.id.slice(3))>=31).map(c=>`${c.title} ${c.concept}`).join(' ').toLowerCase();
  for(const token of ['pipeline','cache','circuit breaker','provenance','eval','bounded agent']) assert.ok(text.includes(token),token);
});

test('reference implementations for all six new contracts execute in system CPython',()=>{
  const source=String.raw`
def compose(stages):
    def pipeline(value):
        for stage in stages:
            value = stage(value)
        return value
    return pipeline

def cached_get(cache, key, compute):
    if key not in cache:
        cache[key] = compute(key)
    return cache[key]

def allow_call(state, threshold):
    if state.get("open"):
        return False
    if state.get("failures", 0) >= threshold:
        state["open"] = True
        return False
    return True

def build_context(chunks, ids):
    out=[]
    for chunk_id in ids:
        item=chunks.get(chunk_id)
        if item is not None:
            out.append(f'[{item["source"]}] {item["text"]}')
    return out

def evaluate(fn, cases):
    if not cases:
        return 0.0
    return sum(fn(value) == expected for value, expected in cases) / len(cases)

def agent_step(action, allowed, tools):
    if not isinstance(action, dict):
        raise ValueError("bad action")
    tool=action.get("tool")
    args=action.get("args")
    if tool not in allowed or tool not in tools or not isinstance(args, dict):
        raise ValueError("denied")
    return {"tool":tool,"result":tools[tool](**args)}

def inc(x): return x+1
def double(x): return x*2
assert compose([inc,double])(3) == 8
assert compose([])(7) == 7
class Counter:
    def __init__(self): self.calls=0
    def __call__(self,key): self.calls+=1; return key.upper()
c={}; f=Counter(); assert cached_get(c,"a",f)=="A"; assert cached_get(c,"a",f)=="A"; assert f.calls==1
s={"failures":3,"open":False}; assert allow_call(s,3) is False and s["open"] is True
assert build_context({"a":{"source":"manual","text":"alpha"}},["missing","a"]) == ["[manual] alpha"]
assert evaluate(lambda x:x%2==0,[(2,True),(3,False),(5,True)]) == 2/3
assert evaluate(lambda x:x,[]) == 0.0
def lookup(id): return {"id":id,"status":"ok"}
assert agent_step({"tool":"lookup","args":{"id":"A"}},{"lookup"},{"lookup":lookup})["result"]["status"] == "ok"
try:
    agent_step({"tool":"delete_all","args":{}},{"lookup"},{})
    raise AssertionError("dangerous tool passed")
except ValueError:
    pass
print("NEXUS_CPTHON_REFERENCE_PASS")
`;
  const proc=spawnSync('python3',['-c',source],{encoding:'utf8'});
  assert.equal(proc.status,0,proc.stderr);
  assert.match(proc.stdout,/NEXUS_CPTHON_REFERENCE_PASS/);
});
