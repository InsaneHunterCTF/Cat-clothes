// Utilities
function svgToDataUrl(svg){ return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }

// Canvas & state
const canvas = document.getElementById('catCanvas');
const ctx = canvas.getContext('2d');
let catImage = new Image();
let catScale = 1;

// Assets hoodie/tshirt/jacket/scarf/glasses/party hat
const sampleAssets = {
  'Hoodie (Blue)': svgToDataUrl(`
    <svg xmlns='http://www.w3.org/2000/svg' width='700' height='700' viewBox='0 0 700 700'>
      <g>
        <!-- hood -->
        <path d='M160 220 q120 -160 380 0 q10 50 -50 80 q-90 40 -280 0 q-40 -20 -50 -80z' fill='#2aa6e0'/>
        <!-- shoulders / torso -->
        <path d='M120 320 q80 -180 260 -180 q180 0 260 180 v180 q0 40 -40 40 h-520 q-40 0 -40 -40z' fill='#38bdf8' stroke='#0ea5e9' stroke-width='4'/>
        <!-- pocket -->
        <rect x='260' y='420' width='180' height='80' rx='28' fill='#0ea5e9' opacity='0.98'/>
        <!-- subtle shadow -->
        <path d='M130 340 q160 60 340 0' fill='rgba(0,0,0,0.06)'/>
      </g>
    </svg>`),

  'Hoodie (Pink)': svgToDataUrl(`
    <svg xmlns='http://www.w3.org/2000/svg' width='700' height='700' viewBox='0 0 700 700'>
      <g>
        <path d='M120 320 q80 -180 260 -180 q180 0 260 180 v180 q0 40 -40 40 h-520 q-40 0 -40 -40z' fill='#f9a8d4' stroke='#f472b6' stroke-width='4'/>
        <rect x='260' y='420' width='180' height='80' rx='28' fill='#f472b6' opacity='0.98'/>
      </g>
    </svg>`),

  'T-Shirt (Blue)': svgToDataUrl(`
    <svg xmlns='http://www.w3.org/2000/svg' width='680' height='520' viewBox='0 0 680 520'>
      <g>
        <path d='M70 180 L140 120 L220 160 L320 120 L400 160 L480 120 L560 180 L560 360 L70 360 Z' fill='#60a5fa' stroke='#2563eb' stroke-width='4'/>
        <rect x='210' y='240' width='260' height='90' rx='12' fill='#3b82f6' opacity='0.08'/>
        <path d='M140 240 q120 40 400 0' fill='rgba(0,0,0,0.03)'/>
      </g>
    </svg>`),

  'Jacket (Dark)': svgToDataUrl(`
    <svg xmlns='http://www.w3.org/2000/svg' width='740' height='560' viewBox='0 0 740 560'>
      <g>
        <path d='M120 160 q100 -120 260 -120 q160 0 260 120 v240 q0 30 -30 30 h-420 q-30 0 -30 -30z' fill='#374151' stroke='#1f2937' stroke-width='4'/>
        <path d='M370 160 v300' stroke='#111827' stroke-width='6' opacity='0.6'/>
        <rect x='220' y='280' width='300' height='120' rx='16' fill='#111827' opacity='0.06'/>
        <path d='M220 300 q60 50 280 0' fill='rgba(0,0,0,0.04)'/>
      </g>
    </svg>`),

  'Scarf (Red)': svgToDataUrl(`
    <svg xmlns='http://www.w3.org/2000/svg' width='600' height='220' viewBox='0 0 600 220'>
      <g>
        <ellipse cx='300' cy='110' rx='260' ry='42' fill='#ef4444'/>
        <path d='M340 110 q80 40 120 120 q-40 10 -80 -30 q-40 -36 -40 -90' fill='#b91c1c'/>
      </g>
    </svg>`),

  'Glasses': svgToDataUrl(`
    <svg xmlns='http://www.w3.org/2000/svg' width='350' height='140' viewBox='0 0 350 140'>
      <g>
        <rect x='20' y='20' width='100' height='80' rx='18' fill='#fff' stroke='#111' stroke-width='4'/>
        <rect x='230' y='20' width='100' height='80' rx='18' fill='#fff' stroke='#111' stroke-width='4'/>
        <line x1='120' y1='60' x2='230' y2='60' stroke='#111' stroke-width='4'/>
      </g>
    </svg>`),

  'Party Hat': svgToDataUrl(`
    <svg xmlns='http://www.w3.org/2000/svg' width='300' height='220' viewBox='0 0 300 220'>
      <path d='M150 0 L280 180 L20 180 Z' fill='#f59e0b'/>
    </svg>`)
};

