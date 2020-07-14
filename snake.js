class Snake {
	constructor(brain) {
		this.tail = [];
		this.fieldMap = [];
		this.apple = [0,0]
		this.moveDirection = [0,0];

		this.steps = 200;
		this.isWinner;

		this.fieldSize = 30;

		// How many steps the snake stays alive
		this.score = 0;

		// The fitness of the snake
		this.fitness = 0;

		this.initState();

		if (brain instanceof NeuralNetwork) {
			this.brain = brain.copy();
		} else {
			// Parameters are number of inputs, number of units in hidden Layer, number of outputs
			this.brain = new NeuralNetwork(24, [32, 32], 4);
		}
	}

	lookForCollision(head, searchDir) {
		let look = [0,0,0];
		let appleFound = false;
		let tailFound= false;

		let collisionPos = head.slice();
		let dist = 0;
		while (true) {
			if (!tailFound && this.detectIdCollision(collisionPos, 1))  {
				tailFound = true;
				look[0] = 1 / dist;
			}
			else if (!appleFound && this.detectIdCollision(collisionPos, 2))  {
				appleFound = true;
				look[1] = 1;
			}
			else if (this.detectWallCollision(collisionPos)) {
				look[2] =  1 / dist;
				break;
			}
			dist++;
			collisionPos[0] += searchDir[0];
			collisionPos[1] += searchDir[1];
		}
		return look;
	}

	copy() {
		return new Snake(this.brain);
	}

	mutate(rate) {
		this.brain.mutate(rate);
	}

	getVision() {
		let vision = [];
		// Wall
		let look = this.lookForCollision(this.tail[0], [-1, 0]);
		vision[0] = look[0];
		vision[8] = look[1];
		vision[16] = look[2];

		look = this.lookForCollision(this.tail[0], [1, 0]);
		vision[1] = look[0];
		vision[9] = look[1];
		vision[17] = look[2];

		look = this.lookForCollision(this.tail[0], [0, -1]);
		vision[2] = look[0];
		vision[10] = look[1];
		vision[18] = look[2];

		look = this.lookForCollision(this.tail[0], [0, 1]);
		vision[3] = look[0];
		vision[11] = look[1];
		vision[19] = look[2];

		look = this.lookForCollision(this.tail[0], [-1, -1]);
		vision[4] = look[0];
		vision[12] = look[1];
		vision[20] = look[2];

		look = this.lookForCollision(this.tail[0], [1, -1]);
		vision[5] = look[0];
		vision[13] = look[1];
		vision[21] = look[2];

		look = this.lookForCollision(this.tail[0], [-1, 1]);
		vision[6] = look[0];
		vision[14] = look[1];
		vision[22] = look[2];

		look = this.lookForCollision(this.tail[0], [1, 1]);
		vision[7] = look[0];
		vision[15] = look[1];
		vision[23] = look[2];

		return vision;
	}

	selectIndexOfMax(array) {
		let maxIndex = 0;
		for(let i = 1; i < array.length; i++) {
			if (array[i] > array[maxIndex]) {
				maxIndex = i;
			}
		}
		return maxIndex;
	}

	chooseAction(renderFlag = false) {
		let inputs = this.getVision();		

		const action = this.brain.predict(inputs);

		if (renderFlag) {
			for(let i = 1; i <= inputs.length; i++) {
				$("#input" + i).html("inputs[" + i + "]: " + inputs[i-1]);
			}
			for(let i = 1; i <= action.length; i++) {
				$("#output" + i).html("output[" + i + "]: " + action[i-1]);
			}
		}

		switch (this.selectIndexOfMax(action)) {
			case 0: this.moveRight(); break;
			case 1: this.moveLeft(); break;
			case 2: this.moveUp(); break;
			case 3: this.moveDown(); break;
		}	
	}

	moveRight() {
		if (this.moveDirection[1] != -1)
		this.moveDirection = [0,1];
	}
	
	moveLeft() {
		if (this.moveDirection[1] != 1)
		this.moveDirection = [0,-1];
	}
	
	moveUp() {
		if (this.moveDirection[0] != 1)
		this.moveDirection = [-1,0];
	}
	
	moveDown() {
		if (this.moveDirection[0] != -1)
		this.moveDirection = [1,0];
	}
	
	initField() {
		this.fieldMap = [];
		for (let i = 0; i < this.fieldSize; i++) {
			this.fieldMap.push([]);
			for (let j = 0; j < this.fieldMap.length; j++) {
				this.fieldMap[i].push(0);
			}
		}
	}
	
	
	initSnake() {
		this.steps = 200;
		this.tail = [];
		let head = [0,0];
		this.isWinner = false;
		this.score = 0;
		head[0] = Math.floor(this.fieldMap.length/2); 
		head[1] = head[0];

		this.fieldMap[head[0]][head[1]] = 3; 
		this.tail.push([head[0] , head[1]]);
		this.fieldMap[head[0]][head[1]-1] = 1; 
		this.tail.push([head[0] , head[1]-1]);
		this.fieldMap[head[0]][head[1]-2] = 1; 
		this.tail.push([head[0] , head[1]-2]);
		this.fieldMap[head[0]][head[1]-3] = 1; 
		this.tail.push([head[0] , head[1]-3]);
	
	
	}
	
	
	initState() {
		this.initField();
		this.initSnake();
		this.spawnApple();
	
		this.moveDirection = [0,1];
	}
	
	getRandomInt(max) {
		return Math.floor(Math.random() * Math.floor(max));
	}
	
	spawnApple() {
		while(true) {
			let x = this.getRandomInt(this.fieldMap.length);
			let y = this.getRandomInt(this.fieldMap.length);
			if (this.fieldMap[x][y] == 0) {
				this.fieldMap[x][y] = 2;
				return;
			}
		}    
	}

	detectIdCollision(head, objectId) {
		if (this.detectWallCollision(head)) return false;
		return (this.fieldMap[head[0]][head[1]] == objectId);
	}
	
	detectWallCollision(head) {
		return ((head[0] >= this.fieldMap.length || head[0] < 0) || (head[1] >= this.fieldMap.length || head[1] < 0));
	}
	
	move(apple_eaten) {   
			this.tail.unshift([this.tail[0][0] + this.moveDirection[0], this.tail[0][1] + this.moveDirection[1]]);
			if (!apple_eaten) {   
				this.fieldMap[this.tail[this.tail.length-1][0]][this.tail[this.tail.length-1][1]] = 0;
				this.tail.pop();
			}
			if (this.fieldMap[this.tail[0][0]][this.tail[0][1]] != 1)
				this.fieldMap[this.tail[0][0]][this.tail[0][1]] = 3;     
			this.fieldMap[this.tail[1][0]][this.tail[1][1]] = 1;  
			this.steps--;
			this.score = this.score + 0.004;
	}	
	
	die() {
		if (this.detectWallCollision([this.tail[0][0] + this.moveDirection[0],this.tail[0][1] + this.moveDirection[1]]) || 
			this.detectIdCollision([this.tail[0][0] + this.moveDirection[0],this.tail[0][1] + this.moveDirection[1]], 1) || this.steps <= 0) {
				if (this.detectWallCollision([this.tail[0][0] + this.moveDirection[0],this.tail[0][1] + this.moveDirection[1]])) {				
				//	this.score -= 5;
				}
				else if (this.detectIdCollision([this.tail[0][0] + this.moveDirection[0],this.tail[0][1] + this.moveDirection[1]]), 1) {
				//	this.score -= 1;
				}
			return true;
		}
		return false;
	}
		
	eat() {
		if (this.fieldMap[this.tail[0][0] + this.moveDirection[0]][this.tail[0][1] + this.moveDirection[1]] == 2) {
			this.steps = Math.min(this.steps + 120, 500);
			this.score++;
			this.spawnApple();
			return true;
		}
		return false;
	}
		
	update() {
		this.move(this.eat()); 
	}

	render(snake) {
		snake.initState();
		
		let snakeLife = setInterval(function(){ 			
			snake.chooseAction(true);

			let breakFlag = false;
			if (snake.die()) {
				if (snake.detectWallCollision([snake.tail[0][0] + snake.moveDirection[0],snake.tail[0][1] + snake.moveDirection[1]])) {
					console.log("wall collision");
				}
				else if (snake.detectIdCollision([snake.tail[0][0] + snake.moveDirection[0],snake.tail[0][1] + snake.moveDirection[1]]), 1) {
					console.log("tail collision");
				}
					
				console.log("Snake Dead");	
				clearTimeout(snakeLife);
				breakFlag = true;
			}
			if (!breakFlag) {
				snake.update();	

				$("#current_score").html(snake.score);
				$("#steps_left").html(snake.steps);
				$("td").each(function(){				
					if (snake.fieldMap[$(this).parent().index()][$(this).index()] == 0) {
						$(this).removeClass("snake");
						$(this).removeClass("apple");
					}
						
					else if (snake.fieldMap[$(this).parent().index()][$(this).index()] == 1 || snake.fieldMap[$(this).parent().index()][$(this).index()] == 3) {
						$(this).addClass("snake");
					}
		
					else if (snake.fieldMap[$(this).parent().index()][$(this).index()] == 2) {
						$(this).addClass("apple");
					}
				});
			}
				
			else {
				$("td").each(function(){								
					$(this).removeClass("snake");
					$(this).removeClass("apple");
				});
			}		
		}, 30);
	}
}
