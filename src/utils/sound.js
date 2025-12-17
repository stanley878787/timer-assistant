// Simple synth using Web Audio API

const createOscillator = (ctx, type, freq, startTime, duration) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.1, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
};

export const playTaskCompleteSound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;

    // Ascending major triad (C5, E5, G5)
    createOscillator(ctx, 'sine', 523.25, now, 0.5);       // C5
    createOscillator(ctx, 'sine', 659.25, now + 0.1, 0.5); // E5
    createOscillator(ctx, 'sine', 783.99, now + 0.2, 0.8); // G5
};

export const playRestCompleteSound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;

    // Double beep (A4)
    createOscillator(ctx, 'square', 440, now, 0.1);
    createOscillator(ctx, 'square', 440, now + 0.2, 0.1);
};
