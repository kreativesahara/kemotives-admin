import React, { useMemo } from 'react'
import headerImage from '../assets/herogwagon.svg'
import { Link } from 'react-router-dom'
import { lazy, Suspense, useState, useEffect } from 'react'

// Lazy load the carousel component
const LazyCarousel = lazy(() => import('react-responsive-carousel').then(module => ({
  default: module.Carousel
})))

// Lazy load the carousel styles
import("react-responsive-carousel/lib/styles/carousel.min.css")

function header() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Memoize carousel items to prevent unnecessary re-renders
  const carouselItems = useMemo(() => [
    {
      image: headerImage,
      title: "Kenya's #1 Car Marketplace",
      subtitle: "Thousands of inspected vehicles from trusted sellers across Kenya",
      cta: "Browse Vehicles",
      ctaLink: "/vehicles",
      ctaVariant: "secondary",
      microCopy: "Cars, SUVs, Trucks"
    },
    {
      image: headerImage,
      title: "Premium Accessories & Spares",
      subtitle: "Quality parts and accessories for all your automotive needs",
      cta: "Browse Accessories",
      ctaLink: "/accessories",
      ctaVariant: "secondary",
      microCopy: "Tyres, rims, parts"
    },
    {
      image: headerImage,
      title: "Sell Your Car Fast & Easy",
      subtitle: "Quick, safe, and hassle-free selling process. Get the best price!",
      cta: "Start Selling",
      ctaLink: "/pricing",
      ctaVariant: "dark",
      microCopy: "List your car in minutes"
    }
  ], []);

  return (
    <>
      <div className='flex flex-col max-w-[2000px] mx-auto'>
        <div className="relative -mx-2 sm:-mx-3 md:mx-0">
          <Suspense fallback={
            <div className="w-full h-[300px] md:h-[500px] bg-gray-200 md:rounded-b-xl flex items-center justify-center">
              <p className="text-gray-500">Loading carousel...</p>
            </div>
          }>
            <LazyCarousel
              showArrows={!isMobile}
              showIndicators={!isMobile}
              showThumbs={false}
              infiniteLoop={true}
              autoPlay={true}
              interval={5000}
              showStatus={false}
              className="overflow-hidden md:rounded-b-xl bg-white"
              swipeable={true}
              dynamicHeight={false}
              emulateTouch={true}
            >
              {carouselItems.map((item, index) => (
                <div key={index} className="relative">
                  <img
                    title={item.title}
                    src={item.image}
                    alt={item.title}
                    className="w-full object-fill min-w-[300px] min-h-[45vh] md:min-h-0 max-h-[500px]"
                    loading={index === 0 ? "eager" : "lazy"}
                    width="1200"
                    height="600"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/50 to-black/40 flex flex-col justify-center items-center text-white p-4 md:px-8 py-8 md:pt-8 md:pb-14 pt-16">
                    <h2 className="text-2xl md:text-5xl font-bold mb-1 text-center max-w-4xl">
                      {item.title}
                    </h2>
                    <p className="text-base md:text-xl mb-28 md:mb-[4rem] text-center max-w-2xl text-gray-100">
                      {item.subtitle}
                    </p>
                    <div className="flex flex-col items-center">
                      <Link
                        to={item.ctaLink}
                        className={`font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-base md:text-lg
                          ${item.ctaVariant === 'secondary'
                            ? 'bg-transparent border-2 border-white hover:bg-white/20'
                            : item.ctaVariant === 'dark'
                              ? 'bg-[#1a1a1a] hover:bg-black'
                              : 'bg-[#3DC2EC] hover:bg-[#2BA1C9]'
                          } text-white`}
                      >
                        {item.cta}
                      </Link>
                      {item.microCopy && (
                        <span className="text-sm md:text-base mt-2 text-gray-200 font-medium tracking-wide">
                          {item.microCopy}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </LazyCarousel>
          </Suspense>
          {/* CTA Buttons removed - now in carousel overlay for better UX */}
        </div>

        <section className="items-center md:py-6 py-4 text-center min-w-[300px]">
          <h1 className="font-bold md:text-4xl text-xl ">
            The easy way to find a Car.
            <br />
            <span className='text-gray-700'>Quickest and Most Convenient</span>
          </h1>
          <p className='text-xl md:text-4xl py-2 md:py-4 font md:font-bold'>
            Find us in Kenya, Nairobi!
          </p>
        </section>
      </div>
    </>
  )
}

export default header