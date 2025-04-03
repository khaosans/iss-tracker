import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

function safeTrim(value: any, fallback: string = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function useTextureLoader(url: string | null) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const textureRef = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    // Clear previous texture
    if (textureRef.current) {
      textureRef.current.dispose();
      textureRef.current = null;
    }

    if (url) {
      const loader = new THREE.TextureLoader();
      loader.load(
        url,
        (loadedTexture) => {
          setTexture(loadedTexture);
          textureRef.current = loadedTexture;
          setError(null); // Clear any previous error
        },
        undefined, // onProgress callback
        (err) => {
          console.error('An error happened during texture loading:', err);
          setError(err);
          setTexture(null);
        }
      );
    } else {
      setTexture(null);
      setError(null); // Clear any previous error
    }

    return () => {
      // Cleanup texture when component unmounts or URL changes
      if (textureRef.current) {
        textureRef.current.dispose();
        textureRef.current = null;
      }
    };
  }, [url]);

  return { texture, error };
}

export default useTextureLoader;
