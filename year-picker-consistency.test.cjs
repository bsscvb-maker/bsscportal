const test=require('node:test'),assert=require('node:assert/strict');
const {normalizeYearPicker}=require('./portal-year-selects.js');
function picker(values,selected){
 const select={options:[],value:selected,appendChild(option){this.options=this.options.filter(o=>o!==option);this.options.push(option);}};
 select.options=values.map(value=>({value,textContent:value,remove(){select.options=select.options.filter(o=>o!==this);}}));return select;
}
test('future years are removed and available years descend from 2027',()=>{
 const select=picker(['2026','2030','2025','2028','2027','2029'],'2027');normalizeYearPicker(select,2027);
 assert.deepEqual(select.options.map(o=>o.value),['2027','2026','2025']);assert.equal(select.value,'2027');assert.equal(select.options[0].defaultSelected,true);
});
test('chosen historical year remains the selection when reopening',()=>{
 const select=picker(['2025','2027','2026'],'2025');normalizeYearPicker(select,2027);normalizeYearPicker(select,2027);
 assert.equal(select.value,'2025');assert.deepEqual(select.options.map(o=>o.value),['2027','2026','2025']);
});
test('a removed future selection falls back to latest actual year',()=>{
 const select=picker(['2029','2027','2026'],'2029');normalizeYearPicker(select,2027);assert.equal(select.value,'2027');
});
test('unrelated selections and All years filters remain usable',()=>{
 const select=picker(['','2026','2027'],'');normalizeYearPicker(select,2027);assert.equal(select.value,'');
 const unrelated=picker(['Active','Inactive'],'Active');normalizeYearPicker(unrelated,2027);assert.deepEqual(unrelated.options.map(o=>o.value),['Active','Inactive']);
});

test('year labels with descriptive text are also sorted',()=>{const select=picker(['2026','2027'],'2027');select.options.forEach(o=>o.textContent=o.value+' Fundraiser');normalizeYearPicker(select,2027);assert.deepEqual(select.options.map(o=>o.value),['2027','2026']);});
