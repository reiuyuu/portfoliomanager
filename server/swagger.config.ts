import { Options } from 'swagger-jsdoc'

export const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portfolio Manager API',
      version: '1.0.0',
      description:
        'A comprehensive API for managing portfolios, todos, and user profiles',
      contact: {
        name: 'Portfolio Manager Team',
        email: 'support@portfoliomanager.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:{port}',
        description: 'Development server',
        variables: {
          port: {
            default: '3001',
            description: 'API server port',
          },
        },
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'email'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user identifier',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
              example: '2023-01-01T12:00:00Z',
            },
          },
        },
        Todo: {
          type: 'object',
          required: ['id', 'user_id', 'task'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique todo identifier',
              example: '123e4567-e89b-12d3-a456-426614174001',
            },
            user_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the user who owns this todo',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            task: {
              type: 'string',
              minLength: 4,
              description: 'Task description',
              example: 'Complete the project documentation',
            },
            completed: {
              type: 'boolean',
              description: 'Whether the task is completed',
              example: false,
              default: false,
            },
            inserted_at: {
              type: 'string',
              format: 'date-time',
              description: 'Todo creation timestamp',
              example: '2023-01-01T12:00:00Z',
            },
          },
        },
        Profile: {
          type: 'object',
          required: ['id', 'user_id'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique profile identifier',
              example: '123e4567-e89b-12d3-a456-426614174002',
            },
            user_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the user this profile belongs to',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              description: 'User display name',
              example: 'John Doe',
            },
            bio: {
              type: 'string',
              description: 'User biography',
              example:
                'Full-stack developer passionate about creating amazing user experiences',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Profile last update timestamp',
              example: '2023-01-01T12:00:00Z',
            },
          },
        },
        Color: {
          type: 'object',
          required: ['id', 'name', 'value'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique color identifier',
              example: '123e4567-e89b-12d3-a456-426614174003',
            },
            name: {
              type: 'string',
              description: 'Color name',
              example: 'Primary Blue',
            },
            value: {
              type: 'string',
              pattern: '^#[0-9A-Fa-f]{6}$',
              description: 'Hexadecimal color value',
              example: '#3B82F6',
            },
          },
        },
        ApiResponse: {
          type: 'object',
          required: ['success'],
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful',
              example: true,
            },
            data: {
              type: 'object',
              description: 'Response data (varies by endpoint)',
            },
            error: {
              type: 'string',
              description: 'Error message (only present when success is false)',
              example: 'Email and password are required',
            },
            count: {
              type: 'number',
              description: 'Number of items returned (for list endpoints)',
              example: 5,
            },
            message: {
              type: 'string',
              description: 'Success or informational message',
              example: 'Operation completed successfully',
            },
          },
        },
        Error: {
          type: 'object',
          required: ['success', 'error'],
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message describing what went wrong',
              example: 'Email and password are required',
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description:
            'Bad request - validation error or missing required fields',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        InternalError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints',
      },
      {
        name: 'Todos',
        description: 'Todo management endpoints',
      },
      {
        name: 'Profiles',
        description: 'User profile management endpoints',
      },
      {
        name: 'Colors',
        description: 'Color theme management endpoints',
      },
      {
        name: 'Health',
        description: 'System health check endpoints',
      },
    ],
  },
  apis: ['./server/routes/*.ts'], // 扫描路由文件中的 JSDoc 注释
}
