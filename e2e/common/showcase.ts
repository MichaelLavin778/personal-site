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

const makePokemon = (name: string, index: number) => ({
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
    sprites: {
        back_default: null,
        back_female: null,
        back_shiny: null,
        back_shiny_female: null,
        front_default: null,
        front_female: null,
        front_shiny: null,
        front_shiny_female: null,
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
    types: [{ slot: 1, type: apiItem('type', name === 'pikachu' || name === 'raichu' ? 'electric' : 'grass') }],
    weight: 69 + index,
});

const pokemonByName = new Map(
    pokemonNames.map((name, index) => [name, makePokemon(name, index)])
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
        await route.fulfill({ body: '', contentType: 'audio/ogg', status: 200 });
    });

    await page.route(`${API_ROOT}/**`, async (route) => {
        const { pathname } = new URL(route.request().url());

        if (pathname === '/api/v2/pokemon') {
            await route.fulfill({
                json: { results: pokemonNames.map((name) => apiItem('pokemon', name)) },
            });
            return;
        }

        if (pathname === '/api/v2/gender/1' || pathname === '/api/v2/gender/2') {
            await route.fulfill({
                json: {
                    pokemon_species_details: pokemonNames.map((name) => ({
                        pokemon_species: { name },
                    })),
                },
            });
            return;
        }

        const pokemonName = getResourceName(pathname, 'pokemon');
        if (pokemonName && pokemonByName.has(pokemonName)) {
            await route.fulfill({ json: pokemonByName.get(pokemonName)! });
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

export const getPokemonSelector = (page: Page) => page.locator('input[role="combobox"]');

export const waitForMoveRows = async (page: Page) => {
    await expect(
        getMovesGrid(page).getByLabel(/Open move info for/i).first()
    ).toBeVisible();
};
