import type { Mission, NavItem, Suggestion } from '@/types/chat'

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

