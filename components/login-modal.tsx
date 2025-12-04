'use client';

import { useState, useEffect } from 'react';
import { api, getAuthToken } from '@/lib/api/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LoginModalProps {
  onLoginSuccess: () => void;
}

const REMEMBER_KEY = 'bookkeeping_remember_credentials';

export function LoginModal({ onLoginSuccess }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 组件挂载时加载保存的账号密码
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCredentials = localStorage.getItem(REMEMBER_KEY);
      if (savedCredentials) {
        try {
          const { username: savedUsername, password: savedPassword } = JSON.parse(savedCredentials);
          setUsername(savedUsername || '');
          setPassword(savedPassword || '');
          setRememberMe(true);
        } catch (error) {
          console.error('加载保存的账号密码失败:', error);
        }
      } else {
        // 如果没有保存的账号密码，使用默认值
        setUsername('admin');
        setPassword('admin123');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.auth.login(username, password);
      
      // 登录成功后，根据用户选择保存或清除账号密码
      if (typeof window !== 'undefined') {
        if (rememberMe) {
          localStorage.setItem(REMEMBER_KEY, JSON.stringify({ username, password }));
        } else {
          localStorage.removeItem(REMEMBER_KEY);
        }
      }
      
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#F7F6F3]/95 dark:bg-[#191919]/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#2F2F2F] rounded-lg p-10 max-w-md w-full mx-4 shadow-lg border border-[#E9E9E7] dark:border-[#3F3F3F]">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#2383E2] dark:bg-[#529CCA] rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-[#37352F] dark:text-[#E6E6E6]">
            登录到物品管理
          </h2>
          <p className="text-[#787774] dark:text-[#9B9A97] mt-2 text-sm">
            请输入您的账号和密码
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-[#37352F] dark:text-[#E6E6E6]">用户名</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              required
              disabled={loading}
              className="bg-[#F7F6F3] dark:bg-[#191919] border-[#E9E9E7] dark:border-[#3F3F3F] text-[#37352F] dark:text-[#E6E6E6]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#37352F] dark:text-[#E6E6E6]">密码</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
              disabled={loading}
              className="bg-[#F7F6F3] dark:bg-[#191919] border-[#E9E9E7] dark:border-[#3F3F3F] text-[#37352F] dark:text-[#E6E6E6]"
            />
          </div>

          {/* 记住账号密码 */}
          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
              className="w-4 h-4 rounded border-[#E9E9E7] dark:border-[#3F3F3F] text-[#2383E2] dark:text-[#529CCA] focus:ring-2 focus:ring-[#2383E2] dark:focus:ring-[#529CCA] focus:ring-offset-0 cursor-pointer"
            />
            <Label 
              htmlFor="rememberMe" 
              className="ml-2 text-sm text-[#787774] dark:text-[#9B9A97] cursor-pointer select-none"
            >
              记住账号密码
            </Label>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2383E2] hover:bg-[#1a73d1] dark:bg-[#529CCA] dark:hover:bg-[#4a8ab8] text-white shadow-sm"
            size="lg"
          >
            {loading ? '登录中...' : '登录'}
          </Button>

          <p className="text-sm text-[#787774] dark:text-[#9B9A97] text-center bg-[#F7F6F3] dark:bg-[#191919] p-3 rounded-lg">
            👉 默认账号：admin / admin123
          </p>
        </form>
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

  // 组件挂载时检查 token 是否存在
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
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
