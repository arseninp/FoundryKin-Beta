/* Per-card comparison snapshots. The caller owns loading, frame indices and playback. */
export function createComparison(makeCanvas){
  let originals=new Map(),before=false;
  function copy(frame){
    const canvas=makeCanvas();
    canvas.width=frame.width;canvas.height=frame.height;
    canvas.getContext('2d').drawImage(frame,0,0);
    return canvas;
  }
  function reset(){originals=new Map();before=false;}
  function remember(resources){
    const pending=[];
    for(const [path,frames] of Object.entries(resources)){
      if(originals.has(path))continue;
      if(!Array.isArray(frames)||!frames.length)throw new Error('Missing comparison frames: '+path);
      pending.push([path,frames.map(copy)]);
    }
    for(const [path,frames] of pending)originals.set(path,frames);
  }
  function canvases(current,indices){
    if(!before)return current;
    return Object.fromEntries(Object.keys(current).map(path=>{
      const frames=originals.get(path),index=indices[path]??0;
      if(!frames||!frames[index])throw new Error('Missing comparison frame: '+path+' #'+index);
      return [path,frames[index]];
    }));
  }
  return {
    reset,remember,canvases,
    toggle(){before=!before;return before;},
    isBefore(){return before;}
  };
}
