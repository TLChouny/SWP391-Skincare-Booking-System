"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useLocation } from "react-router-dom"
import Layout from "../../layout/Layout"

const ServicePage: React.FC = () => {
  const [selectedService, setSelectedService] = useState<null | string>(null)
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [recommendedType, setRecommendedType] = useState<string | null>(null)

  const location = useLocation()

  useEffect(() => {
    // Check for query parameters in the URL
    const queryParams = new URLSearchParams(location.search)
    const recommended = queryParams.get("recommended")

    if (recommended) {
      setRecommendedType(recommended)
    } else {
      // Try to get from localStorage
      const savedAssessment = localStorage.getItem("skinAssessmentResult")
      if (savedAssessment) {
        try {
          const { recommendedService } = JSON.parse(savedAssessment)
          setRecommendedType(recommendedService.type.toLowerCase())
        } catch (error) {
          console.error("Error parsing saved assessment:", error)
        }
      }
    }

    const fetchServices = async () => {
      try {
        // If we have a recommended type, try to fetch recommended services first
        if (recommendedType) {
          try {
            // Try to get recommended services from backend
            const recommendedResponse = await axios.get(
              `http://localhost:5000/api/recommended-services/${recommendedType}`,
            )
            if (recommendedResponse.data.success && recommendedResponse.data.data.length > 0) {
              const formattedData = recommendedResponse.data.data.map((service: any) => ({
                ...service,
                price: formatPrice(service.price),
                isRecommended: true,
              }))
              setServices(formattedData)
              setLoading(false)
              return
            }
          } catch (error) {
            console.error("Error fetching recommended services:", error)
            // Continue to fetch all services if recommended services fetch fails
          }
        }

        // Fetch all services
        const response = await axios.get("http://localhost:5000/api/products/")
        const formattedData = response.data.map((service: any) => ({
          ...service,
          price: formatPrice(service.price),
          // Mark as recommended if the category matches the recommended type
          isRecommended:
            recommendedType &&
            (service.category?.name.toLowerCase().includes(recommendedType) ||
              (service.tags && service.tags.some((tag: string) => tag.toLowerCase().includes(recommendedType)))),
        }))
        setServices(formattedData)
      } catch (error) {
        console.error("Error fetching services:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [recommendedType, location.search])

  // Hàm format giá tiền thành dạng "100.000 VNĐ"
  const formatPrice = (price: any) => {
    let priceValue = 0

    if (typeof price === "object" && price.$numberDecimal) {
      priceValue = Number.parseFloat(price.$numberDecimal)
    } else if (typeof price === "number") {
      priceValue = price
    } else if (typeof price === "string") {
      priceValue = Number.parseFloat(price.replace(/\./g, ""))
    }

    return `${priceValue.toLocaleString("vi-VN")} VNĐ`
  }

  const selectedServiceDetails = services.find((service) => service.name === selectedService)

  const closeModal = () => {
    setSelectedService(null)
  }

  const splitDescription = (description: string) => {
    return description.split("\n").map((line, index) => (
      <p key={index} className="text-lg text-gray-600 flex items-start">
        <span className="mr-2 text-blue-500">•</span>
        {line}
      </p>
    ))
  }

  return (
    <Layout>
    <div className="container mx-auto px-6 py-16">
      {recommendedType && (
        <div className="mb-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="text-xl font-semibold text-purple-800">Personalized Recommendation</h3>
          <p className="text-gray-700">
            Based on your skin assessment, we've highlighted services that are ideal for your{" "}
            {recommendedType.replace(/^\w/, (c) => c.toUpperCase())} skin type.
          </p>
        </div>
      )}

      <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">Skincare Combo Packages</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-3 text-xl font-semibold text-center text-gray-500">Loading services...</div>
        ) : (
          services.map((service, index) => (
            <div
              key={index}
              className={`bg-white p-6 rounded-lg shadow-lg cursor-pointer transform transition-transform hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white ${
                service.isRecommended ? "border-2 border-purple-500 relative" : ""
              }`}
              onClick={() => setSelectedService(service.name)}
            >
              {service.isRecommended && (
                <div className="absolute -top-4 -right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  Recommended
                </div>
              )}
              <h3 className="text-2xl font-semibold text-gray-800">{service.name}</h3>
              <p className="text-gray-600 text-sm">Category: {service.category?.name || "N/A"}</p>
              <img
                className="mt-4 rounded-lg shadow-md object-cover h-40 w-full"
                src={service.image || "/default-image.jpg"}
                alt={service.name}
              />
              <p className="mt-4 text-lg font-bold text-gray-900">{service.price}</p>
              <p className="text-gray-600 text-sm">Duration: {service.duration} min</p>
            </div>
          ))
        )}
      </div>

      {/* Modal khi dịch vụ được chọn */}
      {selectedService && selectedServiceDetails && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 z-50 flex justify-center items-center transition-opacity duration-300 ease-in-out">
          <div className="bg-white p-12 rounded-lg shadow-lg w-2/3 relative transform scale-100 transition-all duration-500 ease-in-out opacity-100 max-w-4xl">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 text-3xl transition-transform transform hover:scale-125"
            >
              &times;
            </button>
            <h3 className="text-4xl font-semibold text-gray-800 mb-6">{selectedServiceDetails.name}</h3>
            <p className="text-xl text-gray-700 mb-2">
              <strong>Price:</strong> {selectedServiceDetails.price}
            </p>
            <p className="text-gray-600 text-sm">
              <strong>Category:</strong> {selectedServiceDetails.category?.name || "N/A"}
            </p>
            <p className="text-gray-600 text-sm">
              <strong>Duration:</strong> {selectedServiceDetails.duration} min
            </p>

            {/* Chia mô tả thành các dòng có dấu gạch đầu dòng */}
            <div className="mb-6">
              <h4 className="text-2xl font-semibold text-gray-800 mb-4">Description</h4>
              <div className="space-y-4">{splitDescription(selectedServiceDetails.description)}</div>
            </div>

            {/* Hình ảnh dịch vụ */}
            <img
              src={selectedServiceDetails.image || "/default-image.jpg"}
              alt={selectedServiceDetails.name}
              className="rounded-lg shadow-lg w-full h-auto object-cover mb-6 transition-transform duration-500 ease-in-out transform hover:scale-105"
            />

            <div className="flex justify-between mt-4">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
              >
                Close
              </button>
              {selectedServiceDetails.isRecommended && (
                <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200">
                  Book Recommended Service
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  )
}

export default ServicePage

