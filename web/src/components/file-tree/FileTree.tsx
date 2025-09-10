import React, { useState } from 'react';
import {
  Button,
  Input,
  Text,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import {
  Add20Regular,
  MoreVertical20Regular,
  SignOut20Regular,
  WeatherMoon20Regular,
  WeatherSunny20Regular,
} from '@fluentui/react-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotebookStore } from '../../stores/useNotebookStore';
import { useAuth } from '../../hooks/useAuth';
import { useFolders } from '../../hooks/useFolders';
import { FolderNode } from './FolderNode';
import './FileTree.css';

export const FileTree: React.FC = () => {
  const { user, logout } = useAuth();
  const { selectedFolder, setSelectedFolder, selectedNote, setSelectedNote } = useNotebookStore();
  const { theme, toggleTheme } = useTheme();
  const {
    folders,
    error,
    createFolder,
    updateFolder,
    deleteFolder,
    isCreating
  } = useFolders();

  // UI State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Handlers
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setCreateDialogOpen(false);
      setNewFolderName('');
    }
  };

  const handleLogout = () => {
    logout();
  };

  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleNoteSelect = (noteId: string, folderId: string) => {
    setSelectedFolder(folderId);
    setSelectedNote(noteId);
  };

  // Data preparation
  const systemFolders = folders.filter(f => f.type === 'system');
  const userFolders = folders.filter(f => f.type === 'user');

  return (
    <div className="file-tree-container">
      {/* Header */}
      <div className="file-tree-header">
        <div className="file-tree-user-info">
          <Text weight="semibold" size={400}>
            {user?.username}
          </Text>
          <Text size={200}>笔记本</Text>
        </div>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Button
              appearance="subtle"
              icon={<MoreVertical20Regular />}
              size="small"
            />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem onClick={toggleTheme}>
                {theme === 'light' ? <WeatherMoon20Regular /> : <WeatherSunny20Regular />}
                {theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <SignOut20Regular />
                退出登录
              </MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>

      {/* Error Display */}
      {error && (
        <MessageBar intent="error" style={{ margin: '8px' }}>
          <MessageBarBody>
            {error.message || '操作失败，请重试'}
          </MessageBarBody>
        </MessageBar>
      )}

      {/* Folder List */}
      <div className="file-tree-content">
        {/* System Folders */}
        <div className="file-tree-section">
          <Text size={200} weight="semibold" style={{ padding: '4px 8px', color: 'var(--colorNeutralForeground3)' }}>
            系统文件夹
          </Text>
          {systemFolders.map((folder) => (
            <FolderNode
              key={folder._id}
              folder={folder}
              isSelected={folder._id === selectedFolder}
              onSelect={() => setSelectedFolder(folder._id)}
              onUpdate={(name) => updateFolder({ id: folder._id, name })}
              onDelete={() => deleteFolder(folder._id)}
              canEdit={false}
              selectedNoteId={selectedNote || undefined}
              onNoteSelect={(noteId) => handleNoteSelect(noteId, folder._id)}
              isExpanded={expandedFolders.has(folder._id)}
              onToggleExpand={() => toggleFolderExpansion(folder._id)}
              allFolders={folders}
            />
          ))}
        </div>

        {/* User Folders */}
        <div className="file-tree-section">
          <div className="file-tree-section-header">
            <Text size={200} weight="semibold" style={{ color: 'var(--colorNeutralForeground3)' }}>
              我的文件夹
            </Text>
            <Button
              appearance="subtle"
              icon={<Add20Regular />}
              size="small"
              onClick={() => setCreateDialogOpen(true)}
              disabled={isCreating}
            />
          </div>
          {userFolders.length === 0 ? (
            <div className="file-tree-empty-state">
              <Text size={200}>
                暂无自定义文件夹
              </Text>
              <br />
              <Text size={100}>
                点击 + 创建第一个文件夹
              </Text>
            </div>
          ) : (
            userFolders.map((folder) => (
              <FolderNode
                key={folder._id}
                folder={folder}
                isSelected={folder._id === selectedFolder}
                onSelect={() => setSelectedFolder(folder._id)}
                onUpdate={(name) => updateFolder({ id: folder._id, name })}
                onDelete={() => deleteFolder(folder._id)}
                canEdit={true}
                selectedNoteId={selectedNote || undefined}
                onNoteSelect={(noteId) => handleNoteSelect(noteId, folder._id)}
                isExpanded={expandedFolders.has(folder._id)}
                onToggleExpand={() => toggleFolderExpansion(folder._id)}
                allFolders={folders}
              />
            ))
          )}
        </div>
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={(_event, data) => setCreateDialogOpen(data.open)}>
        <DialogSurface>
          <DialogTitle>创建新文件夹</DialogTitle>
          <DialogBody>
            <DialogContent>
              <Input
                placeholder="输入文件夹名称..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder();
                  }
                }}
                maxLength={50}
              />
              <Text size={200} style={{ marginTop: '8px', color: 'var(--colorNeutralForeground3)' }}>
                文件夹名称不能为空，最多50个字符
              </Text>
            </DialogContent>
          </DialogBody>
          <DialogActions>
            <Button appearance="secondary" onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button
              appearance="primary"
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim() || isCreating}
            >
              {isCreating ? '创建中...' : '创建'}
            </Button>
          </DialogActions>
        </DialogSurface>
      </Dialog>
    </div>
  );
};