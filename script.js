// script.js 〜 夢日記メーカー 完全無欠最終版 〜

const downloadBtn = document.getElementById("download-image");
const shareBtn = document.getElementById("share-button");
const generateBtn = document.getElementById("generate-image");
const preview = document.getElementById("preview");
const dreamCard = document.getElementById("dreamCard");

let currentOverlay = null; // 後で削除するため保持

// リアルタイムプレビュー（入力中もすぐ反映）
function updatePreview() {
  const title = document.getElementById("dream-title").value || "タイトルがここに表示されます";
  const content = document.getElementById("dream-content").value || "夢の内容がここに表示されます";
  const mood = document.getElementById("dream-mood").value || "ここに気分が表示されます";

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

// 画像生成メイン処理
generateBtn.addEventListener("click", async () => {
  console.log("画像生成ボタン押された！");

  const title = document.getElementById("dream-title").value || "タイトル未入力";
  const content = document.getElementById("dream-content").value || "夢の内容がまだだよ";
  const mood = document.getElementById("dream-mood").value || "未記入";
  const theme = document.querySelector('input[name="theme"]:checked')?.value || "theme1";
  const date = new Date().toLocaleDateString("ja-JP");

  // プレビューに反映
  document.getElementById("preview-title").textContent = title;
  document.getElementById("preview-content").innerHTML = content.replace(/\n/g, '<br>');
  document.getElementById("preview-mood").textContent = `気分：${mood}`;
  dreamCard.className = `dream-card ${theme}`;

  // 既存のオーバーレイがあれば削除
  if (currentOverlay && dreamCard.contains(currentOverlay)) {
    dreamCard.removeChild(currentOverlay);
  }

  // 日付＋タイトルオーバーレイ作成（みつきの可愛い仕様そのまま！）
  currentOverlay = document.createElement("div");
  currentOverlay.style.position = "absolute";
  currentOverlay.style.top = "10px";
  currentOverlay.style.left = "10px";
  currentOverlay.style.padding = "4px 12px";
  currentOverlay.style.background = "rgba(255, 255, 255, 0.85)";
  currentOverlay.style.borderRadius = "12px";
  currentOverlay.style.fontSize = "15px";
  currentOverlay.style.color = "#7d3747";
  currentOverlay.style.fontWeight = "bold";
  currentOverlay.style.zIndex = "100";
  currentOverlay.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
  currentOverlay.textContent = `${date} - ${title}`;
  dreamCard.appendChild(currentOverlay);

  // 少し待ってからキャプチャ（フォント・レイアウト完全に反映させるため）
  await new Promise(resolve => setTimeout(resolve, 300));

  // ★★★ ここが最強ポイント！長文完全対応＋高解像度 ★★★
  const canvas = await html2canvas(dreamCard, {
    scale: 3,                              // 超くっきり！（iPhone Retinaでもバッチリ）
    useCORS: true,
    backgroundColor: null,                 // 透明背景キープ
    logging: false,
    width: dreamCard.scrollWidth,          // 横幅ぴったり
    height: dreamCard.scrollHeight,        // ← これで長文でも絶対切れない！
    windowWidth: dreamCard.scrollWidth,
    windowHeight: dreamCard.scrollHeight,
    scrollX: 0,
    scrollY: 0,
    onclone: (clonedDoc) => {
      // クローン内でもオーバーレイが見えるようにする
      const clonedCard = clonedDoc.getElementById("dreamCard");
      clonedCard.style.transform = "none";
      clonedCard.style.overflow = "visible";
    }
  });

  const imgData = canvas.toDataURL("image/png");

  // プレビューエリアを一旦クリア
  preview.innerHTML = "";

  // 生成した画像を表示
  const img = new Image();
  img.src = imgData;
  img.alt = "夢日記カード";
  img.style.maxWidth = "100%";
  img.style.borderRadius = "12px";
  img.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  preview.appendChild(img);

  // iPhone用メッセージ
  const note = document.createElement("p");
  note.textContent = "※iPhoneの方はこの画像を長押しで保存してね♡";
  note.style.fontSize = "0.9em";
  note.style.color = "#888";
  note.style.marginTop = "10px";
  preview.appendChild(note);

  // ボタン表示＆機能付与
  downloadBtn.style.display = "inline-block";
  shareBtn.style.display = "inline-block";
  generateBtn.textContent = "作り直す";

  downloadBtn.onclick = () => {
    const a = document.createElement("a");
    a.href = imgData;
    a.download = `夢日記_${date}_${title || "ゆめかわ"}.png`;
    a.click();
  };

  shareBtn.onclick = async () => {
    try {
      const blob = await (await fetch(imgData)).blob();
      const file = new File([blob], "夢日記.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "今日の夢日記♡",
          text: "作ってみたよ〜🌙"
        });
      } else {
        throw new Error("共有非対応");
      }
    } catch (e) {
      alert("共有できない端末みたい…でも画像はもうできてるから長押し保存してね！💕");
    }
  };

  // オーバーレイ削除（キャプチャ終わったからもういらない）
  if (currentOverlay && dreamCard.contains(currentOverlay)) {
    dreamCard.removeChild(currentOverlay);
  }
});

// 初期表示
updatePreview();