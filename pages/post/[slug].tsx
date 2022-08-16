import { GetStaticProps } from 'next';
import useSWR from 'swr';
import Header from '../../components/Header';
import { Comment, Post } from '../../typings';
import { supabase } from '../../services/supabaseClient';
import { useEffect, useRef, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

interface Props {
    post: Post;
}

interface IformInput {
    _id: string;
    name: string;
    email: string;
    comment: string;
}

function Post({ post }: Props) {
    // States
    const [submitted, setSubmitted] = useState(false);
    const [comments, setComments] = useState<[Comment]>();

    // Refs.
    const bodyRef = useRef<HTMLInputElement>(null);

    // Effects.
    useEffect(() => {
        if (bodyRef.current) bodyRef.current.innerHTML = post.body;
    }, []);

    // Const.
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<IformInput>();

    // Functions
    // Función para agregar comentarios.
    const onSubmit: SubmitHandler<IformInput> = async formData => {
        await fetch('/api/createComment', { method: 'POST', body: JSON.stringify(formData) })
            .then(data => {
                console.log(data);
                setSubmitted(true);
            })
            .catch(err => {
                console.log(err);
                setSubmitted(false);
            });
    };

    // Getting all comments of the post using SWR.
    /* Fetcher */
    const fetcher = (url: string) => fetch(url, { method: 'GET' }).then(r => r.json());
    /* Get data */
    const { data, error } = useSWR(`/api/getComments?postId=${post.id}`, fetcher, { refreshInterval: 200 });

    useEffect(() => {
        if (data) setComments(data.data);
    }, [data]);

    // Logs.
    console.log();

    return (
        <main>
            <Header />
            <img className="w-full h-40 object-cover" src={post.mainImage} alt="" />
            <article className="max-w-3xl mx-auto p-5">
                <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
                <h2 className="text-xl font-light text-gray-500 mb-2">{post.description}</h2>
                <div className="flex items-center space-x-2">
                    <img className="h-10 w-10 rounded-full object-cover" src={post.author.photoUrl} alt="" />
                    <p className="font-extralight text-sm">
                        Blog post by <span className="text-green-600">{post.author.name}</span> - Published at{' '}
                        {new Date(post.created_at).toLocaleDateString()}
                    </p>
                </div>
                <div className="mt-10" ref={bodyRef}></div>
            </article>
            <hr className="max-w-lg my-5 mx-auto border border-yellow-500" />

            {submitted ? (
                <div className="flex flex-col p-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto">
                    <h3 className="text-3xl font-bold">Thank you for submitting your comment!</h3>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col p-5 max-w-2xl mx-auto mb-10">
                    <h3 className="text-sm text-yellow-500">Enjoyed this article?</h3>
                    <h4 className="text-3xl font-bold">Leave a comment below!</h4>
                    <hr className="py-3 mt-2" />

                    <input type={'hidden'} {...register('_id')} name="_id" value={post.id} />

                    <label className="block mb-5">
                        <span className="text-gray-700">Name</span>
                        <input
                            {...register('name', { required: true })}
                            className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 outline-none focus:ring"
                            type="text"
                            placeholder="Jose Acosta"
                        />
                    </label>
                    <label className="block mb-5">
                        <span className="text-gray-700">Email</span>
                        <input
                            {...register('email', { required: true })}
                            className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 outline-none focus:ring"
                            type="text"
                            placeholder="jose.m.acosta1996@gmail.com"
                        />
                    </label>
                    <label className="block mb-5">
                        <span className="text-gray-700">Comment</span>
                        <textarea
                            {...register('comment', { required: true })}
                            className="shadow border rounded py-2 px-3 form-textarea mt-1 block w-full ring-yellow-500 outline-none focus:ring"
                            rows={8}
                            placeholder="Comment"
                        />
                    </label>

                    {/* Errors */}
                    <div className="flex flex-col p-5">
                        {errors.name && <span className="text-red-500">- The name Field is required</span>}
                        {errors.email && <span className="text-red-500">- The comment Field is required</span>}
                        {errors.comment && <span className="text-red-500">- The email Field is required</span>}
                    </div>

                    <input
                        type="submit"
                        className="shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer"
                    />
                </form>
            )}

            {/* Comments */}
            <div className="flex flex-col p-10 my-10 max-w-2xl mx-auto shadow-yellow-500 shadow space-y-2">
                <h3 className="text-4xl">Comments</h3>
                <hr className="pb-2" />

                {comments?.map(comment => (
                    <div key={comment.id}>
                        <p>
                            <span className="text-yellow-500">{comment.name}</span>: {comment.comment}
                        </p>
                    </div>
                ))}
            </div>
        </main>
    );
}

export default Post;

export const getStaticPaths = async () => {
    const { data } = await supabase.from('posts').select('*');

    const paths = data?.map((post: Post) => ({
        params: {
            slug: post.slug,
        },
    }));

    return {
        paths,
        fallback: 'blocking',
    };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const { data } = await supabase.from('posts').select('*').eq('slug', params?.slug);

    const post = data ? data[0] : [];

    if ((data?.length || 0) === 0) {
        return { notFound: true };
    }

    return {
        props: {
            post,
        },
        revalidate: 60,
    };
};
