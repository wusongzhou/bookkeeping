/**
 * 用户设置组件
 * 修改用户名和密码
 */

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { api } from '@/lib/api/client';

interface UserSettingsProps {
  open: boolean;
  onClose: () => void;
}

export function UserSettings({ open, onClose }: UserSettingsProps) {
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 加载用户信息
  useEffect(() => {
    if (open) {
      loadUserInfo();
    }
  }, [open]);

  const loadUserInfo = async () => {
    try {
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsername(data.data.username);
      }
    } catch (err) {
      console.error('加载用户信息失败:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 验证
    if (newPassword && newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('新密码长度至少为6个字符');
      return;
    }

    if (username.trim().length < 3) {
      setError('用户名长度至少为3个字符');
      return;
    }

    setLoading(true);

    try {
      const body: {
        username?: string;
        oldPassword?: string;
        newPassword?: string;
      } = { username };

      if (newPassword) {
        body.oldPassword = oldPassword;
        body.newPassword = newPassword;
      }

      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('设置更新成功!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // 2秒后关闭弹窗
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(data.error || '更新失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败,请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>账号设置</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 用户名 */}
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              required
              disabled={loading}
              minLength={3}
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              用户名长度至少为3个字符
            </p>
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
              修改密码（可选）
            </h3>

            {/* 当前密码 */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="oldPassword">当前密码</Label>
              <Input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="请输入当前密码"
                disabled={loading}
              />
            </div>

            {/* 新密码 */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="newPassword">新密码</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="请输入新密码（至少6位）"
                disabled={loading}
                minLength={6}
              />
            </div>

            {/* 确认新密码 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认新密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入新密码"
                disabled={loading}
              />
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {/* 成功提示 */}
          {success && (
            <div className="text-green-600 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
              {success}
            </div>
          )}

          {/* 按钮 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? '保存中...' : '保存设置'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
