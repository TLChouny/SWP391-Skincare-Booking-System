import React, { useState } from "react";
import { motion } from "framer-motion";
import { Service } from "../../types/booking";

interface SearchFilterProps {
  services: Service[];
  onFilter: (filteredServices: Service[]) => void;
}

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.3 } },
  tap: { scale: 0.95, transition: { duration: 0.2 } },
};

// Hàm viết hoa chữ cái đầu tiên, xử lý cả undefined
const capitalizeFirstLetter = (str?: string) => {
  if (!str) return "Unknown"; // Trả về "Unknown" nếu str là undefined hoặc rỗng
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const SearchFilter: React.FC<SearchFilterProps> = ({ services, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000000]);

  // Calculate maximum price from services
  const maxPrice = Math.max(
    ...services.map((service) =>
      service.discountedPrice !== undefined && service.discountedPrice !== null
        ? service.discountedPrice
        : service.price ?? 0
    ),
    10000000
  );

  // Predefined price ranges
  const priceRanges = [
    { label: "All Prices", value: [0, maxPrice] },
    { label: "Under 500K", value: [0, 500000] },
    { label: "500K - 1M", value: [500000, 1000000] },
    { label: "1M - 2M", value: [1000000, 2000000] },
    { label: "2M - 5M", value: [2000000, 5000000] },
    { label: "Above 5M", value: [5000000, maxPrice] },
  ];

  // Lấy danh sách category và chỉ viết hoa chữ cái đầu
  const categories = [
    "all",
    ...new Set(
      services
        .map((service) => service.category?.name)
        .filter(Boolean)
        .map((name) => capitalizeFirstLetter(name))
    ),
  ];

  const handleFilter = () => {
    let filtered = [...services];
    if (searchTerm) {
      filtered = filtered.filter((service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (service) =>
          service.category?.name &&
          capitalizeFirstLetter(service.category.name) === selectedCategory
      );
    }
    filtered = filtered.filter((service) => {
      const effectivePrice =
        service.discountedPrice !== undefined && service.discountedPrice !== null
          ? service.discountedPrice
          : service.price ?? 0;
      return effectivePrice >= priceRange[0] && effectivePrice <= priceRange[1];
    });
    onFilter(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    handleFilter();
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    handleFilter();
  };

  const handlePriceRangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRange = priceRanges.find((range) => range.label === e.target.value);
    if (selectedRange) {
      setPriceRange(selectedRange.value);
      handleFilter();
    }
  };

  return (
    <motion.div
      className="bg-gray-50 py-6 mb-12"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-8 flex items-end justify-between gap-6">
        {/* Search Input */}
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Services</label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by name or description..."
              className="w-full p-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-gray-400 transition-all duration-300"
            />
            <svg
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full p-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
          >
            {categories.map((category) => (
              <option key={category} value={category} className="text-gray-700">
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range Dropdown */}
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (VNĐ)</label>
          <select
            onChange={handlePriceRangeSelect}
            className="w-full p-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
          >
            {priceRanges.map((range) => (
              <option key={range.label} value={range.label}>
                {range.label}{" "}
                {range.label !== "All Prices"
                  ? `(${range.value[0].toLocaleString("en-US")} - ${range.value[1].toLocaleString("en-US")})`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Apply Button */}
        <div className="flex-shrink-0">
          <motion.button
            onClick={handleFilter}
            className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-300 transition-all duration-300 shadow-sm"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Apply
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchFilter;