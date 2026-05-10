"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useEffect, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("sign-in");

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      setActiveTab(hash === "sign-up" ? "sign-up" : "sign-in");
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            const nextHash = value === "sign-up" ? "sign-up" : "sign-in";
            window.location.hash = nextHash;
          }}
        >
          <TabsList className="w-full">
            <TabsTrigger className="flex-1" value="sign-in">
              Sign in
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="sign-up">
              Sign up
            </TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in" className="mt-4">
            <SignIn routing="hash" />
          </TabsContent>
          <TabsContent value="sign-up" className="mt-4">
            <SignUp routing="hash" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
