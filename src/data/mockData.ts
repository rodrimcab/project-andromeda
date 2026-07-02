import type { ChatMessage, Mission, NavItem, Suggestion } from '@/types/chat'

export const navItems: NavItem[] = [
  { id: 'chat', label: 'Chat', active: true },
  { id: 'missions', label: 'Missions Saved' },
]

export const suggestions: Suggestion[] = [
  { id: '1', label: "What's the latest SpaceX launch?" },
  { id: '2', label: 'Tell me about Mars' },
  { id: '3', label: 'Show me a random NASA image' },
  { id: '4', label: 'Explain black holes' },
  { id: '5', label: "What's the weather on Earth?" },
]

export const recentMissions: Mission[] = [
  {
    id: '1',
    title: 'The Carina Nebula',
    date: 'Saved just now',
    imageUrl:
      'https://images-assets.nasa.gov/image/STScI-PRC22-08a/STScI-PRC22-08a~orig.jpg',
    saved: true,
  },
  {
    id: '2',
    title: 'SpaceX Starship Launch',
    date: 'Yesterday',
    imageUrl:
      'https://images-assets.nasa.gov/image/KSC-2023-04-28-PH-KLS01_0001/KSC-2023-04-28-PH-KLS01_0001~orig.jpg',
    saved: true,
  },
  {
    id: '3',
    title: 'Mars Rover Discovery',
    date: '3 days ago',
    imageUrl:
      'https://images-assets.nasa.gov/image/PIA24420/PIA24420~orig.jpg',
    saved: true,
  },
]

export const initialMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    timestamp: '10:41 AM',
    type: 'text',
    content:
      "Welcome aboard, Commander! I'm Andromeda, your AI space assistant. Ask me anything about the cosmos — launches, planets, nebulae, and beyond. 🌌",
  },
  {
    id: 'user-1',
    role: 'user',
    timestamp: '10:42 AM',
    type: 'text',
    content: 'Show me the Astronomy Picture of the Day',
  },
  {
    id: 'assistant-1',
    role: 'assistant',
    timestamp: '10:42 AM',
    type: 'card',
    content: "Here's today's NASA Astronomy Picture of the Day:",
    card: {
      imageUrl:
        'https://images-assets.nasa.gov/image/STScI-PRC22-08a/STScI-PRC22-08a~orig.jpg',
      title: 'The Carina Nebula',
      description:
        'A stunning view of the Carina Nebula captured by the James Webb Space Telescope, revealing newborn stars and cosmic dust in unprecedented detail.',
      linkLabel: 'View on NASA',
      linkUrl: 'https://apod.nasa.gov/apod/astropix.html',
    },
  },
  {
    id: 'user-2',
    role: 'user',
    timestamp: '10:43 AM',
    type: 'text',
    content: 'Save this to my missions',
  },
  {
    id: 'assistant-2',
    role: 'assistant',
    timestamp: '10:43 AM',
    type: 'success',
    content: 'Mission saved successfully! 🚀',
  },
]
