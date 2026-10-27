import Link from 'next/link'


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900">
    
      <header className="w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <img 
                src="/images/logo.png" 
                alt="Adashe" 
                width={48} 
                height={48} 
                className="relative rounded-lg transform group-hover:scale-105 transition duration-300"
              />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Adashe
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
            <a href="#features" className="hover:text-blue-600 transition-colors duration-200 hover:scale-105 transform">Features</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors duration-200 hover:scale-105 transform">Pricing</a>
            <a href="#testimonials" className="hover:text-blue-600 transition-colors duration-200 hover:scale-105 transform">Testimonials</a>
            <Link 
              href="/auth/signin" 
              className="px-5 py-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 hover:shadow-md"
            >
              Sign in
            </Link>
            <Link 
              href="/auth/signup" 
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </nav>

          <div className="md:hidden">
            <Link 
              href="/auth/signin" 
              className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Cooperative finance
                </span>
                <br />
                <span className="text-slate-900">made simple & secure</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
                Manage contributions, run automated payouts, and keep members engaged — all from one beautiful dashboard built specifically for cooperatives.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/auth/signup" 
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1 shadow-lg"
              >
                Start Free Trial
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            </div>
          <div className="relative">
            <div className="relative z-10">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl blur-xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 shadow-2xl border border-white/20 backdrop-blur-sm">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-1 shadow-lg">
                  <div className="bg-white rounded-xl p-6">
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-lg min-h-[350px] flex items-center justify-center">
                      <div className="text-center">
                        <img 
                          src="/images/logo.png" 
                          alt="Adashe Logo" 
                          width={80} 
                          height={80} 
                          className="mx-auto mb-4"
                        />
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Dashboard Preview</h3>
                        <p className="text-slate-600">Complete cooperative management system</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-2xl rotate-12 shadow-lg flex items-center justify-center">
                  <span className="text-yellow-800 font-bold text-sm">💰</span>
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-400 rounded-2xl -rotate-12 shadow-lg flex items-center justify-center">
                  <span className="text-green-800 font-bold text-sm">📈</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                Everything your cooperative needs
              </h2>
              <p className="mt-4 text-xl text-slate-600">
                Powerful features designed specifically for cooperative financial management
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                title="Smart Contributions" 
                desc="Flexible schedules, automated tracking, and real-time member statements with smart reminders."
                icon="💳"
                color="blue"
              />
              <FeatureCard 
                title="Automated Payouts" 
                desc="Rule-based payouts with customizable templates and instant member notifications."
                icon="🚀"
                color="purple"
              />
              <FeatureCard 
                title="Member Profiles" 
                desc="Complete KYC, contact management, and engagement tracking in beautiful profiles."
                icon="👥"
                color="green"
              />
              <FeatureCard 
                title="Real-time Analytics" 
                desc="Interactive dashboards with insights on contributions, growth, and member activity."
                icon="📊"
                color="orange"
              />
              <FeatureCard 
                title="Secure Messaging" 
                desc="Built-in group chat and announcements to keep all members informed and engaged."
                icon="💬"
                color="indigo"
              />
              <FeatureCard 
                title="Mobile Ready" 
                desc="Fully responsive design that works perfectly on all devices and screen sizes."
                icon="📱"
                color="pink"
              />
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                Loved by cooperatives
              </h2>
              <p className="mt-4 text-xl text-slate-600">
                Join hundreds of cooperatives that trust Adashe with their financial management
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TestimonialCard 
                quote="Adashe transformed how our cooperative manages finances. Everything is so intuitive!"
                avatar="👩‍💼" author={''} role={''}              />
              <TestimonialCard 
                quote="The automated payouts saved us 10+ hours every month. Absolutely game-changing!"
                avatar="👨‍💻" author={''} role={''}               />
              <TestimonialCard 
                quote="Our members love the transparency and real-time updates. Highly recommended!"
                avatar="👩‍🌾" author={''} role={''}              />
            </div>
          </div>
        </section>
</main>

      <footer className="w-full bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <span className="font-bold text-white text-lg">Adashe</span>
              </Link>
              <p className="text-slate-400 max-w-md">
                Building the future of cooperative finance with secure, intuitive tools that empower communities.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#blog" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#careers" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm">© {new Date().getFullYear()} Adashe — Built for cooperatives with ❤️</div>
            <div className="flex items-center gap-6">
              <a href="#privacy" className="text-sm hover:text-white transition-colors">Privacy</a>
              <a href="#terms" className="text-sm hover:text-white transition-colors">Terms</a>
              <a href="#docs" className="text-sm hover:text-white transition-colors">Docs</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title, desc, icon, color }: { title: string; desc: string; icon: string; color: string }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    indigo: 'from-indigo-500 to-indigo-600',
    pink: 'from-pink-500 to-pink-600'
  }

  return (
    <div className="group bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
      <div className={`w-14 h-14 bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
  )
}

function TestimonialCard({ quote, author, role, avatar }: { quote: string; author: string; role: string; avatar: string }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100">
      <div className="text-4xl mb-4">"{quote}"</div>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center text-xl">
          {avatar}
        </div>
        <div>
          <div className="font-semibold text-slate-900">{author}</div>
          <div className="text-slate-600 text-sm">{role}</div>
        </div>
      </div>
    </div>
  )
}