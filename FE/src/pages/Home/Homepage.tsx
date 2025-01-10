import React from "react";
import Layout from "../../layout/Layout";
import video1 from "../../assets/video/invideo-ai-1080 Discover the Magic of LuLuSpa_ Your Skin 2025-01-10.mp4";

const HomePage: React.FC = () => {
  return (
    <div>
      <Layout>
        <section>
          <div
            style={{
              width: "100%",
              height: "100%", // Đặt chiều cao của video bằng chiều cao của cửa sổ trình duyệt
              overflow: "hidden",
              position: "relative",
            }}
          >
            <video
              src={video1}
              autoPlay // Tự động phát video khi trang web được tải
              loop // Lặp lại video sau khi kết thúc
              controls // Hiển thị các nút điều khiển video
              style={{
                width: "100%",
                height: "50%", // Video chiếm toàn bộ chiều cao của phần chứa
                objectFit: "cover", // Giữ tỷ lệ khung hình của video, không bị méo
                position: "relative", // Đảm bảo video luôn nằm trong phần chứa
                top: 0,
                left: 0,
              }}
            ></video>
          </div>
        </section>

        <section className="bg-gray-100 py-16">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-10">Skincare Combo Packages</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-800">Glow & Radiance Combo</h3>
                <p className="mt-4 text-gray-600">Includes facial treatment, acne therapy, and a rejuvenating mask for ultimate glow.</p>
                <p className="mt-4 text-xl font-bold text-gray-900">$120</p>
                <button className="mt-6 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Book Now</button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-800">Clear Skin Combo</h3>
                <p className="mt-4 text-gray-600">Combines acne therapy with a deep cleansing facial to combat blemishes and refresh your skin.</p>
                <p className="mt-4 text-xl font-bold text-gray-900">$100</p>
                <button className="mt-6 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Book Now</button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-800">Anti-Aging Combo</h3>
                <p className="mt-4 text-gray-600">A package focused on anti-aging with facial treatments, collagen boosters, and moisturizing masks.</p>
                <p className="mt-4 text-xl font-bold text-gray-900">$150</p>
                <button className="mt-6 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Book Now</button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-10">Latest from our Blog</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-800">How to Choose the Right Skincare Combo</h3>
                <p className="mt-4 text-gray-600">Discover the best skincare packages tailored to your skin type and needs.</p>
                <button className="mt-6 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Read More</button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-800">The Benefits of Acne Therapy</h3>
                <p className="mt-4 text-gray-600">Learn how acne therapy can clear up your skin and boost your confidence. It brings to more comfortable for you.</p>
                <button className="mt-6 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Read More</button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-800">Why Facial Treatments Are Essential</h3>
                <p className="mt-4 text-gray-600">Explore the science behind facial treatments and why they're crucial for healthy, glowing skin.</p>
                <button className="mt-6 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Read More</button>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </div>
  );
};

export default HomePage;
