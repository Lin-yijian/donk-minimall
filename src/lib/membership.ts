export const MEMBERSHIP_TIERS = {
  REGULAR: { name: "普通会员", minSpent: 0, discount: 1.0, icon: "" },
  STAR_1: { name: "星悦一级", minSpent: 800, discount: 0.98, icon: "⭐" },
  STAR_2: { name: "星悦二级", minSpent: 8000, discount: 0.9, icon: "⭐⭐" },
  STAR_3: { name: "星悦三级", minSpent: 80000, discount: 0.88, icon: "⭐⭐⭐" },
} as const;

export type MembershipTier = keyof typeof MEMBERSHIP_TIERS;

/** 根据累计消费金额计算会员等级 */
export function calculateTier(totalSpent: number): MembershipTier {
  if (totalSpent >= 80000) return "STAR_3";
  if (totalSpent >= 8000) return "STAR_2";
  if (totalSpent >= 800) return "STAR_1";
  return "REGULAR";
}

/** 获取下一级所需差额，返回 null 表示已是最高等级 */
export function getNextTierInfo(totalSpent: number) {
  const tiers = Object.entries(MEMBERSHIP_TIERS) as [MembershipTier, (typeof MEMBERSHIP_TIERS)[MembershipTier]][];
  for (const [key, tier] of tiers) {
    if (tier.minSpent > totalSpent) {
      return { nextTier: key, nextTierName: tier.name, needSpent: tier.minSpent - totalSpent };
    }
  }
  return null; // 已是最高等级
}

/** 获取当前等级信息 */
export function getCurrentTier(tier: MembershipTier) {
  return MEMBERSHIP_TIERS[tier];
}
