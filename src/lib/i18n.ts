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
        'nav.now': 'Now',
        'nav.uses': 'Uses',
        'nav.back_to_blog': 'Volver al Blog',
        'nav.share': 'Compartir',

        // Pages
        'page.last_updated': 'Actualizado el {date}',
        'page.back_home': '← Inicio',
        'page.about.title': 'Sobre mí',
        'page.about.description': 'Bio extendida, intereses y experiencia profesional de Edsel Serrano.',
        'page.now.title': 'Lo que estoy haciendo ahora',
        'page.now.description': 'Un vistazo en tiempo real a en qué está trabajando y aprendiendo Edsel.',
        'page.uses.title': 'Uses',
        'page.uses.description': 'Hardware, software y herramientas que Edsel usa día a día.',

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

        // Language
        'language.spanish': 'Español',
        'language.english': 'English',
        'language.switch_to': 'Cambiar a {language}',
    },
    en: {
        // Navigation
        'nav.home': 'Home',
        'nav.projects': 'Projects',
        'nav.blog': 'Blog',
        'nav.about': 'About',
        'nav.now': 'Now',
        'nav.uses': 'Uses',
        'nav.back_to_blog': 'Back to Blog',
        'nav.share': 'Share',

        // Pages
        'page.last_updated': 'Updated {date}',
        'page.back_home': '← Home',
        'page.about.title': 'About',
        'page.about.description': 'Long-form bio, interests, and professional experience of Edsel Serrano.',
        'page.now.title': 'What I am up to now',
        'page.now.description': 'A real-time look at what Edsel is working on and learning.',
        'page.uses.title': 'Uses',
        'page.uses.description': 'Hardware, software, and tools Edsel uses day-to-day.',

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

        // Language
        'language.spanish': 'Español',
        'language.english': 'English',
        'language.switch_to': 'Switch to {language}',
    }
} as const;

export type TranslationKey = keyof typeof translations.es;

// Get translation function
export function t(key: TranslationKey, params?: Record<string, string>, lang: Language = defaultLanguage): string {
    const translation = translations[lang]?.[key] || translations[defaultLanguage][key] || key;

    if (!params) return translation;

    return Object.entries(params).reduce((text, [param, value]) => {
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
