import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCampusProfile, getCampusRank, markContractSolved, markPythonContractSolved,
  markSandboxSolved, markModelDatasetSolved, markFactoryTrialSolved, markSimnetIncidentSolved, markDeskIncidentSolved, markWorldStorySolved, markWorldShiftSolved, markCommonsBlueprint, markCommonsDay, markCommonsCode, markWeaveArc, markWeaveSeason, markWeaveCode, markThreadsEpisode, markThreadsCycle, markThreadsCode, markGuildQuest, markGuildJob, markGuildRaid, markGuildRealm, markCampusMission, markLabComplete, mergeCampusProfile, exportCampusProfile, loadCampusProfile,
} from '../src/game/campus-profile.js';

test('campus XP is awarded once per contract and rank only moves forward', () => {
  let profile = createCampusProfile();
  profile = markContractSolved(profile, 'flow-01', 1, 40);
  assert.equal(profile.xp, 40);
  assert.equal(profile.stats.contractsSolved, 1);
  profile = markContractSolved(profile, 'flow-01', 1, 40);
  assert.equal(profile.xp, 40);
  assert.equal(profile.stats.contractsSolved, 1);
  profile = markContractSolved(profile, 'flow-02', 1, 100);
  assert.equal(getCampusRank(profile.xp).name, 'ОПЕРАТОР');
});

test('python contracts and labs keep their best progress without farming XP', () => {
  let profile = createCampusProfile();
  profile = markPythonContractSolved(profile, 'py-01', 2, 60);
  profile = markPythonContractSolved(profile, 'py-01', 4, 60);
  assert.equal(profile.xp, 60);
  assert.equal(profile.labs.python.bestChecks['py-01'], 4);
  profile = markLabComplete(profile, 'ai', { bestAccuracy: .8 }, 220);
  profile = markLabComplete(profile, 'ai', { bestAccuracy: 1 }, 220);
  assert.equal(profile.xp, 280);
});

test('profile merge is monotonic and never loses solved work', () => {
  const left = markSandboxSolved(markContractSolved(markPythonContractSolved(createCampusProfile(), 'py-01', 2, 60), 'flow-01', 1, 40), 11, 220, 20);
  const right = markSandboxSolved(markLabComplete(markContractSolved(createCampusProfile(), 'safe-01', 1, 45), 'ai', { bestAccuracy: 1 }, 220), 12, 250, 20);
  const merged = mergeCampusProfile(left, right);
  assert.deepEqual(new Set(merged.completedContracts), new Set(['flow-01','safe-01']));
  assert.ok(merged.labs.python.completed.includes('py-01'));
  assert.equal(merged.labs.ai.completed, true);
  assert.deepEqual(new Set(merged.sandbox.solvedSeeds), new Set([11,12]));
  assert.equal(merged.sandbox.bestScore, 250);
  assert.ok(JSON.parse(exportCampusProfile(merged)).version >= 1);
});

test('generated shift XP is awarded once per seed', () => {
  let profile = createCampusProfile();
  profile = markSandboxSolved(profile, 7, 100, 20);
  profile = markSandboxSolved(profile, 7, 130, 20);
  assert.equal(profile.xp, 20);
  assert.equal(profile.sandbox.bestScore, 130);
  assert.deepEqual(profile.sandbox.solvedSeeds, [7]);
});

test('model workbench mastery is portable and pays each dataset once', () => {
  let profile = createCampusProfile();
  profile = markModelDatasetSolved(profile, 'digits', .92, 12, 110);
  profile = markModelDatasetSolved(profile, 'digits', 1, 30, 110);
  profile = markModelDatasetSolved(profile, 'letters', .95, 18, 110);
  assert.equal(profile.xp, 220);
  assert.deepEqual(profile.labs.model.completedDatasets, ['digits','letters']);
  assert.equal(profile.labs.model.bestAccuracy, 1);
  assert.equal(profile.labs.model.epochs, 30);
  const merged = mergeCampusProfile(profile, markModelDatasetSolved(createCampusProfile(), 'icons', .91, 20, 110));
  assert.deepEqual(new Set(merged.labs.model.completedDatasets), new Set(['digits','letters','icons']));
});

