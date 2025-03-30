// src/pages/Privatesia.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, User, Database, Lock, Eye, Clock, ArrowLeft } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  // Update document title for SEO
  useEffect(() => {
    document.title = "Politika e Privatësisë | Auto Hafuzi";
    
    // Add meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Politika e Privatësisë e Auto Hafuzi përcakton se si ne mbledhim, përdorim dhe mbrojmë informacionin tuaj personal gjatë përdorimit të faqes sonë.');
    
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

      <h1 className="text-3xl md:text-4xl font-bold mb-6">Politika e Privatësisë</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-8">
          Në Auto Hafuzi, ne e vlerësojmë dhe respektojmë privatësinë tuaj. Kjo Politikë e Privatësisë shpjegon se si mbledhim, përdorim dhe mbrojmë informacionin tuaj personal. Duke vizituar dhe përdorur faqen tonë të internetit, ju pranoni praktikat e përshkruara në këtë politikë.
        </p>

        <div className="bg-blue-50 p-6 rounded-lg mb-8 border border-blue-100">
          <h2 className="flex items-center text-2xl font-semibold mb-4 text-blue-800">
            <Shield className="mr-3" />
            Përmbledhje e Politikës së Privatësisë
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Ne mbledhim vetëm informacionin e nevojshëm për të ofruar shërbimin tonë</li>
            <li>• Informacioni juaj nuk shitet apo jepet tek palë të treta pa pëlqimin tuaj</li>
            <li>• Ne përdorim teknologji moderne për të mbrojtur të dhënat tuaja</li>
            <li>• Ju keni të drejtë të aksesoni, korrigjoni ose fshini të dhënat tuaja</li>
            <li>• Faqja jonë përdor cookies për të përmirësuar eksperiencën tuaj</li>
          </ul>
        </div>

        <section className="mb-8">
          <h2 className="flex items-center text-2xl font-semibold mb-4">
            <User className="mr-3 text-blue-600" />
            Informacioni që Mbledhim
          </h2>
          <p className="mb-4">Ne mund të mbledhim këto lloje informacioni kur vizitoni faqen tonë ose përdorni shërbimet tona:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Informacion Identifikues Personal:</strong> Emri, adresa e email-it, numri i telefonit, adresa kur ju dërgoni një kërkesë përmes formularit të kontaktit ose kur na kontaktoni për një automjet specifik.</li>
            <li><strong>Informacion Përdorimi:</strong> Informacion rreth mënyrës së ndërveprimit me faqen tonë, preferencat, faqet e vizituara, kohëzgjatja e vizitës, opsionet e automjeteve që kërkoni.</li>
            <li><strong>Informacion Pajisje:</strong> Lloji i pajisjes, sistemi operativ, lloji i shfletuesit, adresa IP, dhe informacione të tjera teknike.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="flex items-center text-2xl font-semibold mb-4">
            <Database className="mr-3 text-blue-600" />
            Si e Përdorim Informacionin
          </h2>
          <p className="mb-4">Ne përdorim informacionin që mbledhim për qëllimet e mëposhtme:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Për t'ju ofruar informacion në lidhje me automjetet që mund t'ju interesojnë</li>
            <li>Për t'iu përgjigjur pyetjeve dhe kërkesave tuaja</li>
            <li>Për të personalizuar dhe përmirësuar eksperiencën tuaj të përdorimit</li>
            <li>Për të analizuar dhe përmirësuar faqen dhe shërbimet tona</li>
            <li>Për të komunikuar me ju në lidhje me ofertat dhe promocionimet tona (nëse keni zgjedhur të merrni komunikime të tilla)</li>
            <li>Për të përmbushur detyrimet ligjore dhe rregullatore</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="flex items-center text-2xl font-semibold mb-4">
            <Lock className="mr-3 text-blue-600" />
            Siguria e Të Dhënave
          </h2>
          <p className="mb-4">Ne zbatojmë masa të përshtatshme të sigurisë për të mbrojtur informacionin tuaj personal nga humbja, keqpërdorimi, aksesi i paautorizuar, zbulimi, ndryshimi dhe shkatërrimi. Të gjitha informacionet që na jepni ruhen në servera të sigurt dhe të kriptuar.</p>
          <p>Megjithatë, asnjë metodë transmetimi përmes internetit ose metodë e ruajtjes elektronike nuk është 100% e sigurt. Prandaj, ndërsa përpiqemi të përdorim mjete të pranueshme komerciale për të mbrojtur informacionin tuaj personal, nuk mund të garantojmë sigurinë absolute.</p>
        </section>

        <section className="mb-8">
          <h2 className="flex items-center text-2xl font-semibold mb-4">
            <Eye className="mr-3 text-blue-600" />
            Cookies dhe Teknologjitë e Ngjashme
          </h2>
          <p className="mb-4">Faqja jonë përdor "cookies" për të përmirësuar eksperiencën tuaj të përdorimit. Cookies janë skedarë të vegjël teksti që vendosen në pajisjen tuaj nga një server web. Ata mund të përdoren për të mbledhur, ruajtur dhe ndarë informacione në lidhje me aktivitetet tuaja në faqen tonë.</p>
          <p className="mb-4">Ne përdorim cookie të ndryshme për këto qëllime:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Cookie të Nevojshme:</strong> Këto cookie janë thelbësore për funksionalitetin bazë të faqes.</li>
            <li><strong>Cookie Preference:</strong> Këto cookie na lejojnë të mbajmë mend zgjedhjet tuaja dhe të personalizojmë faqen për ju.</li>
            <li><strong>Cookie Analitike:</strong> Këto cookie na ndihmojnë të kuptojmë se si vizitorët ndërveprojnë me faqen tonë.</li>
            <li><strong>Cookie Marketingu:</strong> Këto cookie përdoren për t'ju treguar reklama relevante dhe të personalizuara.</li>
          </ul>
          <p>Ju mund të zgjidhni të refuzoni cookie-t duke rregulluar cilësimet e shfletuesit tuaj. Megjithatë, disa pjesë të faqes sonë mund të mos funksionojnë siç duhet nëse zgjidhni të bëni këtë.</p>
        </section>

        <section className="mb-8">
          <h2 className="flex items-center text-2xl font-semibold mb-4">
            <Lock className="mr-3 text-blue-600" />
            Të Drejtat Tuaja të Privatësisë
          </h2>
          <p className="mb-4">Në varësi të vendndodhjes suaj, ju mund të keni të drejta të caktuara lidhur me informacionin tuaj personal, duke përfshirë:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Të drejtën për të aksesuar informacionin që kemi për ju</li>
            <li>Të drejtën për të korrigjuar informacionin e pasaktë</li>
            <li>Të drejtën për të kërkuar fshirjen e informacionit tuaj</li>
            <li>Të drejtën për të kufizuar përpunimin e informacionit tuaj</li>
            <li>Të drejtën për të tërhequr pëlqimin tuaj në çdo kohë</li>
          </ul>
          <p>Për të ushtruar ndonjë nga këto të drejta, ju lutemi na kontaktoni në info@hafuziauto.ch.</p>
        </section>

        <section className="mb-8">
          <h2 className="flex items-center text-2xl font-semibold mb-4">
            <Clock className="mr-3 text-blue-600" />
            Ndryshimet në Politikën e Privatësisë
          </h2>
          <p className="mb-4">Ne mund të përditësojmë këtë politikë privatësie herë pas here. Ndryshimet do të publikohen në këtë faqe me një datë të përditësuar "efektive". Ju inkurajojmë të rishikoni rregullisht politikën tonë të privatësisë për ndryshime.</p>
          <p>Duke vazhduar të përdorni faqen tonë pas ndryshimeve të tilla, ju pranoni politikën e rishikuar të privatësisë.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Kontaktoni Në</h2>
          <p className="mb-4">Nëse keni pyetje ose shqetësime në lidhje me privatësinë tuaj ose këtë politikë, ju lutemi të na kontaktoni në:</p>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="font-semibold">Auto Hafuzi</p>
            <p>Adresa: Fushë-Kruje, E762, Fushë Krujë</p>
            <p>Email: info@hafuziauto.ch</p>
            <p>Telefon: 069 931 1111</p>
          </div>
        </section>

        <hr className="my-8 border-gray-200" />

        <div className="text-sm text-gray-500">
          <p>Data Efektive: 30 Mars, 2025</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;