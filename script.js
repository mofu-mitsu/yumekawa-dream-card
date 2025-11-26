const downloadBtn = document.getElementById("download-image");
const shareBtn    = document.getElementById("share-button");
const generateBtn = document.getElementById("generate-image");
const preview     = document.getElementById("preview");
const dreamCard   = document.getElementById("dreamCard");

let currentOverlay = null;

// リアルタイムプレビュー
function updatePreview() {
const title   = document.getElementById("dream-title").value || "タイトルがここに表示されます";
const content = document.getElementById("dream-content").value || "夢の内容がここに表示されます";
const mood    = document.getElementById("dream-mood").value || "ここに気分が表示されます";

document.getElementById("preview-title").textContent = title;
document.getElementById("preview-content").innerHTML = content.replace(/\n/g, '<br>');
document.getElementById("preview-mood").textContent = 気分：${mood};
}

// 入力中は常にプレビュー更新
['dream-title', 'dream-content', 'dream-mood'].forEach(id => {
document.getElementById(id).addEventListener('input', updatePreview);
});

// テーマ切り替え
document.querySelectorAll('input[name="theme"]').forEach(radio => {
radio.addEventListener('change', () => {
dreamCard.className = dream-card ${radio.value};
});
});

// 画像生成（作り直し何回でもOK）
generateBtn.addEventListener("click", async () => {
const date = new Date().toLocaleDateString("ja-JP");
// ボタンを即座に「作り直す」に変更（disabledは絶対にかけない！）
generateBtn.textContent = "生成中…";
generateBtn.disabled = true;

const title   = document.getElementById("dream-title").value || "ゆめかわ夢日記";
const content = document.getElementById("dream-content").value || "夢の内容";
const mood    = document.getElementById("dream-mood").value || "ふわふわ";

const checkedTheme = document.querySelector('input[name="theme"]:checked');
const theme   = checkedTheme ? checkedTheme.value : "theme1";

// プレビュー反映
document.getElementById("preview-title").textContent = title;
document.getElementById("preview-content").innerHTML = content.replace(/\n/g, '<br>');
document.getElementById("preview-mood").textContent = 気分：${mood};
dreamCard.className = dream-card ${theme};

// オーバーレイ削除＆再作成
if (currentOverlay) currentOverlay.remove();
currentOverlay = document.createElement("div");
Object.assign(currentOverlay.style, {
position: "absolute", top: "15px", left: "15px",
padding: "8px 16px", background: "rgba(255,255,255,0.92)",
borderRadius: "16px", fontSize: "17px", fontWeight: "bold",
color: "#7d3747", zIndex: 999, boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
});
currentOverlay.textContent = ${date} - ${title};
dreamCard.appendChild(currentOverlay);

// ★★★ ここが最重要！横幅を強制固定して文字が折り返るようにする ★★★
dreamCard.style.width = "420px";           // 固定幅で安定
dreamCard.style.maxWidth = "420px";
dreamCard.style.minWidth = "420px";
dreamCard.style.height = "auto";
dreamCard.style.minHeight = "600px";
dreamCard.style.backgroundRepeat = "repeat-y";
dreamCard.style.backgroundSize = "100% auto";
dreamCard.style.padding = "70px 45px 90px";  // 余白たっぷり
dreamCard.style.boxSizing = "border-box";
dreamCard.style.overflow = "visible";

// レイアウト確定待ち（長文でも安心）
await new Promise(r => setTimeout(r, 500));

// html2canvas 超最終設定
const canvas = await html2canvas(dreamCard, {
scale: 3,
useCORS: true,
backgroundColor: null,
width: 420,                         // 横幅固定で安定！
height: dreamCard.scrollHeight + 400, // 余裕ありすぎ
scrollX: 0,
scrollY: 0,
windowWidth: 420,
onclone: (doc) => {
const card = doc.getElementById("dreamCard");
card.style.width = "420px";
card.style.maxWidth = "420px";
card.style.minWidth = "420px";
card.style.height = "auto";
card.style.backgroundRepeat = "repeat-y";
card.style.backgroundSize = "100% auto";
card.style.padding = "70px 45px 90px";
card.style.boxSizing = "border-box";
}
});

const imgData = canvas.toDataURL("image/png");

// プレビュー表示
preview.innerHTML = <img src="${imgData}" style="max-width:100%; border-radius:18px; box-shadow:0 10px 30px rgba(0,0,0,0.3);"> <p style="font-size:0.9em;color:#888;margin-top:12px;">※iPhoneの方はこの画像を長押しで保存してね♡</p>;

// ボタン復活
downloadBtn.style.display = "inline-block";
shareBtn.style.display = "inline-block";
generateBtn.textContent = "作り直す";
generateBtn.disabled = false;  // ← 絶対死なせない！！

// ダウンロード
downloadBtn.onclick = () => {
const a = document.createElement("a");
a.href = imgData;
a.download = 夢日記_${date}_${title.replace(/[\\/:*?"<>|]/g, '')}.png;
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

// オーバーレイ削除
currentOverlay.remove();
});

// 初期化
updatePreview();
generateBtn.textContent = "画像をつくる";