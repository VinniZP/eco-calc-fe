import { computed, inject, signal } from '@angular/core';
import { RecipesStore } from '../../data/recipes';
import { Shop, ShopsStore } from '../../data/shops';
import { UserStore } from '../../data/user';

export function createRecipesDataSource() {
  const recipesStore = inject(RecipesStore);
  const userStore = inject(UserStore);
  const shopsStore = inject(ShopsStore);
  const entities = recipesStore.recipesByProduct;
  const pagination = signal({ page: 1, pageSize: 30 });
  const filter = signal<{
    search: string | null | undefined;
    table: string[] | null | undefined;
    profession: string[] | null | undefined;
    selling: boolean | null | undefined;
  }>({ search: '', table: [] as string[], profession: [] as string[], selling: false });

  const data = computed(() => {
    let shops: Shop[];
    if (userStore.name() !== '') {
      shops = shopsStore.filterByOwner(userStore.name());
    }
    const recipes = entities();
    const search = filter().search?.toLowerCase() ?? '';
    const table = filter().table;
    const profession = filter().profession;
    const sortedRecipes = recipes.sort((a, b) => {
      return a.product.localeCompare(b.product);
    });
    const filteredRecipes = sortedRecipes.filter((product) => {
      const searchMatch = product.product.toLowerCase().includes(search);
      const tableMatch = table?.length
        ? product.recipes.some((recipe) => table.includes(recipe.craftingTable))
        : true;
      const professionMatch = profession?.length
        ? product.recipes.some((recipe) =>
            recipe.skillNeeds.some((x) => profession.includes(x.name)),
          )
        : true;
      const isSelling =
        !filter().selling ||
        !shops.length ||
        shops.some((shop) =>
          shop.offers.some((offer) => offer.itemName === product.product && !offer.buying),
        );
      return searchMatch && tableMatch && professionMatch && isSelling;
    });

    return filteredRecipes;
  });

  const paginatedData = computed(() => {
    const recipes = data();
    const page = pagination().page;
    const pageSize = pagination().pageSize;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return recipes.slice(start, end);
  });

  const totalPages = computed(() => {
    return Math.ceil(data().length / pagination().pageSize);
  });

  return {
    entities,
    pagination,
    filter,
    data,
    paginatedData,
    totalPages,
    availableSelling: computed(() => {
      return shopsStore.filterByOwner(userStore.name()).length > 0;
    }),
  };
}
