import test from 'node:test';
import assert from 'node:assert/strict';
import { embedText, retrieveChunks, RETRIEVAL_MISSIONS, evaluateRetrievalMission } from '../src/game/retrieval-warehouse.js';

test('retrieval vectors are deterministic and normalized',()=>{
  const a=embedText('queue worker throughput'); const b=embedText('queue worker throughput');
  assert.deepEqual(a,b); assert.ok(Math.abs(Math.hypot(...a)-1)<1e-9);
});

test('queue query retrieves operations evidence instead of a hard-coded answer',()=>{
  const rows=retrieveChunks(RETRIEVAL_MISSIONS[0].query,{mode:'sentence',topK:1});
  assert.equal(rows[0].docId,'ops'); assert.ok(rows[0].score>0);
});

test('multi-source recovery needs sentence chunks, enough neighbors and provenance',()=>{
  const mission=RETRIEVAL_MISSIONS[1];
  assert.equal(evaluateRetrievalMission(mission,{mode:'document',topK:1,provenance:false,dataGuard:false}).ok,false);
  const good=evaluateRetrievalMission(mission,{mode:'sentence',topK:3,provenance:true,dataGuard:false});
  assert.equal(good.ok,true); assert.equal(good.recall,1);
});

test('hostile text inside DATA never passes the lesson without an explicit data guard',()=>{
  const mission=RETRIEVAL_MISSIONS[2];
  const unsafe=evaluateRetrievalMission(mission,{mode:'sentence',topK:2,provenance:true,dataGuard:false});
  const safe=evaluateRetrievalMission(mission,{mode:'sentence',topK:2,provenance:true,dataGuard:true});
  assert.equal(unsafe.ok,false); assert.equal(safe.ok,true);
  assert.ok(safe.results.some(row=>row.untrusted));
});
