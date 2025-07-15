import { useCallback, useMemo } from 'react';
import { 
  Node, 
  Edge, 
  NodeChange, 
  Connection, 
  MarkerType 
} from 'reactflow';
import { useSchemaStore } from '@/store/schemaStore';

export const useReactFlowHandler = () => {
  const {
    collections,
    connections,
    updateCollectionPosition,
    addConnection,
    removeConnection,
    getFieldConnections,
  } = useSchemaStore();

  // Convert collections to ReactFlow nodes
  const nodes: Node[] = useMemo(() => {
    return collections.map((collection) => ({
      id: collection.id,
      type: 'collection',
      position: collection.position,
      data: {
        id: collection.id,
        name: collection.name,
        fields: collection.fields,
      },
      style: {
        background: 'transparent',
        border: 'none',
        padding: 0,
        width: 'auto',
        height: 'auto',
      },
    }));
  }, [collections]);

  // Convert connections to ReactFlow edges
  const edges: Edge[] = useMemo(() => {
    // Group connections by source-target pair to handle overlapping
    const connectionGroups = connections.reduce(
      (groups, connection) => {
        const key = `${connection.sourceCollectionId}-${connection.targetCollectionId}`;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(connection);
        return groups;
      },
      {} as Record<string, typeof connections>
    );

    return Object.entries(connectionGroups).map(([key, connectionGroup]) => {
      const connection = connectionGroup[0];
      const connectionCount = connectionGroup.length;
      
      return {
        id: key,
        source: connection.sourceCollectionId,
        target: connection.targetCollectionId,
        sourceHandle: `${connection.sourceCollectionId}-${connection.sourceFieldIndex}`,
        targetHandle: `${connection.targetCollectionId}-${connection.targetFieldIndex}`,
        type: 'custom',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#10b981',
        },
        style: {
          stroke: '#10b981',
          strokeWidth: 2,
        },
        data: {
          connections: connectionGroup,
          connectionCount,
        },
      };
    });
  }, [connections]);

  // Handle node changes (position updates)
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    changes.forEach((change) => {
      if (change.type === 'position' && change.position) {
        updateCollectionPosition(change.id, change.position);
      }
    });
  }, [updateCollectionPosition]);

  // Handle new connections
  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      // Extract field indices from handles
      const sourceHandle = connection.sourceHandle?.split('-');
      const targetHandle = connection.targetHandle?.split('-');
      
      if (sourceHandle && targetHandle && sourceHandle.length >= 2 && targetHandle.length >= 2) {
        const sourceFieldIndex = parseInt(sourceHandle[1]);
        const targetFieldIndex = parseInt(targetHandle[1]);
        
        if (!isNaN(sourceFieldIndex) && !isNaN(targetFieldIndex)) {
          addConnection(
            connection.source,
            sourceFieldIndex,
            connection.target,
            targetFieldIndex
          );
        }
      }
    }
  }, [addConnection]);

  // Handle edge deletion
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    
    // Remove all connections for this edge
    const connectionsToRemove = edge.data?.connections || [];
    connectionsToRemove.forEach((conn: any) => {
      removeConnection(
        conn.sourceCollectionId,
        conn.sourceFieldIndex,
        conn.targetCollectionId,
        conn.targetFieldIndex
      );
    });
  }, [removeConnection]);

  // Get connection info for a specific field
  const getConnectionInfo = useCallback((collectionId: string, fieldIndex: number) => {
    return getFieldConnections(collectionId, fieldIndex);
  }, [getFieldConnections]);

  // Check if a field has connections
  const hasConnections = useCallback((collectionId: string, fieldIndex: number) => {
    const fieldConnections = getFieldConnections(collectionId, fieldIndex);
    return fieldConnections.length > 0;
  }, [getFieldConnections]);

  return {
    nodes,
    edges,
    onNodesChange,
    onConnect,
    onEdgeClick,
    getConnectionInfo,
    hasConnections,
  };
};