// State for added clothes
const clothes = [];
let selected = null;
let idCounter = 1;

// DOM refs
const assetsEl = document.getElementById('assets');
const itemListEl = document.getElementById('itemList');
const selNameEl = document.getElementById('selName');
const scaleRange = document.getElementById('scaleRange');
const rotRange = document.getElementById('rotRange');
const bringBtn = document.getElementById('bringBtn');
const flipBtn = document.getElementById('flipBtn');

// Create asset thumbnails in sidebar
for(const key of Object.keys(sampleAssets)){
  const div = document.createElement('div'); div.className='asset'; div.title = key;
  const img = new Image(); img.src = sampleAssets[key]; img.alt = key;
  div.appendChild(img);
  div.onclick = () => addCloth(key, sampleAssets[key]);
  assetsEl.appendChild(div);
}

// Cat Body Simulation
const defaultCatSvg = svgToDataUrl(`
  <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200' viewBox='0 0 1200 1200'>
    <rect width='100%' height='100%' fill='transparent'/>
    <g transform='translate(150,50)'>
      <path d='M820 560 q180 40 140 180 q-40 140 -220 110' fill='#f6f6f6' stroke='#e0e0e0' stroke-width='4'/>
      <ellipse cx='450' cy='600' rx='260' ry='300' fill='#f5f5f4' stroke='#dedede' stroke-width='4'/>
      <path d='M320 540 q120 180 260 0 q40 -60 -40 -90 q-120 -40 -200 90' fill='#ffffff' opacity='0.6'/>
      <ellipse cx='450' cy='280' rx='170' ry='160' fill='#fafafa' stroke='#e8e8e8' stroke-width='4'/>
      <path d='M340 170 L300 80 L370 130 Z' fill='#fafafa' stroke='#e8e8e8' stroke-width='3'/>
      <path d='M560 170 L620 80 L550 130 Z' fill='#fafafa' stroke='#e8e8e8' stroke-width='3'/>
      <ellipse cx='410' cy='270' rx='18' ry='24' fill='#0b1220'/>
      <ellipse cx='490' cy='270' rx='18' ry='24' fill='#0b1220'/>
      <path d='M450 305 l-8 8 h16 z' fill='#fda4af'/>
      <path d='M450 320 q-22 18 -44 10' stroke='#111' stroke-width='3' fill='none'/>
      <path d='M450 320 q22 18 44 10' stroke='#111' stroke-width='3' fill='none'/>
      <ellipse cx='320' cy='840' rx='56' ry='40' fill='#eee'/>
      <ellipse cx='580' cy='840' rx='56' ry='40' fill='#eee'/>
    </g>
  </svg>`);
catImage = new Image(); catImage.crossOrigin='anonymous'; catImage.src = defaultCatSvg;

// fit canvas to cat image after load
catImage.onload = ()=>{
  fitCanvasToImage();
  redraw();
};

function fitCanvasToImage(){
  const maxW = 900;
  const ratio = Math.min(maxW / catImage.width, 1);
  canvas.width = Math.round(catImage.width * ratio);
  canvas.height = Math.round(catImage.height * ratio);
}

