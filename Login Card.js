import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { mockLogin } from "../services/mockAuth";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify({ email, role }));
      }
      if (role === "student") navigate("/student-dashboard");
      else if (role === "hod") navigate("/hod-dashboard");
      else navigate("/placement-dashboard");
    } catch (err) {
      console.error("Firebase auth failed, falling back to mock login.", err);
      try {
        const user = mockLogin(email, password, role);
        if (rememberMe) {
          localStorage.setItem("user", JSON.stringify(user));
        }
        if (role === "student") navigate("/student-dashboard");
        else if (role === "hod") navigate("/hod-dashboard");
        else navigate("/placement-dashboard");
      } catch (mockError) {
        setError("Invalid credentials");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Placement Management System
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Enter your credentials to access your account
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <div className="text-right mt-1">
              <button
                type="button"
                onClick={() => alert("Redirect to Forgot Password Page")}
                className="text-sm text-blue-500 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Login As</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  value="student"
                  checked={role === "student"}
                  onChange={() => setRole("student")}
                />
                Student
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  value="hod"
                  checked={role === "hod"}
                  onChange={() => setRole("hod")}
                />
                HOD
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  value="placement"
                  checked={role === "placement"}
                  onChange={() => setRole("placement")}
                />
                Placement Officer
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember Me
            </label>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition duration-200"
          >
            Sign In
          </motion.button>
        </form>
        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
      </div>
    </motion.div>
  );
}