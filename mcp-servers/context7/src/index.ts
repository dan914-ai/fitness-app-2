#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Context {
  id: string;
  name: string;
  content: string;
  type: 'text' | 'code' | 'data' | 'template';
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  version: number;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
  accessCount: number;
}

interface ContextVersion {
  version: number;
  content: string;
  updatedAt: string;
  changelog?: string;
}

class Context7Server {
  private server: Server;
  private contexts: Map<string, Context> = new Map();
  private contextVersions: Map<string, ContextVersion[]> = new Map();
  private storageDir: string;
  private contextsFile: string;
  private nextId = 1;

  constructor() {
    this.storageDir = path.join(__dirname, '..', 'data');
    this.contextsFile = path.join(this.storageDir, 'contexts.json');
    
    this.server = new Server(
      {
        name: '@new-fitness-app/context7-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.loadContexts().catch(console.error);
    this.initialize();
  }

  private async initialize() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      await this.loadContexts();
    } catch (error) {
      console.error('Failed to initialize storage:', error);
    }
  }

  private generateId(): string {
    return `CTX-${this.nextId++}`;
  }

  private async loadContexts() {
    try {
      const contextFile = path.join(this.storageDir, 'contexts.json');
      const data = await fs.readFile(contextFile, 'utf-8');
      const loaded = JSON.parse(data);
      
      if (loaded.contexts) {
        loaded.contexts.forEach((ctx: Context) => {
          this.contexts.set(ctx.id, ctx);
          if (loaded.versions && loaded.versions[ctx.id]) {
            this.contextVersions.set(ctx.id, loaded.versions[ctx.id]);
          }
        });
      }
      
      if (loaded.nextId) {
        this.nextId = loaded.nextId;
      }
    } catch (error) {
      // File doesn't exist yet, that's okay
    }
  }

