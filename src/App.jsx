import { useState, useEffect, useCallback } from 'react'
import { PlusCircle, Target, History } from 'lucide-react'
import QuestList from './components/QuestList'
import AddQuestModal from './components/AddQuestModal'
import MasterGauge from './components/MasterGauge'
import HistoryModal from './components/HistoryModal'
import { playAlertSound } from './utils/audio'
import './index.css'

function App() {
  const [quests, setQuests] = useState(() => {
    const saved = localStorage.getItem('rightIsRightQuests')
    return saved ? JSON.parse(saved) : []
  })
  
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('rightIsRightHistory')
    return saved ? JSON.parse(saved) : []
  })

  const [lastDate, setLastDate] = useState(() => {
    const saved = localStorage.getItem('rightIsRightDate')
    return saved || new Date().toISOString().split('T')[0]
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  // -- Score Calculation Layer --
  const calculateTotalScore = useCallback((currentQuests) => {
    if (currentQuests.length === 0) return 0;
    let totalScore = 0;
    currentQuests.forEach(q => {
      if (q.type === 'plus') {
        const p = Math.min(q.currentTime / q.targetTime, 1);
        totalScore += p * 100;
      } else {
        if (q.currentTime <= q.targetTime) {
          totalScore += 100; // No penalty within limit
        } else {
          // Overtime penalty: drops from 100 down to 0 over the next targetTime duration
          const overtimeRatio = (q.currentTime - q.targetTime) / q.targetTime;
          totalScore += Math.max(0, 100 - (overtimeRatio * 100));
        }
      }
    });
    return totalScore / currentQuests.length;
  }, []);

  const summarizeDay = useCallback((currentQuests) => {
    const items = currentQuests.map(q => {
      let percent = 0;
      if (q.type === 'plus') {
        percent = Math.min(q.currentTime / q.targetTime, 1) * 100;
      } else {
        if (q.currentTime <= q.targetTime) {
          percent = 100;
        } else {
          const overtimeRatio = (q.currentTime - q.targetTime) / q.targetTime;
          percent = Math.max(0, 100 - (overtimeRatio * 100));
        }
      }
      return { title: q.title, percent, type: q.type };
    });
    return {
      date: lastDate,
      score: calculateTotalScore(currentQuests),
      items
    };
  }, [lastDate, calculateTotalScore]);

  // -- Data Persistence Layer --
  useEffect(() => {
    localStorage.setItem('rightIsRightQuests', JSON.stringify(quests))
  }, [quests])

  useEffect(() => {
    localStorage.setItem('rightIsRightHistory', JSON.stringify(history))
    localStorage.setItem('rightIsRightDate', lastDate)
  }, [history, lastDate])

  // -- Daily Reset & Main Tick --
  useEffect(() => {
    const checkDateAndTick = setInterval(() => {
      const todayStr = new Date().toISOString().split('T')[0];
      
      setQuests(prevQuests => {
        // 1. Check Date Reset
        if (todayStr !== lastDate) {
           const daySummary = summarizeDay(prevQuests);
           setHistory(prev => [...prev, daySummary]);
           setLastDate(todayStr);
           
           // Reset all quests
           return prevQuests.map(q => ({ ...q, currentTime: 0, isRunning: false, hasAlerted: false }));
        }

        // 2. Normal Time Tick
        let updated = false;
        const newQuests = prevQuests.map(q => {
          if (!q.isRunning) return q;
          updated = true;
          
          let newTime = q.currentTime + 1;
          let isFinished = false;
          let shouldAlert = false;
          
          if (q.type === 'plus') {
            if (newTime >= q.targetTime) {
              newTime = q.targetTime;
              isFinished = true;
              if (!q.hasAlerted) shouldAlert = true;
            }
          } else {
            // minus quest - no cap, keeps going!
            if (newTime >= q.targetTime && !q.hasAlerted) {
              shouldAlert = true;
            }
          }

          const res = { ...q, currentTime: newTime, isRunning: !isFinished };

          // Alert Logic
          if (shouldAlert) {
             playAlertSound(q.type);
             res.hasAlerted = true;
          }

          return res;
        });

        return updated ? newQuests : prevQuests;
      });
    }, 1000)
    
    return () => clearInterval(checkDateAndTick)
  }, [lastDate, summarizeDay])

  // -- Event Handlers --
  const handleAddQuest = (newQuest) => {
    setQuests([...quests, { ...newQuest, id: Date.now().toString(), currentTime: 0, isRunning: false, hasAlerted: false, order: quests.length }])
    setIsModalOpen(false)
  }

  const toggleTimer = (id) => {
    setQuests(quests.map(q => {
      if (q.id === id) {
        if (q.type === 'plus' && q.currentTime >= q.targetTime) return { ...q, isRunning: false }
        return { ...q, isRunning: !q.isRunning }
      }
      return q
    }))
  }

  const resetTimer = (id) => {
    setQuests(quests.map(q => q.id === id ? { ...q, currentTime: 0, isRunning: false, hasAlerted: false } : q))
  }

  const adjustTime = (id, direction) => {
    setQuests(quests.map(q => {
      if (q.id === id) {
        let newCurrent = Math.max(0, q.currentTime + (direction * 60))
        if (q.type === 'plus' && newCurrent > q.targetTime) {
           newCurrent = q.targetTime 
        }
        return { ...q, currentTime: newCurrent, hasAlerted: newCurrent < q.targetTime ? false : q.hasAlerted }
      }
      return q
    }))
  }

  const deleteQuest = (id) => {
    setQuests(quests.filter(q => q.id !== id))
  }

  const reorderQuest = (id, direction) => {
    // direction: +1 (move down visually => larger index), -1 (move up visually => smaller index)
    // Needs to swap order among its type only. 
    setQuests(prev => {
      const idx = prev.findIndex(q => q.id === id);
      if (idx === -1) return prev;
      
      const targetType = prev[idx].type;
      const sameTypeItems = prev.filter(q => q.type === targetType);
      const localIdx = sameTypeItems.findIndex(q => q.id === id);
      
      const swapLocalIdx = localIdx + direction;
      if (swapLocalIdx < 0 || swapLocalIdx >= sameTypeItems.length) return prev; // Cannot move
      
      const swapTargetId = sameTypeItems[swapLocalIdx].id;
      const swapIdx = prev.findIndex(q => q.id === swapTargetId);
      
      const newQuests = [...prev];
      const temp = newQuests[idx];
      newQuests[idx] = newQuests[swapIdx];
      newQuests[swapIdx] = temp;
      
      return newQuests;
    });
  }

  const plusQuests = quests.filter(q => q.type === 'plus')
  const minusQuests = quests.filter(q => q.type === 'minus')
  const currentTotalScore = calculateTotalScore(quests)

  return (
    <>
      <header>
        <h1 className="app-title">Right is Right</h1>
        <p className="app-subtitle">모든 밸런스는 오른쪽으로. 오직 오른쪽만이 정답입니다.</p>
        
        {quests.length > 0 && <MasterGauge score={currentTotalScore} />}
        
        <button className="btn-history" onClick={() => setIsHistoryOpen(true)}>
          <History size={16} /> 히스토리 보기
        </button>
      </header>

      <main>
        <section>
          <h2 className="section-title" style={{ color: 'var(--text-primary)' }}>
            <Target size={24} /> 달성 목표 (Target)
          </h2>
          <QuestList 
            quests={plusQuests} 
            onToggle={toggleTimer} 
            onReset={resetTimer} 
            onAdjust={adjustTime} 
            onDelete={deleteQuest} 
            onReorder={reorderQuest}
          />
        </section>

        <section>
          <h2 className="section-title" style={{ color: 'var(--text-primary)' }}>
            <Target size={24} /> 제한 한도 (Limit)
          </h2>
          <QuestList 
            quests={minusQuests} 
            onToggle={toggleTimer} 
            onReset={resetTimer} 
            onAdjust={adjustTime} 
            onDelete={deleteQuest} 
            onReorder={reorderQuest}
          />
        </section>

        <button className="btn-add" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={20} />
          새로운 퀘스트 추가하기
        </button>
      </main>

      {isModalOpen && (
        <AddQuestModal 
          onAdd={handleAddQuest} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}

      {isHistoryOpen && (
        <HistoryModal 
          history={history} 
          onClose={() => setIsHistoryOpen(false)} 
        />
      )}
    </>
  )
}

export default App
