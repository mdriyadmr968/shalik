/**
 * Pure TypeScript SHA-256 implementation to guarantee 100% offline security
 * across all environments (React Native, Web, and Node.js) without external native bindings.
 */
export class PinHasher {
  private static readonly SALT = 'shalik_offline_salt_v1_';

  public static hashPin(pin: string): string {
    const salted = `${this.SALT}${pin.trim()}`;
    return this.sha256(salted);
  }

  public static verifyPin(pin: string, expectedHash: string): boolean {
    const computed = this.hashPin(pin);
    return computed === expectedHash;
  }

  public static isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/[\s-+]/g, '').replace(/^88/, '');
    // BD standard format: 013, 014, 015, 016, 017, 018, 019 followed by 8 digits
    return /^(01[3-9]\d{8})$/.test(cleaned);
  }

  public static isValidPin(pin: string): boolean {
    return /^\d{4}$/.test(pin.trim());
  }

  private static sha256(ascii: string): string {
    function rightRotate(value: number, amount: number) {
      return (value >>> amount) | (value << (32 - amount));
    }

    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    let i: number, j: number;
    let result = '';

    const words: number[] = [];
    const asciiBitLength = ascii.length * 8;

    let hash: number[] = [];
    const k: number[] = [];
    let primeCounter = 0;

    const isPrime = (n: number) => {
      for (let factor = 2; factor * factor <= n; factor++) {
        if (n % factor === 0) return false;
      }
      return true;
    };

    for (let candidate = 2; primeCounter < 64; candidate++) {
      if (isPrime(candidate)) {
        if (primeCounter < 8) {
          hash[primeCounter] = (mathPow(candidate, 1 / 2) * maxWord) | 0;
        }
        k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
        primeCounter++;
      }
    }

    words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
    words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

    for (i = 0; i < ascii.length; i++) {
      words[i >> 2] |= ascii.charCodeAt(i) << ((3 - (i % 4)) * 8);
    }

    for (j = 0; j < words.length; j += 16) {
      const w = words.slice(j, j + 16);
      const oldHash = hash.slice(0);

      for (i = 0; i < 64; i++) {
        const i2 = i + j;
        const w15 = w[i - 15], w2 = w[i - 2];

        const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
        const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);

        w[i] = i < 16 ? (w[i] || 0) : ((w[i - 16] + s0 + w[i - 7] + s1) | 0);

        const s1Hash = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
        const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
        const temp1 = (hash[7] + s1Hash + ch + k[i] + w[i]) | 0;
        const s0Hash = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
        const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
        const temp2 = (s0Hash + maj) | 0;

        hash = [(temp1 + temp2) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
      }

      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }

    for (i = 0; i < 8; i++) {
      for (j = 3; j >= 0; j--) {
        const b = (hash[i] >> (8 * j)) & 255;
        result += (b < 16 ? '0' : '') + b.toString(16);
      }
    }

    return result;
  }
}
