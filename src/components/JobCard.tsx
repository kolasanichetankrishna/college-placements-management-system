// src/services/skillMatchingService.ts

import { toast } from "sonner"; // Assuming you are using `sonner` for toasts

export function analyzeSkillGapAndRedirect(
  jobId: string,
  requiredSkills: string[],
  navigate: (path: string) => void
) {
  // Dummy user's skills (later you can connect with resume skills dynamically)
  const userResumeSkills = ["HTML", "CSS", "Python", "Data Structures"];

  const missingSkills = requiredSkills.filter(
    (skill) => !userResumeSkills.includes(skill)
  );

  if (missingSkills.length > 0) {
    toast.info(
      `Missing skills detected: ${missingSkills.join(", ")}. Redirecting to Skill Gap Analysis...`
    );
    setTimeout(() => {
      navigate("/skill-gap");
    }, 2000);
  } else {
    toast.success("You meet all skill requirements! Proceed to apply 🎉");
  }
}