test('legacy v1 campus profile migrates its old XP into a non-duplicating legacy floor', () => {
  const data = new Map([['quequest.campus.v1', JSON.stringify({version:1,xp:420,completedContracts:['flow-01']})]]);
  const storage = { getItem:key=>data.get(key) ?? null, setItem:(key,value)=>data.set(key,value) };
  let profile = loadCampusProfile(storage);
  assert.equal(profile.version, 15);
  assert.equal(profile.xp, 420);
  assert.equal(profile.legacyXp, 420);
  profile = markContractSolved(profile, 'flow-02', 1, 40);
  assert.equal(profile.xp, 460);
});

test('automation and AI factory progress merge across devices without losing the better result', () => {
  const left = markLabComplete(
    markLabComplete(createCampusProfile(), 'automation', { completedMissions:['inbox','csv'], safeRuns:2 }, 360),
    'factory', { bestScore:88, bestCost:20 }, 600,
  );
  const right = markLabComplete(
    markLabComplete(createCampusProfile(), 'automation', { completedMissions:['http','provider'], safeRuns:4 }, 360),
    'factory', { bestScore:96, bestCost:18 }, 600,
  );
  const merged = mergeCampusProfile(left, right);
  assert.deepEqual(new Set(merged.labs.automation.completedMissions), new Set(['inbox','csv','http','provider']));
  assert.equal(merged.labs.automation.safeRuns, 4);
  assert.equal(merged.labs.factory.bestScore, 96);
  assert.equal(merged.labs.factory.bestCost, 18);
});


test('factory trial XP is unique per seed and merges like other long-game shifts',()=>{
  let profile=createCampusProfile();
  profile=markFactoryTrialSolved(profile,3,92,80);
  profile=markFactoryTrialSolved(profile,3,100,80);
  assert.equal(profile.xp,80);
  assert.equal(profile.labs.factory.bestTrialScore,100);
  const other=markFactoryTrialSolved(createCampusProfile(),4,88,80);
  const merged=mergeCampusProfile(profile,other);
  assert.deepEqual(new Set(merged.labs.factory.trialSeeds),new Set([3,4]));
});


test('legacy v2 profile migrates into v15 and SIMNET incident rewards merge without duplication',()=>{
  const legacy={version:2,xp:500,legacyXp:120,awards:{'contract:old':380},completedContracts:['old']};
  const data=new Map([['quequest.campus.v2',JSON.stringify(legacy)]]);
  const storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
  let profile=loadCampusProfile(storage);
  assert.equal(profile.version,15);
  assert.equal(profile.xp,500);
  profile=markCampusMission(profile,'simnet','gateway',{},130);
  profile=markSimnetIncidentSolved(profile,9,100,90);
  profile=markSimnetIncidentSolved(profile,9,100,90);
  assert.equal(profile.labs.simnet.incidentSeeds.length,1);
  const other=markSimnetIncidentSolved(markCampusMission(createCampusProfile(),'simnet','mcp',{},130),10,100,90);
  const merged=mergeCampusProfile(profile,other);
  assert.deepEqual(new Set(merged.labs.simnet.completedMissions),new Set(['gateway','mcp']));
  assert.deepEqual(new Set(merged.labs.simnet.incidentSeeds),new Set([9,10]));
});


test('OPS DESK cases and infinite shifts merge without duplicate XP',()=>{
  let left=markCampusMission(createCampusProfile(),'desk','receipt-loop',{bestScore:100},140);
  left=markDeskIncidentSolved(left,7,100,85);
  left=markDeskIncidentSolved(left,7,100,85);
  let right=markCampusMission(createCampusProfile(),'desk','stale-answer',{bestScore:92},140);
  right=markDeskIncidentSolved(right,8,95,85);
  const merged=mergeCampusProfile(left,right);
  assert.deepEqual(new Set(merged.labs.desk.completedMissions),new Set(['receipt-loop','stale-answer']));
  assert.deepEqual(new Set(merged.labs.desk.incidentSeeds),new Set([7,8]));
  assert.equal(merged.labs.desk.bestIncidentScore,100);
  assert.equal(left.awards['deskincident:7'],85);
});

