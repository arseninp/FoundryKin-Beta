/* Shared comparison button; playback and rendering remain owned by fk-core. */
export function createComparisonControls(stage,play,comparison,onToggle,ru){
  const button=stage.ownerDocument.createElement('button');
  button.type='button';button.id='fCompare';button.hidden=true;
  button.style.cssText=play.style.cssText;
  button.style.left='auto';button.style.right='8px';button.style.width='auto';
  button.style.minWidth='var(--fk-header-height)';button.style.fontSize='12px';
  play.style.left='8px';play.style.right='auto';
  button.addEventListener('pointerdown',event=>event.stopPropagation());
  button.addEventListener('click',event=>{event.stopPropagation();if(!button.disabled)onToggle();});
  stage.appendChild(button);
  return {sync(visible,busy){
    const before=comparison.isBefore();
    button.hidden=!visible;button.disabled=busy||!visible;
    button.textContent=ru?(before?'До':'После'):(before?'Before':'After');
    button.title=ru?(before?'Показать после':'Показать до'):(before?'Show after':'Show before');
    button.setAttribute('aria-label',button.title);button.setAttribute('aria-pressed',String(before));
  }};
}
