export interface Skill {
    name: string;
    description: string;
    repeatable?: boolean;
}

export const skills: Skill[] = [
    { name: 'catnip', description: 'Cats always jump to the highest value tile' },
    { name: 'catnap', description: 'Triple score for sleeping cats, no bonus for awake cats' },
    { name: 'sprayer', description: 'Awake cats reveal the tile value when selected' },
    { name: 'reflexes', description: 'Any mistake equal to your total life is ignored' },
];