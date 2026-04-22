# ARA Studio Website — 創作計畫書
**The Winning Hand（致勝牌局）**
> 最後更新：2026-04-22

---

## 技術架構決策

| 項目 | 選擇 | 理由 |
|------|------|------|
| 框架 | **React 18 + Vite 5** | 卡牌是高度重複 UI，Component 結構清楚；未來由 Claude 協助更新內容時容易定位 |
| 動畫引擎 | **GSAP + ScrollTrigger + @gsap/react** | Scroll-driven 動畫首選；`useGSAP` hook 與 React ref 無縫整合 |
| 卡牌互動 | CSS 3D Transform + GSAP | 翻牌、扇形展開、旋轉效果 |
| 字型 | **Bebas Neue**（標題）+ **Cormorant Garamond**（內文）| 已透過 Google Fonts 引入 index.html |
| 未來擴充 | Three.js（選配） | 若需要 3D 牌桌場景時加入 |
| RWD | CSS Grid + Flexbox | 先做 Desktop，再適配 Mobile |

### 已確認的 CSS 變數（src/index.css）
```
--color-black:  #0A0A0A
--color-red:    #CC0000
--color-white:  #FFFFFF
--color-gold:   #C9A84C
--font-heading: 'Bebas Neue'
--font-body:    'Cormorant Garamond'
--ease-main:    cubic-bezier(0.76, 0, 0.24, 1)
--radius-card:  12px
```

### 專案結構（src/）
```
src/
├── main.jsx
├── App.jsx              ← loaded state 控制 Loader / 主內容
├── index.css            ← 全站設計系統
├── assets/logo.png      ← 初版 logo（白色顯示於深色背景）
└── components/
    ├── Loader/          ← ✅ 完成
    ├── Deal/            ← ✅ 完成
    ├── Suits/           ← ⬜
    ├── Spread/          ← ⬜
    ├── RoyalFlush/      ← ⬜
    └── AllIn/           ← ⬜
```

---

## 視覺設計系統

### 色彩
```
主色：#0A0A0A（深黑）
強調：#CC0000（深紅）
輔助：#FFFFFF（白）
金屬：#C9A84C（金，選配用於 Ace 元素）
```

### 設計原則
- **ROUND 優先**：所有元素盡量用圓角、圓形、弧形收邊
- **Mafia / Film Noir 氣氛**：高對比、戲劇性打光、電影感排版
- **一致 Transition**：全站使用同一套 ease curve（建議 `power3.inOut`）
- **卡牌風格**：與 ARA Logo 一致，花色圖案需客製化設計

---

## 整體流程圖

```
Loading（入座）
    ↓
Scene 1：THE DEAL（發牌）← Landing Page
    ↓ [Scroll]
Scene 2：THE SUITS（花色）← 品牌故事 + 服務
    ↓ [Scroll]
Scene 3：THE SPREAD（攤牌）← 作品集 [橫向卷軸]
    ↓ [Scroll]
Scene 4：THE ROYAL FLUSH（同花大順）← 團隊成員
    ↓ [Scroll]
Scene 5：ALL IN（全下）← 聯絡我們
```

---

## Scene 製作計畫

### ✅ 製作優先順序
1. **技術骨架 + 設計系統** ✅ 完成（2026-04-22）
2. **Scene 0：Loader** ✅ 完成（2026-04-22）
3. **Scene 1：The DEAL** ✅ 完成（2026-04-22）
4. Scene 2：The SUITS
4. Scene 3：The SPREAD
5. Scene 4：The Royal Flush
6. Scene 5：ALL IN
7. RWD Mobile 適配
8. 素材替換（Logo 正式版、成員照片、作品圖）

---

### Scene 0：Loading Page（入座）
**主題：** 王牌入座，戲劇性電影式登場

**視覺：**
- 全黑畫面，單一聚光燈從上方打下
- 一張椅子在燈光中心
- 文字淡入：`"THE WINNING HAND"` 或 `"王牌入座..."`

