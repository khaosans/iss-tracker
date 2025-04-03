import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useTextureLoader from '../useTextureLoader';

// Mock THREE
vi.mock('three', () => ({
  TextureLoader: class {
    load(url: string, onLoad: Function) {
      setTimeout(() => {
        onLoad({ 
          isTexture: true,
          dispose: vi.fn()
        });
      }, 0);
    }
  },
  Texture: class {
    dispose() {}
  }
}));

describe('useTextureLoader Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null texture and error', () => {
    const { result } = renderHook(() => useTextureLoader(null));
    expect(result.current.texture).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should load texture successfully', async () => {
    const { result } = renderHook(() => useTextureLoader('valid-url.jpg'));
    
    await waitFor(() => {
      expect(result.current.texture).toBeTruthy();
    });
    
    expect(result.current.error).toBeNull();
  });
});
