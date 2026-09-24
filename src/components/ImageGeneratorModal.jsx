import React, { useRef, useEffect } from 'react';
import { Download, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

export default function ImageGeneratorModal({ product, onClose }) {
  const canvasRef = useRef(null);

  // Draw Instagram Stories banner (1080x1920px - 9:16 ratio)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    // Background Gradient (Dark Slate / Emerald theme)
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#022c22');
    grad.addColorStop(0.4, '#064e3b');
    grad.addColorStop(0.8, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative background glow circles
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.35, 450, 0, Math.PI * 2);
    ctx.fill();

    // 1. Top Header Badge
    ctx.fillStyle = '#10b981';
    ctx.roundRect(80, 120, 420, 70, 35);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('⚡ OFERTA RELÂMPAGO', 120, 166);

    // Store badge if present
    if (product.store?.name) {
      ctx.fillStyle = '#f59e0b';
      ctx.roundRect(80, 210, 260, 50, 25);
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`🛒 ${product.store.name}`, 105, 243);
    }

    // 2. Product Image Container Box
    const boxX = 80;
    const boxY = 300;
    const boxWidth = 920;
    const boxHeight = 780;

    ctx.fillStyle = '#ffffff';
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 40);
    ctx.fill();

    // Product Image Render
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = product.imageUrl || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600';
    img.onload = () => {
      const padding = 50;
      const maxW = boxWidth - padding * 2;
      const maxH = boxHeight - padding * 2;
      let drawW = img.width;
      let drawH = img.height;

      const scale = Math.min(maxW / drawW, maxH / drawH);
      drawW *= scale;
      drawH *= scale;

      const imgX = boxX + (boxWidth - drawW) / 2;
      const imgY = boxY + (boxHeight - drawH) / 2;

      ctx.drawImage(img, imgX, imgY, drawW, drawH);

      // Render Text Section
      renderTextAndLinkZone(ctx, width, height);
    };

    img.onerror = () => {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '32px sans-serif';
      ctx.fillText('[Imagem do Produto]', boxX + 300, boxY + 390);
      renderTextAndLinkZone(ctx, width, height);
    };

  }, [product]);

  const renderTextAndLinkZone = (ctx, width, height) => {
    // 3. Product Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';

    const titleText = product.title || 'Nome do Produto';
    const words = titleText.split(' ');
    let line = '';
    let startY = 1140;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 900 && i > 0) {
        ctx.fillText(line, 80, startY);
        line = words[i] + ' ';
        startY += 58;
        if (startY > 1250) break; // max lines
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 80, startY);

    // 4. Prices Section
    const priceY = 1350;

    // Original Price (De:)
    if (product.originalPrice) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '32px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`De: R$ ${product.originalPrice}`, 80, priceY);

      const deMetrics = ctx.measureText(`De: R$ ${product.originalPrice}`);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(75, priceY - 10);
      ctx.lineTo(85 + deMetrics.width, priceY - 10);
      ctx.stroke();
    }

    // Promotional Price (Por:)
    const porX = product.originalPrice ? 380 : 80;
    ctx.fillStyle = '#10b981';
    ctx.font = 'extrabold 64px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`POR: R$ ${product.price || '39,01'}`, porX, priceY + 10);

    // 5. Reserved Bottom Zone for Instagram Link Sticker
    const stickerZoneY = 1520;
    const stickerZoneW = 920;
    const stickerZoneH = 260;

    // Dashed Container for Link Placement
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 12]);
    ctx.roundRect(80, stickerZoneY, stickerZoneW, stickerZoneH, 30);
    ctx.stroke();
    ctx.setLineDash([]); // reset dash

    // Sticker Instruction Text
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('👇 ADICIONE SEU LINK AQUI 👇', 260, stickerZoneY + 110);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Espaço reservado para a figurinha de link no Instagram', 230, stickerZoneY + 170);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `story-instagram-${product.sku || 'oferta'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-600" />
              Banner Instagram Stories
            </h3>
            <p className="text-xs text-gray-500">Tamanho exato 1080x1920px (9:16)</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Display */}
        <div className="bg-slate-950 rounded-2xl p-3 flex flex-col items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full max-w-[280px] h-auto rounded-xl shadow-2xl border border-slate-800"
          />
        </div>

        <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <LinkIcon className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <span>
            Ao postar nos Stories do Instagram, insira a figurinha de <strong>Link</strong> no retângulo tracejado na parte inferior.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            Fechar
          </button>

          <button
            onClick={handleDownload}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Baixar Banner Stories (1080x1920)
          </button>
        </div>

      </div>
    </div>
  );
}
