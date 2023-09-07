import { colors } from "./colors";

export interface Post {
  id: string;
  title: string;
  color: (typeof colors)[keyof typeof colors];
  cover: string;
  content: string;
}

export const posts: Post[] = [
  {
    id: "1",
    title: "Daily Potato",
    color: colors.teal,
    cover:
      "https://potatodaily.com/potato.webp",
      content: "Si deseas conocer más acerca de la Daily Scrum y cómo implementarlo en tu equipo, te recomendamos visitar la web https://potatodaily.com/."
  },
  
];


export const allPosts = [
  ...posts,
];
