import React from "react";
import Layout from "../../layout/Layout";
import video1 from "../../assets/video/invideo-ai-1080 Discover the Magic of LuLuSpa_ Your Skin 2025-01-10.mp4";

const HomePage: React.FC = () => {
  return (
    <div>
      <Layout>
        {/* Video Background */}
        <section>
          <div
            style={{
              width: "100%",
              height: "100vh",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <video
              src={video1}
              autoPlay
              loop
              muted
              controls={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            ></video>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            >
              <div className="container mx-auto h-full flex items-center justify-center text-center text-white">
                <h1 className="text-5xl font-bold">Discover the Magic of LuLuSpa</h1>
                <p className="mt-4 text-xl">Your Skin, Our Passion</p>
                <button className="mt-8 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                  Book Your Appointment
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Skincare Packages */}
        <section className="bg-gray-100 py-16">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-10">Our Skincare Packages</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[ 
                {
                  name: "Glow & Radiance Combo",
                  description: "Facial treatment, acne therapy, and a rejuvenating mask for ultimate glow.",
                  price: "$120",
                  image: "path_to_image_1.jpg"
                },
                {
                  name: "Clear Skin Combo",
                  description: "Combines acne therapy with a deep cleansing facial to combat blemishes.",
                  price: "$100",
                  image: "path_to_image_2.jpg"
                },
                {
                  name: "Anti-Aging Combo",
                  description: "Anti-aging facial treatments, collagen boosters, and moisturizing masks.",
                  price: "$150",
                  image: "path_to_image_3.jpg"
                },
              ].map((packageItem, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-lg transition transform hover:scale-105 hover:shadow-xl">
                  <img src={packageItem.image} alt={packageItem.name} className="w-full h-40 object-cover rounded-lg" />
                  <h3 className="text-2xl font-semibold text-gray-800 mt-4">{packageItem.name}</h3>
                  <p className="mt-4 text-gray-600">{packageItem.description}</p>
                  <p className="mt-4 text-xl font-bold text-gray-900">{packageItem.price}</p>
                  <button className="mt-6 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">Book Now</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-10">Latest from our Blog</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[ 
                {
                  title: "How to Choose the Right Skincare Combo",
                  description: "Discover the best skincare packages tailored to your skin type and needs.",
                  image: "path_to_blog_image_1.jpg"
                },
                {
                  title: "The Benefits of Acne Therapy",
                  description: "Learn how acne therapy can clear up your skin and boost your confidence.",
                  image: "path_to_blog_image_2.jpg"
                },
                {
                  title: "Why Facial Treatments Are Essential",
                  description: "Explore the science behind facial treatments and why they're crucial for healthy, glowing skin.",
                  image: "path_to_blog_image_3.jpg"
                },
              ].map((blogPost, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-lg transition transform hover:scale-105 hover:shadow-xl">
                  <img src={blogPost.image} alt={blogPost.title} className="w-full h-40 object-cover rounded-lg" />
                  <h3 className="text-2xl font-semibold text-gray-800 mt-4">{blogPost.title}</h3>
                  <p className="mt-4 text-gray-600">{blogPost.description}</p>
                  <button className="mt-6 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">Read More</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    </div>
  );
};

export default HomePage;
