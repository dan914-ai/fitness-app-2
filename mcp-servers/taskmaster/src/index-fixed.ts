#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as path from 'path';
import * as fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  tags?: string[];
  dueDate?: string;
  assignee?: string;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

class TaskMasterServer {
  private server: Server;
  private tasks: Map<string, Task> = new Map();
  private nextId = 1;

  constructor() {
    this.server = new Server(
      {
        name: '@new-fitness-app/taskmaster-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.loadTasks().catch(console.error);
  }

  private generateId(): string {
    return `TASK-${this.nextId++}`;
  }

  private async loadTasks() {
    try {
      // Ensure data directory exists
      await fs.mkdir(DATA_DIR, { recursive: true });
      
      const data = await fs.readFile(TASKS_FILE, 'utf-8');
      const savedTasks = JSON.parse(data);
      
      // Load tasks into map
      savedTasks.forEach((task: Task) => {
        this.tasks.set(task.id, task);
        // Update nextId to avoid conflicts
        const taskNum = parseInt(task.id.split('-')[1]);
        if (taskNum >= this.nextId) {
          this.nextId = taskNum + 1;
        }
      });
    } catch (error) {
      // If file doesn't exist, create it with empty array
      await this.saveTasks();
    }
  }

  private async saveTasks() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const tasksArray = Array.from(this.tasks.values());
      await fs.writeFile(TASKS_FILE, JSON.stringify(tasksArray, null, 2));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'create_task',
          description: 'Create a new task with detailed properties',
          inputSchema: {
            type: 'object',
            properties: {
              title: { 
                type: 'string', 
                description: 'Task title (required)'
              },
              description: { 
                type: 'string', 
                description: 'Detailed task description' 
              },
              priority: { 
                type: 'string', 
                enum: ['low', 'medium', 'high', 'urgent'],
                default: 'medium',
                description: 'Task priority level'
              },
              category: {
                type: 'string',
                description: 'Task category (e.g., workout, nutrition, goals)'
              },
              tags: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Tags for better organization'
              },
              dueDate: { 
                type: 'string', 
                description: 'Due date in ISO format (YYYY-MM-DD)' 
              },
              assignee: {
                type: 'string',
                description: 'Person assigned to the task'
              },
            },
            required: ['title'],
          },
        },
        {
          name: 'list_tasks',
          description: 'List tasks with advanced filtering options',
          inputSchema: {
            type: 'object',
            properties: {
              status: { 
                type: 'string', 
                enum: ['pending', 'in-progress', 'completed', 'cancelled'],
                description: 'Filter by status'
              },
              priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'urgent'],
                description: 'Filter by priority'
              },
              category: {
                type: 'string',
                description: 'Filter by category'
              },
              tag: { 
                type: 'string', 
                description: 'Filter by tag' 
              },
              assignee: {
                type: 'string',
                description: 'Filter by assignee'
              },
              sort: {
                type: 'string',
                enum: ['created', 'updated', 'due', 'priority'],
                default: 'created',
                description: 'Sort order'
              },
            },
          },
        },
        {
          name: 'update_task',
          description: 'Update task properties',
          inputSchema: {
            type: 'object',
            properties: {
              id: { 
                type: 'string', 
                description: 'Task ID (required)' 
              },
              title: { 
                type: 'string', 
                description: 'New title' 
              },
              description: { 
                type: 'string', 
                description: 'New description' 
              },
              status: { 
                type: 'string', 
                enum: ['pending', 'in-progress', 'completed', 'cancelled'],
                description: 'New status'
              },
              priority: { 
                type: 'string', 
                enum: ['low', 'medium', 'high', 'urgent'],
                description: 'New priority'
              },
              category: {
                type: 'string',
                description: 'New category'
              },
              tags: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'New tags (replaces existing)'
              },
              dueDate: { 
                type: 'string', 
                description: 'New due date' 
              },
              assignee: {
                type: 'string',
                description: 'New assignee'
              },
              progress: {
                type: 'number',
                minimum: 0,
                maximum: 100,
                description: 'Task progress percentage'
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'delete_task',
          description: 'Delete a task permanently',
          inputSchema: {
            type: 'object',
            properties: {
              id: { 
                type: 'string', 
                description: 'Task ID to delete' 
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'bulk_update',
          description: 'Update multiple tasks at once',
          inputSchema: {
            type: 'object',
            properties: {
              ids: {
                type: 'array',
                items: { type: 'string' },
                description: 'Task IDs to update'
              },
              updates: {
                type: 'object',
                properties: {
                  status: { 
                    type: 'string', 
                    enum: ['pending', 'in-progress', 'completed', 'cancelled']
                  },
                  priority: { 
                    type: 'string', 
                    enum: ['low', 'medium', 'high', 'urgent']
                  },
                  assignee: { type: 'string' },
                  category: { type: 'string' },
                },
                description: 'Properties to update on all tasks'
              },
            },
            required: ['ids', 'updates'],
          },
        },
        {
          name: 'get_task',
          description: 'Get detailed information about a specific task',
          inputSchema: {
            type: 'object',
            properties: {
              id: { 
                type: 'string', 
                description: 'Task ID' 
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'search_tasks',
          description: 'Search tasks by keyword in title and description',
          inputSchema: {
            type: 'object',
            properties: {
              query: { 
                type: 'string', 
                description: 'Search keyword' 
              },
            },
            required: ['query'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'create_task':
          return this.createTask(request.params.arguments);
        case 'list_tasks':
          return this.listTasks(request.params.arguments);
        case 'update_task':
          return this.updateTask(request.params.arguments);
        case 'delete_task':
          return this.deleteTask(request.params.arguments);
        case 'bulk_update':
          return this.bulkUpdate(request.params.arguments);
        case 'get_task':
          return this.getTask(request.params.arguments);
        case 'search_tasks':
          return this.searchTasks(request.params.arguments);
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  private createTask(args: any) {
    const task: Task = {
      id: this.generateId(),
      title: args.title,
      description: args.description,
      status: 'pending',
      priority: args.priority || 'medium',
      category: args.category,
      tags: args.tags || [],
      dueDate: args.dueDate,
      assignee: args.assignee,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tasks.set(task.id, task);
    this.saveTasks().catch(console.error);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Task created successfully!

**${task.title}**
- ID: ${task.id}
- Priority: ${task.priority}
- Category: ${task.category || 'Uncategorized'}
- Status: ${task.status}
${task.dueDate ? `- Due: ${new Date(task.dueDate).toLocaleDateString()}` : ''}
${task.assignee ? `- Assigned to: ${task.assignee}` : ''}`,
        },
      ],
    };
  }

  private listTasks(args: any) {
    let tasks = Array.from(this.tasks.values());
    
    // Apply filters
    if (args.status) {
      tasks = tasks.filter(t => t.status === args.status);
    }
    if (args.priority) {
      tasks = tasks.filter(t => t.priority === args.priority);
    }
    if (args.category) {
      tasks = tasks.filter(t => t.category === args.category);
    }
    if (args.tag) {
      tasks = tasks.filter(t => t.tags?.includes(args.tag));
    }
    if (args.assignee) {
      tasks = tasks.filter(t => t.assignee === args.assignee);
    }

    // Sort tasks
    const sortBy = args.sort || 'created';
    tasks.sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'due':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    if (tasks.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: '📋 No tasks found matching the criteria.',
          },
        ],
      };
    }

    const tasksByStatus = {
      pending: tasks.filter(t => t.status === 'pending'),
      'in-progress': tasks.filter(t => t.status === 'in-progress'),
      completed: tasks.filter(t => t.status === 'completed'),
      cancelled: tasks.filter(t => t.status === 'cancelled'),
    };

    let output = `📋 **Task Summary**\n`;
    output += `Total: ${tasks.length} | `;
    output += `Pending: ${tasksByStatus.pending.length} | `;
    output += `In Progress: ${tasksByStatus['in-progress'].length} | `;
    output += `Completed: ${tasksByStatus.completed.length}\n\n`;

    tasks.forEach(t => {
      const statusEmoji = {
        pending: '⏳',
        'in-progress': '🔄',
        completed: '✅',
        cancelled: '❌',
      }[t.status];

      const priorityEmoji = {
        low: '🟢',
        medium: '🟡',
        high: '🟠',
        urgent: '🔴',
      }[t.priority];

      output += `${statusEmoji} **${t.title}** ${priorityEmoji}\n`;
      output += `   ID: ${t.id} | ${t.category || 'Uncategorized'}`;
      if (t.progress && t.progress > 0) {
        output += ` | Progress: ${t.progress}%`;
      }
      if (t.dueDate) {
        output += ` | Due: ${new Date(t.dueDate).toLocaleDateString()}`;
      }
      if (t.assignee) {
        output += ` | @${t.assignee}`;
      }
      if (t.tags && t.tags.length > 0) {
        output += `\n   Tags: ${t.tags.map(tag => `#${tag}`).join(' ')}`;
      }
      if (t.description) {
        output += `\n   ${t.description}`;
      }
      output += '\n\n';
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

  private updateTask(args: any) {
    const task = this.tasks.get(args.id);
    if (!task) {
      throw new Error(`Task not found: ${args.id}`);
    }

    // Update fields if provided
    if (args.title !== undefined) task.title = args.title;
    if (args.description !== undefined) task.description = args.description;
    if (args.status !== undefined) task.status = args.status;
    if (args.priority !== undefined) task.priority = args.priority;
    if (args.category !== undefined) task.category = args.category;
    if (args.tags !== undefined) task.tags = args.tags;
    if (args.dueDate !== undefined) task.dueDate = args.dueDate;
    if (args.assignee !== undefined) task.assignee = args.assignee;
    if (args.progress !== undefined) task.progress = args.progress;
    
    task.updatedAt = new Date().toISOString();
    this.tasks.set(args.id, task);
    this.saveTasks().catch(console.error);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Task updated successfully!\n\n**${task.title}**\nStatus: ${task.status} | Priority: ${task.priority}`,
        },
      ],
    };
  }

  private deleteTask(args: any) {
    if (!this.tasks.has(args.id)) {
      throw new Error(`Task not found: ${args.id}`);
    }

    const task = this.tasks.get(args.id)!;
    this.tasks.delete(args.id);
    this.saveTasks().catch(console.error);

    return {
      content: [
        {
          type: 'text',
          text: `🗑️ Task deleted: "${task.title}"`,
        },
      ],
    };
  }

  private bulkUpdate(args: any) {
    const updatedTasks: string[] = [];
    const notFound: string[] = [];

    for (const id of args.ids) {
      const task = this.tasks.get(id);
      if (!task) {
        notFound.push(id);
        continue;
      }

      if (args.updates.status !== undefined) task.status = args.updates.status;
      if (args.updates.priority !== undefined) task.priority = args.updates.priority;
      if (args.updates.assignee !== undefined) task.assignee = args.updates.assignee;
      if (args.updates.category !== undefined) task.category = args.updates.category;
      
      task.updatedAt = new Date().toISOString();
      this.tasks.set(id, task);
      updatedTasks.push(task.title);
    }
    
    if (updatedTasks.length > 0) {
      this.saveTasks().catch(console.error);
    }

    let message = `✅ Bulk update completed!\n\n`;
    if (updatedTasks.length > 0) {
      message += `Updated ${updatedTasks.length} tasks:\n`;
      message += updatedTasks.map(title => `- ${title}`).join('\n');
    }
    if (notFound.length > 0) {
      message += `\n\n⚠️ Not found: ${notFound.join(', ')}`;
    }

    return {
      content: [
        {
          type: 'text',
          text: message,
        },
      ],
    };
  }

  private getTask(args: any) {
    const task = this.tasks.get(args.id);
    if (!task) {
      throw new Error(`Task not found: ${args.id}`);
    }

    const output = `# ${task.title}

**ID:** ${task.id}
**Status:** ${task.status}
**Priority:** ${task.priority}
**Category:** ${task.category || 'Uncategorized'}
**Progress:** ${task.progress || 0}%

${task.description ? `## Description\n${task.description}\n` : ''}
${task.tags && task.tags.length > 0 ? `**Tags:** ${task.tags.map(t => `#${t}`).join(' ')}\n` : ''}
${task.dueDate ? `**Due Date:** ${new Date(task.dueDate).toLocaleDateString()}\n` : ''}
${task.assignee ? `**Assigned to:** ${task.assignee}\n` : ''}

**Created:** ${new Date(task.createdAt).toLocaleString()}
**Last Updated:** ${new Date(task.updatedAt).toLocaleString()}`;

    return {
      content: [
        {
          type: 'text',
          text: output,
        },
      ],
    };
  }

  private searchTasks(args: any) {
    const query = args.query.toLowerCase();
    const results = Array.from(this.tasks.values()).filter(task => 
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query)) ||
      (task.tags && task.tags.some(tag => tag.toLowerCase().includes(query))) ||
      (task.category && task.category.toLowerCase().includes(query))
    );

    if (results.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `🔍 No tasks found matching "${args.query}"`,
          },
        ],
      };
    }

    const output = results.map(t => {
      const statusEmoji = {
        pending: '⏳',
        'in-progress': '🔄',
        completed: '✅',
        cancelled: '❌',
      }[t.status];

      return `${statusEmoji} **${t.title}** (${t.id})\n   ${t.description || 'No description'}\n   Status: ${t.status} | Priority: ${t.priority}`;
    }).join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `🔍 Found ${results.length} task(s) matching "${args.query}":\n\n${output}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('TaskMaster MCP server is running...');
  }
}

const server = new TaskMasterServer();
server.run().catch(console.error);