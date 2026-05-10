import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react'

export default function LabeledEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd }) {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={{ stroke: '#444', strokeWidth: 2 }} />
      {data?.label && (
        <EdgeLabelRenderer>
          <div style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            background: '#1a1a2e',
            border: '1px solid #333',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '11px',
            color: '#aaa',
            pointerEvents: 'none',
          }}>
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
