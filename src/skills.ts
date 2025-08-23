export interface Skill {
    name: SkillId;
    icon: string;
    description: string;
    repeatable?: boolean;
}

export type SkillId = 'catnip' | 'catnap' | 'sprayer' | 'reflexes' | 'nine' | 'allergies' | 'hiss' |
    'meow' | 'purr' | 'copycat' | 'hairball' | 'litter' | 'kitten' | 'box' | 'loaf' | 'knead' | 'rescue' |
    'scratch' | 'beans' | 'zoomies' | 'yowling' | 'mouse';

// ◈ ◉ ▶ ▷ ☊ ★ ☗ ☬ ☸ ♆ ◑ ⚉ ⚇ ⚓ ⚑ ⚐ ⚕ ⚔ ⚙ ⚚ ⚡ ⚠ ⛬ ⛶ ✐ ⧮ ⧯ ⧳ ⧲ ⧱ ⧰ ⨯ ⩎ ⩏ ⫘ ꔮ ꔀ
// ⚷ ⚶ 𐆂 𖭅 🜟 🜠 🜛 🜤 🜭 🜲 🜶 🜷 🝖 🝮

export const skills: Skill[] = [
    { name: 'catnip', icon: '⚘', description: 'Cats |always jump| to\nthe |highest value| tile' },
    { name: 'box', icon: '⛶', description: 'Cats |always jump| to\nthe |lowest value| tile' },
    { name: 'catnap', icon: '◑', description: '|3x| score for |sleeping| cats,\n|no bonus| for |awake| cats' },
    { name: 'sprayer', icon: '⛬', description: '|Awake| cats |reveal| the |tile\n |value| when selected' },
    { name: 'reflexes', icon: 'ꔮ', description: 'Any |mistake| equal to\nyour |total life| is |ignored' },
    { name: 'nine', icon: '⅏', description: 'Regain a |life| for each |used 9|\n in the |calculation', repeatable: true },
    { name: 'allergies', icon: '⍨', description: '|2x score| for |catless| tiles,\n|no score| for tiles with |cats|' },
    { name: 'hiss', icon: '⑆', description: 'All picked |2 value| tiles \nincrease |multiplier| by |one', repeatable: true },
    { name: 'litter', icon: '☋', description: '|Increase| the |maximum\npossible |multiplier| by |one', repeatable: true },
    { name: 'zoomies', icon: '⧰', description: '|Increase| the |delay| of which\n|multiplier| drops by |20%', repeatable: true },
    { name: 'copycat', icon: '♅', description: 'Immediately |heal| back\nto full |9 lives', repeatable: true },
    { name: 'hairball', icon: '㉦', description: '|Cats| take |30%| longer\nto |move| on the |board', repeatable: true },
    { name: 'purr', icon: '𐄷', description: '|Imperfect sums| increase\nthe |max multiplier| too' },
    { name: 'mouse', icon: '𐡸', description: '|Closest cat| to a |picked\n|tile| jumps |on top| of it' },
    { name: 'scratch', icon: '⚸', description: 'All |unpicked tiles| around\npicked ones |lower| in |value|' },
];