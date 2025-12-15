import PeriodSection from "../sections/period-section";
import Header from "../sections/header";

export default function PeriodPage() {

  return <div className='min-h-screen bg-background'>
    <Header selectedPeriod={null} onPeriodChange={() => { }} periods={null} />
    <main className="container mx-auto px-6 py-8 space-y-8">
      <PeriodSection />
    </main>
  </div>
}