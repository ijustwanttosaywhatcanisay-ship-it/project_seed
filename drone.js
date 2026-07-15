// ==========================================
// 🚀 智慧型 SEED-Drone 科研無人機精靈系統
// ==========================================

// 1. 動態注入精靈專用 CSS 動畫樣式
const droneStyle = document.createElement('style');
droneStyle.innerHTML = `
  /* 無人機平滑過渡與呼吸效果 */
  .drone-sprite {
    position: absolute;
    z-index: 30;
    pointer-events: none;
    transition: left 2.5s cubic-bezier(0.25, 1, 0.5, 1), top 2.5s cubic-bezier(0.25, 1, 0.5, 1);
    filter: drop-shadow(0 10px 15px rgba(0,0,0,0.15));
  }
  @keyframes drone-hover {
    0%, 100% { transform: translateY(0) rotate(-2deg); }
    50% { transform: translateY(-8px) rotate(2deg); }
  }
  .drone-anim {
    animation: drone-hover 3s ease-in-out infinite;
  }
  /* 掃描光束漸變 */
  @keyframes scan-glow {
    0%, 100% { opacity: 0.15; transform: scaleX(0.9); }
    50% { opacity: 0.35; transform: scaleX(1.1); }
  }
  .scan-beam {
    animation: scan-glow 2s ease-in-out infinite;
    transform-origin: top center;
  }
`;
document.head.appendChild(droneStyle);

// 2. 精靈主邏輯類別
class SeedDrone {
  constructor() {
    this.el = null;
    this.currentSlot = -1;
    this.createDrone();
    this.startAI();
  }

  createDrone() {
    // 建立無人機容器
    this.el = document.createElement('div');
    this.el.className = 'drone-sprite drone-anim';
    
    // 繪製高科技精緻 Q 版無人機 SVG
    this.el.innerHTML = `
      <svg width="60" height="70" viewBox="0 0 60 70">
        <!-- 頂部防撞天線 -->
        <line x1="30" y1="15" x2="30" y2="2" stroke="#475569" stroke-width="2"/>
        <circle cx="30" cy="2" r="2.5" fill="#10b981"/>
        
        <!-- 左右旋翼推進器 -->
        <rect x="2" y="22" width="10" height="4" rx="2" fill="#475569"/>
        <rect x="48" y="22" width="10" height="4" rx="2" fill="#475569"/>
        <ellipse cx="7" cy="20" rx="6" ry="1.5" fill="#cbd5e1"/>
        <ellipse cx="53" cy="20" rx="6" ry="1.5" fill="#cbd5e1"/>
        
        <!-- 探照掃描光束 -->
        <polygon points="30,35 15,65 45,65" fill="url(#scanLight)" class="scan-beam" />
        
        <!-- 無人機圓形主體 -->
        <circle cx="30" cy="28" r="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <!-- 科技感綠色發光護甲 -->
        <path d="M 18 20 Q 30 14 42 20" fill="none" stroke="#34d399" stroke-width="2.5"/>
        <!-- 核心藍色發光鏡頭 -->
        <circle cx="30" cy="28" r="7" fill="#0f172a" stroke="#60a5fa" stroke-width="1.5"/>
        <circle cx="32" cy="26" r="2.5" fill="#93c5fd"/>
        
        <!-- 漸變濾鏡定義 -->
        <defs>
          <linearGradient id="scanLight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#34d399" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#34d399" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    `;

    // 掛載至遊玩地圖中
    const camTarget = document.getElementById('camTarget');
    if (camTarget) {
      camTarget.appendChild(this.el);
    }
  }

  startAI() {
    // 每 6 秒鐘，無人機會根據目前設施的工作狀況自動重新選定巡邏點
    setInterval(() => this.updateBehavior(), 6000);
    // 啟動時立刻執行一次
    setTimeout(() => this.updateBehavior(), 500);
  }

  updateBehavior() {
    // 檢查全域的遊戲速度，若暫停則不移動
    if (typeof gameSpeed !== 'undefined' && gameSpeed === 0) return;

    // 1. 尋找目前有人值班（正在生產）的設施 slot 列表
    let activeSlots = [];
    if (typeof SLOTS_COUNT !== 'undefined' && typeof board !== 'undefined') {
      for (let s = 0; s < SLOTS_COUNT; s++) {
        // 確認該位置有房間且有員工值班（排除總部）
        const isRoomActive = board[s].some(room => room.workers && room.workers.length > 0 && room.id !== 'room_hq');
        if (isRoomActive) {
          activeSlots.push(s);
        }
      }
    }

    let targetSlot = -1;
    if (activeSlots.length > 0) {
      // 優先飛往有人值班的隨機工作站進行生態掃描
      targetSlot = activeSlots[Math.floor(Math.random() * activeSlots.length)];
    } else if (typeof SLOTS_COUNT !== 'undefined') {
      // 若大家都閒置，則隨機飛往地圖上的某個格子盤旋 (Idle 巡邏)
      targetSlot = Math.floor(Math.random() * SLOTS_COUNT);
    }

    if (targetSlot !== -1) {
      this.moveToSlot(targetSlot);
    }
  }

  moveToSlot(slotIndex) {
    this.currentSlot = slotIndex;
    
    // 獲取地圖上目標 Slot 的實體 DOM
    const gameBoard = document.getElementById('gameBoard');
    if (!gameBoard) return;
    const slotEl = gameBoard.children[slotIndex];
    if (!slotEl) return;

    // 計算目標座標（將無人機定位於該設施上方）
    // 相對 gameBoard 的 X 座標，加上微調使其居中
    const targetLeft = slotEl.offsetLeft + (slotEl.offsetWidth / 2) - 30;
    
    // 浮動高度：根據該 Slot 疊放的建築層數動態調高，防止穿模
    const roomCount = (typeof board !== 'undefined' && board[slotIndex]) ? board[slotIndex].length : 1;
    const targetTop = -45 - (roomCount * 102); // 疊得越高，無人機飛得越高

    // 套用過渡動畫座標
    this.el.style.left = `${targetLeft}px`;
    this.el.style.top = `${targetTop}px`;
  }
}

// 3. 註冊初始化無人機精靈的全域函數
let gameDrone = null;
window.initDroneSprite = function() {
  if (!gameDrone) {
    gameDrone = new SeedDrone();
  }
};