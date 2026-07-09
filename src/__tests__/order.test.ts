import { describe, it, expect } from "vitest";
import { mockPay } from "@/lib/utils";
import { MEMBERSHIP_TIERS, calculateTier } from "@/lib/membership";

describe("订单逻辑", () => {
  describe("订单总价计算", () => {
    const calcOrderTotal = (items: { price: number; quantity: number }[], discountRate: number) => {
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const discount = Math.round(subtotal * (1 - discountRate) * 100) / 100;
      const total = Math.round((subtotal - discount) * 100) / 100;
      return { subtotal, discount, total };
    };

    it("无折扣时 subtotal = total", () => {
      const result = calcOrderTotal(
        [{ price: 299, quantity: 1 }],
        MEMBERSHIP_TIERS.REGULAR.discount
      );
      expect(result.subtotal).toBe(299);
      expect(result.discount).toBe(0);
      expect(result.total).toBe(299);
    });

    it("星悦一级 9.8 折", () => {
      const result = calcOrderTotal(
        [{ price: 1000, quantity: 1 }],
        MEMBERSHIP_TIERS.STAR_1.discount
      );
      expect(result.subtotal).toBe(1000);
      expect(result.discount).toBe(20);
      expect(result.total).toBe(980);
    });

    it("星悦二级 9 折", () => {
      const result = calcOrderTotal(
        [{ price: 500, quantity: 2 }],
        MEMBERSHIP_TIERS.STAR_2.discount
      );
      expect(result.subtotal).toBe(1000);
      expect(result.discount).toBe(100);
      expect(result.total).toBe(900);
    });

    it("多件商品折扣计算", () => {
      const result = calcOrderTotal(
        [
          { price: 299, quantity: 2 },
          { price: 459, quantity: 1 },
        ],
        MEMBERSHIP_TIERS.STAR_2.discount
      );
      expect(result.subtotal).toBe(1057);
      expect(result.total).toBeLessThan(result.subtotal);
    });
  });

  describe("模拟支付", () => {
    it("模拟支付返回成功", () => {
      const result = mockPay();
      expect(result.success).toBe(true);
      expect(result.transactionId).toMatch(/^MOCK_/);
    });

    it("每次生成不同交易号", () => {
      const r1 = mockPay();
      const r2 = mockPay();
      expect(r1.transactionId).not.toBe(r2.transactionId);
    });
  });

  describe("会员累计升级", () => {
    it("累计 0 元为普通会员", () => {
      expect(calculateTier(0)).toBe("REGULAR");
    });

    it("消费 800 元升级星悦一级", () => {
      expect(calculateTier(800)).toBe("STAR_1");
    });

    it("消费 10000 元升级星悦二级", () => {
      expect(calculateTier(10000)).toBe("STAR_2");
    });

    it("只升不降 (消费 81000 后不会回退)", () => {
      expect(calculateTier(81000)).toBe("STAR_3");
    });
  });
});
