import { type Page, expect } from '@playwright/test';

const API_ROOT = 'https://pokeapi.co/api/v2';
const ASSET_ROOT = 'https://assets.example.test';

type LearnMethod = 'level-up' | 'machine' | 'egg' | 'tutor';

type MoveFixture = {
    name: string;
    learnMethod: LearnMethod;
    level: number;
    type: string;
    damageClass: string;
    power: number | null;
};

const apiItem = (resource: string, name: string) => ({
    name,
    url: `${API_ROOT}/${resource}/${name}/`,
});

const moveFixtures: MoveFixture[] = [
    { name: 'tackle', learnMethod: 'level-up', level: 1, type: 'normal', damageClass: 'physical', power: 40 },
    { name: 'swords-dance', learnMethod: 'machine', level: 0, type: 'normal', damageClass: 'status', power: null },
    { name: 'curse', learnMethod: 'egg', level: 0, type: 'ghost', damageClass: 'status', power: null },
    { name: 'grass-pledge', learnMethod: 'tutor', level: 0, type: 'grass', damageClass: 'special', power: 80 },
    { name: 'growl', learnMethod: 'level-up', level: 3, type: 'normal', damageClass: 'status', power: null },
    { name: 'vine-whip', learnMethod: 'level-up', level: 6, type: 'grass', damageClass: 'physical', power: 45 },
    { name: 'poison-powder', learnMethod: 'level-up', level: 9, type: 'poison', damageClass: 'status', power: null },
    { name: 'sleep-powder', learnMethod: 'level-up', level: 12, type: 'grass', damageClass: 'status', power: null },
    { name: 'take-down', learnMethod: 'level-up', level: 15, type: 'normal', damageClass: 'physical', power: 90 },
    { name: 'razor-leaf', learnMethod: 'level-up', level: 18, type: 'grass', damageClass: 'physical', power: 55 },
    { name: 'sweet-scent', learnMethod: 'level-up', level: 21, type: 'normal', damageClass: 'status', power: null },
    { name: 'growth', learnMethod: 'level-up', level: 24, type: 'normal', damageClass: 'status', power: null },
    { name: 'double-edge', learnMethod: 'level-up', level: 27, type: 'normal', damageClass: 'physical', power: 120 },
    { name: 'worry-seed', learnMethod: 'level-up', level: 30, type: 'grass', damageClass: 'status', power: null },
    { name: 'synthesis', learnMethod: 'level-up', level: 33, type: 'grass', damageClass: 'status', power: null },
    { name: 'seed-bomb', learnMethod: 'level-up', level: 36, type: 'grass', damageClass: 'physical', power: 80 },
    { name: 'energy-ball', learnMethod: 'level-up', level: 39, type: 'grass', damageClass: 'special', power: 90 },
    { name: 'leech-seed', learnMethod: 'level-up', level: 42, type: 'grass', damageClass: 'status', power: null },
    { name: 'petal-dance', learnMethod: 'level-up', level: 45, type: 'grass', damageClass: 'special', power: 120 },
    { name: 'ingrain', learnMethod: 'level-up', level: 48, type: 'grass', damageClass: 'status', power: null },
];

const pokemonNames = [
    'bulbasaur',
    'ivysaur',
    'venusaur',
    'charmander',
    'arbok',
    'pikachu',
    'raichu',
];

const pokemonTypeNames = [
    'normal',
    'fire',
    'water',
    'electric',
    'grass',
    'ice',
    'fighting',
    'poison',
    'ground',
    'flying',
    'psychic',
    'bug',
    'rock',
    'ghost',
    'dragon',
    'dark',
    'steel',
    'fairy',
] as const;

const generationNames = [
    'generation-i',
    'generation-ii',
    'generation-iii',
    'generation-iv',
    'generation-v',
    'generation-vi',
    'generation-vii',
    'generation-viii',
    'generation-ix',
];

