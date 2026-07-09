import { describe, it, expect } from "vitest";
import { formatPrice, calcDiscountedPrice } from "@/lib/utils";
import { MEMBERSHIP_TIERS, calculateTier } from "@/lib/membership";

describe("购物车逻辑", () => {
  describe("购物车总价计算", () => {
    const calcCartTotal = (items: { price: number; quantity: number }[]) => {
      return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    it("空购物车总价为0", () => {
      expect(calcCartTotal([])).toBe(0);
    });

    it("单个商品计算正确", () => {
      expect(calcCartTotal([{ price: 100, quantity: 2 }])).toBe(200);
    });

    it("多个商品计算正确", () => {
      expect(
        calcCartTotal([
          { price: 299, quantity: 1 },
          { price: 459, quantity: 2 },
          { price: 89, quantity: 3 },
        ])
      ).toBe(1484);
    });
  });

  describe("购物车数量合并", () => {
    const mergeCartItem = (
      existing: { quantity: number; productPrice: number },
      incoming: { quantity: number; productPrice: number }
    ) => {
      return {
        quantity: existing.quantity + incoming.quantity,
        productPrice: incoming.productPrice,
      };
    };

    it("相同商品加入购物车时数量叠加", () => {
      const result = mergeCartItem(
        { quantity: 2, productPrice: 299 },
        { quantity: 1, productPrice: 299 }
      );
      expect(result.quantity).toBe(3);
      expect(result.productPrice).toBe(299);
    });

    it("价格以最新加入的为准", () => {
      const result = mergeCartItem(
        { quantity: 1, productPrice: 299 },
        { quantity: 1, productPrice: 279 }
      );
      expect(result.productPrice).toBe(279);
    });
  });

  describe("会员折扣计算", () => {
    it("普通会员购物车无折扣", () => {
      const subtotal = 500;
      const discount = MEMBERSHIP_TIERS.REGULAR.discount;
      const total = calcDiscountedPrice(subtotal, discount);
      expect(total).toBe(500);
    });

    it("星悦三级 8.8 折购物车总价", () => {
      const subtotal = 1000;
      const discount = MEMBERSHIP_TIERS.STAR_3.discount;
      const total = calcDiscountedPrice(subtotal, discount);
      expect(total).toBe(880);
    });
  });
});
