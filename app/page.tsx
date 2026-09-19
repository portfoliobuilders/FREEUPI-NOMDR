import { HomeGenerator } from "@/components/payment/home-generator";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { UpiApps } from "@/components/marketing/upi-apps";
import { Faq } from "@/components/marketing/faq";

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <HomeGenerator />
      </section>
      <HowItWorks />
      <UpiApps />
      <Faq />
    </div>
  );
}
