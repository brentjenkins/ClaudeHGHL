// 24-25 season setup data: prior-season (23-24) final standings, pre-drop rosters, manual
// cap-hit overrides, roster stubs, post-drop keeper rosters, and actual draft picks.
// Split out of roster_tracker.html to keep the main file size down; loaded via <script src> before the app script.

// 2023-24 final standings — determines 24-25 draft order (rank 9 picks first)
const FINAL_STANDINGS_2324 = {
  'Dumb and Goalie To':  {rank:1, pts:1224},
  'Motor City Wings':    {rank:2, pts:1152},
  'Damage Inc.':         {rank:3, pts:1137},
  'Pernicious Puckers':  {rank:4, pts:1104},
  'Killer Whales':       {rank:5, pts:1065},
  'Bossy Posse':         {rank:6, pts:1064},
  'Silence of the Lamb': {rank:7, pts:1049},
  'Muller Time!':        {rank:8, pts:1037},
  'Blue Line Bangers':   {rank:9, pts:907},
};

// 23-24 final rosters — pre-drop starting state for 24-25 simulation. Keys = normName.toLowerCase().
const PREDROP_ROSTER_2425 = {
  // Damage Inc. (19 players)
  'nikita kucherov':'Damage Inc.','brayden point':'Damage Inc.','mikko rantanen':'Damage Inc.',
  'william nylander':'Damage Inc.','mark scheifele':'Damage Inc.','drake batherson':'Damage Inc.',
  'leo carlsson':'Damage Inc.','kirill marchenko':'Damage Inc.','luke evangelista':'Damage Inc.',
  'yegor chinakhov':'Damage Inc.','connor zary':'Damage Inc.','matt boldy':'Damage Inc.',
  'jakob chychrun':'Damage Inc.','kandre miller':'Damage Inc.','luke hughes':'Damage Inc.',
  'kaiden guhle':'Damage Inc.','mike matheson':'Damage Inc.','kris letang':'Damage Inc.',
  'alexandar georgiev':'Damage Inc.','joey daccord':'Damage Inc.',
  // Blue Line Bangers (20 players)
  'adam fantilli':'Blue Line Bangers','adrian kempe':'Blue Line Bangers','alex tuch':'Blue Line Bangers',
  'brady skjei':'Blue Line Bangers','brayden mcnabb':'Blue Line Bangers','brock boeser':'Blue Line Bangers',
  'chandler stephenson':'Blue Line Bangers','connor hellebuyck':'Blue Line Bangers','connor ingram':'Blue Line Bangers',
  'eeli tolvanen':'Blue Line Bangers','elias lindholm':'Blue Line Bangers','jake middleton':'Blue Line Bangers',
  'jake neighbours':'Blue Line Bangers','jared mccann':'Blue Line Bangers','jordan spence':'Blue Line Bangers',
  'mason marchment':'Blue Line Bangers','noah hanifin':'Blue Line Bangers','trevor moore':'Blue Line Bangers',
  'tyler toffoli':'Blue Line Bangers','will borgen':'Blue Line Bangers',
  // Bossy Posse (20 players)
  'tage thompson':'Bossy Posse','ryan nugenthopkins':'Bossy Posse','kyle connor':'Bossy Posse',
  'zach hyman':'Bossy Posse','martin necas':'Bossy Posse','mason mctavish':'Bossy Posse',
  'nathan mackinnon':'Bossy Posse','pavel zacha':'Bossy Posse','juraj slafkovsky':'Bossy Posse',
  'morgan geekie':'Bossy Posse','trevor zegras':'Bossy Posse','joe pavelski':'Bossy Posse',
  'evan bouchard':'Bossy Posse','vince dunn':'Bossy Posse','david jiricek':'Bossy Posse',
  'rasmus sandin':'Bossy Posse','cam york':'Bossy Posse','simon nemec':'Bossy Posse',
  'juuse saros':'Bossy Posse','samuel ersson':'Bossy Posse',
  // Dumb and Goalie To (18 players)
  'brandon hagel':'Dumb and Goalie To','auston matthews':'Dumb and Goalie To','mats zuccarello':'Dumb and Goalie To',
  'pavel buchnevich':'Dumb and Goalie To','casey mittelstadt':'Dumb and Goalie To','jj peterka':'Dumb and Goalie To',
  'daniel sprong':'Dumb and Goalie To','david pastrnak':'Dumb and Goalie To','jonathan drouin':'Dumb and Goalie To',
  'artemi panarin':'Dumb and Goalie To','jack quinn':'Dumb and Goalie To','cale makar':'Dumb and Goalie To',
  'thomas harley':'Dumb and Goalie To','travis sanheim':'Dumb and Goalie To','mike reilly':'Dumb and Goalie To',
  'bowen byram':'Dumb and Goalie To','henry thrun':'Dumb and Goalie To','stuart skinner':'Dumb and Goalie To',
  'ukkopekka luukkonen':'Dumb and Goalie To','thomas novak':'Dumb and Goalie To',
  // Killer Whales (20 players)
  'jack hughes':'Killer Whales','andrei svechnikov':'Killer Whales','seth jarvis':'Killer Whales',
  'quinton byfield':'Killer Whales','william eklund':'Killer Whales','connor bedard':'Killer Whales',
  'owen tippett':'Killer Whales','cole perfetti':'Killer Whales','frank vatrano':'Killer Whales',
  'sebastian aho_F':'Killer Whales', // position-qualified: only the CAR forward, not SEA defenceman
  'joel farabee':'Killer Whales','nikolaj ehlers':'Killer Whales',
  'filip hronek':'Killer Whales','jamie drysdale':'Killer Whales','timothy liljegren':'Killer Whales',
  'josh morrissey':'Killer Whales','victor hedman':'Killer Whales','adam fox':'Killer Whales',
  'thatcher demko':'Killer Whales','cam talbot':'Killer Whales',
  // Motor City Wings (20 players)
  'kirill kaprizov':'Motor City Wings','sidney crosby':'Motor City Wings','evgeni malkin':'Motor City Wings',
  'jake guentzel':'Motor City Wings','dylan larkin':'Motor City Wings','lucas raymond':'Motor City Wings',
  'wyatt johnston':'Motor City Wings','clayton keller':'Motor City Wings','marco rossi':'Motor City Wings',
  'yegor sharangovich':'Motor City Wings','gustav nyquist':'Motor City Wings','dylan guenther':'Motor City Wings',
  'morgan rielly':'Motor City Wings','brandon montour':'Motor City Wings','shayne gostisbehere':'Motor City Wings',
  'jj moser':'Motor City Wings','egor zamula':'Motor City Wings','brandt clarke':'Motor City Wings',
  'jake oettinger':'Motor City Wings','alex lyon':'Motor City Wings',
  // Muller Time! (20 players — elias pettersson_F qualifies the F to avoid collision with D)
  'elias pettersson_F':'Muller Time!',
  'jonathan marchessault':'Muller Time!','cole caufield':'Muller Time!',
  'matias maccelli':'Muller Time!','logan cooley':'Muller Time!','matthew tkachuk':'Muller Time!',
  'carter verhaeghe':'Muller Time!','travis konecny':'Muller Time!','matthew poitras':'Muller Time!',
  'mitch marner':'Muller Time!','vincent trocheck':'Muller Time!','shane pinto':'Muller Time!',
  'noah dobson':'Muller Time!','devon toews':'Muller Time!','pavel mintyukov':'Muller Time!',
  'justin barron':'Muller Time!','kevin shattenkirk':'Muller Time!','calen addison':'Muller Time!',
  'pyotr kochetkov':'Muller Time!','igor shesterkin':'Muller Time!',
  // Pernicious Puckers (20 players)
  'leon draisaitl':'Pernicious Puckers','jason robertson':'Pernicious Puckers','jt miller':'Pernicious Puckers',
  'alex debrincat':'Pernicious Puckers','alexis lafreniere':'Pernicious Puckers','mika zibanejad':'Pernicious Puckers',
  'zach benson':'Pernicious Puckers','sam reinhart':'Pernicious Puckers','robert thomas':'Pernicious Puckers',
  'gabriel vilardi':'Pernicious Puckers','dmitri voronkov':'Pernicious Puckers','logan stankoven':'Pernicious Puckers',
  'quinn hughes':'Pernicious Puckers','sean durzi':'Pernicious Puckers','kevin korchinski':'Pernicious Puckers',
  'brock faber':'Pernicious Puckers','jake sanderson':'Pernicious Puckers','scott perunovich':'Pernicious Puckers',
  'ilya sorokin':'Pernicious Puckers','logan thompson':'Pernicious Puckers',
  // Silence of the Lamb (20 players)
  'connor mcdavid':'Silence of the Lamb','brad marchand':'Silence of the Lamb','brock nelson':'Silence of the Lamb',
  'jesper bratt':'Silence of the Lamb','matty beniers':'Silence of the Lamb','matthew knies':'Silence of the Lamb',
  'tim stutzle':'Silence of the Lamb','matt duchene':'Silence of the Lamb','patrick kane':'Silence of the Lamb',
  'ryan oreilly':'Silence of the Lamb','filip forsberg':'Silence of the Lamb','james van riemsdyk':'Silence of the Lamb',
  'moritz seider':'Silence of the Lamb','erik gustafsson':'Silence of the Lamb','rasmus andersson':'Silence of the Lamb',
  'gustav forsling':'Silence of the Lamb','darren raddysh':'Silence of the Lamb','braden schneider':'Silence of the Lamb',
  'linus ullmark':'Silence of the Lamb','jeremy swayman':'Silence of the Lamb',
};

