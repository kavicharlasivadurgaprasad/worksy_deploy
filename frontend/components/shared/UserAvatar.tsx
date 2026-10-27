'use client';

import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  /** Resolved image URL (see resolveAvatarUrl). Empty / null / undefined = the person has no picture. */
  src?: string | null;
  /** Used for the image alt text and the accessible label of the default avatar. */
  name?: string;
  /** Size, shape and border classes, e.g. "w-12 h-12 rounded-2xl border border-stone-200". */
  className?: string;
}

/**
 * A person's saved profile picture, or a neutral default avatar when they have none (or the image
 * cannot be loaded). The default is a plain placeholder icon: no stock photo and no invented identity.
 */
export default function UserAvatar({ src, name, className = 'w-10 h-10 rounded-xl' }: UserAvatarProps) {
  const [failed, setFailed] = useState(false);

  // A new URL (e.g. right after the picture was replaced) gets a fresh chance to load.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name ? `${name}'s profile picture` : 'Profile picture'}
        onError={() => setFailed(true)}
        className={`object-cover shrink-0 ${className}`}
      />
    );
  }

  const defaultBg = /\bbg-/.test(className) ? '' : 'bg-stone-200';
  return (
    <div
      role="img"
      aria-label={name ? `${name} (no profile picture)` : 'No profile picture'}
      className={`flex items-center justify-center shrink-0 overflow-hidden text-stone-500 ${defaultBg} ${className}`}
    >
      <User className="w-1/2 h-1/2" aria-hidden />
    </div>
  );
}
