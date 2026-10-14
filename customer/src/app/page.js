import Button from "./components/ui/Button";
import SectionHeading from "./components/ui/SectionHeading";
import HeroSection from "./components/home/HeroSection"
import BenefitsSection from "./components/home/BenefitsSection";
import ShopByCategory from "./components/home/ShopByCategory";
import PopularProducts from "./components/home/PopularProducts";
import ServicesSection from "./components/home/ServicesSection";

export default function Home() {
  return <>
    <HeroSection />
    <BenefitsSection />
    <ShopByCategory />
    <PopularProducts />
    <ServicesSection /> 
  </>;
}