// Manual 2024-25 cap hits for players whose PuckPedia slugs 404 or had no page contract panel.
// Key = normName(name).toLowerCase() + "_" + posGroup. yrStr = contract year label.
const MANUAL_CAPS_2425 = {
  'cam york_D':       { cap: 1.6000, yrStr: 'Yr 2 / 2' },
  'matty beniers_F':  { cap: 7.1400, yrStr: 'Yr 1 / 7' },
  'will borgen_D':    { cap: 2.7000, yrStr: 'Yr 2 / 2' },
  'egor zamula_D':    { cap: 1.7000, yrStr: 'Yr 1 / 2' },
  'jake middleton_D': { cap: 2.4500, yrStr: 'Yr 3 / 3' },
  'nick perbix_D':    { cap: 1.1250, yrStr: 'Yr 2 / 2' },
  'jj moser_D':       { cap: 3.3750, yrStr: 'Yr 1 / 2' },
  'jj peterka_F':     { cap: 0.8558, yrStr: 'Yr 3 / 3' },
  'calen addison_D':  { cap: 0,      yrStr: '' },          // no 2024-25 contract
};

// Players that may not have a record in the main players array (retired, low-profile, etc.)
// Created as stubs during resetSim2425() if missing.
const PREDROP_STUBS_2425 = [
  {name:'Calen Addison',      pos:'D'},
  {name:'Kevin Shattenkirk',  pos:'D'},
  {name:'Alexandar Georgiev', pos:'G'},
  {name:'Yegor Chinakhov',    pos:'RW'},
  {name:'Matthew Poitras',   pos:'C'},
  {name:'Henry Thrun',       pos:'D'},
  {name:'Daniel Sprong',     pos:'RW'},
  {name:'Joe Pavelski',      pos:'C'},
];

