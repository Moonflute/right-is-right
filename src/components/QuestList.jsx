import QuestItem from './QuestItem'

function QuestList({ quests, onToggle, onReset, onAdjust, onDelete, onReorder }) {
  if (quests.length === 0) {
    return <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '2rem 0' }}>퀘스트가 없습니다.</p>
  }

  return (
    <div className="quest-list">
      {quests.map((q, index) => (
        <QuestItem 
          key={q.id} 
          quest={q}
          index={index}
          totalItems={quests.length}
          onToggle={() => onToggle(q.id)} 
          onReset={() => onReset(q.id)} 
          onAdjust={(direction) => onAdjust(q.id, direction)}
          onDelete={() => onDelete(q.id)}
          onReorder={(direction) => onReorder(q.id, direction)}
        />
      ))}
    </div>
  )
}

export default QuestList
