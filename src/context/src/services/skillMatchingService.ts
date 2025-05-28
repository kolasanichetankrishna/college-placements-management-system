export const matchSkills = (resumeSkills: string[], jobSkills: string[]) => {
    const missingSkills = jobSkills.filter(skill => 
      !resumeSkills.some(resumeSkill => 
        resumeSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
  
    return missingSkills;
  };
  