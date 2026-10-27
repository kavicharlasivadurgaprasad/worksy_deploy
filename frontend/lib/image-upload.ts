/** Rules for booking photos. The backend enforces the same limits again (it never trusts the browser). */
export const MAX_BOOKING_IMAGES = 5;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
/** For the <input accept> attribute (extensions help browsers that report no MIME type). */
export const ACCEPT_ATTR = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

const ACCEPTED_EXT = ['jpg', 'jpeg', 'png', 'webp'];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function hasAllowedType(file: File): boolean {
  if (ACCEPTED_IMAGE_TYPES.includes(file.type)) return true;
  // Some browsers/OSes leave file.type empty: fall back to the extension.
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return !file.type && ACCEPTED_EXT.includes(ext);
}

export interface FileCheckResult {
  accepted: File[];
  errors: string[];
}

/**
 * Checks newly chosen files against the type / size / count rules, given how many images are already
 * selected. Files that pass are returned in `accepted`; every problem gets one readable message.
 */
export function checkImageFiles(newFiles: File[], existing: File[]): FileCheckResult {
  const accepted: File[] = [];
  const errors: string[] = [];
  let slots = MAX_BOOKING_IMAGES - existing.length;
  let overLimit = 0;

  for (const file of newFiles) {
    if (!hasAllowedType(file)) {
      errors.push(`"${file.name}" is not a JPG, PNG or WEBP image.`);
      continue;
    }
    if (file.size === 0) {
      errors.push(`"${file.name}" is empty.`);
      continue;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      errors.push(`"${file.name}" is ${formatFileSize(file.size)} - the limit is 5 MB per image.`);
      continue;
    }
    const duplicate = [...existing, ...accepted].some(
      (f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
    );
    if (duplicate) {
      errors.push(`"${file.name}" is already added.`);
      continue;
    }
    if (slots <= 0) {
      overLimit += 1;
      continue;
    }
    accepted.push(file);
    slots -= 1;
  }

  if (overLimit > 0) {
    errors.push(`You can attach at most ${MAX_BOOKING_IMAGES} photos. ${overLimit} extra file${overLimit > 1 ? 's were' : ' was'} not added.`);
  }
  return { accepted, errors };
}
