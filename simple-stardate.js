
Handlebars.registerHelper('stardate', function() {
    return game.SimpleStardate.stardate;
});

Hooks.on(SimpleCalendar.Hooks.DateTimeChange, (data) => {
    //console.log(data);
    calculateStardate();
});

function calculateStardate(){
    // This will eventually check for TOS or TNG stardate 
    if (game.settings.get('simple-stardate','era') == 'TOS') { 
        calculateStardateTOS(); 
    } else  {
        calculateStardateTNG(); 
    }
}

function calculateStardateTOS(){
    let knownStardate1 = SimpleCalendar.api.dateToTimestamp({year: 2289, month: 2, day: 11, hour: 19, minute: 54, seconds: 0}); // Stardate 9000.00
    let knownStardate2 = SimpleCalendar.api.dateToTimestamp({year: 2295, month: 2, day: 7, hour: 6, minute: 2, seconds: 7}); //Stardate 9989.24)
    let currentTime = SimpleCalendar.api.dateToTimestamp({}); // Grabs current Gregorian calendar as a timestamp
    let difference = 989.24/(knownStardate2 - knownStardate1);
    let currentStardate = (9000 + (difference * (currentTime - knownStardate1))).toFixed(2);
    game.SimpleStardate.stardate = currentStardate;
}

function calculateStardateTNG(){
    let knownStardate1 = SimpleCalendar.api.dateToTimestamp({year: 2364, month: 1, day: 26, hour: 12, minute: 0, seconds: 0}); // Stardate 40759.50 Dedication Plaque of the Enterprise D
    let knownStardate2 = SimpleCalendar.api.dateToTimestamp({year: 2378, month: 3, day: 4, hour: 0, minute: 0, seconds: 0}); //Stardate 54868.6 Voyager "Homestead"
    let currentTime = SimpleCalendar.api.dateToTimestamp({}); // Grabs current Gregorian calendar as a timestamp
    let difference = 14109.1/(knownStardate2 - knownStardate1);
    let currentStardate = (40759.5 + (difference * (currentTime - knownStardate1))).toFixed(2);
    game.SimpleStardate.stardate = currentStardate;
}

Hooks.once("init", async() => {
    console.log('Stardate for Simple Calender Init - Registering Module')

    // Register Settings
    game.settings.register("simple-stardate", "era", {
        name: "SETTINGS.SimpleStardateEra",
        hint: "SETTINGS.SimpleStardateEraHint",
        scope: "world",
        type: String,
        default: 'TOS',
        choices: { "TOS": "Original Series", "TNG": "The Next Generation" },
        onChange: foundry.utils.debouncedReload,
        config: true
    });

    // Set Stardate and modify simple calendar
    game.SimpleStardate = {stardate: 0};
    game.SimpleStardate.stardate = 0;
    let file = await fetch('/modules/foundryvtt-simple-calendar/templates/main.html');
    let template = await file.text();
    let lines = template.split("\n");


    const insertAtLine = (lines, lineNumber, text) => {
        if (lineNumber >= 0 && lineNumber < lines.length) {
            lines.splice(lineNumber, 0, text);
        }
    };
    
    let insert_43 = `<div class="fsc-sf">
                <div class="fsc-tf">
                    <div class="fsc-uf">{{localize 'SimpleStardate.Stardate'}} {{stardate}}</div>
                </div>
            </div>`;
    
    let insert_314 = `<div class="fsc-mb" style="width:82%">
                <div class="fsc-tf">
                    <div class="fsc-uf" style="text-align: center;">{{localize 'SimpleStardate.Stardate'}} {{stardate}}</div>
                </div>
            </div>`;

    insertAtLine(lines, 42, insert_43);
    insertAtLine(lines, 314, insert_314);

    template = lines.join("\n");
    Handlebars.partials['modules/foundryvtt-simple-calendar/templates/main.html'] = Handlebars.compile((template));




});


    
Hooks.once("ready", async () => {

    calculateStardate();
    
});
