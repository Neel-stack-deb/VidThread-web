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
    const comments = Comment.aggregate([
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
        return new ApiError(404,"No comments found")
    }

    return new ApiResponse(200,"All the comments are retrieved",comments)
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
