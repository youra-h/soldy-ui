import { tools } from './clickup-tools.mjs'

const reads = new Set(['clickup_get_task', 'clickup_get_comments', 'clickup_list_by_status'])
export function listTools() {
	return Object.entries(tools).map(([name, tool]) => ({
		name,
		description: tool.description,
		inputSchema: tool.schema,
		annotations: { readOnlyHint: reads.has(name), destructiveHint: !reads.has(name) },
	}))
}
export async function callTool(name, args) {
	if (!Object.hasOwn(tools, name)) throw new Error(`Unknown tool: ${name}`)
	const tool = tools[name]
	if (!args || typeof args !== 'object' || Array.isArray(args))
		throw new Error('Arguments must be an object')
	for (const key of tool.schema.required ?? [])
		if (!Object.hasOwn(args, key)) throw new Error(`Missing argument: ${key}`)
	for (const [key, value] of Object.entries(args)) {
		const property = tool.schema.properties[key]
		if (!property) throw new Error(`Unknown argument: ${key}`)
		if (typeof value !== property.type)
			throw new Error(`Invalid type for ${key}: expected ${property.type}`)
		if (property.enum && !property.enum.includes(value))
			throw new Error(`Invalid ${key}; expected ${property.enum.join(', ')}`)
		if (typeof value === 'string' && !value.trim()) throw new Error(`Empty argument: ${key}`)
		if (key.endsWith('_id') && !/^[a-zA-Z0-9_-]+$/.test(value))
			throw new Error(`Invalid identifier: ${key}`)
	}
	return tool.run(args)
}
