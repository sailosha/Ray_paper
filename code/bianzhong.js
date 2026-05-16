// --- 钟 (Zhong) 核心物理数据 ---
const f1 = 321.07; const db1 = 27.90;
const f2 = 661.72; const db2 = 15.46;
const f3 = 1135.49; const db3 = -9.55;
const f4 = 1425.23; const db4 = -5.09;
const f5 = 1636.67; const db5 = -7.70;
const f6 = 1765.88; const db6 = 6.42;

// --- 振幅映射系统 ---
// 修正：使用原生 JS 的 Math.max() 替代 p5 的 max()
function mapAmp(db, scaleFactor) {
  let energy = Math.max(0.5, db + 15); 
  return energy * scaleFactor;
}

// 主干骨架
const a1 = mapAmp(db1, 6.0); 
const a2 = mapAmp(db2, 5.0); 

// 微观质感 (负 dB 值)
const a3 = mapAmp(db3, 0.8); 
const a4 = mapAmp(db4, 0.8); 
const a5 = mapAmp(db5, 0.8); 

// 高频涟漪
const a6 = mapAmp(db6, 2.5); 

let timePhase = 0;

function setup() {
  createCanvas(1000, 1000);
  background(15, 12, 10); 
  smooth();
}

function draw() {
  background(15, 12, 10, 10);
  
  translate(width / 2, height / 2);
  
  stroke(180, 150, 100, 45); 
  strokeWeight(0.7);
  noFill();
  
  beginShape();
  for (let theta = 0; theta < TWO_PI; theta += 0.002) {
    
    let k = 0.015; 
    
    let x = a1 * sin(f1 * k * theta + timePhase)     
          + a3 * sin(f3 * k * theta)                 
          + a5 * sin(f5 * k * theta + timePhase*1.2) 
          + a6 * sin(f6 * k * theta - timePhase);    
          
    let y = a2 * cos(f2 * k * theta)                 
          + a4 * cos(f4 * k * theta - timePhase*0.5) 
          + a6 * cos(f6 * k * theta);                
    
    vertex(x, y);
  }
  endShape();
  
  timePhase += 0.003; 
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('Zhong_Deep_Resonance', 'png');
  }
}