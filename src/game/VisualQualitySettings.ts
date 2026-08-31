export type VisualQuality = 'high' | 'medium' | 'low';
export type VisualQualityMode = 'auto' | VisualQuality;

const SETTINGS_KEY = 'dorbot.visual-quality.v1';

export function loadVisualQualityMode(): VisualQualityMode {
  try {
    const value = window.localStorage.getItem(SETTINGS_KEY);
    return isVisualQualityMode(value) ? value : 'auto';
  } catch {
    return 'auto';
  }
}

export function saveVisualQualityMode(mode: VisualQualityMode): void {
  try { window.localStorage.setItem(SETTINGS_KEY, mode); } catch { /* optional storage */ }
}

export function isVisualQualityMode(value: unknown): value is VisualQualityMode {
  return value === 'auto' || value === 'high' || value === 'medium' || value === 'low';
}
