"use client";

import { useState, useEffect } from "react";
import { api, getAuthToken } from "@/lib/api/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import Image from "next/image";

interface LoginModalProps {
  onLoginSuccess: () => void;
}

const REMEMBER_KEY = "bookkeeping_remember_credentials";

export function LoginModal({ onLoginSuccess }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCredentials = localStorage.getItem(REMEMBER_KEY);
      if (savedCredentials) {
        try {
          const { username: savedUsername, password: savedPassword } =
            JSON.parse(savedCredentials);
          setUsername(savedUsername || "");
          setPassword(savedPassword || "");
          setRememberMe(true);
        } catch (error) {
          console.error("加载保存的账号密码失败:", error);
        }
      } else {
        setUsername("admin");
        setPassword("admin123");
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.auth.login(username, password);

      if (typeof window !== "undefined") {
        if (rememberMe) {
          localStorage.setItem(
            REMEMBER_KEY,
            JSON.stringify({ username, password })
          );
        } else {
          localStorage.removeItem(REMEMBER_KEY);
        }
      }

      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#FFFFFF] dark:bg-[#191919] flex flex-col items-center justify-center px-4">
      {/* Notion 风格插画 */}
      <div className="mb-8">
        <Image
          src="/notion-people.png"
          alt="Notion Style Illustration"
          width={500}
          height={150}
          className="max-w-full h-auto"
          priority
        />
      </div>

      {/* 登录卡片 */}
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-[#2F2F2F] rounded-xl shadow-lg border border-[#E9E9E7] dark:border-[#3F3F3F]">
          <div className="p-8">
            {/* 标题 */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-[#37352F] dark:text-[#E6E6E6]">
                Bookkeeping
              </h1>
              <p className="text-[#787774] dark:text-[#9B9A97] mt-1 text-sm">
                记录每一件物品，让花费更有意义
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="username"
                  className="text-sm text-[#37352F] dark:text-[#E6E6E6]"
                >
                  用户名
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  required
                  disabled={loading}
                  className="h-10 bg-[#F7F6F3] dark:bg-[#191919] border-[#E9E9E7] dark:border-[#3F3F3F]"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-sm text-[#37352F] dark:text-[#E6E6E6]"
                >
                  密码
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  required
                  disabled={loading}
                  className="h-10 bg-[#F7F6F3] dark:bg-[#191919] border-[#E9E9E7] dark:border-[#3F3F3F]"
                />
              </div>

              <div className="flex items-center">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  disabled={loading}
                />
                <Label
                  htmlFor="rememberMe"
                  className="ml-2 text-sm text-[#787774] dark:text-[#9B9A97] cursor-pointer"
                >
                  记住账号密码
                </Label>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-[#2383E2] hover:bg-[#1a73d1] dark:bg-[#529CCA] dark:hover:bg-[#4a8ab8] text-white"
              >
                {loading ? "登录中..." : "登录"}
              </Button>

              <p className="text-xs text-center text-[#9B9A97] dark:text-[#787774]">
                默认账号：admin / admin123
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 认证检查 Hook
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const token = getAuthToken();
        setIsAuthenticated(!!token);
      }
      setIsChecking(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    api.auth.logout();
    setIsAuthenticated(false);
  };

  return { isAuthenticated, isChecking, logout, setIsAuthenticated };
}
