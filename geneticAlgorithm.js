function createNextGeneration() {
	aliveSnakes = evolvePopulation(allSnakes);
	allSnakes = aliveSnakes.slice();
}

function normalizeFitness(snakes) {
	for (let i = 0; i < snakes.length; i++) {
		snakes[i].fitness = snakes[i].score;
	}
}

function selection(snakes){
	var sortedPopulation = snakes.sort(
		function(unitA, unitB){
			return unitB.fitness - unitA.fitness;
		}
	);

	for (var i=0; i < winnerAmount; i++) sortedPopulation[i].isWinner = true;
	sortedPopulation.forEach(snake => {
		snake.initState();
	});
	
	return sortedPopulation.slice(0, winnerAmount);
}

function evolvePopulation(snakes) {
	const Winners = selection(snakes);
	
	let crossOvers = [];
	for(let i = 0 ; i < Winners.length; i+= 2) {
		crossOvers.push(new Snake(new NeuralNetwork(24, [32, 32], 4, crossOver(Winners[i].brain.model, Winners[i+1].brain.model))));
	}

	const crossOvers1 = mutateBias(crossOvers, 0.1);
	const crossOvers2 = mutateBias(crossOvers, 0.1);
	const mutatedWinners1 = mutateBias(Winners, 0.1);
	const mutatedWinners2 = mutateBias(Winners, 0.1);
	const mutatedWinners3 = mutateBias(Winners, 0.1);
	
	let newSnakes = [];
	for(let i = 0; i < totalPopulation - Winners.length - crossOvers.length * 3 - mutatedWinners1.length * 3; i++) {
		newSnakes.push(new Snake());
	}
 
    return [crossOvers,crossOvers1, crossOvers2, Winners, mutatedWinners1, mutatedWinners2, mutatedWinners3, newSnakes].flat();
}

function crossOver(a, b) {
    const biasA1 = a.layers[0].bias.read();
	const biasB1 = b.layers[0].bias.read();
	const biasA2 = a.layers[1].bias.read();
    const biasB2 = b.layers[1].bias.read();
 
    return setBias(a, exchangeBias(biasA1, biasB1), exchangeBias(biasA2, biasB2));
}

function exchangeBias(tensorA, tensorB) {
    const size = Math.ceil(tensorA.size / 2);
    return tf.tidy(() => {
        const a = tensorA.slice([0], [size]);
        const b = tensorB.slice([size], [size]);
 
        return a.concat(b);
    });
}

function setBias(model, bias1, bias2) {
    const newModel = Object.assign({}, model);
    newModel.layers[0].bias = newModel.layers[0].bias.write(bias1);
	newModel.layers[1].bias = newModel.layers[1].bias.write(bias2);
    return newModel;
}

function mutateBias(snakes, mutateRate) {
	let newSnakes = [];
    for(let i = 0 ; i < snakes.length; i++) {
		newSnakes[i] = snakes[i].copy();
		newSnakes[i].mutate(mutateRate);
	}
	return newSnakes;
}


