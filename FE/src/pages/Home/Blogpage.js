import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useParams } from 'react-router-dom';
const Blog = () => {
    const { id } = useParams();
    // Fetch blog details using the ID from params
    // Display detailed blog content here
    return (_jsx("div", { children: _jsxs("h1", { children: ["Blog Details for ID: ", id] }) }));
};
export default Blog;
