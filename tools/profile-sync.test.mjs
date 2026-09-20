import test from 'node:test';
import assert from 'node:assert/strict';
import { createCampusProfile, markContractSolved, markModelDatasetSolved, markThreadsEpisode } from '../src/game/campus-profile.js';
import { CAMPUS_SYNC_SCHEMA, createProgressEnvelope, mergeProgressEnvelope, syncCampusProgress } from '../src/game/profile-sync.js';

test('progress envelope contains only versioned game progress, never auth/model secrets', () => {
  const profile = markContractSolved(createCampusProfile(), 'flow-01', 1, 40);
  const envelope = createProgressEnvelope(profile, {deviceId:'phone'});
  assert.equal(envelope.schema, CAMPUS_SYNC_SCHEMA);
  assert.equal(envelope.deviceId, 'phone');
  const text = JSON.stringify(envelope).toLowerCase();
  for (const forbidden of ['access_token','api_key','password','authorization']) assert.equal(text.includes(forbidden), false);
});

test('remote progress merges monotonically instead of overwriting local work', () => {
  const local = markContractSolved(createCampusProfile(), 'flow-01', 1, 40);
  const remoteProfile = markModelDatasetSolved(createCampusProfile(), 'digits', 1, 8, 110);
  const merged = mergeProgressEnvelope(local, createProgressEnvelope(remoteProfile, {deviceId:'laptop'}));
  assert.ok(merged.completedContracts.includes('flow-01'));
  assert.ok(merged.labs.model.completedDatasets.includes('digits'));
  assert.equal(merged.xp, 150, 'disjoint rewards from two devices must add without duplicating the same reason');
});

test('sync adapter keeps bearer token in transport header and merges server response', async () => {
  const local = markContractSolved(createCampusProfile(), 'flow-01', 1, 40);
  const remote = markContractSolved(createCampusProfile(), 'flow-02', 1, 40);
  let request;
  const fetchImpl = async (url, options) => {
    request = {url, options};
    return { ok:true, status:200, json:async()=>createProgressEnvelope(remote,{deviceId:'server'}) };
  };
  const result = await syncCampusProgress({profile:local, accessToken:'secret-token', fetchImpl});
  assert.equal(request.options.headers.authorization, 'Bearer secret-token');
  assert.equal(request.options.body.includes('secret-token'), false);
  assert.deepEqual(new Set(result.profile.completedContracts), new Set(['flow-01','flow-02']));
});


test('v15 client can merge legacy server envelopes during rollout',()=>{
  const local=markContractSolved(createCampusProfile(),'flow-01',1,40);
  const remote=markContractSolved(createCampusProfile(),'flow-02',1,40);
  const legacy={schema:'quequest.campus.v2',gameVersion:2,deviceId:'old-browser',profile:{...remote,version:2}};
  const merged=mergeProgressEnvelope(local,legacy);
  assert.deepEqual(new Set(merged.completedContracts),new Set(['flow-01','flow-02']));
  assert.equal(merged.version,15);
});

test('v15 sync accepts v10 envelopes while preserving chronicle-capable schema',()=>{
  const local=markContractSolved(createCampusProfile(),'flow-01',1,40);
  const remote=markContractSolved(createCampusProfile(),'flow-02',1,40);
  const legacy={schema:'quequest.campus.v10',gameVersion:11,deviceId:'previous-release',profile:{...remote,version:10}};
  const merged=mergeProgressEnvelope(local,legacy);
  assert.deepEqual(new Set(merged.completedContracts),new Set(['flow-01','flow-02']));
  assert.equal(merged.version,15);
  assert.deepEqual(merged.labs.chronicle.completedArcs,[]);
});


test('v15 sync accepts v11 envelopes while preserving CITY WEAVE-capable schema',()=>{
  const local=markContractSolved(createCampusProfile(),'flow-01',1,40);
  const remote=markContractSolved(createCampusProfile(),'flow-02',1,40);
  const legacy={schema:'quequest.campus.v11',gameVersion:12,deviceId:'previous-release',profile:{...remote,version:11}};
  const merged=mergeProgressEnvelope(local,legacy);
  assert.deepEqual(new Set(merged.completedContracts),new Set(['flow-01','flow-02']));
  assert.equal(merged.version,15);
  assert.deepEqual(merged.labs.weave.completedArcs,[]);
});


test('v15 sync accepts v12 envelopes while preserving CITY THREADS-capable schema',()=>{
  const local=markContractSolved(createCampusProfile(),'flow-01',1,40);
  const remote=markThreadsEpisode(createCampusProfile(),'first-promise','soft-ramp',['market-loop'],'sunset-proof',0,70,260);
  const legacy={schema:'quequest.campus.v12',gameVersion:13,deviceId:'previous-release',profile:{...remote,version:12,labs:{...remote.labs,threads:undefined}}};
  const merged=mergeProgressEnvelope(local,legacy);
  assert.ok(merged.completedContracts.includes('flow-01'));
  assert.equal(merged.version,15);
  assert.deepEqual(merged.labs.threads.completedEpisodes,[]);
});


test('v15 sync accepts v13 envelopes while preserving QUEST GUILD-capable schema',()=>{
  const local=markContractSolved(createCampusProfile(),'flow-01',1,40);
  const remote=markThreadsEpisode(createCampusProfile(),'first-promise','soft-ramp',['market-loop'],'sunset-proof',0,70,260);
  const legacy={schema:'quequest.campus.v13',gameVersion:14,deviceId:'previous-release',profile:{...remote,version:13,labs:{...remote.labs,guild:undefined}}};
  const merged=mergeProgressEnvelope(local,legacy);
  assert.ok(merged.completedContracts.includes('flow-01'));
  assert.equal(merged.version,15);
  assert.deepEqual(merged.labs.guild.completedQuests,[]);
});


test('v15 sync accepts v14 envelopes while preserving CAREER WORLDS-capable schema',()=>{
  const local=markContractSolved(createCampusProfile(),'flow-01',1,40);
  const remote=markContractSolved(createCampusProfile(),'flow-02',1,40);
  const legacy={schema:'quequest.campus.v14',gameVersion:15,deviceId:'previous-release',profile:{...remote,version:14,labs:{...remote.labs,guild:{...remote.labs.guild,realmRuns:undefined,realmWins:undefined,realmBest:undefined}}}};
  const merged=mergeProgressEnvelope(local,legacy);
  assert.deepEqual(new Set(merged.completedContracts),new Set(['flow-01','flow-02']));
  assert.equal(merged.version,15);
  assert.deepEqual(merged.labs.guild.realmWins,[]);
});
