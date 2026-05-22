export type Language = 'es' | 'en';

export const languages: Language[] = ['es', 'en'];

export const defaultLanguage: Language = 'es';

export interface I18nConfig {
    language: Language;
    fallbackLanguage: Language;
}

// Translation keys and values
export const translations = {
    es: {
        // Navigation
        'nav.home': 'Inicio',
        'nav.projects': 'Proyectos',
        'nav.blog': 'Blog',
        'nav.about': 'Sobre mí',
        'nav.back_to_blog': 'Volver al Blog',
        'nav.share': 'Compartir',

        // Pages
        'page.last_updated': 'Actualizado el {date}',
        'page.back_home': '← Inicio',
        'page.about.title': 'Sobre mí',
        'page.about.description': 'Bio extendida, intereses y experiencia profesional de Edsel Serrano.',

        // Blog Index
        'blog.title': 'Blog',
        'blog.welcome_title': 'Bienvenido a Mi',
        'blog.welcome_subtitle': 'Blog',
        'blog.welcome_description': 'Explorando desarrollo web, insights tecnológicos y proyectos creativos. Únete a mí en este viaje de aprendizaje continuo e innovación.',
        'blog.articles_count': 'Artículos',
        'blog.regular_updates': 'Actualizaciones Regulares',
        'blog.latest_articles': 'Últimos Artículos',
        'blog.no_articles_title': 'Aún no hay artículos',
        'blog.no_articles_description': '¡Vuelve pronto para ver nuevo contenido!',
        'blog.stay_updated': 'Mantente Actualizado',
        'blog.stay_updated_description': 'Sígueme en mi viaje mientras exploro nuevas tecnologías, comparto insights y construyo proyectos emocionantes.',
        'blog.follow_github': 'Seguir en GitHub',
        'blog.get_in_touch': 'Contactar',

        // Post Details
        'post.by_author': 'Por {author}',
        'post.min_read': 'min de lectura',
        'post.check_it_out': '🚀 Échale un vistazo',
        'post.visit_project': 'Visita el proyecto en vivo para verlo en acción:',
        'post.visit_button': 'Visitar {title}',
        'post.technologies_used': 'Tecnologías Utilizadas',
        'post.more_projects': 'Más Proyectos',
        'post.more_projects_description': 'Echa un vistazo a estos otros proyectos',
        'post.read_article': 'Leer artículo: {title}',
        'post.back_to_top': 'Volver arriba',
        'post.share_article': 'Compartir artículo',

        // Post Card
        'card.project': 'Proyecto',
        'card.read_more': 'Leer más',

        // Meta
        'meta.blog_description': 'Un blog sobre desarrollo web, javascript, typescript, react, vue, svelte, astro, nextjs, gatsby y más',
        'meta.blog_title': 'Blog de Edsel',

        // Categories
        'category.project_showcase': 'Showcase de Proyecto',
        'category.article': 'Artículo',

        // Projects index
        'projects.title': 'Proyectos',
        'projects.welcome_title': 'Mis',
        'projects.welcome_subtitle': 'Proyectos',
        'projects.welcome_description': 'Una colección de cosas que he construido — apps, herramientas, experimentos. Cada proyecto es bilingüe; cámbialo desde el selector arriba.',
        'projects.count': 'Proyectos',
        'projects.latest': 'Últimos proyectos',
        'projects.empty_title': 'Sin proyectos todavía',
        'projects.empty_description': 'Pronto habrá cosas que mirar.',
        'projects.visit_external': 'Visitar proyecto',
        'projects.related': 'Proyectos relacionados',

        // Posts (articles) — distinct from projects
        'posts.empty_title': 'Todavía no hay artículos',
        'posts.empty_description': 'Pronto publicaré ensayos y notas técnicas aquí.',
        'posts.related': 'Artículos relacionados',
        'posts.toc_title': 'En esta página',
        'posts.share_label': 'Compartir',
        'posts.share_copied': '¡Enlace copiado!',
        'posts.reading_time': '{minutes} min de lectura',

        // Tags
        'tags.title': 'Etiquetas',
        'tags.heading_for': 'Etiquetados con "{tag}"',
        'tags.posts_section': 'Artículos',
        'tags.projects_section': 'Proyectos',
        'tags.empty': 'No hay nada bajo esta etiqueta todavía.',
        'tags.back_to_all': 'Ver todas las etiquetas',

        // Cards (additions)
        'card.read_post': 'Leer artículo',

        // Language
        'language.spanish': 'Español',
        'language.english': 'English',
        'language.switch_to': 'Cambiar a {language}',

        // Homepage — Hero
        'home.hero.eyebrow': 'Software engineer · México',
        'home.hero.title': 'Edsel Serrano',
        'home.hero.subtitle': 'Software Engineer  •  Entrepreneur of Technology  •  Machine learning lover  •  Agentic Engineer',
        'home.hero.cta.projects': 'Ver proyectos',
        'home.hero.cta.posts': 'Leer notas',

        // Homepage — Featured work
        'home.featured.eyebrow': 'Trabajo reciente',
        'home.featured.title': 'Cosas que he construido',
        'home.featured.view_all': 'Ver todos',

        // Homepage — Latest posts
        'home.posts.eyebrow': 'Notas',
        'home.posts.title': 'Últimas notas',
        'home.posts.view_all': 'Ver blog',
        'home.posts.empty': 'Próximamente notas — sigue el RSS.',
    },
    en: {
        // Navigation
        'nav.home': 'Home',
        'nav.projects': 'Projects',
        'nav.blog': 'Blog',
        'nav.about': 'About',
        'nav.back_to_blog': 'Back to Blog',
        'nav.share': 'Share',

        // Pages
        'page.last_updated': 'Updated {date}',
        'page.back_home': '← Home',
        'page.about.title': 'About',
        'page.about.description': 'Long-form bio, interests, and professional experience of Edsel Serrano.',

        // Blog Index
        'blog.title': 'Blog',
        'blog.welcome_title': 'Welcome to My',
        'blog.welcome_subtitle': 'Blog',
        'blog.welcome_description': 'Exploring web development, technology insights, and creative projects. Join me on this journey of continuous learning and innovation.',
        'blog.articles_count': 'Articles',
        'blog.regular_updates': 'Regular Updates',
        'blog.latest_articles': 'Latest Articles',
        'blog.no_articles_title': 'No articles yet',
        'blog.no_articles_description': 'Check back soon for new content!',
        'blog.stay_updated': 'Stay Updated',
        'blog.stay_updated_description': 'Follow my journey as I explore new technologies, share insights, and build exciting projects.',
        'blog.follow_github': 'Follow on GitHub',
        'blog.get_in_touch': 'Get in Touch',

        // Post Details
        'post.by_author': 'By {author}',
        'post.min_read': 'min read',
        'post.check_it_out': '🚀 Check it out',
        'post.visit_project': 'Visit the live project to see it in action:',
        'post.visit_button': 'Visit {title}',
        'post.technologies_used': 'Technologies Used',
        'post.more_projects': 'More Projects',
        'post.more_projects_description': 'Check out these other projects',
        'post.read_article': 'Read article: {title}',
        'post.back_to_top': 'Back to top',
        'post.share_article': 'Share article',

        // Post Card
        'card.project': 'Project',
        'card.read_more': 'Read more',

        // Meta
        'meta.blog_description': 'A blog about web development, javascript, typescript, react, vue, svelte, astro, nextjs, gatsby, and more',
        'meta.blog_title': 'Edsel\'s Blog',

        // Categories
        'category.project_showcase': 'Project Showcase',
        'category.article': 'Article',

        // Projects index
        'projects.title': 'Projects',
        'projects.welcome_title': 'My',
        'projects.welcome_subtitle': 'Projects',
        'projects.welcome_description': 'A collection of things I have built — apps, tools, experiments. Each project is bilingual; switch from the toggle above.',
        'projects.count': 'Projects',
        'projects.latest': 'Latest projects',
        'projects.empty_title': 'No projects yet',
        'projects.empty_description': 'New work will land here soon.',
        'projects.visit_external': 'Visit project',
        'projects.related': 'Related projects',

        // Posts (articles) — distinct from projects
        'posts.empty_title': 'No articles yet',
        'posts.empty_description': 'Long-form writing will land here soon.',
        'posts.related': 'Related articles',
        'posts.toc_title': 'On this page',
        'posts.share_label': 'Share',
        'posts.share_copied': 'Link copied!',
        'posts.reading_time': '{minutes} min read',

        // Tags
        'tags.title': 'Tags',
        'tags.heading_for': 'Tagged with "{tag}"',
        'tags.posts_section': 'Articles',
        'tags.projects_section': 'Projects',
        'tags.empty': 'Nothing tagged like this yet.',
        'tags.back_to_all': 'See all tags',

        // Cards (additions)
        'card.read_post': 'Read article',

        // Language
        'language.spanish': 'Español',
        'language.english': 'English',
        'language.switch_to': 'Switch to {language}',

        // Homepage — Hero
        'home.hero.eyebrow': 'Software engineer · Mexico',
        'home.hero.title': 'Edsel Serrano',
        'home.hero.subtitle': 'Software Engineer  •  Entrepreneur of Technology  •  Machine learning lover  •  Agentic Engineer',
        'home.hero.cta.projects': 'See projects',
        'home.hero.cta.posts': 'Read notes',

        // Homepage — Featured work
        'home.featured.eyebrow': 'Recent work',
        'home.featured.title': 'Things I have built',
        'home.featured.view_all': 'See all',

        // Homepage — Latest posts
        'home.posts.eyebrow': 'Notes',
        'home.posts.title': 'Latest notes',
        'home.posts.view_all': 'Go to blog',
        'home.posts.empty': 'Notes coming soon — follow the RSS.',
    }
} as const;

