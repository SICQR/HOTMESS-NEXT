// Deterministic points calculation bounded 10..50 based on qrCode hash
export function deterministicPoints(qrCode: string): number {
  let hash = 0;
  for (let i = 0; i < qrCode.length; i++) {
    hash = (hash * 31 + qrCode.charCodeAt(i)) | 0; // 32-bit overflow
  }
  const points = Math.abs(hash % 41) + 10; // 0..40 => 10..50
  return points;
}
