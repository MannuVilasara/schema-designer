import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CollectionNode } from '@/components';
import CustomEdge from '@/components/CustomEdge';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useReactFlowHandler } from '../hooks/useReactFlowHandler';
import { useDesignerActions } from '../hooks/useDesignerActions';
import { useSchemaStore } from '@/store/schemaStore';

const nodeTypes = {
  collectionNode: CollectionNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

export const DesignerCanvas: React.FC = () => {
  const { isDark } = useThemeContext();
  const collections = useSchemaStore((state) => state.collections);
  const addCollection = useSchemaStore((state) => state.addCollection);
  
  const {
    handleContextMenu,
    handleFieldContextMenu,
    openCodeSidebar,
    openCreateCollectionModal,
  } = useDesignerActions();
  
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onConnect, 
    onEdgeClick 
  } = useReactFlowHandler({
    onContextMenu: handleContextMenu,
    onFieldContextMenu: handleFieldContextMenu,
    onCloseMenus: () => {}, // We can add this functionality later if needed
  });

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  // Debug logging
  console.log('DesignerCanvas render:', {
    collections: collections.length,
    nodes: nodes.length,
    edges: edges.length,
    isDark,
    nodeTypes: Object.keys(nodeTypes),
  });

  const handlePaneContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    openCreateCollectionModal({ x: event.clientX, y: event.clientY });
  };

  return (
    <ReactFlowProvider>
      <div 
        className="w-full h-full" 
        style={{ 
          border: '3px solid red',
          position: 'relative',
          minHeight: '400px',
          backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        }}
      >
        {/* Debug overlay */}
        <div 
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            fontFamily: 'monospace',
            border: '1px solid #ccc',
          }}
        >
          Canvas Debug: {collections.length} collections, {nodes.length} nodes, {edges.length} edges
          <br />
          Theme: {isDark ? 'dark' : 'light'}
          <br />
          Node Types: {Object.keys(nodeTypes).join(', ')}
          <br />
          Container: {typeof window !== 'undefined' ? 'client' : 'server'}
          <br />
          <button 
            onClick={() => addCollection('TestCollection' + Date.now(), {
              includeTimestamps: true,
              includeCreatedAt: true,
              includeUpdatedAt: true,
            })}
            style={{ 
              background: '#007bff', 
              color: 'white', 
              border: 'none', 
              padding: '4px 8px', 
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '5px',
              fontSize: '11px',
            }}
          >
            Add Test Collection
          </button>
        </div>
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          onPaneContextMenu={handlePaneContextMenu}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: '#10b981', strokeWidth: 2 },
          }}
          connectionLineStyle={{ stroke: '#10b981', strokeWidth: 2 }}
          proOptions={proOptions}
          fitView
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          selectNodesOnDrag={false}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={true}
          deleteKeyCode={['Backspace', 'Delete']}
          multiSelectionKeyCode={['Meta', 'Control']}
          selectionKeyCode={['Meta', 'Control']}
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          <Background 
            color={isDark ? '#1e293b' : '#e2e8f0'} 
            gap={20} 
            size={1} 
          />
          <Controls 
            showZoom={true}
            showFitView={true}
            showInteractive={true}
            position="bottom-left"
          />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};