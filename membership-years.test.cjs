const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const source=fs.readFileSync('index.html','utf8');
const annual=source.slice(source.indexOf("    let membershipYear ="),source.indexOf('    async function loadMembershipSheet(sheetName,force=false)'));
const context=vm.createContext({});vm.runInContext(annual,context);
const run=code=>vm.runInContext(code,context);
test('all annual sections collapse into three groups',()=>{
 for(const name of ['2016','2017','2026','2027'])assert.equal(run('annualMembershipGroup('+JSON.stringify(name)+')'),'Membership Roster');
 assert.equal(run("annualMembershipGroup('Dashboard 2026')"),'Membership Dashboard');
 for(const name of ['2026-Attendance','2027 Attendance Dashboard','2026 Attendance Summary'])assert.equal(run('annualMembershipGroup('+JSON.stringify(name)+')'),'Membership Attendance');
 assert.equal(run("annualMembershipGroup('BOD Nominations 2027')"),null);
});
test('selected year routes every view to its own source',()=>{
 for(const year of ['2016','2017','2027']) {
  assert.equal(run("annualMembershipSource('Membership Roster','"+year+"')"),year);
  assert.equal(run("annualMembershipSource('Membership Dashboard','"+year+"')"),'Dashboard '+year);
  assert.equal(run("annualMembershipSource('Membership Attendance','"+year+"','records')"),year+'-Attendance');
  assert.equal(run("annualMembershipSource('Membership Attendance','"+year+"','dashboard')"),year+' Attendance Dashboard');
 }
});
test('virtual groups are excluded from global sheet reads and individual annual navigation',()=>{
 assert.match(source,/config.annualGroup \|\| config.attendanceDashboard/);
 assert.match(source,/filter\(name=>!annualMembershipGroup\(name\)\|\|annualGroups.includes\(name\)\)/);
 assert.match(source,/if\(!membershipSheetConfig\[source\]\)/);
});
test('all portal inline scripts parse',()=>{
 for(const m of source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
});
