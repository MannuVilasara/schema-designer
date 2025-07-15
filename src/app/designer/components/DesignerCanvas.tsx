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

const nodeTypes = {
  collectionNode: CollectionNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

export const DesignerCanvas: React.FC = () => {
  const { isDark } = useThemeContext();
  
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

  const handlePaneContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    openCreateCollectionModal({ x: event.clientX, y: event.clientY });
  };

  return (
    <ReactFlowProvider>
      <div className="w-full h-full">
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
            backgroundColor: isDark ? '#0f172a' : '#f8fafc',
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