import { useEffect, useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useEditorStore } from '../stores/editorStore'
import { useAutoSave } from '../hooks/useAutoSave'
import GraphCanvas from '../components/editor/GraphCanvas'
import NodeSidebar from '../components/editor/NodeSidebar'
import EditorToolbar from '../components/editor/EditorToolbar'

export default function EditorPage() {
  const { id: projectId } = useParams()
  const { nodes, edges, routes, selectedNodeId, loadGraph, setSaveStatus } = useEditorStore()
  const [projectTitle, setProjectTitle] = useState('')

  // 프로젝트 데이터 로드
  useEffect(() => {
    const load = async () => {
      loadGraph({ projectId, nodes: [], edges: [], routes: [] })
      const [{ data: project, error: pe }, { data: dbNodes }, { data: dbEdges }, { data: dbRoutes }] =
        await Promise.all([
          supabase.from('projects').select('title').eq('id', projectId).single(),
          supabase.from('nodes').select('*').eq('project_id', projectId),
          supabase.from('edges').select('*').eq('project_id', projectId),
          supabase.from('routes').select('*').eq('project_id', projectId),
        ])

      if (pe || !project) { setSaveStatus('error'); return }
      setProjectTitle(project?.title ?? '')

      const flowNodes = (dbNodes ?? []).map((n) => ({
        id: n.id,
        type: 'storyNode',
        position: { x: n.position_x, y: n.position_y },
        data: { title: n.title, nodeType: n.type, content: n.content ?? {}, color: n.color, routeId: n.route_id, projectId },
      }))

      const flowEdges = (dbEdges ?? []).map((e) => ({
        id: e.id,
        source: e.source_node_id,
        target: e.target_node_id,
        type: 'labeledEdge',
        data: { label: e.label ?? '' },
      }))

      loadGraph({ projectId, nodes: flowNodes, edges: flowEdges, routes: dbRoutes ?? [] })
    }
    load()
  }, [projectId, loadGraph])

  const save = useCallback(async () => {
    setSaveStatus('saving')
    try {
      const routeRows = routes.map((r) => ({ id: r.id, project_id: projectId, name: r.name, color: r.color }))
      const nodeRows = nodes.map((n) => ({
        id: n.id, project_id: projectId, route_id: n.data.routeId ?? null,
        type: n.data.nodeType, title: n.data.title, content: n.data.content,
        color: n.data.color ?? null, position_x: n.position.x, position_y: n.position.y,
      }))
      const edgeRows = edges.map((e) => ({
        id: e.id, project_id: projectId,
        source_node_id: e.source, target_node_id: e.target, label: e.data?.label ?? null,
      }))

      // Upsert current rows (safe: no destruction window)
      if (routeRows.length > 0) await supabase.from('routes').upsert(routeRows, { onConflict: 'id' })
      if (nodeRows.length > 0) await supabase.from('nodes').upsert(nodeRows, { onConflict: 'id' })
      if (edgeRows.length > 0) await supabase.from('edges').upsert(edgeRows, { onConflict: 'id' })

      // Delete orphaned rows (rows in DB but no longer in current set)
      const edgeIds = edgeRows.map((e) => e.id)
      const nodeIds = nodeRows.map((n) => n.id)
      const routeIds = routeRows.map((r) => r.id)

      if (edgeIds.length > 0) {
        await supabase.from('edges').delete().eq('project_id', projectId).not('id', 'in', `(${edgeIds.join(',')})`)
      } else {
        await supabase.from('edges').delete().eq('project_id', projectId)
      }
      if (nodeIds.length > 0) {
        await supabase.from('nodes').delete().eq('project_id', projectId).not('id', 'in', `(${nodeIds.join(',')})`)
      } else {
        await supabase.from('nodes').delete().eq('project_id', projectId)
      }
      if (routeIds.length > 0) {
        await supabase.from('routes').delete().eq('project_id', projectId).not('id', 'in', `(${routeIds.join(',')})`)
      } else {
        await supabase.from('routes').delete().eq('project_id', projectId)
      }

      setSaveStatus('saved')
    } catch (err) {
      console.error('[EditorPage] save failed:', err)
      setSaveStatus('error')
    }
  }, [nodes, edges, routes, projectId, setSaveStatus])

  const [triggerSave] = useAutoSave(save, 1500)

  // 변경 감지 → 자동저장 트리거 (로드 직후 불필요한 저장 방지: projectId 체크)
  useEffect(() => {
    if (useEditorStore.getState().projectId === projectId) triggerSave()
  }, [nodes, edges, routes, triggerSave])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <EditorToolbar projectId={projectId} projectTitle={projectTitle} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <GraphCanvas projectId={projectId} />
        {selectedNodeId && <NodeSidebar />}
      </div>
    </div>
  )
}
