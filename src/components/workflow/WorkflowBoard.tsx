import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CustomNode } from './CustomNode';

const nodeTypes = {
    custom: CustomNode,
};

interface WorkflowData {
    nodes: Node[];
    edges: Edge[];
}

interface WorkflowBoardProps {
    initialData: WorkflowData;
    onRunNode: (nodeId: string, nodeLabel: string) => void;
}

export const WorkflowBoard = ({ initialData, onRunNode }: WorkflowBoardProps) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        if (initialData) {
            // Hydrate nodes with the onRun handler
            const hydratedNodes = initialData.nodes.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    onRun: () => handleRunNode(node.id, node.data.label),
                },
            }));

            setNodes(hydratedNodes);
            setEdges(initialData.edges);
        }
    }, [initialData]);

    const handleRunNode = (nodeId: string, nodeLabel: string) => {
        // Optimistically update status to 'completed' for visual feedback
        // In a real app, we might wait for the AI to confirm, but here we want instant feedback
        // actually, let's keep it 'active' but maybe show a loader?
        // For now, the parent component will handle the AI loop.
        console.log('Running node:', nodeId);
        onRunNode(nodeId, nodeLabel);
    };

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    return (
        <div style={{ width: '100%', height: '500px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
};
