Login.tsx
import { Mail, Lock } from 'lucide-react';
import { useState } from 'react';

export default function LoginForm() {
  const [selectedRole, setSelectedRole] = useState("Student");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Placement Management System
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Enter your credentials to access your account
        </p>

        {/* Email Input */}
        <div className="mb-4 relative">
          <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="email"
            placeholder="name@example.com"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>

        {/* Password Input */}
        <div className="mb-4 relative">
          <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="password"
            placeholder="••••••••"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <p className="font-medium text-gray-700 mb-2">Login As</p>
          <div className="flex justify-between">
            {["Student", "HOD", "Placement Officer"].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`flex-1 text-sm px-3 py-2 rounded-lg border mx-1 ${
                  selectedRole === role
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300"
                } transition`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition"
        >
          Sign In
        </button>

        {/* Footer Note */}
        <p className="text-sm text-gray-500 text-center mt-4">
          Please enter your credentials to log in.
        </p>
      </div>
    </div>
  );
}
