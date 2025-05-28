import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PlacementDrives from "./pages/PlacementDrives";
import Mentorship from "./pages/Mentorship";
import SkillGap from "./pages/SkillGap";
import UserPreferences from "./pages/UserPreferences";
import StudentManagement from "./pages/StudentManagement";
import StudentDirectory from "./pages/StudentDirectory";
import QueryManagement from "./pages/QueryManagement";
import EligibilityVerification from "./pages/EligibilityVerification";
import StudentDetails from "./pages/StudentDetails";
import CreateUser from "./pages/CreateUser";
import ResumeUpload from "./pages/ResumeUpload";
import StudentResumes from "./pages/StudentResumes";
import NotFound from "./pages/NotFound";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Firebase
import "@/lib/firebase";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Private Routes inside Dashboard Layout */}
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="placement-drives" element={<PlacementDrives />} />
            <Route path="mentorship" element={<Mentorship />} />
            <Route path="skill-gap" element={<SkillGap />} />
            <Route path="preferences" element={<UserPreferences />} />
            <Route path="manage-students" element={<StudentManagement />} />
            <Route path="view-students" element={<StudentDirectory />} />
            <Route path="queries" element={<QueryManagement />} />
            <Route path="student-eligibility" element={<EligibilityVerification />} />
            <Route path="student-details" element={<StudentDetails />} />
            <Route path="create-user" element={<CreateUser />} />
            <Route path="resume-upload" element={<ResumeUpload />} />
            <Route path="student-resumes" element={<StudentResumes />} />
          </Route>

          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;




