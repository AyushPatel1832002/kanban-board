import React, { useEffect, useState } from 'react'

export default function EditModal({card, onClose, onSave}:{card:any|null; onClose: ()=>void; onSave: (id:string,title:string)=>void}){
  const [title, setTitle] = useState(card?.title||'')
  useEffect(()=> setTitle(card?.title||''), [card])
  if (!card) return null
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Edit card</h3>
        <input value={title} onChange={e=>setTitle(e.target.value)} style={{width:'100%', padding:8, marginTop:8}} />
        <div style={{marginTop:10, display:'flex', gap:8, justifyContent:'flex-end'}}>
          <button onClick={onClose}>Cancel</button>
          <button className="primary" onClick={()=>onSave(card.id, title)}>Save</button>
        </div>
      </div>
    </div>
  )
}
