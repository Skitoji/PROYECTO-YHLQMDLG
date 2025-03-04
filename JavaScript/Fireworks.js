console.log('Fireworks.js loaded');

const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Firework {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.startX = x; // Define startX
        this.startY = y; // Define startY
        this.targetX = targetX;
        this.targetY = targetY;
        this.distanceToTarget = this.calculateDistance(x, y, targetX, targetY);
        this.distanceTraveled = 0;
        this.coordinates = [];
        this.coordinateCount = 3;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.atan2(targetY - y, targetX - x);
        this.speed = 2;
        this.acceleration = 1.05;
        this.brightness = Math.random() * 50 + 50;
        this.targetRadius = 1;
    }

    calculateDistance(x1, y1, x2, y2) {
        const xDistance = x2 - x1;
        const yDistance = y2 - y1;
        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);

        if (this.targetRadius < 8) {
            this.targetRadius += 0.3;
        } else {
            this.targetRadius = 1;
        }

        this.speed *= this.acceleration;

        const vx = Math.cos(this.angle) * this.speed;
        const vy = Math.sin(this.angle) * this.speed;
        this.distanceTraveled = this.calculateDistance(this.startX, this.startY, this.x + vx, this.y + vy);

        if (this.distanceTraveled >= this.distanceToTarget) {
            createParticles(this.targetX, this.targetY);
            fireworks.splice(index, 1);
        } else {
            this.x += vx;
            this.y += vy;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsl(${hue}, 100%, ${this.brightness}%)`;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.targetX, this.targetY, this.targetRadius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.coordinates = [];
        this.coordinateCount = 5;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 10 + 1;
        this.friction = 0.95;
        this.gravity = 1;
        this.hue = Math.random() * 360;
        this.brightness = Math.random() * 80 + 20;
        this.alpha = 1;
        this.decay = Math.random() * 0.03 + 0.01;
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);

        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;

        if (this.alpha <= this.decay) {
            particles.splice(index, 1);
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
        ctx.stroke();
    }
}

const fireworks = [];
const particles = [];
let hue = 120;
let limiterTotal = 5;
let limiterTick = 0;
let timerTotal = 80;
let timerTick = 0;
let mousedown = false;
let mx;
let my;

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function createParticles(x, y) {
    let particleCount = 100; // Increase the number of particles
    while (particleCount--) {
        particles.push(new Particle(x, y));
    }
}

function loop() {
    requestAnimationFrame(loop);

    hue += 0.5;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Set the background to black
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    let i = fireworks.length;
    while (i--) {
        fireworks[i].draw();
        fireworks[i].update(i);
    }

    let j = particles.length;
    while (j--) {
        particles[j].draw();
        particles[j].update(j);
    }

    if (timerTick >= timerTotal) {
        if (!mousedown) {
            fireworks.push(new Firework(canvas.width / 2, canvas.height, random(0, canvas.width), random(0, canvas.height / 2)));
            timerTick = 0;
        }
    } else {
        timerTick++;
    }

    if (limiterTick >= limiterTotal) {
        if (mousedown) {
            fireworks.push(new Firework(canvas.width / 2, canvas.height, mx, my));
            limiterTick = 0;
        }
    } else {
        limiterTick++;
    }
}

canvas.addEventListener('mousemove', (e) => {
    mx = e.pageX - canvas.offsetLeft;
    my = e.pageY - canvas.offsetTop;
});

canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    mousedown = true;
});

canvas.addEventListener('mouseup', (e) => {
    e.preventDefault();
    mousedown = false;
});

window.onload = () => {
    console.log('Window loaded, starting loop');
    loop();
};