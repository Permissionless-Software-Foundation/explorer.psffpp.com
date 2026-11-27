/**
 *  Helpers for displaying file sizes.
 *
 *  Byte counts are scaled with 1024, which is what users expect from a file
 *  manager (a "KB" is 1024 bytes here, not 1000). Note that the pinning price
 *  is quoted in decimal MB (10^6 bytes) by the file stager, so the two numbers
 *  are intentionally calculated differently - see pin-claim-async.js.
 */

// Return a human readable size, e.g. '374.10 KB'. Non-numeric input (a pin
// record without a fileSize yet) produces the fallback, so it can be rendered
// directly without extra guards.
export const formatFileSize = (bytes, fallback = 'N/A') => {
  if (bytes === null || bytes === undefined) return fallback

  const size = Number(bytes)
  if (!Number.isFinite(size) || size < 0) return fallback

  if (size < 1024) return `${size} B`

  const kb = size / 1024
  if (kb < 1024) return `${kb.toFixed(2)} KB`

  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(2)} MB`

  return `${(mb / 1024).toFixed(2)} GB`
}

// Return the exact byte count with thousands separators, e.g. '383,058 bytes'.
// Shown next to the human readable size, because the pinning price is billed on
// the exact size and rounding can hide a few sats of difference.
export const formatByteCount = (bytes, fallback = 'N/A') => {
  if (bytes === null || bytes === undefined) return fallback

  const size = Number(bytes)
  if (!Number.isFinite(size) || size < 0) return fallback

  return `${size.toLocaleString()} bytes`
}

export default formatFileSize
