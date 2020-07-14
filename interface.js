$(document).ready(function(){
    $("#simulate_generation").prop('disabled', true);
    $("#show_best").prop('disabled', true);

    $("#generate_population").click(function() {      
        let snakesAmount = setup();

        $("#population_agents_count").html("Population Size:" + snakesAmount);

        $("#simulate_generation").prop('disabled', false);

        console.log("Population Generated");
    });

    $("#simulate_generation").click(function() {
        console.log("Starting simulation");

        $("#simulate_generation").prop('disabled', true);
        $("#show_best").prop('disabled', true);

        let generationsToSimulate = parseInt($("#generation_to_simulate").val());
        let old = generation;
        while (generation < old + generationsToSimulate) {
            if (generation > 1)
                createNextGeneration();
            simulate();
        }
        

        $("#simulate_generation").prop('disabled', false);
        $("#show_best").prop('disabled', false);
    });

    $("#show_best").click(function() {
        console.log("Showing Best");

        $("#simulate_generation").prop('disabled', true);
        $("#show_best").prop('disabled', true);

        renderBest();

        $("#simulate_generation").prop('disabled', false);
        $("#show_best").prop('disabled', false);
    });
});