// Post-drop pre-pick 24-25 rosters. Keys = normName.toLowerCase().
const ACTUAL_ROSTER_2425 = {
  // Damage Inc. (14 keepers — dropped: Nylander, Scheifele, Chinakhov, Chychrun, Letang)
  'nikita kucherov':'Damage Inc.','brayden point':'Damage Inc.','mikko rantanen':'Damage Inc.',
  'drake batherson':'Damage Inc.','leo carlsson':'Damage Inc.','kirill marchenko':'Damage Inc.',
  'luke evangelista':'Damage Inc.','connor zary':'Damage Inc.','matt boldy':'Damage Inc.',
  'kandre miller':'Damage Inc.','luke hughes':'Damage Inc.','kaiden guhle':'Damage Inc.',
  'mike matheson':'Damage Inc.','alexandar georgiev':'Damage Inc.','joey daccord':'Damage Inc.',
  // Blue Line Bangers (10 keepers — dropped: Skjei, McNabb, Stephenson, Tolvanen, Lindholm, Middleton, Marchment, Hanifin, Moore, Toffoli)
  'adam fantilli':'Blue Line Bangers','adrian kempe':'Blue Line Bangers','alex tuch':'Blue Line Bangers',
  'brock boeser':'Blue Line Bangers','connor hellebuyck':'Blue Line Bangers','connor ingram':'Blue Line Bangers',
  'jake neighbours':'Blue Line Bangers','jared mccann':'Blue Line Bangers','jordan spence':'Blue Line Bangers',
  'will borgen':'Blue Line Bangers',
  // Bossy Posse (15 keepers — dropped: Necas, Pavelski, Dunn, Sandin, Ersson)
  'tage thompson':'Bossy Posse','ryan nugenthopkins':'Bossy Posse','kyle connor':'Bossy Posse',
  'zach hyman':'Bossy Posse','mason mctavish':'Bossy Posse','nathan mackinnon':'Bossy Posse',
  'pavel zacha':'Bossy Posse','juraj slafkovsky':'Bossy Posse','morgan geekie':'Bossy Posse',
  'trevor zegras':'Bossy Posse','evan bouchard':'Bossy Posse','david jiricek':'Bossy Posse',
  'cam york':'Bossy Posse','simon nemec':'Bossy Posse','juuse saros':'Bossy Posse',
  // Dumb and Goalie To (13 keepers — dropped: Matthews, Mittelstadt, Sanheim, Reilly, Thrun)
  'brandon hagel':'Dumb and Goalie To','pavel buchnevich':'Dumb and Goalie To','jj peterka':'Dumb and Goalie To',
  'daniel sprong':'Dumb and Goalie To','david pastrnak':'Dumb and Goalie To','jonathan drouin':'Dumb and Goalie To',
  'artemi panarin':'Dumb and Goalie To','jack quinn':'Dumb and Goalie To','cale makar':'Dumb and Goalie To',
  'thomas harley':'Dumb and Goalie To','bowen byram':'Dumb and Goalie To','stuart skinner':'Dumb and Goalie To',
  'mats zuccarello':'Dumb and Goalie To',
  'ukkopekka luukkonen':'Dumb and Goalie To','thomas novak':'Dumb and Goalie To',
  // Killer Whales (12 keepers — dropped: Svechnikov, Aho, Ehlers, Hronek, Liljegren, Fox, Demko, Talbot)
  'jack hughes':'Killer Whales','seth jarvis':'Killer Whales','quinton byfield':'Killer Whales',
  'william eklund':'Killer Whales','connor bedard':'Killer Whales','owen tippett':'Killer Whales',
  'cole perfetti':'Killer Whales','frank vatrano':'Killer Whales','jamie drysdale':'Killer Whales',
  'josh morrissey':'Killer Whales','victor hedman':'Killer Whales','joel farabee':'Killer Whales',
  // Motor City Wings (14 keepers — dropped: Malkin, Sharangovich, Montour, Moser, Zamula, Lyon)
  'kirill kaprizov':'Motor City Wings','sidney crosby':'Motor City Wings','jake guentzel':'Motor City Wings',
  'dylan larkin':'Motor City Wings','lucas raymond':'Motor City Wings','wyatt johnston':'Motor City Wings',
  'clayton keller':'Motor City Wings','marco rossi':'Motor City Wings','gustav nyquist':'Motor City Wings',
  'dylan guenther':'Motor City Wings','morgan rielly':'Motor City Wings','shayne gostisbehere':'Motor City Wings',
  'brandt clarke':'Motor City Wings','jake oettinger':'Motor City Wings',
  // Muller Time! (14 keepers — dropped: Pettersson, Caufield, Toews, Barron, Shattenkirk, Addison)
  'jonathan marchessault':'Muller Time!','matias maccelli':'Muller Time!','logan cooley':'Muller Time!',
  'matthew tkachuk':'Muller Time!','carter verhaeghe':'Muller Time!','travis konecny':'Muller Time!',
  'matthew poitras':'Muller Time!','mitch marner':'Muller Time!','vincent trocheck':'Muller Time!',
  'shane pinto':'Muller Time!','noah dobson':'Muller Time!','pavel mintyukov':'Muller Time!',
  'pyotr kochetkov':'Muller Time!','igor shesterkin':'Muller Time!',
  // Pernicious Puckers (13 keepers — dropped: Zibanejad, Vilardi, Voronkov, Durzi, Sanderson, Sorokin, Thompson)
  'leon draisaitl':'Pernicious Puckers','jason robertson':'Pernicious Puckers','jt miller':'Pernicious Puckers',
  'alex debrincat':'Pernicious Puckers','alexis lafreniere':'Pernicious Puckers','zach benson':'Pernicious Puckers',
  'sam reinhart':'Pernicious Puckers','logan stankoven':'Pernicious Puckers','quinn hughes':'Pernicious Puckers',
  'kevin korchinski':'Pernicious Puckers','brock faber':'Pernicious Puckers','scott perunovich':'Pernicious Puckers',
  'robert thomas':'Pernicious Puckers',
  // Silence of the Lamb (13 keepers — dropped: Beniers, Stutzle, Seider, Forsling, Schneider, Ullmark, Swayman)
  'connor mcdavid':'Silence of the Lamb','brad marchand':'Silence of the Lamb','brock nelson':'Silence of the Lamb',
  'jesper bratt':'Silence of the Lamb','matthew knies':'Silence of the Lamb','matt duchene':'Silence of the Lamb',
  'patrick kane':'Silence of the Lamb','ryan oreilly':'Silence of the Lamb','filip forsberg':'Silence of the Lamb',
  'james van riemsdyk':'Silence of the Lamb','erik gustafsson':'Silence of the Lamb',
  'rasmus andersson':'Silence of the Lamb','darren raddysh':'Silence of the Lamb',
};

