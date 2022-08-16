import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../services/supabaseClient';

export default async function createComment(req: NextApiRequest, res: NextApiResponse) {
    const { _id, name, email, comment } = JSON.parse(req.body);

    try {
        const { data, error } = await supabase.from('comments').insert([{ id_post: _id, name, email, comment }]);
    } catch (error) {
        return res.status(500).json({ message: error });
    }

    return res.status(200).json({ message: 'Comment created successfully' });
}
