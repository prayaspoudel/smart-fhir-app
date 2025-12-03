/**
 * useNetworkStatus Hook
 *
 * Custom hook for monitoring network connectivity.
 */

import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useAppDispatch } from '../store';
import { setOnline } from '../store/slices/uiSlice';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  isWifi: boolean;
  isCellular: boolean;
  details: NetInfoState['details'];
}

interface UseNetworkStatusReturn {
  status: NetworkStatus;
  refresh: () => Promise<NetworkStatus>;
}

export const useNetworkStatus = (): UseNetworkStatusReturn => {
  const dispatch = useAppDispatch();

  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: null,
    type: null,
    isWifi: false,
    isCellular: false,
    details: null,
  });

  const parseNetInfoState = useCallback((state: NetInfoState): NetworkStatus => {
    return {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      isWifi: state.type === 'wifi',
      isCellular: state.type === 'cellular',
      details: state.details,
    };
  }, []);

  const refresh = useCallback(async (): Promise<NetworkStatus> => {
    const state = await NetInfo.fetch();
    const newStatus = parseNetInfoState(state);
    setStatus(newStatus);
    dispatch(setOnline(newStatus.isConnected));
    return newStatus;
  }, [dispatch, parseNetInfoState]);

  useEffect(() => {
    // Get initial state
    refresh();

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      const newStatus = parseNetInfoState(state);
      setStatus(newStatus);
      dispatch(setOnline(newStatus.isConnected));
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch, parseNetInfoState, refresh]);

  return {
    status,
    refresh,
  };
};

export default useNetworkStatus;