test('legacy v5 profile migrates into v15 including Nexus progress',()=>{
  const legacy=createCampusProfile({labs:{nexus:{completedMissions:['lights-out'],research:['queue']}}});
  const v5={...legacy,version:5};
  const data=new Map([['quequest.campus.v5',JSON.stringify(v5)]]);
  const storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
  const profile=loadCampusProfile(storage);
  assert.equal(profile.version,15);
  assert.ok(profile.labs.nexus.completedMissions.includes('lights-out'));
  assert.ok(profile.labs.nexus.research.includes('queue'));
  assert.deepEqual(profile.labs.desk.completedMissions,[]);
});


test('WORLD GRID stories, shifts and discovered nodes merge without farming XP',()=>{
  let left=markWorldStorySolved(createCampusProfile(),'friday-storm',97,['dispatch','yard'],'friday-storm:buffer',170);
  left=markWorldShiftSolved(left,11,88,['ledger'],'buffer',95);
  left=markWorldShiftSolved(left,11,99,['ledger'],'buffer',95);
  let right=markWorldStorySolved(createCampusProfile(),'double-receipt',93,['dispatch','ledger'],'double-receipt:once',170);
  right=markWorldShiftSolved(right,12,91,['archive'],'provenance+eval',95);
  const merged=mergeCampusProfile(left,right);
  assert.deepEqual(new Set(merged.labs.world.completedStories),new Set(['friday-storm','double-receipt']));
  assert.deepEqual(new Set(merged.labs.world.shiftSeeds),new Set([11,12]));
  assert.ok(merged.labs.world.discoveredNodes.includes('archive'));
  assert.ok(merged.labs.world.playbooks.some(x=>x.includes('friday-storm:buffer')));
  assert.equal(left.awards['worldshift:11'],95);
});

test('WORLD GRID mastery and direct-code seeds merge monotonically',()=>{
  let left=markWorldStorySolved(createCampusProfile(),'friday-storm',100,['dispatch','yard'],'friday-storm:buffer',170,'flow');
  left=markWorldShiftSolved(left,21,100,[],'code:burst',120,'flow',true,true);
  let right=markWorldStorySolved(createCampusProfile(),'double-receipt',100,['dispatch','ledger'],'double-receipt:once',170,'effects');
  right=markWorldShiftSolved(right,22,100,[],'code:duplicate',120,'effects',true);
  const merged=mergeCampusProfile(left,right);
  assert.deepEqual(new Set(merged.labs.world.masteredPatterns),new Set(['flow','effects']));
  assert.deepEqual(new Set(merged.labs.world.directPatchSeeds),new Set([21,22]));
  assert.deepEqual(new Set(merged.labs.world.blackBoxSeeds),new Set([21]));
  assert.equal(merged.awards['worldshift:21'],120);
});

test('legacy v6 profile migrates into v15 with an empty living world',()=>{
  const legacy=createCampusProfile({labs:{desk:{completedMissions:['receipt-loop']}}});
  const v6={...legacy,version:6};
  const data=new Map([['quequest.campus.v6',JSON.stringify(v6)]]);
  const storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
  const profile=loadCampusProfile(storage);
  assert.equal(profile.version,15);
  assert.ok(profile.labs.desk.completedMissions.includes('receipt-loop'));
  assert.deepEqual(profile.labs.world.completedStories,[]);
});


test('AUTOMATION COMMONS blueprints, city days and code deployment merge without duplicate XP',()=>{
  let left=createCampusProfile();
  left=markCommonsBlueprint(left,'rush-hour','rush-hour|flow:queue:none',210,91,180);
  left=markCommonsDay(left,4,180,115);
  left=markCommonsDay(left,4,220,115);
  let right=createCampusProfile();
  right=markCommonsBlueprint(right,'receipt-guard','receipt-guard|effects:once:seen',205,88,180);
  right=markCommonsDay(right,5,190,115);
  right=markCommonsCode(right,420);
  const merged=mergeCampusProfile(left,right);
  assert.deepEqual(new Set(merged.labs.commons.completedBriefs),new Set(['rush-hour','receipt-guard']));
  assert.deepEqual(new Set(merged.labs.commons.daySeeds),new Set([4,5]));
  assert.equal(merged.labs.commons.codeDeployed,true);
  assert.ok(merged.labs.commons.blueprints.some(x=>x.includes('flow:queue')));
  assert.equal(left.awards['commons:day:4'],115);
});

