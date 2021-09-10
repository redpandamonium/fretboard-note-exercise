/*
    Guitar fretboard exercise utility.
    Copyright (C) 2021  Leon Suchy

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

class Metronome {

    constructor(bpm, beats, volume) {
        this.bpm = 60;
        this.beats = 4;
        this.volume = 0.5;
        if (bpm) {
            this.bpm = bpm;
        }
        if (beats) {
            this.beats = beats;
        }
        if (volume) {
            this.volume = volume;
        }

        this.playing = false;
        this.audioCtx = null;
        this.oscillator = null;
        this.envelope = null;
        this.soundHz = 1046;
        this.emphasisSoundHz = 1560;
        this.scheduledTicks = 1000;
        this.tickScheduleTask = null;

        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    #scheduleClick(time, accented) {

        // Silence the click.
        this.envelope.gain.cancelScheduledValues(time);
        this.envelope.gain.setValueAtTime(0, time);

        // Audible click sound.
        this.envelope.gain.linearRampToValueAtTime(1, time + .001);
        this.envelope.gain.linearRampToValueAtTime(0, time + .001 + .005);

        // Accent note should have a higher frequency
        if (accented) {
            this.oscillator.frequency.setValueAtTime(this.emphasisSoundHz, time);
            this.oscillator.frequency.setValueAtTime(this.soundHz, time + 0.06);
        }
    }

    setVolume(volume) {
        this.volume = volume;
        if (this.isPlaying()) {
            this.gain.gain.value = volume;
        }
    }

    setBpm(bpm) {
        this.bpm = bpm;
        if (this.isPlaying()) {
            this.stop();
            this.start();
        }
    }

    setBeats(beats) {
        this.beats = beats;
        if (this.isPlaying()) {
            this.stop();
            this.start();
        }
    }

    #scheduleClicks(startTime, beat) {

        const timeoutDuration = (60 / this.bpm);
        for (let i = 0; i < this.scheduledTicks; i++) {
            this.#scheduleClick(startTime, beat === 0);
            startTime += timeoutDuration;
            beat += 1;
            if (beat >= this.beats) {
                beat = 0;
            }
        }

        const nextSchedule = timeoutDuration * this.scheduledTicks - 0.05; // shift it forwards a bit to compensate for setTimeout inaccuracy
        this.tickScheduleTask = setTimeout(function() {
            this.#scheduleClicks(startTime, beat);
        }.bind(this), nextSchedule * 1000);
    }

    start() {

        // Set status
        this.playing = true;

        // Init audio:
        // A sine wave at some frequency.
        // Apply some gain to it to set its amplitude to our volume setting.
        // Second gain is an envelope to make it click.
        this.oscillator = this.audioCtx.createOscillator();
        this.gain = this.audioCtx.createGain();
        this.envelope = this.audioCtx.createGain();

        this.oscillator.type = 'sine';
        this.oscillator.frequency.value = this.soundHz;
        this.gain.gain.value = this.volume;
        this.envelope.gain.value = 0;

        this.oscillator.connect(this.gain);
        this.gain.connect(this.envelope);
        this.envelope.connect(this.audioCtx.destination);

        this.oscillator.start(0);

        // Schedule clicks.
        // First click is a bit early to make it responsive.
        const timeoutDuration = (60 / this.bpm);
        const initialDelay = 0.1;
        let now = this.audioCtx.currentTime;
        now += initialDelay;
        this.#scheduleClick(now, true);
        now += timeoutDuration;
        this.#scheduleClicks(now, 1);
    }

    isPlaying() {
        return this.playing;
    }

    stop() {
        this.playing = false;
        clearTimeout(this.tickScheduleTask);
        this.oscillator.stop();
    }
}