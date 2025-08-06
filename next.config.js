/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ فعال‌سازی خروجی standalone برای اجرای مستقیم روی سرور یا Railway
  output: 'standalone',

  // ✅ فشرده‌سازی فقط در production
  compress: process.env.NODE_ENV === 'production',

  // ✅ تنظیمات تصویری ساده (میتونه حذف شه اگه مهم نیست فعلاً)
  images: {
    domains: ['localhost', 'blackbird-production.up.railway.app'],
  },

  // ✅ جلوگیری از نادیده‌گرفتن خطاهای build
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // ✅ فعال‌سازی SWC برای سرعت build
  swcMinify: true,

  // ❗ در حال حاضر ویژگی‌های experimental رو حذف می‌کنیم چون احتمال باگ دارن
  // اگه واقعا نیاز داشتن، بعداً با تست دوباره اضافه می‌کنیم
  // experimental: {
  //   instrumentationHook: false,
  //   serverComponentsExternalPackages: ['@opentelemetry/api'],
  // },

  // ❗ env فقط در Vercel لازم میشه – در حالت local یا Railway فایل `.env` بارگذاری میشه
  // اگر هم بخوای استفاده کنی، اینطوری باید باشه
  // env: {
  //   NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  //   NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  //   DATABASE_URL: process.env.DATABASE_URL,
  //   CSRF_SECRET: process.env.CSRF_SECRET,
  // },

  // ✅ نمونه‌ای از تنظیمات cache برای API – قابل حذف اگه نیاز نداری
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
