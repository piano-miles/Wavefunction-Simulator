var console_out; // Make global

function setup() {
    const canvas = document.getElementById("canvas");
    let console_output = document.getElementById("console-p");

    console_out = function () {
        let a = arguments;
        if (a.length == 3 || a.length == 4 && a[3]) {
            let value = a[0];
            let type = a[1];
            let action = a[2];

            if (type == 'red') {
                type = '#ed2f2f';
            } else if (type == 'green') {
                type = '#c4ffad';
            } else if (type == 'white') {
                type = '#ffffff';
            }
            console_output.style.color = type;

            if (action == 'add') {
                console_output.innerHTML += value;
            } else {
                console_output.innerHTML = value;
            }
        } else {
            if (a[3]) throw "Incorrect number of arguments passed (" + a.length + ").";
        };
    }

    if (canvas.getContext) {
        canvas.width = 600;
        canvas.height = 600;

        //try {
        draw();
        /*} catch (error) {
            console_output.style.color = '#ed2f2f';
            console_output.innerHTML = "Uh oh. Looks like there's a problem with the code.\nPlease paste the following line(s) in a pull request:\n\n";
            console_output.innerHTML += "error message:  " + error.message + "\n";
            console_output.innerHTML += "error name:     " + error.name.message;
        }*/
    } else {
        if (canvas.outerHTML) {
            try {
                canvas.outerHTML = `<h1>There was an issue with canvas.</h1>`;
            } finally {
                console_out("Uh oh. Looks like there's a problem with canvas.", "red", "set")
            }
        }
    }
}

