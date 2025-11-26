// script.js ─ 夢日記メーカー 修正版（みつき修正ver） ─

const downloadBtn = document.getElementById("download-image");
const shareBtn    = document.getElementById("share-button");
const generateBtn = document.getElementById("generate-image");
const preview     = document.getElementById("preview");
const dreamCard   = document.getElementById("dreamCard");

let currentOverlay = null;

// ★重要★ プレビューエリアの初期状態を保存しておく変数
// これがないと「作り直す」ときに復活できないんだ
const initialPreviewHTML = `
  <div class="dream-card theme1" id="dreamCard">
      <div id="preview-title" style="font-size: 1.5rem; font-weight: bold; margin-bottom: 10px; color: #7d3747;">タイトル</div>
      <div id="preview-content">夢の内容</div>
      <div id="preview-mood" style="margin-top: 15px; font-weight: bold; color: #aa6c98;">気分：ふわふわ</div>
  </div>
`;
// ※注意：HTML側の #preview の中身がもっと複雑なら、そこに合わせて書き換えてね！
// 今回はエラーが出ないように、最低限の構造をJavaScript側で復活させる仕組みにするね。

// リアルタイムプレビュー
function updatePreview() {
  // もしプレビューエリアが画像になっちゃってたら、更新しようとするとエラーになるからガードするよ
  const pTitle = document.getElementById("preview-title");
  const pContent = document.getElementById("preview-content");
  const pMood = document.getElementById("preview-mood");

  // 要素が存在する時だけ実行！
  if (pTitle && pContent && pMood) {
    const title   = document.getElementById("dream-title").value || "タイトルがここに表示されます";
    const content = document.getElementById("dream-content").value || "夢の内容がここに表示されます";
    const mood    = document.getElementById("dream-mood").value || "ここに気分が表示されます";

    pTitle.textContent = title;
    pContent.innerHTML = content.replace(/\n/g, '<br>');
    pMood.textContent = `気分：${mood}`;
  }
}

// 入力中は常にプレビュー更新
['dream-title', 'dream-content', 'dream-mood'].forEach(id => {
  document.getElementById(id).addEventListener('input', updatePreview);
});

// テーマ切り替え
document.querySelectorAll('input[name="theme"]').forEach(radio => {
  radio.addEventListener('change', () => {
    // プレビューが画像になってないか確認
    const card = document.getElementById("dreamCard");
    if(card) {
      card.className = `dream-card ${radio.value}`;
    }
  });
});

