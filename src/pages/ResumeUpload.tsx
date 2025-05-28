import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ResumeUpload: React.FC = () => {
  const [resume, setResume] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResume(file);
      localStorage.setItem("uploadedResume", file.name); // Save file name (mock)
    }
  };

  const handleDeleteResume = () => {
    setResume(null);
    localStorage.removeItem("uploadedResume");
  };

  const handleAnalyze = () => {
    if (!resume) {
      alert("Please upload a resume first!");
      return;
    }
    navigate("/skill-gap");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Resume Upload</h1>
      {resume || localStorage.getItem("uploadedResume") ? (
        <div className="mb-4">
          <p>Resume: {resume?.name || localStorage.getItem("uploadedResume")}</p>
          <button onClick={handleDeleteResume} className="mt-2 bg-red-500 text-white px-4 py-2 rounded">
            Delete Resume
          </button>
        </div>
      ) : (
        <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
      )}

      <button
        onClick={handleAnalyze}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
      >
        Analyze Skills
      </button>
    </div>
  );
};

export default ResumeUpload;






