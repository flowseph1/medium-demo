import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import Carusel from '../components/Carusel';
import Header from '../components/Header';
import { supabase } from './../services/supabaseClient';

const Home: NextPage = () => {
    interface Post {
        title: string;
        slug: string;
        id: number;
        mainImage: string;
        description: string;
        author: { name: string; photoUrl: string };
    }

    // State variables
    const [posts, setPosts] = useState<Post[]>([]);

    // Get posts
    /* Fetcher */
    const fetcher = (url: string) => fetch(url).then(r => r.json());
    /* Get data */
    const { data, error } = useSWR('/api/getPosts', fetcher, { refreshInterval: 200 });

    // Effects
    useEffect(() => {
        if (!data) return;
        setPosts(data.data);
    }, [data]);

    /* useEffect(() => {
        const getData = async () => {
            const { data } = await supabase.from('posts').select('*');
            console.log(data);
        };

        getData();
    }, []); */

    // Logs
    console.log();

    return (
        <div className="max-w-7xl mx-auto">
            <>
                <Head>
                    <title>Medium Demo</title>
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <Header />
                <Carusel />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 p-2 md:p-6">
                    {/* Posts */}
                    {posts.map(post => (
                        <Link href={`/post/${post.slug}`} key={post.id}>
                            <div className="border rounded-lg group cursor-pointer overflow-hidden">
                                <img
                                    className="h-60 w-full object-cover group-hover:scale-105 transition-transform duration-200 ease-in-out"
                                    src={post.mainImage}
                                    alt=""
                                />
                                <div className="flex justify-between p-5 bg-white">
                                    <div>
                                        <p className="text-lg font-bold">{post.title}</p>
                                        <p className="text-xs">
                                            {post.description} by {post.author.name}
                                        </p>
                                    </div>
                                    <img src={post.author.photoUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </>
        </div>
    );
};

export default Home;
