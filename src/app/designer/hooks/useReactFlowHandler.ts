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
    return collections.map((collection, index) => ({
      id: collection.id,
      type: 'collection',
      position: collection.position || { x: 100 + index * 220, y: 100 },
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
        const key = `${connection.sourceCollectionName}-${connection.targetCollectionName}`;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(connection);
        return groups;
      },
      {} as Record<string, typeof connections>
    );

    const edgeList: Edge[] = [];
    
    Object.entries(connectionGroups).forEach(([key, connectionGroup]) => {
      const connection = connectionGroup[0];
      const connectionCount = connectionGroup.length;
      
      // Find the collection IDs from names
      const sourceCollection = collections.find(c => c.name === connection.sourceCollectionName);
      const targetCollection = collections.find(c => c.name === connection.targetCollectionName);
      
      if (!sourceCollection || !targetCollection) {
        return;
      }
      
      // Find field indices from names for handle IDs
      const sourceFieldIndex = sourceCollection.fields.findIndex(f => f.name === connection.sourceFieldName);
      const targetFieldIndex = targetCollection.fields.findIndex(f => f.name === connection.targetFieldName);
      
      edgeList.push({
        id: key,
        source: sourceCollection.id,
        target: targetCollection.id,
        sourceHandle: `${sourceCollection.id}-${sourceFieldIndex}`,
        targetHandle: `${targetCollection.id}-${targetFieldIndex}`,
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
      });
    });
    
    return edgeList;
  }, [connections, collections]);

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
          // Find the collections
          const sourceCollection = collections.find(c => c.id === connection.source);
          const targetCollection = collections.find(c => c.id === connection.target);
          
          if (sourceCollection && targetCollection) {
            const sourceField = sourceCollection.fields[sourceFieldIndex];
            const targetField = targetCollection.fields[targetFieldIndex];
            
            if (sourceField && targetField) {
              addConnection({
                sourceCollectionName: sourceCollection.name,
                sourceFieldName: sourceField.name,
                targetCollectionName: targetCollection.name,
                targetFieldName: targetField.name,
                type: 'reference',
              });
            }
          }
        }
      }
    }
  }, [addConnection, collections]);

  // Handle edge deletion
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    
    // Remove all connections for this edge
    const connectionsToRemove = edge.data?.connections || [];
    connectionsToRemove.forEach((conn: any) => {
      removeConnection(conn.id);
    });
  }, [removeConnection]);

  // Get connection info for a specific field
  const getConnectionInfo = useCallback((collectionId: string, fieldIndex: number) => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return [];
    
    const fieldName = collection.fields[fieldIndex]?.name;
    if (!fieldName) return [];
    
    return getFieldConnections(collection.name, fieldName);
  }, [getFieldConnections, collections]);

  // Check if a field has connections
  const hasConnections = useCallback((collectionId: string, fieldIndex: number) => {
    const fieldConnections = getConnectionInfo(collectionId, fieldIndex);
    return fieldConnections.length > 0;
  }, [getConnectionInfo]);

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