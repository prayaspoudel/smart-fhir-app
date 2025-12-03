/**
 * useSecureStorage Hook
 *
 * Custom hook for secure storage operations.
 */

import { useState, useCallback } from 'react';
import { secureStorage } from '../infrastructure/storage/SecureStorage';
import { Logger } from '../utils/logger';

interface UseSecureStorageReturn<T> {
  value: T | null;
  isLoading: boolean;
  error: string | null;
  setValue: (newValue: T) => Promise<void>;
  getValue: () => Promise<T | null>;
  removeValue: () => Promise<void>;
}

export function useSecureStorage<T = string>(key: string): UseSecureStorageReturn<T> {
  const [value, setValueState] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getValue = useCallback(async (): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const storedValue = await secureStorage.getJSON<T>(key);
      setValueState(storedValue);
      return storedValue;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get value';
      setError(message);
      Logger.error('SecureStorage get failed', { key, error: err });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  const setValue = useCallback(
    async (newValue: T): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await secureStorage.setJSON(key, newValue);
        setValueState(newValue);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to set value';
        setError(message);
        Logger.error('SecureStorage set failed', { key, error: err });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [key]
  );

  const removeValue = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await secureStorage.delete(key);
      setValueState(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove value';
      setError(message);
      Logger.error('SecureStorage remove failed', { key, error: err });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  return {
    value,
    isLoading,
    error,
    setValue,
    getValue,
    removeValue,
  };
}

export default useSecureStorage;
