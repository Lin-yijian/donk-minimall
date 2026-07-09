import { describe, it, expect } from "vitest";
import { calculateTier, getNextTierInfo, getCurrentTier, MEMBERSHIP_TIERS } from "@/lib/membership";

describe("星悦会员等级体系", () => {
  describe("calculateTier", () => {
    it("累计消费 0 元返回普通会员", () => {
      expect(calculateTier(0)).toBe("REGULAR");
    });

    it("累计消费 799 元仍为普通会员", () => {
      expect(calculateTier(799)).toBe("REGULAR");
    });

    it("累计消费 800 元升为星悦一级", () => {
      expect(calculateTier(800)).toBe("STAR_1");
    });

    it("累计消费 7999 元仍为星悦一级", () => {
      expect(calculateTier(7999)).toBe("STAR_1");
    });

    it("累计消费 8000 元升为星悦二级", () => {
      expect(calculateTier(8000)).toBe("STAR_2");
    });

    it("累计消费 79999 元仍为星悦二级", () => {
      expect(calculateTier(79999)).toBe("STAR_2");
    });

    it("累计消费 80000 元升为星悦三级", () => {
      expect(calculateTier(80000)).toBe("STAR_3");
    });

    it("累计消费 100000 元保持星悦三级", () => {
      expect(calculateTier(100000)).toBe("STAR_3");
    });
  });

  describe("折扣率", () => {
    it("普通会员无折扣", () => {
      expect(MEMBERSHIP_TIERS.REGULAR.discount).toBe(1.0);
    });

    it("星悦一级 9.8 折", () => {
      expect(MEMBERSHIP_TIERS.STAR_1.discount).toBe(0.98);
    });

    it("星悦二级 9 折", () => {
      expect(MEMBERSHIP_TIERS.STAR_2.discount).toBe(0.9);
    });

    it("星悦三级 8.8 折", () => {
      expect(MEMBERSHIP_TIERS.STAR_3.discount).toBe(0.88);
    });
  });

  describe("getNextTierInfo", () => {
    it("普通会员提示还需 ¥800 到星悦一级", () => {
      const info = getNextTierInfo(0);
      expect(info).not.toBeNull();
      expect(info!.nextTier).toBe("STAR_1");
      expect(info!.needSpent).toBe(800);
    });

    it("星悦三级返回 null（已是最高等级）", () => {
      expect(getNextTierInfo(80000)).toBeNull();
    });

    it("消费 400 元还需 400 元到星悦一级", () => {
      const info = getNextTierInfo(400);
      expect(info!.needSpent).toBe(400);
    });
  });

  describe("getCurrentTier", () => {
    it("返回当前等级的名称和折扣", () => {
      const tier = getCurrentTier("STAR_2");
      expect(tier.name).toBe("星悦二级");
      expect(tier.discount).toBe(0.9);
    });
  });
});
