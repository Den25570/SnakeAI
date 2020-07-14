tf.setBackend("cpu");

// The number of snakes in each population
const totalPopulation = 1200;
//Snakes to reproduce
const winnerAmount = 200;

//Field Size
const fieldSize = 30;

// Snakes currently alived
let aliveSnakes = [];

// all the snakes of the current generation
let allSnakes = [];

// Current generation number
let generation = 1;
let generationSpan;
let generationBestChart;

let bestSnakeIndex = 0;

function preload() {
	console.log('Preload Complete');
    for(let i = 0; i < fieldSize ; i++) {
        $("#main_field").append("<tr></tr>");
    }
    for(let i = 0; i < fieldSize ; i++) {
        $("tr").append("<td></td>");
	}
	
	let ctx = document.getElementById('myChart');
    generationBestChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Best Score',
				data: [],
				backgroundColor: [
					'rgba(255, 159, 64, 0.2)'
				],
			}, 
			{
                label: 'Worst Score',
				data: [],
				backgroundColor: [
					'rgba(255, 99, 132, 0.2)',
				],
			},
			{
                label: 'Average Score',
				data: [],
				backgroundColor: [
					'rgba(255, 206, 86, 0.2)',
				],
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

function setup() {
	generation = 1;
	generationSpan = $("#generation");
	generationSpan.html(generation);
	for (let i = 0; i < totalPopulation; i++) {
		let snake = new Snake();
		aliveSnakes[i] = snake;
		allSnakes[i] = snake;
	}
	return allSnakes.length;
}

function simulate() {
	while (aliveSnakes.length > 0) {
		for (let i = aliveSnakes.length - 1; i >= 0; i--) {
			let snake = aliveSnakes[i];
			snake.chooseAction();

			if (snake.die()) {
				aliveSnakes.splice(i, 1);
				continue;
			}

			snake.update();			
		}	
	}	

	normalizeFitness(allSnakes);

	let TotalScore = 0;
	bestSnakeIndex = 0;
	let worstSnakeIndex = 0;
	for(let i = 1; i < allSnakes.length; i++) {		
		TotalScore += allSnakes[i].score;
		if (allSnakes[i].fitness > allSnakes[bestSnakeIndex].fitness)
			bestSnakeIndex = i;
		else if (allSnakes[i].fitness < allSnakes[worstSnakeIndex].fitness)
			worstSnakeIndex = i;
	}
	//console.log(allSnakes);
	generationBestChart.data.labels.push(generation);
	generationBestChart.data.datasets[0].data.push(allSnakes[bestSnakeIndex].score);
	generationBestChart.data.datasets[1].data.push(allSnakes[worstSnakeIndex].score);
	generationBestChart.data.datasets[2].data.push(TotalScore / allSnakes.length);
	generationBestChart.update();

	let date = new Date();
	console.log("generation: " + generation + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds());
	generation++;
	generationSpan.html(generation);
}

function renderBest() {
	console.log("Rendering snake: " + bestSnakeIndex)
	allSnakes[bestSnakeIndex].render(allSnakes[bestSnakeIndex]);
	
}