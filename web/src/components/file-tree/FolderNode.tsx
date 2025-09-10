import React, { useState } from 'react';
import {
  Text,
  Button,
  Input,
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
} from '@fluentui/react-components';
import {
  Folder20Regular,
  FolderOpen20Regular,
  MoreHorizontal20Regular,
  Edit20Regular,
  Delete20Regular,
  ChevronDown20Regular,
  ChevronRight20Regular,
  Add20Regular,
  Document20Regular,
} from '@fluentui/react-icons';
import type { Folder } from '../../types';
import { useNotes } from '../../hooks/useNotes';
import './FolderNode.css';

interface FolderNodeProps {
  folder: Folder;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (name: string) => void;
  onDelete: () => void;
  canEdit: boolean;
  selectedNoteId?: string;
  onNoteSelect?: (noteId: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  allFolders?: Folder[];
}

export const FolderNode: React.FC<FolderNodeProps> = ({
  folder,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  canEdit,
  selectedNoteId,
  onNoteSelect,
  isExpanded = false,
  onToggleExpand,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const [isHovered, setIsHovered] = useState(false);
  
  const { notes = [], createNote, deleteNote, isCreating, isDeleting } = useNotes(folder._id);

  const handleEdit = () => {
    setEditName(folder.name);
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (editName.trim() && editName !== folder.name) {
      onUpdate(editName.trim());
    }
    setEditDialogOpen(false);
  };

  const handleDelete = () => {
    onDelete();
    setDeleteDialogOpen(false);
  };

  const handleCreateNote = async () => {
    try {
      await createNote({
        folderId: folder._id,
        title: `新笔记 ${new Date().getTime()}`,
      });
    } catch (error) {
      console.error('创建笔记失败:', error);
    }
  };

  const handleFolderClick = () => {
    // 总是展开/收起文件夹
    onToggleExpand?.();
    // 选择文件夹（用于设置当前上下文）
    onSelect();
  };

  return (
    <div className="folder-node">
      <div
        className="folder-header"
        onClick={handleFolderClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 展开/收起图标 (悬停时显示) */}
        {isHovered ? (
          <div style={{ minWidth: '20px', display: 'flex', justifyContent: 'center' }}>
            {isExpanded ? <ChevronDown20Regular /> : <ChevronRight20Regular />}
          </div>
        ) : (
          /* 文件夹图标 */
          <div style={{ minWidth: '20px', display: 'flex', justifyContent: 'center' }}>
            {isExpanded ? <FolderOpen20Regular /> : <Folder20Regular />}
          </div>
        )}

        {/* 文件夹名称 */}
        <Text className="folder-name">{folder.name}</Text>

        {/* 添加笔记按钮 */}
        <Button
          appearance="subtle"
          size="small"
          icon={isCreating ? undefined : <Add20Regular />}
          onClick={(e) => {
            e.stopPropagation();
            handleCreateNote();
          }}
          disabled={isCreating}
          className="add-note-btn"
          title="添加新笔记"
        >
          {isCreating && '...'}
        </Button>

        {/* 更多操作菜单 */}
        {canEdit && (
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button
                appearance="subtle"
                size="small"
                icon={<MoreHorizontal20Regular />}
                onClick={(e) => e.stopPropagation()}
                className="more-btn"
                title="更多操作"
              />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem icon={<Edit20Regular />} onClick={handleEdit}>
                  重命名
                </MenuItem>
                <MenuItem icon={<Delete20Regular />} onClick={() => setDeleteDialogOpen(true)}>
                  删除
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        )}
      </div>

      {/* 笔记列表 */}
      {isExpanded && (
        <div className="notes-list">
          {notes.length === 0 ? (
            <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--colorNeutralForeground3)' }}>
              暂无笔记
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note._id}
                className={`note-item ${selectedNoteId === note._id ? 'selected' : ''}`}
                onClick={() => onNoteSelect?.(note._id)}
              >
                <div className="note-content">
                  <Document20Regular />
                  <Text className="note-title">{note.title}</Text>
                </div>
                <Menu>
                  <MenuTrigger disableButtonEnhancement>
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<MoreHorizontal20Regular />}
                      onClick={(e) => e.stopPropagation()}
                      className="note-more-btn"
                      title="更多操作"
                    />
                  </MenuTrigger>
                  <MenuPopover>
                    <MenuList>
                      <MenuItem 
                        icon={<Delete20Regular />} 
                        onClick={() => deleteNote(note._id)}
                        disabled={isDeleting}
                      >
                        删除笔记
                      </MenuItem>
                    </MenuList>
                  </MenuPopover>
                </Menu>
              </div>
            ))
          )}
        </div>
      )}

      {/* 编辑文件夹对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={(_event, data) => setEditDialogOpen(data.open)}>
        <DialogSurface>
          <DialogTitle>重命名文件夹</DialogTitle>
          <DialogBody>
            <DialogContent>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="文件夹名称"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleEditSave();
                  }
                }}
              />
            </DialogContent>
          </DialogBody>
          <DialogActions>
            <Button appearance="secondary" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button appearance="primary" onClick={handleEditSave} disabled={!editName.trim()}>
              保存
            </Button>
          </DialogActions>
        </DialogSurface>
      </Dialog>

      {/* 删除文件夹对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={(_event, data) => setDeleteDialogOpen(data.open)}>
        <DialogSurface>
          <DialogTitle>删除文件夹</DialogTitle>
          <DialogBody>
            <DialogContent>
              <Text>确定要删除文件夹 "{folder.name}" 吗？此操作不可撤销。</Text>
            </DialogContent>
          </DialogBody>
          <DialogActions>
            <Button appearance="secondary" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button appearance="primary" color="danger" onClick={handleDelete}>
              删除
            </Button>
          </DialogActions>
        </DialogSurface>
      </Dialog>
    </div>
  );
};