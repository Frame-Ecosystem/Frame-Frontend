const fs=require('fs');
const p='app/profile/lounge/page.tsx';
const s=fs.readFileSync(p,'utf8');
const lines=s.split('\n');
let stack=[];
for(let i=0;i<lines.length;i++){
  const line=lines[i];
  // count occurrences of opening <div (not including </div>)
  const opens = (line.match(/<div(\s|>|$)/g)||[]).length;
  const closes = (line.match(/<\/div>/g)||[]).length;
  for(let j=0;j<opens;j++) stack.push({line:i+1});
  for(let j=0;j<closes;j++){
    if(stack.length===0){
      console.log('Extra closing </div> at line',i+1);
    } else stack.pop();
  }
}
if(stack.length>0){
  console.log('Unclosed <div> left:',stack.length,'last at line',stack[stack.length-1].line);
} else console.log('All divs balanced');
