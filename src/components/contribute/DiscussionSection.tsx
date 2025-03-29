
import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import CommentsSection from "@/components/CommentsSection";

const DiscussionSection: React.FC = () => {
  return (
    <div className="mt-16 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Community Discussion</CardTitle>
          <CardDescription>
            Share your thoughts, ask questions, or provide feedback about laundry products and PVA content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CommentsSection topicId="product-submissions" />
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscussionSection;
