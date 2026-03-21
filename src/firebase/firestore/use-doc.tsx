"use client";
    
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import {
  DocumentReference,
  getDoc,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type WithId<T> = T & { id: string };

export interface UseDocResult<T> {
  data: WithId<T> | null; 
  isLoading: boolean;       
  error: FirestoreError | Error | null; 
}

export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  const swrKey = memoizedDocRef ? memoizedDocRef.path : null;

  const fetcher = async () => {
    if (!memoizedDocRef) return null;
    try {
      const snapshot = await getDoc(memoizedDocRef);
      if (snapshot.exists()) {
        return { ...(snapshot.data() as T), id: snapshot.id };
      }
      return null;
    } catch (err: any) {
      const contextualError = new FirestorePermissionError({
        operation: 'get',
        path: memoizedDocRef.path,
      });

      errorEmitter.emit('permission-error', contextualError);
      throw contextualError;
    }
  };

  const { data, error, isLoading } = useSWR(
    swrKey,
    fetcher,
    {
      revalidateOnFocus: false, // Prevents massive refetches when switching tabs
      dedupingInterval: 10000,
    }
  );

  return { 
    data: data || null, 
    isLoading: isLoading && !data && !error, 
    error: error || null 
  };
}