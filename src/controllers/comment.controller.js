import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    //I need to get the 10 videos based on the page and limit
    const comments = await Comment.aggregate([
        {
            $match:{video:videoId}
        },
        {
            $lookup:{
                from: "User",
                localField: "$owner",
                foreignField: "$_id",
                as:"user"
            }
        },
        {
            $skip:(page*limit)
        },
        {
            $limit:limit
        },
        {
            $project:{
                "user.fullName":1,
                "user.avatar":1,
                "user.username":1,
                "content":1,
                "timestamp":1
            }
        }
    ])
    
    if(!comments){
        throw new ApiError(404,"No comments found")
    }

    return res.status(200).json(new ApiResponse(200,comments,"All the comments are retrieved"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const ownerId = req.user._id;
    const {content} = req.body;
    const {videoId} = req.params;
    const comment = await Comment.create({
        owner: ownerId,
        content,
        video:videoId
    });
    return res.status(201).json(new ApiResponse(201,toObject(comment),"New comment added."))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId}=req.params;
    const matchedcomment =await Comment.findOne({_id:commentId}).lean();
    if(!matchedcomment){
        throw new ApiError(400,"No comment found")
    }
    const {content} = req.body;
    const updatedComment = await Comment.updateOne({_id:commentId},{
        $set:{content}
    },{new:true});
    return res.status(202).json(new ApiResponse(202,toObject(updatedComment),"Comment updated"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;
    await Comment.deleteOne({_id:commentId});
    return res.status(200).json(new ApiResponse(200,{},"Comment deleted."))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
