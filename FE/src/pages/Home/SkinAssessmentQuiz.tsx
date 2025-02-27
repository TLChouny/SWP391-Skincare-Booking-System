"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"
import axios from "axios"
import Layout from "../../layout/Layout"

// Define question types and service recommendation logic
interface Question {
  id: number
  text: string
  options: {
    text: string
    points: {
      dry: number
      oily: number
      sensitive: number
      aging: number
      acne: number
    }
  }[]
}

interface SkinProfile {
  dry: number
  oily: number
  sensitive: number
  aging: number
  acne: number
}

interface ServiceRecommendation {
  type: string
  name: string
  description: string
}

const SkinAssessmentQuiz: React.FC = () => {
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<number[]>([])
  const [skinProfile, setSkinProfile] = useState<SkinProfile>({
    dry: 0,
    oily: 0,
    sensitive: 0,
    aging: 0,
    acne: 0,
  })
  const [showResults, setShowResults] = useState(false)
  const [recommendedService, setRecommendedService] = useState<ServiceRecommendation | null>(null)

  // Quiz questions
  const questions: Question[] = [
    {
      id: 1,
      text: "How would you describe your skin type most of the time?",
      options: [
        {
          text: "Dry, often feels tight or flaky",
          points: { dry: 10, oily: 0, sensitive: 2, aging: 3, acne: 0 },
        },
        {
          text: "Oily, especially in the T-zone",
          points: { dry: 0, oily: 10, sensitive: 0, aging: 0, acne: 5 },
        },
        {
          text: "Combination - oily in some areas, dry in others",
          points: { dry: 5, oily: 5, sensitive: 1, aging: 1, acne: 3 },
        },
        {
          text: "Normal, generally balanced",
          points: { dry: 2, oily: 2, sensitive: 0, aging: 0, acne: 0 },
        },
      ],
    },
    {
      id: 2,
      text: "What skin concerns do you experience most frequently?",
      options: [
        {
          text: "Acne or breakouts",
          points: { dry: 0, oily: 5, sensitive: 2, aging: 0, acne: 10 },
        },
        {
          text: "Fine lines and wrinkles",
          points: { dry: 3, oily: 0, sensitive: 0, aging: 10, acne: 0 },
        },
        {
          text: "Redness or irritation",
          points: { dry: 2, oily: 0, sensitive: 10, aging: 0, acne: 2 },
        },
        {
          text: "Dullness or uneven skin tone",
          points: { dry: 5, oily: 2, sensitive: 0, aging: 5, acne: 0 },
        },
      ],
    },
    {
      id: 3,
      text: "How does your skin react to new products?",
      options: [
        {
          text: "Very reactive, often gets irritated",
          points: { dry: 2, oily: 0, sensitive: 10, aging: 0, acne: 2 },
        },
        {
          text: "Sometimes reacts, depends on the product",
          points: { dry: 1, oily: 1, sensitive: 5, aging: 0, acne: 1 },
        },
        {
          text: "Rarely reacts negatively",
          points: { dry: 0, oily: 2, sensitive: 0, aging: 2, acne: 0 },
        },
        {
          text: "Never had any reaction issues",
          points: { dry: 0, oily: 0, sensitive: 0, aging: 0, acne: 0 },
        },
      ],
    },
    {
      id: 4,
      text: "How would you describe your current skincare routine?",
      options: [
        {
          text: "Minimal - just cleanse and maybe moisturize",
          points: { dry: 2, oily: 2, sensitive: 0, aging: 5, acne: 2 },
        },
        {
          text: "Basic - cleanse, tone, moisturize",
          points: { dry: 1, oily: 1, sensitive: 1, aging: 3, acne: 1 },
        },
        {
          text: "Moderate - includes serums or treatments",
          points: { dry: 0, oily: 0, sensitive: 0, aging: 1, acne: 0 },
        },
        {
          text: "Extensive - multiple steps and products",
          points: { dry: 0, oily: 0, sensitive: 2, aging: 0, acne: 0 },
        },
      ],
    },
    {
      id: 5,
      text: "How does your skin feel after washing?",
      options: [
        {
          text: "Tight and dry",
          points: { dry: 10, oily: 0, sensitive: 3, aging: 2, acne: 0 },
        },
        {
          text: "Clean but comfortable",
          points: { dry: 0, oily: 0, sensitive: 0, aging: 0, acne: 0 },
        },
        {
          text: "Still feels somewhat oily",
          points: { dry: 0, oily: 8, sensitive: 0, aging: 0, acne: 5 },
        },
        {
          text: "Irritated or red",
          points: { dry: 2, oily: 0, sensitive: 10, aging: 0, acne: 0 },
        },
      ],
    },
    {
      id: 6,
      text: "How often do you experience breakouts?",
      options: [
        {
          text: "Frequently, several times a month",
          points: { dry: 0, oily: 7, sensitive: 0, aging: 0, acne: 10 },
        },
        {
          text: "Occasionally, especially during stress or hormonal changes",
          points: { dry: 0, oily: 5, sensitive: 0, aging: 0, acne: 5 },
        },
        {
          text: "Rarely, maybe once every few months",
          points: { dry: 0, oily: 2, sensitive: 0, aging: 0, acne: 2 },
        },
        {
          text: "Almost never",
          points: { dry: 2, oily: 0, sensitive: 0, aging: 2, acne: 0 },
        },
      ],
    },
    {
      id: 7,
      text: "Are you concerned about signs of aging?",
      options: [
        {
          text: "Very concerned, it's my primary skin issue",
          points: { dry: 3, oily: 0, sensitive: 0, aging: 10, acne: 0 },
        },
        {
          text: "Somewhat concerned, starting to notice changes",
          points: { dry: 2, oily: 0, sensitive: 0, aging: 7, acne: 0 },
        },
        {
          text: "A little concerned, for prevention",
          points: { dry: 1, oily: 0, sensitive: 0, aging: 4, acne: 0 },
        },
        {
          text: "Not concerned at this time",
          points: { dry: 0, oily: 0, sensitive: 0, aging: 0, acne: 0 },
        },
      ],
    },
    {
      id: 8,
      text: "How would you describe your skin's sensitivity level?",
      options: [
        {
          text: "Highly sensitive, reacts to many products and environmental factors",
          points: { dry: 3, oily: 0, sensitive: 10, aging: 0, acne: 2 },
        },
        {
          text: "Moderately sensitive, occasional reactions",
          points: { dry: 2, oily: 0, sensitive: 6, aging: 0, acne: 1 },
        },
        {
          text: "Slightly sensitive in specific situations",
          points: { dry: 1, oily: 0, sensitive: 3, aging: 0, acne: 0 },
        },
        {
          text: "Not sensitive, can use most products without issues",
          points: { dry: 0, oily: 0, sensitive: 0, aging: 0, acne: 0 },
        },
      ],
    },
  ]

  // Service recommendations based on skin profiles
  const serviceRecommendations: Record<string, ServiceRecommendation> = {
    dry: {
      type: "Dry Skin",
      name: "Hydration Boost Package",
      description:
        "A specialized treatment focusing on deep hydration with hyaluronic acid serums, moisturizing masks, and gentle exfoliation to remove flaky skin. Includes facial massage to stimulate circulation.",
    },
    oily: {
      type: "Oily Skin",
      name: "Oil Control & Balance Package",
      description:
        "Targeted treatments to regulate sebum production, unclog pores, and balance skin's natural oils. Includes clay masks, gentle astringents, and oil-free hydration.",
    },
    sensitive: {
      type: "Sensitive Skin",
      name: "Calming & Soothing Package",
      description:
        "Gentle treatments designed for reactive skin, focusing on reducing inflammation and strengthening the skin barrier. Features calming ingredients like centella asiatica, aloe, and chamomile.",
    },
    aging: {
      type: "Aging Skin",
      name: "Age Defying Package",
      description:
        "Comprehensive anti-aging treatments including collagen-boosting peptides, antioxidant serums, and gentle retinol treatments. Includes facial massage and LED light therapy to stimulate cell renewal.",
    },
    acne: {
      type: "Acne-Prone Skin",
      name: "Clear Skin Package",
      description:
        "Specialized acne-fighting treatments with salicylic acid, benzoyl peroxide, and antibacterial ingredients. Includes gentle extraction, blue LED light therapy, and non-comedogenic hydration.",
    },
  }

  const handleOptionSelect = (optionIndex: number) => {
    const newSelectedOptions = [...selectedOptions]
    newSelectedOptions[currentQuestion] = optionIndex
    setSelectedOptions(newSelectedOptions)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      calculateResults()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateResults = () => {
    // Calculate skin profile based on selected options
    const newProfile: SkinProfile = {
      dry: 0,
      oily: 0,
      sensitive: 0,
      aging: 0,
      acne: 0,
    }

    selectedOptions.forEach((optionIndex, questionIndex) => {
      if (optionIndex !== undefined && questions[questionIndex]) {
        const selectedOption = questions[questionIndex].options[optionIndex]
        if (selectedOption) {
          newProfile.dry += selectedOption.points.dry
          newProfile.oily += selectedOption.points.oily
          newProfile.sensitive += selectedOption.points.sensitive
          newProfile.aging += selectedOption.points.aging
          newProfile.acne += selectedOption.points.acne
        }
      }
    })

    setSkinProfile(newProfile)

    // Determine the highest scoring skin type
    const skinTypes = Object.keys(newProfile) as Array<keyof SkinProfile>
    let highestType = skinTypes[0]
    let highestScore = newProfile[highestType]

    skinTypes.forEach((type) => {
      if (newProfile[type] > highestScore) {
        highestScore = newProfile[type]
        highestType = type
      }
    })

    // Set recommended service based on highest skin type score
    setRecommendedService(serviceRecommendations[highestType])
    setShowResults(true)

    // Optional: Save results to backend
    saveResultsToBackend(newProfile, serviceRecommendations[highestType])
  }

  const saveResultsToBackend = async (profile: SkinProfile, recommendation: ServiceRecommendation) => {
    try {
      // You can adjust the endpoint URL to match your Node.js backend
      await axios.post("http://localhost:5000/api/skin-assessment", {
        profile,
        recommendation,
        timestamp: new Date().toISOString(),
      })
      console.log("Assessment results saved successfully")
    } catch (error) {
      console.error("Error saving assessment results:", error)
    }
  }

  const handleRetakeQuiz = () => {
    setCurrentQuestion(0)
    setSelectedOptions([])
    setSkinProfile({
      dry: 0,
      oily: 0,
      sensitive: 0,
      aging: 0,
      acne: 0,
    })
    setShowResults(false)
    setRecommendedService(null)
  }

  const handleViewServices = () => {
    // Save recommendation to localStorage for the services page to use
    if (recommendedService) {
      localStorage.setItem(
        "skinAssessmentResult",
        JSON.stringify({
          skinProfile,
          recommendedService,
        }),
      )
    }
    // Navigate to services page using React Router
    navigate("/services")
  }

  return (
    <Layout>
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {!showResults ? (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Skin Assessment Quiz</h1>
              <p className="text-gray-600">
                Answer these questions to receive a personalized skincare service recommendation.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-6">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-right text-sm text-gray-500 mt-1">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{questions[currentQuestion].text}</h2>
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedOptions[currentQuestion] === index
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                          selectedOptions[currentQuestion] === index
                            ? "border-purple-500 bg-purple-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedOptions[currentQuestion] === index && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <span className="text-gray-800">{option.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className={`flex items-center px-6 py-2 rounded-lg transition-colors duration-200 ${
                  currentQuestion === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={selectedOptions[currentQuestion] === undefined}
                className={`flex items-center px-6 py-2 rounded-lg transition-colors duration-200 ${
                  selectedOptions[currentQuestion] === undefined
                    ? "bg-purple-300 text-white cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                {currentQuestion < questions.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  "See Results"
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Skin Assessment Results</h1>
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mx-auto flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>

            {recommendedService && (
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Your Skin Type: <span className="text-purple-600">{recommendedService.type}</span>
                </h2>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Recommended: {recommendedService.name}</h3>
                <p className="text-gray-600 mb-6">{recommendedService.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                  {Object.entries(skinProfile).map(([type, score]) => (
                    <div key={type} className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-500 capitalize">{type}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full"
                          style={{ width: `${Math.min(100, (score / 50) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleRetakeQuiz}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Retake Quiz
              </button>
              <button
                onClick={handleViewServices}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors duration-200"
              >
                View Recommended Services
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </Layout>
  )
}

export default SkinAssessmentQuiz

