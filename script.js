// script.js ─ 夢日記メーカー 真・最終完全無欠版（2025.11.26 みつき専用） ─

const downloadBtn   = document.getElementById("download-image");
const shareBtn      = document.getElementById("share-button");
const generateBtn   = document.getElementById("generate-image");
const preview       = document.getElementById("preview");
const dreamCard     = document.getElementById("dreamCard");

let currentOverlay = null;
let isGenerated = false; // ← これで「作り直す」ボタンが死なないようにする！

// リアルタイムプレビュー
function updatePreview() {
  const title   = document.getElementById("dream-title").value || "タイトルがここに表示されます";
  const content = document.getElementById("dream-content").value || "夢の内容がここに表示されます";
  const mood    = document.getElementById("dream-mood").value || "ここに気分が表示されます";

  document.getElementById("preview-title").textContent = title;
  document.getElementById("preview-content").innerHTML = content.replace(/\n/g, '<br>');
  document.getElementById("preview-mood").textContent = `気分：${mood}`;
}
['dream-title', 'dream-content', 'dream-mood'].forEach(id => {
  document.getElementById(id).addEventListener('input', updatePreview);
});

// テーマ切り替え
document.querySelectorAll('input[name="theme"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const theme = radio.value;
    dreamCard.className = `dream-card ${theme}`;
  });
});

// メイン画像生成（作り直しも完全に動くように改良済み！）
generateBtn.addEventListener("click", async () => {
  console.log("画像生成／作り直し 実行！");

  const title   = document.getElementById("dream-title").value || "ゆめかわ夢日記";
  const content = document.getElementById("dream-content").value || "夢の内容がまだだよ";
  const mood    = document.getElementById("dream-mood").value || "ふわふわ";
  const theme   = document.querySelector('input[name="theme"]:checked')?.value || "theme1";
  const date    = new Date().toLocaleDateString("ja-JP");

  // プレビューに即反映
  document.getElementById("preview-title").textContent = title;
  document.getElementById("preview-content").innerHTML = content.replace(/\n/g, '<br>');
  document.getElementById("preview-mood").textContent = `気分：${mood}`;
  dreamCard.className = `dream-card ${theme}`;

  // 古いオーバーレイ削除
  if (currentOverlay && dreamCard.contains(currentOverlay)) {
    dreamCard.removeChild(currentOverlay);
  }

  // 日付オーバーレイ再作成
  currentOverlay = document.createElement("div");
  Object.assign(currentOverlay.style, {
    position: "absolute",
    top: "12px",
    left: "12px",
    padding: "6px 14px",
    background: "rgba(255,255,255,0.9)",
    borderRadius: "14px",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#7d3747",
    zIndex: "999",
    boxShadow: "0 3px 10px rgba(0,0,0,0.2)"
  });
  currentOverlay.textContent = `${date} - ${title}`;
  dreamCard.appendChild(currentOverlay);

  // 背景を縦リピート強制＋高さ自動伸長
  dreamCard.style.backgroundRepeat = "repeat-y";
  dreamCard.style.backgroundSize = "100% auto";
  dreamCard.style.height = "auto";
  dreamCard.style.minHeight = "600px";
  dreamCard.style.overflow = "visible";

  // レイアウト確定待ち
  await new Promise(r => setTimeout(r, 350));

  // ★★★ 最強html2canvas設定（長文＋背景リピート完全対応）★★★
  const canvas = await html2canvas(dreamCard, {
    scale: 3,
    useCORS: true,
    backgroundColor: null,
    logging: false,
    width: dreamCard.scrollWidth,
    height: dreamCard.scrollHeight + 300, // 保険で余裕持たせる
    scrollX: 0,
    scrollY: -window.scrollY,
    onclone: (clonedDoc) => {
      const card = clonedDoc.getElementById("dreamCard");
      card.style.backgroundRepeat = "repeat-y";
      card.style.backgroundSize = "100% auto";
      card.style.height = "auto";
      card.style.minHeight = "600px";
      card.style.overflow = "visible";
      card.style.transform = "none";
    }
  });

  const imgData = canvas.toDataURL("image/png");

  // プレビューエリアクリアして最新画像表示
  preview.innerHTML = "";
  const img = new Image();
  img.src = imgData;
  img.style.cssText = "max-width:100%; border-radius:16px; box-shadow:0 8px 25px rgba(0,0,0,0.2);";
  preview.appendChild(img);

  // iPhoneメッセージ
  const note = document.createElement("p");
  note.textContent = "※iPhoneの方はこの画像を長押しで保存してね♡";
  note.style.cssText = "font-size:0.9em; color:#888; margin-top:12px;";
  preview.appendChild(note);

  // ボタン常に有効＋作り直し対応
  downloadBtn.style.display = "inline-block";
  shareBtn.style.display = "inline-block";
  generateBtn.textContent = "作り直す";
  generateBtn.disabled = false; // ← これで絶対死ななくなる！

  // ダウンロード
  downloadBtn.onclick = () => {
    const a = document.createElement("a");
    a.href = imgData;
    a.download = `夢日記_${date}_${title.replace(/[\/\\?%*:|"<>]/g, '')}.png`;
    a.click();
  };

  // 共有
  shareBtn.onclick = async () => {
    try {
      const blob = await (await fetch(imgData)).blob();
      const file = new File([blob], "夢日記.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "今日の夢日記♡", text: "みりんてゃの夢だよ〜🌙" });
      } else { throw 0; }
    } catch {
      alert("共有できない端末だけど画像はもうできてるよ！長押しで保存してね♡");
    }
  };

  // オーバーレイ削除（キャプチャ終わった）
  if (currentOverlay && dreamCard.contains(currentOverlay)) {
    dreamCard.removeChild(currentOverlay);
  }

  isGenerated = true;
});

// ページ読み込み時に初期プレビュー
updatePreview();