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
    Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CustomNode } from './CustomNode';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
// import { toast } from 'sonner'; 
import { NodeEditor } from './NodeEditor';

const nodeTypes = {
    custom: CustomNode,
};

interface WorkflowData {
    nodes: Node[];
    edges: Edge[];
}

interface WorkflowBoardProps {
    initialData: WorkflowData;
    onRunNode: (nodeId: string, nodeLabel: string, nodeData?: any, context?: string) => Promise<string | null>;
}

export const WorkflowBoard = ({ initialData, onRunNode }: WorkflowBoardProps) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isRunning, setIsRunning] = useState(false);

    // Editor State
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
    const [editingNodeData, setEditingNodeData] = useState<any>(null);

    // Hydrate nodes with handlers
    useEffect(() => {
        if (initialData) {
            const hydrateNode = (node: Node) => ({
                ...node,
                type: 'custom',
                data: {
                    ...node.data,
                    // Attach the edit handler
                    onEdit: () => handleEditNode(node.id, node.data),
                }
            });

            setNodes(initialData.nodes.map(hydrateNode));

            const formattedEdges = initialData.edges.map(edge => ({
                ...edge,
                type: 'smoothstep',
                animated: true,
            }));
            setEdges(formattedEdges);
        }
    }, [initialData, setNodes, setEdges]); // Only re-run if initialData genuinely changes structure

    // Re-attach handlers when nodes change (to keep closure fresh if needed, though mostly static here)
    // Actually, distinct handlers per node in useEffect is fine, but we need to ensure local updates persist

    const handleEditNode = (nodeId: string, data: any) => {
        console.log("Editing node:", nodeId, data);
        setEditingNodeId(nodeId);
        setEditingNodeData(data);
        setEditorOpen(true);
    };

    const handleSaveNode = (nodeId: string, updates: any) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === nodeId) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        ...updates,
                        // Re-attach handler (important because we are replacing data object)
                        onEdit: () => handleEditNode(node.id, { ...node.data, ...updates })
                    }
                };
            }
            return node;
        }));
    };

    const handleRunWorkflow = async () => {
        setIsRunning(true);
        const executionResults: Record<string, any> = {};

        try {
            const sortedNodes = [...nodes].sort((a, b) => a.position.x - b.position.x);

            for (const node of sortedNodes) {
                // Set active
                setNodes((nds) => nds.map((n) => n.id === node.id ? { ...n, data: { ...n.data, status: 'active' } } : n));

                // Context from previous nodes
                const context = JSON.stringify(executionResults, null, 2);

                console.log(`Step ${node.id} starting with context keys:`, Object.keys(executionResults));

                // Call the run handler (API call)
                // We assume onRunNode returns a promise that resolves to the output
                // @ts-ignore
                const result = await onRunNode(node.id, node.data.label, node.data, context);

                if (result) {
                    executionResults[node.id] = {
                        status: 'success',
                        output: result,
                        timestamp: new Date().toISOString()
                    };
                }

                // Check for failure simulation or success
                setNodes((nds) => nds.map((n) => n.id === node.id ? { ...n, data: { ...n.data, status: 'completed' } } : n));
            }
        } catch (error) {
            console.error("Workflow failed", error);
        } finally {
            setIsRunning(false);
        }
    };

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true }, eds)),
        [setEdges]
    );

    return (
        <div style={{ width: '100%', height: '500px', position: 'relative' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background color="#aaa" gap={16} />
                <Controls />
                <MiniMap />
                <Panel position="top-right">
                    <Button
                        onClick={handleRunWorkflow}
                        disabled={isRunning}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                    >
                        <Play size={16} className="mr-2 fill-current" />
                        {isRunning ? 'Running...' : 'Run Workflow'}
                    </Button>
                </Panel>
            </ReactFlow>

            <NodeEditor
                nodeId={editingNodeId}
                initialData={editingNodeData}
                open={editorOpen}
                onOpenChange={setEditorOpen}
                onSave={handleSaveNode}
            />
        </div>
    );
};
