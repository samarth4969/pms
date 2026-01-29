import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { KeyRound, Loader } from "lucide-react";
import { forgotPassword } from "../../store/slices/authSlice";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const { isRequestingForToken } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email is invalid");
      return;
    }

    setError("");

    try {
      await dispatch(forgotPassword({ email })).unwrap();
      setIsSubmitted(true);
    } catch (err) {
      setError("Failed to send reset link. Please try again.");
    }
  };

  // ✅ SUCCESS UI (MUST BE HERE)
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center card p-6">
          <h2 className="text-xl font-bold mb-2">Check your email</h2>
          <p className="text-slate-600 mb-4">
            We have sent a password reset link to your email.
            If an account with this email exists, you will receive a password
            reset email shortly.
          </p>
          <Link to="/login" className="text-blue-600 font-medium">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // ✅ NORMAL FORM UI
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Forgot password?
          </h1>
          <p className="text-slate-600 mt-2">
            Enter your email address and we’ll send you a reset link.
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                className={`input ${error ? "input-error" : ""}`}
                placeholder="Enter your email"
                disabled={isRequestingForToken}
              />
            </div>

            <button
              type="submit"
              disabled={isRequestingForToken}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isRequestingForToken ? (
                <div className="flex justify-center items-center">
                  <Loader className="animate-spin mr-2 h-5 w-5 text-white" />
                  Sending...
                </div>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Remember your password?{" "}
              <Link to="/login" className="text-blue-600 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
