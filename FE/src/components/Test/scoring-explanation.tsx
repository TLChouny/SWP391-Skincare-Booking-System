import type React from "react"

const ScoringExplanation: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Skin Assessment Scoring System Explanation</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Overview</h2>
        <p className="text-gray-600 mb-4">
          The skin assessment quiz uses a point-based system to evaluate different aspects of a user's skin condition.
          Each answer contributes points to five different skin profile categories: dry, oily, sensitive, aging, and
          acne-prone.
        </p>
        <p className="text-gray-600">
          After completing the quiz, the system calculates the total points for each category and recommends the most
          appropriate skincare service based on the highest-scoring category.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Scoring Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-2">Dry Skin</h3>
            <p className="text-gray-700">
              Points are assigned when answers indicate skin tightness, flakiness, discomfort after cleansing, and lack
              of natural oils. High scores suggest dehydrated skin that needs moisture-focused treatments.
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-bold text-green-800 mb-2">Oily Skin</h3>
            <p className="text-gray-700">
              Points accumulate for answers indicating excess sebum production, shiny appearance, enlarged pores, and
              frequent need for blotting. High scores suggest treatments focused on oil control.
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-bold text-red-800 mb-2">Sensitive Skin</h3>
            <p className="text-gray-700">
              Points are given for reactions to products, environmental factors, redness, irritation, and stinging
              sensations. High scores indicate a need for gentle, soothing treatments.
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-bold text-purple-800 mb-2">Aging Skin</h3>
            <p className="text-gray-700">
              Points reflect concerns about fine lines, wrinkles, loss of elasticity, and other age-related changes.
              High scores suggest anti-aging focused treatments with collagen-boosting ingredients.
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-bold text-yellow-800 mb-2">Acne-Prone Skin</h3>
            <p className="text-gray-700">
              Points accumulate for frequent breakouts, clogged pores, inflammation, and post-acne marks. High scores
              indicate a need for clarifying and antibacterial treatments.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Point Distribution</h2>
        <p className="text-gray-600 mb-4">
          Each answer option in the quiz is assigned a specific point value for each skin category:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>
            <strong>0 points</strong>: The answer does not indicate this skin condition
          </li>
          <li>
            <strong>1-3 points</strong>: The answer slightly indicates this skin condition
          </li>
          <li>
            <strong>4-7 points</strong>: The answer moderately indicates this skin condition
          </li>
          <li>
            <strong>8-10 points</strong>: The answer strongly indicates this skin condition
          </li>
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Result Calculation</h2>
        <p className="text-gray-600 mb-4">After the user completes all questions, the system:</p>
        <ol className="list-decimal pl-6 space-y-2 text-gray-600">
          <li>Sums up the points for each skin category across all questions</li>
          <li>Identifies the category with the highest total score</li>
          <li>Recommends the skincare service package that best addresses the needs of that skin type</li>
        </ol>
        <p className="text-gray-600 mt-4">
          In case of a tie between categories, the system prioritizes the more specific condition (e.g., acne or
          sensitivity over general dryness or oiliness).
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Service Recommendations</h2>
        <p className="text-gray-600 mb-4">
          Based on the highest-scoring category, the system recommends one of the following service packages:
        </p>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <h3 className="font-bold text-gray-800">Hydration Boost Package (Dry Skin)</h3>
            <p className="text-gray-600">For dehydrated skin needing moisture replenishment</p>
          </div>

          <div className="border-l-4 border-green-500 pl-4 py-2">
            <h3 className="font-bold text-gray-800">Oil Control & Balance Package (Oily Skin)</h3>
            <p className="text-gray-600">For regulating sebum production and minimizing shine</p>
          </div>

          <div className="border-l-4 border-red-500 pl-4 py-2">
            <h3 className="font-bold text-gray-800">Calming & Soothing Package (Sensitive Skin)</h3>
            <p className="text-gray-600">For reducing irritation and strengthening the skin barrier</p>
          </div>

          <div className="border-l-4 border-purple-500 pl-4 py-2">
            <h3 className="font-bold text-gray-800">Age Defying Package (Aging Skin)</h3>
            <p className="text-gray-600">For addressing fine lines and improving skin elasticity</p>
          </div>

          <div className="border-l-4 border-yellow-500 pl-4 py-2">
            <h3 className="font-bold text-gray-800">Clear Skin Package (Acne-Prone Skin)</h3>
            <p className="text-gray-600">For treating breakouts and preventing new acne formation</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScoringExplanation

