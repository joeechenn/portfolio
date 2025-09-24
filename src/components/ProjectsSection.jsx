import { ExternalLink } from "lucide-react";
import { Github } from "lucide-react";

const projects = [
    {
        id: 1,
        title: "Resona",
        description: "A music analytics and social discovery app. Rate, rank, and rediscover music.",
        image: "projects/resonacover.jpg",
        url: "https://joeechenn.github.io/resona/",
        github: "https://github.com/joeechenn/resona"
    },
    {
        id: 2,
        title: "Local Assistant",
        description: "An offline AI assistant project with speech and vision. Aiming to interact with the computer and handle advanced commands like a real assistant.",
        image: "projects/localassistant.png",
        url: "",
        github: "https://github.com/joeechenn/local-assistant"
    }
]
export const ProjectsSection = () => {
    return <section id="projects" className="py-24 px-4 relative">
        <div className="container mx-auto max-w-5xl"> 
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
                Featured Projects
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                Here are some projects I'm currently working on.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project, key) => (
                    <div
                    key={key}
                    className="group bg-muted/10 hover:bg-muted/20 rounded-xl overflow-hidden shadow-md transition-all duration-300 flex flex-col"
                    >
                        <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        </div>
                        <div className="bg-muted-foreground/15 p-5 flex-1 flex flex-col">
                        <h3 className="text-lg font-semibold mb-2 text-foreground">
                            {project.title}
                        </h3>
                        <p className="text-foreground text-sm mb-4 leading-relaxed flex-1">
                            {project.description}
                        </p>
                        <div className="flex space-x-4">
                            {project.url && (
                                <a
                                href={project.url}
                                className="text-foreground/70 hover:text-primary transition-colors duration-300"
                                >
                                    <ExternalLink size={20} />
                                </a>
                            )}
                            {project.github && (
                                <a
                                href={project.github}
                                target="_blank"
                                className="text-foreground/70 hover:text-primary transition-colors duration-300"
                                >
                                    <Github size={20} />
                                </a>
                            )}
                            </div>
                        </div>
                        </div>
                    ))}
            </div>
        </div>
    </section>
}