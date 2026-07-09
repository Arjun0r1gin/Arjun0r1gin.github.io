import React, { useEffect, useState, forwardRef } from 'react';
import { mediaDb } from '../../utils/mediaDb';

interface ResolvedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  srcPath: string;
  fallbackSrc?: string;
}

export const ResolvedImage = forwardRef<HTMLImageElement, ResolvedImageProps>(
  ({ srcPath, fallbackSrc, ...props }, ref) => {
    // Compute initial value synchronously if not database-backed to prevent render delays
    const getInitialSrc = () => {
      if (!srcPath) return fallbackSrc || '';
      if (srcPath.startsWith('db://')) {
        return '';
      }
      return (srcPath.startsWith('/src') && fallbackSrc) ? fallbackSrc : srcPath;
    };

    const [resolvedSrc, setResolvedSrc] = useState<string>(getInitialSrc);

    useEffect(() => {
      if (!srcPath) {
        setResolvedSrc(fallbackSrc || '');
        return;
      }

      if (srcPath.startsWith('db://')) {
        const id = srcPath.slice(5);
        mediaDb.getAll().then((items) => {
          const found = items.find((item) => item.id === id);
          if (found) {
            setResolvedSrc(found.url);
          } else {
            setResolvedSrc(fallbackSrc || '');
          }
        }).catch(() => {
          setResolvedSrc(fallbackSrc || '');
        });
      } else {
        setResolvedSrc(srcPath.startsWith('/src') && fallbackSrc ? fallbackSrc : srcPath);
      }
    }, [srcPath, fallbackSrc]);

    // Use resolved source if loaded, or fallback source immediately to ensure the img element is mounted on render #1
    const displaySrc = resolvedSrc || fallbackSrc;
    if (!displaySrc) return null;

    return <img ref={ref} src={displaySrc} {...props} />;
  }
);

ResolvedImage.displayName = 'ResolvedImage';

export default ResolvedImage;
