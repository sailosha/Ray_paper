// --- 虎音锣 核心物理数据 ---
// 第一谐音 (基频底色)
const f1 = 193.83; 
const db1 = 36.83;

// 第二谐音
const f2 = 380.48; 
const db2 = 29.31;

// 第三谐音 (最高音强，视觉绝对主导)
const f3 = 581.49; 
const db3 = 40.52;

// 第四谐音 (高频毛刺与金属感)
const f4 = 760.96; 
const db4 = 38.04;

// 振幅映射：采用指数级或更大落差的映射，
// 确保最高音强的第三谐音在视觉画面中占据绝对的主导面积
const amp1 = (db1 - 20) * 6;  
const amp2 = (db2 - 20) * 6;  
const amp3 = (db3 - 20) * 8;  // 强化最高音强的视觉权重
const amp4 = (db4 - 20) * 6;  

let timePhase = 0;

function setup() {
  createCanvas(1000, 1000); // 提供更大的画布以展现高频细节
  background(10, 10, 12);
  smooth();
}

function draw() {
  // 极低的背景透明度，拉长残影，模拟金属锣声绵长的混响延音
  background(10, 10, 12, 12);
  
  translate(width / 2, height / 2);
  
  // 色彩设定：虎音锣的金属质感，采用高亮度、偏暖的黄铜/琥珀色
  // 结合加法混合模式 (ADD) 可以让线条密集处产生刺眼的物理高光
  blendMode(ADD);
  stroke(215, 145, 50, 60); 
  strokeWeight(0.6);
  noFill();
  
  beginShape();
  // 因为包含 760Hz 的高频，需要更小的步进值来保证曲线圆滑
  for (let theta = 0; theta < TWO_PI; theta += 0.001) {
    
    // 缩放系数，控制整个图形在画布上的折叠密度
    let k = 0.015; 
    
    // X轴复合：基频(f1)提供宏观宽度，最强谐音(f3)提供密集的内部波浪
    let x = amp1 * sin(f1 * k * theta + timePhase) 
          + amp3 * sin(f3 * k * theta - timePhase * 1.2);
    
    // Y轴复合：第二谐音(f2)提供宏观高度，第四谐音(f4)提供边缘的尖锐转折
    let y = amp2 * cos(f2 * k * theta) 
          + amp4 * cos(f4 * k * theta + timePhase * 0.8);
    
    vertex(x, y);
  }
  endShape();
  
  // 恢复默认混合模式，以免影响背景清除
  blendMode(BLEND);
  
  // 时间流逝，驱动四维干涉图的内部空间解构
  timePhase += 0.006; 
}

// 附加功能：按下 'S' 键，导出当前帧的高清透明 PNG 
// 非常适合直接落版到海报或画册中
function keyPressed() {
  if (key === 's' || key === 'S') {
    saveCanvas('HuYinLuo_Harmonograph', 'png');
  }
}