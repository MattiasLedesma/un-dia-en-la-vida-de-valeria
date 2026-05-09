import type { PartyMember, PetID } from '../data/pets';
import { PETS, createPartyMember } from '../data/pets';
import type { ZombieID } from '../data/zombies';
import { ZOMBIES } from '../data/zombies';

export type GameState = {
  party: PartyMember[];
  atunCount: number;
  hasBackpack: boolean;
  defeatedBenja: boolean;
  collectedKey: boolean;
  currentPetIndex: number;
  flags: Record<string, boolean>;
  playerX: number;
  playerY: number;
  zone: 'room' | 'guernica' | 'allaria' | 'uade';
  completedTutorial: boolean;
};

export function createInitialState(): GameState {
  return {
    party: [],
    atunCount: 3,
    hasBackpack: false,
    defeatedBenja: false,
    collectedKey: false,
    currentPetIndex: 0,
    flags: {},
    playerX: 0,
    playerY: 0,
    zone: 'room',
    completedTutorial: false,
  };
}

export function addPetToParty(state: GameState, petId: PetID): void {
  if (!state.party.find(m => m.petId === petId)) {
    state.party.push(createPartyMember(petId));
  }
}

export function getActivePet(state: GameState): PartyMember | null {
  if (state.party.length === 0) return null;
  return state.party[state.currentPetIndex] || state.party[0];
}

export function switchPet(state: GameState): void {
  if (state.party.length < 2) return;
  state.currentPetIndex = (state.currentPetIndex + 1) % state.party.length;
}

export function healParty(state: GameState): void {
  state.party.forEach(m => { m.currentHp = m.maxHp; });
}

export const DROP_TABLE: Record<string, { atunChance: number; captures: PetID[] }> = {
  walker: { atunChance: 0.5, captures: [] },
  office_zombie: { atunChance: 0.7, captures: [] },
  student_zombie: { atunChance: 0.6, captures: [] },
  benja: { atunChance: 1, captures: [] },
  boss: { atunChance: 1, captures: [] },
};

export type BattleState = {
  petHp: number;
  petMaxHp: number;
  zombieHp: number;
  zombieMaxHp: number;
  zombieDef: ZombieID;
  isPlayerTurn: boolean;
  battleOver: boolean;
  captured: boolean;
  escaped: boolean;
  log: string[];
  isBoss: boolean;
};

export function createBattleState(pet: PartyMember, zombieId: ZombieID): BattleState {
  const zombie = ZOMBIES[zombieId];
  return {
    petHp: pet.currentHp,
    petMaxHp: pet.maxHp,
    zombieHp: zombie.maxHp,
    zombieMaxHp: zombie.maxHp,
    zombieDef: zombieId,
    isPlayerTurn: true,
    battleOver: false,
    captured: false,
    escaped: false,
    log: [],
    isBoss: zombieId === 'benja',
  };
}

export function executePlayerAttack(battle: BattleState, pet: PartyMember, attackIndex: number): void {
  if (!battle.isPlayerTurn || battle.battleOver) return;

  const petDef = PETS[pet.petId];
  const attack = petDef.attacks[attackIndex] || petDef.attacks[0];
  battle.zombieHp = Math.max(0, battle.zombieHp - attack.damage);
  battle.log.push(`${petDef.name} usó ${attack.name}!`);
  if (attack.damage > 0) {
    battle.log.push(`-${attack.damage} HP al zombie!`);
  }
  battle.isPlayerTurn = false;

  if (battle.zombieHp <= 0) {
    battle.battleOver = true;
    battle.log.push(`🧟 ${ZOMBIES[battle.zombieDef].defeatLine}`);
  }
}

export function executeZombieAttack(battle: BattleState): void {
  if (battle.isPlayerTurn || battle.battleOver) return;

  const zombie = ZOMBIES[battle.zombieDef];
  battle.petHp = Math.max(0, battle.petHp - zombie.damage);
  battle.log.push(`${zombie.name} atacó! -${zombie.damage} HP`);

  if (battle.petHp <= 0) {
    battle.log.push('Tu mascota fue derrotada!');
  }
  battle.isPlayerTurn = true;
}

export function executeCapture(battle: BattleState): boolean {
  if (battle.battleOver) return false;
  if (battle.zombieHp <= battle.zombieMaxHp * 0.5) {
    battle.captured = true;
    battle.battleOver = true;
    battle.log.push('Atún exitoso! El zombie quedó atrapado!');
    return true;
  }
  battle.log.push('El zombie resistió el atún... debilitálo más!');
  return false;
}

export function executeEscape(battle: BattleState): boolean {
  if (battle.battleOver) return false;
  battle.escaped = true;
  battle.battleOver = true;
  battle.log.push('Huiste del combate!');
  return true;
}