// Actual 24-25 draft picks. Keys = normName.toLowerCase(), values = team.
const ACTUAL_DRAFT_2425 = {
  // Blue Line Bangers (10 picks)
  'macklin celebrini':'Blue Line Bangers',
  'mackenzie weegar':'Blue Line Bangers',
  'nico hischier':'Blue Line Bangers',
  'gustav forsling':'Blue Line Bangers',
  'elias pettersson_F':'Blue Line Bangers',  // F (VAN) — disambiguates from Elias Pettersson D (SEA)
  'nick schmaltz':'Blue Line Bangers',
  'michael kesselring':'Blue Line Bangers',
  'juuso valimaki':'Blue Line Bangers',
  'rutger mcgroarty':'Blue Line Bangers',
  'dylan cozens':'Blue Line Bangers',
  // Muller Time! (6 picks)
  'matvei michkov':'Muller Time!',
  'shea theodore':'Muller Time!',
  'denton mateychuk':'Muller Time!',
  'auston matthews':'Muller Time!',
  'jj moser':'Muller Time!',
  'justin barron':'Muller Time!',
  // Silence of the Lamb (7 picks)
  'cutter gauthier':'Silence of the Lamb',
  'charlie lindgren':'Silence of the Lamb',
  'samuel ersson':'Silence of the Lamb',
  'roman josi':'Silence of the Lamb',
  'kris letang':'Silence of the Lamb',
  'joel eriksson ek':'Silence of the Lamb',
  'mike reilly':'Silence of the Lamb',
  // Bossy Posse (5 picks)
  'joseph woll':'Bossy Posse',
  'adam fox':'Bossy Posse',
  'william nylander':'Bossy Posse',
  'shane wright':'Bossy Posse',
  'nick perbix':'Bossy Posse',
  // Killer Whales (8 picks)
  'will smith':'Killer Whales',
  'jacob markstrom':'Killer Whales',
  'dustin wolf':'Killer Whales',
  'miro heiskanen':'Killer Whales',
  'braden schneider':'Killer Whales',
  'ty emberson':'Killer Whales',
  'nazem kadri':'Killer Whales',
  'fabian zetterlund':'Killer Whales',
  // Pernicious Puckers (7 picks)
  'lane hutson':'Pernicious Puckers',
  'simon edvinsson':'Pernicious Puckers',
  'tim stutzle':'Pernicious Puckers',
  'nick suzuki':'Pernicious Puckers',
  'arturs silovs':'Pernicious Puckers',
  'filip gustavsson':'Pernicious Puckers',
  'victor olofsson':'Pernicious Puckers',
  // Damage Inc. (5 picks)
  'adam boqvist':'Damage Inc.',
  'henry thrun':'Damage Inc.',
  'mathew barzal':'Damage Inc.',
  'jordan kyrou':'Damage Inc.',
  'dylan strome':'Damage Inc.',
  // Motor City Wings (6 picks)
  'olen zellweger':'Motor City Wings',
  'mason lohrei':'Motor City Wings',
  'ridly greig':'Motor City Wings',
  'jake walman':'Motor City Wings',
  'teuvo teravainen':'Motor City Wings',
  'alex lyon':'Motor City Wings',
  // Dumb and Goalie To (5 picks)
  'seamus casey':'Dumb and Goalie To',
  'jeff skinner':'Dumb and Goalie To',
  'josh doan':'Dumb and Goalie To',
  'jakob chychrun':'Dumb and Goalie To',
  'oliver ekmanlarsson':'Dumb and Goalie To',
};
