var setup, draw, console_out;
(function () {
  var _$0 = this,
    _2 = function () {
      const t = document.getElementById("canvas");
      let e = document.getElementById("console-p");
      if (console_out = function () {
        const t = arguments;
        if (3 == t.length || 4 == t.length && t[3]) {
          let n = t[0],
            s = t[1],
            c = t[2];
          "red" == s ? s = "#ed2f2f" : "green" == s ? s = "#c4ffad" : "white" == s && (s = "#ffffff"), e.style.color = s, "add" == c ? e.innerHTML += n : e.innerHTML = n
        } else if (t[3]) throw "Incorrect number of arguments passed (" + t.length + ")."
      }, t.getContext) t.width = 600, t.height = 600, draw();
      else if (t.outerHTML) try {
        t.outerHTML = "<h1>There was an issue with canvas.</h1>"
      } finally {
          console_out("Uh oh. Looks like there's a problem with canvas.", "red", "set")
        }
    },

    _3 = function () {
      const canvas = document.getElementById("canvas"),
        ctx = canvas.getContext("2d"),
        width = 600,
        height = 600;
      ctx.globalCompositeOperation = "destination-over";
      const yscale = 600,
        xscale = 1,
        tscale = 1,
        Vscale = 5,
        maths = ["abs", "acos", "asin", "atan", "cbrt", "ceil", "cos", "cosh", "exp", "floor", "hypot", "log", "max", "min", "pow", "random", "round", "sign", "sin", "sinh", "sqrt", "tan", "tanh", "trunc"];
      let t1 = document.getElementById("t1"),
        t2 = document.getElementById("t2"),
        t3 = document.getElementById("t3"),
        V_display = document.getElementById("V"),
        time_display = document.getElementById("t"),
        fps_display = document.getElementById("fps"),
        substep_display = document.getElementById("substeps"),
        subrec_display = document.getElementById("subrec"),
        paused = document.getElementById("paused"),
        width_display = document.getElementById("xscl"),
        fps = 0,
        substeps = 80,
        global_time = 0,
        dt = .001,
        dtsc = dt / substeps,
        dtsch = .5 * dtsc,
        dtscs = dtsc / 6,
        dx = .02,
        dx2 = 1 / (dx * dx),
        init = !0,
        V = [],
        Vfunc = "",
        wfunc = new Array(600).fill([0, 0]),
        wf2 = new Array(600).fill(0),
        t1acc = 0,
        t2acc = 0,
        t3acc = 0,
        frame = 0,
        toacc = 0,
        times = [];
      const range = Array.from(new Array(600), ((t, e) => e)),
        lrange = Array.from(new Array(598), ((t, e) => e + 1));

      function computePotential() {
        V = [];
        for (let x = -300; x < 300; x++) V.push(eval(Vfunc))
      }

      const complex_exponential = (t, e) => [Math.cos(t) * e, Math.sin(t) * e]

      function renderPath(t, e) {
        ctx.lineWidth = 2, ctx.strokeStyle = "#cc5050d0", ctx.beginPath(), ctx.moveTo(0, 300 - V[0] * Vscale);
        for (let t = 1; t < 600; t++) ctx.lineTo(t, 300 - V[t] * Vscale);
        ctx.stroke(), ctx.fillStyle = "#ffffff20", ctx.strokeStyle = "#ccccccd0", pdfscale = 300 / Math.max.apply(null, e), ctx.beginPath(), ctx.moveTo(0, 300);
        for (let t = 0; t < e.length; t++) {
          let n = 300 - e[t] * pdfscale;
          ctx.lineTo(t, n)
        }
        ctx.lineTo(600, 300), ctx.stroke(), ctx.closePath(), ctx.fill(), ctx.strokeStyle = "#f79368d0", ctx.beginPath(), ctx.moveTo(0, 300 - t[0][0] * yscale);
        for (let e = 1; e < t.length; e++) {
          let n = 300 - t[e][0] * yscale;
          ctx.lineTo(e, n)
        }
        ctx.stroke(), ctx.strokeStyle = "#68b7f7d0", ctx.beginPath(), ctx.moveTo(0, 300 - t[0][1] * yscale);
        for (let e = 1; e < t.length; e++) {
          let n = 300 - t[e][1] * yscale;
          ctx.lineTo(e, n)
        }
        ctx.stroke()
      }

      const sqa = _ => _.map(t => t[0] * t[0] + t[1] * t[1])

      function normalise(t, e) {
        if (RMS = 0, e.forEach((t => RMS += t)), RMS <= 0) throw "There is an issue with your wavefunction.";
        return RMS = Math.sqrt(RMS), t.map((t => t.map((t => t / RMS))))
      }

      function update_inputs() {
        console.log("updating inputs");
        let vin = V_display.value.trim();
        maths.forEach((t => vin.replace(t, "Math." + t))), success = !1;
        try {
          for (let x = 0; x < 600; x++) {
            let y = eval(vin) + 0
          }
          Vfunc = vin, computePotential(), console_out("Successfully updated V to " + Vfunc + "\n", "green", "set");
          let subin = substep_display.innerHTML.trim();
          try {
            subin = Math.floor(subin) + 0, subin > 0 && subin < 1 / 0 ? (substeps = subin, console_out("Successfully updated substeps to " + substeps, "green", "add"), success = !0) : console_out("ERROR:\nUpdating substeps:\nInvalid value.\nPlease make sure it is a positive non-zero int.", "red", "add")
          } catch (t) {
            console_out("ERROR:\nUpdating substeps:\n" + t, "red", "add")
          }
        } catch (t) {
          console_out("ERROR:\nUpdating potential:\n" + t, "red", "set")
        }
        success && (ctx.clearRect(0, 0, canvas.width, canvas.height), renderPath(wfunc, wf2), dtsc = dt / substeps, dtsch = .5 * dtsc, dtscs = dtsc / 6, dx2 = 1 / (dx * dx), width_display.innerHTML = "width = " + (dx * width * .3862).toFixed(3) + " pm")
      }

      function initialise() {
        for (let t = 0; t < 600; t++) {
          let e = .01 * (t - 300),
            n = complex_exponential(7 * e, Math.exp(-e * e * 100));
          wfunc[t] = n;
          let s = n[0] * n[0] + n[1] * n[1];
          wf2[t] = s
        }
        wf2 = sqa(wfunc), wfunc = normalise(wfunc, wf2), wf2 = sqa(wfunc), update_inputs(!1), console_out('To begin, please uncheck the "pause" box.', "white", "set")
      }

      const laplacian = t => {
        let e = lrange.map((e => [(t[e - 1][0] + t[e + 1][0] - 2 * t[e][0]) * dx2, (t[e - 1][1] + t[e + 1][1] - 2 * t[e][1]) * dx2]));
        return e.unshift(e[0]), e.push(e[e.length - 1]), e
      };

      function dydt(t) {
        l = laplacian(t);
        let e = l.map((t => [-.5 * t[1], .5 * t[0]]));
        return range.map((n => [t[n][1] * V[n] + e[n][0], -t[n][0] * V[n] + e[n][1]]))
      }

      function evolve(t) {
        let e = dydt(t),
          n = dydt(range.map((n => [t[n][0] + e[n][0] * dtsch, t[n][1] + e[n][1] * dtsch]))),
          s = dydt(range.map((e => [t[e][0] + n[e][0] * dtsch, t[e][1] + n[e][1] * dtsch]))),
          c = dydt(range.map((e => [t[e][0] + s[e][0] * dtsc, t[e][1] + s[e][1] * dtsc]))),
          a = range.map((a => [t[a][0] + (e[a][0] + 2 * n[a][0] + 2 * s[a][0] + c[a][0]) * dtscs, t[a][1] + (e[a][1] + 2 * n[a][1] + 2 * s[a][1] + c[a][1]) * dtscs]));
        return a[0] = [0, 0], a[a.length - 1] = [0, 0], a
      }

      function update() {
        if (!paused.checked) {
          let t = times[times.length - 1];
          times = [], times.push(t), ctx.clearRect(0, 0, canvas.width, canvas.height), times.push(performance.now());
          for (let t = 0; t < substeps; t++) wfunc = evolve(wfunc), t % 5 == 0 && (wf2 = sqa(wfunc), wfunc = normalise(wfunc, wf2));
          if (times.push(performance.now()), renderPath(wfunc, wf2), times.push(performance.now()), t3acc += times[1] - times[0], t1acc += times[2] - times[1], t2acc += times[3] - times[2], toacc += times[3] - times[1], frame % 60 == 0) {
            let t = t1acc + t2acc + t3acc;
            t1.innerHTML = `Evolution (ms): ${(t1acc / 60).toFixed(2)} (${~~(100 * t1acc / t)}%)`, t2.innerHTML = `Render    (ms): ${(t2acc / 60).toFixed(2)} (${~~(100 * t2acc / t)}%)`, t3.innerHTML = `Other     (ms): ${(t3acc / 60).toFixed(2)} (${~~(100 * t3acc / t)}%)`, fps = 6e4 / toacc, fps_display.innerHTML = "FPS: " + fps.toFixed(1), subrec = 10 * ~~(substeps * fps / 400), subrec_display.innerHTML = "(substep rec: " + subrec + ")", t1acc = 0, t2acc = 0, t3acc = 0, toacc = 0
          }
          global_time += dt, time_display.innerHTML = "t     = " + (1.288 * global_time).toPrecision(4) + " zs", frame++, frame >= 240 && (frame = 0)
        }
        requestAnimationFrame(update)
      }
      document.getElementById("update").addEventListener("click", (t => {
        update_inputs()
      })), initialise(), init = !1, update()
    };
  _$0.setup = _2, _$0.draw = _3
}).call(this);