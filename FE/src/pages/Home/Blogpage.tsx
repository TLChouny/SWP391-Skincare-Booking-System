import React from 'react';
import Layout from '../../layout/Layout';

const blogs = [
  {
    id: 1,
    title: "Chăm sóc da: Hướng dẫn và mẹo",
    author: "Nguyễn Văn A",
    description: "Chào mừng bạn đến với blog chăm sóc da của chúng tôi! Tại đây, bạn sẽ tìm thấy những mẹo và hướng dẫn hữu ích để có làn da khỏe mạnh.",
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    content: "Để có làn da khỏe mạnh, bạn cần thực hiện các bước chăm sóc da hàng ngày như làm sạch, dưỡng ẩm và bảo vệ da khỏi ánh nắng mặt trời."
  },
  {
    id: 2,
    title: "Bí quyết làm đẹp tự nhiên",
    author: "Trần Thị B",
    description: "Khám phá những bí quyết làm đẹp tự nhiên từ thiên nhiên giúp bạn có làn da rạng rỡ.",
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    content: "Sử dụng các nguyên liệu tự nhiên như mật ong, chanh và dưa leo để chăm sóc da mặt."
  },
  {
    id: 3,
    title: "Sản phẩm dưỡng da tốt nhất cho mùa hè",
    author: "Lê Văn C",
    description: "Tìm hiểu về những sản phẩm dưỡng da phù hợp cho mùa hè nóng bức.",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    content: "Chọn sản phẩm có chỉ số SPF cao và độ ẩm tốt để bảo vệ làn da khỏi ánh nắng mặt trời."
  },
  {
    id: 4,
    title: "Chăm sóc da nhạy cảm",
    author: "Phạm Thị D",
    description: "Hướng dẫn chi tiết về cách chăm sóc và bảo vệ làn da nhạy cảm.",
    image: "https://images.unsplash.com/photo-1505944270255-72b8c68c6a70?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    content: "Sử dụng các sản phẩm không chứa hương liệu và chất tạo màu, đồng thời tránh các yếu tố kích ứng như nắng gắt và ô nhiễm."
  },
  {
    id: 5,
    title: "Chế độ ăn uống cho làn da khỏe mạnh",
    author: "Hoàng Văn E",
    description: "Khám phá những thực phẩm giúp cải thiện sức khỏe làn da từ bên trong.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    content: "Bổ sung các thực phẩm giàu vitamin C, E, và omega-3 để tăng cường sức khỏe làn da."
  },
  {
    id: 6,
    title: "Bí quyết chăm sóc da ban đêm",
    author: "Ngô Thị F",
    description: "Tìm hiểu về quy trình chăm sóc da ban đêm hiệu quả để có làn da tươi trẻ mỗi sáng thức dậy.",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    content: "Sử dụng serum chứa retinol và kem dưỡng ẩm đậm đặc để phục hồi và tái tạo da trong khi bạn ngủ."
  }
];

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-4">{children}</div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>
);

const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-4">{children}</div>
);

const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-4 border-t ${className}`}>
    {children}
  </div>
);

const Button: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <button className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${className}`}>
    {children}
  </button>
);

const BlogPage: React.FC = () => {
  return (
    <Layout>
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Blog Chăm Sóc Da</h1>

        {/* Featured Post */}
        <div className="mb-12">
          <Card className="md:flex">
            <div className="md:flex-shrink-0">
              <img
                src={blogs[0].image || "/placeholder.svg"}
                alt={blogs[0].title}
                className="h-48 w-full object-cover md:h-full md:w-48"
              />
            </div>
            <div className="p-8">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">{blogs[0].title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mt-2 text-gray-600">{blogs[0].description}</p>
              </CardContent>
              <CardFooter>
                <Button>
                  <a href={`/blog/${blogs[0].id}`}>Đọc thêm</a>
                </Button>
              </CardFooter>
            </div>
          </Card>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.slice(1).map((blog) => (
            <Card key={blog.id} className="hover:shadow-lg transition-shadow duration-300">
              <img
                src={blog.image || "/placeholder.svg"}
                alt={blog.title}
                className="w-full h-48 object-cover"
              />
              <CardHeader>
                <CardTitle className="text-gray-900">{blog.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-2">{blog.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{blog.author}</span>
                <Button className="bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
                  <a href={`/blog/${blog.id}`}>Đọc thêm</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default BlogPage;
