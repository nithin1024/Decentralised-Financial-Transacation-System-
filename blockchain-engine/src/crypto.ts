import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";

export function sha256Hex(input: string): string {
  return bytesToHex(sha256(new TextEncoder().encode(input)));
}

export function leadingZeros(hex: string): number {
  let count = 0;
  for (const c of hex) {
    if (c === "0") count++;
    else break;
  }
  return count;
}

