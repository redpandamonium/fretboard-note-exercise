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
let options = {
    notePool: getNotes(true, true),
    enableSharps: true,
    enableFlats: true,
    numNotes: 2,
    beats: 6,
};

let metronome = new Metronome(60, null, 1.0);
let started = false;
let noteChangeTask = null;
let infoActive = false;

// Init from fields. Browsers will save previous input field values, so load those
setMetronomeBpm();
setNumNotes();
setSharps();
setFlats();

// Set metronome attributes before potentially starting the metronome to make it start faster (no need to stop-start unnecessarily).
setMetronomeVolume();
setMetronomeBpm();
setBeats();

function getNotes(enableSharps, enableFlats) {
    let base_notes = ["C", "D", "E", "F", "G", "A", "B"];
    let sharps = ["C♯", "D♯", "F♯", "G♯", "A♯"];
    let flats = ["D♭", "E♭", "G♭", "A♭", "B♭"];

    if (enableFlats) {
        base_notes.push.apply(base_notes, flats);
    }
    if (enableSharps) {
        base_notes.push.apply(base_notes, sharps);
    }

    return base_notes;
}

// From https://stackoverflow.com/questions/19269545/how-to-get-a-number-of-random-elements-from-an-array
function getRandom(arr, n) {
    let result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        let x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

// Take a random selection from the enabled notes
function displayRandomNotes() {
    let noteText = "";

    let numNotes = Math.min(options.notePool.length, options.numNotes);
    let arr = getRandom(options.notePool, numNotes);
    arr.forEach(elem => {
        noteText += elem + " ";
    });
    document.getElementById("note-names-inner").innerText = noteText;
}

function setNumNotes() {
    let v = document.getElementById("num-notes").value;
    if (v) {
        if (v > 0 && v <= 6) {

            let fontSize = "20vw";
            switch (v) {
                case "2":
                    fontSize = "18vw";
                    break;
                case "3":
                    fontSize = "16vw";
                    break;
                case "4":
                    fontSize = "13vw";
                    break;
                case "5":
                    fontSize = "10vw";
                    break;
                case "6":
                    fontSize = "8vw";
                    break;
            }

            document.getElementById("note-names-inner").style.fontSize = fontSize;
            options.numNotes = v;
            if (started) {
                restart();
            }
            else {
                displayRandomNotes();
            }
        }
    }
}

function setSharps() {
    options.enableSharps = document.getElementById("sharps-enable").checked;
    options.notePool = getNotes(options.enableSharps, options.enableFlats);
    if (started) {
        restart();
    }
}

function setFlats() {
    options.enableFlats = document.getElementById("flats-enable").checked;
    options.notePool = getNotes(options.enableSharps, options.enableFlats);
    if (started) {
        restart();
    }
}

function setMetronomeVolume() {
    let v = document.getElementById("metronome-volume").value;
    if (v) {
        metronome.setVolume(v / 100.0);
    }
}

function setMetronomeBpm() {
    let v = document.getElementById("metronome-bpm").value;
    if (v) {
        if (v > 0 && v <= 1000) {
            metronome.setBpm(v);
            if (started) {
                restart();
            }
        }
    }
}

function setBeats() {
    let v = document.getElementById("metronome-beats").value;
    if (v) {
        if (v > 0 && v <= 12) {
            options.beats = v;
            metronome.setBeats(v);
            if (started) {
                restart();
            }
        }
    }
}

function stop() {
    started = false;
    metronome.stop();
    if (noteChangeTask) {
        clearTimeout(noteChangeTask);
    }
}

function restart() {
    if (started) {
        stop();
    }
    started = true;
    const interval = options.beats / metronome.bpm * 60 * 1000;
    const initial_delay = ((options.beats - 1) / metronome.bpm * 60 * 1000) + 100;

    noteChangeTask = setTimeout(function () {
        displayRandomNotes();
        noteChangeTask = setInterval(function () {
            displayRandomNotes();
        }, interval);
    }, initial_delay);
    metronome.start();
}

function toggleStartStop() {
    if (started) {
        stop();

        let element = document.getElementById("start-stop-button");
        element.innerText = "Start";
        element.style.backgroundColor = "inherit";
    }
    else {
        restart();

        let element = document.getElementById("start-stop-button");
        element.innerText = "Stop";
        element.style.backgroundColor = "lightgreen";
    }
}

function toggleInfo() {
    let element = document.getElementById("info");
    if (infoActive) {
        infoActive = false;

        element.style.visibility = "hidden";
        element.style.setProperty("backdrop-filer", "none");
    }
    else {
        infoActive = true;
        element.style.visibility = "visible";
        element.style.setProperty("backdrop-filer", "blur(2px)");
    }
}