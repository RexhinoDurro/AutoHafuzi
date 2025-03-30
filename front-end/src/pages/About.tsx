import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Award, Car, Clock, Settings, Sparkles} from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const AboutPage = () => {
  const [companyDescription, setCompanyDescription] = useState('I shtyrë nga pasioni, i përkushtuar ndaj cilësisë. Ne kemi ndihmuar klientët të gjejnë automjetin e tyre të përsosur që nga viti 2010.');
  const [isLoading, setIsLoading] = useState(false);
  const contentRef = useRef(null);
  const [isVisible] = useState({
    'overview': true,
    'history': true,
    'services': true,
    'testimonials': true,
    'why-us': true,
    'contact': true
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure content is crawlable by setting it up immediately
    document.title = "Auto Hafuzi - Partneri juaj i besuar në përsosmërinë e automjeteve në Shqipëri";
    
    // Define meta description for SEO
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Që nga viti 2010, Auto Hafuzi ofron makina të cilësisë së lartë, përfshirë modele Mercedes, BMW, Audi dhe më shumë, me motor diesel dhe benzinë për çdo buxhet.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Që nga viti 2010, Auto Hafuzi ofron makina të cilësisë së lartë, përfshirë modele Mercedes, BMW, Audi dhe më shumë, me motor diesel dhe benzinë për çdo buxhet.';
      document.head.appendChild(meta);
    }

    // Fetch company information
    const fetchAboutData = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.ABOUT);
        const data = await response.json();
        
        setCompanyDescription(data.company_description);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching about page data:', error);
        setCompanyDescription('I shtyrë nga pasioni, i përkushtuar ndaj cilësisë. Ne kemi ndihmuar klientët të gjejnë automjetin e tyre të përsosur që nga viti 2010.');
        setIsLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  const handleDiscoverClick = () => {
    navigate('/cars');
  };

  // For very first render, include pre-rendered content
  if (isLoading) {
    return (
      <div ref={contentRef} className="flex justify-center items-center min-h-screen">
        <h1 className="text-3xl font-bold">Auto Hafuzi - Partneri juaj i besuar në përsosmërinë e automjeteve në Shqipëri</h1>
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden" ref={contentRef}>
      {/* Hero Section with Parallax Effect */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute w-full h-full bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage: "url('/api/placeholder/1920/1080')",
            transform: "translateZ(-10px) scale(2)",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white animate-fade-in-up">
            Auto Hafuzi
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Partneri juaj i besuar në përsosmërinë e automjeteve në Shqipëri
          </p>
          <p className="text-lg text-white mb-8 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            Që nga viti 2010, ne jemi përkushtuar ndaj sigurimit të makinave të cilësisë më të lartë për klientët tanë.
            Me një përzgjedhje të gjerë të makinave nga markat më të mira si <strong>Mercedes</strong>, <strong>BMW</strong>, <strong>Audi</strong> dhe më shumë,
            ne ofrojmë një përzgjedhje të pasur të automjeteve diesel dhe benzinë për çdo nevojë dhe buxhet.
          </p>
          <button 
            onClick={handleDiscoverClick}
            className="bg-white text-blue-600 hover:bg-blue-100 font-bold py-3 px-8 rounded-full transition duration-300 animate-fade-in-up" 
            style={{animationDelay: '0.4s'}}
            aria-label="Zbuloni Koleksionin Tonë"
          >
            Zbuloni Koleksionin Tonë
          </button>
        </div>
      </section>

      {/* Company Overview with Animated Background */}
      <section id="overview" className="relative py-20">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-700"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className="absolute rounded-full bg-white" 
                style={{
                  width: `${Math.random() * 300 + 50}px`,
                  height: `${Math.random() * 300 + 50}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${Math.random() * 10 + 20}s linear infinite`,
                  opacity: Math.random() * 0.5 + 0.1,
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible['overview'] ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
            <h2 className="text-4xl font-bold mb-6 text-white">Rreth Auto Hafuzi</h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
            <p className="text-xl text-white max-w-3xl mx-auto">
              {companyDescription}
            </p>
            <p className="text-lg text-white max-w-3xl mx-auto mt-4">
              Ne besojmë se çdo klient meriton një makinë që jo vetëm përputhet me nevojat e tyre praktike, por edhe me stilin e tyre personal. Me ekspertizën tonë në industrinë e automjeteve dhe njohjen e tregut shqiptar, ne jemi në gjendje t'ju ofrojmë makina të cilësisë së lartë me çmime konkurruese.
            </p>
            <p className="text-lg text-white max-w-3xl mx-auto mt-4">
              Qasja jonë e personalizuar ndaj shërbimit të klientit siguron që secili klient të marrë vëmendjen dhe ndihmën e personalizuar që i nevojitet për të bërë një zgjedhje të informuar. Nga modelet Mercedes-Benz luksoze dhe SUV-të BMW te makinat kompakte ekonomike, ne kemi diçka për çdo shije dhe buxhet.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Users className="h-12 w-12 text-yellow-400" />, 
                title: "Ekip Ekspert", 
                description: "Ekipi ynë i dedikuar i specialistëve të automjeteve sjell vite përvojë dhe pasion për t'ju shërbyer më mirë. Ne jemi të përkushtuar për të gjetur makinën e përsosur që përputhet me nevojat tuaja specifike dhe buxhetin tuaj.", 
                delay: 0 
              },
              { 
                icon: <Car className="h-12 w-12 text-yellow-400" />, 
                title: "Përzgjedhje Premium", 
                description: "Çdo automjet në inventarin tonë është përzgjedhur me kujdes dhe inspektuar tërësisht për të siguruar cilësi. Ne ofrojmë një gamë të gjerë të makinave diesel dhe benzinë nga prodhuesit më të respektuar, duke përfshirë Mercedes, BMW, dhe Audi.", 
                delay: 0.2 
              },
              { 
                icon: <Award className="h-12 w-12 text-yellow-400" />, 
                title: "Klienti në Rend të Parë", 
                description: "Ne i japim prioritet kënaqësisë suaj dhe punojmë pa pushim për ta bërë përvojën tuaj të blerjes së makinës të jashtëzakonshme. Transparenca, ndershmëria dhe shërbimi i personalizuar janë themelet e filozofisë sonë të biznesit.", 
                delay: 0.4 
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className={`bg-white p-8 rounded-lg shadow-xl transform transition-all duration-1000 hover:shadow-2xl hover:-translate-y-2 ${isVisible['overview'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`} 
                style={{ transitionDelay: `${item.delay}s` }}
              >
                <div className="flex justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-semibold text-center mb-4 text-gray-800">{item.title}</h3>
                <p className="text-center text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our History Timeline - Improved with strong headings for SEO */}
      <section id="history" className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible['history'] ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Rrugëtimi Ynë</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              <strong>Nga fillime të thjeshta deri në bërjen një emër të besuar në industrinë e automobilave në Shqipëri</strong>
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">
              Rrugëtimi ynë është bazuar në vendosmërinë për të ofruar makinat më të mira për klientët tanë shqiptarë. Me një fokus të fuqishëm në cilësi dhe shërbim, ne kemi evoluar nga një biznes i vogël familjar në një nga tregtarët më të respektuar të makinave në vend.
            </p>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-600"></div>
            
            {/* Timeline items */}
            {[
              { year: "2010", title: "Themelimi", description: "Auto Hafuzi hapi dyert e saj me një koleksion të vogël të automjeteve premium, me fokus të veçantë në modelet diesel dhe benzinë të Mercedes-Benz." },
              { year: "2015", title: "Zgjerimi", description: "Ne zgjeruam inventarin tonë dhe u zhvendosëm në një sallë ekspozimi më të madhe për t'i shërbyer më mirë bazës sonë gjithnjë në rritje të klientëve, duke përfshirë një gamë më të gjerë të markave dhe modeleve." },
              { year: "2018", title: "Qendra e Shërbimit", description: "Lançuam qendrën tonë moderne të shërbimit për të ofruar shërbime gjithëpërfshirëse të mirëmbajtjes dhe riparimit për të gjitha markat kryesore të automjeteve, me specializim të veçantë në modelet gjermane." },
              { year: "2023", title: "Transformimi Dixhital", description: "Përqafuam teknologjinë më të fundit për të përmirësuar përvojën e blerjes së makinave si online ashtu edhe personalisht, duke ofruar një proces të thjeshtë për të blerë makinën tuaj të ëndrrave." }
            ].map((item, index) => (
              <div 
                key={index} 
                className={`relative flex md:items-center mb-16 transition-all duration-1000 ${isVisible['history'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
                style={{ transitionDelay: `${index * 0.2}s` }}
              >
                <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 text-right' : 'md:pl-12 md:ml-auto'}`}>
                  <div className={`p-6 rounded-lg shadow-lg bg-white ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}>
                    <span className="inline-block px-4 py-2 rounded bg-blue-600 text-white font-bold mb-4">{item.year}</span>
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
                
                {/* Timeline dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-white border-4 border-blue-600 z-10"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services with Improved Headings and SEO markup */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible['services'] ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Shërbimet Tona</h2>
            <div className="w-24 h-1 bg-green-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              <strong>Zgjidhje gjithëpërfshirëse automobilistike të përshtatura për nevojat tuaja</strong>
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">
              Ne kuptojmë se blerja e një makine është një vendim i rëndësishëm. Prandaj, ofrojmë një gamë të gjerë shërbimesh për t'ju ndihmuar në çdo hap të rrugës, nga gjetja e makinës së përsosur deri te mirëmbajtja e saj për vitet në vijim. Ekspertiza jonë shtrihet në të gjitha markat kryesore, duke përfshirë <strong>Mercedes</strong>, <strong>BMW</strong>, <strong>Audi</strong> dhe shumë të tjera.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Car className="h-12 w-12 text-white" />, title: "Shitja e Automjeteve", description: "Shfletoni përzgjedhjen tonë të gjerë të automjeteve të reja dhe të përdorura nga markat më të besuara, duke përfshirë një gamë të plotë të modeleve diesel dhe benzinë për çdo nevojë.", color: "bg-blue-600" },
              { icon: <Settings className="h-12 w-12 text-white" />, title: "Mirëmbajtja", description: "Mbani automjetin tuaj në gjendje optimale me shërbimet tona eksperte të mirëmbajtjes. Ekipi ynë i teknikëve të kualifikuar përdor pajisje dhe pjesë moderne për të siguruar performancën më të mirë të makinës suaj.", color: "bg-green-600" },
              { icon: <Clock className="h-12 w-12 text-white" />, title: "Financimi", description: "Opsione fleksibile financimi për ta bërë makinën tuaj të ëndrrave të përballueshme. Ne punojmë me një rrjet të gjerë partnerësh financiarë për t'ju ofruar zgjidhjen më të përshtatshme financiare.", color: "bg-purple-600" },
              { icon: <Sparkles className="h-12 w-12 text-white" />, title: "Detajimi", description: "Shërbime profesionale detajimi për ta bërë makinën tuaj të duket si e re. Ekipi ynë i specializuar përdor produkte dhe teknika të cilësisë së lartë për të rivendosur pamjen e brendshme dhe të jashtme të automjetit tuaj.", color: "bg-red-600" }
            ].map((service, index) => (
              <div 
                key={index} 
                className={`rounded-lg overflow-hidden transform transition-all duration-1000 hover:scale-105 ${isVisible['services'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
                style={{ transitionDelay: `${index * 0.15}s` }}
              >
                <div className={`${service.color} p-8 flex flex-col items-center`}>
                  <div className="mb-4">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white text-center">{service.title}</h3>
                  <p className="text-white opacity-80 text-center">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section with Improved SEO */}
      <section id="contact" className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible['contact'] ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Kontaktoni Auto Hafuzi</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Na vizitoni në ekspozitën tonë në Fushë-Kruje ose na kontaktoni përmes telefonit apo email
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Informacion Kontakti</h3>
                <address className="not-italic">
                  <p className="mb-3 flex items-start">
                    <strong className="inline-block w-24">Adresa:</strong> 
                    <span>Fushë-Kruje, E762</span>
                  </p>
                  <p className="mb-3 flex items-start">
                    <strong className="inline-block w-24">Telefon:</strong> 
                    <span>069 931 1111</span>
                  </p>
                  <p className="mb-3 flex items-start">
                    <strong className="inline-block w-24">Email:</strong> 
                    <span>info@hafuziauto.ch</span>
                  </p>
                </address>
                
                <h3 className="text-2xl font-bold mb-4 mt-8 text-gray-800">Orari i Punës</h3>
                <p className="mb-2 flex items-start">
                  <strong className="inline-block w-24">Hënë-Premte:</strong> 
                  <span>9:00 - 18:00</span>
                </p>
                <p className="mb-2 flex items-start">
                  <strong className="inline-block w-24">E Shtunë:</strong> 
                  <span>10:00 - 16:00</span>
                </p>
                <p className="mb-2 flex items-start">
                  <strong className="inline-block w-24">E Dielë:</strong> 
                  <span>Mbyllur</span>
                </p>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Na Vizitoni</h3>
                <div className="h-64 bg-gray-200 rounded-lg mb-4">
                  {/* Replace with actual map component */}
                  <div className="h-64 rounded-lg mb-4 overflow-hidden">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2990.5073550711737!2d19.708632776587684!3d41.47988367129211!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1351d3ca6f984ff9%3A0x189de1053736cdca!2sAuto%20Hafuzi!5e0!3m2!1sen!2sus!4v1711815843136!5m2!1sen!2sus" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Auto Hafuzi Location Map"
                    aria-label="Google Maps showing the location of Auto Hafuzi in Fushe-Kruje, Albania"
                  ></iframe>
                </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Ekspozita jonë ndodhet në një lokacion të lehtë për t'u arritur në Fushë-Kruje. 
                  Na vizitoni për të parë nga afër koleksionin tonë të makinave premium.
                </p>
                <button 
                  onClick={() => navigate('/contact')}
                  className="bg-blue-600 text-white hover:bg-blue-700 font-bold py-3 px-6 rounded-lg transition duration-300 w-full"
                >
                  Dërgoni një Mesazh
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add global CSS animations using a standard style element */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-10px) translateX(10px);
          }
          50% {
            transform: translateY(0) translateX(20px);
          }
          75% {
            transform: translateY(10px) translateX(10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      ` }} />

      {/* Server-side rendering enhancement - Add noscript fallback content for SEO */}
      <noscript>
        <div className="text-center p-10">
          <h1 className="text-3xl font-bold">Auto Hafuzi - Partneri juaj i besuar në përsosmërinë e automjeteve në Shqipëri</h1>
          <p className="mt-4">Që nga viti 2010, ne jemi përkushtuar ndaj sigurimit të makinave të cilësisë më të lartë për klientët tanë.</p>
          <p className="mt-4">Me një përzgjedhje të gjerë të makinave nga markat më të mira si Mercedes, BMW, Audi dhe më shumë, ne ofrojmë automjete për çdo nevojë dhe buxhet.</p>
          <p className="mt-4">Na vizitoni në ekspozitën tonë në Fushë-Kruje ose na kontaktoni në 069 931 1111.</p>
          <p className="mt-4">Ju lutemi aktivizoni JavaScript për të parë faqen tonë me të gjitha funksionalitetet.</p>
        </div>
      </noscript>
    </div>
  );
};

export default AboutPage;