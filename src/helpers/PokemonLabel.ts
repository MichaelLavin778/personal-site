import { toTitleCase } from "./text";


const getPokemonLabel = (name: string) => {
    // Megas
    if (name.includes('-mega')) {
        const base = toTitleCase(name.replace('mega', '').replaceAll('-', ' ').trim());
        return `Mega ${base}`;
    }

    // G-Maxes
    if (name.includes('-gmax')) {
        const base = toTitleCase(name.replace('gmax', '').replaceAll('-', ' ').trim());
        return `G-Max ${base}`;
    }

    // Galarian Forms
    if (name.includes('-galar')) {
        const base = toTitleCase(name.replace('galar', '').replaceAll('-', ' ').trim());
        return `Galarian ${base}`;
    }

    // Hisuian Forms
    if (name.includes('-hisui')) {
        const base = toTitleCase(name.replace('hisui', '').replaceAll('-', ' ').trim());
        return `Hisuian ${base}`;
    }

    // Totems
    if (name.includes('-totem') && !name.startsWith('kommo')) {
        const base = toTitleCase(name.replace('totem', '').replaceAll('-', ' ').trim());
        return `Totem ${base}`;
    }

    // Special Cases
    switch (name) {
        case 'mr-mime':
            return'Mr. Mime';
        case 'mr-rime':
            return'Mr. Rime';
        case 'type-null':
            return'Type: Null';  
        case 'jangmo-o':
            return'Jangmo-o';
        case 'hakamo-o':
            return'Hakamo-o';
        case 'kommo-o':
            return'Kommo-o';
        case 'kommo-o-totem':
            return'Totem Kommo-o';
        case 'nidoran-f':
            return'Nidoran♀';
        case 'nidoran-m':
            return'Nidoran♂';
        case 'farfetchd':
            return"Farfetch'd";
        case 'sirfetchd':
            return"Sirfetch'd";
        case 'mime-jr':
            return'Mime Jr.';
        case 'flabebe':
            return'Flabébé';
        case 'tapu-koko':
            return'Tapu Koko';
        case 'tapu-lele':
            return'Tapu Lele';
        case 'tapu-bulu':
            return'Tapu Bulu';
        case 'tapu-fini':
            return'Tapu Fini';
        case 'ho-oh':
            return'Ho-Oh';
        case 'porygon-z':
            return'Porygon-Z';
        case 'dudunsparce-two-segment':
            return'Dudunsparce (Two-Segment)';
        case 'dudunsparce-three-segment':
            return
        default:
            return toTitleCase(name.replaceAll('-', ' '));
    }
}

export default getPokemonLabel;
