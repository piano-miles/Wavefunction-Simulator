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

    ctx.font = "48px roboto";

    //
    // Function definitions
    //
    // Cricle object
    function circle(x, y, r, c) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.c = c;

        this.dx = 0;
        this.dy = 0;

        this.draw = function () {
            ctx.beginPath();
            ctx.fillStyle = this.c;
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();
        }

        this.animate = function () {
            this.x += this.dx;
            this.y += this.dy;
            this.dx = (this.y - 300) * 0.01;
            this.dy = -(this.x - 300) * 0.01;

            this.draw();
        }
    }

    function complex_exponential(phase, amplitude) {
        return [0,0];
        //return [Math.cos(phase) * amplitude, Math.sin(phase) * amplitude];
    }

    function renderPath(verts) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#FF0000";

        ctx.beginPath();
        ctx.moveTo(0, 300-verts[0][0]);
        for (let i = 1; i < verts.length; i++) {
            let y = 300-verts[i][0];
            ctx.lineTo(i, y);
        }
        ctx.stroke();
    }

    //
    // Draw
    //
    // Init
    const balls = [];
    let r = Math.floor(Math.random() * 30) + 15;
    let x = 300;
    let y = 300;
    let c = 'red';
    balls.push(new circle(x, y, r, c));

    let wfunc = []; //Wave function
    let wf2 = []; //Square density
    for (let i = 0; i < 600; i++) {
        let j = (i - 300) * 0.01;
        let amplitude = complex_exponential(j, Math.exp(-j * j));
        wfunc.push(amplitude); // Complex number as [r, i]
    }

    function update() { // Loop each frame
        // Clear screen
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update each ball
        /*for (let i = 0; i < balls.length; i++) {
            balls[i].animate();
        }*/

        renderPath(wfunc);

        // Loop
        requestAnimationFrame(update);
    }

    // Begin loop
    update();
}