import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('campus exposes QUEST GUILD as a prominent non-linear branch with jobs and party raids',async()=>{
  const html=await fs.readFile(new URL('../index.html',import.meta.url),'utf8');
  for(const token of ['data-campus-branch="guild"','id="questGuild"','id="guildSkills"','id="guildQuestGrid"','id="guildJob"','id="guildPartyPicks"','id="guildWallet"','id="guildSkill"']) assert.ok(html.includes(token),token);
  assert.match(html,/Не проходи курс по порядку/);
  assert.match(html,/синтетическ[^<]{0,80}разрешённ/);
});

test('QUEST GUILD stays touch-first and uses existing game art without requiring a 3D runtime',async()=>{
  const css=await fs.readFile(new URL('../styles.css',import.meta.url),'utf8');
  assert.match(css,/\.guild-approaches button\{min-height:112px/);
  assert.match(css,/garage-panel\.jpg/);
  assert.match(css,/ice-panel\.jpg/);
  assert.match(css,/@media\(max-width:620px\)[\s\S]*guild-approaches/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)[\s\S]*quest-guild/);
});

test('main runtime wires QUEST GUILD through shared profile instead of a guild-specific localStorage',async()=>{
  const main=await fs.readFile(new URL('../src/game/main.js',import.meta.url),'utf8');
  const guild=await fs.readFile(new URL('../src/game/quest-guild.js',import.meta.url),'utf8');
  assert.match(main,/createQuestGuild/);assert.match(main,/guild-quest/);assert.match(main,/onOpenGuild/);
  assert.equal(/localStorage/.test(guild),false);
});