**動畫流程：**
1. 黑屏 → 聚光燈漸亮
2. 品牌名稱/Logo 淡入
3. Loading 完成 → 電影式切換至 Scene 1

**素材需求：** Logo（已有初版）、字型

**狀態：** ✅ 完成（2026-04-22）
- 聚光燈（radial-gradient）從暗到亮
- Logo 白色淡入（filter invert）
- 「王牌入座」+ "The Winning Hand" 文字依序出現
- 動畫結束後 Loader 自動 `display:none`，主內容淡入

---

### Scene 1：The DEAL（發牌 — Landing Page）
**主題：** 牌局開始，莊家發牌

**視覺：**
- 俯視角圓形牌桌（深綠 or 深黑桌面）
- 桌上出現四堆牌（一堆五張）從中心往四個方向滑出
- 文字：**"PICK ONE"**

**動畫流程：**
1. 圓形牌桌從中心縮放出現
2. 四堆牌從莊家位置（螢幕上方）飛出至四個方位
3. 使用者 Hover 牌堆 → 頂牌微微抬起，浮現不同 slogan 文字
4. 點選一堆 → 該堆旋轉飛至螢幕下方（我們的位置）
5. Transition → 進入 Scene 2

**四堆牌 Slogan（草稿，待確認）：**
- ♠ 黑桃：`"We Engineer the Impossible"`
- ♥ 紅心：`"We Feel What Others Code"`
- ♦ 方塊：`"We Create What Others Imagine"`
- ♣ 梅花：`"We Play a Different Game"`

**素材需求：** 卡牌牌背設計、牌桌設計

**狀態：** ✅ 完成 v2（2026-04-23）
- 滿版黑紅牌桌（110vw 圓形，四角露弧，上下被切）
- 黑紅白配色：深紅 radial-gradient 桌面 + 紅色邊框卡牌
- ARA Logo 居中半透明水印
- 全站 Header：固定頂部，"ARA STUDIO" + 5 個場景導覽連結
- 發牌動畫：20 張牌從 dealer 位置輪流飛向四堆（每堆 5 張，round-robin）
- 發牌完成後 deck 自動淡出
- Hover：頂牌上浮 + slogan 文字顯現
- Click：整個牌桌 GSAP 旋轉（旋轉角度依選擇的牌堆計算）→ 轉場至 Scene 2
- Mafia 排版：底右 "PICK / ONE"（紅字）、底左品牌標語

---

### Scene 2：The SUITS（花色 — 品牌 + 服務）
**主題：** 秀手牌（雜牌），揭示品牌核心

**視覺：**
- 五張牌從手中展開（扇形）
- 各牌有花色標示與對應內容

**五張牌對應：**
| 牌 | 花色 | 代表 |
|----|------|------|
| JOKER | 🃏 | 品牌故事 + 核心主張 |
| Card 1 | ♠ 黑桃 | 互動裝置 Interactive Installation |
| Card 2 | ♥ 紅心 | 軟體開發 Software Development |
| Card 3 | ♦ 方塊 | 遊戲開發 Game Development |
| Card 4 | ♣ 梅花 | 藝術裝置 Art Installation |

**動畫流程：**
1. Scroll → 五張牌從下方飛入，扇形展開
2. 每張牌 Hover → 放大、顯示詳細內容
3. JOKER 牌點開 → 品牌故事全文展開

**待討論：** 黑桃是否要留給最強服務（與 Scene 4 Ace 牌連動）

**素材需求：** 各花色客製牌面設計

**狀態：** ⬜ 待製作

---

### Scene 3：The SPREAD（攤牌 — 作品集）
**主題：** 攤開牌堆，展示所有作品

**視覺：**
- 從直向卷軸**轉為橫向卷軸**
- 多張牌（最多約 10-12 張）扇形或弧形排列展開
- 每張牌 = 一件作品

**動畫流程：**
1. Scroll 觸發軸向切換（直→橫）
2. 牌堆動畫：從整疊牌變成扇形攤開（全部顯示，即使無作品內容也保留佔位）
3. Hover 牌面 → 翻牌顯示作品縮圖 + 標題
4. 點選 → Modal 或導向作品獨立頁面
5. 橫向卷軸結束 → 切回直向進入 Scene 4

