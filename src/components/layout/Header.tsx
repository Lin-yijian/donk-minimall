import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export default async function Header() {
  const session = await auth();

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-blue-600">
            MiniMall
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/products" className="text-gray-600 hover:text-blue-600 transition-colors">
              全部商品
            </Link>
            <Link href="/cart" className="text-gray-600 hover:text-blue-600 transition-colors">
              购物车
            </Link>
            <Link href="/orders" className="text-gray-600 hover:text-blue-600 transition-colors">
              我的订单
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {session?.user ? (
            <>
              <span className="text-gray-600">
                {session.user.name || session.user.email}
              </span>
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  后台管理
                </Link>
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="text-gray-400 hover:text-gray-600 transition-colors">
                  退出
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                登录
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
