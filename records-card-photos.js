(()=>{
 const previousArt=recordsCollectionArt;
 const photos={'archive':'archive-records-v1.webp','bikes for tykes':'bikes-for-tykes-records-v2.webp'};
 recordsCollectionArt=function(id,label,rows){
  const photo=photos[String(id).trim().toLowerCase()];
  return photo?'<div class="dashboard-art collection-photo-art" aria-hidden="true"><img src="assets/club-records/'+photo+'" alt="" decoding="async"></div>':previousArt(id,label,rows);
 };
})();
