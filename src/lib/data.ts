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
      "Side project que nació de la necesidad de tener una herramienta que nos permitiera realizar las Daily Scrum de manera remota.",
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
      "Side project que te permite chatear conmigo, puedes preguntarme lo que quieras respecto a mi carrera profesional, proyectos, tecnologías, etc.",
    content_p2: "Se hizo usando OpenAI, Langchain, React y NextJS.",
    link: "https://chat.edselserrano.com/",
    description: "Chat Edsel",
    author: "Edsel Serrano",
    date: "2023-10-01",
  },
];

export const allPosts = [...posts];
