import { colors } from "./colors";

export interface Post {
  id: string;
  title: string;
  color: (typeof colors)[keyof typeof colors];
  cover: string;
  description: string;
  author: string;
  content: string;
  content_p2: string;
  link: string;
  date: string;
}

export const posts: Post[] = [
  {
    id: "1",
    title: "Daily Potato",
    color: colors.teal,
    cover: "https://potatodaily.com/potato.webp",
    content:
      "Daily Potato es una herramienta que permite realizar las Daily Scrum de manera remota, generando el orden de participación de manera aleatoria.",
    content_p2:
      "Si deseas conocer más acerca de la Daily Scrum y cómo implementarlo en tu equipo, te recomendamos visitar la web ",
    link: "https://potatodaily.com/",
    description: "Daily Potato",
    author: "Edsel Serrano",
    date: "2023-01-01",
  },
  {
    id: "2",
    title: "Chat Edsel",
    color: colors.blue,
    cover: "/edsel-chat.png",
    content:
      "Edsel Chat es un chatbot que te permite chatear conmigo, puedes preguntarme lo que quieras respecto a mi carrera profesional, proyectos, tecnologías, etc.",
    content_p2: "Se hizo usando OpenAI, Langchain, React y NextJS.",
    link: "https://chat.edselserrano.com/",
    description: "Chat Edsel",
    author: "Edsel Serrano",
    date: "2023-10-01",
  },
  {
    id: "3",
    title: "Dineqrs",
    color: colors.gray,
    cover: "/dineqrs.webp",
    content:
      "Dineqrs es una aplicación que permite a los negocios generar sus catalogos con codigos QR.",
    content_p2: "",
    link: "https://www.dineqrs.com/",
    description: "Dinerqrs",
    author: "Edsel Serrano",
    date: "2023-12-20",
  },
  {
    id: "4",
    title: "F1 Stats",
    color: colors.gray,
    cover: "/f1logo.png ",
    content:
      "F1 Stats es una aplicación que te muestra las estadísticas de la F1 en tiempo real.",
    content_p2: "",
    link: "https://f1.edselserrano.com/",
    description: "F1 Stats",
    author: "Edsel Serrano",
    date: "2024-05-06",
  },
];

export const allPosts = [...posts];
