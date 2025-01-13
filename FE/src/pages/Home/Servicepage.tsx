import React, { useState } from "react";

const ServicePage: React.FC = () => {
  const [selectedService, setSelectedService] = useState<null | string>(null);

  const services = [
    { name: "Glow & Radiance Combo", description: "Facial treatment, acne therapy, and rejuvenating mask", price: "$120" },
    { name: "Clear Skin Combo", description: "Acne therapy with deep cleansing facial", price: "$100" },
    { name: "Anti-Aging Combo", description: "Facial treatments, collagen boosters, and moisturizing masks", price: "$150" },
  ];

  return (
    <div className="container mx-auto text-center py-16">
      <h2 className="text-4xl font-bold mb-10">Skincare Combo Packages</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl"
            onClick={() => setSelectedService(service.name)}
          >
            <h3 className="text-2xl font-semibold text-gray-800">{service.name}</h3>
            <p className="mt-4 text-gray-600">{service.description}</p>
            <p className="mt-4 text-xl font-bold text-gray-900">{service.price}</p>
          </div>
        ))}
      </div>

      {selectedService && (
        <div className="mt-8 p-6 bg-gray-100 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-800">{selectedService}</h3>
          <p className="mt-4 text-gray-600">Detailed steps and pricing info for the selected service.</p>
        </div>
      )}
    </div>
  );
};

export default ServicePage;