test('legacy v10 profile migrates into v15 with empty chronicle progress',()=>{
  const legacy=createCampusProfile({labs:{operations:{completedArcs:['schema-v2'],codeDeployed:true}}});
  const v10={...legacy,version:10,labs:{...legacy.labs,chronicle:undefined}};
  const data=new Map([['quequest.campus.v10',JSON.stringify(v10)]]);
  const storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
  const profile=loadCampusProfile(storage);
  assert.equal(profile.version,15);
  assert.ok(profile.labs.operations.completedArcs.includes('schema-v2'));
  assert.deepEqual(profile.labs.chronicle.completedArcs,[]);
  assert.equal(profile.labs.chronicle.codeDeployed,false);
});


test('CITY WEAVE decisions, seasons and governor merge without duplicate XP',()=>{
  let left=createCampusProfile();
  left=markWeaveArc(left,'two-speeds','dual-lane',62,240);
  left=markWeaveSeason(left,3,71,130);
  left=markWeaveSeason(left,3,90,130);
  let right=createCampusProfile();
  right=markWeaveArc(right,'living-queue','drain-checkpoint',68,240);
  right=markWeaveSeason(right,4,77,130);
  right=markWeaveCode(right,520);
  const merged=mergeCampusProfile(left,right);
  assert.deepEqual(new Set(merged.labs.weave.completedArcs),new Set(['two-speeds','living-queue']));
  assert.deepEqual(new Set(merged.labs.weave.seasonSeeds),new Set([3,4]));
  assert.ok(merged.labs.weave.decisions.includes('two-speeds:dual-lane'));
  assert.equal(merged.labs.weave.codeDeployed,true);
  assert.equal(left.awards['weave:season:3'],130);
});

test('legacy v11 profile migrates into v15 with an empty CITY WEAVE history',()=>{
  const legacy=createCampusProfile({labs:{chronicle:{completedArcs:['old-door'],codeDeployed:true}}});
  const v11={...legacy,version:11,labs:{...legacy.labs,weave:undefined}};
  const data=new Map([['quequest.campus.v11',JSON.stringify(v11)]]);
  const storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
  const profile=loadCampusProfile(storage);
  assert.equal(profile.version,15);
  assert.ok(profile.labs.chronicle.completedArcs.includes('old-door'));
  assert.deepEqual(profile.labs.weave.completedArcs,[]);
  assert.equal(profile.labs.weave.codeDeployed,false);
});


test('CITY THREADS episodes, cycles, districts and orchestrator merge without duplicate XP',()=>{
  let left=createCampusProfile();
  left=markThreadsEpisode(left,'first-promise','soft-ramp',['market-loop'],'sunset-proof',0,67,260);
  left=markThreadsCycle(left,7,72,150);
  left=markThreadsCycle(left,7,88,150);
  let right=createCampusProfile();
  right=markThreadsEpisode(right,'qbot-apprentice','proof-ladder',[],'qbot-earned',18,74,260);
  right=markThreadsCycle(right,8,79,150);
  right=markThreadsCode(right,600);
  const merged=mergeCampusProfile(left,right);
  assert.deepEqual(new Set(merged.labs.threads.completedEpisodes),new Set(['first-promise','qbot-apprentice']));
  assert.deepEqual(new Set(merged.labs.threads.cycleSeeds),new Set([7,8]));
  assert.ok(merged.labs.threads.unlockedDistricts.includes('market-loop'));
  assert.ok(merged.labs.threads.echoes.includes('sunset-proof'));
  assert.equal(merged.labs.threads.codeDeployed,true);
  assert.equal(left.awards['threads:cycle:7'],150);
});

test('legacy v12 profile migrates into v15 with empty CITY THREADS history',()=>{
  const legacy=createCampusProfile({labs:{weave:{completedArcs:['two-speeds'],codeDeployed:true}}});
  const v12={...legacy,version:12,labs:{...legacy.labs,threads:undefined}};
  const data=new Map([['quequest.campus.v12',JSON.stringify(v12)]]);
  const storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
  const profile=loadCampusProfile(storage);
  assert.equal(profile.version,15);
  assert.ok(profile.labs.weave.completedArcs.includes('two-speeds'));
  assert.deepEqual(profile.labs.threads.completedEpisodes,[]);
  assert.deepEqual(profile.labs.threads.unlockedDistricts,['core']);
  assert.equal(profile.labs.threads.codeDeployed,false);
});


