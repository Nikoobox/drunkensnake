const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
	res.render('index');
});

const itemsSchema = {
	name: String,
	score: Number
};

const cvs = document.querySelector('#snake');
const ctx = cvs.getContext('2d');
const foodSelect = document.querySelector('#foodSelect');
const beerInfo = document.querySelector('#beer-info');
const selectList = document.querySelector('.select-list');
const gameEndMessage = document.querySelector('#game-end-message');
// const moreBeer = document.querySelector('#more-beer');

// creating the unit
const box = 32;

let selectedName;
let selectedImage;
let selectedABV;
let selectedDescription;
let selectedPrice = foodList[0].price;

//load images
const ground = new Image();
ground.src = 'public/images/bar.png';

let foodImageSrc = 'public/images/wheat.png';
const foodImg = new Image();
foodImg.src = foodImageSrc;

const cash = new Image();
cash.src = 'public/images/cash.png';

//create option based on food list
for (const select of foodList) {
	const drink = select;
	const option = document.createElement('option');

	option.innerHTML = `${drink.name}`;
	foodSelect.appendChild(option);
}

//create beer information list based on food list
for (const select of foodList) {
	const drink = select;
	const div = document.createElement('div');

	div.innerHTML = `
    <div class="beer-indiv-info">
		<div>${drink.num}. ${drink.name}<img src="${drink.image}" class="image-description"> </div>
		
        <div>Price: $${drink.price}</div>
        <div>ABV: ${drink.ABV}</div>
    
    `;
	beerInfo.appendChild(div);
}

let selected = foodSelect.options[foodSelect.selectedIndex].value;
foodSelect.addEventListener('change', function(e) {
	for (select of foodList) {
		if (e.target.value === select.name) {
			foodImg.src = `${select.image}`;
			selectedPrice = select.price;
		}
	}
});

//create the snake
let snake = [];

snake[0] = {
	x: 9 * box,
	y: 10 * box
};

//create the food
let food = {
	x: Math.floor(Math.random() * 17 + 1) * box,
	y: Math.floor(Math.random() * 15 + 3) * box
};

//create the score
let score = 0;
let totalCash;
let speed = 200;

//control the snake;
let d;

document.addEventListener('keydown', direction);

function direction(event) {
	let key = event.keyCode;
	if (key == 37 && d != 'RIGHT') {
		// left.play();
		d = 'LEFT';
		event.preventDefault();
	} else if (key == 38 && d != 'DOWN') {
		d = 'UP';
		event.preventDefault();
		// up.play();
	} else if (key == 39 && d != 'LEFT') {
		d = 'RIGHT';
		event.preventDefault();
		// right.play();
	} else if (key == 40 && d != 'UP') {
		d = 'DOWN';
		event.preventDefault();
		// down.play();
	}
	if (selectList.classList.contains('hide-on-start')) {
		return true;
	} else {
		selectList.classList.add('hide-on-start');
	}
}

//check collision function
function collision(head, array) {
	for (let i = 0; i < array.length; i++) {
		if (head.x === array[i].x && head.y === array[i].y) {
			return true;
		}
	}
	return false;
}

//draw everything to the canvas;
function draw() {
	ctx.drawImage(ground, 0, 0);

	for (let i = 0; i < snake.length; i++) {
		ctx.fillStyle = i == 0 ? '#ED2939' : 'white';
		ctx.fillRect(snake[i].x, snake[i].y, box, box);
		ctx.strokeStyle = '#1e1e1e';
		ctx.strokeRect(snake[i].x, snake[i].y, box, box);
	}

	ctx.drawImage(foodImg, food.x, food.y);
	//old snake head position
	let snakeX = snake[0].x;
	let snakeY = snake[0].y;

	//which direction
	if (d == 'LEFT') {
		snakeX -= box;
	}
	if (d == 'UP') {
		snakeY -= box;
	}
	if (d == 'RIGHT') {
		snakeX += box;
	}
	if (d == 'DOWN') {
		snakeY += box;
	}

	//if the snake eats the food
	if (snakeX == food.x && snakeY == food.y) {
		score++;
		// eat.play();
		food = {
			x: Math.floor(Math.random() * 17 + 1) * box,
			y: Math.floor(Math.random() * 15 + 3) * box
		};
		//we don't remove the tail
	} else {
		//remove the tail
		snake.pop();
	}
	//add new head
	let newHead = {
		x: snakeX,
		y: snakeY
	};
	totalCash = score * selectedPrice;

	//game over
	if (snakeX < box || snakeX > 17 * box || snakeY < 3 * box || snakeY > 17 * box || collision(newHead, snake)) {
		clearInterval(game);
		// alert('Play again');

		end(score, totalCash);
		selectList.classList.remove('hide-on-start');
		// location.reload();
		// dead.play();
	}

	snake.unshift(newHead);

	ctx.fillStyle = 'white';
	ctx.font = '36px Questrial';
	ctx.fillText(score, 2 * box, 1.6 * box);
	ctx.drawImage(foodImg, 0.5 * box, 0.5 * box);
	ctx.drawImage(cash, 14.5 * box, 0.5 * box);
	ctx.fillText(`\$${totalCash}`, 16 * box, 1.6 * box);
	ctx.strokeStyle = 'white';
	ctx.strokeRect(box, 3 * box, 17 * box, 15 * box);
}

function end(score, totalCash) {
	setTimeout(() => {
		const div = document.createElement('div');
		div.innerHTML = `
	
		<div class="message">Time to go home</div>
		<div>You had ${score} beer(s)</div>
		<div>Don't forget to pay $${totalCash} plus tips</div>
		<button id="more-beer">More Beer!</button>
    `;
		gameEndMessage.appendChild(div);
		const moreBeerButton = document.querySelector('#more-beer');
		moreBeerButton.focus();
		moreBeerButton.addEventListener('click', () => {
			location.reload();
		});
	}, 1000);
}

//call draw function every ms
let game = setInterval(draw, speed);

//DATABASE CODE STARTS HERE-----------------------------------

mongoose.connect('mongodb://localhost:27017/todolistDB', { useNewUrlParser: true });
