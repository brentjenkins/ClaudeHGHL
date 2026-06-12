// 25-26 season setup data: prior-season (24-25) final standings, post-drop keeper rosters,
// actual draft picks, and mid-season (All-Star break) draft results.
// Split out of roster_tracker.html to keep the main file size down; loaded via <script src> before the app script.

// 2024-25 final standings — determines 25-26 draft order (rank 9 picks first)
const FINAL_STANDINGS_2425 = {
  'Motor City Wings':    {rank:1, pts:1152},
  'Pernicious Puckers':  {rank:2, pts:1107},
  'Damage Inc.':         {rank:3, pts:1083},
  'Bossy Posse':         {rank:4, pts:1053},
  'Dumb and Goalie To':  {rank:5, pts:1034},
  'Killer Whales':       {rank:6, pts:1022},
  'Silence of the Lamb': {rank:7, pts:1010},
  'Muller Time!':        {rank:8, pts:1007},
  'Blue Line Bangers':   {rank:9, pts:998},
};

// Actual pre-draft 25-26 rosters (after drops, before draft picks).
// Keys = normName(name).toLowerCase() — absent players had no roster spot going into the draft.
// Ivan Demidov absent: dropped due to mid-season pickup rule; re-drafted with BLB's 1st pick.
const ACTUAL_ROSTER_2526 = {
  // Blue Line Bangers
  'mackenzie weegar':'Blue Line Bangers','brandon montour':'Blue Line Bangers',
  'gustav forsling':'Blue Line Bangers','jack eichel':'Blue Line Bangers',
  'nico hischier':'Blue Line Bangers','adrian kempe':'Blue Line Bangers',
  'alex tuch':'Blue Line Bangers','jared mccann':'Blue Line Bangers',
  'macklin celebrini':'Blue Line Bangers','adam fantilli':'Blue Line Bangers',
  'jordan spence':'Blue Line Bangers','michael kesselring':'Blue Line Bangers',
  'connor hellebuyck':'Blue Line Bangers',
  // Bossy Posse
  'evan bouchard':'Bossy Posse','adam fox':'Bossy Posse',
  'nathan mackinnon':'Bossy Posse','robert thomas':'Bossy Posse',
  'tage thompson':'Bossy Posse','kyle connor':'Bossy Posse',
  'ryan nugenthopkins':'Bossy Posse','juraj slafkovsky':'Bossy Posse',
  'shane wright':'Bossy Posse','jackson lacombe':'Bossy Posse',
  'matt coronato':'Bossy Posse',
  // Damage Inc.
  'nikita kucherov':'Damage Inc.','mikko rantanen':'Damage Inc.',
  'brayden point':'Damage Inc.','luke hughes':'Damage Inc.',
  'matt boldy':'Damage Inc.','dylan strome':'Damage Inc.',
  'drake batherson':'Damage Inc.','dylan guenther':'Damage Inc.',
  'adam boqvist':'Damage Inc.','kirill marchenko':'Damage Inc.',
  'leo carlsson':'Damage Inc.','simon nemec':'Damage Inc.',
  'philip broberg':'Damage Inc.','sam montembeault':'Damage Inc.',
  // Dumb and Goalie To
  'cale makar':'Dumb and Goalie To','david pastrnak':'Dumb and Goalie To',
  'thomas harley':'Dumb and Goalie To','brandon hagel':'Dumb and Goalie To',
  'cole caufield':'Dumb and Goalie To','sean monahan':'Dumb and Goalie To',
  'jonathan drouin':'Dumb and Goalie To','jack quinn':'Dumb and Goalie To',
  'mackenzie blackwood':'Dumb and Goalie To','stuart skinner':'Dumb and Goalie To',
  'morgan geekie':'Dumb and Goalie To','dmitri voronkov':'Dumb and Goalie To',
  'seamus casey':'Dumb and Goalie To','jiri kulich':'Dumb and Goalie To',
  // Killer Whales
  'victor hedman':'Killer Whales','auston matthews':'Killer Whales',
  'jack hughes':'Killer Whales','josh morrissey':'Killer Whales',
  'dustin wolf':'Killer Whales','connor bedard':'Killer Whales',
  'anze kopitar':'Killer Whales','seth jarvis':'Killer Whales',
  'quinton byfield':'Killer Whales','jamie drysdale':'Killer Whales',
  'will smith':'Killer Whales','william eklund':'Killer Whales',
  'cole perfetti':'Killer Whales','jacob markstrom':'Killer Whales',
  'dylan holloway':'Killer Whales',
  // Motor City Wings
  'kirill kaprizov':'Motor City Wings','sidney crosby':'Motor City Wings',
  'zach werenski':'Motor City Wings','jake guentzel':'Motor City Wings',
  'shayne gostisbehere':'Motor City Wings','clayton keller':'Motor City Wings',
  'dylan larkin':'Motor City Wings','lucas raymond':'Motor City Wings',
  'brandt clarke':'Motor City Wings','olen zellweger':'Motor City Wings',
  'marco rossi':'Motor City Wings','pavel dorofeyev':'Motor City Wings',
  'jake oettinger':'Motor City Wings','connor mcmichael':'Motor City Wings',
  'marco kasper':'Motor City Wings',
  // Muller Time!
  'mitch marner':'Muller Time!','roope hintz':'Muller Time!',
  'shea theodore':'Muller Time!','martin necas':'Muller Time!',
  'vincent trocheck':'Muller Time!','bryan rust':'Muller Time!',
  'carter verhaeghe':'Muller Time!','aliaksei protas':'Muller Time!',
  'logan cooley':'Muller Time!','matvei michkov':'Muller Time!',
  'zayne parekh':'Muller Time!','carter yakemchuk':'Muller Time!',
  'denton mateychuk':'Muller Time!',
  // Pernicious Puckers
  'quinn hughes':'Pernicious Puckers','leon draisaitl':'Pernicious Puckers',
  'jt miller':'Pernicious Puckers','jason robertson':'Pernicious Puckers',
  'sam reinhart':'Pernicious Puckers','tim stutzle':'Pernicious Puckers',
  'lane hutson':'Pernicious Puckers','nick suzuki':'Pernicious Puckers',
  'logan stankoven':'Pernicious Puckers','kent johnson':'Pernicious Puckers',
  'filip gustavsson':'Pernicious Puckers','simon edvinsson':'Pernicious Puckers',
  'thatcher demko':'Pernicious Puckers','artyom levshunov':'Pernicious Puckers',
  'anthony deangelo':'Pernicious Puckers',
  // Silence of the Lamb
  'logan thompson':'Silence of the Lamb','connor mcdavid':'Silence of the Lamb',
  'jesper bratt':'Silence of the Lamb','rasmus andersson':'Silence of the Lamb',
  'mark scheifele':'Silence of the Lamb','brad marchand':'Silence of the Lamb',
  'patrick kane':'Silence of the Lamb','matt duchene':'Silence of the Lamb',
  'conor garland':'Silence of the Lamb','matthew knies':'Silence of the Lamb',
  'cutter gauthier':'Silence of the Lamb','darren raddysh':'Silence of the Lamb',
  'jason zucker':'Silence of the Lamb','erik gustafsson':'Silence of the Lamb',
};

// Actual 25-26 draft picks (players added via draft, not in pre-draft rosters above).
// Keys = normName(name).toLowerCase(), values = fantasy team name.
const ACTUAL_DRAFT_2526 = {
  // Blue Line Bangers (7 picks — Ivan Demidov re-drafted after mandatory ELC drop)
  'ivan demidov':'Blue Line Bangers',
  'jordan binnington':'Blue Line Bangers',
  'mason lohrei':'Blue Line Bangers',
  'matthew savoie':'Blue Line Bangers',
  'rickard rakell':'Blue Line Bangers',
  'sebastian aho':'Blue Line Bangers',
  'tyson foerster':'Blue Line Bangers',
  // Bossy Posse (9 picks)
  'adin hill':'Bossy Posse',
  'jet greaves':'Bossy Posse',
  'joel eriksson ek':'Bossy Posse',
  'matthew schaefer':'Bossy Posse',
  'mavrik bourque':'Bossy Posse',
  'sam dickinson':'Bossy Posse',
  'scott morrow':'Bossy Posse',
  'ville koivunen':'Bossy Posse',
  'zach benson':'Bossy Posse',
  // Damage Inc. (6 picks)
  'anthony stolarz':'Damage Inc.',
  'isaac howard':'Damage Inc.',
  'kevin korchinski':'Damage Inc.',
  'logan mailloux':'Damage Inc.',
  'maxim shabanov':'Damage Inc.',
  'william nylander':'Damage Inc.',
  // Dumb and Goalie To (6 picks)
  'claude giroux':'Dumb and Goalie To',
  'gabriel landeskog':'Dumb and Goalie To',
  'nick blankenburg':'Dumb and Goalie To',
  'rasmus dahlin':'Dumb and Goalie To',
  'sam rinzel':'Dumb and Goalie To',
  'zack bolduc':'Dumb and Goalie To',
  // Killer Whales (5 picks)
  'frank nazar':'Killer Whales',
  'john klingberg':'Killer Whales',
  'matias maccelli':'Killer Whales',
  'morgan rielly':'Killer Whales',
  'sean durzi':'Killer Whales',
  // Motor City Wings (5 picks)
  'braden schneider':'Motor City Wings',
  'brent burns':'Motor City Wings',
  'jimmy snuggerud':'Motor City Wings',
  'john gibson':'Motor City Wings',
  'mackie samoskevich':'Motor City Wings',
  // Muller Time! (7 picks)
  'darcy kuemper':'Muller Time!',
  'karel vejmelka':'Muller Time!',
  'roman josi':'Muller Time!',
  'ryan donato':'Muller Time!',
  'ryan leonard':'Muller Time!',
  'wyatt johnston':'Muller Time!',
  'zeev buium':'Muller Time!',
  // Pernicious Puckers (5 picks)
  'danila yurov':'Pernicious Puckers',
  'dylan cozens':'Pernicious Puckers',
  'jake walman':'Pernicious Puckers',
  'john tavares':'Pernicious Puckers',
  'liam ohgren':'Pernicious Puckers',
  // Silence of the Lamb (6 picks)
  'alexander nikishin':'Silence of the Lamb',
  'andrei vasilevskiy':'Silence of the Lamb',
  'jonathan toews':'Silence of the Lamb',
  'michael misa':'Silence of the Lamb',
  'noah hanifin':'Silence of the Lamb',
  'pavel mintyukov':'Silence of the Lamb',
};