// Add clothing item
function addCloth(name, dataUrl){
  const img = new Image(); img.crossOrigin='anonymous'; img.src = dataUrl;
  const id = idCounter++;
  img.onload = ()=>{
    const item = {
      id, name, img,
      x: canvas.width/2,
      y: Math.round(canvas.height*0.32),
      scale: Math.min(1.2, (canvas.width*0.5)/img.width),
      rotation: 0,
      flip: false
    };
    clothes.push(item);
    selectItem(item.id);
    renderItemList();
    redraw();
  };
}

// Render clothes onto canvas
function redraw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(catImage.complete) ctx.drawImage(catImage, 0, 0, canvas.width, canvas.height);
  clothes.forEach(it=>{
    if(!it.img.complete) return;
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.rotate(it.rotation);
    ctx.scale(it.flip ? -it.scale : it.scale, it.scale);
    ctx.drawImage(it.img, -it.img.width/2, -it.img.height/2);
    ctx.restore();
    if(selected && selected.id===it.id) drawSelection(it);
  });
}

function drawSelection(it){
  ctx.save();
  ctx.translate(it.x, it.y);
  ctx.rotate(it.rotation);
  ctx.scale(it.scale, it.scale);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(245,158,11,0.95)';
  ctx.setLineDash([6,6]);
  ctx.strokeRect(-it.img.width/2 -6, -it.img.height/2 -6, it.img.width+12, it.img.height+12);
  ctx.restore();
}

// Hit test for selecting
function hitTest(px,py){
  for(let i=clothes.length-1;i>=0;i--){
    const it = clothes[i];
    if(!it.img.complete) continue;
    // transform point to item-local coords
    const dx = px - it.x, dy = py - it.y;
    const cos = Math.cos(-it.rotation), sin = Math.sin(-it.rotation);
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;
    const w = it.img.width * it.scale, h = it.img.height * it.scale;
    if(rx >= -w/2 && rx <= w/2 && ry >= -h/2 && ry <= h/2) return it;
  }
  return null;
}

// Canvas interactions
let isDown=false, dragOffset={x:0,y:0};
function getPoint(e){
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const x = (clientX - rect.left) * (canvas.width / rect.width);
  const y = (clientY - rect.top) * (canvas.height / rect.height);
  return {x,y};
}

canvas.addEventListener('mousedown', e=>{
  const p = getPoint(e);
  const hit = hitTest(p.x,p.y);
  if(hit){ selectItem(hit.id); isDown=true; dragOffset.x = p.x - hit.x; dragOffset.y = p.y - hit.y; bringToFront(hit); redraw(); }
  else { selectItem(null); redraw(); }
});

window.addEventListener('mousemove', e=>{
  if(!isDown || !selected) return;
  const p = getPoint(e);
  selected.x = p.x - dragOffset.x; selected.y = p.y - dragOffset.y;
  updateControlsFromSelected(); redraw();
});
window.addEventListener('mouseup', ()=>{ isDown=false; });

// touch
canvas.addEventListener('touchstart', e=>{ const p = getPoint(e); const hit = hitTest(p.x,p.y); if(hit){ selectItem(hit.id); isDown=true; dragOffset.x = p.x - hit.x; dragOffset.y = p.y - hit.y; bringToFront(hit); redraw(); } e.preventDefault(); }, {passive:false});
canvas.addEventListener('touchmove', e=>{ if(!isDown || !selected) return; const p=getPoint(e); selected.x = p.x - dragOffset.x; selected.y = p.y - dragOffset.y; updateControlsFromSelected(); redraw(); e.preventDefault(); }, {passive:false});
canvas.addEventListener('touchend', e=>{ isDown=false; }, {passive:false});

// wheel to scale selected
canvas.addEventListener('wheel', e=>{ if(!selected) return; e.preventDefault(); const delta = e.deltaY>0 ? -0.05 : 0.05; selected.scale = Math.max(0.05, selected.scale + delta); updateControlsFromSelected(); redraw(); }, {passive:false});

