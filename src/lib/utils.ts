export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getUserId(): string {
  if (typeof window === 'undefined') return 'anonymous';
  let userId = localStorage.getItem('music-app-user-id');
  if (!userId) {
    userId = 'user-' + crypto.randomUUID().slice(0, 8);
    localStorage.setItem('music-app-user-id', userId);
  }
  return userId;
}

export function getStreamUrl(trackId: string): string {
  return `/api/stream-song?id=${trackId}`;
}
