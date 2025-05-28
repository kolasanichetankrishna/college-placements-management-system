
import { collection, getDocs, where, query, addDoc, setDoc, doc, CollectionReference, Query, DocumentData } from "firebase/firestore";
import { db } from "./firebase";
import { SkillData } from "@/types";

// Fetch skill gap data for a student
export const fetchStudentSkillData = async (studentId?: string) => {
  try {
    if (!studentId) {
      console.warn("No student ID provided for skill data");
      return [];
    }
    
    const skillsRef = collection(db, 'skillGaps');
    const q = query(skillsRef, where('studentId', '==', studentId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log("No skill data found, initializing with defaults");
      return initializeDefaultSkillData(studentId);
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().skill || 'Unknown',
      target: doc.data().targetLevel || 0,
      current: doc.data().currentLevel || 0
    }));
  } catch (error) {
    console.error("Error fetching skill data:", error);
    return [];
  }
};

// Initialize default skill gap data if none exists
const initializeDefaultSkillData = async (studentId: string) => {
  const defaultData: SkillData[] = [
    { name: 'Web Dev', target: 8, current: 6 },
    { name: 'Machine Learning', target: 7, current: 4 },
    { name: 'Cloud', target: 6, current: 3 },
    { name: 'DevOps', target: 5, current: 4 },
    { name: 'UI/UX', target: 7, current: 5 },
  ];
  
  try {
    const skillsRef = collection(db, 'skillGaps');
    
    // Add default data to Firestore
    for (const data of defaultData) {
      await addDoc(skillsRef, {
        skill: data.name,
        targetLevel: data.target,
        currentLevel: data.current,
        studentId,
        plan: `Improve ${data.name} skills`
      });
    }
    
    return defaultData;
  } catch (error) {
    console.error("Error initializing default skill data:", error);
    return defaultData;
  }
};