// Controls: selection UI
function selectItem(id){
  if(id==null){ selected = null; selNameEl.textContent='—'; renderItemList(); return; }
  selected = clothes.find(c=>c.id===id) || null;
  selNameEl.textContent = selected ? selected.name : '—';
  updateControlsFromSelected(); renderItemList();
}

function updateControlsFromSelected(){ if(!selected) return; scaleRange.value = selected.scale; rotRange.value = Math.round(selected.rotation * 180 / Math.PI); }

scaleRange.addEventListener('input', ()=>{ if(!selected) return; selected.scale = parseFloat(scaleRange.value); redraw(); renderItemList(); });
rotRange.addEventListener('input', ()=>{ if(!selected) return; selected.rotation = parseFloat(rotRange.value) * Math.PI / 180; redraw(); renderItemList(); });

bringBtn.addEventListener('click', ()=>{ if(!selected) return; bringToFront(selected); redraw(); renderItemList(); });
flipBtn.addEventListener('click', ()=>{ if(!selected) return; selected.flip = !selected.flip; redraw(); renderItemList(); });

function bringToFront(item){ const idx = clothes.findIndex(c=>c.id===item.id); if(idx>=0){ clothes.splice(idx,1); clothes.push(item); } }

// Render item list with remove buttons
function renderItemList(){ itemListEl.innerHTML=''; clothes.forEach(it=>{
  const row = document.createElement('div'); row.className='item-row';
  const meta = document.createElement('div'); meta.className='meta';
  const thumb = document.createElement('div'); thumb.className='thumb'; const timg = new Image(); timg.src = it.img.src; thumb.appendChild(timg);
  const name = document.createElement('div'); name.textContent = it.name;
  meta.appendChild(thumb); meta.appendChild(name);
  const actions = document.createElement('div'); actions.className='item-actions';
  const selBtn = document.createElement('button'); selBtn.textContent='Select'; selBtn.className='btn small'; selBtn.onclick = ()=>{ selectItem(it.id); };
  const remBtn = document.createElement('button'); remBtn.textContent='Remove'; remBtn.className='btn small alt'; remBtn.onclick = ()=>{ removeItem(it.id); };
  actions.appendChild(selBtn); actions.appendChild(remBtn);
  row.appendChild(meta); row.appendChild(actions);
  itemListEl.appendChild(row);
});
}

function removeItem(id){ const idx = clothes.findIndex(c=>c.id===id); if(idx>=0){ clothes.splice(idx,1); if(selected && selected.id===id) selected=null; renderItemList(); redraw(); } }

// File uploads
document.getElementById('uploadCat').addEventListener('change', e=>{
  const f = e.target.files[0]; if(!f) return; const url = URL.createObjectURL(f); const img = new Image(); img.onload = ()=>{ catImage = img; fitCanvasToImage(); // reposition clothes to center-ish
    clothes.forEach(c=>{ c.x = canvas.width/2; c.y = Math.round(canvas.height*0.32); }); redraw(); URL.revokeObjectURL(url); };
  img.src = url;
});

document.getElementById('uploadAsset').addEventListener('change', e=>{
  const f = e.target.files[0]; if(!f) return; const reader = new FileReader(); reader.onload = ()=>{ addCloth(f.name, reader.result); }; reader.readAsDataURL(f);
});

// Buttons
document.getElementById('resetBtn').addEventListener('click', ()=>{ clothes.length=0; selected=null; catImage = new Image(); catImage.src = defaultCatSvg; catImage.onload = ()=>{ fitCanvasToImage(); redraw(); }; renderItemList(); });

document.getElementById('downloadBtn').addEventListener('click', ()=>{
  const link = document.createElement('a'); link.download = 'dressed-cat.png'; link.href = canvas.toDataURL('image/png'); link.click();
});

// helper: select newly added item
function selectItemByRef(it){ selected = it; renderItemList(); updateControlsFromSelected(); }

// initial draw loop
(function loop(){ redraw(); requestAnimationFrame(loop); })();