// 画像生成（作り直し何回でもOK）
generateBtn.addEventListener("click", async () => {
  const date = new Date().toLocaleDateString("ja-JP");
  
  // ボタンを止める
  generateBtn.textContent = "生成中…";
  generateBtn.disabled = true;

  try {
    const title   = document.getElementById("dream-title").value || "ゆめかわ夢日記";
    const content = document.getElementById("dream-content").value || "夢の内容";
    const mood    = document.getElementById("dream-mood").value || "ふわふわ";
    
    const checkedTheme = document.querySelector('input[name="theme"]:checked');
    const theme   = checkedTheme ? checkedTheme.value : "theme1";
    
    // ★★★ ここが修正ポイント！ ★★★
    // もしプレビューが既に「画像」になっていたら、HTMLの構造（dreamCard）を復活させる
    if (!document.getElementById("preview-title")) {
        // プレビューの中身をリセットして、入力できる状態に戻す
        preview.innerHTML = `
          <div class="dream-card ${theme}" id="dreamCard">
            <h2 id="preview-title" style="margin:0 0 10px 0; font-size:1.4rem; color:#7d3747;"></h2>
            <div id="preview-content" style="white-space: pre-wrap;"></div>
            <div id="preview-mood" style="margin-top:auto; font-weight:bold; color:#aa6c98; text-align:right;"></div>
          </div>
        `;
        // リセットした後、dreamCard変数を再取得しないと古いままになっちゃう
    }
    
    // 改めて要素を取得（復活したばかりの要素かもしれないからね）
    const activeCard = document.getElementById("dreamCard");
    const pTitle = document.getElementById("preview-title");
    const pContent = document.getElementById("preview-content");
    const pMood = document.getElementById("preview-mood");

    // 値をセット
    pTitle.textContent = title;
    pContent.innerHTML = content.replace(/\n/g, '<br>');
    pMood.textContent = `気分：${mood}`;
    activeCard.className = `dream-card ${theme}`;

    // オーバーレイ（日付とタイトル）削除＆再作成
    if (currentOverlay) currentOverlay.remove();
    currentOverlay = document.createElement("div");
    Object.assign(currentOverlay.style, {
      position: "absolute", top: "15px", left: "15px",
      padding: "8px 16px", background: "rgba(255,255,255,0.92)",
      borderRadius: "16px", fontSize: "17px", fontWeight: "bold",
      color: "#7d3747", zIndex: 999, boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
    });
    currentOverlay.textContent = `${date} - ${title}`;
    activeCard.appendChild(currentOverlay);

    // ★★★ スタイル固定（撮影用） ★★★
    activeCard.style.width = "420px";
    activeCard.style.maxWidth = "420px";
    activeCard.style.minWidth = "420px";
    // 高さは自動にして、中身に合わせる
    activeCard.style.height = "auto"; 
    activeCard.style.minHeight = "600px";
    activeCard.style.backgroundRepeat = "repeat-y";
    activeCard.style.backgroundSize = "100% auto";
    activeCard.style.padding = "70px 45px 90px";
    activeCard.style.boxSizing = "border-box";
    activeCard.style.overflow = "visible";

    // レイアウト確定待ち
    await new Promise(r => setTimeout(r, 500));

    // html2canvas 実行
    const canvas = await html2canvas(activeCard, {
      scale: 2, // ★修正！3だとデカすぎるので2に変更（これでも十分綺麗だよ！）
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      width: 420,
      height: activeCard.scrollHeight + 50, // 少し余裕を持たせる
      windowWidth: 420,
      onclone: (doc) => {
        const card = doc.getElementById("dreamCard");
        // クローン内でもスタイルを強制
        if(card){
            card.style.width = "420px";
            card.style.height = "auto";
            card.style.backgroundRepeat = "repeat-y";
            card.style.backgroundSize = "100% auto";
            card.style.padding = "70px 45px 90px";
        }
      }
    });

    const imgData = canvas.toDataURL("image/png");

    // プレビューエリアを「生成された画像」に置き換える
    preview.innerHTML = `
      <img src="${imgData}" style="width: 420px; max-width: 100%; border-radius:18px; box-shadow:0 10px 30px rgba(0,0,0,0.3);">
      <p style="font-size:0.9em;color:#888;margin-top:12px;">※iPhoneの方はこの画像を長押しで保存してね♡</p>
    `;

    // ボタン復活
    downloadBtn.style.display = "inline-block";
    shareBtn.style.display = "inline-block";

    // ダウンロード設定
    downloadBtn.onclick = () => {
      const a = document.createElement("a");
      a.href = imgData;
      a.download = `夢日記_${date}_${title.replace(/[\\/:*?"<>|]/g, '')}.png`;
      a.click();
    };

    shareBtn.onclick = async () => {
      try {
        const blob = await (await fetch(imgData)).blob();
        const file = new File([blob], "夢日記.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "今日の夢日記♡", text: "みりんてゃの夢だよ〜🌙" });
        }
      } catch { /* 無視 */ }
    };

    // オーバーレイ削除（元の要素から消す）
    if(currentOverlay) currentOverlay.remove();
    currentOverlay = null;

  } catch (error) {
    console.error("生成エラー:", error);
    alert("画像作成に失敗しちゃった💦 もう一度試してみてね！");
  } finally {
    generateBtn.textContent = "作り直す";
    generateBtn.disabled = false;
  }
});

// 初期化
updatePreview();
generateBtn.textContent = "画像をつくる";