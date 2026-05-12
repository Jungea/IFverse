import dagre from 'dagre'

const NODE_W = 140
const NODE_H = 60

export function applyAutoLayout(nodes, edges) {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 60 })
  g.setDefaultEdgeLabel(() => ({}))

  nodes.forEach((n) => g.setNode(n.id, { width: n.width ?? NODE_W, height: n.height ?? NODE_H }))
  edges.forEach((e) => g.setEdge(e.source, e.target))

  dagre.layout(g)

  return nodes.map((n) => {
    const { x, y } = g.node(n.id)
    return { ...n, position: { x: x - (n.width ?? NODE_W) / 2, y: y - (n.height ?? NODE_H) / 2 } }
  })
}
