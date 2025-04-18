import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import AppHeader from '@/components/AppHeader';
const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  return <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AppHeader remainingCredits="0" apiKey="" onApiKeyChange={() => {}} />
      
      <div className="flex-1 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight">Choose Your Plan</h1>
            <p className="text-muted-foreground mt-2">Simple, transparent pricing to meet your needs</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            {/* Free Plan */}
            <Card className="bg-gray-900 border-gray-800 shadow-xl relative overflow-hidden">
              <CardHeader className="pb-0">
                <h2 className="text-2xl font-bold text-white">Free</h2>
                <div className="flex items-baseline mt-2">
                  <span className="text-5xl font-extrabold tracking-tight">0</span>
                  <span className="ml-1 mx-[10px] text-slate-50 text-4xl">Tk</span>
                </div>
                <p className="text-sm text-gray-400 mt-3">Limited features to get started</p>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <PricingItem included text="Limited Metadata Generation" />
                  <PricingItem included text="Basic Image to Prompt Features" />
                  <PricingItem included text="Limited Access to Metadata Customization" />
                  <PricingItem included={false} text="More Fast Processing" />
                  <PricingItem included={false} text="Fully Custom Support" />
                  <PricingItem included={false} text="All Future Features" />
                  <PricingItem included={false} text="Commercial License" />
                </ul>
              </CardContent>
              <CardFooter>
                <Button size="lg" onClick={() => navigate('/')} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-inherit">Current Plan</Button>
              </CardFooter>
            </Card>
        
            {/* Basic Plan */}
            <Card className="bg-gray-900 border-gray-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-black px-3 py-1 text-xs font-medium">
                POPULAR
              </div>
              <CardHeader className="pb-0">
                <h2 className="text-2xl font-bold text-white">Premium</h2>
                <div className="flex items-baseline mt-2">
                  <span className="text-5xl font-extrabold tracking-tight">1000</span>
                  <span className="ml-1 mx-[10px] text-slate-50 text-xl">Tk/Yearly</span>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-green-400 text-sm font-medium">Save 1400 Tk</span>
                  <span className="ml-2 text-gray-400 text-xs line-through">2400 Tk/year</span>
                </div>
                <p className="text-sm text-gray-400 mt-3">All features, unlimited access</p>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <PricingItem included text="Unlimited Metadata Generation" />
                  <PricingItem included text="Full Image to Prompt Features" />
                  <PricingItem included text="Full Access to Metadata Customization" />
                  <PricingItem included text="More Fast Processing" />
                  <PricingItem included text="Fully Custom Support" />
                  <PricingItem included text="All Future Features" />
                  <PricingItem included text="Commercial License" />
                </ul>
              </CardContent>
              <CardFooter>
                <Button size="lg" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" onClick={() => window.open('https://csvpikshine.paymently.io/default/paymentlink/pay/SIBUfRkJxIDgK7GhkrL4WdAJofkOdkL8hnidHQdF', '_blank')}>
                  Upgrade to Premium
                </Button>
              </CardFooter>
            </Card>
        
            {/* Premium Plan */}
            <Card className="bg-gray-900 border-gray-800 shadow-xl relative overflow-hidden">
              <CardHeader className="pb-0">
                <h2 className="text-2xl font-bold text-white">Basic</h2>
                <div className="flex items-baseline mt-2">
                  <span className="text-5xl font-extrabold tracking-tight">200</span>
                  <span className="ml-1 mx-[10px] text-slate-50 text-xl">Tk/Month</span>
                </div>
                <div className="flex items-center mt-1">
                  
                  
                </div>
                <p className="text-sm text-gray-400 mt-3">All features, unlimited access</p>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <PricingItem included text="Unlimited Metadata Generation" />
                  <PricingItem included text="Full Image to Prompt Features" />
                  <PricingItem included text="Full Access to Metadata Customization" />
                  <PricingItem included text="More Fast Processing" />
                  <PricingItem included text="Fully Custom Support" />
                  <PricingItem included text="All Future Features" />
                  <PricingItem included text="Commercial License" />
                </ul>
              </CardContent>
              <CardFooter>
                <Button size="lg" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" onClick={() => window.open('https://csvpikshine.paymently.io/default/paymentlink/pay/oj1MGLV0cgkc5yHv034GDR2WzhcT8JT2ojM71s18', '_blank')}>
                  Upgrade to Basic
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="text-center mt-12 text-sm text-gray-400">
            <p>* All prices are one-time payments for Premium plan</p>
            <p className="mt-1">* Premium and Basic features are available immediately after payment</p>
          </div>
        </div>
      </div>
    </div>;
};

// Helper component for pricing items
const PricingItem = ({
  included,
  text
}: {
  included: boolean;
  text: string;
}) => <li className="flex items-start">
    {included ? <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" /> : null}
    <span className={included ? "text-gray-200" : "text-gray-500"}>{text}</span>
  </li>;
export default PricingPage;