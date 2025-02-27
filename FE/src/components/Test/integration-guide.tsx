"use client"

import type React from "react"

const IntegrationGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Integration Guide</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Connecting the Quiz to ServicePage</h2>
        <p className="text-gray-600 mb-4">
          To fully integrate the skin assessment quiz with your existing ServicePage component, follow these steps:
        </p>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-700">Step 1: Add Navigation</h3>
          <p className="text-gray-600 mb-2">
            Ensure the quiz can navigate to the ServicePage by updating the router path in the handleViewServices
            function:
          </p>
          <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
            {`const handleViewServices = () => {
  // Navigate to your services page
  router.push("/services");
};`}
          </pre>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-700">Step 2: Pass Recommendation Data</h3>
          <p className="text-gray-600 mb-2">
            To pass the recommendation data to the ServicePage, you can use URL parameters or localStorage:
          </p>
          <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
            {`// Using URL parameters
const handleViewServices = () => {
  if (recommendedService) {
    router.push(\`/services?recommended=\${recommendedService.type.toLowerCase()}\`);
  } else {
    router.push("/services");
  }
};

// OR using localStorage
const handleViewServices = () => {
  if (recommendedService) {
    localStorage.setItem('skinAssessmentResult', JSON.stringify({
      skinProfile,
      recommendedService
    }));
  }
  router.push("/services");
};`}
          </pre>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-3 text-gray-700">Step 3: Update ServicePage Component</h3>
          <p className="text-gray-600 mb-2">
            Modify your ServicePage component to read and use the recommendation data:
          </p>
          <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
            {`import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import Layout from "../../layout/Layout";

const ServicePage: React.FC = () => {
  const [selectedService, setSelectedService] = useState<null | string>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [recommendedType, setRecommendedType] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Get recommendation from URL parameter
    const recommended = searchParams.get('recommended');
    if (recommended) {
      setRecommendedType(recommended);
    } else {
      // Or try to get from localStorage
      const savedAssessment = localStorage.getItem('skinAssessmentResult');
      if (savedAssessment) {
        const { recommendedService } = JSON.parse(savedAssessment);
        setRecommendedType(recommendedService.type.toLowerCase());
      }
    }
    
    const fetchServices = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products/");
        const formattedData = response.data.map((service: any) => ({
          ...service,
          price: formatPrice(service.price),
          // Add a flag for recommended services
          isRecommended: recommendedType && 
            service.category?.name.toLowerCase().includes(recommendedType)
        }));
        setServices(formattedData);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [recommendedType, searchParams]);

  // Rest of your ServicePage component...
}`}
          </pre>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Highlighting Recommended Services</h2>
        <p className="text-gray-600 mb-4">
          To highlight the recommended services in your ServicePage component, update the service card rendering:
        </p>

        <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mb-4">
          {`{services.map((service, index) => (
  <div
    key={index}
    className={\`bg-white p-6 rounded-lg shadow-lg cursor-pointer transform transition-transform hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white \${
      service.isRecommended ? 'border-2 border-purple-500 relative' : ''
    }\`}
    onClick={() => setSelectedService(service.name)}
  >
    {service.isRecommended && (
      <div className="absolute -top-4 -right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
        Recommended
      </div>
    )}
    <h3 className="text-2xl font-semibold text-gray-800">
      {service.name}
    </h3>
    {/* Rest of your service card content */}
  </div>
))}`}
        </pre>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Additional Enhancements</h2>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-2">Add Filtering Options</h3>
            <p className="text-gray-700">
              Allow users to filter services by skin type or concern, making it easier to find relevant treatments.
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-bold text-green-800 mb-2">Save Assessment History</h3>
            <p className="text-gray-700">
              Store user assessment results in a database to track changes in skin condition over time.
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-bold text-purple-800 mb-2">Personalized Discounts</h3>
            <p className="text-gray-700">
              Offer special promotions or discounts on recommended services based on quiz results.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntegrationGuide

