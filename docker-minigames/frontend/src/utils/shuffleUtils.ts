/**
 * Utility functions for shuffling quiz options while maintaining original indices
 */

export interface ShuffledOption {
  originalIndex: number;
  shuffledIndex: number;
  text: string;
}

export interface ShuffleMapping {
  shuffledOptions: ShuffledOption[];
  originalToShuffled: Map<number, number>;
  shuffledToOriginal: Map<number, number>;
}

/**
 * Creates a deterministic shuffle based on question ID to ensure consistency
 * @param options - Original options array
 * @param questionId - Question ID for seeding
 * @returns Shuffle mapping with all necessary transformations
 */
export function createShuffleMapping(
  options: string[],
  questionId: string
): ShuffleMapping {
  // Create a simple hash from questionId for consistent shuffling
  const seed = hashString(questionId);
  const shuffledIndices = shuffleArray([...Array(options.length).keys()], seed);

  const shuffledOptions: ShuffledOption[] = shuffledIndices.map(
    (originalIndex, shuffledIndex) => ({
      originalIndex,
      shuffledIndex,
      text: options[originalIndex],
    })
  );

  const originalToShuffled = new Map<number, number>();
  const shuffledToOriginal = new Map<number, number>();

  shuffledOptions.forEach((option) => {
    originalToShuffled.set(option.originalIndex, option.shuffledIndex);
    shuffledToOriginal.set(option.shuffledIndex, option.originalIndex);
  });

  return {
    shuffledOptions,
    originalToShuffled,
    shuffledToOriginal,
  };
}

/**
 * Simple string hash function for consistent seeding
 */
function hashString(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash);
}

/**
 * Fisher-Yates shuffle with deterministic seeding
 */
function shuffleArray<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let currentIndex = shuffled.length;

  // Simple LCG (Linear Congruential Generator) for deterministic randomness
  let randomState = seed;
  const random = () => {
    randomState = (randomState * 1664525 + 1013904223) % 4294967296;
    return randomState / 4294967296;
  };

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(random() * currentIndex);
    currentIndex--;

    [shuffled[currentIndex], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[currentIndex],
    ];
  }

  return shuffled;
}

/**
 * Maps a shuffled selection back to original index
 */
export function mapShuffledToOriginal(
  shuffledIndex: number,
  mapping: ShuffleMapping
): number {
  const originalIndex = mapping.shuffledToOriginal.get(shuffledIndex);
  if (originalIndex === undefined) {
    throw new Error(`Invalid shuffled index: ${shuffledIndex}`);
  }
  return originalIndex;
}

/**
 * Maps an original index to shuffled display position
 */
export function mapOriginalToShuffled(
  originalIndex: number,
  mapping: ShuffleMapping
): number {
  const shuffledIndex = mapping.originalToShuffled.get(originalIndex);
  if (shuffledIndex === undefined) {
    throw new Error(`Invalid original index: ${originalIndex}`);
  }
  return shuffledIndex;
}
