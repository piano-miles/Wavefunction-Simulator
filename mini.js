var setup, draw, console_out;
(function () {
    var _$0 = this,
        _2 = function () {
            let e = document.getElementById("canvas"),
                t = document.getElementById("console-p");
            if (console_out = function () {
                var e = arguments;
                if (3 == e.length || 4 == e.length && e[3]) {
                    let n = e[0],
                        o = e[1],
                        $ = e[2];
                    "red" == o ? o = "#ed2f2f" : "green" == o ? o = "#c4ffad" : "white" == o && (o = "#ffffff"), t.style.color = o, "add" == $ ? t.innerHTML += n : t.innerHTML = n
                } else if (e[3]) throw "Incorrect number of arguments passed (" + e.length + ")."
            }, e.getContext) e.width = 600, e.height = 600, draw();
            else if (e.outerHTML) try {
                e.outerHTML = "<h1>There was an issue with canvas.</h1>"
            } finally {
                    console_out("Uh oh. Looks like there's a problem with canvas.", "red", "set")
                }
        },
        _3 = function () {
            let canvas = document.getElementById("canvas"),
                ctx = canvas.getContext("2d");
            ctx.globalCompositeOperation = "destination-over";
            let yscale = 600,
                xscale = 1,
                tscale = 1,
                maths = ["abs", "acos", "asin", "atan", "cbrt", "ceil", "cos", "cosh", "exp", "floor", "hypot", "log", "max", "min", "pow", "random", "round", "sign", "sin", "sinh", "sqrt", "tan", "tanh", "trunc"],
                t1 = document.getElementById("t1"),
                t2 = document.getElementById("t2"),
                V_display = document.getElementById("V"),
                time_display = document.getElementById("t"),
                fps_display = document.getElementById("fps"),
                substep_display = document.getElementById("substeps"),
                subrec_display = document.getElementById("subrec"),
                paused = document.getElementById("paused"),
                console_output = document.getElementById("console-p"),
                fps = 0,
                substeps = 400,
                global_time = 0,
                dt = .01,
                init = !0,
                V = [],
                Vfunc = "",
                wfunc = Array(600).fill([0, 0]),
                wf2 = Array(600).fill(0),
                t1acc = 0,
                t2acc = 0,
                frame = 0,
                toacc = 0;

            function computePotential() {
                V = [];
                for (let x = -300; x < 300; x++) V.push(eval(Vfunc))
            }

            function complex_exponential(e, t) {
                return [Math.cos(e) * t, Math.sin(e) * t]
            }

            function renderPath(e, t) {
                ctx.lineWidth = 2, ctx.strokeStyle = "#cc5050d0", ctx.beginPath(), ctx.moveTo(0, 300 - V[0] * yscale);
                for (let n = 1; n < 600; n++) ctx.lineTo(n, 300 - V[n] * yscale);
                ctx.stroke(), ctx.fillStyle = "#ffffff20", ctx.strokeStyle = "#ccccccd0", pdfscale = 300 / Math.max.apply(null, t), ctx.beginPath(), ctx.moveTo(0, 300 - t[0] * pdfscale);
                for (let o = 1; o < t.length; o++) {
                    var $ = 300 - t[o] * pdfscale;
                    ctx.lineTo(o, $)
                }
                ctx.stroke(), ctx.closePath(), ctx.fill(), ctx.strokeStyle = "#f79368d0", ctx.beginPath(), ctx.moveTo(0, 300 - e[0][0] * yscale);
                for (let l = 1; l < e.length; l++) {
                    var s = 300 - e[l][0] * yscale;
                    ctx.lineTo(l, s)
                }
                ctx.stroke(), ctx.strokeStyle = "#68b7f7d0", ctx.beginPath(), ctx.moveTo(0, 300 - e[0][1] * yscale);
                for (let i = 1; i < e.length; i++) {
                    var r = 300 - e[i][1] * yscale;
                    ctx.lineTo(i, r)
                }
                ctx.stroke()
            }

            function sqa(e) {
                return e.map(e => e[0] * e[0] + e[1] * e[1])
            }

            function normalise(e, t) {
                return RMS = 0, t.forEach(e => RMS += e), RMS = Math.sqrt(RMS), e.map(e => e.map(e => e / RMS))
            }

            function update_inputs() {
                console.log("updating inputs");
                let vin = V_display.innerHTML.trim();
                maths.forEach(e => vin.replace(e, "Math." + e)), success = !1;
                try {
                    for (let x = 0; x < 600; x++) {
                        let y = eval(vin)
                    }
                    Vfunc = vin, computePotential(), console_out("Successfully updated V to " + Vfunc + "\n", "green", "set");
                    let subin = substep_display.innerHTML.trim();
                    try {
                        0 < (subin = Math.floor(subin) + 0) && subin < 1 / 0 ? (substeps = subin, console_out("Successfully updated substeps to " + substeps, "green", "add"), success = !0) : console_out("ERROR:\nUpdating substeps:\nInvalid value.\nPlease make sure it is a positive non-zero int.", "red", "add")
                    } catch (e) {
                        console_out("ERROR:\nUpdating substeps:\n" + e, "red", "add")
                    }
                } catch (e) {
                    console_out("ERROR:\nUpdating potential:\n" + e, "red", "set")
                }
                success && (ctx.clearRect(0, 0, canvas.width, canvas.height), renderPath(wfunc, wf2))
            }

            function initialise() {
                for (let e = 0; e < 600; e++) {
                    var t = complex_exponential(8 * (t = .01 * (e - 300)), Math.exp(-t * t));
                    t = (wfunc[e] = t)[0] * t[0] + t[1] * t[1], wf2[e] = t
                }
                wf2 = sqa(wfunc), wfunc = normalise(wfunc, wf2), update_inputs(!1), console_out('To begin, uncheck the "pause" box.', "white", "set")
            }

            function update() {
                if (!paused.checked) {
                    let e = [];
                    ctx.clearRect(0, 0, canvas.width, canvas.height), e.push(performance.now()), wf2 = sqa(wfunc), wfunc = normalise(wfunc, wf2), e.push(performance.now()), renderPath(wfunc, wf2), e.push(performance.now()), t1acc += e[1] - e[0], t2acc += e[2] - e[1], toacc += e[2] - e[0], frame % 60 == 0 && (t1.innerHTML = "Normalization (ms): " + (t1acc / 60).toFixed(2), t2.innerHTML = "Render time   (ms): " + (t2acc / 60).toFixed(2), fps = 6e4 / toacc, fps_display.innerHTML = "FPS: " + fps.toFixed(1), subrec = 10 * Math.round(substeps * fps / 400), subrec_display.innerHTML = "(substep rec: " + subrec + ")", t1acc = 0, t2acc = 0, toacc = 0), global_time += dt * substeps, time_display.innerHTML = "t = " + (.001288 * global_time).toFixed(3) + " attoseconds", 240 <= ++frame && (frame = 0)
                }
                requestAnimationFrame(update)
            }
            document.getElementById("update").addEventListener("click", e => {
                update_inputs()
            }), initialise(), init = !1, update()
        };
    _$0.setup = _2, _$0.draw = _3
}).call(this);