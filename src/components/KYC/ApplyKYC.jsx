import React, { useState,useEffect } from "react";
import Layout from "../Layout/Layout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

const ApplyKYC = () => {
  const [isMultiple, setIsMultiple] = useState(false);
  const navigate = useNavigate();
  return (
    <Layout>
       <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <Card className="w-full max-w-md shadow-lg p-6">
        <h2 className="text-xl font-semibold text-center mb-4">Select Application Type</h2>
        <div className="flex items-center justify-between bg-gray-200 p-2 rounded-lg">
          <span className={isMultiple ? "text-gray-500" : "text-blue-600 font-bold"}>Apply</span>
          <Switch checked={isMultiple} onCheckedChange={() => setIsMultiple(!isMultiple)} />
          <span className={!isMultiple ? "text-gray-500" : "text-blue-600 font-bold"}>Multiple Apply</span>
        </div>

        {/* If Single Apply, Redirect */}
        {!isMultiple && (
          <Button className="mt-4 w-full bg-blue-500 hover:bg-blue-600" onClick={() => navigate("/single-apply")}>Apply Now</Button>
        )}
      </Card>

      {/* Multiple Apply Options */}
      {isMultiple && (
        <Card className="w-full max-w-md shadow-lg p-6 mt-4">
          <h3 className="text-lg font-semibold text-center mb-4">Choose a Method</h3>
          <CardContent className="flex flex-col space-y-4">
            <Button className="bg-green-500 hover:bg-green-600" onClick={() => navigate("/file-upload")}>📂 File Upload</Button>
            <Button className="bg-indigo-500 hover:bg-indigo-600" onClick={() => navigate("/excel-upload")}>📊 Apply Using Excel</Button>
          </CardContent>
        </Card>
      )}
    </div>
    </Layout>
  );
};

export default ApplyKYC;