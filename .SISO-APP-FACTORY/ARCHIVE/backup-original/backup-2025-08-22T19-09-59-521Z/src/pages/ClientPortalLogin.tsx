
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ClientPortalLogin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Card className="w-full max-w-md p-8 bg-[#1A1A1A] border-gray-800">
        <div className="flex flex-col items-center mb-6">
          <img 
            src="/lovable-uploads/1a3075dc-17a1-45f1-8b31-695c20f70842.png" 
            alt="Logo" 
            className="w-20 h-20 mb-4" 
          />
          <h1 className="text-2xl font-bold text-white">Welcome to your Client Portal</h1>
          <p className="text-gray-400 mt-2">
            We couldn't find a client profile linked to your login.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate("/client-portal")} 
            variant="outline" 
            className="w-full bg-gray-800 text-white hover:bg-gray-700"
          >
            Return to Login
          </Button>
          <Button 
            onClick={() => navigate("/client-dashboard/support")} 
            className="w-full bg-red-500 text-white hover:bg-red-600"
          >
            Contact Support
          </Button>
        </div>
      </Card>
    </div>
  );
}
