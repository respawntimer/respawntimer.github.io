import { RealClock } from './real-clock.js'
import { GameTimer, STAGES, PHASES } from './game-clock.js'
import { RespawnTimer } from './respawn-timer.js'
import { Caller } from './caller.js';
import { Watcher } from './watcher.js';
import { SimulatedClock } from './simulated-clock.js';
import { SoundNotifications } from './sound-notifications.js';

const RESPAWN_TIMES = [
    1780, 1760, 1740, 1720, 1700, 1680, 1660, 1640, 1620, 1600, 1580, 1560,
    1540, 1520, 1500, 1490, 1462, 1434, 1406, 1378, 1350, 1322, 1294, 1266, 1238,
    1210, 1182, 1146, 1110, 1074, 1038, 1002, 966, 930, 894, 858, 814, 770, 726,
    682, 638, 594, 550, 498, 446, 394, 342, 290, 230, 170, 110, 50
];
const JUMP_ADJUSTMENT = 8;

const RESPAWN_INTERVALS = [20, 28, 36, 44, 52, 60];

const PHASE_TIMES = [1500, 1182, 858, 550, 290, 50];

const MODE1_STAGES = {
    PREP_START: 2700,
    PREP_END: 3600,
    WAR_START: 0,
    WAR_END: 1800,
    BREAK_START: 1800,
    BREAK_END: 2700
};

const clock = new RealClock(0);
//const clock = new SimulatedClock(20 * 60, 1);
const gameTimer = new GameTimer(clock, MODE1_STAGES, PHASE_TIMES);
const respawmTimer = new RespawnTimer(gameTimer, RESPAWN_TIMES, RESPAWN_INTERVALS, JUMP_ADJUSTMENT);
const caller = new Caller(respawmTimer, gameTimer);
let updateRate = parseInt(localStorage.getItem("updateRate")) || 1000;
const timeRemainingElement = document.getElementById("timeRemaining");
const normalRespawnElement = document.getElementById("normalRespawn");
const jumpedRespawnElement = document.getElementById("jumpedRespawn");
const stageElement = document.getElementById("stage");
const nudgeElement = document.getElementById("nudge");

function formatTime(seconds) {
    const minutesRemaining = Math.floor(seconds / 60);
    const secondsRemaining = seconds % 60;
    return `${minutesRemaining}:${secondsRemaining.toString().padStart(2, '0')}`;
}

function formatAdjustmentTime(seconds) {
    const formattedTime = formatTime(Math.abs(seconds));
    const sign = seconds >= 0 ? "+" : "-";
    return sign + formattedTime;
}

function capitalizeFirst(str) {
    if (!str) return ''; // Handle empty or undefined strings
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateDisplay() {
    if (gameTimer.getStage() === STAGES.WAR) {
        normalRespawnElement.textContent = formatTime(respawmTimer.getTimeToNormalRespawn());
        jumpedRespawnElement.textContent = formatTime(respawmTimer.getTimeToJumpedRespawn());
    } else {
        normalRespawnElement.textContent = formatTime(0);
        jumpedRespawnElement.textContent = formatTime(0);
    }
    stageElement.textContent = capitalizeFirst(gameTimer.getStage());
    timeRemainingElement.textContent = formatTime(gameTimer.getTimeRemainingInStage());
    nudgeElement.textContent = formatAdjustmentTime(clock.getAdjustment());
}

function update() {
    updateDisplay();
    if (gameTimer.getStage() == STAGES.WAR) {
        //soundsManager.forEach(element => { element.update(); });
    }
    caller.update();
}

function OnKeyDown(event) {
    if (event.key === 'ArrowLeft') {
        clock.nudge(-1);
    } else if (event.key === 'ArrowRight') {
        clock.nudge(1);
    } else if (event.key === 'ArrowDown') {
        clock.nudge(-clock.getAdjustment());
    }
}

window.addEventListener('keydown', OnKeyDown);
setInterval(update, updateRate);
update();
