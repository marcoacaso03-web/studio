
"use client";

import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import type { TrainingSession, TrainingAttendance, TrainingStatus } from '@/lib/types';

export const trainingRepository = {
  async getAll(userId: string, seasonId: string) {
    const db = getFirestore();
    const sessionsRef = collection(db, 'users', userId, 'trainingSessions');
    const q = query(sessionsRef, where('seasonId', '==', seasonId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TrainingSession));
  },

  async getById(userId: string, sessionId: string) {
    const db = getFirestore();
    const docRef = doc(db, 'users', userId, 'trainingSessions', sessionId);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as TrainingSession : undefined;
  },

  async bulkAdd(sessions: Omit<TrainingSession, 'id'>[], userId: string) {
    const db = getFirestore();
    const batch = writeBatch(db);
    
    sessions.forEach(s => {
      const id = `TR-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const docRef = doc(db, 'users', userId, 'trainingSessions', id);
      batch.set(docRef, { ...s, id });
    });

    await batch.commit();
  },

  async update(userId: string, sessionId: string, updates: Partial<TrainingSession>) {
    const db = getFirestore();
    const docRef = doc(db, 'users', userId, 'trainingSessions', sessionId);
    await updateDoc(docRef, updates);
  },

  async delete(userId: string, sessionId: string) {
    const db = getFirestore();
    const docRef = doc(db, 'users', userId, 'trainingSessions', sessionId);
    await deleteDoc(docRef);
  },

  async deleteMany(userId: string, sessionIds: string[]) {
    const db = getFirestore();
    const batch = writeBatch(db);
    sessionIds.forEach(id => {
      const docRef = doc(db, 'users', userId, 'trainingSessions', id);
      batch.delete(docRef);
    });
    await batch.commit();
  },

  async getAttendance(userId: string, sessionId: string) {
    const db = getFirestore();
    const attRef = collection(db, 'users', userId, 'trainingSessions', sessionId, 'attendance');
    const snapshot = await getDocs(attRef);
    return snapshot.docs.map(doc => ({ ...doc.data(), playerId: doc.id } as TrainingAttendance));
  },

  async getAllAttendanceForSeason(userId: string, sessionIds: string[]) {
    const db = getFirestore();
    const allAttendance: { sessionId: string, attendance: TrainingAttendance[] }[] = [];
    
    // Per un numero limitato di sessioni carichiamo in parallelo
    await Promise.all(sessionIds.map(async (sid) => {
      const att = await this.getAttendance(userId, sid);
      allAttendance.push({ sessionId: sid, attendance: att });
    }));
    
    return allAttendance;
  },

  async setAttendance(userId: string, sessionId: string, playerId: string, status: TrainingStatus) {
    const db = getFirestore();
    const docRef = doc(db, 'users', userId, 'trainingSessions', sessionId, 'attendance', playerId);
    await setDoc(docRef, { playerId, status });
  }
};
