import React, { useState, useEffect, useRef } from 'react';
import BigDisplay from './components/BigDisplay';
import Timeline from './components/Timeline';
import ControlPanel from './components/ControlPanel';
import { readingSequence, mathSequence, chineseSequence } from './data/sequences';
import { playTaskCompleteSound, playRestCompleteSound } from './utils/sound';
import './index.css';

function App() {
  const [phase, setPhase] = useState('idle'); // idle, reading, reading_done, math, chinese
  const [currentSequence, setCurrentSequence] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitCountdown, setWaitCountdown] = useState(0);

  const timerRef = useRef(null);
  const stepStartTimeRef = useRef(null);
  const phaseStartTimeRef = useRef(null);
  const targetStartTimeRef = useRef(null);

  useEffect(() => {
    if (isActive && currentSequence.length > 0 && !isWaiting) {
      timerRef.current = setInterval(() => {
        const now = Date.now();

        // Update Step Timer
        if (stepStartTimeRef.current) {
          const elapsedStepTime = Math.floor((now - stepStartTimeRef.current) / 1000);
          const currentStepDuration = currentSequence[stepIndex].duration;
          const newTimeLeft = currentStepDuration - elapsedStepTime;

          if (newTimeLeft <= 0) {
            clearInterval(timerRef.current);
            // Ensure we show 0 before switching
            setTimeLeft(0);
            handleStepComplete();
          } else {
            setTimeLeft(newTimeLeft);
          }
        }

        // Update Total Timer
        if (phaseStartTimeRef.current) {
          const elapsedTotal = Math.floor((now - phaseStartTimeRef.current) / 1000);
          setTotalElapsedTime(elapsedTotal);
        }

      }, 100); // Check more frequently than 1s to avoid jitter, though UI updates every 1s change
    } else if (isWaiting && targetStartTimeRef.current) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const diff = Math.ceil((targetStartTimeRef.current - now) / 1000);
        if (diff <= 0) {
          // Time to start!
          clearInterval(timerRef.current);
          setIsWaiting(false);

          // Set start times to the exact target time to ensure precision
          const target = targetStartTimeRef.current;
          stepStartTimeRef.current = target;
          phaseStartTimeRef.current = target;

          // Play sound or just start?
          // playTaskCompleteSound(); // Optional: alert start
        } else {
          setWaitCountdown(diff);
        }
      }, 100);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, stepIndex, currentSequence, isWaiting]); // Re-run when step changes to pick up new duration

  const handleStepComplete = () => {
    const completedStep = currentSequence[stepIndex];
    if (completedStep.type === 'task') {
      playTaskCompleteSound();
    } else if (completedStep.type === 'rest') {
      playRestCompleteSound();
    }

    if (stepIndex < currentSequence.length - 1) {
      const nextIndex = stepIndex + 1;
      setStepIndex(nextIndex);

      // Start next step immediately
      const nextDuration = currentSequence[nextIndex].duration;
      setTimeLeft(nextDuration);

      // Accumulate time to prevent drift/gaps
      // New Start Time = Old Start Time + Old Duration
      // This ensures that if the previous step finished at T+180s, the next one starts EXACTLY at T+180s
      stepStartTimeRef.current += currentSequence[stepIndex].duration * 1000;

      // Auto-start next step? Prompt implies continuous flow, but maybe user wants manual?
      // "點選開始測驗閱讀後會計時閱讀任務裡面的任務... 這些任務都要大字報的顯示在畫面上"
      // Usually these tests are continuous. I will auto-advance.
    } else {
      setIsActive(false);
      if (phase === 'reading') {
        setPhase('reading_done');
      } else {
        setPhase('idle'); // Or some 'done' state
      }
    }
  };

  const startPhase = (phaseName, time) => {
    setStartTime(time);
    setPhase(phaseName);

    let seq = [];
    if (phaseName === 'reading') seq = readingSequence;
    else if (phaseName === 'math') seq = mathSequence;
    else if (phaseName === 'chinese') seq = chineseSequence;

    setCurrentSequence(seq);
    setStepIndex(0);

    const firstDuration = seq[0].duration;
    setTimeLeft(firstDuration);

    handleStartLogic(time);
  };

  const handleStartLogic = (timeStr) => {
    if (!timeStr) {
      // No time set, start immediately
      const now = Date.now();
      stepStartTimeRef.current = now;
      phaseStartTimeRef.current = now;
      setIsActive(true);
      return;
    }

    const now = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);

    // If target time is earlier than now (by more than a second), assume it's for tomorrow? 
    // Or just start immediately if it's in the past?
    // User request: "start task time can be scheduled... when time arrives start on time"
    // Usually implies future time today.

    const targetTime = targetDate.getTime();
    const currentTime = Date.now();

    if (targetTime > currentTime) {
      setIsWaiting(true);
      setWaitCountdown(Math.ceil((targetTime - currentTime) / 1000));
      targetStartTimeRef.current = targetTime;
      setIsActive(true); // Active but waiting
    } else {
      // Past time, start immediately
      stepStartTimeRef.current = currentTime;
      phaseStartTimeRef.current = currentTime;
      setIsActive(true);
    }
  };

  const currentTaskName = currentSequence[stepIndex]?.name;

  return (
    <div className="app-container">
      <header>
        <h1>測驗輔助工具</h1>
        {startTime && <div className="start-time-display">開始時間: {startTime}</div>}
      </header>

      <main>
        {!isActive && !isWaiting ? (
          <ControlPanel
            onStartPhase={startPhase}
          />
        ) : (
          <>
            <BigDisplay
              taskName={isWaiting ? '等待開始...' : currentTaskName}
              timeLeft={isWaiting ? waitCountdown : timeLeft}
              isActive={isActive}
            />
            {!isWaiting && (
              <Timeline
                sequence={currentSequence}
                currentIndex={stepIndex}
                startTime={startTime}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
