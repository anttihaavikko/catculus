export interface Skill {
    name: SkillId;
    icon: string;
    description: string;
    repeatable?: boolean;
}

export type SkillId = 'catnip' | 'catnap' | 'sprayer' | 'reflexes' | 'nine' | 'allergies' | 'hiss';

// ◈ ◉ ▶ ▷ ☊ ★ ☗ ☬ ☸ ♆ ◑ ⚉ ⚇ ⚓ ⚑ ⚐ ⚕ ⚔ ⚙ ⚚ ⚡ ⚠ ⛬ ⛶ ✐ ⧮ ⧯ ⧳ ⧲ ⧱ ⧰ ⨯ ⩎ ⩏ ⫘ ꔮ ꔀ

export const skills: Skill[] = [
    { name: 'catnip', icon: '⧰', description: 'Cats |always jump| to\nthe |highest value| tile' },
    { name: 'catnap', icon: '◑', description: '|3x| score for |sleeping| cats,\n|no bonus| for |awake| cats' },
    { name: 'sprayer', icon: '⛬', description: '|Awake| cats |reveal| the |tile\n |value| when selected' },
    { name: 'reflexes', icon: 'ꔮ', description: 'Any |mistake| equal to\nyour |total life| is |ignored' },
    { name: 'nine', icon: '⅏', description: 'Regain a |life| for each |used 9|\n in the |calculation', repeatable: true },
    { name: 'allergies', icon: '⍨', description: '|Double score| for |catless| tiles\n|no score| for tiles with |cats|' },
    { name: 'hiss', icon: '⑆', description: 'All |2 value| tiles increase\n|multiplier| by |one', repeatable: true },
];