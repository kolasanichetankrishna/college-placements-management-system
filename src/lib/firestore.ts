import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  QueryConstraint,
  DocumentData,
  setDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { PlacementDrive, User, SkillGap, Mentorship, Query as UserQuery } from "@/types";

// Generic function to get all documents from a collection
export const getCollection = async <T>(collectionName: string): Promise<T[]> => {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
};

// Generic function to get filtered documents from a collection
export const getFilteredCollection = async <T>(
  collectionName: string, 
  constraints: QueryConstraint[]
): Promise<T[]> => {
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
};

// Generic function to get a document by ID
export const getDocument = async <T>(collectionName: string, docId: string): Promise<T | null> => {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
};

// Generic function to add a document to a collection
export const addDocument = async <T extends DocumentData>(collectionName: string, data: T): Promise<string> => {
  const collectionRef = collection(db, collectionName);
  const docRef = await addDoc(collectionRef, data);
  return docRef.id;
};

// Generic function to update a document
export const updateDocument = async <T extends DocumentData>(
  collectionName: string, 
  docId: string, 
  data: Partial<T>
): Promise<void> => {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, data as DocumentData);
};

// Generic function to delete a document
export const deleteDocument = async (collectionName: string, docId: string): Promise<void> => {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
};

// Specialized functions for each collection

// Users
export const getAllUsers = (): Promise<User[]> => getCollection<User>("users");
export const getUsersByRole = (role: string): Promise<User[]> => 
  getFilteredCollection<User>("users", [where("role", "==", role)]);
export const getUserById = (id: string): Promise<User | null> => getDocument<User>("users", id);

// Modified addUser function to accept an optional id parameter
export const addUser = async (userData: Omit<User, "id">, id?: string): Promise<string> => {
  if (id) {
    // If ID is provided, use setDoc with the specified ID
    const userRef = doc(db, "users", id);
    await setDoc(userRef, userData);
    return id;
  } else {
    // Otherwise, let Firestore generate an ID
    return addDocument<Omit<User, "id">>("users", userData);
  }
};

export const updateUser = (id: string, data: Partial<User>): Promise<void> => 
  updateDocument<User>("users", id, data);
export const deleteUser = (id: string): Promise<void> => deleteDocument("users", id);

// Placement Drives
export const getAllPlacementDrives = (): Promise<PlacementDrive[]> => 
  getCollection<PlacementDrive>("placementDrives");
export const getPlacementDrivesByStatus = (status: string): Promise<PlacementDrive[]> => 
  getFilteredCollection<PlacementDrive>("placementDrives", [where("status", "==", status)]);
export const getPlacementDriveById = (id: string): Promise<PlacementDrive | null> => 
  getDocument<PlacementDrive>("placementDrives", id);
export const addPlacementDrive = (drive: Omit<PlacementDrive, "id">): Promise<string> => 
  addDocument<Omit<PlacementDrive, "id">>("placementDrives", drive);
export const updatePlacementDrive = (id: string, data: Partial<PlacementDrive>): Promise<void> => 
  updateDocument<PlacementDrive>("placementDrives", id, data);
export const deletePlacementDrive = (id: string): Promise<void> => 
  deleteDocument("placementDrives", id);

// Skill Gaps
export const getStudentSkillGaps = (studentId: string): Promise<SkillGap[]> => 
  getFilteredCollection<SkillGap>("skillGaps", [where("studentId", "==", studentId)]);
export const addSkillGap = (skillGap: Omit<SkillGap, "id">): Promise<string> => 
  addDocument<Omit<SkillGap, "id">>("skillGaps", skillGap);
export const updateSkillGap = (id: string, data: Partial<SkillGap>): Promise<void> => 
  updateDocument<SkillGap>("skillGaps", id, data);
export const deleteSkillGap = (id: string): Promise<void> => 
  deleteDocument("skillGaps", id);

// Mentorships
export const getStudentMentorships = (studentId: string): Promise<Mentorship[]> => 
  getFilteredCollection<Mentorship>("mentorships", [where("studentId", "==", studentId)]);
export const getMentorMentorships = (mentorId: string): Promise<Mentorship[]> => 
  getFilteredCollection<Mentorship>("mentorships", [where("mentorId", "==", mentorId)]);
export const addMentorship = (mentorship: Omit<Mentorship, "id">): Promise<string> => 
  addDocument<Omit<Mentorship, "id">>("mentorships", mentorship);
export const updateMentorship = (id: string, data: Partial<Mentorship>): Promise<void> => 
  updateDocument<Mentorship>("mentorships", id, data);
export const deleteMentorship = (id: string): Promise<void> => 
  deleteDocument("mentorships", id);

// Queries
export const getQueriesByTo = (to: string): Promise<UserQuery[]> => 
  getFilteredCollection<UserQuery>("queries", [where("to", "==", to)]);
export const getQueriesByFrom = (from: string): Promise<UserQuery[]> => 
  getFilteredCollection<UserQuery>("queries", [where("from", "==", from)]);
export const addQuery = (query: Omit<UserQuery, "id">): Promise<string> => 
  addDocument<Omit<UserQuery, "id">>("queries", query);
export const updateQuery = (id: string, data: Partial<UserQuery>): Promise<void> => 
  updateDocument<UserQuery>("queries", id, data);
export const deleteQuery = (id: string): Promise<void> => 
  deleteDocument("queries", id);
