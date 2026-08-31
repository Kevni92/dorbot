import { loadVisualQualityMode, type VisualQuality, type VisualQualityMode } from './VisualQualitySettings';
export type { VisualQuality, VisualQualityMode } from './VisualQualitySettings';

export class AdaptiveQualityController {
  private smoothedFrameMs = 16.7;
  private lastEvaluationAt = 0;
  private level: VisualQuality = 'high';
  private mode: VisualQualityMode = loadVisualQualityMode();

  constructor() {
    if (this.mode !== 'auto') this.level = this.mode;
  }

  get current(): VisualQuality { return this.level; }
  get currentMode(): VisualQualityMode { return this.mode; }
  get estimatedFps(): number { return 1000 / Math.max(1, this.smoothedFrameMs); }

  setMode(mode: VisualQualityMode): VisualQuality {
    this.mode = mode;
    if (mode !== 'auto') this.level = mode;
    return this.level;
  }

  update(time: number, delta: number): VisualQuality | undefined {
    const frameMs = Math.max(4, Math.min(100, delta || 16.7));
    this.smoothedFrameMs = this.smoothedFrameMs * 0.92 + frameMs * 0.08;

    if (this.mode !== 'auto') return undefined;
    if (time - this.lastEvaluationAt < 3500) return undefined;
    this.lastEvaluationAt = time;

    const fps = this.estimatedFps;
    let next = this.level;

    if (this.level === 'high' && fps < 48) next = 'medium';
    else if (this.level === 'medium' && fps < 34) next = 'low';
    else if (this.level === 'medium' && fps > 56) next = 'high';
    else if (this.level === 'low' && fps > 44) next = 'medium';

    if (next === this.level) return undefined;
    this.level = next;
    return next;
  }
}
