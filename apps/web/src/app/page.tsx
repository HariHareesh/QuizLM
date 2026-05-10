"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Sparkles,
  Brain,
  BookOpen,
  BarChart3,
  Zap,
  Users,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6" />
            <span className="font-bold text-lg">QuizLM</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm hover:text-primary transition">
              Features
            </a>
            <a href="#how-it-works" className="text-sm hover:text-primary transition">
              How it works
            </a>
            <a href="#pricing" className="text-sm hover:text-primary transition">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth#sign-in"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Sign in
            </Link>
            <Link href="/auth#sign-up" className={buttonVariants({ size: "sm" })}>
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-linear-to-b from-primary/10 via-background to-background" />
          <div className="absolute top-0 right-0 w-125 h-125 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4" />
                  AI-Powered Learning Platform
                </div>
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  Create, manage, and analyze quizzes with AI
                </h1>
                <p className="text-lg text-muted-foreground mt-6">
                  Upload documents, let AI extract questions, search semantically, and generate adaptive tests—all in one platform. Built for educators and students.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth#sign-up"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "group w-full sm:w-auto"
                  )}
                >
                  Start for free
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                </Link>
                <Button size="lg" variant="outline">
                  Watch demo
                </Button>
              </div>

              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Free tier available
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  5 minutes to get started
                </div>
              </div>
            </div>

            {/* Right Column - Dashboard Preview */}
            <div className="relative">
              <div className="bg-card border rounded-lg overflow-hidden shadow-2xl">
                <div className="bg-muted p-4 flex items-center gap-3 border-b">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-muted p-3 rounded space-y-2">
                      <div className="h-8 bg-primary rounded" />
                      <div className="h-3 bg-muted-foreground/20 rounded w-2/3" />
                    </div>
                    <div className="bg-muted p-3 rounded space-y-2">
                      <div className="h-8 bg-primary/60 rounded" />
                      <div className="h-3 bg-muted-foreground/20 rounded" />
                    </div>
                    <div className="bg-muted p-3 rounded space-y-2">
                      <div className="h-8 bg-primary/40 rounded" />
                      <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-primary/20 rounded w-1/3" />
                    <div className="h-3 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-5/6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need to master learning
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed for modern educational needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-card border rounded-lg p-6 hover:border-primary transition space-y-4"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple workflow, powerful results
            </h2>
            <p className="text-lg text-muted-foreground">
              Get started in minutes with our intuitive platform
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-card border rounded-lg p-6 space-y-4 h-full">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*for Pricing*/}
      <section id="pricing" className="py-20 md:py-32 bg-muted/30">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    {/* Section Header */}
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-bold mb-4">
        Simple & Transparent Pricing
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Choose the perfect plan for your workflow and scale effortlessly.
      </p>
    </div>

    {/* Pricing Cards */}
    <div className="grid md:grid-cols-3 gap-8">
      
      {/* Starter Plan */}
      <div className="bg-card border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Starter</h3>
          <p className="text-muted-foreground">
            Perfect for beginners and small projects.
          </p>

          <div className="flex items-end gap-1">
            <span className="text-5xl font-bold">$0</span>
            <span className="text-muted-foreground mb-1">/month</span>
          </div>

          <ul className="space-y-3 pt-4">
            <li className="flex items-center gap-2">
              ✅ 1 Project
            </li>
            <li className="flex items-center gap-2">
              ✅ Basic Analytics
            </li>
            <li className="flex items-center gap-2">
              ✅ Community Support
            </li>
          </ul>

          <button className="w-full mt-6 bg-primary text-white py-3 rounded-lg font-medium hover:opacity-90 transition">
            Get Started
          </button>
        </div>
      </div>

      {/* Pro Plan */}
      <div className="bg-primary text-white rounded-2xl p-8 shadow-xl scale-105 relative">
        <div className="absolute top-4 right-4 bg-white text-primary text-xs font-semibold px-3 py-1 rounded-full">
          Most Popular
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Pro</h3>
          <p className="text-white/80">
            Best for growing teams and startups.
          </p>

          <div className="flex items-end gap-1">
            <span className="text-5xl font-bold">$29</span>
            <span className="text-white/70 mb-1">/month</span>
          </div>

          <ul className="space-y-3 pt-4">
            <li className="flex items-center gap-2">
              ✅ Unlimited Projects
            </li>
            <li className="flex items-center gap-2">
              ✅ Advanced Analytics
            </li>
            <li className="flex items-center gap-2">
              ✅ Priority Support
            </li>
            <li className="flex items-center gap-2">
              ✅ Team Collaboration
            </li>
          </ul>

          <button className="w-full mt-6 bg-white text-primary py-3 rounded-lg font-medium hover:bg-white/90 transition">
            Start Free Trial
          </button>
        </div>
      </div>

      {/* Enterprise Plan */}
      <div className="bg-card border rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Enterprise</h3>
          <p className="text-muted-foreground">
            Advanced solutions for large organizations.
          </p>

          <div className="flex items-end gap-1">
            <span className="text-5xl font-bold">$99</span>
            <span className="text-muted-foreground mb-1">/month</span>
          </div>

          <ul className="space-y-3 pt-4">
            <li className="flex items-center gap-2">
              ✅ Dedicated Support
            </li>
            <li className="flex items-center gap-2">
              ✅ Custom Integrations
            </li>
            <li className="flex items-center gap-2">
              ✅ Enterprise Security
            </li>
            <li className="flex items-center gap-2">
              ✅ Unlimited Team Members
            </li>
          </ul>

          <button className="w-full mt-6 bg-primary text-white py-3 rounded-lg font-medium hover:opacity-90 transition">
            Contact Sales
          </button>
        </div>
      </div>

    </div>
  </div>
</section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to revolutionize your learning?
          </h2>
          <p className="text-lg opacity-90">
            Join educators and students already using QuizLM to create better assessments.
          </p>
          <Link
            href="/auth#sign-up"
            className={cn(
              buttonVariants({ size: "lg", variant: "secondary" }),
              "group"
            )}
          >
            Get started free
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-full md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5" />
                <span className="font-bold">QuizLM</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered quiz and learning analytics platform.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition">API</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">About</a></li>
                <li><a href="#" className="hover:text-foreground transition">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition">Careers</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>&copy; 2024 QuizLM. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground transition">Twitter</a>
              <a href="#" className="hover:text-foreground transition">GitHub</a>
              <a href="#" className="hover:text-foreground transition">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: BookOpen,
    title: "AI Question Extraction",
    description: "Upload documents and let AI automatically extract questions in seconds",
  },
  {
    icon: Zap,
    title: "Semantic Search",
    description: "Find similar questions across your entire question bank with natural language",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track performance, identify weak topics, and get actionable insights",
  },
  {
    icon: Users,
    title: "Collaborative Learning",
    description: "Create public question banks and share tests with students",
  },
  {
    icon: Brain,
    title: "AI-Generated Tests",
    description: "Generate adaptive tests based on difficulty, subject, and topics",
  },
  {
    icon: CheckCircle2,
    title: "Easy Assessment",
    description: "Support for MCQs, true/false, short answers, and long answers",
  },
];

const steps = [
  {
    title: "Upload Documents",
    description: "Add PDFs, Word docs, or text files containing your course material",
  },
  {
    title: "Extract Questions",
    description: "Let AI analyze and extract multiple choice and essay questions",
  },
  {
    title: "Create Tests",
    description: "Build tests manually or generate them using AI with your desired criteria",
  },
  {
    title: "Analyze Results",
    description: "Get detailed analytics on student performance and learning gaps",
  },
];