**作品佔位規劃（10 張 + 2 張 buffer）：**
- 實際作品：依素材填入
- 空牌：`"Coming Soon"` 牌背，保持視覺完整

**素材需求：** 作品截圖/圖片、作品標題與說明

**狀態：** ⬜ 待製作

---

### Scene 4：The Royal Flush（同花大順 — 團隊成員）
**主題：** 神之一手，秀出王牌

**視覺：**
- 先蓋回手牌（牌背朝上）
- 魔術翻牌 → 揭示 Royal Flush（A K Q J 10，全為黑桃）
- 每張牌 = 一位團隊成員

**動畫流程：**
1. Scroll → 手牌蓋回（flip to back）
2. 戲劇性停頓（燈光效果）
3. 牌從左至右依序翻開 → 每張顯示成員人像 + 名稱 + 職稱 + 專長
4. 點選牌 → 展開更多個人介紹

**成員卡設計：**
- 牌面上方：花色 + 牌值（A/K/Q/J/10）
- 中間：成員人像（插圖或照片）
- 下方：姓名、職稱、技能標籤

**待討論：** 新增成員時 → 設計上可做成「出千」（多出幾張牌的 easter egg 效果）

**素材需求：** 成員照片或插圖、個人資料

**狀態：** ⬜ 待製作

---

### Scene 5：ALL IN（全下 — 聯絡我們）
**主題：** 全押在我們身上

**視覺：**
- 大面積黑底 + 紅色強調文字
- 籌碼推入動畫
- 主文字：`"ALL IN"` 大字
- 副文字：`"Bold enough to talk? Let's go."`
- CTA 按鈕：`"LET'S TALK"`

**動畫流程：**
1. Scroll → 籌碼從底部推上來
2. `"ALL IN"` 文字強烈打入
3. 聯絡表單或 Email / 社群連結展開

**聯絡資訊（待填入）：**
- Email
- Instagram / Behance / GitHub（待確認）
- 聯絡表單（選配）

**素材需求：** 聯絡方式資訊

**狀態：** ⬜ 待製作

---

## 素材清單

| 素材 | 狀態 | 備註 |
|------|------|------|
| Logo | 🟡 初版雛形 | 需確認最終版 |
| 字型 | ✅ 已設定 | Bebas Neue + Cormorant Garamond（Google Fonts）|
| 卡牌牌背設計 | ⬜ 未製作 | 需與 Logo 風格一致 |
| 花色客製圖案 | ⬜ 未製作 | ♠♥♦♣ 各一款 |
| JOKER 牌設計 | ⬜ 未製作 | 品牌吉祥物概念 |
| 作品圖片 | ⬜ 待提供 | 預計 10 件以內 |
| 成員照片/插圖 | ⬜ 未製作 | 5 位成員 |
| 聯絡資訊 | ⬜ 待確認 | Email、社群帳號 |

---

## 待討論事項

- [ ] 四堆牌的 Slogan 文字確認
- [ ] 黑桃是否為最強服務（與 Scene 4 連動設計）
- [ ] 團隊成員人數確認（5 人？）
- [ ] 作品集件數與內容
- [ ] 聯絡頁面是否需要表單，還是純導向 Email/社群
- [ ] Logo 最終確認後整合進設計系統
- [ ] 字型選擇確認

---

## 開發紀錄

| 日期 | 進度 |
|------|------|
| 2026-04-22 | 企畫書閱讀完成，創作計畫書建立，技術架構確認（改為 React + Vite）|
| 2026-04-22 | React + Vite 專案初始化，設計系統建立，Loader Scene 0 完成並驗證 |
| 2026-04-22 | Scene 1 The DEAL 完成：圓形牌桌、四堆牌動畫、Hover slogan、Click 選牌轉場 |
| 2026-04-23 | Scene 1 完整重製：滿版黑紅牌桌、發牌動畫、牌桌旋轉、Mafia 排版、全站 Header |
