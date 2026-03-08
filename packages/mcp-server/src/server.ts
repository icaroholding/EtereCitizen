import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { citizenVerifyAgentTool } from './tools/citizen_verify_agent.js';
import { citizenPresentIdentityTool } from './tools/citizen_present_identity.js';
import { citizenConnectWalletTool } from './tools/citizen_connect_wallet.js';
import { citizenCreateWalletTool } from './tools/citizen_create_wallet.js';
import { citizenRequestPaymentTool } from './tools/citizen_request_payment.js';
import { citizenSubmitReviewTool } from './tools/citizen_submit_review.js';
import { citizenSearchAgentsTool } from './tools/citizen_search_agents.js';

const tools = [
  citizenVerifyAgentTool,
  citizenPresentIdentityTool,
  citizenConnectWalletTool,
  citizenCreateWalletTool,
  citizenRequestPaymentTool,
  citizenSubmitReviewTool,
  citizenSearchAgentsTool,
];

export function createMCPServer() {
  const server = new Server(
    {
      name: 'eterecitizen',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = tools.find((t) => t.name === request.params.name);
    if (!tool) {
      throw new Error(`Unknown tool: ${request.params.name}`);
    }

    try {
      const result = await tool.execute(request.params.arguments as any);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

export async function startServer() {
  const server = createMCPServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
