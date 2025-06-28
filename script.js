// 要素取得
const downloadBtn = document.getElementById("download-image");
const shareBtn = document.getElementById("share-button");
const generateBtn = document.getElementById("generate-image");
const preview = document.getElementById("preview");
const titleElement = document.getElementById("preview-title");
const contentElement = document.getElementById("preview-content");
const moodElement = document.getElementById("preview-mood");
const dreamCard = document.getElementById("dreamCard");
const actions = document.querySelector(".actions");

console.log("初期化完了:", { downloadBtn, shareBtn, generateBtn, preview, dreamCard });

// 「画像を作る」または「作り直す」ボタン
generateBtn.addEventListener("click", () => {
  console.log("「画像を作る」または「作り直す」ボタンが押された！");

  const title = document.getElementById("dream-title").value || "タイトル未入力";
  const content = document.getElementById("dream-content").value || "夢の内容がまだだよ";
  const mood = document.getElementById("dream-mood").value || "未記入";
  const theme = document.querySelector('input[name="theme"]:checked')?.value || "theme1";
  const date = new Date().toLocaleDateString("ja-JP");

  // 内容反映（改行対応）
  titleElement.textContent = title;
  contentElement.innerHTML = content.replace(/\n/g, '<br>');
  moodElement.textContent = `気分：${mood}`;
  dreamCard.className = `dream-card ${theme}`;

  // オーバーレイ作成
  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.top = "10px";
  overlay.style.left = "10px";
  overlay.style.padding = "4px 10px";
  overlay.style.background = "rgba(255, 255, 255, 0.8)";
  overlay.style.borderRadius = "10px";
  overlay.style.fontSize = "14px";
  overlay.style.color = "#7d3747";
  overlay.style.zIndex = "10";
  overlay.textContent = `${date} - ${title}`;
  dreamCard.appendChild(overlay);

  // キャプチャ前に少し待つ
  setTimeout(() => {
    console.log("キャプチャ前:", { preview, dreamCard });
    // プレビュー内の画像とメッセージだけ削除
    Array.from(preview.children).forEach(child => {
      if (child.tagName === "IMG" || child.tagName === "P") {
        preview.removeChild(child);
      }
    });

    html2canvas(dreamCard, {
      useCORS: true,
      backgroundColor: null,
      scale: 1
    }).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const img = new Image();
      img.src = imgData;
      img.alt = "夢日記画像（長押しで保存してね）";
      img.style.maxWidth = "100%";
      img.style.borderRadius = "10px";

      preview.appendChild(img);

      // iPhone用メッセージ
      const note = document.createElement("p");
      note.textContent = "※iPhoneの方はこの画像を長押しで保存してね";
      note.style.fontSize = "0.9em";
      note.style.color = "#666";
      preview.appendChild(note);

      // ボタンを表示・イベントを設定
      if (downloadBtn) {
        downloadBtn.style.display = "inline-block";
        downloadBtn.onclick = () => {
          const a = document.createElement("a");
          a.href = imgData; // 端末保存用にimgDataを使用
          a.download = `夢日記_${date}.png`;
          a.click();
        };
      }
      if (shareBtn) {
        shareBtn.style.display = "inline-block";
        shareBtn.onclick = async () => {
          try {
            if (navigator.canShare && navigator.canShare({ files: [] })) {
              const blob = dataURItoBlob(imgData);
              const file = new File([blob], "夢日記.png", { type: blob.type });
              await navigator.share({
                files: [file],
                title: "夢日記メーカー",
                text: "今日見た夢だよ🛌🌙"
              });
            } else {
              throw new Error("ファイル共有非対応");
            }
          } catch (e) {
            alert("この端末では共有がサポートされてないみたい…！代わりにリンクをコピーしたよ！");
            navigator.clipboard.writeText(imgData).catch(() => {
              alert("コピーに失敗しちゃった💦");
            });
          }
        };
      }
      generateBtn.textContent = "作り直す";

      // オーバーレイ削除
      if (dreamCard.contains(overlay)) {
        dreamCard.removeChild(overlay);
      }
    }).catch(error => {
      console.error("キャプチャ失敗:", error);
      // 失敗時もボタンを表示
      if (downloadBtn) downloadBtn.style.display = "inline-block";
      if (shareBtn) shareBtn.style.display = "inline-block";
      generateBtn.textContent = "作り直す";
    });

  }, 200);
});

// dataURItoBlob関数（ヘルパー）
function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

// テーマ切り替え
document.querySelectorAll('input[name="theme"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const selectedTheme = document.querySelector('input[name="theme"]:checked')?.value || "theme1";
    if (dreamCard) {
      dreamCard.classList.remove("theme1", "theme2", "theme3", "theme4");
      dreamCard.classList.add(selectedTheme);
    }
  });
});