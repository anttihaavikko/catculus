export interface Skill {
    name: SkillId;
    description: string;
    repeatable?: boolean;
}

export type SkillId = 'catnip' | 'catnap' | 'sprayer' | 'reflexes' | 'nine';

export const skills: Skill[] = [
    { name: 'catnip', description: 'Cats |always jump| to\nthe |highest value| tile' },
    { name: 'catnap', description: '|3x| score for |sleeping| cats,\n|no bonus| for |awake| cats' },
    { name: 'sprayer', description: '|Awake| cats |reveal| the |tile\n |value| when selected' },
    { name: 'reflexes', description: 'Any |mistake| equal to\nyour |total life| is ignored' },
    { name: 'nine', description: 'Regain a |life| for each |used 9|\n in the |calculation', repeatable: true },
];