import { useCallback } from 'react'
import { ReactFlow, Background, Controls, MiniMap, MarkerType } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useEditorStore } from '../../stores/editorStore'
import StoryNode from './nodes/StoryNode'
import LabeledEdge from './edges/LabeledEdge'

const nodeTypes = { storyNode: StoryNode }
const edgeTypes = { labeledEdge: LabeledEdge }
const NODE_HALF_W = 65 // approx half of StoryNode minWidth (130px)
const NODE_HALF_H = 30 // approx half of StoryNode height
const defaultEdgeOptions = {
  type: 'labeledEdge',
  markerEnd: { type: MarkerType.ArrowClosed, color: '#555' },
}

export default function GraphCanvas({ projectId }) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNodeId } = useEditorStore()

  const handleDoubleClick = useCallback((e) => {
    const bounds = e.currentTarget.getBoundingClientRect()
    addNode({ position: { x: e.clientX - bounds.left - NODE_HALF_W, y: e.clientY - bounds.top - NODE_HALF_H }, projectId })
  }, [addNode, projectId])

  return (
    <div style={{ flex: 1, height: '100%' }} onDoubleClick={handleDoubleClick}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={() => setSelectedNodeId(null)}
        fitView
        deleteKeyCode="Delete"
      >
        <Background color="#1a1a2e" gap={20} size={1} />
        <Controls style={{ background: '#111', border: '1px solid #333' }} />
        <MiniMap
          style={{ background: '#111', border: '1px solid #333' }}
          nodeColor={(n) => n.data?.color ?? '#4f46e5'}
          maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>
    </div>
  )
}
