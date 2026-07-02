import type { NavItem, Suggestion } from '@/types/chat'

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

