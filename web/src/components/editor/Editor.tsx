import React, { useEffect, useState, useCallback } from 'react';
import {
  Text,
  Input,
  Skeleton,
  MessageBar,
  MessageBarBody,
  Button,
} from '@fluentui/react-components';
import {
  Save20Regular,
  CheckmarkCircle20Regular,
} from '@fluentui/react-icons';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { useNotes } from '../../hooks/useNotes';
import { TipTapEditor } from './TipTapEditor';
import type { TiptapContent } from '../../types';
import './Editor.css';

export const Editor: React.FC = () => {
  const { selectedNote, selectedFolder } = useNotebookStore();
  const { updateNote, useNote } = useNotes(selectedFolder || '');
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<TiptapContent | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);

  // 获取笔记详情
  const { data: note, isLoading, error } = useNote(selectedNote);

  // 当选择的笔记改变时更新编辑器内容
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || null);
      setHasChanges(false);
      setSaveStatus(null);
    }
  }, [note]);

  // 保存笔记
  const handleSave = useCallback(async () => {
    if (!selectedNote || !hasChanges) return;

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      await updateNote({
        id: selectedNote,
        title: title.trim() || '未命名笔记',
        content: content as TiptapContent,
      });
      setHasChanges(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      console.error('保存失败:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [selectedNote, hasChanges, title, content, updateNote]);

  // 监听标题变化
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setHasChanges(true);
  };

  // 监听内容变化
  const handleContentChange = (newContent: TiptapContent) => {
    setContent(newContent);
    setHasChanges(true);
  };

  // 键盘快捷键保存
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // 没有选择笔记时显示提示
  if (!selectedNote) {
    return (
      <div className="editor-empty">
        <Text size={500} weight="semibold">欢迎使用智能笔记本</Text>
        <Text size={300}>请选择或创建一个笔记开始编辑</Text>
      </div>
    );
  }

  // 加载中状态
  if (isLoading) {
    return (
      <div className="editor-loading">
        <Skeleton style={{ width: '60%', height: '32px', marginBottom: '16px' }} />
        <Skeleton style={{ width: '100%', height: '200px' }} />
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="editor-error">
        <MessageBar intent="error">
          <MessageBarBody>
            加载笔记失败，请重试
          </MessageBarBody>
        </MessageBar>
      </div>
    );
  }

  return (
    <div className="editor-container">
      {/* 工具栏 */}
      <div className="editor-toolbar">
        <div className="editor-title-section">
          <Input
            value={title}
            onChange={handleTitleChange}
            placeholder="无标题"
            appearance="underline"
            size="large"
            style={{
              fontSize: '28px',
              fontWeight: '700',
              border: 'none',
              background: 'transparent',
              boxShadow: 'none'
            }}
          />
        </div>
        
        <div className="editor-actions">
          {saveStatus === 'saved' && (
            <div className="save-status">
              <CheckmarkCircle20Regular style={{ color: 'var(--colorPaletteGreenForeground1)' }} />
              <Text size={200}>已保存</Text>
            </div>
          )}
          
          {saveStatus === 'error' && (
            <Text size={200} style={{ color: 'var(--colorPaletteRedForeground1)' }}>
              保存失败
            </Text>
          )}
          
          <Button
            icon={<Save20Regular />}
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            appearance="primary"
          >
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      {/* 编辑器内容 */}
      <div className="editor-content">
        <TipTapEditor
          content={content}
          onChange={handleContentChange}
          editable={true}
        />
      </div>
    </div>
  );
};