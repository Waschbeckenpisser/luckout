/* Luckout – Story-Texte, bewusst einfach gehalten (STORY.md ist die alte Langfassung). {name} = gewählter Name, ohne Pronomen und ohne Genitiv-s.
   ep[i] gehört zu Level i+1 (E.EPOCHS[i]): t = Einstieg auf der Titelkarte, mem = kurzes Ereignis nach dem Champion (Portal zur nächsten Epoche). */
const STORY = {
  intro: [
    ['🥊', '{name} boxt und steht kurz vor dem großen Titelkampf.'],
    ['💼', 'Ein Gauner will, dass {name} absichtlich verliert. {name} sagt Nein.'],
    ['💡', 'Mitten im Kampf geht das Licht aus. {name} rutscht aus und verliert alles.'],
    ['🎰', 'Jahre später steht in einer Spielhalle ein alter Automat: LUCKOUT.'],
    ['⚡', 'Drei Siebenen, und der Automat schleudert {name} zurück in die Urzeit.'],
    ['🦖', 'Der Weg nach Hause führt durch zehn Epochen. Jeder Gewinn ist ein Treffer!'],
  ],
  ep: [
    { t: 'Vulkane, Farne und ein Brüllen im Nebel.', mem: 'Der T-Rex fällt um. Ein Portal öffnet sich: weiter in die Steinzeit!' },
    { t: 'Schnee, Feuer und Trommeln in der Nacht.', mem: 'Die Steinzeit ist geschafft. Nächster Halt: Ägypten.' },
    { t: 'Gold im Sand, und Pharao Neferkat erhebt sich.', mem: 'Der Pharao ist besiegt. Das Portal führt nach Rom.' },
    { t: 'Brot und Spiele, fünfzigtausend Zuschauer.', mem: 'Das Kolosseum jubelt. Weiter geht es zu den Wikingern.' },
    { t: 'Sturm, Salz und Drachenboote im Fjord.', mem: 'Die Wikinger feiern {name}. Das Portal führt ins Mittelalter.' },
    { t: 'Auf dem Turm schläft ein Drache auf Münzen.', mem: 'Der Drache ist besiegt. Weiter in den Wilden Westen!' },
    { t: 'High Noon, Staub und eine knarrende Saloontür.', mem: 'Der Staub legt sich. Nächster Halt: die Zwanziger.' },
    { t: 'Jazz, Champagner und Glücksspiel bis zum Morgen.', mem: 'Die Musik verstummt. Weiter in die Neon-80er!' },
    { t: 'Synthesizer, Neonlicht und eine Spielhalle.', mem: 'Der Automat qualmt. Nur noch ein Sprung bis in die Zukunft.' },
    { t: 'Glastürme und Roboter. Der Supercomputer OMEGA wartet.', mem: 'OMEGA ist besiegt. Der Weg nach Hause ist frei!' },
  ],
  end: [
    ['🎰', 'Ein letzter Spin: Sieben. Sieben. Sieben.'],
    ['🏟️', '{name} ist zurück, am Abend des Titelkampfs.'],
    ['💡', 'Diesmal sieht {name} die Falle kommen und weicht aus.'],
    ['🥊', 'KNOCKOUT! {name} ist Champion.'],
  ],
  lose: [
    'Gezählt wird bis zehn. Diesmal bist du liegen geblieben.',
    'Der Gauner lacht. Aber aufgeben gilt nicht.',
    'Steh auf und versuch es nochmal.',
  ],
};
