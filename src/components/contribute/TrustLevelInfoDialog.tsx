
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Shield, Award, BadgeCheck } from "lucide-react";
import { UserTrustLevel } from "@/utils/supabaseUtils";

interface TrustLevelInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userTrustLevel: UserTrustLevel;
}

const TrustLevelInfoDialog: React.FC<TrustLevelInfoDialogProps> = ({
  open,
  onOpenChange,
  userTrustLevel
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-blue-600" /> 
            Contributor Trust System
          </DialogTitle>
          <DialogDescription>
            Build trust and earn more submission privileges by contributing quality data to our database.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Our contributor trust system ensures data quality while rewarding active community members.
            Your trust level increases as your submissions are approved.
          </p>
          
          <Table>
            <TableCaption>Submission limits based on trust level</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Trust Level</TableHead>
                <TableHead>Single Upload</TableHead>
                <TableHead>Bulk Upload</TableHead>
                <TableHead>Requirements</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className={userTrustLevel === UserTrustLevel.NEW ? "bg-muted/50" : ""}>
                <TableCell className="font-medium flex items-center">
                  <Shield className="mr-2 h-4 w-4 text-gray-500" /> New Contributor
                </TableCell>
                <TableCell>3 products</TableCell>
                <TableCell>3 products</TableCell>
                <TableCell>New account</TableCell>
              </TableRow>
              <TableRow className={userTrustLevel === UserTrustLevel.TRUSTED ? "bg-muted/50" : ""}>
                <TableCell className="font-medium flex items-center">
                  <Award className="mr-2 h-4 w-4 text-amber-500" /> Trusted Contributor
                </TableCell>
                <TableCell>10 products</TableCell>
                <TableCell>10 products</TableCell>
                <TableCell>3+ approved submissions</TableCell>
              </TableRow>
              <TableRow className={userTrustLevel === UserTrustLevel.VERIFIED ? "bg-muted/50" : ""}>
                <TableCell className="font-medium flex items-center">
                  <BadgeCheck className="mr-2 h-4 w-4 text-green-500" /> Verified Contributor
                </TableCell>
                <TableCell>Unlimited</TableCell>
                <TableCell>20 products</TableCell>
                <TableCell>10+ approved submissions</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          <div className="bg-muted p-3 rounded-md text-sm">
            <p className="font-medium mb-1">Your Current Level:</p>
            <div className="flex items-center">
              {userTrustLevel === UserTrustLevel.NEW && (
                <Shield className="mr-2 h-5 w-5 text-gray-500" />
              )}
              {userTrustLevel === UserTrustLevel.TRUSTED && (
                <Award className="mr-2 h-5 w-5 text-amber-500" />
              )}
              {userTrustLevel === UserTrustLevel.VERIFIED && (
                <BadgeCheck className="mr-2 h-5 w-5 text-green-500" />
              )}
              <span>
                {userTrustLevel === UserTrustLevel.NEW && "New Contributor"}
                {userTrustLevel === UserTrustLevel.TRUSTED && "Trusted Contributor"}
                {userTrustLevel === UserTrustLevel.VERIFIED && "Verified Contributor"}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TrustLevelInfoDialog;
