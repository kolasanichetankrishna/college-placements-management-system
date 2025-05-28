import React from "react";

interface LearningPathModalProps {
  skill: string;
  onClose: () => void;
}

const LearningPathModal: React.FC<LearningPathModalProps> = ({ skill, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Learning Path for {skill}</h2>
        <ul className="list-disc ml-5 space-y-2">
          <li>Understand Basics</li>
          <li>Take Online Courses</li>
          <li>Build Mini Projects</li>
          <li>Attend Live Mentoring</li>
          <li>Give Mock Interviews</li>
        </ul>
        <button
          onClick={onClose}
          className="w-full mt-6 bg-blue-600 text-white py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LearningPathModal;
