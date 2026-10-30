export const srtFromCaptions=caps=>{
 const stamp=ms=>new Date(Math.round(ms)).toISOString().slice(11,23).replace('.',',');
 const groups=[];let group=[];
 for(const c of caps){group.push(c);if(c.pageBreakAfter||group.length===5){groups.push(group);group=[]}}
 if(group.length)groups.push(group);
 return groups.map((g,i)=>`${i+1}\n${stamp(g[0].startMs)} --> ${stamp(g.at(-1).endMs)}\n${g.map(c=>c.text).join('').trim()}`).join('\n\n')+'\n';
};
