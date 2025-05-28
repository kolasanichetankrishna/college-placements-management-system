// src/services/resumeService.ts

const idealSkills = ["HTML", "CSS", "JavaScript", "React", "Redux", "TypeScript"];

const learningPaths: Record<string, string[]> = {
  "Redux": ["Understand Redux Flow", "Implement Redux Toolkit", "Build a Redux project"],
  "TypeScript": ["Learn TS basics", "Typing React Components", "Build app with TS"],
};

const mentorshipMatching: Record<string, string> = {
  "Redux": "John Doe - Senior Frontend Developer",
  "TypeScript": "Jane Smith - Full Stack Engineer",
};

const courseRecommendations: Record<string, { title: string; link: string }[]> = {
  "Redux": [
    { title: "Redux Essentials (FreeCodeCamp)", link: "https://www.freecodecamp.org/learn/front-end-development-libraries/redux/" },
    { title: "Modern Redux with Redux Toolkit (Udemy)", link: "https://www.udemy.com/course/redux-tutorial/" }
  ],
  "TypeScript": [
    { title: "TypeScript Handbook (Official)", link: "https://www.typescriptlang.org/docs/handbook/intro.html" },
    { title: "Understanding TypeScript (Udemy)", link: "https://www.udemy.com/course/understanding-typescript/" }
  ],
};

export async function analyzeResume(file: File) {
  // Mocked extracted skills from resume
  const extractedSkills = ["HTML", "CSS", "JavaScript", "React"];

  // Detect missing skills
  const missingSkills = idealSkills.filter(skill => !extractedSkills.includes(skill));

  // Create development plan
  const developmentPlan = missingSkills.map(skill => ({
    skill,
    learningSteps: learningPaths[skill] || ["Find relevant learning materials", "Practice by building projects"],
    mentor: mentorshipMatching[skill] || "No mentor available",
    courses: courseRecommendations[skill] || []
  }));

  return new Promise<{ missingSkills: string[], developmentPlan: any[] }>((resolve) => {
    setTimeout(() => {
      resolve({ missingSkills, developmentPlan });
    }, 1000);
  });
}

