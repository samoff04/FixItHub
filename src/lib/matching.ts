type SkillRef = { skillId: string };
type MatchableUser = { skills: SkillRef[]; roles: string[]; goals: string[] };

export function computeMatchScore(me: MatchableUser, candidate: MatchableUser) {
  const mySkillIds = new Set(me.skills.map((s) => s.skillId));
  const theirSkillIds = new Set(candidate.skills.map((s) => s.skillId));

  const sharedSkills = [...theirSkillIds].filter((id) => mySkillIds.has(id)).length;
  const complementarySkills = [...theirSkillIds].filter((id) => !mySkillIds.has(id)).length;
  const complementaryRoles = candidate.roles.filter((r) => !me.roles.includes(r)).length;
  const sharedGoals = candidate.goals.filter((g) => me.goals.includes(g)).length;

  return sharedSkills * 5 + complementarySkills * 3 + complementaryRoles * 4 + sharedGoals * 6;
}