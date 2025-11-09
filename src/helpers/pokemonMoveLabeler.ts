import { toTitleCase } from "./text";


const moveIdToLabel = (name: string) => {
    let nameLabel = "";

    switch (name) {
        case 'double-edge':
            nameLabel = "Double-Edge"
            break;
        case 'self-destruct':
            nameLabel = "Self-Destruct"
            break;
        case 'soft-boiled':
            nameLabel = "Soft-Boiled"
            break;
        case 'lock-on':
            nameLabel = "Lock-On"
            break;
        case 'mud-slap':
            nameLabel = "Mud-Slap"
            break;
        case 'will-o-wisp':
            nameLabel = "Will-O-Wisp"
            break;
        case 'u-turn':
            nameLabel = "U-Turn"
            break;
        case 'wake-up-slap':
            nameLabel = "Wake-Up Slap"
            break;
        case 'x-scissor':
            nameLabel = "X-Scissor"
            break;
        case 'v-create':
            nameLabel = "V-create"
            break;
        case 'baby-doll-eyes':
            nameLabel = "Baby-Doll Eyes"
            break;
        case 'freeze-dry':
            nameLabel = "Freeze-Dry"
            break;
        case 'power-up-punch':
            nameLabel = "Power-Up Punch"
            break;
        case 'topsy-turvy':
            nameLabel = "Topsy-Turvy"
            break;
        case 'trick-or-treat':
            nameLabel = "Trick-or-Treat"
            break;
        case 'all-out-pummeling':
            nameLabel = "All-Out Pummeling"
            break;
        case 'multi-attack':
            nameLabel = "Multi-Attack"
            break;
        case 'never-ending-nightmare':
            nameLabel = "Never-Ending Nightmare"
            break;
        case 'savage-spin-out':
            nameLabel = "Savage Spin-Out"
            break;
        case 'soul-stealing-7-star-strike':
            nameLabel = "Soul-Stealing 7-Star Strike"
            break;
        default:
            nameLabel = toTitleCase(name.replaceAll('-', ' ').replaceAll('G Max', 'G-Max'))
    }

    return nameLabel;
}

export default moveIdToLabel;
