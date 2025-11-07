import headshot from "./headshot.jpg";
import friendshot from "./friendshot.jpg";

export const AboutSection = () => {
    return <section id="about" className="py-24 px-4 relative">
        <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
                About Me
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col items-center justify-center space-y-2">
                    <img src={headshot} alt="Headshot" className="w-64 rounded-sm" />
                    <img src={friendshot} alt="Friendshot" className="w-64 rounded-sm" />
                    </div>
                <div className="space-y-4 text-center">
                    <p className="text-foreground">
                        My name is Joe and I'm currently studying CS, with a minor in Math and concentration in AI
                        at Northeastern University. I'm interested in developing intelligent, multifunctional agents that can learn and interact with
                        real world.
                    </p>

                    <p className="text-xs text-muted-foreground">
                        like the Androids in <em>Detroit: Become Human</em> (one of my favorite games)
                    </p>
                    <p className="text-foreground">
                        I love playing games and watching gameplay like <em>Detroit: Become Human</em>, <em>Equilinox</em> and <em>Pokémon Black and Pokémon White</em>. 
                        I enjoy both listening and talking about music and clothes/fashion. Here are some songs I've been listening to:
                    </p>
                    <div className="space-y-4">
                        <iframe 
                        data-testid="embed-iframe" 
                        style={{ borderRadius: 12 }}
                        src="https://open.spotify.com/embed/track/5k8LB57xOq8UUNVaKWSqrf?utm_source=generator" 
                        width="100%" 
                        height="80" 
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                        loading="lazy"
                        allowFullScreen
                        title="Spotify player">
                        </iframe>

                        <iframe 
                        data-testid="embed-iframe"
                         style={{ borderRadius: 12 }} 
                         src="https://open.spotify.com/embed/track/0T3pyPYtHAsxIRymAZsTkX?utm_source=generator" 
                         width="100%" 
                         height="80" 
                         allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                         loading="lazy"
                         allowFullScreen
                         title="Spotify player">
                        </iframe>

                        <iframe data-testid="embed-iframe" 
                         style={{ borderRadius: 12 }} 
                         src="https://open.spotify.com/embed/track/0AHJWgA2mLYz2iFVwbCeod?utm_source=generator" 
                         width="100%" 
                         height="80" 
                         allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                         loading="lazy"
                         allowFullScreen
                         title="Spotify player">
                         </iframe>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                        <a href="#contact" className="button">
                            Get In Touch
                        </a>
                        <a
                        href="Joe_Chen_Resume.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary/10 transition-colors duration-300"
                        >
                            Resume
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>;
}