// Mid-season draft pick order for 25-26: teams listed worst→best (picks 1st→9th).
// Source: actual All-Star break standings (Pernicious Puckers 1st, Killer Whales 9th).
const MIDSEASON_STANDINGS_2526 = [
  'Killer Whales',       // 9th — picks 1st
  'Blue Line Bangers',   // 8th
  'Dumb and Goalie To',  // 7th
  'Damage Inc.',         // 6th
  'Silence of the Lamb', // 5th
  'Muller Time!',        // 4th
  'Motor City Wings',    // 3rd
  'Bossy Posse',         // 2nd
  'Pernicious Puckers',  // 1st — picks last
];

// Actual 25-26 mid-season draft (All-Star break, 5 rounds, reverse standings).
// drop/add keys = normName(name).toLowerCase(). Pass rounds omitted.
const ACTUAL_MIDSEASON_DRAFT_2526 = [
  // Round 1
  {round:1, team:'Killer Whales',       drop:'dylan holloway',        add:'igor chernyshov'},
  {round:1, team:'Blue Line Bangers',   drop:'michael kesselring',    add:'sam malinski'},
  {round:1, team:'Dumb and Goalie To',  drop:'sam rinzel',            add:'shayne gostisbehere'},
  {round:1, team:'Damage Inc.',         drop:'anthony stolarz',       add:'brandon bussi'},
  {round:1, team:'Silence of the Lamb', drop:'noah hanifin',          add:'mattias samuelsson'},
  {round:1, team:'Muller Time!',        drop:'carter verhaeghe',      add:'zach hyman'},
  {round:1, team:'Motor City Wings',    drop:'marco rossi',           add:'rickard rakell'},
  {round:1, team:'Bossy Posse',         drop:'lian bichsel',          add:'trevor zegras'},
  {round:1, team:'Pernicious Puckers',  drop:'kent johnson',          add:'alex debrincat'},
  // Round 2
  {round:2, team:'Killer Whales',       drop:'jacob markstrom',       add:'spencer knight'},
  {round:2, team:'Blue Line Bangers',   drop:'jordan binnington',     add:'akira schmid'},
  {round:2, team:'Dumb and Goalie To',  drop:'gabriel landeskog',     add:'josh doan'},
  {round:2, team:'Damage Inc.',         drop:'kevin korchinski',      add:'ryan shea'},
  {round:2, team:'Silence of the Lamb', drop:'jonathan toews',        add:'troy terry'},
  {round:2, team:'Muller Time!',        drop:'roope hintz',           add:'oliver kapanen'},
  {round:2, team:'Motor City Wings',    drop:'marco kasper',          add:'ryan oreilly'},
  {round:2, team:'Bossy Posse',         drop:'shane wright',          add:'emil heineman'},
  {round:2, team:'Pernicious Puckers',  drop:'jt miller',             add:'mats zuccarello'},
  // Round 3
  {round:3, team:'Killer Whales',       drop:'victor hedman',         add:'sean durzi'},
  {round:3, team:'Blue Line Bangers',   drop:'brandon montour',       add:'mike matheson'},
  {round:3, team:'Dumb and Goalie To',  drop:'sean monahan',          add:'joshua norris'},
  {round:3, team:'Damage Inc.',         drop:'philipp kurashev',      add:'luke evangelista'},
  {round:3, team:'Silence of the Lamb', drop:'uvis balinskis',        add:'josh manson'},
  {round:3, team:'Muller Time!',        drop:'carter yakemchuk',      add:'miro heiskanen'},
  {round:3, team:'Motor City Wings',    drop:'braden schneider',      add:'tom willander'},
  {round:3, team:'Bossy Posse',         drop:'jakub dobes',           add:'ilya sorokin'},
  {round:3, team:'Pernicious Puckers',  drop:'dylan cozens',          add:'tom wilson'},
  // Round 4
  {round:4, team:'Killer Whales',       drop:'shakir mukhamadullin',  add:'jakob chychrun'},
  {round:4, team:'Blue Line Bangers',   drop:'gustav forsling',       add:'john marino'},
  {round:4, team:'Dumb and Goalie To',  drop:'jonathan drouin',       add:'brock nelson'},
  {round:4, team:'Damage Inc.',         drop:'adam boqvist',          add:'charlesedouard dastous'},
  {round:4, team:'Silence of the Lamb', drop:'conor garland',         add:'tyler bertuzzi'},
  {round:4, team:'Muller Time!',        drop:'shea theodore',         add:'john carlson'},
  {round:4, team:'Motor City Wings',    drop:'cam york',              add:'scott morrow'},
  {round:4, team:'Bossy Posse',         drop:'adam fox',              add:'ryker evans'},
  {round:4, team:'Pernicious Puckers',  drop:'logan stankoven',       add:'jackson blake'},
  // Round 5
  {round:5, team:'Killer Whales',       drop:'anze kopitar',          add:'logan stankoven'},
  {round:5, team:'Blue Line Bangers',   drop:'tyson foerster',        add:'artemi panarin'},
  {round:5, team:'Motor City Wings',    drop:'mackie samoskevich',    add:'connor mcmichael'},
  {round:5, team:'Bossy Posse',         drop:'matt coronato',         add:'matt grzelcyk'},
  // DGT, DI, SOTL, MT!, PP passed in round 5
];
