/** 格式化价格 */
export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`;
}

/** 计算折扣后的价格 */
export function calcDiscountedPrice(price: number, discount: number): number {
  return Math.round(price * discount * 100) / 100;
}

/** 模拟支付 */
export function mockPay(): { success: boolean; transactionId: string } {
  return {
    success: true,
    transactionId: `MOCK_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
  };
}
