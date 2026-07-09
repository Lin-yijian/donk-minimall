import { describe, it, expect } from "vitest";
import { formatPrice, calcDiscountedPrice } from "@/lib/utils";
import { MEMBERSHIP_TIERS } from "@/lib/membership";

describe("商品工具函数", () => {
  describe("formatPrice", () => {
    it("格式化整数价格", () => {
      expect(formatPrice(100)).toBe("¥100.00");
    });

    it("格式化带小数价格", () => {
      expect(formatPrice(99.9)).toBe("¥99.90");
    });

    it("格式化零元", () => {
      expect(formatPrice(0)).toBe("¥0.00");
    });
  });

  describe("calcDiscountedPrice", () => {
    it("普通会员无折扣", () => {
      const price = calcDiscountedPrice(100, MEMBERSHIP_TIERS.REGULAR.discount);
      expect(price).toBe(100);
    });

    it("星悦一级 9.8 折", () => {
      const price = calcDiscountedPrice(100, MEMBERSHIP_TIERS.STAR_1.discount);
      expect(price).toBe(98);
    });

    it("星悦二级 9 折", () => {
      const price = calcDiscountedPrice(100, MEMBERSHIP_TIERS.STAR_2.discount);
      expect(price).toBe(90);
    });

    it("星悦三级 8.8 折", () => {
      const price = calcDiscountedPrice(100, MEMBERSHIP_TIERS.STAR_3.discount);
      expect(price).toBe(88);
    });

    it("折扣后价格四舍五入", () => {
      const price = calcDiscountedPrice(99.99, 0.88);
      expect(price).toBe(87.99);
    });
  });

  describe("slug 生成", () => {
    const generateSlug = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/[^\w一-鿿]+/g, "-")
        .replace(/^-|-$/g, "");
    };

    it("英文名转 slug", () => {
      expect(generateSlug("iPhone 15 Pro")).toBe("iphone-15-pro");
    });

    it("中文名转 slug", () => {
      expect(generateSlug("苹果手机")).toBe("苹果手机");
    });

    it("中英混合转 slug", () => {
      expect(generateSlug("iPhone 15 手机")).toBe("iphone-15-手机");
    });
  });
});
