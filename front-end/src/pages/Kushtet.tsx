// src/pages/Kushtet.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Gavel, Shield, Info, AlertTriangle, ArrowLeft } from 'lucide-react';

const TermsOfServicePage: React.FC = () => {
  // Update document title and meta for SEO
  useEffect(() => {
    document.title = "Kushtet e Shërbimit | Auto ";
    
    // Add meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Kushtet e Shërbimit të Auto  përshkruajnë rregullat dhe kushtet që duhet të respektohen kur përdorni faqen tonë të internetit dhe shërbimet tona.');
    
    return () => {
      // Clean up if needed
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="mr-2" size={20} />
          Kthehu në faqen kryesore
        </Link>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold mb-6">Kushtet e Shërbimit</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-8">
          Ju falënderojmë që zgjodhët Auto . Këto Kushte të Shërbimit ("Kushtet") përcaktojnë rregullat dhe rregulloret për përdorimin e faqes së internetit të Auto . Duke aksesuar këtë faqe interneti, ne supozojmë se pranoni këto kushte. Mos vazhdoni të përdorni Auto  nëse nuk pajtoheni me të gjitha kushtet e përcaktuara në këtë faqe.
        </p>

        <div className="bg-blue-50 p-6 rounded-lg mb-8 border border-blue-100">
          <h2 className="flex items-center text-2xl font-semibold mb-4 text-blue-800">
            <FileText className="mr-3" />
            Përmbledhje e Kushteve të Shërbimit
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Përdorimi i faqes supozon pranimin e këtyre kushteve</li>
            <li>• Informacioni i automjeteve është vetëm për qëllime informative</li>
            <li>• Çdo transaksion duhet të konfirmohet personalisht</li>
            <li>• Përmbajtja e faqes është pronë intelektuale e Auto </li>
            <li>• Nuk ofrojmë garanci për saktësinë 100% të informacionit</li>
          </ul>
        </div>

        <section className="mb-8">
          <h2 className="flex items-center text-2xl font-semibold mb-4">
            <Gavel className="mr-3 text-blue-600" />
            1. Kushtet e Përgjithshme
          </h2>
          <p className="mb-4">Duke aksesuar dhe përdorur këtë faqe, ju pranoni të respektoni ligjet dhe rregulloret në fuqi dhe pajtoheni se jeni përgjegjës për respektimin e ligjeve lokale. Nëse nuk pajtoheni me ndonjë nga këto kushte, ju jeni të ndaluar të përdorni ose aksesoni këtë faqe.</p>
          <p>Materialet që përmban kjo faqe janë të mbrojtura nga ligjet e së drejtës së autorit dhe markës tregtare. Këto kushte të shërbimit ofrohen nën licencën e Auto .</p>
        </section>

        <section className="mb-8">
          <h2 className="flex items-center text-2xl font-semibold mb-4">
            <Shield className="mr-3 text-blue-600" />
            2. Përdorimi i Licencës
          </h2>
          <p className="mb-4">Jepet leje për të shikuar përkohësisht materialet (informacione ose softuer) në faqen e internetit të Auto  vetëm për përdorim personal, jo-komercial. Kjo është dhënia e një licence, jo një transferim titulli, dhe nën këtë licencë ju nuk mund të:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Modifikoni ose kopjoni materialet</li>
            <li>Përdorni materialet për qëllime tregtare ose për ndonjë shfaqje publike</li>
            <li>Përpiqeni të dekompiloni ose të zbërtheni ndonjë softuer që përmban faqja</li>
            <li>Hiqni çdo të drejtë autori ose shënime të tjera të pronësisë nga materialet</li>
            <li>Transferoni materialet te një person tjetër ose 'pasqyroni' materialet në ndonjë server tjetër</li>
          </ul>
          <p className="mt-4">Kjo licencë do të përfundojë automatikisht nëse shkelni ndonjë nga këto kufizime dhe mund të përfundojë nga Auto  në çdo kohë.</p>
        </section>

        <section className="mb-8">
          <h2 className="flex items-center text-2xl font-semibold mb-4">
            <Info className="mr-3 text-blue-600" />
            3. Informacion për Automjetet
          </h2>
          <p className="mb-4">Informacioni i automjeteve në faqen tonë të internetit është vetëm për qëllime të përgjithshme informative. Ne përpiqemi të sigurojmë që të gjitha detajet, përshkrimet dhe çmimet e automjeteve të jenë të sakta, por mund të ketë gabime. Ju këshillojmë të verifikoni detajet e plota të çdo automjeti duke na kontaktuar drejtpërdrejt përpara se të merrni ndonjë vendim bazuar në informacionin e faqes tonë.</p>
          <p className="mb-4">Specifikacionet teknike, ngjyrat dhe detajet e tjera të automjeteve janë të bazuara në informacionin e dhënë nga prodhuesit dhe ne nuk mund të garantojmë saktësinë e tyre.</p>
          <p>Imazhet e automjeteve janë vetëm për qëllime ilustruese dhe mund të mos korrespondojnë saktësisht me modelin aktual të disponueshëm.</p>
        </section>

        <section className="mb-8">
          <h2 className="flex items-center text-2xl font-semibold mb-4">
            <Shield className="mr-3 text-blue-600" />
            4. Rezervimet dhe Blerjet
          </h2>
          <p className="mb-4">Çdo rezervim ose shprehje interesi përmes faqes sonë të internetit është subjekt i konfirmimit nga stafi ynë. Asnjë kontratë nuk do të ekzistojë ndërmjet jush dhe Auto  për blerjen e një automjeti derisa të ketë një konfirmim të qartë me shkrim nga ana jonë.</p>
          <p className="mb-4">Çmimet e automjeteve të shfaqura në faqen tonë janë subjekt i ndryshimit pa njoftim paraprak. Ne nuk garantojmë disponueshmërinë e vazhdueshme të ndonjë modeli të veçantë automjeti të treguar në faqen tonë.</p>
          <p>Të gjitha transaksionet përfundimtare për blerjen e një automjeti duhet të kryhen personalisht në Auto  dhe do t'i nënshtrohen kushteve tona shtesë të blerjes.</p>
        </section>

        <section className="mb-8">
          <h2 className="flex items-center text-2xl font-semibold mb-4">
            <AlertTriangle className="mr-3 text-blue-600" />
            5. Heqja Dorë dhe Kufizimi i Përgjegjësisë
          </h2>
          <p className="mb-4">Materialet në faqen e internetit të Auto  ofrohen 'siç janë'. Auto  nuk jep garanci, të shprehura ose të nënkuptuara, dhe këtu mohon dhe mohon të gjitha garancitë e tjera, duke përfshirë, pa kufizim, garancitë e nënkuptuara ose kushtet e tregtueshmërisë, përshtatshmërisë për një qëllim të veçantë ose jo-shkeljes të pronësisë intelektuale ose shkelje tjetër të të drejtave.</p>
          <p className="mb-4">Për më tepër, Auto  nuk garanton ose bën ndonjë përfaqësim në lidhje me saktësinë, rezultatet e mundshme, ose besueshmërinë e përdorimit të materialeve në faqen e tij të internetit ose ndryshe në lidhje me materiale të tilla ose në çdo faqe të lidhur me këtë faqe.</p>
          <p>Në asnjë rast Auto  ose furnizuesit e tij nuk do të jenë përgjegjës për ndonjë dëm (duke përfshirë, pa kufizim, dëmet për humbjen e të dhënave ose fitimit, ose për shkak të ndërprerjes së biznesit) që rrjedhin nga përdorimi ose pamundësia për të përdorur materialet në faqen e internetit të Auto , edhe nëse Auto  ose një përfaqësues i autorizuar i Auto  është njoftuar gojarisht ose me shkrim për mundësinë e dëmtimit të tillë.</p>
        </section>

        <section className="mb-8">
          <h2 className="flex items-center text-2xl font-semibold mb-4">
            <Shield className="mr-3 text-blue-600" />
            6. Saktësia e Materialeve
          </h2>
          <p className="mb-4">Materialet që shfaqen në faqen e internetit të Auto  mund të përmbajnë gabime teknike, tipografike ose fotografike. Auto  nuk garanton që ndonjë nga materialet në faqen e tij të internetit është i saktë, i plotë ose aktual. Auto  mund të bëjë ndryshime në materialet e përmbajtura në faqen e tij të internetit në çdo kohë pa njoftim. Megjithatë, Auto  nuk merr përsipër të përditësojë materialet.</p>
        </section>

        <section className="mb-8">
          <h2 className="flex items-center text-2xl font-semibold mb-4">
            <Shield className="mr-3 text-blue-600" />
            7. Lidhjet
          </h2>
          <p className="mb-4">Auto  nuk është rishikuar të gjitha faqet e lidhura me faqen e tij të internetit dhe nuk është përgjegjës për përmbajtjen e ndonjë faqeje të tillë të lidhur. Përfshirja e ndonjë lidhjeje nuk nënkupton miratimin nga Auto  të faqes. Përdorimi i çdo faqeje të lidhur të tillë është në rrezikun e përdoruesit.</p>
        </section>

        <section className="mb-8">
          <h2 className="flex items-center text-2xl font-semibold mb-4">
            <Shield className="mr-3 text-blue-600" />
            8. Modifikimet
          </h2>
          <p className="mb-4">Auto  mund të rishikojë këto kushte të shërbimit për faqen e tij të internetit në çdo kohë pa njoftim. Duke përdorur këtë faqe interneti, ju pajtoheni të jeni të lidhur me versionin aktual të këtyre kushteve të shërbimit.</p>
        </section>

        <section className="mb-8">
          <h2 className="flex items-center text-2xl font-semibold mb-4">
            <Shield className="mr-3 text-blue-600" />
            9. Ligji Qeverisës
          </h2>
          <p className="mb-4">Çdo pretendim në lidhje me faqen e internetit të Auto  do të qeveriset nga ligjet e Republikës së Shqipërisë pa marrë parasysh konfliktin e dispozitave ligjore.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Kontaktoni Në</h2>
          <p className="mb-4">Nëse keni pyetje ose shqetësime në lidhje me Kushtet e Shërbimit, ju lutemi na kontaktoni në:</p>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="font-semibold">Auto </p>
            <p>Adresa: Fushë-Kruje, E762, Fushë Krujë</p>
            <p>Email: info@auto.ch</p>
            <p>Telefon: 069 931 1111</p>
          </div>
        </section>

        <hr className="my-8 border-gray-200" />

        <div className="text-sm text-gray-500">
          <p>Data Efektive: 30 Mars, 2025</p>
          <p>Rishikuar së Fundi: 30 Mars, 2025</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;