  private async saveContexts() {
    try {
      const contextFile = path.join(this.storageDir, 'contexts.json');
      const data = {
        contexts: Array.from(this.contexts.values()),
        versions: Object.fromEntries(this.contextVersions),
        nextId: this.nextId,
      };
      await fs.writeFile(contextFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save contexts:', error);
    }
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'save_context',
          description: 'Save content as a named context with versioning',
          inputSchema: {
            type: 'object',
            properties: {
              name: { 
                type: 'string', 
                description: 'Unique context name' 
              },
              content: { 
                type: 'string', 
                description: 'Content to save' 
              },
              type: {
                type: 'string',
                enum: ['text', 'code', 'data', 'template'],
                default: 'text',
                description: 'Content type'
              },
              category: {
                type: 'string',
                description: 'Category for organization'
              },
              tags: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Tags for searching'
              },
              metadata: { 
                type: 'object',
                description: 'Additional metadata'
              },
              changelog: {
                type: 'string',
                description: 'Description of changes (for updates)'
              },
            },
            required: ['name', 'content'],
          },
        },
        {
          name: 'get_context',
          description: 'Retrieve a context by name or ID',
          inputSchema: {
            type: 'object',
            properties: {
              identifier: { 
                type: 'string', 
                description: 'Context name or ID' 
              },
              version: {
                type: 'number',
                description: 'Specific version to retrieve'
              },
            },
            required: ['identifier'],
          },
        },
        {
          name: 'list_contexts',
          description: 'List all contexts with filtering',
          inputSchema: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['text', 'code', 'data', 'template'],
                description: 'Filter by type'
              },
              category: {
                type: 'string',
                description: 'Filter by category'
              },
              tag: { 
                type: 'string', 
                description: 'Filter by tag' 
              },
              sort: {
                type: 'string',
                enum: ['name', 'created', 'updated', 'accessed', 'popularity'],
                default: 'updated',
                description: 'Sort order'
              },
            },
          },
        },
        {
          name: 'update_context',
          description: 'Update context metadata without changing content',
          inputSchema: {
            type: 'object',
            properties: {
              id: { 
                type: 'string', 
                description: 'Context ID' 
              },
              name: { 
                type: 'string', 
                description: 'New name' 
              },
              type: {
                type: 'string',
                enum: ['text', 'code', 'data', 'template'],
                description: 'New type'
              },
              category: {
                type: 'string',
                description: 'New category'
              },
              tags: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'New tags'
              },
              metadata: { 
                type: 'object',
                description: 'New metadata'
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'delete_context',
          description: 'Delete a context and all its versions',
          inputSchema: {
            type: 'object',
            properties: {
              id: { 
                type: 'string', 
                description: 'Context ID to delete' 
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'search_contexts',
          description: 'Full-text search across contexts',
          inputSchema: {
            type: 'object',
            properties: {
              query: { 
                type: 'string', 
                description: 'Search query' 
              },
              includeContent: {
                type: 'boolean',
                default: true,
                description: 'Search in content as well'
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_context_versions',
          description: 'Get version history for a context',
          inputSchema: {
            type: 'object',
            properties: {
              id: { 
                type: 'string', 
                description: 'Context ID' 
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'revert_context',
          description: 'Revert context to a previous version',
          inputSchema: {
            type: 'object',
            properties: {
              id: { 
                type: 'string', 
                description: 'Context ID' 
              },
              version: {
                type: 'number',
                description: 'Version to revert to'
              },
            },
            required: ['id', 'version'],
          },
        },
        {
          name: 'export_contexts',
          description: 'Export contexts to a format',
          inputSchema: {
            type: 'object',
            properties: {
              format: {
                type: 'string',
                enum: ['json', 'markdown', 'yaml'],
                default: 'json',
                description: 'Export format'
              },
              ids: {
                type: 'array',
                items: { type: 'string' },
                description: 'Specific context IDs to export (all if empty)'
              },
            },
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'save_context':
          return this.saveContext(request.params.arguments);
        case 'get_context':
          return this.getContext(request.params.arguments);
        case 'list_contexts':
          return this.listContexts(request.params.arguments);
        case 'update_context':
          return this.updateContext(request.params.arguments);
        case 'delete_context':
          return this.deleteContext(request.params.arguments);
        case 'search_contexts':
          return this.searchContexts(request.params.arguments);
        case 'get_context_versions':
          return this.getContextVersions(request.params.arguments);
        case 'revert_context':
          return this.revertContext(request.params.arguments);
        case 'export_contexts':
          return this.exportContexts(request.params.arguments);
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  private async saveContext(args: any) {
    // Check if context with this name already exists
    const existing = Array.from(this.contexts.values()).find(c => c.name === args.name);
    
    if (existing) {
      // Update existing context with new version
      const versions = this.contextVersions.get(existing.id) || [];
      versions.push({
        version: existing.version,
        content: existing.content,
        updatedAt: existing.updatedAt,
        changelog: args.changelog,
      });
      this.contextVersions.set(existing.id, versions);
      
      existing.content = args.content;
      existing.version++;
      existing.updatedAt = new Date().toISOString();
      
      if (args.type) existing.type = args.type;
      if (args.category) existing.category = args.category;
      if (args.tags) existing.tags = args.tags;
      if (args.metadata) existing.metadata = args.metadata;
      
      await this.saveContexts();
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ Context updated: "${existing.name}" (v${existing.version})\nID: ${existing.id}\n${args.changelog ? `Changes: ${args.changelog}` : ''}`,
          },
        ],
      };
    } else {
      // Create new context
      const context: Context = {
        id: this.generateId(),
        name: args.name,
        content: args.content,
        type: args.type || 'text',
        category: args.category,
        tags: args.tags || [],
        metadata: args.metadata || {},
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        accessCount: 0,
      };
      
      this.contexts.set(context.id, context);
      await this.saveContexts();
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ Context saved: "${context.name}"\nID: ${context.id}\nType: ${context.type}`,
          },
        ],
      };
    }
  }

  private async getContext(args: any) {
    let context: Context | undefined;
    
    // Try to find by ID first
    context = this.contexts.get(args.identifier);
    
    // If not found, try to find by name
    if (!context) {
      context = Array.from(this.contexts.values()).find(c => c.name === args.identifier);
    }
    
    if (!context) {
      throw new Error(`Context not found: ${args.identifier}`);
    }
    
    // Update access tracking
    context.lastAccessedAt = new Date().toISOString();
    context.accessCount++;
    await this.saveContexts();
    
    // If specific version requested
    if (args.version && args.version !== context.version) {
      const versions = this.contextVersions.get(context.id) || [];
      const version = versions.find(v => v.version === args.version);
      
      if (!version) {
        throw new Error(`Version ${args.version} not found for context ${context.name}`);
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `# ${context.name} (v${args.version})

${version.content}

---
Type: ${context.type} | Category: ${context.category || 'None'}
Tags: ${context.tags?.join(', ') || 'None'}
Updated: ${new Date(version.updatedAt).toLocaleString()}`,
          },
        ],
      };
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `# ${context.name} (v${context.version})

${context.content}

---
Type: ${context.type} | Category: ${context.category || 'None'}
Tags: ${context.tags?.join(', ') || 'None'}
Access Count: ${context.accessCount} | Last Accessed: ${new Date(context.lastAccessedAt).toLocaleString()}`,
        },
      ],
    };
  }

  private listContexts(args: any) {
    let contexts = Array.from(this.contexts.values());
    
    // Apply filters
    if (args.type) {
      contexts = contexts.filter(c => c.type === args.type);
    }
    if (args.category) {
      contexts = contexts.filter(c => c.category === args.category);
    }
    if (args.tag) {
      contexts = contexts.filter(c => c.tags?.includes(args.tag));
    }
    
    // Sort contexts
    const sortBy = args.sort || 'updated';
    contexts.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'accessed':
          return new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime();
        case 'popularity':
          return b.accessCount - a.accessCount;
        default: // updated
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
    
    if (contexts.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: '📚 No contexts found.',
          },
        ],
      };
    }
    
    const typeEmojis = {
      text: '📝',
      code: '💻',
      data: '📊',
      template: '📋',
    };
    
    let output = `📚 **Context Library** (${contexts.length} items)\n\n`;
    
    contexts.forEach(c => {
      const emoji = typeEmojis[c.type];
      output += `${emoji} **${c.name}** (${c.id})\n`;
      output += `   v${c.version} | ${c.category || 'Uncategorized'} | ${c.accessCount} views\n`;
      if (c.tags && c.tags.length > 0) {
        output += `   Tags: ${c.tags.map(t => `#${t}`).join(' ')}\n`;
      }
      output += `   Updated: ${new Date(c.updatedAt).toLocaleDateString()}\n\n`;
    });
    
    return {
      content: [
        {
          type: 'text',
          text: output.trim(),
        },
      ],
    };
  }

  private async updateContext(args: any) {
    const context = this.contexts.get(args.id);
    if (!context) {
      throw new Error(`Context not found: ${args.id}`);
    }
    
    if (args.name !== undefined) context.name = args.name;
    if (args.type !== undefined) context.type = args.type;
    if (args.category !== undefined) context.category = args.category;
    if (args.tags !== undefined) context.tags = args.tags;
    if (args.metadata !== undefined) context.metadata = args.metadata;
    
    context.updatedAt = new Date().toISOString();
    await this.saveContexts();
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Context metadata updated: "${context.name}"`,
        },
      ],
    };
  }

  private async deleteContext(args: any) {
    if (!this.contexts.has(args.id)) {
      throw new Error(`Context not found: ${args.id}`);
    }
    
    const context = this.contexts.get(args.id)!;
    this.contexts.delete(args.id);
    this.contextVersions.delete(args.id);
    await this.saveContexts();
    
    return {
      content: [
        {
          type: 'text',
          text: `🗑️ Context deleted: "${context.name}" (${context.version} versions removed)`,
        },
      ],
    };
  }

  private searchContexts(args: any) {
    const query = args.query.toLowerCase();
    const results = Array.from(this.contexts.values()).filter(c => {
      const inName = c.name.toLowerCase().includes(query);
      const inTags = c.tags?.some(t => t.toLowerCase().includes(query));
      const inCategory = c.category?.toLowerCase().includes(query);
      const inContent = args.includeContent && c.content.toLowerCase().includes(query);
      
      return inName || inTags || inCategory || inContent;
    });
    
    if (results.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `🔍 No contexts found matching "${args.query}"`,
          },
        ],
      };
    }
    
    const output = results.map(c => {
      const preview = c.content.substring(0, 150).replace(/\n/g, ' ');
      return `📄 **${c.name}** (${c.id})\n   ${preview}${c.content.length > 150 ? '...' : ''}\n   Type: ${c.type} | Tags: ${c.tags?.join(', ') || 'None'}`;
    }).join('\n\n');
    
    return {
      content: [
        {
          type: 'text',
          text: `🔍 Found ${results.length} context(s) matching "${args.query}":\n\n${output}`,
        },
      ],
    };
  }

  private getContextVersions(args: any) {
    const context = this.contexts.get(args.id);
    if (!context) {
      throw new Error(`Context not found: ${args.id}`);
    }
    
    const versions = this.contextVersions.get(args.id) || [];
    
    let output = `# Version History: ${context.name}\n\n`;
    output += `Current Version: v${context.version}\n\n`;
    
    if (versions.length === 0) {
      output += 'No previous versions available.';
    } else {
      output += '## Previous Versions:\n\n';
      versions.reverse().forEach(v => {
        output += `### Version ${v.version}\n`;
        output += `Updated: ${new Date(v.updatedAt).toLocaleString()}\n`;
        if (v.changelog) {
          output += `Changes: ${v.changelog}\n`;
        }
        output += '\n';
      });
    }
    
    return {
      content: [
        {
          type: 'text',
          text: output,
        },
      ],
    };
  }

  private async revertContext(args: any) {
    const context = this.contexts.get(args.id);
    if (!context) {
      throw new Error(`Context not found: ${args.id}`);
    }
    
    const versions = this.contextVersions.get(args.id) || [];
    const targetVersion = versions.find(v => v.version === args.version);
    
    if (!targetVersion) {
      throw new Error(`Version ${args.version} not found for context ${context.name}`);
    }
    
    // Save current version before reverting
    versions.push({
      version: context.version,
      content: context.content,
      updatedAt: context.updatedAt,
      changelog: `Reverted from v${context.version} to v${args.version}`,
    });
    
    // Revert to target version
    context.content = targetVersion.content;
    context.version++;
    context.updatedAt = new Date().toISOString();
    
    await this.saveContexts();
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Context reverted: "${context.name}" to v${args.version}\nNew version: v${context.version}`,
        },
      ],
    };
  }

  private exportContexts(args: any) {
    let contexts = Array.from(this.contexts.values());
    
    if (args.ids && args.ids.length > 0) {
      contexts = contexts.filter(c => args.ids.includes(c.id));
    }
    
    const format = args.format || 'json';
    let output = '';
    
    switch (format) {
      case 'json':
        output = JSON.stringify(contexts, null, 2);
        break;
        
      case 'markdown':
        output = '# Exported Contexts\n\n';
        contexts.forEach(c => {
          output += `## ${c.name}\n\n`;
          output += `- **ID**: ${c.id}\n`;
          output += `- **Type**: ${c.type}\n`;
          output += `- **Category**: ${c.category || 'None'}\n`;
          output += `- **Tags**: ${c.tags?.join(', ') || 'None'}\n`;
          output += `- **Version**: ${c.version}\n\n`;
          output += '### Content:\n\n';
          output += '```\n' + c.content + '\n```\n\n';
          output += '---\n\n';
        });
        break;
        
      case 'yaml':
        output = 'contexts:\n';
        contexts.forEach(c => {
          output += `  - id: "${c.id}"\n`;
          output += `    name: "${c.name}"\n`;
          output += `    type: "${c.type}"\n`;
          output += `    category: "${c.category || ''}"\n`;
          output += `    tags: [${c.tags?.map(t => `"${t}"`).join(', ') || ''}]\n`;
          output += `    version: ${c.version}\n`;
          output += `    content: |\n`;
          c.content.split('\n').forEach(line => {
            output += `      ${line}\n`;
          });
          output += '\n';
        });
        break;
    }
    
    return {
      content: [
        {
          type: 'text',
          text: output,
        },
      ],
    };
  }

  private async loadContexts() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      const data = await fs.readFile(this.contextsFile, 'utf-8');
      const savedContexts = JSON.parse(data);
      
      savedContexts.forEach((context: Context) => {
        this.contexts.set(context.id, context);
        const contextNum = parseInt(context.id.split('-')[1]);
        if (contextNum >= this.nextId) {
          this.nextId = contextNum + 1;
        }
      });
      
      // Load versions
      for (const context of savedContexts) {
        const versionsFile = path.join(this.storageDir, `${context.id}-versions.json`);
        try {
          const versionsData = await fs.readFile(versionsFile, 'utf-8');
          this.contextVersions.set(context.id, JSON.parse(versionsData));
        } catch {
          // No versions file yet
        }
      }
    } catch (error) {
      // Initialize empty storage
      await this.saveContexts();
    }
  }

  private async saveContexts() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      const contextsArray = Array.from(this.contexts.values());
      await fs.writeFile(this.contextsFile, JSON.stringify(contextsArray, null, 2));
    } catch (error) {
      console.error('Failed to save contexts:', error);
    }
  }

  private async saveVersions(contextId: string) {
    const versions = this.contextVersions.get(contextId) || [];
    const versionsFile = path.join(this.storageDir, `${contextId}-versions.json`);
    await fs.writeFile(versionsFile, JSON.stringify(versions, null, 2));
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Context7 MCP server is running...');
  }
}

const server = new Context7Server();
server.run().catch(console.error);