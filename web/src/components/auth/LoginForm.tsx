import React, { useState } from 'react';
import {
  Input,
  Button,
  Field,
  MessageBar,
  MessageBarBody,
  Card,
  CardHeader,
  Text,
  Body1,
  Title1,
  Subtitle1,
} from '@fluentui/react-components';
import { useAuth } from '../../hooks/useAuth';
import './LoginForm.css';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await login({ username: username.trim() });
    } catch {
      setError('登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <CardHeader
          header={<Title1>智能笔记本</Title1>}
          description={<Subtitle1>欢迎回来，开始你的创作之旅</Subtitle1>}
        />
        
        <form onSubmit={handleSubmit} className="login-form">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入用户名"
            disabled={isLoading}
            size="large"
            appearance="underline"
          />
          
          {error && (
            <MessageBar intent="error">
              <MessageBarBody>{error}</MessageBarBody>
            </MessageBar>
          )}
          
          <Button 
            type="submit" 
            appearance="primary" 
            disabled={isLoading}
            size="large"
            style={{ width: '100%' }}
          >
            {isLoading ? '登录中...' : '开始使用'}
          </Button>
        </form>
      </Card>
    </div>
  );
};