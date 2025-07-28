import swaggerJsDoc from 'swagger-jsdoc'

const swaggerDefinition = {
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
      // Todo: {
      //   type: 'object',
      //   required: ['id', 'user_id', 'task'],
      //   properties: {
      //     id: {
      //       type: 'string',
      //       format: 'uuid',
      //       description: 'Unique todo identifier',
      //       example: '123e4567-e89b-12d3-a456-426614174001',
      //     },
      //     user_id: {
      //       type: 'string',
      //       format: 'uuid',
      //       description: 'ID of the user who owns this todo',
      //       example: '123e4567-e89b-12d3-a456-426614174000',
      //     },
      //     task: {
      //       type: 'string',
      //       minLength: 4,
      //       description: 'Task description',
      //       example: 'Complete the project documentation',
      //     },
      //     completed: {
      //       type: 'boolean',
      //       description: 'Whether the task is completed',
      //       example: false,
      //       default: false,
      //     },
      //     inserted_at: {
      //       type: 'string',
      //       format: 'date-time',
      //       description: 'Todo creation timestamp',
      //       example: '2023-01-01T12:00:00Z',
      //     },
      //   },
      // },
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
      PortfolioItem: {
        type: 'object',
        required: [
          'itemId',
          'stockTicker',
          'stockName',
          'volume',
          'purchasePrice',
          'purchaseDate',
        ],
        properties: {
          itemId: {
            type: 'integer',
            description: 'Unique portfolio item identifier',
            example: 1,
          },
          stockTicker: {
            type: 'string',
            description: 'Stock ticker symbol',
            example: 'AAPL',
          },
          stockName: {
            type: 'string',
            description: 'Full company name',
            example: 'Apple Inc.',
          },
          volume: {
            type: 'integer',
            minimum: 1,
            description: 'Number of shares owned',
            example: 100,
          },
          purchasePrice: {
            type: 'number',
            minimum: 0,
            description: 'Price per share when purchased',
            example: 150.25,
          },
          purchaseDate: {
            type: 'string',
            format: 'date',
            description: 'Date when shares were purchased',
            example: '2023-01-15',
          },
          currentPrice: {
            type: 'number',
            minimum: 0,
            description: 'Current price per share',
            example: 175.5,
          },
        },
      },
      PortfolioItemInput: {
        type: 'object',
        required: [
          'stockTicker',
          'stockName',
          'volume',
          'purchasePrice',
          'purchaseDate',
        ],
        properties: {
          stockTicker: {
            type: 'string',
            description: 'Stock ticker symbol',
            example: 'AAPL',
          },
          stockName: {
            type: 'string',
            description: 'Full company name',
            example: 'Apple Inc.',
          },
          volume: {
            type: 'integer',
            minimum: 1,
            description: 'Number of shares to purchase',
            example: 100,
          },
          purchasePrice: {
            type: 'number',
            minimum: 0,
            description: 'Price per share when purchased',
            example: 150.25,
          },
          purchaseDate: {
            type: 'string',
            format: 'date',
            description: 'Date when shares were purchased',
            example: '2023-01-15',
          },
        },
      },
      StockPerformanceItem: {
        type: 'object',
        required: ['id', 'itemId', 'date', 'price'],
        properties: {
          id: {
            type: 'integer',
            description: 'Unique performance record identifier',
            example: 1,
          },
          itemId: {
            type: 'integer',
            description: 'Portfolio item identifier',
            example: 1,
          },
          date: {
            type: 'string',
            format: 'date',
            description: 'Date of the price record',
            example: '2023-01-15',
          },
          price: {
            type: 'number',
            minimum: 0,
            description: 'Stock price on this date',
            example: 175.5,
          },
        },
      },
      StockItem: {
        type: 'object',
        required: ['id', 'stockTicker', 'stockName', 'currentPrice'],
        properties: {
          id: {
            type: 'integer',
            description: 'Unique stock identifier',
            example: 1,
          },
          stockTicker: {
            type: 'string',
            description: 'Stock ticker symbol',
            example: 'AAPL',
          },
          stockName: {
            type: 'string',
            description: 'Full company name',
            example: 'Apple Inc.',
          },
          currentPrice: {
            type: 'number',
            minimum: 0,
            description: 'Current stock price',
            example: 175.5,
          },
          updateDate: {
            type: 'string',
            format: 'date',
            description: 'Date when price was last updated',
            example: '2023-01-15',
          },
        },
      },
      UserItem: {
        type: 'object',
        required: ['id', 'username'],
        properties: {
          id: {
            type: 'integer',
            description: 'Unique user identifier',
            example: 1,
          },
          username: {
            type: 'string',
            description: 'User name',
            example: 'john_doe',
          },
          holdings: {
            type: 'number',
            minimum: 0,
            description: 'Total value of holdings',
            example: 25000.5,
          },
          balance: {
            type: 'number',
            minimum: 0,
            description: 'Available cash balance',
            example: 5000.0,
          },
          netIncome: {
            type: 'number',
            description: 'Net income/loss from investments',
            example: 2500.25,
          },
          updateDate: {
            type: 'string',
            format: 'date',
            description: 'Date when user data was last updated',
            example: '2023-01-15',
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
    // {
    //   name: 'Authentication',
    //   description: 'User authentication endpoints',
    // },
    // {
    //   name: 'Todos',
    //   description: 'Todo management endpoints',
    // },
    // {
    //   name: 'Profiles',
    //   description: 'User profile management endpoints',
    // },
    // {
    //   name: 'Colors',
    //   description: 'Color theme management endpoints',
    // },
    // {
    //   name: 'Health',
    //   description: 'System health check endpoints',
    // },
    {
      name: 'Portfolio',
      description: 'Portfolio management endpoints',
    },
    {
      name: 'Price History',
      description: 'Stock price history and performance endpoints',
    },
    {
      name: 'Profiles',
      description: 'User profile management endpoints',
    },
    {
      name: 'Stocks',
      description: 'Stock information and search endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints',
    },
  ],
}

const options = {
  swaggerDefinition: swaggerDefinition,
  apis: [
    // './src/routes/*.ts',
    // './src/routes/**/*.ts',

    './src/routes/portfolio.ts',
    './src/routes/price-history.ts',
    './src/routes/profiles.ts',
    './src/routes/stocks.ts',
    './src/routes/users.ts',
  ],
}

export const swaggerSpec = swaggerJsDoc(options)
