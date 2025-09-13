import {Navbar} from "../components/Navbar";
import {HomeSection} from "../components/HomeSection";
import {AboutSection} from "../components/AboutSection";
import {ContactSection} from "../components/ContactSection";
import {Footer} from "../components/Footer";

export const Home = () => {
    return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <Navbar />
        <main>
            <HomeSection />
            <AboutSection />
            <ContactSection />
        </main>
        <Footer />
    </div>
    );
}