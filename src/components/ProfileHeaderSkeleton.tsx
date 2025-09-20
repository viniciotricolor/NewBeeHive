import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileHeaderSkeleton = () => {
  return (
    <Card className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
      <Skeleton className="h-24 w-24 rounded-full" />
      <div className="text-center sm:text-left flex-1 space-y-3">
        <Skeleton className="h-8 w-3/4 mx-auto sm:mx-0" />
        <Skeleton className="h-5 w-1/2 mx-auto sm:mx-0" />
        <Skeleton className="h-4 w-full mx-auto sm:mx-0" />
        <Skeleton className="h-4 w-5/6 mx-auto sm:mx-0" />
        <Skeleton className="h-4 w-1/4 mx-auto sm:mx-0" />
      </div>
    </Card>
  );
};

export default ProfileHeaderSkeleton;