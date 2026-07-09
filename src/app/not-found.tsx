import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p className="text-6xl mb-4">🔍</p>
      <h1 className="text-2xl font-bold mb-2">页面未找到</h1>
      <p className="text-gray-400 mb-6">该页面不存在或已被移除</p>
      <Link
        href="/"
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        返回首页
      </Link>
    </div>
  );
}
