// lib/data.ts
import type { Project, BlogPost, ContactMessage } from "./types";

export const projects: Project[] = [
  {
    id: 1,
    title: "Docker Portfolio Demo",
    description: "A modern portfolio website built with Next.js 15, demonstrating Docker containerization and deployment strategies",
    image_url: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&h=400&fit=crop",
    technologies: ["Next.js", "TypeScript", "Docker", "Tailwind CSS", "MUI"],
    live_url: "https://portfolio-demo.vercel.app",
    github_url: "https://github.com/hzeroxium/portfolio-demo",
    featured: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    title: "E-commerce Platform",
    description: "Full-stack e-commerce solution with React, Node.js, and PostgreSQL, featuring payment integration and admin dashboard",
    image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
    technologies: ["React", "Node.js", "PostgreSQL", "Stripe", "Redis"],
    live_url: "https://ecommerce-demo.vercel.app",
    github_url: "https://github.com/hzeroxium/ecommerce-platform",
    featured: true,
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2024-01-10T10:00:00Z",
  },
  {
    id: 3,
    title: "Task Management App",
    description: "Real-time task management application with collaboration features, built with Next.js and Socket.io",
    image_url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop",
    technologies: ["Next.js", "TypeScript", "Prisma", "Socket.io", "PostgreSQL"],
    live_url: "https://taskapp-demo.vercel.app",
    github_url: "https://github.com/hzeroxium/task-management",
    featured: true,
    created_at: "2024-01-05T10:00:00Z",
    updated_at: "2024-01-05T10:00:00Z",
  },
  {
    id: 4,
    title: "Weather Dashboard",
    description: "Interactive weather dashboard with data visualization and forecast, using OpenWeather API",
    image_url: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&h=400&fit=crop",
    technologies: ["Vue.js", "Chart.js", "OpenWeather API", "Tailwind CSS"],
    live_url: "https://weather-dashboard-demo.vercel.app",
    github_url: "https://github.com/hzeroxium/weather-dashboard",
    featured: false,
    created_at: "2023-12-20T10:00:00Z",
    updated_at: "2023-12-20T10:00:00Z",
  },
  {
    id: 5,
    title: "Social Media Analytics",
    description: "Analytics dashboard for social media metrics with real-time data processing and visualization",
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    technologies: ["Python", "Django", "React", "D3.js", "PostgreSQL"],
    live_url: "https://analytics-demo.vercel.app",
    github_url: "https://github.com/hzeroxium/social-analytics",
    featured: false,
    created_at: "2023-12-15T10:00:00Z",
    updated_at: "2023-12-15T10:00:00Z",
  },
  {
    id: 6,
    title: "Microservices Architecture Demo",
    description: "Demonstration of microservices architecture with Docker, Kubernetes, and service mesh",
    image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop",
    technologies: ["Docker", "Kubernetes", "Node.js", "Go", "gRPC"],
    live_url: "https://microservices-demo.vercel.app",
    github_url: "https://github.com/hzeroxium/microservices-demo",
    featured: false,
    created_at: "2023-12-10T10:00:00Z",
    updated_at: "2023-12-10T10:00:00Z",
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Getting Started with Docker for Web Development",
    slug: "getting-started-with-docker-web-development",
    excerpt: "Learn how to containerize your web applications with Docker for consistent development and deployment environments",
    content: `# Getting Started with Docker for Web Development

Docker has revolutionized how we develop and deploy applications. In this comprehensive guide, we'll explore how to leverage Docker for web development.

## Why Docker?

Docker provides several key benefits for web developers:

- **Consistency**: Your application runs the same way in development, testing, and production
- **Isolation**: Each container runs in its own environment
- **Portability**: Run your application on any system that supports Docker
- **Scalability**: Easily scale your application horizontally

## Basic Docker Concepts

### Images
Docker images are read-only templates used to create containers. Think of them as snapshots of your application and its dependencies.

### Containers
Containers are running instances of Docker images. They're lightweight and portable.

### Dockerfile
A Dockerfile is a text file containing instructions to build a Docker image.

## Creating Your First Dockerfile

Here's a basic Dockerfile for a Next.js application:

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## Docker Compose for Multi-Container Applications

For complex applications, Docker Compose helps orchestrate multiple containers:

\`\`\`yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
\`\`\`

## Best Practices

1. **Use multi-stage builds** to reduce image size
2. **Don't run as root** - create a non-root user
3. **Use .dockerignore** to exclude unnecessary files
4. **Keep images small** - use Alpine Linux variants
5. **Cache dependencies** - copy package.json before source code

## Conclusion

Docker is an essential tool for modern web development. It simplifies deployment, ensures consistency, and makes scaling easier. Start with simple containerization and gradually adopt more advanced patterns as your needs grow.`,
    published: true,
    created_at: "2024-01-12T10:00:00Z",
    updated_at: "2024-01-12T10:00:00Z",
  },
  {
    id: 2,
    title: "Next.js 15: What's New and Exciting",
    slug: "nextjs-15-whats-new-and-exciting",
    excerpt: "Explore the latest features and improvements in Next.js 15, including enhanced performance and developer experience",
    content: `# Next.js 15: What's New and Exciting

Next.js 15 brings significant improvements to performance, developer experience, and deployment capabilities. Let's dive into the key features.

## Key Features

### 1. Improved App Router
The App Router continues to evolve with better performance and more intuitive APIs.

### 2. Enhanced Server Components
Server Components now support more use cases and have better streaming capabilities.

### 3. Better TypeScript Support
Improved type inference and better error messages make development smoother.

### 4. Performance Optimizations
- Faster builds
- Reduced bundle sizes
- Better caching strategies

## Migration Guide

If you're upgrading from Next.js 14, here's what you need to know:

1. Update your package.json
2. Review breaking changes
3. Test your application thoroughly
4. Update your deployment configuration

## Conclusion

Next.js 15 represents a significant step forward in React development. The improvements in performance and developer experience make it easier than ever to build modern web applications.`,
    published: true,
    created_at: "2024-01-08T10:00:00Z",
    updated_at: "2024-01-08T10:00:00Z",
  },
  {
    id: 3,
    title: "Building Scalable Microservices with Docker",
    slug: "building-scalable-microservices-with-docker",
    excerpt: "Learn how to design and implement scalable microservices architecture using Docker and container orchestration",
    content: `# Building Scalable Microservices with Docker

Microservices architecture has become the go-to approach for building scalable, maintainable applications. Docker plays a crucial role in this architecture.

## What are Microservices?

Microservices are small, independent services that communicate over well-defined APIs. Each service:

- Runs in its own process
- Has its own database
- Can be deployed independently
- Communicates via HTTP/REST or messaging

## Docker and Microservices

Docker containers are perfect for microservices because:

- **Isolation**: Each service runs in its own container
- **Portability**: Containers run consistently across environments
- **Scalability**: Easy to scale individual services
- **Resource efficiency**: Containers share the host OS kernel

## Service Communication

### Synchronous Communication
- HTTP/REST APIs
- GraphQL
- gRPC

### Asynchronous Communication
- Message queues (RabbitMQ, Apache Kafka)
- Event-driven architecture
- Publish/subscribe patterns

## Orchestration with Docker Compose

For local development, Docker Compose simplifies multi-container applications:

\`\`\`yaml
version: '3.8'
services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    depends_on:
      - user-service
      - product-service
  
  user-service:
    build: ./user-service
    environment:
      - DATABASE_URL=postgres://user:pass@user-db:5432/users
    depends_on:
      - user-db
  
  product-service:
    build: ./product-service
    environment:
      - DATABASE_URL=postgres://user:pass@product-db:5432/products
    depends_on:
      - product-db
  
  user-db:
    image: postgres:15
    environment:
      POSTGRES_DB: users
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
  
  product-db:
    image: postgres:15
    environment:
      POSTGRES_DB: products
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
\`\`\`

## Best Practices

1. **Single Responsibility**: Each service should have one clear purpose
2. **Decentralized**: Services should be autonomous
3. **Fault Tolerance**: Design for failure
4. **Monitoring**: Implement comprehensive logging and monitoring
5. **API Versioning**: Version your APIs for backward compatibility

## Challenges and Solutions

### Service Discovery
Use tools like Consul, Eureka, or Kubernetes DNS for service discovery.

### Data Consistency
Implement eventual consistency patterns and use distributed transaction patterns like Saga.

### Monitoring and Debugging
Use distributed tracing tools like Jaeger or Zipkin to track requests across services.

## Conclusion

Microservices with Docker provide a powerful foundation for building scalable applications. While they introduce complexity, the benefits of scalability, maintainability, and team autonomy make them worthwhile for many projects.`,
    published: true,
    created_at: "2024-01-05T10:00:00Z",
    updated_at: "2024-01-05T10:00:00Z",
  },
  {
    id: 4,
    title: "Modern Frontend Development with React and TypeScript",
    slug: "modern-frontend-development-react-typescript",
    excerpt: "Master modern frontend development techniques using React, TypeScript, and the latest tools and best practices",
    content: `# Modern Frontend Development with React and TypeScript

The frontend development landscape has evolved significantly. Let's explore modern techniques and best practices for building robust React applications with TypeScript.

## Why TypeScript?

TypeScript provides:
- **Static typing**: Catch errors at compile time
- **Better IDE support**: Enhanced autocomplete and refactoring
- **Improved maintainability**: Self-documenting code
- **Better refactoring**: Safe code changes

## Setting Up a Modern React Project

### Using Vite
\`\`\`bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
\`\`\`

### Using Next.js
\`\`\`bash
npx create-next-app@latest my-app --typescript
cd my-app
npm run dev
\`\`\`

## Component Architecture

### Functional Components with Hooks
\`\`\`typescript
interface UserProfileProps {
  userId: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};
\`\`\`

### Custom Hooks
\`\`\`typescript
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading, error };
}
\`\`\`

## State Management

### Context API
\`\`\`typescript
interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
}

const AppContext = createContext<AppState | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
\`\`\`

### Zustand (Recommended)
\`\`\`typescript
import { create } from 'zustand';

interface AppStore {
  user: User | null;
  setUser: (user: User | null) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const useAppStore = create<AppStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  theme: 'light',
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),
}));
\`\`\`

## Styling Solutions

### Tailwind CSS
\`\`\`typescript
const Button: React.FC<ButtonProps> = ({ children, variant = 'primary' }) => {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };

  return (
    <button className={\`\${baseClasses} \${variantClasses[variant]}\`}>
      {children}
    </button>
  );
};
\`\`\`

### CSS Modules
\`\`\`typescript
import styles from './Button.module.css';

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary' }) => {
  return (
    <button className={\`\${styles.button} \${styles[variant]}\`}>
      {children}
    </button>
  );
};
\`\`\`

## Testing

### Unit Tests with Jest and React Testing Library
\`\`\`typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
\`\`\`

## Performance Optimization

### Code Splitting
\`\`\`typescript
const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
\`\`\`

### Memoization
\`\`\`typescript
const ExpensiveComponent = React.memo(({ data }: { data: Data[] }) => {
  const processedData = useMemo(() => 
    data.map(item => ({ ...item, processed: true })), 
    [data]
  );

  return <div>{/* render processed data */}</div>;
});
\`\`\`

## Conclusion

Modern React development with TypeScript provides a robust foundation for building scalable applications. Focus on component composition, proper state management, and performance optimization to create maintainable and efficient applications.`,
    published: true,
    created_at: "2024-01-02T10:00:00Z",
    updated_at: "2024-01-02T10:00:00Z",
  },
];

export const contactMessages: ContactMessage[] = [
  // This would normally be stored in a database
  // For demo purposes, we'll keep it empty
];

// Helper functions to simulate database operations
export function getFeaturedProjects(): Project[] {
  return projects.filter(project => project.featured);
}

export function getAllProjects(): Project[] {
  return projects;
}

export function getPublishedBlogPosts(): BlogPost[] {
  return blogPosts.filter(post => post.published);
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  return blogPosts.find(post => post.slug === slug && post.published) || null;
}

export function createContactMessage(name: string, email: string, message: string): void {
  // In a real application, this would save to a database
  console.log('Contact message received:', { name, email, message });
  // For demo purposes, we'll just log it
}
