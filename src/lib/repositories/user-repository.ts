import { doc, getDoc, setDoc, updateDoc, getFirestore } from "firebase/firestore";
import { UserProfile } from "../types";

const COLLECTION = "users";

export const userRepository = {
  getById: async (uid: string): Promise<UserProfile | null> => {
    try {
      const db = getFirestore();
      const docRef = doc(db, COLLECTION, uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error(`[UserRepository] Error fetching user ${uid}:`, error);
      return null;
    }
  },

  create: async (profile: UserProfile): Promise<boolean> => {
    try {
      const db = getFirestore();
      const docRef = doc(db, COLLECTION, profile.uid);
      await setDoc(docRef, profile);
      return true;
    } catch (error) {
      console.error(`[UserRepository] Error creating user ${profile.uid}:`, error);
      return false;
    }
  },

  update: async (uid: string, updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      const db = getFirestore();
      const docRef = doc(db, COLLECTION, uid);
      await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
      return true;
    } catch (error) {
      console.error(`[UserRepository] Error updating user ${uid}:`, error);
      return false;
    }
  }
};