export type TranslationKey = keyof typeof translations.es;

// Get translation function
export function t(key: TranslationKey, params?: Record<string, string>, lang: Language = defaultLanguage): string {
    // Casting to `string` widens the literal union from the const translations
    // map so the subsequent `.reduce(...)` accumulator types check cleanly.
    const translation: string = translations[lang]?.[key] || translations[defaultLanguage][key] || key;

    if (!params) return translation;

    return Object.entries(params).reduce<string>((text, [param, value]) => {
        return text.replace(new RegExp(`{${param}}`, 'g'), value);
    }, translation);
}

// Language detection utilities
export function getLanguageFromUrl(url: string): Language {
    const segments = url.split('/').filter(Boolean);
    const possibleLang = segments[0] as Language;
    return languages.includes(possibleLang) ? possibleLang : defaultLanguage;
}

export function removeLanguageFromUrl(url: string): string {
    const segments = url.split('/').filter(Boolean);
    if (languages.includes(segments[0] as Language)) {
        segments.shift();
    }
    return '/' + segments.join('/');
}

export function addLanguageToUrl(url: string, lang: Language): string {
    if (lang === defaultLanguage) return url;
    const cleanUrl = removeLanguageFromUrl(url);
    return `/${lang}${cleanUrl}`;
}

// Get opposite language
export function getOppositeLanguage(lang: Language): Language {
    return lang === 'es' ? 'en' : 'es';
}

// Format date based on language
export function formatDate(date: string, lang: Language): string {
    const dateObj = new Date(date);
    const locale = lang === 'es' ? 'es-ES' : 'en-US';

    return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function formatDateShort(date: string, lang: Language): string {
    const dateObj = new Date(date);
    const locale = lang === 'es' ? 'es-ES' : 'en-US';

    return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
