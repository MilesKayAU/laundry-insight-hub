
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import AuthDialog from "./AuthDialog";
import { MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

interface CommentsSectionProps {
  productId?: string;
  topicId?: string; // Added topicId as an optional prop
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ productId, topicId }) => {
  // Use either productId or topicId, with "demo" as fallback
  const commentIdentifier = productId || topicId || "demo";
  
  const { user, isAuthenticated } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmitComment = () => {
    if (!commentText.trim() || !user) return;
    
    setIsSubmitting(true);

    // In a real app, this would save to Supabase
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      userId: user.id,
      userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
      content: commentText.trim(),
      createdAt: new Date(),
    };

    // Simulate network delay
    setTimeout(() => {
      setComments([newComment, ...comments]);
      setCommentText("");
      setIsSubmitting(false);
      
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
      });
    }, 500);
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

  const handleLoginClick = () => {
    navigate('/auth');
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
              disabled={!commentText.trim() || isSubmitting}
              className="bg-science-600 hover:bg-science-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Comment"
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-science-50 rounded-lg text-center">
          <MessageSquare className="h-8 w-8 text-science-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-2">
            Please login or create an account to leave comments
          </p>
          <Button 
            variant="outline" 
            className="border-science-300 text-science-700"
            onClick={handleLoginClick}
          >
            Login or Register
          </Button>
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
