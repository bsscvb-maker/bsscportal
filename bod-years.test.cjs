const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const api=require('./bod-nominations-results.js');
test('years have isolated nomination, candidate and audit sources',()=>{
 for(const year of [2026,2027,2028])assert.deepEqual(api.yearSheets(year),{year,nominations:'BOD Nominations '+year,candidates:'BOD Candidates '+year,audit:'BOD Nomination Changes '+year});
 for(const year of ['2027x',NaN,1999,2101])assert.throws(()=>api.yearSheets(year));
});
test('selector includes standard years and discovered historical archives',()=>{
 const years=api.availableYears([{properties:{title:'BOD Nominations 2024'}},{properties:{title:'BOD Nominations 2035'}}]);
 for(const year of [2024,2026,2027,2028,2035])assert.ok(years.includes(year));
 const markup=api.markup(api.buildModel([]),'now','#',false,2026,years);
 assert.match(markup,/Nominations <span>2026<\/span>/);
 assert.match(markup,/<option value="2026" selected>/);
 assert.doesNotMatch(markup,/<option value="2027" selected>/);
});
test('admin reads and recovery use the year captured with the record',()=>{
 const s=fs.readFileSync('bod-nominations-results.js','utf8');
 assert.match(s,/context\.nominationSheet/);assert.match(s,/context\.auditSheet/);
 assert.doesNotMatch(s,/getSheetValues\("'BOD Nominations 2027/);
 assert.match(s,/nominationSheet:names\.nominations,auditSheet:names\.audit/);
});

test('combined selector includes every historical year alongside live nomination years',()=>{
 globalThis.BSSCBodElectionHistoryData={2014:{},2015:{},2026:{}};
 try { const years=api.availableYears();for(const year of [2014,2015,2026,2027,2028])assert.ok(years.includes(year));assert.match(api.yearSelector(2014,years),/Board service year/); }
 finally {delete globalThis.BSSCBodElectionHistoryData;}
});
test('historical year delegates before any live sheet access',async()=>{
 const vm=require('node:vm');let historyCall;
 const context={window:{BSSCBodElectionHistoryData:{2026:{}},BSSCBodElectionHistory:{load:(year,years)=>{historyCall={year,years};}}},accessToken:'test-token',globalThis:{},Date};vm.createContext(context);
 vm.runInContext(fs.readFileSync('bod-nominations-results.js','utf8'),context);
 await context.window.BSSCBodNominations.selectYear(2026);
 assert.equal(historyCall.year,2026);assert.ok(historyCall.years.includes(2027));
});
test('membership navigation consolidates saved pins and retires standalone history',()=>{
 const source=fs.readFileSync('index.html','utf8');assert.doesNotMatch(source,/'BOD Election History':\{group:/);assert.match(source,/'BOD Nominations 2027':'Board Elections'/);assert.match(source,/bssc_board_elections_combined_v1/);assert.match(source,/savedPinned=savedPinned.filter\(name=>name!=='BOD Election History'\)/);
});
