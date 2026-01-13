import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Brain, GraduationCap, Shield } from "lucide-react";
import { useLoginMutation } from "../../hooks/mutations/authMutation.js";
import LoadingSpinner from "../../components/utils/LoadingSpinner.jsx";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const { mutate: loginMutation, isPending } = useLoginMutation();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    loginMutation(formData);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Styles */}
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.2; }
          50% { transform: scale(1.5) rotate(15deg); opacity: 0.3; }
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px white inset !important;
          -webkit-text-fill-color: #1f2937 !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        .custom-checkbox {
          appearance: none;
          background-color: #fff;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          width: 1rem;
          height: 1rem;
          display: inline-block;
          position: relative;
          cursor: pointer;
        }

        .custom-checkbox:checked {
          border-color: #4338ca;
        }

        .custom-checkbox:checked::after {
          content: '✔';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 0.75rem;
          color: #1f2937;
        }
      `}</style>

      {/* Animated Background */}
      <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-emerald-200 rounded-full blur-3xl animate-[breathe_16s_infinite]" />
      <div className="absolute bottom-[-20%] left-[-20%] w-96 h-96 bg-blue-200 rounded-full blur-3xl animate-[breathe_18s_infinite]" />
      <div className="absolute top-[50%] left-[30%] w-80 h-80 bg-amber-200 rounded-full blur-3xl animate-[breathe_20s_infinite]" />

      {/* Logo */}
      <div className="absolute top-6 left-6 z-10 flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg flex items-center justify-center">
          <Brain className="text-white w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">FutureGuard</h1>
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600">Sign in to access your dashboard</p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 py-3 border rounded-lg 
                            text-gray-900 placeholder-gray-400
                            focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border rounded-lg 
                              text-gray-900 placeholder-gray-400
                              focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your password"
                    required
                  />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-900">
                <input type="checkbox" className="custom-checkbox" />
                Remember me
              </label>
              <button type="button" className="text-indigo-600">Forgot password?</button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-gray-800 to-gray-700 text-white py-3 rounded-lg"
            >
              {isPending ? <LoadingSpinner /> : "Sign In"}
            </button>
          </form>

          {/* Features */}
          <div className="mt-6 grid grid-cols-3 text-center">
            <Brain className="mx-auto text-blue-500" />
            <Shield className="mx-auto text-green-500" />
            <GraduationCap className="mx-auto text-amber-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