const typeEffectiveness: Record<string, { double?: string[]; half?: string[]; none?: string[] }> = {
    normal: { half: ['rock', 'steel'], none: ['ghost'] },
    fire: { double: ['grass', 'ice', 'bug', 'steel'], half: ['fire', 'water', 'rock', 'dragon'] },
    water: { double: ['fire', 'ground', 'rock'], half: ['water', 'grass', 'dragon'] },
    electric: { double: ['water', 'flying'], half: ['electric', 'grass', 'dragon'], none: ['ground'] },
    grass: { double: ['water', 'ground', 'rock'], half: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'] },
    ice: { double: ['grass', 'ground', 'flying', 'dragon'], half: ['fire', 'water', 'ice', 'steel'] },
    fighting: { double: ['normal', 'ice', 'rock', 'dark', 'steel'], half: ['poison', 'flying', 'psychic', 'bug', 'fairy'], none: ['ghost'] },
    poison: { double: ['grass', 'fairy'], half: ['poison', 'ground', 'rock', 'ghost'], none: ['steel'] },
    ground: { double: ['fire', 'electric', 'poison', 'rock', 'steel'], half: ['grass', 'bug'], none: ['flying'] },
    flying: { double: ['grass', 'fighting', 'bug'], half: ['electric', 'rock', 'steel'] },
    psychic: { double: ['fighting', 'poison'], half: ['psychic', 'steel'], none: ['dark'] },
    bug: { double: ['grass', 'psychic', 'dark'], half: ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'] },
    rock: { double: ['fire', 'ice', 'flying', 'bug'], half: ['fighting', 'ground', 'steel'] },
    ghost: { double: ['psychic', 'ghost'], half: ['dark'], none: ['normal'] },
    dragon: { double: ['dragon'], half: ['steel'], none: ['fairy'] },
    dark: { double: ['psychic', 'ghost'], half: ['fighting', 'dark', 'fairy'] },
    steel: { double: ['ice', 'rock', 'fairy'], half: ['fire', 'water', 'electric', 'steel'] },
    fairy: { double: ['fighting', 'dragon', 'dark'], half: ['fire', 'poison', 'steel'] },
};

const typeResources = (names: string[] = []) => names.map(name => apiItem('type', name));
const attackingTypesWith = (defendingType: string, relation: 'double' | 'half' | 'none') =>
    pokemonTypeNames.filter(name => typeEffectiveness[name][relation]?.includes(defendingType));
const makeType = (name: string) => ({
    name,
    damage_relations: {
        no_damage_to: typeResources(typeEffectiveness[name].none),
        half_damage_to: typeResources(typeEffectiveness[name].half),
        double_damage_to: typeResources(typeEffectiveness[name].double),
        no_damage_from: typeResources(attackingTypesWith(name, 'none')),
        half_damage_from: typeResources(attackingTypesWith(name, 'half')),
        double_damage_from: typeResources(attackingTypesWith(name, 'double')),
    },
    sprites: {
        'generation-ix': {
            'scarlet-violet': {
                name_icon: `${ASSET_ROOT}/types/${name}.png`,
                symbol_icon: `${ASSET_ROOT}/types/${name}-symbol.png`,
            },
        },
    },
});
const typesByName = new Map<string, ReturnType<typeof makeType>>(
    pokemonTypeNames.map(name => [name, makeType(name)])
);

const pokemonMoves = moveFixtures.map((move) => ({
    move: apiItem('move', move.name),
    version_group_details: [{
        level_learned_at: move.level,
        move_learn_method: apiItem('move-learn-method', move.learnMethod),
    }],
}));

const pokemonAbilities = (name: string) => {
    if (name === 'bulbasaur' || name === 'ivysaur' || name === 'venusaur') {
        return [
            { ability: apiItem('ability', 'overgrow'), is_hidden: false, slot: 1 },
            { ability: apiItem('ability', 'chlorophyll'), is_hidden: true, slot: 3 },
        ];
    }

    if (name === 'pikachu' || name === 'raichu') {
        return [
            { ability: apiItem('ability', 'static'), is_hidden: false, slot: 1 },
            { ability: apiItem('ability', 'lightning-rod'), is_hidden: true, slot: 3 },
        ];
    }

    return [{ ability: apiItem('ability', 'blaze'), is_hidden: false, slot: 1 }];
};

const getPokemonSprite = (name: string, variant: string) =>
    name === 'pikachu' ? `${ASSET_ROOT}/sprites/${name}-${variant}.png` : null;

const getPokemonTypes = (name: string) => {
    if (name === 'pikachu' || name === 'raichu') return ['electric'];
    if (name === 'charmander') return ['fire'];
    if (name === 'arbok') return ['poison'];
    return ['grass', 'poison'];
};

const makePokemonVariant = (name: string, index: number) => ({
    ...apiItem('pokemon', name),
    abilities: pokemonAbilities(name),
    base_experience: 64 + index,
    cries: {
        latest: `${ASSET_ROOT}/cries/${name}-latest.ogg`,
        legacy: `${ASSET_ROOT}/cries/${name}-legacy.ogg`,
    },
    height: 7 + index,
    id: index + 1,
    moves: name === 'bulbasaur' ? pokemonMoves : pokemonMoves.slice(0, 2),
    species: apiItem('pokemon-species', name),
    sprites: {
        back_default: getPokemonSprite(name, 'back-default'),
        back_female: getPokemonSprite(name, 'back-female'),
        back_shiny: getPokemonSprite(name, 'back-shiny'),
        back_shiny_female: getPokemonSprite(name, 'back-shiny-female'),
        front_default: getPokemonSprite(name, 'front-default'),
        front_female: getPokemonSprite(name, 'front-female'),
        front_shiny: getPokemonSprite(name, 'front-shiny'),
        front_shiny_female: getPokemonSprite(name, 'front-shiny-female'),
    },
    stats: [
        ['hp', 45],
        ['attack', 49],
        ['defense', 49],
        ['special-attack', 65],
        ['special-defense', 65],
        ['speed', 45],
    ].map(([stat, baseStat], statIndex) => ({
        base_stat: baseStat,
        effort: 0,
        stat: apiItem('stat', String(stat || statIndex)),
    })),
    types: getPokemonTypes(name).map((type, typeIndex) => ({ slot: typeIndex + 1, type: apiItem('type', type) })),
    weight: 69 + index,
});

const pokemonVariantsByName = new Map(
    pokemonNames.map((name, index) => [name, makePokemonVariant(name, index)])
);

const makePokemonSpecies = (name: string, index: number) => ({
    ...apiItem('pokemon-species', name),
    gender_rate: 4,
    id: index + 1,
    varieties: [{
        is_default: true,
        pokemon: apiItem('pokemon', name),
    }],
});

const pokemonSpeciesByName = new Map(
    pokemonNames.map((name, index) => [name, makePokemonSpecies(name, index)])
);

const makeMove = (move: MoveFixture, index: number) => ({
    accuracy: move.damageClass === 'status' ? null : 100,
    damage_class: apiItem('move-damage-class', move.damageClass),
    effect_entries: [{
        effect: `${move.name} has a fixture effect.`,
        language: apiItem('language', 'en'),
        short_effect: `${move.name} has a fixture short effect.`,
    }],
    flavor_text_entries: [{
        flavor_text: `${move.name} fixture flavor text.`,
        language: apiItem('language', 'en'),
        version_group: apiItem('version-group', 'fixture'),
    }],
    id: index + 1,
    learned_by_pokemon: [
        apiItem('pokemon', 'bulbasaur'),
        apiItem('pokemon', 'ivysaur'),
        apiItem('pokemon', 'ivysaur'),
        apiItem('pokemon', 'pikachu-rock-star'),
    ],
    name: move.name,
    power: move.power,
    pp: 20,
    priority: 0,
    type: apiItem('type', move.type),
});

const movesByName = new Map(
    moveFixtures.map((move, index) => [move.name, makeMove(move, index)])
);

const makeAbility = (name: string) => ({
    name,
    effect_entries: [{
        effect: `${name} has a fixture effect.`,
        language: { name: 'en' },
        short_effect: `${name} has a fixture short effect.`,
    }],
    flavor_text_entries: [{
        flavor_text: `${name} fixture flavor text.`,
        language: { name: 'en' },
    }],
    pokemon: [
        { pokemon: apiItem('pokemon', 'bulbasaur') },
        { pokemon: apiItem('pokemon', 'ivysaur') },
        { pokemon: apiItem('pokemon', 'ivysaur') },
        { pokemon: apiItem('pokemon', 'pikachu-rock-star') },
    ],
});

const getResourceName = (pathname: string, resource: string) => {
    const prefix = `/api/v2/${resource}/`;
    return pathname.startsWith(prefix)
        ? decodeURIComponent(pathname.slice(prefix.length).replace(/\/$/, ''))
        : null;
};

export const mockShowcaseApi = async (page: Page) => {
    await page.route(`${ASSET_ROOT}/**`, async (route) => {
        const contentType = route.request().url().endsWith('.png') ? 'image/png' : 'audio/ogg';
        await route.fulfill({ body: '', contentType, status: 200 });
    });

    await page.route(`${API_ROOT}/**`, async (route) => {
        const { pathname } = new URL(route.request().url());

        if (pathname === '/api/v2/pokemon-species') {
            await route.fulfill({
                json: { results: pokemonNames.map((name) => apiItem('pokemon-species', name)) },
            });
            return;
        }

        if (pathname === '/api/v2/generation') {
            await route.fulfill({
                json: {
                    results: generationNames.map((name, index) => ({
                        name,
                        url: `${API_ROOT}/generation/${index + 1}/`,
                    })),
                },
            });
            return;
        }

        const pokemonSpeciesName = getResourceName(pathname, 'pokemon-species');
        if (pokemonSpeciesName && pokemonSpeciesByName.has(pokemonSpeciesName)) {
            await route.fulfill({ json: pokemonSpeciesByName.get(pokemonSpeciesName)! });
            return;
        }

        const pokemonName = getResourceName(pathname, 'pokemon');
        if (pokemonName && pokemonVariantsByName.has(pokemonName)) {
            await route.fulfill({ json: pokemonVariantsByName.get(pokemonName)! });
            return;
        }

        const moveName = getResourceName(pathname, 'move');
        if (moveName && movesByName.has(moveName)) {
            await route.fulfill({ json: movesByName.get(moveName)! });
            return;
        }

        const abilityName = getResourceName(pathname, 'ability');
        if (abilityName) {
            await route.fulfill({ json: makeAbility(abilityName) });
            return;
        }

        const typeName = getResourceName(pathname, 'type');
        if (typeName && typesByName.has(typeName)) {
            await route.fulfill({ json: typesByName.get(typeName)! });
            return;
        }

        await route.fulfill({ json: {}, status: 404 });
    });
};

export const openMockedShowcase = async (
    page: Page,
    params: Record<string, string> = { pokemon: 'bulbasaur' }
) => {
    await mockShowcaseApi(page);

    const search = new URLSearchParams({ pokemon: 'bulbasaur', ...params });
    const pokemon = search.get('pokemon') ?? 'bulbasaur';

    await page.goto(`/showcase?${search.toString()}`);
    await expect(page).toHaveTitle(/Showcase - Pokemon/i);
    await expect(getPokemonSelector(page)).toHaveValue(
        new RegExp(pokemon.replaceAll('-', '[ -]'), 'i')
    );
    await expect(getGenerationSelector(page)).toHaveText('9');
    await expect(page.getByText('Abilities', { exact: true })).toBeVisible();
};

export const expectSearchParam = async (
    page: Page,
    name: string,
    value: string | null
) => {
    await expect.poll(() => new URL(page.url()).searchParams.get(name)).toBe(value);
};

export const getMovesGrid = (page: Page) => page.getByRole('grid');

export const getGenerationSelector = (page: Page) =>
    page.locator('#pokemon-generation-select');

export const getPokemonSelector = (page: Page) => page.locator('input[role="combobox"]');

export const waitForMoveRows = async (page: Page) => {
    await expect(
        getMovesGrid(page).getByLabel(/Open move info for/i).first()
    ).toBeVisible();
};
