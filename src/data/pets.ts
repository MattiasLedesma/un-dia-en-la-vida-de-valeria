export type PetID = 'rufino' | 'berlioz' | 'bacco';

export type PetAttack = {
  name: string;
  damage: number;
  emoji: string;
  description: string;
};

export type PetDef = {
  id: PetID;
  name: string;
  species: string;
  color: number;
  secondaryColor: number;
  maxHp: number;
  attacks: PetAttack[];
  catchPhrase: string;
  specialAbility: string;
};

export const PETS: Record<PetID, PetDef> = {
  rufino: {
    id: 'rufino',
    name: 'Rufino',
    species: 'Gato gris atigrado',
    color: 0x888888,
    secondaryColor: 0x333333,
    maxHp: 3,
    attacks: [
      { name: 'Zarpazo', damage: 2, emoji: '🐾', description: 'Un zarpazo rápido' },
      { name: 'Bola de Pelo', damage: 1, emoji: '🧶', description: 'Te tira una bola de pelo' },
      { name: 'Maullido', damage: 0, emoji: '😺', description: 'Distrae al zombie' },
    ],
    catchPhrase: 'MIAU, obvio.',
    specialAbility: 'Ataque crítico +1',
  },
  berlioz: {
    id: 'berlioz',
    name: 'Berlioz',
    species: 'Gato blanco y negro elegante',
    color: 0xeeeeee,
    secondaryColor: 0x111111,
    maxHp: 3,
    attacks: [
      { name: 'Zarpazo Elegante', damage: 2, emoji: '🐾', description: 'Un zarpazo con estilo' },
      { name: 'Mirada Felina', damage: 1, emoji: '👁️', description: 'Intimida al zombie' },
      { name: 'Salto Grácil', damage: 3, emoji: '🕊️', description: 'Salta y cae sobre el zombie' },
    ],
    catchPhrase: 'Qué tedioso todo.',
    specialAbility: 'Esquiva el primer ataque',
  },
  bacco: {
    id: 'bacco',
    name: 'Bacco',
    species: 'Pastor Alemán',
    color: 0x8b4513,
    secondaryColor: 0x000000,
    maxHp: 5,
    attacks: [
      { name: 'Ladrido', damage: 1, emoji: '🐕', description: 'WOOF! Asusta al zombie' },
      { name: 'Mordida', damage: 3, emoji: '🦷', description: 'Muerde fuerte' },
      { name: 'Correcaminos', damage: 2, emoji: '💨', description: 'Corre alrededor del zombie' },
    ],
    catchPhrase: 'WOOF WOOF WOOF!',
    specialAbility: 'HP +2 (es un tanque)',
  },
};

export type PartyMember = {
  petId: PetID;
  currentHp: number;
  maxHp: number;
  isActive: boolean;
};

export function createPartyMember(petId: PetID): PartyMember {
  const def = PETS[petId];
  return { petId, currentHp: def.maxHp, maxHp: def.maxHp, isActive: false };
}
