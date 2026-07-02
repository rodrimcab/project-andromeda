import { SchemaType, type FunctionDeclarationsTool } from '@google/generative-ai'

export const ANDROMEDA_TOOLS: FunctionDeclarationsTool[] = [
  {
    functionDeclarations: [
      {
        name: 'get_today_astronomy_picture',
        description:
          "Fetches NASA's Astronomy Picture of the Day for today or a specific date. Use when the user asks for today's NASA image, today's APOD, the astronomy picture of the day, or a NASA image for a specific date.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            date: {
              type: SchemaType.STRING,
              description:
                'Optional date in YYYY-MM-DD format. Omit to fetch today\'s APOD.',
            },
          },
        },
      },
      {
        name: 'get_random_astronomy_picture',
        description:
          'Fetches a random NASA Astronomy Picture of the Day from the archive. Use when the user asks for another NASA image, a random NASA picture, a different APOD, or wants to see another astronomy photo.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {},
        },
      },
      {
        name: 'save_mission',
        description:
          "Saves the most recent NASA image or discovery from the conversation to the user's mission log. Use when the user asks to save, bookmark, or keep the current image, mission, or discovery. If title or image details are omitted, the latest APOD card in the chat is used.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            title: {
              type: SchemaType.STRING,
              description:
                'Optional title override. Defaults to the most recent NASA discovery in the chat.',
            },
            description: {
              type: SchemaType.STRING,
              description:
                'Optional short description. Defaults to the most recent discovery description.',
            },
            imageUrl: {
              type: SchemaType.STRING,
              description:
                'Optional image URL. Defaults to the most recent NASA image shown in the chat.',
            },
          },
        },
      },
    ],
  },
]
