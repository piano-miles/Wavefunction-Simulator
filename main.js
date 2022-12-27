function setup() {
    console.log("setup");

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

    //
    // Draw
    //
    const balls = [];
    for (let i = 0; i < 20; i++) {
        let r = Math.floor(Math.random() * 30) + 15;
        let x = Math.random() * (canvas.width - r * 2) + r;
        let y = Math.random() * (canvas.height - r * 2) + r;
        let c = 'red';
        balls.push(new circle(x, y, r, c));
    }

    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);


        for (let i = 0; i < balls.length; i++) {
            balls[i].animate();
        }

        requestAnimationFrame(update);
    }

    update();
}