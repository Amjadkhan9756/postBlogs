import User from "../models/user.model.js";
import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js";
import { getVerifiedUserIds } from "../utils/verified.js";


export const activeCheck = async (req, res) => {
    return res.status(200).json({ message: 'RUNNING' })

}

// create post 

export const createPost = async (req, res) => {
    const { token } = req.body;
    try {

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }
        const newPost = new Post({
            userId: user._id,
            body: req.body.body,
            media: req.file != undefined ? req.file.filename : "",
            fileType: req.file != undefined ? req.file.mimetype.split("/")[1] : "",
        })
        await newPost.save();
        return res.status(200).json({ message: "Post created succesfully " })
    }
    catch (error) {

        return res.status(500).json({ message: error.message });

    }
}


// get all posts (attach verified badge for users with 600k+ total post likes)
export const getAllPost = async (req, res) => {
    try {
        const currentUser = req.query.token
            ? await User.findOne({ token: req.query.token }).select("_id")
            : null;
        const posts = await Post.find().populate('userId', 'name username email profilePicture');
        const verifiedIds = await getVerifiedUserIds();
        const postsWithVerified = posts.map((p) => {
            const po = p.toObject();
            if (po.userId) po.userId.verified = verifiedIds.has(po.userId._id.toString());
            po.liked = Boolean(
                currentUser &&
                (po.likedBy || []).some((userId) => userId.toString() === currentUser._id.toString())
            );
            delete po.likedBy;
            return po;
        });
        return res.status(200).json({ posts: postsWithVerified });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}



//delete post

export const destroyPost = async (req, res) => {
    const { token, post_id } = req.body;
    try {

        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(404).json({ message: "user not found " });


        }
        const post = await Post.findOne({ _id: post_id });
        if (!post) {
            return res.status(404).json({ message: "postnot found !" });
        }

        if (user._id.toString() !== post.userId.toString()) {
            return res.json({ message: "you are not owner of this post" })
        }

        await Post.deleteOne({ _id: post_id });
        return res.json({ message: "post deleted successfully !" });

    }
    catch (error) {
        return res.status(500).json({ message: err.message });

    }
}



///commentpost 
export const commentPost= async(req, res)=>{
    const{token, post_id,comment}= req.body;
    try{
        const user = await User.findOne({token:token}).select("_id");
        if(!user){
            return res.status(404).json({message:"user not found"});
        }

        const post =  await Post.findOne({_id:post_id});
        if(!post){
            return res.status(404).json({message:"post not found !"});
        }



        const newcomment = new Comment({
            userId:user._id,
            postId:post_id,
            body:comment,
        });
        await newcomment.save();
        return res.status(200).json({message:"comment created successfully !"});

    }

    catch(err){
        return res.status(500).json({message:err.message});
    }
}
/// get all comments by post code
export const get_comment_bypost= async(req, res)=>{
    const { post_id } = req.query;
    try {
        const comments = await Comment.find({ postId: post_id }).populate('userId', 'name username profilePicture');
        const verifiedIds = await getVerifiedUserIds();
        const list = (comments && comments.length)
            ? comments.map((c) => {
                const co = c.toObject();
                co.comment = co.body;
                if (co.userId) co.userId.verified = verifiedIds.has(co.userId._id.toString());
                return co;
              })
            : [];
        return res.json({ comments: list });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

/// destroy  comment 
export const destroyCommnet= async(req, res)=>{
    const {token, comment_id}= req.body;
    try{

        const user = await User.findOne({token:token}).select("_id");
        if(!user){
            return res.status(404).json({message:"user not found!"});
        }
        const comment= await Comment.findOne({"_id":comment_id});
        if(!comment){
            return res.status(404).json({message:"commnet not found "});

        }
        if(comment.userId.toString()!==user._id.toString()){
            return res.status(401).json({message:"you are not owner of this comment"});
        }
        await Comment.deleteOne({"_id":comment_id});
        return res.status(200).json({message:"comment deleted successfully !"});


    }catch(err){
        return res.status(500).json({message:err.message});
    }
}



// Toggle the current user's like without allowing duplicate requests to inflate the count.
export const toggleLike = async (req, res) => {
    const { post_id, token } = req.body;
    try{
        if (!token || !post_id) {
            return res.status(400).json({ message: "Token and post ID are required" });
        }

        const user = await User.findOne({ token }).select("_id");
        if (!user) {
            return res.status(401).json({ message: "Please log in to like posts" });
        }

        const post = await Post.findById(post_id).select("likes likedBy");
        if(!post){
            return res.status(404).json({message:"post not found"});
        }

        const userId = user._id.toString();
        const isLiked = (post.likedBy || []).some((likedUserId) => likedUserId.toString() === userId);
        const filter = { _id: post._id };
        const update = isLiked
            ? { $pull: { likedBy: user._id }, $inc: { likes: -1 } }
            : { $addToSet: { likedBy: user._id }, $inc: { likes: 1 } };
        filter.likedBy = isLiked ? user._id : { $ne: user._id };

        let updatedPost = await Post.findOneAndUpdate(filter, update, { new: true }).select("likes likedBy");
        if (!updatedPost) {
            updatedPost = await Post.findById(post_id).select("likes likedBy");
            if (!updatedPost) {
                return res.status(404).json({ message: "post not found" });
            }
        }

        const liked = (updatedPost.likedBy || []).some((likedUserId) => likedUserId.toString() === userId);
        return res.status(200).json({ likes: updatedPost.likes, liked });

    } catch(err){
        return res.status(500).json({message:err.message});
    }
}