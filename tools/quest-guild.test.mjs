import test from 'node:test';
import assert from 'node:assert/strict';
import {GUILD_SKILLS,GUILD_QUESTS,GUILD_RAIDS,guildHistoryPoints,deriveGuildPortfolio,isGuildQuestUnlocked,evaluateGuildApproach,generateGuildJob,evaluateGuildJob,evaluateGuildRaidTeam} from '../src/game/quest-guild.js';
import {createCampusProfile,markLabComplete,markCommonsCode,markGuildQuest} from '../src/game/campus-profile.js';

test('QUEST GUILD exposes seven professions and at least ten multi-path story quests',()=>{
  assert.equal(GUILD_SKILLS.length,7);
  assert.ok(GUILD_QUESTS.length>=10);
  assert.ok(GUILD_QUESTS.every(q=>q.approaches.length>=3));
  assert.ok(GUILD_QUESTS.filter(q=>q.inspiration).length>=8);
  assert.ok(GUILD_QUESTS.some(q=>q.id==='garage-owned-rig'));
  assert.ok(GUILD_QUESTS.some(q=>q.id==='practice-server'));
});

test('empty profile can start several professions without completing a linear prerequisite chain',()=>{
  const profile=createCampusProfile();
  const open=GUILD_QUESTS.filter(q=>isGuildQuestUnlocked(profile,q).ok);
  assert.ok(open.length>=4);
  assert.ok(open.some(q=>q.skills.includes('vehicle')));
  assert.ok(open.some(q=>q.skills.includes('security')));
  assert.ok(open.some(q=>q.skills.includes('automation')));
  assert.ok(open.some(q=>q.skills.includes('ai')));
});

test('old adventures are recognized as skill history instead of forcing veterans to restart',()=>{
  let profile=createCampusProfile();
  profile=markLabComplete(profile,'automation',{},0);
  profile=markLabComplete(profile,'ai',{},0);
  profile=markLabComplete(profile,'llm',{},0);
  profile=markCommonsCode(profile,0);
  const history=guildHistoryPoints(profile);
  assert.ok(history.automation>=4);
  assert.ok(history.ai>=3);
  const portfolio=deriveGuildPortfolio(profile);
  assert.ok(portfolio.automation.level>=1);
  assert.ok(portfolio.ai.level>=1);
});

test('the same quest can train meaningfully different professions',()=>{
  const profile=createCampusProfile();
  const quest=GUILD_QUESTS.find(q=>q.id==='garage-owned-rig');
  const boundary=evaluateGuildApproach(quest,'owner-boundary',profile);
  const replay=evaluateGuildApproach(quest,'replay-lab',profile);
  assert.equal(boundary.ok,true);assert.equal(replay.ok,true);
  assert.notDeepEqual(boundary.approach.skills,replay.approach.skills);
  assert.ok((boundary.approach.skills.security??0)>(replay.approach.skills.security??0));
  assert.ok(replay.approach.skills.automation>0);
});

test('completing one specialization can unlock a harder quest through OR requirements',()=>{
  let profile=createCampusProfile();
  const hard=GUILD_QUESTS.find(q=>q.id==='bad-update');
  assert.equal(isGuildQuestUnlocked(profile,hard).ok,false);
  profile=markGuildQuest(profile,'paid-shop-automation','small-script',{automation:3},320,0);
  assert.equal(isGuildQuestUnlocked(profile,hard).ok,true);
});

test('paid work orders are deterministic and can be solved through listed skills',()=>{
  assert.deepEqual(generateGuildJob(41),generateGuildJob(41));
  assert.notDeepEqual(generateGuildJob(41),generateGuildJob(42));
  const job=generateGuildJob(41);const profile=createCampusProfile();
  const result=evaluateGuildJob(job,job.skills[0],profile);
  assert.equal(result.ok,true);assert.ok(result.payout>0);assert.ok(result.success>=45 && result.success<=100);
  assert.equal(evaluateGuildJob(job,'security',profile).ok,job.skills.includes('security'));
});

test('party raids require complementary roles rather than one maxed class',()=>{
  assert.equal(GUILD_RAIDS.length,2);
  const raid=GUILD_RAIDS[0];
  assert.equal(evaluateGuildRaidTeam(raid,['security','security','security']).ok,false);
  const good=evaluateGuildRaidTeam(raid,['security','systems','web']);
  assert.equal(good.ok,true);assert.equal(good.unique.length,3);
});

test('security and vehicle quests stay on synthetic or authorized targets and avoid operational attack commands',()=>{
  const text=JSON.stringify({quests:GUILD_QUESTS,raids:GUILD_RAIDS}).toLowerCase();
  for(const forbidden of ['nmap ','ssh ','curl http','can_id','candump','cansend','metasploit','sqlmap']) assert.equal(text.includes(forbidden),false,forbidden);
  assert.match(text,/синтетич/);
  assert.match(text,/разреш/);
  assert.match(text,/стенд/);
});
