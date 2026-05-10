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

  onNodesChange: (changes) => set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),
  onEdgesChange: (changes) => set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),
  onConnect: (connection) => set((state) => ({
    edges: addEdge({ ...connection, id: nanoid(), type: 'labeledEdge', data: { label: '' } }, state.edges),
  })),

  addNode: ({ position, projectId }) => {
    const node = {
      id: nanoid(),
      type: 'storyNode',
      position,
      data: { title: 'New Scene', nodeType: 'scene', content: {}, color: null, routeId: null, projectId },
    }
    set((state) => ({ nodes: [...state.nodes, node] }))
    return node
  },

  deleteNode: (nodeId) => set((state) => ({
    nodes: state.nodes.filter((n) => n.id !== nodeId),
    edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
  })),

  updateNodeData: (nodeId, patch) => set((state) => ({
    nodes: state.nodes.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n),
  })),

  updateNodePosition: (nodeId, position) => set((state) => ({
    nodes: state.nodes.map((n) => n.id === nodeId ? { ...n, position } : n),
  })),

  updateEdgeLabel: (edgeId, label) => set((state) => ({
    edges: state.edges.map((e) => e.id === edgeId ? { ...e, data: { ...e.data, label } } : e),
  })),

  addRoute: ({ name, color, projectId }) => {
    const route = { id: nanoid(), name, color, projectId }
    set((state) => ({ routes: [...state.routes, route] }))
    return route
  },

  deleteRoute: (routeId) => set((state) => ({
    routes: state.routes.filter((r) => r.id !== routeId),
    nodes: state.nodes.map((n) =>
      n.data.routeId === routeId ? { ...n, data: { ...n.data, routeId: null } } : n
    ),
  })),

  loadGraph: ({ projectId, nodes, edges, routes }) =>
    set({ projectId, nodes, edges, routes, selectedNodeId: null, saveStatus: 'saved' }),
}))
