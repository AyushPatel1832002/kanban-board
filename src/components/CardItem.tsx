import React, { useCallback } from 'react'

type Card = {id: string; title: string; column: string}

function CardItem({card, onEdit, onDelete, onMove, isPending, index}: {card: Card; onEdit: ()=>void; onDelete: ()=>void; onMove: (id:string,to:string,from:string)=>void; isPending: (id:string)=>boolean; index?: number}) {
  const dragStart = useCallback((e:any) => {
    e.dataTransfer.setData('text', JSON.stringify({id: card.id, from: card.column}))
  }, [card.id, card.column])

  return (
    <div draggable={!isPending(card.id)} onDragStart={dragStart} className="card" style={{ ['--i' as any]: index ?? 0 } as React.CSSProperties}>
      <div className="title" onDoubleClick={onEdit}>{card.title}</div>
      <div className="actions">
        <button title="Move to To Do" onClick={() => onMove(card.id, 'todo', card.column)} disabled={card.column==='todo' || isPending(card.id)}>←</button>
        <button title="Move to In Progress" onClick={() => onMove(card.id, 'inprogress', card.column)} disabled={card.column==='inprogress' || isPending(card.id)}>↔</button>
        <button title="Move to Done" onClick={() => onMove(card.id, 'done', card.column)} disabled={card.column==='done' || isPending(card.id)}>→</button>
        <button title="Delete" onClick={() => { if (confirm('Delete this card?')) onDelete() }}>✕</button>
      </div>
    </div>
  )
}

export default React.memo(CardItem)