function draw() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    ctx.globalCompositeOperation = "destination-over";

    // Constants
    const yscale = 600; // Scale values of wavefunction to fit
    const xscale = 1; //   Scale space
    const tscale = 1; //   Scale time

    // Functions of the math library (for V input). See extract.py for extraction method.
    const maths = ['abs', 'acos', 'asin', 'atan', 'cbrt', 'ceil', 'cos', 'cosh', 'exp', 'floor', 'hypot', 'log', 'max', 'min', 'pow', 'random', 'round', 'sign', 'sin', 'sinh', 'sqrt', 'tan', 'tanh', 'trunc'];

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
    let substeps = 400;
    let global_time = 0;
    let dt = 0.01;

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

    //
    // Function definitions
    //

    function computePotential() {
        V = [];
        for (let x = -300; x < 300; x++) {
            V.push(eval(Vfunc));
        }
    }

    function complex_exponential(phase, amplitude) {
        return [Math.cos(phase) * amplitude, Math.sin(phase) * amplitude];
    }

    function renderPath(verts, v) {
        const alpha = "d0";

        ctx.lineWidth = 2;

        ctx.strokeStyle = "#cc5050" + alpha;
        ctx.beginPath();
        ctx.moveTo(0, 300 - V[0] * yscale);
        for (let i = 1; i < 600; i++) {
            ctx.lineTo(i, 300 - V[i] * yscale);
        }
        ctx.stroke();

        ctx.fillStyle = "#ffffff20";
        ctx.strokeStyle = "#cccccc" + alpha;

        pdfscale = 300 / Math.max.apply(null, v);
        ctx.beginPath();
        ctx.moveTo(0, 300 - v[0] * pdfscale);
        for (let i = 1; i < v.length; i++) {
            let y = 300 - v[i] * pdfscale;
            ctx.lineTo(i, y);
        }
        ctx.stroke();
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#f79368" + alpha;

        ctx.beginPath();
        ctx.moveTo(0, 300 - verts[0][0] * yscale);
        for (let i = 1; i < verts.length; i++) {
            let y = 300 - verts[i][0] * yscale;
            ctx.lineTo(i, y);
        }
        ctx.stroke();

        ctx.strokeStyle = "#68b7f7" + alpha;

        ctx.beginPath();
        ctx.moveTo(0, 300 - verts[0][1] * yscale);
        for (let i = 1; i < verts.length; i++) {
            let y = 300 - verts[i][1] * yscale;
            ctx.lineTo(i, y);
        }
        ctx.stroke();
    }

    function sqa(wf_local) {
        return wf_local.map(a => a[0] * a[0] + a[1] * a[1]);
    }

    function normalise(wf_local, sqd) {
        RMS = 0;
        sqd.forEach(a =>
            RMS += a // Integrate <wfunc|wfunc>
        )
        RMS = Math.sqrt(RMS); // Root
        return wf_local.map(x => x.map(y => y / RMS)); // Normalise
    }

    function update_inputs() {
        console.log("updating inputs");

        let vin = V_display.innerHTML.trim();
        maths.forEach(e => vin.replace(e, 'Math.' + e));
        success = false;

        try {
            for (let x = 0; x < 600; x++) {
                let y = eval(vin);
            }
            Vfunc = vin;

            computePotential();

            console_out("Successfully updated V to " + Vfunc + "\n", "green", "set");

            let subin = substep_display.innerHTML.trim();
            try {
                subin = Math.floor(subin) + 0;
                if (subin > 0 && subin < Infinity) {
                    substeps = subin;
                    console_out("Successfully updated substeps to " + substeps, "green", "add");
                    success = true;
                } else {
                    console_out("ERROR:\nUpdating substeps:\n" + "Invalid value.\nPlease make sure it is a positive non-zero int.", "red", "add");
                }
            } catch (error) {
                console_out("ERROR:\nUpdating substeps:\n" + error, "red", "add");
            }
        } catch (error) {
            console_out("ERROR:\nUpdating potential:\n" + error, "red", "set");
        }

        if (success) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            renderPath(wfunc, wf2);
        }
    }

    function initialise() {
        for (let i = 0; i < 600; i++) {
            let j = (i - 300) * 0.01;
            let amplitude = complex_exponential(j * 8, Math.exp(-j * j));
            wfunc[i] = amplitude; // Complex number as [r, i]
            let sq = amplitude[0] * amplitude[0] + amplitude[1] * amplitude[1];
            wf2[i] = sq;
        }

        wf2 = sqa(wfunc); // Compute square density
        wfunc = normalise(wfunc, wf2); // Normalise wavefunction
        update_inputs(false); // Load inputs and render on canvas

        console_out('To begin, uncheck the "pause" box.', 'white', 'set');
    }

    document.getElementById("update").addEventListener('click', event => {
        update_inputs();
    });

    //
    // Draw
    //

    // Initialise wavefunction
    initialise();

    // Loop
    function update() {
        if (!paused.checked) {

            let times = [];

            // Clear screen
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            times.push(performance.now());

            // Compute square density
            wf2 = sqa(wfunc);

            // Normalise the wave function
            wfunc = normalise(wfunc, wf2);
            times.push(performance.now());

            // Render the wave functions
            renderPath(wfunc, wf2);
            times.push(performance.now());

            // Times
            t1acc += (times[1] - times[0]);
            t2acc += (times[2] - times[1]);
            toacc += (times[2] - times[0]);

            if (frame % 60 == 0) {
                t1.innerHTML = "Normalization (ms): " + (t1acc / 60).toFixed(2);
                t2.innerHTML = "Render time   (ms): " + (t2acc / 60).toFixed(2);

                fps = 60000 / toacc;
                fps_display.innerHTML = "FPS: " + fps.toFixed(1);

                subrec = Math.round(substeps * fps / 400) * 10;
                subrec_display.innerHTML = "(substep rec: " + subrec + ")";

                t1acc = 0;
                t2acc = 0;
                toacc = 0;
            }

            global_time += dt * substeps;
            time_display.innerHTML = "t = " + (global_time * 0.001288).toFixed(3) + " attoseconds";

            // Loop
            frame++;
            if (frame >= 240) frame = 0;
        }

        requestAnimationFrame(update);
    }

    // Begin loop
    init = false;
    update();
}