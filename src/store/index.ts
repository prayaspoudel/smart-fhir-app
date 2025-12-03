/**
 * Redux Store Configuration
 *
 * Configures Redux Toolkit store with:
 * - Typed hooks
 * - Middleware (including thunk for async actions)
 * - State persistence (optional)
 * - Dev tools integration
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import authReducer from './slices/authSlice';
import providersReducer from './slices/providersSlice';
import recordsReducer from './slices/recordsSlice';
import uiReducer from './slices/uiSlice';

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  providers: providersReducer,
  records: recordsReducer,
  ui: uiReducer,
});

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      // Disable serializable check for non-serializable values if needed
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/sessionWarning', 'auth/sessionExpired'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.sessionTimeout'],
      },
    }),
  devTools: __DEV__,
});

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
