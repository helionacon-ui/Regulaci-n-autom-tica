/* Regulación Automática: una animación por tema */
(function(){var M=window.MANIM;if(!M)return;var U=M.util,C=M.C,nf=U.nf,lerp=U.lerp,ease=U.ease,seg=U.seg,clamp=U.clamp,RG=U.RG,W=640;

/* raíces de s³+3s²+2s+K (Durand-Kerner, con continuidad) */
function cm(a,b){return [a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]];}
function cd(a,b){var d=b[0]*b[0]+b[1]*b[1];return [(a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d];}
function roots3(K,z){z=z||[[-0.1,0.05],[-1.1,-0.05],[-2.1,0.02]];z=z.map(function(q){return q.slice();});
 for(var it=0;it<80;it++)for(var i=0;i<3;i++){var s=z[i],p=cm(cm(s,s),s),f=[p[0]+3*(s[0]*s[0]-s[1]*s[1])+2*s[0]+K,p[1]+3*2*s[0]*s[1]+2*s[1]],d=[1,0];for(var j=0;j<3;j++)if(j!==i)d=cm(d,[s[0]-z[j][0],s[1]-z[j][1]]);var q=cd(f,d);z[i]=[s[0]-q[0],s[1]-q[1]];}return z;}
var LOC=[],z0=null;for(var k=0;k<=300;k++){var Kk=Math.pow(k/300,2)*40;z0=roots3(Kk+1e-6,z0?z0.map(function(q,i){return [q[0],q[1]+[0.01,-0.013,0.007][i]];}):null);LOC.push([Kk,z0]);}
function rAt(K){for(var i=1;i<LOC.length;i++)if(LOC[i][0]>=K)return LOC[i][1];return LOC[LOC.length-1][1];}

/* T1 lazo abierto frente a lazo cerrado */
function sim1(K,closed,tt){var y=0,dt=0.02,n=Math.round(tt/dt);for(var i=0;i<n;i++){var t=i*dt,d=t>=8?-0.4:0,u=closed?K*(1-y)*(1+1/K):1;y+=dt*(-y+u+d);}return y;}
M.reg('ra-t1',M.base({title:'Lazo abierto frente a lazo cerrado',H:560,dur:18,caps:[[6,'En lazo abierto se aplica la entrada calculada para llegar a la referencia y se confía en que el sistema responda como se esperaba.'],[11,'En t = 8 s entra una perturbación (por ejemplo, una carga). El lazo abierto no se entera: la salida se queda desviada.'],[99,'En lazo cerrado se mide la salida y se corrige con el error: la perturbación se reduce en un factor 1 + K. Es la razón de ser de la realimentación.']]},
 function(D,t){var tt=seg(t,0.5,16.5)*16,A=U.axes(D,{xr:[0,16.5],yr:[0,1.3],xt:[4,8,12,16],yt:[0.5,1],xd:0,yd:1,xl:'t (s)',yl:'y'},{x:80,y:96,w:480,h:300,grid:true});
  D.line(A.X(0),A.Y(1),A.X(16.5),A.Y(1),C.mut,1.4,[6,4]);D.text('referencia',A.X(16.3),A.Y(1)-8,{s:14,c:C.mut,a:'right'});D.line(A.X(8),A.Y(0),A.X(8),A.Y(1.3),C.bad,1,[3,4]);D.text('perturbación',A.X(8)+6,A.Y(1.25),{s:14,c:C.bad});
  [[false,C.g,'lazo abierto'],[true,C.m,'lazo cerrado (K = 9)']].forEach(function(q,k){var p=[],y=0,dt=0.02;for(var i=0;i*dt<=tt;i++){var ti=i*dt,d=ti>=8?-0.4:0,u=q[0]?9*(1-y)+1:1;y+=dt*(-y+u+d)*(q[0]?1:1);p.push([A.X(ti),A.Y(y)]);}D.path(p,q[1],2.8);if(p.length)D.dot(p[p.length-1][0],p[p.length-1][1],5,q[1]);D.text(q[2],A.X(1),A.Y(0.3-k*0.12),{s:16,c:q[1]});});
  U.readout(D,['después de la perturbación:','abierto: y → 0,60      cerrado: y → 1 − 0,4/(1+9) = 0,96'],468);}));

/* T2 polos en el plano s y respuesta temporal */
M.reg('ra-t2',M.base({title:'Polos en el plano s y respuesta en el tiempo',H:560,dur:18,caps:[[6,'Un par de polos complejos <i>s = σ ± jω</i> produce en el tiempo una oscilación <i>e<sup>σt</sup>·cos ωt</i>.'],[12,'La parte real σ fija la envolvente: cuanto más a la izquierda, más rápido se amortigua.'],[99,'Si los polos cruzan al semiplano derecho (σ > 0) la oscilación crece sin límite: el sistema es inestable.']]},
 function(D,t){var sg=lerp(-1.2,0.25,U.pp(t,18)),w=3,cx=150,cy=260,S=40;D.line(cx-110,cy,cx+60,cy,C.ax,1.4);D.line(cx,cy-110,cx,cy+110,C.ax,1.4);D.rect(cx,cy-110,60,220,null,RG(C.bad,.1));D.text('Re',cx+60,cy-8,{s:14,c:C.w,a:'right'});D.text('Im',cx+6,cy-100,{s:14,c:C.w});
  [1,-1].forEach(function(sg2){D.cross(cx+sg*S*1.6,cy-sg2*w*S*0.7,7,C.m);});D.text('σ = '+nf(sg,2),cx,cy+140,{s:17,a:'center',c:C.m});
  var A=U.axes(D,{xr:[0,8],yr:[-3,3],xt:[2,4,6,8],yt:[-2,-1,1,2],xd:0,yd:0,xl:'t',yl:'y(t)'},{x:300,y:110,w:300,h:300,grid:true});
  U.clipA(D,A,function(){U.plotf(D,A,function(x){return Math.exp(sg*x);},C.mut,1.2,0.6);U.plotf(D,A,function(x){return -Math.exp(sg*x);},C.mut,1.2,0.6);U.plotf(D,A,function(x){return Math.exp(sg*x)*Math.cos(w*x);},C.m,2.6);});
  U.readout(D,[sg<-0.02?'polos en el semiplano izquierdo: estable':(sg>0.02?'semiplano derecho: inestable':'eje imaginario: oscilación mantenida')],480);}));

/* T3 linealización alrededor de un punto de trabajo */
M.reg('ra-t3',M.traza({title:'Linealización: la recta tangente en el punto de trabajo',H:560,dur:16,x0:0.3,x1:9.5,tangent:true,ax:{xr:[0,10],yr:[0,3.6],xt:[2,4,6,8,10],yt:[1,2,3],xd:0,yd:0,xl:'h (m)',yl:'q (m³/s)'},h:300,f:function(h){return Math.sqrt(h);},
 read:function(h){return ['h_{0} = '+nf(h,2)+'    q ≈ √h_{0} + (h − h_{0})/(2√h_{0})','pendiente = '+nf(1/(2*Math.sqrt(h)),3)];},
 caps:[[5,'El caudal de salida de un depósito por un orificio sigue <i>q = k·√h</i>: un modelo no lineal.'],[10,'Alrededor de un punto de trabajo h₀ se sustituye la curva por su tangente: <i>Δq ≈ (dq/dh)<sub>0</sub>·Δh</i>.'],[99,'El modelo lineal solo vale cerca de h₀, y su pendiente (la «ganancia») cambia con el punto de trabajo.']]}));

/* T4 álgebra de bloques */
M.reg('ra-t4',M.pasos({title:'Álgebra de diagramas de bloques',H:560,dur:20,y0:120,lines:[
 {s:'Serie:  G_{1} → G_{2}   ≡   G_{1}·G_{2}'},
 {s:'Paralelo:  G_{1} ± G_{2}   (suman sus salidas)'},
 {s:'Realimentación negativa:  G / (1 + G·H)'},
 {s:'Ejemplo: G_{1} = 10/(s+1),  G_{2} = 1/s,  H = 0,5'},
 {s:'serie: G = 10 / (s(s+1))'},
 {s:'cerrado: M(s) = 10 / (s² + s + 5)',b:true,c:'m'},
 {s:'polos: s = −0,5 ± j2,18'}]}));

/* T5 respuesta al escalón de 2.º orden */
function y2(t,z){var wn=2;if(z<1){var wd=wn*Math.sqrt(1-z*z),ph=Math.acos(z);return 1-Math.exp(-z*wn*t)/Math.sqrt(1-z*z)*Math.sin(wd*t+ph);}if(z===1)return 1-Math.exp(-wn*t)*(1+wn*t);var r=Math.sqrt(z*z-1),a=wn*(z-r),b=wn*(z+r);return 1-(b*Math.exp(-a*t)-a*Math.exp(-b*t))/(b-a);}
M.reg('ra-t5',M.curva({title:'Sistema de 2.º orden: efecto del amortiguamiento',H:560,dur:18,p:[0.1,1.4],ax:{xr:[0,8],yr:[0,1.9],xt:[2,4,6,8],yt:[0.5,1,1.5],xd:0,yd:1,xl:'t (s)',yl:'y(t)'},h:300,
 curvas:[{f:function(x,z){return y2(x,Math.abs(z-1)<1e-3?1.001:z);},c:'m'}],
 extra:function(D,A){D.line(A.X(0),A.Y(1),A.X(8),A.Y(1),C.mut,1,[4,4]);},
 read:function(z){var Mp=z<1?Math.exp(-Math.PI*z/Math.sqrt(1-z*z))*100:0;return ['ζ = '+nf(z,2)+'    ω_{n} = 2 rad/s','sobreoscilación M_{p} = '+nf(Mp,1)+' %    t_{s} ≈ 4/(ζω_{n}) = '+nf(4/(z*2),1)+' s'];},
 caps:[[6,'Un sistema de 2.º orden queda definido por ω<sub>n</sub> (rapidez) y ζ (amortiguamiento).'],[12,'Con ζ < 1 hay sobreoscilación: <i>M<sub>p</sub> = e<sup>−πζ/√(1−ζ²)</sup></i>. Cuanto menor es ζ, más oscila.'],[99,'Con ζ ≥ 1 no hay sobreoscilación, pero la respuesta se vuelve lenta. ζ ≈ 0,7 es un compromiso habitual.']]}));

/* T6 error en régimen permanente de un sistema de tipo 0 */
M.reg('ra-t6',M.curva({title:'Error en régimen permanente: tipo 0',H:560,dur:18,p:[1,20],ax:{xr:[0,3],yr:[0,1.2],xt:[1,2,3],yt:[0.5,1],xd:0,yd:1,xl:'t (s)',yl:'y(t)'},h:300,
 curvas:[{f:function(x,K){return K/(1+K)*(1-Math.exp(-(1+K)*x));},c:'m'}],
 extra:function(D,A,K){D.line(A.X(0),A.Y(1),A.X(3),A.Y(1),C.mut,1.4,[6,4]);var ys=K/(1+K);D.arrow(A.X(2.7),A.Y(1),A.X(2.7),A.Y(ys),C.bad,2);D.arrow(A.X(2.7),A.Y(ys),A.X(2.7),A.Y(1),C.bad,2);D.text('e_{ss}',A.X(2.75),A.Y((1+ys)/2)+5,{it:true,s:16,c:C.bad});},
 read:function(K){return ['K_{p} = '+nf(K,1)+'    e_{ss} = 1/(1 + K_{p}) = '+nf(1/(1+K),3),'(G(s) = K/(s + 1), escalón unitario)'];},
 caps:[[6,'Con una planta sin integradores (tipo 0) y un regulador proporcional, la salida nunca llega exactamente a la referencia escalón.'],[12,'El error final es <i>e<sub>ss</sub> = 1/(1 + K<sub>p</sub>)</i>, con K<sub>p</sub> la ganancia estática del lazo: subir K lo reduce y además acelera la respuesta.'],[99,'Para anularlo del todo hace falta un integrador en el lazo (tipo 1), por ejemplo una acción integral en el regulador.']]}));

/* T7 Routh-Hurwitz */
M.reg('ra-t7',M.base({title:'Criterio de Routh-Hurwitz',H:580,dur:18,caps:[[6,'Para G(s) = K/(s(s+1)(s+2)) en lazo cerrado, la ecuación característica es <i>s³ + 3s² + 2s + K = 0</i>.'],[12,'La tabla de Routh tiene en su primera columna 1, 3, (6 − K)/3 y K. Cada cambio de signo es un polo en el semiplano derecho.'],[99,'Estable si 0 < K < 6. Con K = 6 la fila s¹ se anula: polos en ±j√2 y oscilación mantenida (es la ganancia crítica).']]},
 function(D,t){var K=lerp(0.5,12,U.pp(t,18)),z=rAt(K),cx=200,cy=250,S=36;D.line(cx-170,cy,cx+70,cy,C.ax,1.4);D.line(cx,cy-120,cx,cy+120,C.ax,1.4);D.rect(cx,cy-120,70,240,null,RG(C.bad,.1));
  z.forEach(function(q){D.cross(cx+q[0]*S,cy-q[1]*S,7,q[0]>0.005?C.bad:C.m);});D.text("plano s",cx-165,cy-100,{s:15,c:C.mut});
  var rows=[['s³','1','2'],['s²','3','K'],['s¹','(6−K)/3','0'],['s⁰','K','']],x0=340,y0=150,c1=[1,3,(6-K)/3,K];
  rows.forEach(function(r,i){var y=y0+i*46;D.text(r[0],x0,y,{s:18,c:C.w,it:true});D.text(i===2?nf((6-K)/3,2):(i===3?nf(K,2):r[1]),x0+110,y,{s:18,a:'center',c:c1[i]<0?C.bad:C.m,bold:true});D.text(i===1?nf(K,2):r[2],x0+220,y,{s:18,a:'center',c:C.mut});});
  D.line(x0+40,y0-28,x0+40,y0+160,C.ax,1);var ch=0;for(var i=1;i<4;i++)if(c1[i]*c1[i-1]<0)ch++;
  U.readout(D,['K = '+nf(K,2)+'    cambios de signo: '+ch,ch?ch+' polos inestables':(Math.abs(K-6)<0.15?'límite de estabilidad':'estable')],470);}));

/* T8 lugar de las raíces */
M.reg('ra-t8',M.base({title:'El lugar de las raíces',H:580,dur:18,caps:[[6,'El lugar de las raíces dibuja dónde están los polos en lazo cerrado al subir la ganancia K desde 0. Parten de los polos en lazo abierto (0, −1, −2).'],[12,'Dos ramas se encuentran en el punto de ruptura (s ≈ −0,42) y salen hacia el plano complejo siguiendo asíntotas a ±60°.'],[99,'Cruzan el eje imaginario en ±j√2 con K = 6, como predice Routh. Más allá, el lazo cerrado es inestable.']]},
 function(D,t){var K=Math.pow(seg(t,1,16),2)*40,A=U.axes(D,{xr:[-3.5,1.5],yr:[-3,3],xt:[-3,-2,-1,1],yt:[-2,-1,1,2],xd:0,yd:0,xl:'Re',yl:'Im'},{x:80,y:90,w:480,h:330,grid:true});
  D.rect(A.X(0),A.Y(3),A.X(1.5)-A.X(0),A.Y(-3)-A.Y(3),null,RG(C.bad,.08));
  for(var b=0;b<3;b++){var p=[];LOC.forEach(function(L){p.push([A.X(L[1][b][0]),A.Y(L[1][b][1])]);});U.clipA(D,A,function(){D.path(p,C.mut,1.4,null,0.6);});}
  [0,-1,-2].forEach(function(x){D.cross(A.X(x),A.Y(0),7,C.f);});var z=rAt(K);z.forEach(function(q){if(Math.abs(q[1])<3.2&&q[0]>-3.6)D.dot(A.X(q[0]),A.Y(q[1]),7,q[0]>0.005?C.bad:C.m);});
  D.dot(A.X(0),A.Y(Math.sqrt(2)),4,C.hl);D.text('j√2',A.X(0)+8,A.Y(Math.sqrt(2))-6,{s:15,c:C.hl});
  U.readout(D,['K = '+nf(K,2)+(K>6?'   → inestable':K>0.385?'   → polos complejos':'   → polos reales')],490);}));

/* T9 compensador de adelanto de fase */
function ph9(x,a){var w=Math.pow(10,x),T=1/Math.sqrt(a);return (Math.atan(a*T*w)-Math.atan(T*w))*180/Math.PI;}
M.reg('ra-t9',M.curva({title:'Compensador de adelanto: la fase que añade',H:560,dur:18,p:[1.5,20],ax:{xr:[-2,2],yr:[0,70],xt:[-2,-1,0,1,2],yt:[20,40,60],xf:function(v){return '10'+['⁻²','⁻¹','⁰','¹','²'][v+2];},yd:0,xl:'ω·T√α',yl:'φ (°)'},h:300,
 curvas:[{f:function(x,a){return ph9(x,a);},c:'m'}],
 extra:function(D,A,a){var fm=Math.asin((a-1)/(a+1))*180/Math.PI;D.line(A.X(0),A.Y(0),A.X(0),A.Y(fm),C.hl,1.6,[4,3]);D.dot(A.X(0),A.Y(fm),6,C.hl);},
 read:function(a){return ['C(s) = (1 + αTs)/(1 + Ts)    α = '+nf(a,1),'φ_{máx} = arcsen((α−1)/(α+1)) = '+nf(Math.asin((a-1)/(a+1))*180/Math.PI,1)+'°  en ω = 1/(T√α)'];},
 caps:[[6,'Un compensador de adelanto tiene un cero antes que el polo: en la banda entre ambos añade fase positiva al lazo.'],[12,'El máximo de fase está en la media geométrica de las dos esquinas y vale <i>arcsen((α−1)/(α+1))</i>.'],[99,'Se coloca ese máximo en la nueva frecuencia de cruce para ganar margen de fase. Con α muy grande se gana poco más y se amplifica mucho el ruido.']]}));
})();
