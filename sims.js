/* Figuras interactivas de Regulación Automática. Vanilla JS + canvas. */
(function(){
const C = {};
function paleta(el){const cs=getComputedStyle(el);const v=n=>cs.getPropertyValue(n).trim();
  C.bg=v('--surface')||'#fff';C.grid=v('--line')||'#d5dcd9';C.text=v('--fg')||'#16211d';C.muted=v('--muted')||'#56635e';
  C.a=v('--tc')||v('--accent')||'#b4232f';C.b=v('--warn')||'#b8730c';C.c=v('--c6')||'#2c8a52';C.d=v('--c5')||'#c43d63';C.e=v('--c4')||'#b8730c';C.f=v('--c2')||'#3a63c4';}
const F=n=>Number.isInteger(n)?String(n):(Math.abs(n)<1e-9?'0':n.toFixed(2).replace('.',','));

function build(el, spec){
  el.classList.add('sim-box');paleta(el);
  const ctrls=document.createElement('div'); ctrls.className='ctrl sim-ctrls';
  const cv=document.createElement('canvas'); cv.width=spec.w||640; cv.height=spec.h||360; cv.className='sim-cv';
  const out=document.createElement('div'); out.className='readout sim-out';
  el.append(ctrls,cv,out);
  const st={};
  (spec.sliders||[]).forEach(s=>{st[s.k]=s.v;const lab=document.createElement('label');const sp=document.createElement('span');sp.textContent=`${s.l}: ${F(s.v)} ${s.u||''}`;
    const inp=document.createElement('input');inp.type='range';inp.min=s.min;inp.max=s.max;inp.step=s.step||0.01;inp.value=s.v;
    inp.oninput=()=>{st[s.k]=parseFloat(inp.value);sp.textContent=`${s.l}: ${F(st[s.k])} ${s.u||''}`;draw();};lab.append(sp,inp);ctrls.append(lab);});
  (spec.selects||[]).forEach(s=>{st[s.k]=s.v;const lab=document.createElement('label');const sp=document.createElement('span');sp.textContent=s.l;
    const sel=document.createElement('select');s.opts.forEach(o=>{const op=document.createElement('option');op.value=o[0];op.textContent=o[1];if(o[0]===s.v)op.selected=true;sel.append(op);});
    sel.onchange=()=>{st[s.k]=sel.value;draw();};lab.append(sp,sel);ctrls.append(lab);});
  const g=cv.getContext('2d');
  const api={st,cv,g,out,W:cv.width,H:cv.height,
    clear(){paleta(el);g.fillStyle=C.bg;g.fillRect(0,0,cv.width,cv.height);},
    txt(s,x,y,col,sz,al){g.fillStyle=col||C.text;g.font=(sz||13)+'px system-ui';g.textAlign=al||'left';g.fillText(s,x,y);},
    arrow(x1,y1,x2,y2,col,wd){g.strokeStyle=g.fillStyle=col;g.lineWidth=wd||2.5;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();const a=Math.atan2(y2-y1,x2-x1),L=10;g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-L*Math.cos(a-0.4),y2-L*Math.sin(a-0.4));g.lineTo(x2-L*Math.cos(a+0.4),y2-L*Math.sin(a+0.4));g.closePath();g.fill();},
    line(x1,y1,x2,y2,col,wd,dash){g.strokeStyle=col;g.lineWidth=wd||1.5;g.setLineDash(dash||[]);g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.setLineDash([]);},
    circ(x,y,r,col,fill){g.beginPath();g.arc(x,y,r,0,Math.PI*2);if(fill){g.fillStyle=col;g.fill();}else{g.strokeStyle=col;g.lineWidth=2;g.stroke();}},
    html(h){out.innerHTML=h;},
    // sistema de ejes cartesiano
    axes(cx,cy,u,xmin,xmax,ymin,ymax){for(let i=Math.ceil(xmin);i<=xmax;i++)api.line(cx+i*u,cy-ymax*u,cx+i*u,cy-ymin*u,C.grid,1);for(let j=Math.ceil(ymin);j<=ymax;j++)api.line(cx+xmin*u,cy-j*u,cx+xmax*u,cy-j*u,C.grid,1);api.line(cx+xmin*u,cy,cx+xmax*u,cy,C.muted,1.5);api.line(cx,cy-ymax*u,cx,cy-ymin*u,C.muted,1.5);}
  };
  function draw(){spec.draw(api);}
  draw(); return api;
}
const SIMS={};

/* ---- Regulación Automática: figuras interactivas ---- */
const NQ=x=>{const r=Math.round(x*1000)/1000;return (Math.abs(r-Math.round(r))<1e-9?String(Math.round(r)):r.toFixed(3).replace(/0+$/,'')).replace('.',',');};
const N0=x=>(Math.abs(x)<0.5?0:x).toFixed(0);
const N1=x=>(Math.abs(x)<5e-2?0:x).toFixed(1).replace('.',',');
const N2=x=>(Math.abs(x)<5e-3?0:x).toFixed(2).replace('.',',');
const N3=x=>(Math.abs(x)<5e-4?0:x).toFixed(3).replace('.',',');
const sup=n=>String(n).split('').map(c=>({'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'}[c]||c)).join('');
const NE=x=>{if(x===0)return '0';const e=Math.floor(Math.log10(Math.abs(x)));const m=x/Math.pow(10,e);return N2(m)+'·10'+sup(e);};
const ticks=(max,n)=>{const raw=max/n,p=Math.pow(10,Math.floor(Math.log10(raw))),c=[1,2,2.5,5,10].find(k=>k*p>=raw)*p;const o=[];for(let v=c;v<=max*1.0001;v+=c)o.push(v);return o;};
const Rbox=(a,x,y,w,h,col,fill)=>{if(fill){a.g.fillStyle=col;a.g.globalAlpha=0.14;a.g.fillRect(x,y,w,h);a.g.globalAlpha=1;}
  a.g.strokeStyle=col;a.g.lineWidth=2;a.g.strokeRect(x,y,w,h);};
const curve=(a,pts,col,wd,dash)=>{a.g.strokeStyle=col;a.g.lineWidth=wd||2;a.g.setLineDash(dash||[]);a.g.beginPath();
  pts.forEach((p,i)=>i?a.g.lineTo(p[0],p[1]):a.g.moveTo(p[0],p[1]));a.g.stroke();a.g.setLineDash([]);};
/* simulacion de una FT por Runge-Kutta sobre su forma canonica controlable */
function simula(num,den,u,T,N){ // num,den: arrays coef. desc.; u(t) entrada
  const n=den.length-1, a=den.map(v=>v/den[0]), b=new Array(n+1).fill(0);
  const nn=num.length; for(let i=0;i<nn;i++) b[n-nn+1+i]=num[i]/den[0];
  let x=new Array(n).fill(0); const dt=T/N, out=[];
  const f=(x,uu)=>{const d=new Array(n).fill(0);
    for(let i=0;i<n-1;i++)d[i]=x[i+1];
    let acc=uu; for(let i=0;i<n;i++)acc-=a[n-i]*x[i];
    d[n-1]=acc; return d;};
  for(let k=0;k<=N;k++){const t=k*dt, uu=u(t);
    let y=b[0]* (function(){let acc=uu;for(let i=0;i<n;i++)acc-=a[n-i]*x[i];return acc;})();
    for(let i=0;i<n;i++)y+=b[n-i]*x[i];
    out.push([t,y]);
    const k1=f(x,uu), x2=x.map((v,i)=>v+dt/2*k1[i]);
    const k2=f(x2,u(t+dt/2)), x3=x.map((v,i)=>v+dt/2*k2[i]);
    const k3=f(x3,u(t+dt/2)), x4=x.map((v,i)=>v+dt*k3[i]);
    const k4=f(x4,u(t+dt));
    x=x.map((v,i)=>v+dt/6*(k1[i]+2*k2[i]+2*k3[i]+k4[i]));}
  return out;}
const polyMul=(A,B)=>{const C=new Array(A.length+B.length-1).fill(0);
  A.forEach((a,i)=>B.forEach((b,j)=>C[i+j]+=a*b));return C;};
const polyAdd=(A,B)=>{const n=Math.max(A.length,B.length),C=new Array(n).fill(0);
  A.forEach((a,i)=>C[n-A.length+i]+=a);B.forEach((b,i)=>C[n-B.length+i]+=b);return C;};
/* raices de un polinomio por Durand-Kerner */
function raices(p){const n=p.length-1;if(n<1)return [];
  const a=p.map(v=>v/p[0]);let z=[];
  for(let i=0;i<n;i++){const ang=2*Math.PI*i/n+0.4;z.push({re:0.9*Math.cos(ang),im:0.9*Math.sin(ang)});}
  const ev=zz=>{let r={re:1,im:0};for(let i=1;i<=n;i++){r={re:r.re*zz.re-r.im*zz.im+a[i]*0,im:r.re*zz.im+r.im*zz.re};}return r;};
  const evalp=zz=>{let r={re:0,im:0};for(let i=0;i<=n;i++){const t={re:r.re*zz.re-r.im*zz.im+a[i],im:r.re*zz.im+r.im*zz.re};r=t;}return r;};
  for(let it=0;it<500;it++){let maxd=0;
    for(let i=0;i<n;i++){let num=evalp(z[i]),den={re:1,im:0};
      for(let j=0;j<n;j++){if(i===j)continue;const d={re:z[i].re-z[j].re,im:z[i].im-z[j].im};
        den={re:den.re*d.re-den.im*d.im,im:den.re*d.im+den.im*d.re};}
      const dd=den.re*den.re+den.im*den.im; if(dd<1e-300)continue;
      const q={re:(num.re*den.re+num.im*den.im)/dd,im:(num.im*den.re-num.re*den.im)/dd};
      z[i]={re:z[i].re-q.re,im:z[i].im-q.im};
      maxd=Math.max(maxd,Math.abs(q.re)+Math.abs(q.im));}
    if(maxd<1e-12)break;}
  return z;}

/* T1 · Lazo abierto frente a lazo cerrado */
SIMS.lazo=el=>build(el,{w:680,h:258,
 sliders:[{k:'Kp',v:20,min:0.1,max:60,step:0.1,l:'Ganancia del regulador Kp',u:''},
  {k:'err',v:20,min:-50,max:50,step:5,l:'Error en la ganancia de la planta',u:'%'},
  {k:'pert',v:0.3,min:0,max:1,step:0.05,l:'Perturbación (escalón en t = 6 s)',u:''}],
 draw(a){a.clear();const s=a.st;
  const K0=2,Tp=10;
  const Kr=K0*(1+s.err/100);
  const T=12,N=600;
  // lazo abierto: u = ref/K0 (calibrado con el modelo nominal)
  const uLA=1/K0;
  const ptsLA=[],ptsLC=[];
  // respuestas analiticas: 1er orden
  for(let i=0;i<=N;i++){const t=T*i/N;
    const d=(t>=6?s.pert:0);
    const yLA=Kr*uLA*(1-Math.exp(-t/Tp))+d;
    // lazo cerrado: T=KpKr/(1+KpKr) con tau=Tp/(1+KpKr); perturbacion atenuada
    const L=s.Kp*Kr;
    const yLC=(L/(1+L))*(1-Math.exp(-t/(Tp/(1+L))))+(t>=6?s.pert/(1+L)*(1-Math.exp(-(t-6)/(Tp/(1+L)))):0);
    ptsLA.push([t,yLA]);ptsLC.push([t,yLC]);}
  const ox=50,oy=182,W=330,H=142;
  const ymax=Math.max(1.4,...ptsLA.map(p=>p[1]),...ptsLC.map(p=>p[1]))*1.05;
  const X=t=>ox+t/T*W, Y=y=>oy-y/ymax*H;
  a.line(ox,oy,ox+W+10,oy,C.muted,1.5);a.line(ox,oy-H-8,ox,oy+6,C.muted,1.5);
  ticks(ymax,4).forEach(v=>{a.line(ox,Y(v),ox+W,Y(v),C.grid,1);a.txt(N1(v),ox-6,Y(v)+4,C.muted,10,'right');});
  a.line(ox,Y(1),ox+W,Y(1),C.c,1.5,[5,4]);
  a.txt('referencia = 1',ox+6,Y(1)-8,C.c,10);
  curve(a,ptsLA.map(p=>[X(p[0]),Y(p[1])]),C.b,2.5);
  curve(a,ptsLC.map(p=>[X(p[0]),Y(p[1])]),C.f,2.5);
  if(s.pert>0){a.line(X(6),oy-H,X(6),oy,C.muted,1,[3,3]);a.txt('perturbación',X(6)+4,oy-H+12,C.muted,10);}
  a.txt('t (s)',ox+W/2,oy+34,C.muted,10,'center');
  for(let i=0;i<=4;i++)a.txt(N0(T*i/4),X(T*i/4),oy+18,C.muted,10,'center');
  a.line(ox+6,24,ox+30,24,C.b,2.5);a.txt('lazo abierto',ox+36,28,C.b,11);
  a.line(ox+150,24,ox+174,24,C.f,2.5);a.txt('lazo cerrado',ox+180,28,C.f,11);
  // panel
  const L=s.Kp*Kr, bx=412,by=34;
  a.txt('Planta: G = 2/(10s+1)',bx,by,C.muted,12);
  a.txt('ganancia real = '+N2(Kr)+' ('+(s.err>=0?'+':'')+NQ(s.err)+' %)',bx,by+22,C.b,12);
  a.txt('ganancia de lazo KpG = '+N1(L),bx,by+48,C.f,13);
  const yLAf=Kr*uLA+s.pert, yLCf=L/(1+L)+s.pert/(1+L);
  a.txt('valor final lazo abierto = '+N3(yLAf),bx,by+76,C.b,12.5);
  a.txt('valor final lazo cerrado = '+N3(yLCf),bx,by+98,C.f,12.5);
  a.txt('error en lazo cerrado = '+N1(100*Math.abs(1-yLCf))+' %',bx,by+124,C.a,13);
  a.txt('τ: 10 s → '+N2(Tp/(1+L))+' s',bx,by+150,C.c,12.5);
  a.txt('sensibilidad S = 1/(1+L) = '+N3(1/(1+L)),bx,by+176,C.muted,12);
  a.html(`Con una ganancia de regulador Kp = ${NQ(s.Kp)} la ganancia de lazo vale <b>${N1(L)}</b>.<br>
  El lazo abierto termina en <b>${N3(yLAf)}</b> (error del ${N1(100*Math.abs(1-yLAf))} %) y el cerrado en <b>${N3(yLCf)}</b> (error del <b>${N1(100*Math.abs(1-yLCf))} %</b>). La constante de tiempo pasa de 10 s a <b>${N2(Tp/(1+L))} s</b>.<br>
  La perturbación de ${NQ(s.pert)} se ve entera en lazo abierto y dividida por 1+L (es decir, ${N3(s.pert/(1+L))}) en lazo cerrado.
  <span class="hint">Mueve el error de la planta: en lazo abierto se traslada íntegro a la salida, mientras que en lazo cerrado queda dividido por 1+L. Ése es el significado de la sensibilidad.</span>`);}});

/* T2 · Polos y respuesta: antitransformada */
SIMS.laplace=el=>build(el,{w:680,h:262,
 sliders:[{k:'p1',v:-2,min:-6,max:1,step:0.1,l:'Polo 1 (real)',u:''},
  {k:'p2',v:-3,min:-6,max:1,step:0.1,l:'Polo 2 (parte real)',u:''},
  {k:'w',v:0,min:0,max:5,step:0.1,l:'Parte imaginaria del polo 2',u:''}],
 selects:[{k:'ent',v:'esc',l:'Entrada',opts:[['imp','Impulso'],['esc','Escalón'],['ramp','Rampa']]}],
 draw(a){a.clear();const s=a.st;
  const cplx=s.w>0.001;
  // G = K/((s-p1)(s^2-2p2 s+p2^2+w^2)) normalizado a ganancia 1
  let den = cplx? polyMul([1,-s.p1],[1,-2*s.p2,s.p2*s.p2+s.w*s.w]) : polyMul([1,-s.p1],[1,-s.p2]);
  const K = den[den.length-1];
  const num=[K];
  const T=8,N=500;
  const u = s.ent==='imp'? (t=>t<0.02?50:0) : (s.ent==='esc'? (t=>1) : (t=>t));
  const out=simula(num,den,u,T,N);
  const ox=50,oy=186,W=300,H=146;
  let ymax=0,ymin=0; out.forEach(p=>{ymax=Math.max(ymax,p[1]);ymin=Math.min(ymin,p[1]);});
  ymax=Math.max(ymax*1.1,0.3); ymin=Math.min(ymin*1.1,-0.05);
  const X=t=>ox+t/T*W, Y=y=>oy-(y-ymin)/(ymax-ymin)*H;
  a.line(ox,Y(0),ox+W+10,Y(0),C.muted,1.5);a.line(ox,oy-H-6,ox,oy+6,C.muted,1.5);
  curve(a,out.map(p=>[X(p[0]),Y(Math.max(Math.min(p[1],ymax),ymin))]),C.a,2.5);
  a.txt('y(t)',ox+4,oy-H-10,C.muted,11);a.txt('t (s)',ox+W/2,oy+30,C.muted,10,'center');
  for(let i=0;i<=4;i++)a.txt(N0(T*i/4),X(T*i/4),oy+16,C.muted,10,'center');
  // plano s
  const px=470,py=100,esc=20;
  a.line(px-110,py,px+50,py,C.muted,1.2);a.line(px,py-80,px,py+80,C.muted,1.2);
  a.txt('Re',px+54,py+4,C.muted,10);a.txt('Im',px+4,py-84,C.muted,10);
  for(let v=-5;v<=1;v++){if(v===0)continue;a.line(px+v*esc,py-3,px+v*esc,py+3,C.grid,1);}
  const mark=(re,im,col)=>{const x=px+re*esc,y=py-im*esc;
    a.line(x-5,y-5,x+5,y+5,col,2.5);a.line(x-5,y+5,x+5,y-5,col,2.5);};
  mark(s.p1,0,C.f);
  if(cplx){mark(s.p2,s.w,C.b);mark(s.p2,-s.w,C.b);} else mark(s.p2,0,C.b);
  a.g.fillStyle=C.b;a.g.globalAlpha=.08;a.g.fillRect(px,py-80,50,160);a.g.globalAlpha=1;
  a.txt('inestable',px+25,py-70,C.b,9,'center');
  const est=s.p1<0&&s.p2<0;
  a.txt(est?'✓ estable':'✗ inestable',px-106,py+96,est?C.c:C.b,12);
  // panel
  const bx=380,by=218;
  const polos = cplx? `${N2(s.p1)}  y  ${N2(s.p2)} ± j${N2(s.w)}` : `${N2(s.p1)}  y  ${N2(s.p2)}`;
  a.txt('Polos: '+polos,bx,by,C.text,12);
  const term = cplx? `A e^(${N2(s.p1)}t) + B e^(${N2(s.p2)}t)·sen(${N2(s.w)}t+φ)` : `A e^(${N2(s.p1)}t) + B e^(${N2(s.p2)}t)`;
  a.txt('Respuesta: '+(s.ent==='esc'?'cte + ':'')+term,bx,by+22,C.a,11.5);
  a.html(`Polos en <b>${polos}</b> ⇒ el sistema es <b>${est?'estable':'inestable'}</b>.<br>
  Cada polo aporta un término: un polo real da una <b>exponencial</b> y un par complejo da una <b>oscilación amortiguada</b> de frecuencia igual a su parte imaginaria.<br>
  ${est?'El polo más cercano al eje imaginario ('+N2(Math.max(s.p1,s.p2))+') es el <b>dominante</b>: su exponencial es la más lenta y marca el tiempo de establecimiento.':'Con algún polo en el semiplano derecho la respuesta <b>crece sin límite</b>: el teorema del valor final no se puede aplicar.'}
  <span class="hint">Mueve la parte imaginaria y observa cómo aparece la oscilación; acerca los polos al eje y verás que todo se vuelve más lento. Toda la teoría clásica consiste en colocar los polos donde interesa.</span>`);}});

/* T3 · Linealización */
SIMS.lineal=el=>build(el,{w:680,h:252,
 sliders:[{k:'h0',v:4,min:0.3,max:9,step:0.1,l:'Punto de funcionamiento h₀',u:'m'},
  {k:'dh',v:2,min:-3,max:3,step:0.1,l:'Incremento Δh',u:'m'},
  {k:'K',v:1.5,min:0.2,max:4,step:0.1,l:'Constante K de la válvula',u:''}],
 draw(a){a.clear();const s=a.st;
  const f=h=>s.K*Math.sqrt(Math.max(h,0));
  const df=s.K/(2*Math.sqrt(s.h0));
  const ox=52,oy=186,W=320,H=146;
  const hmax=10, qmax=s.K*Math.sqrt(hmax)*1.05;
  const X=h=>ox+h/hmax*W, Y=q=>oy-q/qmax*H;
  a.line(ox,oy,ox+W+10,oy,C.muted,1.5);a.line(ox,oy-H-8,ox,oy+6,C.muted,1.5);
  ticks(qmax,4).forEach(v=>{a.line(ox,Y(v),ox+W,Y(v),C.grid,1);a.txt(N1(v),ox-6,Y(v)+4,C.muted,10,'right');});
  const pts=[];for(let i=0;i<=200;i++){const h=hmax*i/200;pts.push([X(h),Y(f(h))]);}
  curve(a,pts,C.a,2.5);
  // tangente
  const t1=Math.max(s.h0-3.5,0), t2=Math.min(s.h0+3.5,hmax);
  curve(a,[[X(t1),Y(f(s.h0)+df*(t1-s.h0))],[X(t2),Y(f(s.h0)+df*(t2-s.h0))]],C.f,2,[6,4]);
  a.circ(X(s.h0),Y(f(s.h0)),5,C.c,true);
  a.txt('punto de funcionamiento',X(s.h0)+8,Y(f(s.h0))-10,C.c,11);
  const h1=s.h0+s.dh;
  if(h1>=0&&h1<=hmax){
    a.circ(X(h1),Y(f(h1)),4.5,C.a,true);
    a.circ(X(h1),Y(f(s.h0)+df*s.dh),4.5,C.f,true);
    a.line(X(h1),Y(f(h1)),X(h1),Y(f(s.h0)+df*s.dh),C.b,1.5,[3,3]);}
  a.txt('q = K√h',ox+W-6,Y(f(hmax))-10,C.a,11,'right');
  a.txt('modelo lineal',ox+W-6,Y(f(s.h0)+df*(t2-s.h0))+16,C.f,11,'right');
  a.txt('h (m)',ox+W/2,oy+32,C.muted,10,'center');
  for(let i=0;i<=5;i++)a.txt(N0(hmax*i/5),X(hmax*i/5),oy+16,C.muted,10,'center');
  // panel
  const bx=416,by=34;
  const qreal=f(h1), qlin=f(s.h0)+df*s.dh;
  const err=qreal!==0?100*Math.abs(qlin-qreal)/qreal:0;
  a.txt('q₀ = K√h₀ = '+N3(f(s.h0)),bx,by,C.c,12.5);
  a.txt('pendiente = K/(2√h₀) = '+N3(df),bx,by+24,C.f,13);
  a.txt('Modelo: Δq = '+N3(df)+'·Δh',bx,by+50,C.f,13);
  a.txt('Con Δh = '+NQ(s.dh)+' m:',bx,by+80,C.muted,12);
  a.txt('q real = '+N3(qreal),bx,by+102,C.a,12.5);
  a.txt('q linealizado = '+N3(qlin),bx,by+124,C.f,12.5);
  a.txt('error = '+N1(err)+' %',bx,by+150,err<5?C.c:C.b,13);
  a.html(`En h₀ = ${NQ(s.h0)} m el caudal vale q₀ = <b>${N3(f(s.h0))}</b> y la pendiente de la curva es K/(2√h₀) = <b>${N3(df)}</b>.<br>
  El modelo linealizado <b>Δq = ${N3(df)}·Δh</b> predice ${N3(qlin)} frente al valor real ${N3(qreal)}: un error del <b>${N1(err)} %</b>.<br>
  ${err<5?'Con este incremento la aproximación es <b>buena</b>: es el rango en el que el modelo lineal sirve.':'Con un incremento tan grande la aproximación <b>ya no vale</b>: la linealización sólo es válida en el entorno del punto de funcionamiento.'}
  <span class="hint">Aumenta Δh y observa cómo se despega la recta de la curva. Linealizar no es una simplificación gratuita: es válida mientras el sistema se mueva cerca del punto de funcionamiento, que es justo lo que ocurre en un lazo de control bien ajustado.</span>`);}});

/* T4 · Reducción de diagramas de bloques */
SIMS.bloques=el=>build(el,{w:680,h:212,
 selects:[{k:'caso',v:'real',l:'Configuración',opts:[['serie','Serie'],['par','Paralelo'],['real','Realimentación negativa'],['pert','Realimentación con perturbación'],['anid','Dos lazos anidados']]}],
 sliders:[{k:'K',v:4,min:0.5,max:20,step:0.5,l:'Ganancia G₁',u:''},
  {k:'G2',v:2,min:0.2,max:10,step:0.2,l:'Ganancia G₂',u:''}],
 draw(a){a.clear();const s=a.st;
  const K=s.K,G2=s.G2;
  const defs={
   serie:['G(s) = G₁ · G₂', K*G2, 'Las ganancias se multiplican. Es el caso más simple y el que más se usa al simplificar.'],
   par:['G(s) = G₁ + G₂', K+G2, 'Las ramas en paralelo se suman (o se restan, según el signo del sumador).'],
   real:['G(s) = G₁ / (1 + G₁G₂)', K/(1+K*G2), 'La fórmula de realimentación. El signo del denominador es el CONTRARIO al del comparador.'],
   pert:['Y/D = 1 / (1 + G₁G₂)', 1/(1+K*G2), 'La perturbación queda dividida por 1+L: cuanto mayor es la ganancia de lazo, menos se nota.'],
   anid:['G = G₁G₂ / (1 + G₂ + G₁G₂)', K*G2/(1+G2+K*G2), 'Se cierra primero el lazo interior y después el exterior. Nunca al revés.']};
  const d=defs[s.caso];
  // dibujo esquematico
  const y=72, bw=74, bh=40;
  const blk=(x,txt,col)=>{Rbox(a,x,y,bw,bh,col,true);a.txt(txt,x+bw/2,y+25,col,14,'center');};
  const sum=(x)=>{a.circ(x,y+bh/2,11,C.muted,false);a.txt('+',x-5,y+bh/2-2,C.muted,11,'center');a.txt('−',x-1,y+bh/2+13,C.b,12,'center');};
  const arr=(x1,x2)=>a.arrow(x1,y+bh/2,x2,y+bh/2,C.muted,1.6);
  a.txt('u',40,y+bh/2+5,C.text,13);
  if(s.caso==='serie'){arr(52,96);blk(100,'G₁',C.f);arr(174,206);blk(210,'G₂',C.a);arr(284,320);a.txt('y',326,y+bh/2+5,C.text,13);}
  else if(s.caso==='par'){arr(52,96);a.circ(104,y+bh/2,3,C.muted,true);
    a.line(104,y+bh/2,104,y-22,C.muted,1.4);a.line(104,y+bh/2,104,y+bh+22,C.muted,1.4);
    Rbox(a,130,y-42,bw,bh,C.f,true);a.txt('G₁',130+bw/2,y-17,C.f,14,'center');
    Rbox(a,130,y+42,bw,bh,C.a,true);a.txt('G₂',130+bw/2,y+67,C.a,14,'center');
    a.line(104,y-22,130,y-22,C.muted,1.4);a.line(104,y+bh+22,130,y+bh+22,C.muted,1.4);
    a.line(204,y-22,240,y-22,C.muted,1.4);a.line(204,y+bh+22,240,y+bh+22,C.muted,1.4);
    a.circ(246,y+bh/2,11,C.muted,false);a.txt('+',241,y+bh/2+4,C.muted,12);
    a.line(240,y-22,240,y+bh/2-11,C.muted,1.4);a.line(240,y+bh+22,240,y+bh/2+11,C.muted,1.4);
    arr(257,300);a.txt('y',306,y+bh/2+5,C.text,13);}
  else{sum(70);arr(81,106);blk(110,'G₁',C.f);arr(184,230);a.txt('y',236,y+bh/2+5,C.text,13);
    a.circ(222,y+bh/2,3,C.muted,true);
    a.line(222,y+bh/2,222,y+bh+34,C.muted,1.4);
    Rbox(a,142,y+bh+14,bw,bh-8,C.a,true);a.txt('G₂',142+bw/2,y+bh+36,C.a,13,'center');
    a.line(222,y+bh+34,216,y+bh+34,C.muted,1.4);
    a.line(142,y+bh+34,70,y+bh+34,C.muted,1.4);a.arrow(70,y+bh+34,70,y+bh/2+11,C.muted,1.4);
    if(s.caso==='pert'){a.circ(200,y+bh/2,11,C.b,false);a.txt('+',195,y+bh/2+4,C.b,12);
      a.arrow(200,y-30,200,y+bh/2-11,C.b,1.6);a.txt('d',204,y-32,C.b,12);}
    if(s.caso==='anid'){Rbox(a,110,y-56,bw,bh-10,C.c,true);a.txt('G₂',110+bw/2,y-34,C.c,13,'center');
      a.txt('(lazo interior)',110+bw/2,y-62,C.c,10,'center');}}
  // panel
  const bx=382,by=48;
  a.txt(d[0],bx,by,C.a,15);
  a.txt('G₁ = '+NQ(K)+'   ·   G₂ = '+NQ(G2),bx,by+30,C.muted,12.5);
  a.txt('resultado = '+N3(d[1]),bx,by+58,C.f,16);
  a.html(`<b>${d[0]}</b> con G₁ = ${NQ(K)} y G₂ = ${NQ(G2)} ⇒ <b>${N3(d[1])}</b>.<br>${d[2]}
  <span class="hint">Las reglas de serie, paralelo y realimentación resuelven la mayoría de los diagramas. Cuando los lazos están entrelazados y no se pueden separar moviendo sumadores, es el momento de usar la fórmula de Mason.</span>`);}});

/* T5 · Respuesta de segundo orden */
SIMS.segundo=el=>build(el,{w:680,h:258,
 sliders:[{k:'xi',v:0.456,min:0.05,max:2,step:0.005,l:'Amortiguamiento ξ',u:''},
  {k:'wn',v:4.39,min:0.3,max:15,step:0.05,l:'Frecuencia natural ωn',u:'rad/s'},
  {k:'K',v:1,min:0.2,max:5,step:0.1,l:'Ganancia estática K',u:''}],
 draw(a){a.clear();const s=a.st;
  const xi=s.xi,wn=s.wn,K=s.K;
  const sig=xi*wn, wd=wn*Math.sqrt(Math.abs(1-xi*xi));
  const sub=xi<1;
  const Mp=sub?Math.exp(-Math.PI*xi/Math.sqrt(1-xi*xi)):0;
  const tp=sub?Math.PI/wd:0;
  const ts2=4/sig, ts5=3/sig;
  const T=Math.min(Math.max(ts2*1.6,1),30), N=600;
  const out=simula([K*wn*wn],[1,2*xi*wn,wn*wn],t=>1,T,N);
  const ox=50,oy=206,W=300,H=164;
  const ymax=Math.max(K*(1+Mp)*1.12,K*1.2);
  const X=t=>ox+t/T*W, Y=y=>oy-y/ymax*H;
  a.line(ox,oy,ox+W+10,oy,C.muted,1.5);a.line(ox,oy-H-8,ox,oy+6,C.muted,1.5);
  ticks(ymax,4).forEach(v=>{a.line(ox,Y(v),ox+W,Y(v),C.grid,1);a.txt(N1(v),ox-6,Y(v)+4,C.muted,10,'right');});
  // banda del 2%
  a.g.fillStyle=C.c;a.g.globalAlpha=.10;a.g.fillRect(ox,Y(K*1.02),W,Y(K*0.98)-Y(K*1.02));a.g.globalAlpha=1;
  a.line(ox,Y(K),ox+W,Y(K),C.c,1.4,[5,4]);
  a.txt('K = '+NQ(K),ox+W,Y(K)-8,C.c,10,'right');
  curve(a,out.map(p=>[X(p[0]),Y(Math.min(p[1],ymax))]),C.a,2.5);
  if(sub&&tp<T){a.line(X(tp),oy,X(tp),Y(K*(1+Mp)),C.b,1.2,[3,3]);
    a.circ(X(tp),Y(K*(1+Mp)),5,C.b,true);
    a.txt('Mp = '+N1(Mp*100)+' %',X(tp)+8,Y(K*(1+Mp))-8,C.b,11);
    a.txt('tp',X(tp),oy+32,C.b,10,'center');}
  if(ts2<T){a.line(X(ts2),oy-H,X(ts2),oy,C.f,1.2,[4,3]);a.txt('ts(2%)',X(ts2)+4,oy-H+12,C.f,10);}
  for(let i=0;i<=4;i++)a.txt(N1(T*i/4),X(T*i/4),oy+16,C.muted,10,'center');
  a.txt('t (s)',ox+W/2,oy+34,C.muted,10,'center');
  // plano s
  const px=560,py=78,esc=Math.min(52/Math.max(wn,1),18);
  a.line(px-150,py,px+26,py,C.muted,1.2);a.line(px,py-62,px,py+62,C.muted,1.2);
  const mk=(re,im,col)=>{const x=px+re*esc,y=py-im*esc;a.line(x-5,y-5,x+5,y+5,col,2.5);a.line(x-5,y+5,x+5,y-5,col,2.5);};
  if(sub){mk(-sig,wd,C.a);mk(-sig,-wd,C.a);
    a.line(px,py,px-sig*esc,py-wd*esc,C.f,1.2,[3,3]);
    a.txt('θ = '+N0(Math.degrees?0:Math.acos(xi)*180/Math.PI)+'°',px-sig*esc-6,py-wd*esc-8,C.f,10,'right');}
  else{const r1=-sig+wn*Math.sqrt(xi*xi-1), r2=-sig-wn*Math.sqrt(xi*xi-1);mk(r1,0,C.a);mk(r2,0,C.a);}
  a.txt('plano s',px-146,py-50,C.muted,10);
  // panel
  const bx=392,by=158;
  a.txt('ξ = '+N3(xi)+'  ·  ωn = '+N2(wn)+' rad/s',bx,by,C.text,12.5);
  a.txt('σ = ξωn = '+N2(sig)+'  ·  ωd = '+N2(wd),bx,by+22,C.muted,12);
  a.txt(sub?'Mp = '+N1(Mp*100)+' %   ·   tp = '+N2(tp)+' s':'sin sobreimpulso (ξ ≥ 1)',bx,by+46,sub?C.b:C.c,12.5);
  a.txt('ts = '+N2(ts2)+' s (2 %)   ·   '+N2(ts5)+' s (5 %)',bx,by+70,C.f,12.5);
  a.txt('polos: '+(sub?N2(-sig)+' ± j'+N2(wd):N2(-sig+wn*Math.sqrt(xi*xi-1))+' y '+N2(-sig-wn*Math.sqrt(xi*xi-1))),bx,by+94,C.a,12);
  a.html(`Con ξ = ${N3(xi)} y ωn = ${N2(wn)} rad/s: ${sub?'<b>subamortiguado</b>, con Mp = <b>'+N1(Mp*100)+' %</b> y tp = '+N2(tp)+' s':(Math.abs(xi-1)<0.02?'<b>amortiguamiento crítico</b>: la respuesta más rápida sin sobreimpulso':'<b>sobreamortiguado</b>: dos polos reales y ninguna oscilación')}.<br>
  Tiempo de establecimiento <b>ts = ${N2(ts2)} s</b> (criterio del 2 %) o ${N2(ts5)} s (criterio del 5 %), y polos en ${sub?N2(-sig)+' ± j'+N2(wd):'el eje real'}.<br>
  Recuerda: el <b>sobreimpulso sólo depende de ξ</b> y la <b>rapidez sólo de σ = ξωn</b>, la distancia del polo al eje imaginario.
  <span class="hint">Mueve ξ dejando ωn fija: cambian el sobreimpulso y el tiempo a la vez porque σ = ξωn. Para cambiar sólo el sobreimpulso hay que mover el polo sobre una circunferencia, y para cambiar sólo la rapidez, sobre una recta que pase por el origen.</span>`);}});

/* T6 · Errores en régimen permanente */
SIMS.errores=el=>build(el,{w:680,h:262,
 sliders:[{k:'K',v:5,min:0.5,max:60,step:0.5,l:'Ganancia K',u:''},
  {k:'A',v:1,min:0.5,max:5,step:0.5,l:'Amplitud de la entrada',u:''}],
 selects:[{k:'tipo',v:'1',l:'Tipo del sistema',opts:[['0','Tipo 0: K/((s+1)(s+2))'],['1','Tipo 1: K/(s(s+2))'],['2','Tipo 2: K/(s²(s+2))']]},
  {k:'ent',v:'ramp',l:'Entrada',opts:[['esc','Escalón'],['ramp','Rampa'],['par','Parábola']]}],
 draw(a){a.clear();const s=a.st;
  const tipo=parseInt(s.tipo), K=s.K, A=s.A;
  const Kp = tipo===0? K/2 : Infinity;
  const Kv = tipo===0? 0 : (tipo===1? K/2 : Infinity);
  const Ka = tipo<=1? 0 : K/2;
  const errs={esc: tipo===0? A/(1+Kp):0, ramp: tipo===0? Infinity:(tipo===1? A/Kv:0), par: tipo<=1? Infinity: A/Ka};
  const e=errs[s.ent];
  // lazo cerrado y simulacion
  let den_ol, num_ol=[K];
  if(tipo===0) den_ol=polyMul([1,1],[1,2]);
  else if(tipo===1) den_ol=polyMul([1,0],[1,2]);
  else den_ol=polyMul([1,0,0],[1,2]);
  const den_cl=polyAdd(den_ol,num_ol);
  const rts=raices(den_cl); const estable=rts.every(r=>r.re<1e-9);
  const T= s.ent==='esc'?Math.min(30,10):(s.ent==='ramp'?12:8), N=500;
  const u = s.ent==='esc'? (t=>A) : (s.ent==='ramp'? (t=>A*t) : (t=>A*t*t/2));
  const out = estable? simula(num_ol,den_cl,u,T,N) : [];
  const ox=52,oy=196,W=320,H=156;
  let ymax=0.1; for(let i=0;i<=N;i++)ymax=Math.max(ymax,u(T*i/N));
  ymax*=1.1;
  const X=t=>ox+t/T*W, Y=y=>oy-y/ymax*H;
  a.line(ox,oy,ox+W+10,oy,C.muted,1.5);a.line(ox,oy-H-8,ox,oy+6,C.muted,1.5);
  const pr=[];for(let i=0;i<=N;i++){const t=T*i/N;pr.push([X(t),Y(Math.min(u(t),ymax))]);}
  curve(a,pr,C.c,2,[6,4]);
  if(estable){curve(a,out.map(p=>[X(p[0]),Y(Math.max(Math.min(p[1],ymax),0))]),C.a,2.5);
    // marcar el error final
    const yf=out[out.length-1][1], rf=u(T);
    if(isFinite(e)&&Math.abs(rf-yf)<ymax){a.line(X(T*0.93),Y(rf),X(T*0.93),Y(yf),C.b,2);
      a.txt('e = '+(e===0?'0':N3(Math.abs(rf-yf))),X(T*0.93)-6,Y((rf+yf)/2)+4,C.b,11,'right');}}
  else a.txt('lazo cerrado INESTABLE',ox+W/2,oy-H/2,C.b,15,'center');
  a.line(ox+6,24,ox+30,24,C.c,2,[6,4]);a.txt('referencia',ox+36,28,C.c,11);
  a.line(ox+124,24,ox+148,24,C.a,2.5);a.txt('salida',ox+154,28,C.a,11);
  for(let i=0;i<=4;i++)a.txt(N1(T*i/4),ox+W*i/4,oy+16,C.muted,10,'center');
  a.txt('t (s)',ox+W/2,oy+32,C.muted,10,'center');
  // panel
  const bx=392,by=38;
  a.txt('Cadena abierta: '+['K/((s+1)(s+2))','K/(s(s+2))','K/(s²(s+2))'][tipo],bx,by,C.muted,12);
  a.txt('Tipo '+tipo+' ('+tipo+' integrador'+(tipo===1?'':'es')+')',bx,by+24,C.a,14);
  a.txt('Kp = '+(isFinite(Kp)?N2(Kp):'∞'),bx,by+52,C.f,12.5);
  a.txt('Kv = '+(isFinite(Kv)?N2(Kv):'∞'),bx,by+74,C.f,12.5);
  a.txt('Ka = '+(isFinite(Ka)?N2(Ka):'∞'),bx,by+96,C.f,12.5);
  a.txt('Error ante '+{esc:'escalón',ramp:'rampa',par:'parábola'}[s.ent]+':',bx,by+128,C.text,12.5);
  a.txt(isFinite(e)?N3(e):'∞ (no sigue la entrada)',bx,by+152,isFinite(e)&&e<0.1?C.c:C.b,16);
  a.txt(estable?'lazo cerrado estable ✓':'lazo cerrado inestable ✗',bx,by+180,estable?C.c:C.b,12);
  a.html(`Sistema de <b>tipo ${tipo}</b> con K = ${NQ(K)}: Kp = ${isFinite(Kp)?N2(Kp):'∞'}, Kv = ${isFinite(Kv)?N2(Kv):'∞'}, Ka = ${isFinite(Ka)?N2(Ka):'∞'}.<br>
  Ante una <b>${{esc:'entrada escalón',ramp:'rampa',par:'parábola'}[s.ent]}</b> de amplitud ${NQ(A)} el error permanente vale <b>${isFinite(e)?N3(e):'infinito'}</b>.<br>
  ${estable?'':'<b>Atención:</b> con esta ganancia el lazo cerrado es inestable, así que el error calculado no tiene sentido físico. Comprobar la estabilidad es siempre el primer paso.'}
  <span class="hint">Cada integrador anula un orden de error. Sube la ganancia y verás que el error <b>disminuye pero no se anula</b>: para anularlo hay que añadir un integrador, no más ganancia.</span>`);}});

/* T7 · Routh y rango de estabilidad */
SIMS.routh=el=>build(el,{w:680,h:232,
 sliders:[{k:'K',v:20,min:0.5,max:120,step:0.5,l:'Ganancia K',u:''},
  {k:'p2',v:2,min:0.5,max:8,step:0.5,l:'Polo 2 en −',u:''},
  {k:'p3',v:4,min:0.5,max:12,step:0.5,l:'Polo 3 en −',u:''}],
 draw(a){a.clear();const s=a.st;
  // 1 + K/(s(s+p2)(s+p3)) = 0 -> s^3 + (p2+p3)s^2 + p2p3 s + K
  const a2=s.p2+s.p3, a1=s.p2*s.p3, a0=s.K;
  const Klim=a2*a1;
  const b1=(a2*a1-a0)/a2;
  const est=b1>0&&a0>0;
  const wosc=Math.sqrt(a1);
  const rts=raices([1,a2,a1,a0]);
  // tabla de Routh
  const ox=44,by=52;
  a.txt('Ecuación característica:  s³ + '+NQ(a2)+'s² + '+NQ(a1)+'s + '+NQ(a0)+' = 0',ox,30,C.text,13);
  const filas=[['s³','1',NQ(a1)],['s²',NQ(a2),NQ(a0)],['s¹',N3(b1),'0'],['s⁰',NQ(a0),'']];
  filas.forEach((f,i)=>{const y=by+22+i*28;
    a.txt(f[0],ox+8,y,C.muted,12);
    const col=(i===2&&b1<=0)?C.b:(i===3&&a0<=0?C.b:C.c);
    a.txt(f[1],ox+56,y,col,13);
    a.txt(f[2],ox+150,y,C.muted,12);});
  Rbox(a,ox+44,by+4,70,4*28-6,est?C.c:C.b,true);
  a.txt('primera columna',ox+44,by+4+4*28+12,est?C.c:C.b,11);
  a.txt(est?'sin cambios de signo → ESTABLE':'hay cambio de signo → INESTABLE',ox,by+4+4*28+34,est?C.c:C.b,13);
  // plano s con los polos
  const px=330,py=120,esc=Math.min(100/Math.max(...rts.map(r=>Math.abs(r.re)),1),26);
  a.line(px-90,py,px+70,py,C.muted,1.2);a.line(px,py-80,px,py+80,C.muted,1.2);
  a.g.fillStyle=C.b;a.g.globalAlpha=.07;a.g.fillRect(px,py-80,70,160);a.g.globalAlpha=1;
  a.txt('inestable',px+34,py-70,C.b,10,'center');
  rts.forEach(r=>{const x=px+r.re*esc,y=py-r.im*esc;
    const col=r.re<0?C.c:C.b;
    a.line(x-5,y-5,x+5,y+5,col,2.5);a.line(x-5,y+5,x+5,y-5,col,2.5);});
  a.txt('polos del lazo cerrado',px-86,py+96,C.muted,11);
  // panel
  const bx=470,bya=48;
  a.txt('Rango de estabilidad:',bx,bya,C.text,12.5);
  a.txt('0 < K < '+N1(Klim),bx,bya+26,C.a,16);
  a.txt('K actual = '+NQ(s.K),bx,bya+54,est?C.c:C.b,13);
  a.txt('En el límite (K = '+N1(Klim)+'):',bx,bya+86,C.muted,12);
  a.txt('ω = √('+NQ(a1)+') = '+N2(wosc)+' rad/s',bx,bya+108,C.f,12.5);
  a.txt('T = 2π/ω = '+N2(2*Math.PI/wosc)+' s',bx,bya+130,C.f,12.5);
  a.txt('polos: '+rts.map(r=>Math.abs(r.im)<1e-6?N2(r.re):N2(r.re)+'±j'+N2(Math.abs(r.im))).filter((v,i,ar)=>ar.indexOf(v)===i).join('  '),bx,bya+162,C.muted,10.5);
  a.html(`Con polos en 0, −${NQ(s.p2)} y −${NQ(s.p3)}, la ecuación característica es s³ + ${NQ(a2)}s² + ${NQ(a1)}s + K = 0 y el criterio de Routh da <b>0 &lt; K &lt; ${N1(Klim)}</b>.<br>
  Con K = ${NQ(s.K)} el sistema es <b>${est?'estable':'inestable'}</b>${est?'':' (hay polos con parte real positiva)'}.<br>
  En el límite de estabilidad el sistema oscila de forma mantenida a <b>ω = ${N2(wosc)} rad/s</b>, con periodo ${N2(2*Math.PI/wosc)} s: son los datos (Ku y Tu) que usa el método de Ziegler-Nichols para sintonizar un PID.
  <span class="hint">Fíjate en que el límite de K sólo depende de la posición de los polos: K_límite = (p₂+p₃)·p₂p₃. Alejar un polo del origen permite más ganancia; acercarlo, menos.</span>`);}});

/* T8 · Lugar de las raíces */
SIMS.ldr=el=>build(el,{w:680,h:290,
 sliders:[{k:'K',v:8.3,min:0.1,max:60,step:0.1,l:'Ganancia K',u:''},
  {k:'p2',v:2,min:0.5,max:8,step:0.5,l:'Polo en −',u:''},
  {k:'p3',v:4,min:0.5,max:12,step:0.5,l:'Polo en −',u:''},
  {k:'z',v:0,min:0,max:10,step:0.5,l:'Cero en − (0 = sin cero)',u:''}],
 draw(a){a.clear();const s=a.st;
  const polos=[0,-s.p2,-s.p3], ceros = s.z>0.01? [-s.z]:[];
  const n=3,m=ceros.length;
  const denOL=polyMul(polyMul([1,0],[1,s.p2]),[1,s.p3]);
  const numOL= m? [1,s.z]:[1];
  const px=186,py=150;
  const span=Math.max(s.p3,s.p2,s.z)+3;
  const esc=Math.min(150/span,30);
  a.line(px-160,py,px+60,py,C.muted,1.3);a.line(px,py-110,px,py+110,C.muted,1.3);
  a.g.fillStyle=C.b;a.g.globalAlpha=.06;a.g.fillRect(px,py-110,60,220);a.g.globalAlpha=1;
  a.txt('Re',px+64,py+4,C.muted,10);a.txt('Im',px+5,py-112,C.muted,10);
  // tramos del eje real
  const enLDR=x=>{let c=0;polos.forEach(p=>{if(p>x)c++;});ceros.forEach(z=>{if(z>x)c++;});return c%2===1;};
  for(let x=-span;x<=0.5;x+=0.02){if(enLDR(x)){a.line(px+x*esc,py-2.5,px+(x+0.02)*esc,py-2.5,C.a,5);}}
  // ramas: nube de puntos (evita problemas de emparejamiento entre ramas)
  const dentro=(x,y)=>x>px-165&&x<px+62&&y>py-112&&y<py+112;
  for(let i=0;i<=600;i++){
    const kk=Math.pow(10,-2.2+5.2*i/600);
    const d=polyAdd(denOL,numOL.map(v=>v*kk));
    raices(d).forEach(rr=>{const x=px+rr.re*esc,y=py-rr.im*esc;
      if(dentro(x,y)){a.g.fillStyle=C.a;a.g.globalAlpha=.85;a.g.fillRect(x-1,y-1,2.2,2.2);a.g.globalAlpha=1;}});}
  polos.forEach(p=>{const x=px+p*esc;a.line(x-6,py-6,x+6,py+6,C.f,2.5);a.line(x-6,py+6,x+6,py-6,C.f,2.5);});
  ceros.forEach(z=>{a.circ(px+z*esc,py,6,C.c,false);});
  // polos actuales
  const dcl=polyAdd(denOL,numOL.map(v=>v*s.K));
  const rc=raices(dcl);
  rc.forEach(r=>a.circ(px+r.re*esc,py-r.im*esc,5,C.b,true));
  const est=rc.every(r=>r.re<1e-9);
  // asintotas
  const na=n-m, cen=(polos.reduce((x,y)=>x+y,0)-ceros.reduce((x,y)=>x+y,0))/na;
  a.circ(px+cen*esc,py,3.5,C.muted,true);
  for(let k=0;k<na;k++){const th=Math.PI*(2*k+1)/na;
    a.line(px+cen*esc,py,px+cen*esc+150*Math.cos(th),py-150*Math.sin(th),C.grid,1.2,[5,4]);}
  // panel
  const bx=368,by=40;
  a.txt('Polos: 0, −'+NQ(s.p2)+', −'+NQ(s.p3)+(m?'   Cero: −'+NQ(s.z):'   (sin ceros)'),bx,by,C.muted,12);
  a.txt(na+' asíntotas en '+[...Array(na)].map((_,k)=>N0(180*(2*k+1)/na)).join('°, ')+'°',bx,by+24,C.muted,12);
  a.txt('centroide = '+N2(cen),bx,by+46,C.muted,12);
  a.txt('K = '+NQ(s.K)+' → polos del lazo cerrado:',bx,by+76,C.text,12.5);
  const txts=[];
  rc.sort((A,B)=>B.im-A.im).forEach(r=>{const t=(Math.abs(r.im)<1e-6? N3(r.re) : N3(r.re)+' ± j'+N3(Math.abs(r.im)));
    if(txts.indexOf(t)<0)txts.push(t);});
  txts.forEach((t,i)=>a.txt(t,bx+10,by+98+i*20,t.indexOf('-')===0?C.c:C.b,12));
  const dom=rc.filter(r=>r.im>1e-6)[0];
  if(dom){const xi=-dom.re/Math.sqrt(dom.re*dom.re+dom.im*dom.im);
    a.txt('ξ dominante = '+N3(xi)+(xi>0&&xi<1?'  →  Mp = '+N1(100*Math.exp(-Math.PI*xi/Math.sqrt(1-xi*xi)))+' %':''),bx,by+152,C.a,13);}
  a.txt(est?'✓ estable':'✗ inestable',bx,by+178,est?C.c:C.b,14);
  a.html(`Lugar de las raíces de K·${m?'(s+'+NQ(s.z)+')':'1'}/(s(s+${NQ(s.p2)})(s+${NQ(s.p3)})): <b>${na} asíntotas</b> con centroide en ${N2(cen)}.<br>
  Con K = ${NQ(s.K)} los polos del lazo cerrado están en ${rc.map(r=>Math.abs(r.im)<1e-6?N2(r.re):N2(r.re)+'±j'+N2(Math.abs(r.im))).filter((v,i,ar)=>ar.indexOf(v)===i).join(', ')} ⇒ sistema <b>${est?'estable':'inestable'}</b>.<br>
  ${m?'El <b>cero atrae</b> el lugar hacia la izquierda: con él caben ganancias mucho mayores sin perder estabilidad. Ése es el efecto de una red de adelanto.':'Sin ceros, las tres ramas se van al infinito por las asíntotas y dos de ellas acaban cruzando al semiplano derecho: hay un <b>límite de ganancia</b>.'}
  <span class="hint">Sube K poco a poco y sigue los puntos: salen de los polos, se encuentran en el punto de ruptura, se separan hacia arriba y abajo y acaban cruzando el eje imaginario. Añade después un cero y observa cómo cambia todo el dibujo.</span>`);}});

/* T9 · Diseño de compensador de adelanto */
SIMS.compensador=el=>build(el,{w:680,h:250,
 sliders:[{k:'Mp',v:16,min:2,max:50,step:1,l:'Sobreimpulso máximo',u:'%'},
  {k:'ts',v:1,min:0.2,max:6,step:0.1,l:'Tiempo de establecimiento (2 %)',u:'s'},
  {k:'p',v:2,min:0.5,max:8,step:0.5,l:'Planta: 1/(s(s+p)), p =',u:''}],
 draw(a){a.clear();const s=a.st;
  const Mp=s.Mp/100;
  const xi=-Math.log(Mp)/Math.sqrt(Math.PI*Math.PI+Math.log(Mp)*Math.log(Mp));
  const sig=4/s.ts, wn=sig/xi, wd=wn*Math.sqrt(1-xi*xi);
  const sd={re:-sig,im:wd};
  const ang=z=>Math.atan2(sd.im,sd.re+z)*180/Math.PI;
  const faseG=-(ang(0)+ang(s.p));
  const falta=-180-faseG;
  // diseño por cancelacion: cero en -p, polo en pc
  const a1=ang(0);
  const a3=180-a1;
  const pc=sig+wd/Math.tan(a3*Math.PI/180);
  const mod=z=>Math.hypot(sd.re+z,sd.im);
  const Kc=mod(0)*mod(pc);
  const Kv=Kc/pc;
  // respuesta del lazo cerrado compensado: Kc/(s(s+pc)) -> cl
  const den=[1,pc,Kc];
  const T=Math.min(s.ts*2.5,12),N=500;
  const out=simula([Kc],den,t=>1,T,N);
  const ox=46,oy=200,W=268,H=148;
  let ymax=1.5; out.forEach(p=>ymax=Math.max(ymax,p[1]*1.1));
  const X=t=>ox+t/T*W, Y=y=>oy-y/ymax*H;
  a.line(ox,oy,ox+W+8,oy,C.muted,1.5);a.line(ox,oy-H-8,ox,oy+6,C.muted,1.5);
  a.g.fillStyle=C.c;a.g.globalAlpha=.10;a.g.fillRect(ox,Y(1.02),W,Y(0.98)-Y(1.02));a.g.globalAlpha=1;
  a.line(ox,Y(1),ox+W,Y(1),C.c,1.3,[5,4]);
  a.line(ox,Y(1+Mp),ox+W,Y(1+Mp),C.b,1.2,[3,3]);
  a.txt('límite Mp',ox+W,Y(1+Mp)-6,C.b,10,'right');
  curve(a,out.map(p=>[X(p[0]),Y(Math.min(p[1],ymax))]),C.a,2.5);
  a.line(X(s.ts),oy-H,X(s.ts),oy,C.f,1.2,[4,3]);
  a.txt('ts',X(s.ts)+4,oy-H+12,C.f,10);
  a.txt('respuesta del lazo compensado',ox,26,C.text,12);
  a.txt('t (s)',ox+W/2,oy+32,C.muted,10,'center');
  for(let i=0;i<=4;i++)a.txt(N1(T*i/4),X(T*i/4),oy+16,C.muted,10,'center');
  // plano s
  const px=600,py=70,esc=Math.min(56/Math.max(wn,1),13);
  a.line(px-220,py,px+22,py,C.muted,1.2);a.line(px,py-58,px,py+58,C.muted,1.2);
  const mk=(re,im,col,tipo)=>{const x=px+re*esc,y=py-im*esc;
    if(tipo==='o')a.circ(x,y,5,col,false);
    else {a.line(x-5,y-5,x+5,y+5,col,2.5);a.line(x-5,y+5,x+5,y-5,col,2.5);}};
  mk(0,0,C.muted,'x');mk(-s.p,0,C.muted,'x');
  mk(-s.p,0,C.c,'o'); mk(-pc,0,C.f,'x');
  a.circ(px+sd.re*esc,py-sd.im*esc,5,C.a,true);
  a.circ(px+sd.re*esc,py+sd.im*esc,5,C.a,true);
  a.line(px,py,px+sd.re*esc,py-sd.im*esc,C.a,1.2,[3,3]);
  a.txt('sd',px+sd.re*esc+8,py-sd.im*esc-6,C.a,11);
  a.txt('plano s',px-216,py-46,C.muted,10);
  // panel
  const bx=352,by=148;
  a.txt('ξ = '+N3(xi)+'   σ = '+N2(sig)+'   ωn = '+N2(wn),bx,by,C.muted,12);
  a.txt('polo deseado sd = '+N2(sd.re)+' ± j'+N2(sd.im),bx,by+22,C.a,12.5);
  a.txt('fase de la planta en sd = '+N1(faseG)+'°  →  faltan '+N1(falta)+'°',bx,by+46,falta>0?C.b:C.c,12);
  a.txt('C(s) = '+N1(Kc)+'(s+'+NQ(s.p)+')/(s+'+N2(pc)+')',bx,by+74,C.f,14);
  a.txt('Kv = Kc/p_c = '+N2(Kv),bx,by+98,C.muted,12);
  a.html(`Especificaciones Mp = ${NQ(s.Mp)} % y ts = ${NQ(s.ts)} s ⇒ ξ = <b>${N3(xi)}</b>, σ = ${N2(sig)} y el polo deseado es <b>sd = ${N2(sd.re)} ± j${N2(sd.im)}</b>.<br>
  La planta aporta ${N1(faseG)}° de fase en ese punto, así que <b>faltan ${N1(falta)}°</b>: hace falta una red de adelanto. Cancelando el polo en −${NQ(s.p)} con el cero del compensador y aplicando la condición de ángulo sale el polo en <b>−${N2(pc)}</b>, y la de módulo da <b>Kc = ${N1(Kc)}</b>.<br>
  Resultado: <b>C(s) = ${N1(Kc)}(s+${NQ(s.p)})/(s+${N2(pc)})</b>, con Kv = ${N2(Kv)} (el error ante rampa sería ${N3(1/Kv)}).
  <span class="hint">La respuesta dibujada es la del lazo compensado: comprueba que el sobreimpulso cae justo en el límite y que entra en la banda del 2 % en el tiempo pedido. Si además hiciera falta mejorar el error, se añadiría una red de atraso cerca del origen.</span>`);}});

/* Extra · Primer orden: identificación */
SIMS.primerorden=el=>build(el,{w:680,h:242,
 sliders:[{k:'K',v:2,min:0.2,max:8,step:0.1,l:'Ganancia K',u:''},
  {k:'T',v:3,min:0.2,max:12,step:0.1,l:'Constante de tiempo T',u:'s'},
  {k:'u0',v:1,min:0.5,max:4,step:0.5,l:'Amplitud del escalón',u:''}],
 draw(a){a.clear();const s=a.st;
  const Tt=Math.max(s.T*5,2), N=400;
  const yf=s.K*s.u0;
  const ox=52,oy=178,W=330,H=142;
  const X=t=>ox+t/Tt*W, Y=y=>oy-y/(yf*1.15)*H;
  a.line(ox,oy,ox+W+10,oy,C.muted,1.5);a.line(ox,oy-H-8,ox,oy+6,C.muted,1.5);
  ticks(yf*1.15,4).forEach(v=>{a.line(ox,Y(v),ox+W,Y(v),C.grid,1);a.txt(N1(v),ox-6,Y(v)+4,C.muted,10,'right');});
  const pts=[];for(let i=0;i<=N;i++){const t=Tt*i/N;pts.push([X(t),Y(yf*(1-Math.exp(-t/s.T)))]);}
  curve(a,pts,C.a,2.5);
  a.line(ox,Y(yf),ox+W,Y(yf),C.c,1.4,[5,4]);
  a.txt('K·u₀ = '+N2(yf),ox+W,Y(yf)-8,C.c,11,'right');
  // tangente inicial
  curve(a,[[X(0),Y(0)],[X(Math.min(s.T,Tt)),Y(yf)]],C.f,1.6,[5,4]);
  a.circ(X(s.T),Y(0.632*yf),5,C.b,true);
  a.line(X(s.T),oy,X(s.T),Y(0.632*yf),C.b,1.2,[3,3]);
  a.txt('T',X(s.T),oy+16,C.b,11,'center');
  a.txt('63,2 %',X(s.T)+8,Y(0.632*yf)-8,C.b,11);
  const t3=3*s.T;
  if(t3<Tt){a.line(X(t3),oy,X(t3),Y(0.95*yf),C.c,1.2,[3,3]);a.txt('3T (95 %)',X(t3)+6,Y(0.95*yf)+16,C.c,10);}
  a.txt('t (s)',ox+W/2,oy+32,C.muted,10,'center');
  // panel
  const bx=414,by=34;
  a.txt('G(s) = K/(1+Ts) = '+NQ(s.K)+'/(1+'+NQ(s.T)+'s)',bx,by,C.a,13);
  a.txt('valor final = K·u₀ = '+N2(yf),bx,by+30,C.c,12.5);
  a.txt('pendiente inicial = K·u₀/T = '+N2(yf/s.T),bx,by+54,C.f,12.5);
  a.txt('y(T) = 0,632·K·u₀ = '+N2(0.632*yf),bx,by+78,C.b,12.5);
  a.txt('ts = 3T = '+N1(3*s.T)+' s (5 %)',bx,by+106,C.muted,12.5);
  a.txt('    = 4T = '+N1(4*s.T)+' s (2 %)',bx,by+128,C.muted,12.5);
  a.txt('polo en s = −1/T = '+N3(-1/s.T),bx,by+156,C.a,12.5);
  a.html(`Primer orden con K = ${NQ(s.K)} y T = ${NQ(s.T)} s ante un escalón de ${NQ(s.u0)}: la salida tiende a <b>${N2(yf)}</b>, pasa por el <b>63,2 %</b> en t = T y se considera establecida en 3T = ${N1(3*s.T)} s.<br>
  La <b>pendiente inicial</b> vale K·u₀/T = ${N2(yf/s.T)}: si el sistema mantuviera esa pendiente, alcanzaría el valor final exactamente en t = T.<br>
  Así se identifica un primer orden en el laboratorio: se mide el valor final (da K) y el tiempo en llegar al 63,2 % (da T).
  <span class="hint">Este sistema nunca sobreoscila y nunca se inestabiliza por mucha ganancia que se le ponga: su único polo se mueve por el eje real negativo. Los problemas empiezan a partir de tres polos.</span>`);}});

/* Extra · Acciones PID */
SIMS.pid=el=>build(el,{w:680,h:262,
 sliders:[{k:'Kp',v:4,min:0,max:30,step:0.1,l:'Proporcional Kp',u:''},
  {k:'Ki',v:2,min:0,max:20,step:0.1,l:'Integral Ki',u:''},
  {k:'Kd',v:0.5,min:0,max:6,step:0.05,l:'Derivativa Kd',u:''}],
 draw(a){a.clear();const s=a.st;
  // planta 1/((s+1)(s+2)) con PID
  const Gd=polyMul([1,1],[1,2]);
  // C = (Kd s^2 + Kp s + Ki)/s ; L = C*G ; cl: s*Gd + (Kd s^2+Kp s+Ki)
  const den=polyAdd(polyMul([1,0],Gd),[s.Kd,s.Kp,s.Ki]);
  const num=[s.Kd,s.Kp,s.Ki];
  const rts=raices(den); const est=rts.every(r=>r.re<1e-9);
  const T=12,N=600;
  const out= est? simula(num,den,t=>1,T,N):[];
  const ox=50,oy=190,W=330,H=152;
  let ymax=1.6; out.forEach(p=>ymax=Math.max(ymax,Math.min(p[1]*1.1,4)));
  const X=t=>ox+t/T*W, Y=y=>oy-y/ymax*H;
  a.line(ox,oy,ox+W+10,oy,C.muted,1.5);a.line(ox,oy-H-8,ox,oy+6,C.muted,1.5);
  a.g.fillStyle=C.c;a.g.globalAlpha=.10;a.g.fillRect(ox,Y(1.02),W,Y(0.98)-Y(1.02));a.g.globalAlpha=1;
  a.line(ox,Y(1),ox+W,Y(1),C.c,1.4,[5,4]);
  a.txt('referencia',ox+W,Y(1)-8,C.c,10,'right');
  if(est)curve(a,out.map(p=>[X(p[0]),Y(Math.max(Math.min(p[1],ymax),0))]),C.a,2.5);
  else a.txt('INESTABLE',ox+W/2,oy-H/2,C.b,16,'center');
  a.txt('t (s)',ox+W/2,oy+32,C.muted,10,'center');
  for(let i=0;i<=4;i++)a.txt(N0(T*i/4),X(T*i/4),oy+16,C.muted,10,'center');
  // indicadores
  let Mp=0,ts=NaN,yf=est?out[out.length-1][1]:NaN;
  if(est){out.forEach(p=>Mp=Math.max(Mp,p[1]));
    for(let i=out.length-1;i>=0;i--){if(Math.abs(out[i][1]-yf)>0.02*Math.abs(yf)){ts=out[i][0];break;}}}
  // panel
  const bx=404,by=32;
  a.txt('Planta: 1/((s+1)(s+2))',bx,by,C.muted,12);
  a.txt('C(s) = Kp + Ki/s + Kd·s',bx,by+24,C.a,13);
  a.txt('P = '+NQ(s.Kp)+'   I = '+NQ(s.Ki)+'   D = '+NQ(s.Kd),bx,by+48,C.f,12.5);
  a.txt(est?'valor final = '+N3(yf):'lazo inestable',bx,by+78,est?C.c:C.b,13);
  if(est){a.txt('error permanente = '+N3(Math.abs(1-yf)),bx,by+102,Math.abs(1-yf)<0.01?C.c:C.b,12.5);
    a.txt('sobreimpulso = '+N1(100*Math.max(Mp-1,0))+' %',bx,by+124,C.b,12.5);
    a.txt('ts (2 %) ≈ '+(isNaN(ts)?'—':N2(ts)+' s'),bx,by+146,C.f,12.5);}
  a.txt(s.Ki>0.01?'✓ con acción integral: error nulo':'✗ sin integral: queda error permanente',bx,by+176,s.Ki>0.01?C.c:C.b,12);
  a.html(`PID con Kp = ${NQ(s.Kp)}, Ki = ${NQ(s.Ki)} y Kd = ${NQ(s.Kd)} sobre la planta 1/((s+1)(s+2)): ${est?'lazo <b>estable</b>, con valor final '+N3(yf)+' y sobreimpulso del '+N1(100*Math.max(Mp-1,0))+' %':'lazo <b>inestable</b>'}.<br>
  ${s.Ki>0.01?'La acción <b>integral</b> convierte el sistema en tipo 1 y anula el error permanente.':'Sin acción integral queda un <b>error permanente</b> de '+(est?N3(Math.abs(1-yf)):'—')+': con sólo P el sistema sigue siendo de tipo 0.'}<br>
  ${s.Kd>0.01?'La acción <b>derivativa</b> aporta amortiguamiento: permite subir Kp sin que el sobreimpulso se dispare.':'Prueba a subir la acción derivativa: verás cómo baja el sobreimpulso y se puede aumentar Kp.'}
  <span class="hint">P reduce el error y acelera, pero oscila; I anula el error pero desestabiliza; D amortigua pero amplifica el ruido. Un PID bien ajustado es el equilibrio entre las tres, y es el regulador que lleva el 90 % de los lazos industriales.</span>`);}});

document.querySelectorAll("[data-sim]").forEach(function(el){var k=el.getAttribute("data-sim");if(SIMS[k]){try{SIMS[k](el);}catch(e){console.error("sim "+k,e);}}else console.warn("sim no encontrada: "+k);});
})();
