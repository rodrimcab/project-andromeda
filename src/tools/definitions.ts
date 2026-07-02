import { SchemaType, type FunctionDeclarationsTool } from '@google/generative-ai'

export const ANDROMEDA_TOOLS: FunctionDeclarationsTool[] = [
  {
    functionDeclarations: [
      {
        name: 'get_nasa_apod',
        description:
          'Fetches NASA Astronomy Picture of the Day (APOD) for a specific date or today. Use when the user asks for NASA images, APOD, astronomy pictures, or daily space photos.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            date: {
              type: SchemaType.STRING,
              description:
                'Optional date in YYYY-MM-DD format. Defaults to today when omitted.',
            },
          },
        },
      },
      {
        name: 'save_mission',
        description:
          "Saves a space mission, discovery, or image to the user's mission log. Use when the user wants to save, bookmark, or keep something from the conversation.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            title: {
              type: SchemaType.STRING,
              description: 'Title of the mission or discovery to save.',
            },
            description: {
              type: SchemaType.STRING,
              description: 'Optional short description of what is being saved.',
            },
            imageUrl: {
              type: SchemaType.STRING,
              description: 'Optional image URL associated with the mission.',
            },
          },
          required: ['title'],
        },
      },
    ],
  },
]
