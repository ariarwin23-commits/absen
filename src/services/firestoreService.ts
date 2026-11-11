import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { School, KecamatanConfig } from '../types';
import { INITIAL_SCHOOLS, DEFAULT_KECAMATAN_CONFIG } from '../data/initialSchools';

const SCHOOLS_COLLECTION = 'schools';
const CONFIG_DOC = 'config/kecamatan';

/**
 * Initializes Firestore with the permanent 3 schools if collection is empty
 */
export async function seedInitialSchoolsIfEmpty(): Promise<School[]> {
  try {
    const snap = await getDocs(collection(db, SCHOOLS_COLLECTION));
    if (snap.empty) {
      console.log('Seeding initial 3 schools to Firestore...');
      for (const school of INITIAL_SCHOOLS) {
        await setDoc(doc(db, SCHOOLS_COLLECTION, school.id), school);
      }
      return INITIAL_SCHOOLS;
    }
    const schools: School[] = [];
    snap.forEach(d => {
      schools.push(d.data() as School);
    });
    return schools;
  } catch (err) {
    console.warn('Firestore read/seed warning (fallback to local data):', err);
    return INITIAL_SCHOOLS;
  }
}

/**
 * Real-time listener for schools collection
 */
export function subscribeSchools(
  onUpdate: (schools: School[]) => void,
  onError?: (err: any) => void
) {
  return onSnapshot(
    collection(db, SCHOOLS_COLLECTION),
    snapshot => {
      if (snapshot.empty) {
        onUpdate(INITIAL_SCHOOLS);
        return;
      }
      const list: School[] = [];
      snapshot.forEach(d => {
        list.push(d.data() as School);
      });
      // Sort to keep SDN 1 Pandan Duri, SDN 1 Rarang Tengah, SDN 3 Selagik in consistent order
      list.sort((a, b) => a.id.localeCompare(b.id));
      onUpdate(list);
    },
    error => {
      console.warn('Schools subscription error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, SCHOOLS_COLLECTION);
    }
  );
}

/**
 * Save or update school document in Firestore
 */
export async function saveSchoolToFirestore(school: School): Promise<void> {
  const path = `${SCHOOLS_COLLECTION}/${school.id}`;
  try {
    await setDoc(doc(db, SCHOOLS_COLLECTION, school.id), school, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete school document from Firestore
 */
export async function deleteSchoolFromFirestore(schoolId: string): Promise<void> {
  const path = `${SCHOOLS_COLLECTION}/${schoolId}`;
  try {
    await deleteDoc(doc(db, SCHOOLS_COLLECTION, schoolId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save kecamatan config to Firestore
 */
export async function saveKecamatanConfigToFirestore(config: KecamatanConfig): Promise<void> {
  try {
    await setDoc(doc(db, 'config', 'kecamatan'), config, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, CONFIG_DOC);
  }
}
