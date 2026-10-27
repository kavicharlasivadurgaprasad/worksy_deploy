'use client';

import React, { useEffect, useState } from 'react';
import { X, ImageOff } from 'lucide-react';
import { api } from '@/lib/api';
import { formatFileSize } from '@/lib/image-upload';

export interface BookingImageRef {
  id: string;
  fileName: string;
  sizeBytes: number;
  /** API path (under the base URL) of the private image */
  url: string;
}

type Loaded = { id: string; src: string | null };

/**
 * Thumbnails of a booking's photos with click-to-enlarge. The images are private (JWT-protected), so
 * each one is fetched with the user's token and shown through a temporary object URL, which is
 * released when the component unmounts or the image list changes.
 */
export default function BookingImages({ images, className = '' }: { images?: BookingImageRef[]; className?: string }) {
  const [loaded, setLoaded] = useState<Loaded[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!images || images.length === 0) {
      setLoaded([]);
      return;
    }
    let cancelled = false;
    const created: string[] = [];

    Promise.all(
      images.map(async (img): Promise<Loaded> => {
        try {
          const blob = await api.fetchImageBlob(img.url);
          const src = URL.createObjectURL(blob);
          created.push(src);
          return { id: img.id, src };
        } catch {
          return { id: img.id, src: null };
        }
      })
    ).then((result) => {
      if (cancelled) {
        created.forEach((u) => URL.revokeObjectURL(u));
      } else {
        setLoaded(result);
      }
    });

    return () => {
      cancelled = true;
      created.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [images]);

  if (!images || images.length === 0) return null;

  const open = openId ? images.find((i) => i.id === openId) : undefined;
  const openSrc = openId ? loaded.find((l) => l.id === openId)?.src : undefined;

  return (
    <>
      <div className={`grid grid-cols-3 sm:grid-cols-5 gap-2 ${className}`}>
        {images.map((img) => {
          const entry = loaded.find((l) => l.id === img.id);
          return (
            <button
              key={img.id}
              type="button"
              onClick={() => entry?.src && setOpenId(img.id)}
              title={`${img.fileName} (${formatFileSize(img.sizeBytes)})`}
              className="aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100 flex items-center justify-center hover:border-black transition-colors"
            >
              {entry?.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={entry.src} alt={img.fileName} className="w-full h-full object-cover" />
              ) : entry ? (
                <ImageOff size={16} className="text-stone-400" />
              ) : (
                <span className="w-4 h-4 rounded-full border-2 border-stone-300 border-t-stone-600 animate-spin" />
              )}
            </button>
          );
        })}
      </div>

      {open && openSrc && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setOpenId(null)}
          role="dialog"
          aria-label={`Photo preview: ${open.fileName}`}
        >
          <button
            type="button"
            onClick={() => setOpenId(null)}
            aria-label="Close preview"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white text-stone-900"
          >
            <X size={18} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={openSrc}
            alt={open.fileName}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
