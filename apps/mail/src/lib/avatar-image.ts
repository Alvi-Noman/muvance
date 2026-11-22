/**
 * Crops a chosen photo to a centred square and shrinks it to 256×256, so profile pictures upload
 * fast and take almost no space. Returns a data URL (WebP, or JPEG where WebP isn't supported).
 */
export async function squareAvatar(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose a picture (JPG, PNG or WebP).');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("That picture couldn't be opened."));
      el.src = url;
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Your browser couldn't resize the picture.");
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      img,
      (img.naturalWidth - side) / 2,
      (img.naturalHeight - side) / 2,
      side,
      side,
      0,
      0,
      256,
      256,
    );
    const webp = canvas.toDataURL('image/webp', 0.86);
    return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.88);
  } finally {
    URL.revokeObjectURL(url);
  }
}
