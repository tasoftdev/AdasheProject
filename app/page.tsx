
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* Header */}
      <header className="w-full border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Adashe" width={40} height={40} />
            <span className="font-bold text-lg">Adashe</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-700">
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#pricing" className="hover:text-slate-900">Pricing</a>
            <a href="#docs" className="hover:text-slate-900">Docs</a>
            <Link href="/auth/signin" className="ml-4 px-4 py-2 rounded-md border border-slate-200 hover:bg-slate-50">Sign in</Link>
            <Link href="/auth/signup" className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Sign up</Link>
          </nav>

          <div className="md:hidden">
            <Link href="/auth/signin" className="px-3 py-2 text-sm">Sign in</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-slate-900">Cooperative finance made simple</h1>
            <p className="mt-4 text-slate-700 text-lg">Manage contributions, run automated payouts, and keep members engaged — all from one dashboard built for cooperatives.</p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/auth/signup" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">Get started</Link>
              <a href="#features" className="inline-flex items-center justify-center px-6 py-3 border rounded-md text-sm text-slate-700 hover:bg-slate-50">Learn more</a>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-md">
                <h4 className="text-sm font-semibold">Trusted by co-ops</h4>
                <p className="text-xs text-slate-600">Built for the needs of community finance.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-md">
                <h4 className="text-sm font-semibold">Secure by design</h4>
                <p className="text-xs text-slate-600">Permissions, roles and audit logs included.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
              <div className="w-full max-w-md bg-gradient-to-tr from-blue-50 to-white rounded-2xl p-6 shadow-md">
              <Image src="/logo.png" alt="Illustration" width={420} height={280} className="mx-auto" />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <h3 className="text-2xl font-bold text-slate-900 text-center">Features</h3>
            <p className="text-center text-slate-600 mt-2">Everything your cooperative needs to run smoothly.</p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard title="Contributions" desc="Flexible schedules, tracking and member statements." icon="/logo.png" />
              <FeatureCard title="Payouts" desc="Automated, rule-based payouts with templates." icon="/logo.png" />
              <FeatureCard title="Profiles" desc="Member profiles, KYC and contact management." icon="/logo.png" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-600">© {new Date().getFullYear()} Adashe — Built for cooperatives</div>
          <div className="flex items-center gap-4">
            <a href="#docs" className="text-sm text-slate-600 hover:text-slate-900">Docs</a>
            <a href="#privacy" className="text-sm text-slate-600 hover:text-slate-900">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title, desc, icon }: { title: string; desc: string; icon: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col gap-3">
      <div className="w-12 h-12 bg-blue-50 rounded-md flex items-center justify-center">
        <Image src={icon} alt="" width={20} height={20} />
      </div>
      <h4 className="font-semibold text-slate-900">{title}</h4>
      <p className="text-sm text-slate-600">{desc}</p>
    </div>
  )
}
