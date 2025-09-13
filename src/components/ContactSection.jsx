import { Mail, Linkedin, Github, Instagram } from "lucide-react";

export const ContactSection = () => {
  return (
    <section id="contact" className="py-24 px-4 relative bg-secondary/30">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Get In
          <span className="text-primary">
            {" "}
            Touch
          </span>
        </h2>
        <div className="mt-6 space-y-1 text-center">
          <a
            href="mailto:chen.joe@northeastern.edu"
            className="inline-flex items-center justify-center gap-2 text-md font-medium hover:underline"
          >
            <Mail className="h-5 w-5" />
            <span>
                chen.joe@northeastern.edu
            </span>
          </a>
          <div className="pt-2 flex items-center justify-center gap-5 text-foreground/80">
            <a
              href="https://www.linkedin.com/in/joe-chen-30b568241/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-primary transition-colors"
            >
              <Linkedin className="h-6 w-6" />
            </a>
            <a
              href="https://github.com/joeechenn"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="hover:text-primary transition-colors"
            >
              <Github className="h-6 w-6" />
            </a>
            <a
              href="https://www.instagram.com/jeoooeo/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-primary transition-colors"
            >
              <Instagram className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};