
import React from "react";
import { Layout } from "@/components/Layout";

export const NotesLoading = () => {
  return (
    <Layout>
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    </Layout>
  );
};
