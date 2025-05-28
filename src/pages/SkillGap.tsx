import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const mentors = {
  "React.js": "Kowsalya",
  "Node.js": "Daniel",
  "Python": "Anotny Doss",
  "Machine Learning":"Revathi",
  "AWS": "Chris Evans",
};

const SkillGap = () => {
  const [skills, setSkills] = useState<any[]>([]);

  useEffect(() => {
    const storedSkills = localStorage.getItem("skillProgress");
    if (storedSkills) {
      setSkills(JSON.parse(storedSkills));
    } else {
      setSkills([
        { name: "React.js", currentLevel: 30, targetLevel: 90 },
        { name: "Node.js", currentLevel: 20, targetLevel: 85 },
        { name: "Python", currentLevel: 40, targetLevel: 80 },
      ]);
    }
  }, []);

  const updateSkillProgress = (index: number, newLevel: number) => {
    const updatedSkills = [...skills];
    updatedSkills[index].currentLevel = newLevel;
    setSkills(updatedSkills);
    localStorage.setItem("skillProgress", JSON.stringify(updatedSkills));
  };

  const getAssignedMentor = (skillName: string) => {
    return mentors[skillName] || "No Mentor Available";
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Skill Gap Analysis</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skills.map((skill, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="p-6 rounded-xl bg-white shadow-md"
          >
            <h2 className="text-xl font-semibold mb-2">{skill.name}</h2>

            <div className="mb-3">
              <label className="text-sm text-gray-500">Progress: {skill.currentLevel}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={skill.currentLevel}
                onChange={(e) => updateSkillProgress(idx, Number(e.target.value))}
                className="w-full mt-1"
              />
            </div>

            <p className="text-sm text-gray-700">🎯 Target Level: {skill.targetLevel}%</p>
            <p className="text-sm text-gray-700">🧑‍🏫 Mentor: {getAssignedMentor(skill.name)}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SkillGap;









