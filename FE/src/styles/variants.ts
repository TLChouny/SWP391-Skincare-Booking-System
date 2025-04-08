export const sectionVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };
  
  export const serviceCardVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    hover: {
      y: -15,
      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };
  
  export const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        yoyo: Number.POSITIVE_INFINITY,
      },
    },
    tap: {
      scale: 0.95,
      boxShadow: "0 5px 10px rgba(0,0,0,0.1)",
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };
  
  export const therapistCardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };
  
  export const textRevealVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

// Chức năng: Tệp chứa các animation variants dùng chung cho các component.
// Vai trò:
// Định nghĩa các variants cho animation của framer-motion, bao gồm:
// sectionVariants: Hiệu ứng xuất hiện từ dưới lên cho các section.
// serviceCardVariants: Hiệu ứng xuất hiện từ trái sang phải và nâng lên khi hover cho các thẻ (dịch vụ, bài viết).
// buttonVariants: Hiệu ứng phóng to và thu nhỏ khi hover/tap cho các nút.
// therapistCardVariants: Hiệu ứng phóng to và xuất hiện cho các thẻ chuyên gia.
// textRevealVariants: Hiệu ứng xuất hiện từ dưới lên cho tiêu đề và mô tả trong SectionHeader.