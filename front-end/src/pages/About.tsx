import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Award, Car, Clock, Settings, Sparkles, Map, Phone, Mail, Shield } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const AboutPage = () => {
  const [companyDescription, setCompanyDescription] = useState('I shtyrë nga pasioni, i përkushtuar ndaj cilësisë. Ne kemi ndihmuar klientët të gjejnë automjetin e tyre të përsosur që nga viti 2010.');
  const [isLoading, setIsLoading] = useState(false);
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

    // Set all sections to visible immediately for now
    // We'll keep this commented code for when you want to re-enable scroll animations
    /*
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    }, observerOptions);

    // Observe all sections with animation
    setTimeout(() => {
      const sections = document.querySelectorAll('.animate-on-scroll');
      sections.forEach(section => {
        if (section) observer.observe(section);
      });
    }, 500);

    return () => {
      const sections = document.querySelectorAll('.animate-on-scroll');
      sections.forEach(section => {
        if (section) observer.unobserve(section);
      });
    };
    */
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const handleDiscoverClick = () => {
    navigate('/cars');
  };

  return (
    <div className="overflow-hidden">
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
            Me një përzgjedhje të gjerë të makinave nga markat më të mira si Mercedes, BMW, Audi dhe më shumë,
            ne ofrojmë një përzgjedhje të pasur të automjeteve diesel dhe benzinë për çdo nevojë dhe buxhet.
          </p>
          <button 
            onClick={handleDiscoverClick}
            className="bg-white text-blue-600 hover:bg-blue-100 font-bold py-3 px-8 rounded-full transition duration-300 animate-fade-in-up" 
            style={{animationDelay: '0.4s'}}
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

      {/* Our History Timeline */}
      <section id="history" className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible['history'] ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Rrugëtimi Ynë</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nga fillime të thjeshta deri në bërjen një emër të besuar në industrinë e automobilave në Shqipëri
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

      {/* Our Services with Animated Cards */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible['services'] ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Shërbimet Tona</h2>
            <div className="w-24 h-1 bg-green-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Zgjidhje gjithëpërfshirëse automobilistike të përshtatura për nevojat tuaja
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">
              Ne kuptojmë se blerja e një makine është një vendim i rëndësishëm. Prandaj, ofrojmë një gamë të gjerë shërbimesh për t'ju ndihmuar në çdo hap të rrugës, nga gjetja e makinës së përsosur deri te mirëmbajtja e saj për vitet në vijim. Ekspertiza jonë shtrihet në të gjitha markat kryesore, duke përfshirë Mercedes, BMW, Audi dhe shumë të tjera.
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

      {/* Testimonials with Moving Background */}
      <section id="testimonials" className="relative py-20">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('/api/placeholder/1920/1080')",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-80"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible['testimonials'] ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
            <h2 className="text-4xl font-bold mb-6 text-white">Çfarë Thonë Klientët Tanë</h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
            <p className="text-xl text-white max-w-3xl mx-auto">
              Dëgjoni direkt nga klientët tanë të kënaqur për përvojat e tyre me Auto Hafuzi. Këto histori të vërteta pasqyrojnë angazhimin tonë për ekselencë dhe kënaqësi të klientit.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Ahmed Kovačević", role: "Pronar Biznesi", quote: "Auto Hafuzi ofroi shërbim të jashtëzakonshëm gjatë gjithë udhëtimit tim të blerjes së makinës. Ekipi i tyre ishte i ditur dhe i durueshëm në ndihmën për të gjetur automjetin e përkryer për nevojat e mia. Mercedes-i im i ri diesel tejkalon të gjitha pritshmëritë e mia." },
              { name: "Maja Popović", role: "Inxhiniere Softueri", quote: "Kam mirëmbajtur makinën time në Auto Hafuzi për vite me radhë. Vëmendja e tyre ndaj detajeve dhe ekspertiza teknike e ka mbajtur automjetin tim në funksion perfekt. Çdo herë që kam nevojë për servis për BMW-në time, e di se ku të shkoj." },
              { name: "Emir Hodžić", role: "Doktor", quote: "Opsionet e financimit të ofruara nga Auto Hafuzi e bënë të mundur për mua të blej makinën e ëndrrave të mia. Procesi ishte i thjeshtë dhe transparent. Ekipi m'u përgjigj me durim të gjitha pyetjeve dhe më ndihmoi të zgjedh një Audi A6 të shkëlqyer me benzinë që i përshtatet nevojave të mia." }
            ].map((testimonial, index) => (
              <div 
                key={index} 
                className={`bg-white p-8 rounded-lg shadow-lg transition-all duration-1000 ${isVisible['testimonials'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
                style={{ transitionDelay: `${index * 0.2}s` }}
              >
                <div className="mb-6">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-2xl">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-4">
                    <span className="text-gray-600 font-bold">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible['why-us'] ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Pse të Zgjidhni Auto Hafuzi</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ne dallojmë veten përmes përkushtimit ndaj përsosmërisë në çdo aspekt
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">
              Auto Hafuzi është bërë sinonim i cilësisë dhe besueshmërisë në industrinë e automjeteve në Shqipëri. Klientët na zgjedhin jo vetëm për përzgjedhjen tonë të automjeteve diesel dhe benzinë nga markat më të besuara, por edhe për vlerat tona thelbësore që udhëheqin çdo aspekt të biznesit tonë.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Shield className="h-10 w-10 text-blue-600" />, title: "Mbrojtje me Garanci", description: "Të gjitha automjetet tona vijnë me opsione gjithëpërfshirëse garancie për qetësinë tuaj. Ne besojmë në cilësinë e produkteve tona dhe jemi të gatshëm të qëndrojmë pas çdo makine që shesim." },
              { icon: <Award className="h-10 w-10 text-blue-600" />, title: "Certifikuar për Cilësi", description: "Çdo automjet i nënshtrohet një inspektimi rigoroz 150-pikësh përpara se t'i bashkohet inventarit tonë. Ne kontrollojmë çdo aspekt të automjetit, nga performanca mekanike deri te kushtet estetike." },
              { icon: <Users className="h-10 w-10 text-blue-600" />, title: "Staf me Përvojë", description: "Ekipi ynë sjell dekada ekspertize automobilistike për t'ju shërbyer më mirë. Specialistët tanë janë të trajnuar në modelet më të fundit dhe teknologjitë e markave kryesore si Mercedes, BMW dhe Audi." },
              { icon: <Settings className="h-10 w-10 text-blue-600" />, title: "Shërbim i Plotë", description: "Nga blerja tek mirëmbajtja, ne ofrojmë zgjidhje automobilistike të plota. Qendra jonë e shërbimit mund të përmbushë të gjitha nevojat e mirëmbajtjes dhe riparimit të automjetit tuaj në një vend të vetëm." },
              { icon: <Sparkles className="h-10 w-10 text-blue-600" />, title: "Çmime Transparente", description: "Pa tarifa të fshehura apo surpriza - vetëm çmime të ndershme dhe të drejtpërdrejta. Ne besojmë në transparencë të plotë dhe sigurohemi që të kuptoni saktësisht se për çfarë po paguani." },
              { icon: <Clock className="h-10 w-10 text-blue-600" />, title: "Financim Fleksibël", description: "Zgjidhje financiare të përshtatura që funksionojnë me buxhetin dhe rrethanat tuaja. Partnerët tanë financiarë ofrojnë një gamë opsionesh për t'ju ndihmuar të zotëroni makinën e ëndrrave tuaja." }
            ].map((item, index) => (
              <div 
                key={index} 
                className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600 flex transition-all duration-1000 hover:shadow-lg ${isVisible['why-us'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div className="mr-4 mt-1">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section id="contact" className="py-20 bg-blue-900">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible['contact'] ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
            <h2 className="text-4xl font-bold mb-6 text-white">Na Kontaktoni</h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Vizitoni sallonin tonë ose kontaktoni me ne drejtpërdrejt për të eksploruar koleksionin tonë të Mercedes, BMW, Audi dhe markave të tjera të njohura
            </p>
            <p className="text-lg text-blue-100 max-w-3xl mx-auto mt-4">
              Ekipi ynë është gjithmonë i gatshëm t'ju ndihmojë me pyetje rreth modeleve specifike, opsioneve të financimit, apo shërbimit të makinave diesel dhe benzinë. Ne kuptojmë se çdo klient është unik dhe përpiqemi të ofrojmë një përvojë të personalizuar që përputhet me nevojat tuaja specifike.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Map className="h-12 w-12 text-yellow-400" />, title: "Vendndodhja Jonë", description: "Fushë-Kruje, Albania, E762, Fushë Krujë", color: "bg-blue-800" },
              { icon: <Phone className="h-12 w-12 text-yellow-400" />, title: "Numri i Telefonit", description: "069 931 1111", color: "bg-blue-800" },
              { icon: <Mail className="h-12 w-12 text-yellow-400" />, title: "Adresa Email", description: "info@hafuziauto.ch", color: "bg-blue-800" }
            ].map((contact, index) => (
              <div 
                key={index} 
                className={`${contact.color} p-8 rounded-lg transition-all duration-1000 ${isVisible['contact'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
                style={{ transitionDelay: `${index * 0.2}s` }}
              >
                <div className="flex justify-center mb-4">
                  {contact.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white text-center">{contact.title}</h3>
                <p className="text-blue-100 text-center">{contact.description}</p>
              </div>
            ))}
          </div>

          <div className={`mt-16 text-center transition-all duration-1000 ${isVisible['contact'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.6s' }}>
            <button 
              onClick={() => navigate('/contact')}
              className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 px-8 rounded-full transition duration-300"
            >
              Na Kontaktoni Sot
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced Business Philosophy Section - NEW */}
      <section id="philosophy" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Filozofia Jonë e Biznesit</h2>
            <div className="w-24 h-1 bg-green-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Në thelb të biznesit tonë qëndrojnë disa vlera thelbësore që udhëheqin çdo vendim dhe ndërveprim
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-gray-50 p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Misioni Ynë</h3>
              <p className="text-gray-600 mb-4">
                Misioni ynë është të transformojmë përvojën e blerjes së makinës në Shqipëri duke ofruar automjete të cilësisë më të lartë, shërbim të jashtëzakonshëm ndaj klientit dhe zgjidhje gjithëpërfshirëse automobilistike.
              </p>
              <p className="text-gray-600">
                Ne synojmë të krijojmë marrëdhënie afatgjata me klientët tanë duke tejkaluar pritshmëritë e tyre dhe duke u kujdesur për automjetet e tyre gjatë gjithë ciklit të jetës. Qëllimi ynë është që çdo klient të largohet jo vetëm me makinën e përsosur, por edhe me një përvojë të paharrueshme.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Vizioni Ynë</h3>
              <p className="text-gray-600 mb-4">
                Ne aspirojmë të bëhemi partneri më i besuar i automjeteve në Shqipëri, i njohur për integritetin, cilësinë dhe shërbimin tonë të jashtëzakonshëm. 
              </p>
              <p className="text-gray-600">
                Vizioni ynë është të vendosim një standard të ri në industrinë e automjeteve shqiptare, duke ofruar një përvojë të personalizuar dhe transparente që transformon përvceptimin e klientëve për blerjen e makinave. Ne synojmë të jemi pionierë në adoptimin e teknologjive të reja dhe praktikave të qëndrueshme që përfitojnë si klientët tanë ashtu edhe mjedisin.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Më shumë se shitës makinash, ne jemi këshilltarë të besuar që punojmë për të kuptuar nevojat tuaja unike dhe për të gjetur zgjidhjen më të mirë për ju. Kjo filozofi e thjeshtë por e fuqishme ka qenë themeli i suksesit tonë dhe do të vazhdojë të drejtojë rritjen tonë në vitet e ardhshme.
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Inventory Highlights Section - NEW */}
      <section id="inventory-highlights" className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Koleksioni Ynë</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Eksploroni disa nga markat dhe modelet më të kërkuara në inventarin tonë
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                brand: "Mercedes-Benz",
                description: "Nga sedanët elegantë C-Class dhe E-Class deri te SUV-të luksoze GLC dhe GLE, koleksioni ynë Mercedes ofron performancë gjermane dhe cilësi të padiskutueshme.",
                popular: "Modelet më të popullarizuara: C220d, E350, GLC 300"
              },
              {
                brand: "BMW",
                description: "Përjetoni 'Kënaqësinë e Drejtimit të Makinës' me gamën tonë të zgjedhur të modeleve BMW, duke përfshirë serinë 3, serinë 5 dhe X-series SUV-të e njohura.",
                popular: "Modelet më të popullarizuara: 320d, 520d, X5"
              },
              {
                brand: "Audi",
                description: "Kombinimi perfekt i teknologjisë, performancës dhe dizajnit, koleksioni ynë Audi përfshin modelet A4, A6 dhe SUV-të Q5, me teknologji dhe komoditet të shkëlqyer.",
                popular: "Modelet më të popullarizuara: A4 TDI, A6 TFSI, Q5"
              },
              {
                brand: "Marka të Tjera",
                description: "Përzgjedhja jonë shtrihet përtej markave gjermane, duke përfshirë automjete të cilësisë së lartë nga Volkswagen, Toyota, Ford dhe shumë të tjera për të përmbushur çdo nevojë.",
                popular: "Modelet më të popullarizuara: VW Golf, Toyota RAV4, Ford Focus"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-3 text-gray-800">{item.brand}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <p className="text-sm text-blue-600 font-medium">{item.popular}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button 
              onClick={() => navigate('/cars')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition duration-300"
            >
              Shiko Koleksionin e Plotë
            </button>
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
    </div>
  );
};

export default AboutPage;