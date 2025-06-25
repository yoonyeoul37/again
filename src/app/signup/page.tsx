"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage(error.message);
    else setMessage("회원가입 성공! 이메일을 확인하세요.");
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8">
      <h1 className="text-2xl font-bold mb-6">회원가입</h1>
      <form onSubmit={handleSignup} className="w-full max-w-sm space-y-4 bg-white p-8 rounded shadow">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="이메일"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="비밀번호"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? "가입 중..." : "회원가입"}
        </button>
        {message && <div className="text-center text-sm text-red-500 mt-2">{message}</div>}
      </form>
    </div>
  );
} 