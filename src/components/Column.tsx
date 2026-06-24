import React, { useCallback, useState } from 'react'
import CardItem from './CardItem'
// import CardItem from './CardItem'

type Props = {
  columnKey: string
  title: string
  cards: any[]
  count: number
  onAdd: (title: string) => void
  onEdit: (card: any) => void
  onDelete: (id: string) => void
  onMove: (id: string, to: string, from: string) => void
  isPending: (id: string) => boolean
}

function Column({columnKey, title, cards, count, onAdd, onEdit, onDelete, onMove, isPending}: Props) {
  const [newTitle, setNewTitle] = useState('')

  const handleAdd = useCallback(() => {
    const t = newTitle.trim()
    if (!t) return
    onAdd(t)
    setNewTitle('')
  }, [newTitle, onAdd])

  const onDragOver = (e:any) => e.preventDefault()
  const onDrop = (e:any) => {
    e.preventDefault()
    try{
      const data = JSON.parse(e.dataTransfer.getData('text'))
      if (data && data.id) onMove(data.id, columnKey, data.from)
    }catch(_){}
  }

  return (
    <section className="column" onDragOver={onDragOver} onDrop={onDrop}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
        <h2>{title} <span className="count">({count})</span></h2>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: 10, minHeight: 120}}>
        {cards.map((card, i) => (
          <CardItem key={card.id} card={card} index={i} onEdit={() => onEdit(card)} onDelete={() => onDelete(card.id)} onMove={onMove} isPending={isPending} />
        ))}
      </div>

      <div className="add-row">
        <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="New card" />
        <button onClick={handleAdd} className="primary">Add</button>
      </div>
    </section>
  )
}

export default React.memo(Column)