test('QUEST GUILD quests, jobs and raids merge without duplicating credits or XP',()=>{
  let left=createCampusProfile();
  left=markGuildQuest(left,'garage-owned-rig','owner-boundary',{vehicle:2,security:2},220,260);
  left=markGuildJob(left,7,'automation',2,190,105);
  left=markGuildJob(left,7,'automation',2,190,105);
  let right=createCampusProfile();
  right=markGuildQuest(right,'paid-shop-automation','small-script',{automation:3,systems:1},320,240);
  right=markGuildRaid(right,'arcade-tower',{security:1,systems:1,web:1},900,95,520);
  const merged=mergeCampusProfile(left,right);
  assert.deepEqual(new Set(merged.labs.guild.completedQuests),new Set(['garage-owned-rig','paid-shop-automation']));
  assert.deepEqual(new Set(merged.labs.guild.completedRaids),new Set(['arcade-tower']));
  assert.deepEqual(merged.labs.guild.jobSeeds,[7]);
  assert.equal(merged.labs.guild.creditLedger['job:7'],190);
  assert.equal(merged.labs.guild.skillLedger['quest:garage-owned-rig'].vehicle,2);
  assert.equal(left.awards['guild:job:7'],105);
});

test('legacy v13 profile migrates into v15 with an empty QUEST GUILD ledger',()=>{
  const legacy=createCampusProfile({labs:{threads:{completedEpisodes:['first-promise'],codeDeployed:true}}});
  const v13={...legacy,version:13,labs:{...legacy.labs,guild:undefined}};
  const data=new Map([['quequest.campus.v13',JSON.stringify(v13)]]);
  const storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
  const profile=loadCampusProfile(storage);
  assert.equal(profile.version,15);
  assert.ok(profile.labs.threads.completedEpisodes.includes('first-promise'));
  assert.deepEqual(profile.labs.guild.completedQuests,[]);
  assert.deepEqual(profile.labs.guild.jobSeeds,[]);
});


test('legacy v14 profile migrates into v15 with empty CAREER WORLDS history',()=>{
  const legacy=createCampusProfile({labs:{guild:{completedQuests:['garage-owned-rig'],realmWins:['vehicle'],realmRuns:['vehicle:100'],realmBest:{vehicle:100}}}});
  const v14={...legacy,version:14,labs:{...legacy.labs,guild:{...legacy.labs.guild,realmRuns:undefined,realmWins:undefined,realmBest:undefined}}};
  const data=new Map([['quequest.campus.v14',JSON.stringify(v14)]]);
  const storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
  const profile=loadCampusProfile(storage);
  assert.equal(profile.version,15);
  assert.ok(profile.labs.guild.completedQuests.includes('garage-owned-rig'));
  assert.deepEqual(profile.labs.guild.realmRuns,[]);
  assert.deepEqual(profile.labs.guild.realmWins,[]);
  assert.deepEqual(profile.labs.guild.realmBest,{});
});

test('CAREER WORLDS realm wins merge without duplicate XP or skill gain',()=>{
  let left=markGuildRealm(createCampusProfile(),'vehicle',94,'vehicle',2,170);
  left=markGuildRealm(left,'vehicle',99,'vehicle',2,170);
  let right=markGuildRealm(createCampusProfile(),'automation',88,'automation',2,170);
  const merged=mergeCampusProfile(left,right);
  assert.deepEqual(new Set(merged.labs.guild.realmWins),new Set(['vehicle','automation']));
  assert.equal(merged.labs.guild.realmBest.vehicle,99);
  assert.equal(merged.labs.guild.skillLedger['realm:vehicle'].vehicle,2);
  assert.equal(left.awards['guild:realm:vehicle'],170);
  assert.equal(Object.keys(left.awards).filter(k=>k==='guild:realm:vehicle').length,1);
});
