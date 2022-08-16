export interface Post {
    id: number;
    title: string;
    author: { name: string; photoUrl: string };
    description: string;
    mainImage: string;
    slug: string;
    created_at: string;
    body: string;
}

export interface Comment {
    id: number;
    id_post: number;
    created_at: string;
    name: string;
    email: string;
    comment: string;
}
