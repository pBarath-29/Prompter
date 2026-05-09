import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Users, ShoppingBag, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

const features = [
  {
    icon: <Zap size={28} className="text-primary-500" />,
    title: 'AI-Powered Generation',
    description: 'Powered by Gemini 2.5 Flash — describe your goal in plain English and get a perfectly structured, optimised prompt in seconds.',
  },
  {
    icon: <Users size={28} className="text-primary-500" />,
    title: 'Community Library',
    description: 'Discover thousands of prompts shared by creators, developers, and writers. Vote on your favourites and build on what works.',
  },
  {
    icon: <ShoppingBag size={28} className="text-primary-500" />,
    title: 'Prompt Marketplace',
    description: 'Buy curated collections from expert creators or sell your own. Premium prompts for every use case, ready to use.',
  },
];

const steps = [
  { number: '01', title: 'Describe your goal', description: 'Tell the AI what you want to accomplish — no technical knowledge required.' },
  { number: '02', title: 'Choose tone & category', description: 'Pick from Professional, Creative, Casual and more. Select the right category for your task.' },
  { number: '03', title: 'Copy & use instantly', description: 'Your optimised prompt is ready. Copy it and paste it into any AI tool.' },
];

const LandingHero: React.FC = () => {
  return (
    <div className="space-y-16 sm:space-y-20 pb-8">

      {/* Hero */}
      <section className="relative text-center py-12 sm:py-16 overflow-hidden animate-fade-in">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl" />
        <div className="absolute inset-0 -z-10 opacity-30 dark:opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 20%, #34d399 0%, transparent 40%)' }}
        />

        <div className="relative px-4">
          <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 animate-slide-in-up">
            <Sparkles size={12} />
            Powered by Gemini 2.5 Flash
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight animate-slide-in-up" style={{ animationDelay: '50ms' }}>
            Generate Smarter<br />
            <span className="text-primary-500">AI Prompts</span> — Instantly
          </h1>

          <p className="mt-5 max-w-xl mx-auto text-lg text-gray-500 dark:text-gray-400 animate-slide-in-up" style={{ animationDelay: '100ms' }}>
            Describe your goal, pick a tone, and let Prompter craft the perfect prompt for any AI tool in seconds.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-in-up" style={{ animationDelay: '150ms' }}>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base"
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/community"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow transition-all duration-200 text-base"
            >
              Browse Community
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400 dark:text-gray-500 animate-slide-in-up" style={{ animationDelay: '200ms' }}>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-primary-500" /> Free to start</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-primary-500" /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-primary-500" /> 5 free prompts / month</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Everything you need to prompt better</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400 text-base">One platform for generating, discovering, and sharing AI prompts.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-100 dark:border-gray-700 animate-slide-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 sm:p-10 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">How it works</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400 text-base">From idea to perfect prompt in three steps.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="flex flex-col items-center text-center animate-slide-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="text-4xl font-extrabold text-primary-200 dark:text-primary-900 mb-3 leading-none">{step.number}</div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="text-center bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-10 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Start generating for free</h2>
        <p className="text-primary-100 mb-6 text-base">No credit card required. 5 free prompt generations every month.</p>
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 px-7 py-3 bg-white hover:bg-primary-50 active:scale-95 text-primary-700 font-bold rounded-xl shadow-lg transition-all duration-200 text-base"
        >
          Create Free Account
          <ArrowRight size={18} />
        </Link>
      </section>

    </div>
  );
};

export default LandingHero;
