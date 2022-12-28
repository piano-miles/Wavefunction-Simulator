/* This file is just for remembering various variable names I use. No functional purpose. */

// Constants
const yscale = 600; // Scale values of wavefunction to fit
const xscale = 1; //   Scale space
const tscale = 1; //   Scale time

// I/O
let t1 = document.getElementById("t1");
let t2 = document.getElementById("t2");

// HTML elements
let V_display = document.getElementById("V");
let time_display = document.getElementById("t");
let fps_display = document.getElementById("fps");
let substep_display = document.getElementById("substeps");
let subrec_display = document.getElementById("subrec");
let paused = document.getElementById("paused");
let console_output = document.getElementById("console-p");

// Parameters
let fps = 0;
let substeps = 400; // substeps / frame
let global_time = 0;
let dt = 0.01; // natural time / frame
let dtsc = dt / substeps; // natural time / substep
let dx = 0.01; // natural space / pixel
let dx2 = dx * dx; // dx^2

let init = true;
let V = []; // Potential
let Vfunc = '';

// Init
let wfunc = new Array(600).fill([0, 0]); //Wave function
let wf2 = new Array(600).fill(0); //Square density

// Accumulating computation time counters
let t1acc = 0;
let t2acc = 0;
let frame = 0;
let toacc = 0; // total