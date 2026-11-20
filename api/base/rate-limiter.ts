type RateLimitOptions = {
  max: number;
  windowMs: number;
};

class RateLimiter {
  private readonly attempts = new Map<string, number[]>();
  private readonly cleanupTimer: ReturnType<typeof setInterval>;

  constructor(private readonly options: RateLimitOptions) {
    this.cleanupTimer = setInterval(
      () => this.clearExpired(),
      options.windowMs
    );
    this.cleanupTimer.unref?.();
  }

  getRetryAfter(key: string): number {
    const hits = this.getRecentAttempts(key);
    if (hits.length < this.options.max) return 0;

    return Math.max(
      1,
      Math.ceil((hits[0] + this.options.windowMs - Date.now()) / 1000)
    );
  }

  record(key: string): void {
    this.attempts.set(key, [...this.getRecentAttempts(key), Date.now()]);
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  private getRecentAttempts(key: string): number[] {
    const cutoff = Date.now() - this.options.windowMs;
    const recent = (this.attempts.get(key) ?? []).filter(
      (time) => time > cutoff
    );

    if (recent.length) this.attempts.set(key, recent);
    else this.attempts.delete(key);

    return recent;
  }

  private clearExpired(): void {
    for (const key of this.attempts.keys()) this.getRecentAttempts(key);
  }
}

export function createRateLimiter(options: RateLimitOptions) {
  const limiter = new RateLimiter(options);

  return {
    getRetryAfter: (key: string) => limiter.getRetryAfter(key),
    record: (key: string) => limiter.record(key),
    reset: (key: string) => limiter.reset(key),
  };
}
