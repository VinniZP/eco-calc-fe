export const FoodCalcConfig = {
  minBalancedDietMultiplier: 0.5,
  maxBalancedDietMultiplier: 1.5,
  minCaloriesToBeIncludedInVariertyBonus: 2000,

  varietyInputMin: 1, //At one food type, it outputs at output min (1, no bonus)
  varietyInputHalflife: 20, //After 20 types of food, we get halfway closer to the max value.
  varietyOutputAtMin: 1, //Minimum multiplier is 1
  varietyOutputLimit: 1.55,
  foodBaseValue: 4,
};
