import { supabase } from './../../services/supabaseClient';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function getComments(req: NextApiRequest, res: NextApiResponse) {
    const postId = req.query.postId;

    const { data, error } = await supabase.from('comments').select('*').eq('id_post', postId);

    res.status(200).json({ data, message: 'Obtenido' });
}
