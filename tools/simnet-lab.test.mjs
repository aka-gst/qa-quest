import test from 'node:test';
import assert from 'node:assert/strict';
import {SIMNET_MISSIONS,evaluateSimnetMission,generateSimnetIncident,evaluateSimnetIncident,SIMNET_PYTHON_SOURCE} from '../src/game/simnet-lab.js';

test('all authored SIMNET stations require observable boundaries',()=>{
  for(const mission of SIMNET_MISSIONS){
    const selected=[...new Set([...mission.required,...mission.proof,...(mission.anyOf??[]).map(group=>group[0])])];
    const result=evaluateSimnetMission(mission,selected);
    assert.equal(result.ok,true,mission.id);
    assert.ok(result.trace.some(line=>line.includes('PASS')));
  }
});

test('gateway refuses the seductive partial setup that leaks the auth header',()=>{
  const m=SIMNET_MISSIONS.find(x=>x.id==='gateway');
  const result=evaluateSimnetMission(m,['bearer','allowlist','requestid','timeout','stream','trace']);
  assert.equal(result.ok,false);
  assert.match(result.hazard,/SECRET LEAK/);
});

test('MCP resource text cannot grant a dangerous tool permission',()=>{
  const m=SIMNET_MISSIONS.find(x=>x.id==='mcp');
  const result=evaluateSimnetMission(m,['discover','allowlist','approval','requestid','trace']);
  assert.equal(result.ok,false);
  assert.match(result.hazard,/PROMPT INJECTION/);
});

test('health without readiness is a false green',()=>{
  const m=SIMNET_MISSIONS.find(x=>x.id==='ops');
  const result=evaluateSimnetMission(m,['health','backup','checksum','rollback','trace']);
  assert.equal(result.ok,false);
  assert.match(result.hazard,/FALSE GREEN/);
});

test('incident seeds are deterministic and power does not substitute diagnosis',()=>{
  const a=generateSimnetIncident(37),b=generateSimnetIncident(37);
  assert.deepEqual(a,b);
  assert.equal(evaluateSimnetIncident(a,{layer:a.layer,fix:a.fix}).ok,true);
  assert.equal(evaluateSimnetIncident(a,{layer:'PROVIDER',fix:'MORE WORKERS'}).ok,false);
});

test('revealed Python keeps provider/auth/tool boundaries explicit',()=>{
  assert.match(SIMNET_PYTHON_SOURCE,/Provider\(Protocol\)/);
  assert.match(SIMNET_PYTHON_SOURCE,/Bearer \*\*\*/);
  assert.match(SIMNET_PYTHON_SOURCE,/discovered tools are capabilities, not permissions/);
  assert.match(SIMNET_PYTHON_SOURCE,/exit code/);
});
