
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import AuthDialog from "./AuthDialog";
import { MessageSquare } from "lucide-react";

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

interface CommentsSectionProps {
  productId?: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ productId = "demo" }) => {
  const { user, isAuthenticated } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  const handleSubmitComment = () => {
    if (!commentText.trim() || !user) return;

    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      content: commentText.trim(),
      createdAt: new Date(),
    };

    setComments([newComment, ...comments]);
    setCommentText("");
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Comments</h3>
      
      {isAuthenticated ? (
        <div className="space-y-2">
          <Textarea
            placeholder="Share your thoughts or experiences with this product..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={!commentText.trim()}
              className="bg-science-600 hover:bg-science-700"
            >
              Post Comment
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-science-50 rounded-lg text-center">
          <MessageSquare className="h-8 w-8 text-science-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-2">
            Please login or create an account to leave comments
          </p>
          <AuthDialog>
            <Button variant="outline" className="border-science-300 text-science-700">
              Login or Register
            </Button>
          </AuthDialog>
        </div>
      )}
      
      {comments.length > 0 && (
        <div className="space-y-4 mt-6">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-science-800">{comment.userName}</div>
                <div className="text-xs text-gray-500">{formatDate(comment.createdAt)}</div>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
