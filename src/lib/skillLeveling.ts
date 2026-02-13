// Skill keyword detection for passive leveling
export const SKILL_KEYWORDS: Record<string, string[]> = {
  // Physical
  brawling: ['punch', 'fist', 'brawl', 'unarmed', 'kick', 'headbutt', 'grapple'],
  one_handed: ['sword', 'dagger', 'blade', 'slash', 'stab', 'rapier'],
  two_handed: ['greatsword', 'axe', 'hammer', 'mace', 'cleave', 'swing'],
  acrobatics: ['dodge', 'flip', 'jump', 'evade', 'roll', 'tumble', 'leap'],
  climbing: ['climb', 'scale', 'ascend', 'clamber'],
  stealth: ['sneak', 'hide', 'invisible', 'stealth', 'lurk', 'shadow'],
  sleight_of_hand: ['pickpocket', 'steal', 'pilfer', 'disarm trap', 'lockpick'],
  aim: ['shoot', 'arrow', 'bow', 'crossbow', 'aim', 'fire'],
  
  // Magical
  bloodmancy: ['blood magic', 'bloodmancy', 'life drain', 'blood spell'],
  necromancy: ['raise dead', 'necromancy', 'undead', 'skeleton', 'zombie'],
  soulbinding: ['soul bind', 'spirit', 'soulbinding', 'bind soul'],
  destruction: ['fireball', 'lightning', 'explosion', 'destruction', 'burn', 'zap'],
  alteration: ['transform', 'alter', 'change', 'transmute', 'morph'],
  illusion: ['illusion', 'decoy', 'mirage', 'disguise', 'phantom'],
  regeneration: ['heal', 'restore', 'regenerate', 'cure', 'mend'],
  
  // Social
  persuasion: ['persuade', 'convince', 'reason', 'negotiate', 'plead'],
  intimidation: ['threaten', 'intimidate', 'scare', 'menace', 'terrify'],
  seduction: ['seduce', 'charm', 'flirt', 'entice', 'allure'],
  investigation: ['investigate', 'search', 'examine', 'inspect', 'study'],
  bartering: ['barter', 'haggle', 'negotiate price', 'trade', 'deal'],
  beastmastery: ['tame', 'command animal', 'beast', 'creature control'],
};

export function detectSkillUsage(action: string): string[] {
  const lowerAction = action.toLowerCase();
  const usedSkills: string[] = [];
  
  for (const [skill, keywords] of Object.entries(SKILL_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerAction.includes(keyword)) {
        usedSkills.push(skill);
        break; // Only count each skill once per action
      }
    }
  }
  
  return usedSkills;
}

export function calculateSkillXP(): number {
  // Random XP gain between 1-3
  return Math.floor(Math.random() * 3) + 1;
}
