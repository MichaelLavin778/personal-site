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

    // Alolan Forms
    if (name.includes('-alola')) {
        const base = toTitleCase(name.replace('alola', '').replaceAll('-', ' ').trim());
        return `Alolan ${base}`;
    }

    // Galarian Forms
    if (name.includes('-galar')) {
        const base = toTitleCase(name.replace('galar', '').replaceAll('-', ' ').trim());
        return `Galarian ${base}`;
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

    // Ash
    if (name.includes('-ash')) {
        const base = toTitleCase(name.replace('ash', '').replaceAll('-', ' ').trim());
        return `Ash's ${base}`;
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
        case 'wo-chien':
            return 'Wo-Chien';
        case 'chien-pao':
            return 'Chien-Pao';
        case 'ting-lu':
            return 'Ting-Lu';
        case 'chi-yu':
            return 'Chi-Yu';
        case 'deoxys-attack':
            return 'Deoxys (Attack Forme)';
        case 'deoxys-defense':
            return 'Deoxys (Defense Forme)';
        case 'deoxys-speed':
            return 'Deoxys (Speed Forme)';
        case 'dudunsparce-two-segment':
            return 'Dudunsparce (Two-Segment)';
        case 'dudunsparce-three-segment':
            return 'Dudunsparce (Three-Segment)';
        case 'zygarde-10-power-construct':
            return 'Zygarde (10% Forme)';
        case 'zygarde-50-power-construct':
            return 'Zygarde (50% Forme)';
        case 'zygarde-complete-power-construct':
            return 'Zygarde (Complete Forme)';
        case 'zygarde-10':
            return 'Zygarde (10% Forme)';
        case 'zygarde-50':
            return 'Zygarde (50% Forme)';
        case 'zygarde-complete':
            return 'Zygarde (Complete Forme)';
        default:
            return toTitleCase(name.replaceAll('-', ' '));
    }
}

export default getPokemonLabel;
