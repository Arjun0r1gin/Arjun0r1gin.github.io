export interface OptimizationResult {
  blob: Blob;
  size: number;
  dimensions: string;
  originalSize: number;
  compressionRatio: number;
}

/**
 * Client-side image optimizer.
 * Loads an image file, resizes it if it exceeds max dimensions,
 * compresses it to WebP format, and returns the optimized Blob.
 */
export const optimizeImage = (
  file: File,
  maxDimension = 1600,
  quality = 0.8
): Promise<OptimizationResult> => {
  return new Promise((resolve, reject) => {
    // If file is not an image, reject
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File is not an image'));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to get canvas context'));
        }

        let width = img.width;
        let height = img.height;

        // Proportional resizing if dimensions exceed maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas image to WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas compression failed'));
            }

            const ratio = ((file.size - blob.size) / file.size) * 100;
            resolve({
              blob,
              size: blob.size,
              dimensions: `${width} x ${height}`,
              originalSize: file.size,
              compressionRatio: Math.max(0, parseFloat(ratio.toFixed(1)))
            });
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image element'));
      };
    };

    reader.onerror = () => {
      reject(reader.error);
    };
  });
};
