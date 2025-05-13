export interface ParsedDiceNotation {
  count: number;
  sides: number;
  modifier: number;
  error?: string;
}

export interface RollResult {
  rolls: number[];
  total: number; // total of dice rolls before modifier
  finalResult: number; // total after modifier
}

export interface AdvantageDisadvantageRollResult extends RollResult {
  chosenRoll: number;
  discardedRoll: number;
  firstRollSet: number[]; // The dice rolled for the first d20
  secondRollSet: number[]; // The dice rolled for the second d20
  rollForModifier: number[]; // The non-d20 dice if any (e.g. damage dice part)
}

/**
 * Parses dice notation string like "2d6+3", "d20-1", "4d8".
 * Returns an object with count, sides, and modifier.
 * If notation is invalid, error property will be set.
 */
export function parseDiceNotation(notation: string): ParsedDiceNotation {
  notation = notation.toLowerCase().trim();
  if (!notation) {
    return { count: 1, sides: 20, modifier: 0 }; // Default to 1d20 if empty
  }

  const match = notation.match(/^(?:(\d+)\s*)?[dD]\s*(\d+)\s*(?:([+-])\s*(\d+))?$/);

  if (!match) {
    // Try matching if only "dNUMBER" like "d20"
    const simpleDMatch = notation.match(/^[dD]\s*(\d+)$/);
    if (simpleDMatch) {
        const sides = parseInt(simpleDMatch[1]);
        if (isNaN(sides) || sides <= 0) {
            return { count: 0, sides: 0, modifier: 0, error: "Invalid die sides." };
        }
        return { count: 1, sides, modifier: 0 };
    }
    // Try matching if "NUMBERdNUMBER" like "2d6"
     const numberDMatch = notation.match(/^(\d+)\s*[dD]\s*(\d+)$/);
     if (numberDMatch) {
        const count = parseInt(numberDMatch[1]);
        const sides = parseInt(numberDMatch[2]);
        if (isNaN(count) || count <= 0) {
            return { count: 0, sides: 0, modifier: 0, error: "Invalid dice count." };
        }
        if (isNaN(sides) || sides <= 0) {
            return { count: 0, sides: 0, modifier: 0, error: "Invalid die sides." };
        }
        return { count, sides, modifier: 0 };
     }

    return { count: 0, sides: 0, modifier: 0, error: "Invalid dice notation format. Use XdY+Z, dY, or XdY." };
  }

  const count = match[1] ? parseInt(match[1]) : 1;
  const sides = parseInt(match[2]);
  const operator = match[3];
  const modValue = match[4] ? parseInt(match[4]) : 0;
  const modifier = operator === '-' ? -modValue : modValue;

  if (isNaN(count) || count <= 0) {
    return { count: 0, sides: 0, modifier: 0, error: "Invalid dice count." };
  }
  if (isNaN(sides) || sides <= 0) {
    return { count: 0, sides: 0, modifier: 0, error: "Invalid die sides." };
  }
  if (isNaN(modifier) && match[3]) { // only error if modifier part was present but invalid
    return { count: 0, sides: 0, modifier: 0, error: "Invalid modifier value." };
  }
  
  return { count, sides, modifier };
}

/**
 * Rolls a single die with the specified number of sides.
 */
export function rollDie(sides: number): number {
  if (sides <= 0) return 1; // Should not happen with validation
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Rolls multiple dice and calculates their sum.
 */
export function rollMultipleDice(count: number, sides: number): { rolls: number[], sum: number } {
  if (count <= 0 || sides <= 0) return { rolls: [], sum: 0 };
  const rolls: number[] = [];
  let sum = 0;
  for (let i = 0; i < count; i++) {
    const roll = rollDie(sides);
    rolls.push(roll);
    sum += roll;
  }
  return { rolls, sum };
}