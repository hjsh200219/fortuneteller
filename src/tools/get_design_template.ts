/**
 * 시각화 디자인 킷 반환 도구
 */

import { buildDesignKit } from '../core/design-kit.js';

export function handleGetDesignTemplate(): string {
  return buildDesignKit();
}
