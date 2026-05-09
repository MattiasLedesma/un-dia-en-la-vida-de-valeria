export type DialogueLine = {
  speaker: string;
  text: string;
  options?: { text: string; next: string }[];
  next?: string;
  action?: string;
};

export type DialogueTree = Record<string, DialogueLine>;

export const DIALOGUES: Record<string, DialogueTree> = {
  intro: {
    start: {
      speaker: '???',
      text: 'Valeria... Valeria... despertá...',
      next: 'look',
    },
    look: {
      speaker: 'Narrador',
      text: 'Valeria abre los ojos. Un día como cualquier otro... o no.',
      next: 'fruit',
    },
    fruit: {
      speaker: 'Narrador',
      text: 'En la mesa hay una fruta rara. Tiene espirales. Se ve... cuestionable.',
      next: 'eat',
    },
    eat: {
      speaker: 'Valeria',
      text: '¿Una fruta? Bueno, fruta es fruta. *la muerde* ¡Puaj! ¿Qué es esto?',
      next: 'power',
    },
    power: {
      speaker: '???',
      text: '¡MIAU! ¡Al fin! ¡Pensé que nunca la ibas a comer!',
      next: 'shock',
    },
    shock: {
      speaker: 'Valeria',
      text: '¿QUIÉN HABLÓ?',
      next: 'rufino_intro',
    },
    rufino_intro: {
      speaker: 'Rufino 🐱',
      text: 'Yo, obvio. Rufino. ¿Nunca escuchaste hablar a un gato? Ah, pará... recién comiste la fruta del diablo. Bienvenida al club.',
      next: 'tutorial',
    },
    tutorial: {
      speaker: 'Narrador',
      text: 'VALERIA ahora entiende a los animales! Usá las FLECHAS o WASD para moverte. Presioná ESPACIO para interactuar.',
      next: 'rufino_quest',
    },
    rufino_quest: {
      speaker: 'Rufino 🐱',
      text: 'Che, escuché que hay zombies por ahí. ZOMBIES. En Guernica. Yo te ayudo si me llevás atún. Y una mochila. Gatil.',
      next: 'berlioz_intro',
    },
    berlioz_intro: {
      speaker: 'Berlioz 🐱',
      text: 'Rufino, siempre tan vulgar. Lo que mi colega intenta decir es: te unimos. Tenemos un pacto. Nos llevás en la mochila, te defendemos.',
      options: [
        { text: '¿En la mochila?', next: 'berlioz_mochila' },
        { text: '¿Un pacto?', next: 'berlioz_pacto' },
      ],
    },
    berlioz_mochila: {
      speaker: 'Berlioz 🐱',
      text: 'Sí. Mochila especial para gatos. Es cómoda. Tiene agujeros para las orejas. Andá, buscala que está ahí.',
      next: 'bacco_intro',
    },
    berlioz_pacto: {
      speaker: 'Berlioz 🐱',
      text: 'Un pacto de amistad. O de conveniencia. Todavía no decidí. Pero la mochila está ahí, andá.',
      next: 'bacco_intro',
    },
    bacco_intro: {
      speaker: 'Bacco 🐶',
      text: '¡WOOF WOOF WOOF! ¡ZOMBIES! ¡PELEAR! ¡SÍ! ¡VAMO!',
      next: 'ready',
    },
    ready: {
      speaker: 'Narrador',
      text: 'Presioná ESPACIO para agarrar la mochila y salir.',
      action: 'start_game',
    },
  },

  rufino_encounter: {
    start: {
      speaker: 'Rufino 🐱',
      text: '¡MIAU! ¡Un zombie! Dale Vale, mostrale de qué está hecha la gata.',
      options: [
        { text: '¡Rufino, yo te elijo!', next: 'battle' },
        { text: 'Huír', next: 'flee' },
      ],
    },
    battle: {
      speaker: 'Narrador',
      text: '¡Combate!',
      action: 'battle_rufino',
    },
    flee: {
      speaker: 'Rufino 🐱',
      text: '¿Huír? Pero si recién empezamos... bueno, dale corre.',
      action: 'flee',
    },
  },

  berlioz_encounter: {
    start: {
      speaker: 'Berlioz 🐱',
      text: 'Oh, otro zombie. Qué tedioso. ¿Lo eliminamos o qué?',
      options: [
        { text: '¡Berlioz, atacá!', next: 'battle' },
        { text: 'Dejá, corro', next: 'flee' },
      ],
    },
    battle: {
      speaker: 'Narrador',
      text: '¡Combate!',
      action: 'battle_berlioz',
    },
    flee: {
      speaker: 'Berlioz 🐱',
      text: 'Correr. Claro. Muy digno.',
      action: 'flee',
    },
  },

  bacco_encounter: {
    start: {
      speaker: 'Bacco 🐶',
      text: '¡WOOF! ¡ZOMBIE DETECTADO! ¡MODO ATAQUE!',
      options: [
        { text: '¡Bacco, dale!', next: 'battle' },
        { text: 'No, mejor no', next: 'flee' },
      ],
    },
    battle: {
      speaker: 'Narrador',
      text: '¡Combate!',
      action: 'battle_bacco',
    },
    flee: {
      speaker: 'Bacco 🐶',
      text: '¿Pero... pero... oh. Bueno. *triste*',
      action: 'flee',
    },
  },

  camila_office: {
    start: {
      speaker: 'Camila 🙋‍♀️',
      text: '¡VALERIA! ¿Qué hacés acá? Escuché que andás peleando zombies con gatos. Es muy de vos, la verdad.',
      options: [
        { text: 'Es una larga historia', next: 'cami_1' },
        { text: 'La fruta del diablo', next: 'cami_2' },
      ],
    },
    cami_1: {
      speaker: 'Camila 🙋‍♀️',
      text: 'Siempre te pasan cosas raras. Bueno, cuidate. Hay zombies hasta en la máquina de café.',
      next: 'cami_end',
    },
    cami_2: {
      speaker: 'Camila 🙋‍♀️',
      text: '¿UNA FRUTA DEL DIABLO? ¿POSTA? Ay Vale, sos una loca. Bueno andá, que hay zombies cerca.',
      next: 'cami_end',
    },
    cami_end: {
      speaker: 'Camila 🙋‍♀️',
      text: 'Ah, y cuando veas a tu novio decile que deje de mandar memes en el grupo de trabajo.',
      action: 'close',
    },
  },

  rama_sol_office: {
    start: {
      speaker: 'Rama 💑',
      text: 'Mira Sol, es Valeria. La que anda con gatos.',
      next: 'sol_1',
    },
    sol_1: {
      speaker: 'Sol 💑',
      text: '¡Hola Vale! Te vi en la historia de Instagram con Rufino. Son el alma del evento.',
      options: [
        { text: 'Son una pareja hermosa', next: 'rama_sol_final' },
        { text: '¿Vieron zombies por acá?', next: 'rama_sol_zombie' },
      ],
    },
    rama_sol_zombie: {
      speaker: 'Rama 💑',
      text: 'Sí, hay uno en el baño de sistemas. Pero no entra, le da cosa el café de la máquina.',
      next: 'rama_sol_final',
    },
    rama_sol_final: {
      speaker: 'Sol 💑',
      text: 'Bueno, dale con los gatos. ¡Son como vos y Matias!... pero con más pelo.',
      action: 'close',
    },
  },

  tiziano_uade: {
    start: {
      speaker: 'Tiziano 🤵',
      text: '¡Pero mirá quién vino! La cazagatos. ¿Viste cómo me dejé el bigote? Está impecable.',
      options: [
        { text: 'Te queda bien', next: 'tizi_1' },
        { text: 'Te queda mal', next: 'tizi_2' },
      ],
    },
    tizi_1: {
      speaker: 'Tiziano 🤵',
      text: 'Obvio que me queda bien. Soy Tiziano. El bigote es mi sello. Paris de Argentina.',
      next: 'tizi_end',
    },
    tizi_2: {
      speaker: 'Tiziano 🤵',
      text: '¿MAL? ¡Esto es arte! Bueno, vos seguí con tus gatos, no entendés de estética.',
      next: 'tizi_end',
    },
    tizi_end: {
      speaker: 'Tiziano 🤵',
      text: 'Dato: hay un zombie en el aula 43. Anda con cuidado. O no, total tenés gatos.',
      action: 'close',
    },
  },

  benja_final_boss: {
    start: {
      speaker: '???',
      text: '...',
      next: 'benja_1',
    },
    benja_1: {
      speaker: 'Benja 🖤',
      text: 'Llegaste, Valeria. Sabía que ibas a venir. Siempre me perseguís para joderme.',
      next: 'benja_2',
    },
    benja_2: {
      speaker: 'Benja 🖤',
      text: '"Benja, hace esto", "Benja, sos negro", "Benja, decí exótico". Ya está. Hoy se termina.',
      options: [
        { text: 'Pero Benja...', next: 'benja_3' },
        { text: 'Decí exótico', next: 'benja_rage' },
      ],
    },
    benja_rage: {
      speaker: 'Benja 🖤',
      text: '¡EXÓTICO! ¡AHÍ ESTÁ! ¿VES? ¡Siempre! Bueno, preparate. Esto es personal.',
      next: 'benja_fight',
    },
    benja_3: {
      speaker: 'Benja 🖤',
      text: 'No, no hay pero. Hoy te enfrento. Con todo mi poder negro. Exótico. Crudo.',
      next: 'benja_fight',
    },
    benja_fight: {
      speaker: 'Narrador',
      text: '¡BATALLA FINAL! VALERIA VS BENJA',
      action: 'battle_benja',
    },
  },

  final_key: {
    start: {
      speaker: 'Narrador',
      text: 'Después de vencer a Benja (que en el fondo te quiere), llegás a la puerta de Matias.',
      next: 'mati_intro',
    },
    mati_intro: {
      speaker: 'Matias 💻',
      text: 'Llegaste. Sabía que lo ibas a lograr.',
      next: 'mati_2',
    },
    mati_2: {
      speaker: 'Matias 💻',
      text: 'Un año. Un año con vos, con los gatos, con los zombies, con todo.',
      next: 'mati_3',
    },
    mati_3: {
      speaker: 'Matias 💻',
      text: 'Y ahora... esto es tuyo.',
      next: 'key_appear',
    },
    key_appear: {
      speaker: 'Narrador',
      text: '✨ Una llave aparece frente a vos. Brillando. ✨',
      next: 'mati_4',
    },
    mati_4: {
      speaker: 'Matias 💻',
      text: 'FELIZ ANIVERSARIO, VALERIA. TE AMO.',
      next: 'click_key',
    },
    click_key: {
      speaker: 'Narrador',
      text: 'CLICKEÁ LA LLAVE PARA RECOGERLA 🗝️',
      action: 'claim_key',
    },
  },
};

export function getDialogue(scene: string, key: string): DialogueLine | null {
  const tree = DIALOGUES[scene];
  if (!tree) return null;
  return tree[key] || null;
}
