import { colors } from "./colors";
import type { Language } from "./i18n";

export interface PostContent {
  title: string;
  description: string;
  content: string;
  content_p2: string;
}

export interface Post {
  id: string;
  color: (typeof colors)[keyof typeof colors];
  cover: string;
  author: string;
  link: string;
  date: string;
  content: Record<Language, PostContent>;
}

export const posts: Post[] = [
  {
    id: "1",
    color: colors.teal,
    cover: "/potato.webp",
    author: "Edsel Serrano",
    link: "https://potato-daily.pretxel.deno.net/",
    date: "2023-01-01",
    content: {
      es: {
        title: "Daily Potato",
        description: "Herramienta innovadora para Daily Scrum remotas con participación aleatoria y métricas de productividad del equipo",
        content: "Daily Potato es una herramienta innovadora diseñada para facilitar las Daily Scrum de manera remota y efectiva. La aplicación genera automáticamente el orden de participación de manera aleatoria, eliminando la monotonía de las reuniones diarias y asegurando que todos los miembros del equipo tengan la oportunidad de participar de forma equitativa. La plataforma incluye funcionalidades como temporizadores personalizables, historial de participación, integración con calendarios, y métricas de productividad del equipo.",
        content_p2: "El proyecto experimentó una migración completa de arquitectura, evolucionando desde una aplicación móvil nativa desarrollada en React Native hacia una plataforma web moderna construida con Next.js y TypeScript. Esta migración permitió ampliar significativamente la base de usuarios al eliminar las barreras de descarga de aplicaciones móviles, ofreciendo acceso instantáneo desde cualquier navegador web. La nueva arquitectura incluye un sistema de autenticación robusto con JWT, base de datos PostgreSQL para el manejo de datos de equipos y sesiones, y una API RESTful bien documentada. El frontend implementa un diseño responsive con Tailwind CSS, animaciones fluidas con Framer Motion, y un sistema de notificaciones en tiempo real usando WebSockets para mantener a todos los participantes sincronizados durante las reuniones diarias."
      },
      en: {
        title: "Daily Potato",
        description: "Innovative tool for remote Daily Scrums with random participation and team productivity metrics",
        content: "Daily Potato is an innovative tool designed to facilitate remote and effective Daily Scrums. The application automatically generates the participation order randomly, eliminating the monotony of daily meetings and ensuring that all team members have the opportunity to participate equitably. The platform includes features such as customizable timers, participation history, calendar integration, and team productivity metrics.",
        content_p2: "The project underwent a complete architecture migration, evolving from a native mobile application developed in React Native to a modern web platform built with Next.js and TypeScript. This migration significantly expanded the user base by eliminating mobile app download barriers, offering instant access from any web browser. The new architecture includes a robust authentication system with JWT, PostgreSQL database for handling team and session data, and a well-documented RESTful API. The frontend implements a responsive design with Tailwind CSS, smooth animations with Framer Motion, and a real-time notification system using WebSockets to keep all participants synchronized during daily meetings."
      }
    }
  },
  {
    id: "2",
    color: colors.blue,
    cover: "/edsel-chat.png",
    author: "Edsel Serrano",
    link: "https://chat.edselserrano.com/",
    date: "2023-10-01",
    content: {
      es: {
        title: "Chat Edsel",
        description: "Chatbot inteligente basado en IA que funciona como asistente virtual personal para consultas sobre experiencia profesional y proyectos",
        content: "Chat Edsel es un chatbot inteligente basado en IA que funciona como mi asistente virtual personal. Esta aplicación permite a los usuarios interactuar conmigo de manera natural y obtener información detallada sobre mi trayectoria profesional, experiencia técnica, proyectos desarrollados, habilidades en diferentes tecnologías, y mucho más. El chatbot está entrenado con información específica sobre mi perfil profesional y puede responder preguntas complejas sobre mi experiencia en desarrollo web, frameworks favoritos, metodologías de trabajo, y proyectos en los que he participado.",
        content_p2: "El proyecto está construido utilizando tecnologías de vanguardia como OpenAI GPT para el procesamiento de lenguaje natural, Langchain para la gestión de prompts y contexto, React para la interfaz de usuario interactiva, y Next.js para el framework full-stack. La aplicación incluye funcionalidades avanzadas como memoria de conversación, respuestas contextuales, interfaz de chat en tiempo real, y un sistema de retroalimentación. El diseño es completamente responsive y ofrece una experiencia de usuario fluida tanto en dispositivos móviles como en desktop, con animaciones suaves y una interfaz moderna que simula una conversación natural."
      },
      en: {
        title: "Chat Edsel",
        description: "Intelligent AI-based chatbot that functions as a personal virtual assistant for professional experience and project inquiries",
        content: "Chat Edsel is an intelligent AI-based chatbot that functions as my personal virtual assistant. This application allows users to interact with me naturally and obtain detailed information about my professional career, technical experience, developed projects, skills in different technologies, and much more. The chatbot is trained with specific information about my professional profile and can answer complex questions about my web development experience, favorite frameworks, work methodologies, and projects I've participated in.",
        content_p2: "The project is built using cutting-edge technologies like OpenAI GPT for natural language processing, Langchain for prompt and context management, React for the interactive user interface, and Next.js for the full-stack framework. The application includes advanced features such as conversation memory, contextual responses, real-time chat interface, and a feedback system. The design is completely responsive and offers a smooth user experience on both mobile devices and desktop, with smooth animations and a modern interface that simulates natural conversation."
      }
    }
  },
  {
    id: "3",
    color: colors.gray,
    cover: "/dineqrs.webp",
    author: "Edsel Serrano",
    link: "https://www.dineqrs.com/",
    date: "2023-12-20",
    content: {
      es: {
        title: "Dineqrs",
        description: "Aplicación que permite a los negocios generar catálogos digitales con códigos QR",
        content: "Dineqrs es una aplicación que permite a los negocios generar sus catálogos con códigos QR.",
        content_p2: ""
      },
      en: {
        title: "Dineqrs",
        description: "Application that allows businesses to generate digital catalogs with QR codes",
        content: "Dineqrs is an application that allows businesses to generate their catalogs with QR codes.",
        content_p2: ""
      }
    }
  },
  {
    id: "4",
    color: colors.gray,
    cover: "/f1logo.png",
    author: "Edsel Serrano",
    link: "https://f1.edselserrano.com/",
    date: "2024-05-06",
    content: {
      es: {
        title: "F1 Stats",
        description: "Aplicación web completa para estadísticas de Fórmula 1 en tiempo real con datos históricos y análisis interactivos",
        content: "F1 Stats es una aplicación web completa que proporciona estadísticas detalladas de la Fórmula 1 en tiempo real. La aplicación consume datos de la API oficial de F1 para mostrar información actualizada sobre pilotos, equipos, circuitos, carreras y temporadas. Los usuarios pueden explorar estadísticas históricas, seguir el desarrollo de la temporada actual, y analizar el rendimiento de sus pilotos favoritos con gráficos interactivos y visualizaciones de datos dinámicas.",
        content_p2: "El proyecto está desarrollado con tecnologías modernas como React, TypeScript, y Tailwind CSS para el frontend, implementando un diseño responsive que funciona perfectamente en dispositivos móviles y desktop. La aplicación incluye funcionalidades avanzadas como filtros de búsqueda, comparación de pilotos, historial de carreras, clasificaciones en tiempo real, y análisis detallados de vueltas rápidas. También cuenta con una interfaz intuitiva que permite a los fanáticos de la F1 acceder fácilmente a toda la información que necesitan para seguir de cerca el mundo de las carreras."
      },
      en: {
        title: "F1 Stats",
        description: "Complete web application for real-time Formula 1 statistics with historical data and interactive analysis",
        content: "F1 Stats is a complete web application that provides detailed Formula 1 statistics in real-time. The application consumes data from the official F1 API to display updated information about drivers, teams, circuits, races, and seasons. Users can explore historical statistics, follow the development of the current season, and analyze the performance of their favorite drivers with interactive charts and dynamic data visualizations.",
        content_p2: "The project is developed with modern technologies like React, TypeScript, and Tailwind CSS for the frontend, implementing a responsive design that works perfectly on mobile devices and desktop. The application includes advanced features such as search filters, driver comparison, race history, real-time standings, and detailed fast lap analysis. It also features an intuitive interface that allows F1 fans to easily access all the information they need to closely follow the world of racing."
      }
    }
  },
];

export const allPosts = [...posts];

// Helper functions to get localized content
export function getPostContent(post: Post, language: Language): PostContent {
  return post.content[language];
}

export function getLocalizedPost(post: Post, language: Language) {
  const content = getPostContent(post, language);
  return {
    ...post,
    ...content
  };
}

export function getLocalizedPosts(language: Language) {
  return posts.map(post => getLocalizedPost(post, language));
}
