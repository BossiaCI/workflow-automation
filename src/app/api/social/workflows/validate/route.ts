import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { z } from "zod"

const nodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.record(z.any()),
})

const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
})

const workflowSchema = z.object({
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { nodes, edges } = workflowSchema.parse(body)

    const errors = []

    // Validate start node
    const startNodes = nodes.filter(node => node.type === 'start')
    if (startNodes.length === 0) {
      errors.push({ nodeId: '', message: 'Workflow must have a start node' })
    } else if (startNodes.length > 1) {
      errors.push({ nodeId: '', message: 'Workflow can only have one start node' })
    }

    // Validate end node
    const endNodes = nodes.filter(node => node.type === 'end')
    if (endNodes.length === 0) {
      errors.push({ nodeId: '', message: 'Workflow must have an end node' })
    }

    // Validate node connections
    nodes.forEach(node => {
      const outgoingEdges = edges.filter(edge => edge.source === node.id)
      const incomingEdges = edges.filter(edge => edge.target === node.id)

      if (node.type === 'start' && incomingEdges.length > 0) {
        errors.push({ nodeId: node.id, message: 'Start node cannot have incoming connections' })
      }

      if (node.type === 'end' && outgoingEdges.length > 0) {
        errors.push({ nodeId: node.id, message: 'End node cannot have outgoing connections' })
      }

      if (node.type === 'condition' && outgoingEdges.length !== 2) {
        errors.push({ nodeId: node.id, message: 'Condition node must have exactly two outputs' })
      }
    })

    return NextResponse.json({
      isValid: errors.length === 0,
      errors,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 })
    }
    console.error("[WORKFLOW_VALIDATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}