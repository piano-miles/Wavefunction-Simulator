function setup() {
    const canvas = document.getElementById("canvas");

    if (canvas.getContext) {
        canvas.width = 600;
        canvas.height = 600;

        draw();
    } else {
        if (canvas.outerHTML) {
            canvas.outerHTML = `<h1>There was an issue with canvas.</h1>`;
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

    let V_display = document.getElementById("V");
    let time_display = document.getElementById("t");
    let fps_display = document.getElementById("fps");
    let substep_display = document.getElementById("substeps");
    let subrec_display = document.getElementById("subrec");
    let paused = document.getElementById("paused");
    let console_output = document.getElementById("console-p");

    let init = true;
    let V = []; // Potential
    let Vfunc = "x*x";

    //
    // Function definitions
    //

    function computePotential() {
        for (let x = 0; x < 600; x++) {
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
        for (let x = 1; x < 600; x++) {

        }

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

    function sqa(wfunc) {
        return wfunc.map(a => a[0] * a[0] + a[1] * a[1]);
    }

    function normalise(wfunc, sqd) {
        RMS = 0;
        sqd.forEach(a =>
            RMS += a // Integrate <wfunc|wfunc>
        )
        RMS = Math.sqrt(RMS); // Root
        return wfunc.map(x => x.map(y => y / RMS)); // Normalise
    }

    document.getElementById("update").onclick = function () {
        let vin = V_display.innerHTML.trim();
        maths.forEach(e => vin.replace(e, 'Math.' + e));
        try {
            for (let x = 0; x < 600; x++) {
                let y = eval(vin);
            }
            Vfunc = vin;

            computePotential();

            console_output.style.color = '#c4ffad';
            console_output.innerHTML = "Successfully updated V to " + Vfunc + "\n";

            let subin = substep_display.innerHTML.trim();
            try {
                subin = Math.floor(subin) + 0;
                if (subin > 0 && subin < Infinity) {
                    substeps = subin;
                    console_output.style.color = '#c4ffad';
                    console_output.innerHTML += "Successfully updated substeps to " + substeps;
                } else {
                    console_output.style.color = '#ed2f2f';
                    console_output.innerHTML += "ERROR:\nUpdating substeps:\n" + "Invalid value.\nPlease make sure it is a positive non-zero int.";
                }
            } catch (error) {
                console_output.style.color = '#ed2f2f';
                console_output.innerHTML += "ERROR:\nUpdating substeps:\n" + error;
            }
        } catch (error) {
            console_output.style.color = '#ed2f2f';
            console_output.innerHTML = "ERROR:\nUpdating potential:\n" + error;
        }
    }

    //
    // Draw
    //

    // Init
    let wfunc = []; //Wave function
    let wf2 = []; //Square density
    for (let i = 0; i < 600; i++) {
        let j = (i - 300) * 0.01;
        let amplitude = complex_exponential(j * 8, Math.exp(-j * j));
        wfunc.push(amplitude); // Complex number as [r, i]
        let sq = amplitude[0] * amplitude[0] + amplitude[1] * amplitude[1];
        wf2.push(sq);
    }

    // Accumulating computation time counters
    let t1acc = 0;
    let t2acc = 0;
    let frame = 0;
    let toacc = 0; // total
    let fps = 0;
    let substeps = 400;
    let global_time = 0;
    let dt = 0.01;

    // Loop
    function update() {
        if (!paused.checked || init) {

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
            init = false;
        }

        requestAnimationFrame(update);
    }

    // Begin loop
    update();
}