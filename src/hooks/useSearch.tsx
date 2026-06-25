import { useMemo } from 'react'
import type { Card, ColumnKey, Priority } from '../utils/constants'

export type SearchFilters = {
  query: string
  priority: Priority | 'all'
  assignedTo: string | 'all'
  status: ColumnKey | 'all'
}

export function useSearch(cards: Card[], filters: SearchFilters) {
  return useMemo(() => {
    const query = filters.query.trim().toLowerCase()

    return cards.filter((card) => {
      const matchesQuery =
        !query || 
        card.title.toLowerCase().includes(query) ||
        card.description.toLowerCase().includes(query)
      const matchesPriority = filters.priority === 'all' || card.priority === filters.priority
      const matchesStatus = filters.status === 'all' || card.column === filters.status
      const matchesAssigned = filters.assignedTo === 'all' || card.assignedTo === filters.assignedTo
      return matchesQuery && matchesPriority && matchesStatus && matchesAssigned
    })
  }, [cards, filters])
}
