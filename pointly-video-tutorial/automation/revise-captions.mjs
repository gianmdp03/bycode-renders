import fs from 'node:fs';import path from 'node:path';import {root} from './browser.mjs';
// Reviewed Spanish tokenization/orthography. Numbers retain their spoken value.
// These edits do not manufacture timing: every replacement inherits the actual
// acoustic span of the corresponding recognized word(s).
const fixes={
 '03-profile':[['continúal','continuá al']],
 '05-settings':[['bronze,','Bronce,']],
 '07-navigation':[['Resume en','Resumen'],['sinactividad,','Sin actividad,']],
 '10-search':[['Verdetalle','Ver detalle']],
 '11-sale':[['8 .500','8.500']],
 '12-sales-history':[['usar','usá']],
 '14-promotion-life':[['cancelás','cancelá'],['comprova','comprobá']],
 '18-reward-life':[['loquita','lo quita']],
 '19-redeem':[['verificar','Verificá']],
 '26-wallet-access':[['verme','Ver mi'],['DNE','DNI']],
};
const endPunctuation=/[.!?;:]$/;const weak=new Set(['el','la','los','las','un','una','por','para','de','del','sin','y','o','con','a','al','su','sus','que']);const reports=[];
for(const file of fs.readdirSync(path.join(root,'audio')).filter(f=>f.endsWith('.alignment.json'))){
 const id=file.replace('.alignment.json','');const full=path.join(root,'audio',file);const a=JSON.parse(fs.readFileSync(full,'utf8'));
 // Whisper may return units as separate tokens ("50", "%"). They carry
 // meaning and acoustic spans even though they contain no letters or digits.
 const words=a.words.filter(w=>/[\p{L}\p{N}%‰$€£]/u.test(w.display??w.word)).map(w=>({...w,text:w.display??w.word}));
 for(const [from,to] of fixes[id]??[]){for(let i=0;i<words.length;i++)for(let n=1;n<=4&&i+n<=words.length;n++){if(words.slice(i,i+n).map(w=>w.text).join(' ')===from){words.splice(i,n,{...words[i],end:words[i+n-1].end,text:to});break}}}
 const captions=[];let group=[];
 const flush=(n=group.length)=>{const part=group.splice(0,n);if(!part.length)return;captions.push({text:part.map(w=>w.text).join(' '),startMs:Math.round(part[0].start*1000),endMs:Math.round(part.at(-1).end*1000),timestampMs:null,confidence:part.reduce((v,w)=>v+w.probability,0)/part.length})};
 for(const w of words){
  if(group.length&&(group.map(x=>x.text).join(' ').length+w.text.length>88||w.end-group[0].start>5.3)){
   let n=group.length;for(let i=group.length-1;i>=2;i--)if(/[,;:]$/.test(group[i].text)&&group[i].end-group[0].start>1.2){n=i+1;break}
   if(n===group.length&&weak.has(group.at(-1).text.toLowerCase()))n--;
   flush(n);
  }
  group.push(w);if(endPunctuation.test(w.text))flush();
 }
 flush();a.captions=captions;a.captionReview={method:'Acoustic word spans retained, Spanish punctuation-based phrase segmentation',corrections:fixes[id]??[],sourceAudioHash:a.audio_sha256};
 fs.writeFileSync(full,JSON.stringify(a,null,2)+'\n');reports.push({id,differences:a.differences,corrections:fixes[id]??[],captionCount:captions.length});
}
fs.writeFileSync(path.join(root,'qa/caption-review.json'),JSON.stringify(reports,null,2));console.log('Revised natural phrase boundaries:',reports.length,'chapters.');
