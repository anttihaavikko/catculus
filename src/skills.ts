export interface Skill {
    name: string;
    description: string;
    unique?: boolean;
}

export const skills = [
    { name: 'catnip', description: 'Cats always jump to the highest value tile', unique: true },
    { name: 'catnap', description: 'Triple score for sleeping cats, no bonus for awake cats', unique: true },
];