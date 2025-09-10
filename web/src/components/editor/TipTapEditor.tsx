import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import {
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  MenuButton,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
} from '@fluentui/react-components';
import {
  TextBold20Regular,
  TextItalic20Regular,
  TextUnderline20Regular,
  TextStrikethrough20Regular,
  TextBulletList20Regular,
  TextNumberListLtr20Regular,
  Code20Regular,
  TextQuote20Regular,
} from '@fluentui/react-icons';
import type { TiptapContent } from '../../types';
import './TipTapEditor.css';

interface TipTapEditorProps {
  content?: TiptapContent | null;
  onChange?: (content: TiptapContent) => void;
  editable?: boolean;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content,
  onChange,
  editable = true
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({ multicolor: true }),
    ],
    content: content || '',
    editable,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange?.(json as TiptapContent);
    },
    editorProps: {
      attributes: {
        class: 'tiptap-content',
      },
    },
  });

  // 当外部 content 改变时更新编辑器
  useEffect(() => {
    if (editor && content !== undefined) {
      editor.commands.setContent(content || '');
      // 将光标设置到文档开始位置
      editor.commands.setTextSelection(0);
    }
  }, [editor, content]);

  if (!editor) {
    return <div className="tiptap-loading">加载编辑器...</div>;
  }

  return (
    <div className="tiptap-editor">
      {editable && (
        <Toolbar className="tiptap-toolbar">
          {/* 标题菜单 */}
          <div className="toolbar-button-group">
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <MenuButton appearance="subtle">
                  {editor.isActive('heading', { level: 1 }) ? '标题 1' :
                   editor.isActive('heading', { level: 2 }) ? '标题 2' :
                   editor.isActive('heading', { level: 3 }) ? '标题 3' :
                   '正文'}
                </MenuButton>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'normal' }}>正文</span>
                    </div>
                  </MenuItem>
                  <MenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', marginRight: '12px', color: 'var(--colorNeutralForeground2)', minWidth: '24px' }}>H1</span>
                      <span style={{ fontSize: '14px' }}>标题 1</span>
                    </div>
                  </MenuItem>
                  <MenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', marginRight: '12px', color: 'var(--colorNeutralForeground2)', minWidth: '24px' }}>H2</span>
                      <span style={{ fontSize: '14px' }}>标题 2</span>
                    </div>
                  </MenuItem>
                  <MenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', marginRight: '12px', color: 'var(--colorNeutralForeground2)', minWidth: '24px' }}>H3</span>
                      <span style={{ fontSize: '14px' }}>标题 3</span>
                    </div>
                  </MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </div>

          <ToolbarDivider />

          {/* 文本格式化 */}
          <div className="toolbar-button-group">
            <ToolbarButton
              appearance={editor.isActive('bold') ? 'primary' : 'subtle'}
              icon={<TextBold20Regular />}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="粗体 (Ctrl+B)"
            />
            <ToolbarButton
              appearance={editor.isActive('italic') ? 'primary' : 'subtle'}
              icon={<TextItalic20Regular />}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="斜体 (Ctrl+I)"
            />
            <ToolbarButton
              appearance={editor.isActive('underline') ? 'primary' : 'subtle'}
              icon={<TextUnderline20Regular />}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="下划线 (Ctrl+U)"
            />
            <ToolbarButton
              appearance={editor.isActive('strike') ? 'primary' : 'subtle'}
              icon={<TextStrikethrough20Regular />}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="删除线"
            />
          </div>

          <ToolbarDivider />

          {/* 列表 */}
          <div className="toolbar-button-group">
            <ToolbarButton
              appearance={editor.isActive('bulletList') ? 'primary' : 'subtle'}
              icon={<TextBulletList20Regular />}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="无序列表"
            />
            <ToolbarButton
              appearance={editor.isActive('orderedList') ? 'primary' : 'subtle'}
              icon={<TextNumberListLtr20Regular />}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="有序列表"
            />
          </div>

          <ToolbarDivider />

          {/* 其他格式 */}
          <div className="toolbar-button-group">
            <ToolbarButton
              appearance={editor.isActive('code') ? 'primary' : 'subtle'}
              icon={<Code20Regular />}
              onClick={() => editor.chain().focus().toggleCode().run()}
              title="行内代码"
            />
            <ToolbarButton
              appearance={editor.isActive('blockquote') ? 'primary' : 'subtle'}
              icon={<TextQuote20Regular />}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="引用"
            />
          </div>
        </Toolbar>
      )}

      <div className="tiptap-editor-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};