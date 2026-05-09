export type ZombieID = 'walker' | 'office_zombie' | 'student_zombie' | 'benja' | 'boss';

export type ZombieDef = {
  id: ZombieID;
  name: string;
  color: number;
  maxHp: number;
  damage: number;
  description: string;
  introLine: string;
  defeatLine: string;
};

export const ZOMBIES: Record<ZombieID, ZombieDef> = {
  walker: {
    id: 'walker',
    name: 'Zombie de la calle',
    color: 0x556b2f,
    maxHp: 2,
    damage: 1,
    description: 'Un zombie común. Va a su trabajo. No sabe que está muerto.',
    introLine: '🧟 Uuuuuh... ¿atún...?',
    defeatLine: '🧟 Uuh... me... voy... al... Roca...',
  },
  office_zombie: {
    id: 'office_zombie',
    name: 'Zombie oficinista',
    color: 0x708090,
    maxHp: 3,
    damage: 1,
    description: 'Tiene corbata y una laptop podrida. Sigue respondiendo mails.',
    introLine: '🧟 *tac tac tac*... el informe... para... uuuh...',
    defeatLine: '🧟 Me... despidieron... de nuevo...',
  },
  student_zombie: {
    id: 'student_zombie',
    name: 'Zombie estudiante',
    color: 0x8b0000,
    maxHp: 3,
    damage: 2,
    description: 'Lleva una mochila. Olvida qué cursada tiene. Cursa igual.',
    introLine: '🧟 ¿Dónde... es... el aula... 43...?',
    defeatLine: '🧟 Me... bocharon... en... muertos... vivos...',
  },
  benja: {
    id: 'benja',
    name: 'Benja',
    color: 0x000000,
    maxHp: 5,
    damage: 2,
    description: 'EL JEFE FINAL. Sprite todo negro. Está crudo.',
    introLine: 'Llegaste, Valeria. Estoy crudo. Exótico. Preparate.',
    defeatLine: 'Pará, pará. Me ganaste. Muy exótico de tu parte.',
  },
  boss: {
    id: 'boss',
    name: 'Zombie Gigante',
    color: 0x4a0000,
    maxHp: 5,
    damage: 2,
    description: 'Un zombie enorme. Seguro era jefe de sistemas.',
    introLine: '🧟💼 UUuuuuh... el... deadline... ERA AYER...',
    defeatLine: '🧟💼 *se desarma en polvo de café*',
  },
};
