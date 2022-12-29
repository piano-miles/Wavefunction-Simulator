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
    const width = 600;
    const height = 600;

    ctx.globalCompositeOperation = "destination-over";

    // Constants
    const yscale = 600; // Scale values of wavefunction to fit
    const xscale = 1; //   Scale space
    const tscale = 1; //   Scale time
    const Vscale = 5; //    Scale energy

    // Functions of the math library (for V input). See extract.py for extraction method.
    const maths = ['abs', 'acos', 'asin', 'atan', 'cbrt', 'ceil', 'cos', 'cosh', 'exp', 'floor', 'hypot', 'log', 'max', 'min', 'pow', 'random', 'round', 'sign', 'sin', 'sinh', 'sqrt', 'tan', 'tanh', 'trunc'];

    // I/O
    let t1 = document.getElementById("t1"); // Evolution
    let t2 = document.getElementById("t2"); // Render
    let t3 = document.getElementById("t3"); // Other

    // HTML elements
    let V_display = document.getElementById("V");
    let time_display = document.getElementById("t");
    let fps_display = document.getElementById("fps");
    let substep_display = document.getElementById("substeps");
    let subrec_display = document.getElementById("subrec");
    let paused = document.getElementById("paused");
    let console_output = document.getElementById("console-p");
    let width_display = document.getElementById("xscl");

    // Parameters
    let fps = 0;
    let substeps = 80; // substeps / frame
    let global_time = 0;
    let dt = 0.001; // natural time / frame
    let dtsc = dt / substeps; // natural time / substep
    let dtsch = dtsc * 0.5;
    let dtscs = dtsc / 6;
    let dx = 0.02; // natural space / pixel
    let dx2 = 1 / (dx * dx); // dx^-2

    let init = true;
    let V = []; // Potential
    let Vfunc = '';

    // Init
    let wfunc = new Array(600).fill([0, 0]); //Wave function
    let wf2 = new Array(600).fill(0); //Square density

    // Accumulating computation time counters
    let t1acc = 0;
    let t2acc = 0;
    let t3acc = 0;
    let frame = 0;
    let toacc = 0; // total
    let times = [];

    const range = Array.from(new Array(600), (x, i) => i);
    const lrange = Array.from(new Array(598), (x, i) => i + 1);

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
        ctx.moveTo(0, 300 - V[0] * Vscale);
        for (let i = 1; i < 600; i++) {
            ctx.lineTo(i, 300 - V[i] * Vscale);
        }
        ctx.stroke();

        ctx.fillStyle = "#ffffff20";
        ctx.strokeStyle = "#cccccc" + alpha;

        pdfscale = 300 / Math.max.apply(null, v);
        ctx.beginPath();
        ctx.moveTo(0, 300);
        for (let i = 0; i < v.length; i++) {
            let y = 300 - v[i] * pdfscale;
            ctx.lineTo(i, y);
        }
        ctx.lineTo(600, 300);
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
        if (RMS <= 0) throw ('There is an issue with your wavefunction.');
        RMS = Math.sqrt(RMS); // Root
        return wf_local.map((t) => t.map(y => y / RMS)); // Normalise
    }

    function update_inputs() {
        console.log("updating inputs");

        let vin = V_display.value.trim();
        maths.forEach(e => vin.replace(e, 'Math.' + e));
        success = false;

        try {
            for (let x = 0; x < 600; x++) {
                let y = eval(vin) + 0;
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
            // Render updated functions
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            renderPath(wfunc, wf2);

            // Update linked parameters
            dtsc = dt / substeps; // natural time / substep
            dtsch = dtsc * 0.5;
            dtscs = dtsc / 6;
            dx2 = 1 / (dx * dx); // dx^-2

            width_display.innerHTML = "width = " + (dx * width * 0.3862).toFixed(3) + " pm";
        }
    }

    function initialise() {
        for (let i = 0; i < 600; i++) {
            let j = (i - 300) * 0.01;
            let amplitude = complex_exponential(j * 7, Math.exp(-j * j * 100));
            wfunc[i] = amplitude; // Complex number as [r, i]
            let sq = amplitude[0] * amplitude[0] + amplitude[1] * amplitude[1];
            wf2[i] = sq;
        }

        wf2 = sqa(wfunc); // Compute square density
        wfunc = normalise(wfunc, wf2); // Normalise wavefunction
        wf2 = sqa(wfunc); // Reompute square density
        update_inputs(false); // Load inputs and render on canvas

        console_out('To begin, please uncheck the "pause" box.', 'white', 'set');
    }

    const laplacian = a => {
        let L = lrange.map(
            l => [(a[l - 1][0] + a[l + 1][0] - 2 * a[l][0]) * dx2,
            (a[l - 1][1] + a[l + 1][1] - 2 * a[l][1]) * dx2]
        );
        L.unshift(L[0]), L.push(L[L.length - 1]);
        return L;
    }

    function dydt(psi) { // Partial derviative of wavefunction with respect to time
        l = laplacian(psi);
        let K = l.map(C => [C[1] * -0.5, C[0] * 0.5]); // Kenetic component
        let H = range.map(i =>
            [(psi[i][1] * V[i]) + K[i][0],
            -psi[i][0] * V[i] + K[i][1]]
        );
        return H;
    }

    function evolve(psi) {
        let k1 = dydt(psi);
        let k2 = dydt(range.map(i => [psi[i][0] + k1[i][0] * dtsch, psi[i][1] + k1[i][1] * dtsch]));
        let k3 = dydt(range.map(i => [psi[i][0] + k2[i][0] * dtsch, psi[i][1] + k2[i][1] * dtsch]));
        let k4 = dydt(range.map(i => [psi[i][0] + k3[i][0] * dtsc, psi[i][1] + k3[i][1] * dtsc]));

        let psi2 = range.map(i =>
            [psi[i][0] + (k1[i][0] + 2 * k2[i][0] + 2 * k3[i][0] + k4[i][0]) * dtscs,
            psi[i][1] + (k1[i][1] + 2 * k2[i][1] + 2 * k3[i][1] + k4[i][1]) * dtscs]
        );

        // Prevent particle from sticking to walls
        psi2[0] = [0, 0];
        psi2[psi2.length - 1] = [0, 0];

        return psi2;
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
            let temp = times[times.length - 1];
            times = [];
            times.push(temp); // t0

            // Clear screen
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            times.push(performance.now()); // t1

            // Evolve the wave function
            for (let i = 0; i < substeps; i++) {
                wfunc = evolve(wfunc);
                if (i % 5 == 0) {
                    // Compute square density
                    wf2 = sqa(wfunc);
                    // Normalise the wave function
                    wfunc = normalise(wfunc, wf2);
                }
            }
            times.push(performance.now()); // t2

            // Render the wave functions
            renderPath(wfunc, wf2);
            times.push(performance.now()); // t3

            // Times
            t3acc += (times[1] - times[0]); // Other
            t1acc += (times[2] - times[1]); // Evolution
            t2acc += (times[3] - times[2]); // Render
            toacc += (times[3] - times[1]); // Total - other

            if (frame % 60 == 0) {
                let tot = t1acc + t2acc + t3acc;
                t1.innerHTML = `Evolution (ms): ${(t1acc / 60).toFixed(2)} (${Math.round(100 * t1acc / tot)}%)`;
                t2.innerHTML = `Render    (ms): ${(t2acc / 60).toFixed(2)} (${Math.round(100 * t2acc / tot)}%)`;
                t3.innerHTML = `Other     (ms): ${(t3acc / 60).toFixed(2)} (${Math.round(100 * t3acc / tot)}%)`;

                fps = 60000 / toacc;
                fps_display.innerHTML = "FPS: " + fps.toFixed(1);

                subrec = Math.round(substeps * fps / 400) * 10;
                subrec_display.innerHTML = "(substep rec: " + subrec + ")";

                t1acc = 0;
                t2acc = 0;
                t3acc = 0;
                toacc = 0;
            }

            global_time += dt;
            time_display.innerHTML = "t     = " + (global_time * 1.288).toPrecision(4) + " zs";

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