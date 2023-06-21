export interface SuggestedAccompanimentTypeForMainSpec {
  suggestedAccompanimentTypeEntityId: string,
  count: number,
}
export interface DishEntityFromServer {
  id: string;
  name: string;
  type: string;
  minimumInterval: number;
  last: string | null;
  suggestedAccompanimentTypeSpecs: SuggestedAccompanimentTypeForMainSpec[],
  prepEffort: number;
  prepTime: number;
  cleanupEffort: number;
}

export interface DishEntity {
  id: string;
  name: string;
  type: string;                                     // 'main' or AccompanimentTypeEntity.id
  minimumInterval: number;
  last: Date | null;
  suggestedAccompanimentTypeSpecs: SuggestedAccompanimentTypeForMainSpec[],
  prepEffort: number;
  prepTime: number;
  cleanupEffort: number;
}

