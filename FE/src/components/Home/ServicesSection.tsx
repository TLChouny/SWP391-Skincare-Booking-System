import React from "react";
import { motion } from "framer-motion";
import { Service } from "../../types/booking";
import ServiceCard from "./ServiceCard";
import SectionHeader from "./SectionHeader";
import { sectionVariants } from "../../styles/variants";

interface ServicesSectionProps {
  services: Service[];
  handleBookNow: (id: string) => void;
  servicesInView: boolean;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  handleBookNow,
  servicesInView,
}) => {
  return (
    <motion.div
      animate="visible" // Luôn hiển thị
      initial="hidden"
      variants={sectionVariants}
    >
      <section className="py-24 bg-gradient-to-b from-yellow-50 to-white">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Luxurious Skincare Packages"
            description="Discover our premium skincare treatments designed to rejuvenate and transform your skin"
          />

          {services.length > 0 ? (
            <div className="relative overflow-hidden">
              <motion.div
                className="flex"
                animate={{
                  x: ["0%", "-100%"],
                  transition: {
                    x: {
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "loop",
                      duration: services.length * 2,
                      ease: "linear",
                    },
                  },
                }}
              >
                {[...services, ...services].map((service, index) => (
                  <ServiceCard
                    key={`${service._id}-${index}`}
                    service={service}
                    index={index}
                    handleBookNow={handleBookNow}
                  />
                ))}
              </motion.div>
            </div>
          ) : (
            <p className="text-gray-600 text-center">
              Our luxurious services are being prepared. Please check back soon.
            </p>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default ServicesSection;
// ServicesSection.tsx
// Chức năng: Hiển thị section "Luxurious Skincare Packages", chứa danh sách các dịch vụ.
// Vai trò:
// Sử dụng SectionHeader để hiển thị tiêu đề và mô tả của section.
// Hiển thị danh sách các dịch vụ dưới dạng carousel (dùng motion.div để tạo hiệu ứng trượt ngang).
// Nếu không có dịch vụ (services.length === 0), hiển thị thông báo "Our luxurious services are being prepared...".
// Mỗi dịch vụ được render bằng ServiceCard.