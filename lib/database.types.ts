export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    display_name: string;
                    avatar_url: string | null;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    display_name: string;
                    avatar_url?: string | null;
                    created_at?: string;
                };
                Update: {
                    display_name?: string;
                    avatar_url?: string | null;
                };
            };
            posts: {
                Row: {
                    id: string;
                    user_id: string;
                    content: string;
                    image_url: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    content: string;
                    image_url?: string | null;
                    created_at?: string;
                };
                Update: {
                    content?: string;
                    image_url?: string | null;
                };
            };
            likes: {
                Row: {
                    user_id: string;
                    post_id: string;
                    created_at: string;
                };
                Insert: {
                    user_id: string;
                    post_id: string;
                    created_at?: string;
                };
                Update: Record<string, never>;
            };
            comments: {
                Row: {
                    id: string;
                    post_id: string;
                    user_id: string;
                    content: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    post_id: string;
                    user_id: string;
                    content: string;
                    created_at?: string;
                };
                Update: {
                    content?: string;
                };
            };
            reports: {
                Row: {
                    id: string;
                    reporter_id: string;
                    post_id: string;
                    reason: string;
                    created_at: string;
                    status: string;
                };
                Insert: {
                    id?: string;
                    reporter_id: string;
                    post_id: string;
                    reason: string;
                    created_at?: string;
                    status?: string;
                };
                Update: {
                    status?: string;
                };
            };
        };
    };
}
