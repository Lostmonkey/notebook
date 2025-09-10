import React from 'react';
import { FileTree } from '../file-tree/FileTree';
import { Editor } from '../editor/Editor';
import './Layout.css';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout-container">
      {/* Left Panel - File Tree */}
      <div className="layout-sidebar">
        <FileTree />
      </div>

      {/* Right Panel - Editor */}
      <div className="layout-main">
        <Editor />
      </div>
      {children}
    </div>
  );
};