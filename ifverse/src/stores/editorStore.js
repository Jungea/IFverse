import { create } from 'zustand'
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react'
import { nanoid } from 'nanoid'

export const useEditorStore = create((set, get) => ({
  projectId: null,
  nodes: [],
  edges: [],
  routes: [],
  selectedNodeId: null,
  saveStatus: 'saved', // 'saved' | 'saving' | 'error'

  setProjectId: (id) => set({ projectId: id }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),
  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
  onConnect: (connection) => set({
    edges: addEdge({ ...connection, id: nanoid(), type: 'labeledEdge', data: { label: '' } }, get().edges),
  }),

  addNode: ({ position, projectId }) => {
    const node = {
      id: nanoid(),
      type: 'storyNode',
      position,
      data: { title: 'New Scene', nodeType: 'scene', content: {}, color: null, routeId: null, projectId },
    }
    set({ nodes: [...get().nodes, node] })
    return node
  },

  deleteNode: (nodeId) => set({
    nodes: get().nodes.filter((n) => n.id !== nodeId),
    edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
  }),

  updateNodeData: (nodeId, patch) => set({
    nodes: get().nodes.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n),
  }),

  updateNodePosition: (nodeId, position) => set({
    nodes: get().nodes.map((n) => n.id === nodeId ? { ...n, position } : n),
  }),

  updateEdgeLabel: (edgeId, label) => set({
    edges: get().edges.map((e) => e.id === edgeId ? { ...e, data: { ...e.data, label } } : e),
  }),

  addRoute: ({ name, color, projectId }) => {
    const route = { id: nanoid(), name, color, projectId }
    set({ routes: [...get().routes, route] })
    return route
  },

  deleteRoute: (routeId) => set({
    routes: get().routes.filter((r) => r.id !== routeId),
    nodes: get().nodes.map((n) =>
      n.data.routeId === routeId ? { ...n, data: { ...n.data, routeId: null } } : n
    ),
  }),

  loadGraph: ({ projectId, nodes, edges, routes }) =>
    set({ projectId, nodes, edges, routes, selectedNodeId: null, saveStatus: 'saved' }),
}))
