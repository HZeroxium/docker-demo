-- scripts/002-seed-data.sql
INSERT INTO projects (title, description, image_url, technologies, live_url, github_url, featured) VALUES
('E-commerce Platform', 'Nền tảng thương mại điện tử hoàn chỉnh', '/placeholder.svg?height=200&width=300', ARRAY['React', 'Node.js', 'PostgreSQL'], 'https://example.com', 'https://github.com', true),
('Task Management App', 'Ứng dụng quản lý công việc real-time', '/placeholder.svg?height=200&width=300', ARRAY['Next.js', 'TypeScript', 'Socket.io'], 'https://example.com', 'https://github.com', true);

INSERT INTO blog_posts (title, slug, excerpt, content, published) VALUES
('Bắt đầu với Next.js 15', 'bat-dau-voi-nextjs-15', 'Hướng dẫn chi tiết về Next.js 15', 'Next.js 15 đã ra mắt với nhiều tính năng mới...', true),
('Docker cho Frontend', 'docker-cho-frontend', 'Sử dụng Docker trong frontend development', 'Docker giúp tạo môi trường development nhất quán...', true);