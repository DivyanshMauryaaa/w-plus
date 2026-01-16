# WPlus

**AI that executes real work while talking.**

WPlus is an intelligent AI-powered assistant that helps you manage tasks, create workflows, and automate actions across your favorite apps. Built with Next.js, it combines conversational AI with powerful integrations to streamline your workflow.

## ✨ Features

### 🤖 AI Assistant (Carl)
- **Conversational AI**: Natural language interactions powered by Google Gemini
- **Context-Aware**: Maintains conversation history and context across sessions
- **Smart Token Management**: Automatically summarizes long conversations to stay within token limits
- **Markdown Support**: Rich text rendering with syntax highlighting

### 📋 Task Management
- **Todo Lists**: AI-generated actionable todo lists from your requests
- **Interactive Cards**: Check off tasks, update progress in real-time
- **Persistent Storage**: All todos saved to your chat history

### 🔄 Workflow Automation
- **Visual Workflow Builder**: Create node-based workflows with React Flow
- **Multi-Step Automation**: Chain actions together to automate complex processes
- **Integration Support**: Connect with 50+ services and platforms
- **Configurable Nodes**: Customize each step with manual or AI-generated parameters

### 🔌 Integrations

The app supports a wide range of integrations across multiple categories:

#### Communication
- **Gmail**: Send emails, search inbox, reply, manage messages
- **Slack**: Send messages, manage channels, upload files
- **WhatsApp**: Send messages, images, documents, locations
- **Google Chat**: Send messages
- **Twilio**: Send SMS, make calls

#### Calendar & Scheduling
- **Google Calendar**: Create, update, delete events, get schedules

#### Social Media
- **Instagram**: Post photos, manage profile, get insights
- **X (Twitter)**: Post tweets, search, manage followers
- **LinkedIn**: Create posts, send messages, get analytics
- **YouTube**: Upload videos, get metrics
- **Reddit**: Create posts

#### Productivity & Documentation
- **Notion**: Create pages, query databases, manage content
- **Google Docs**: Create, edit, share documents
- **Google Sheets**: Read, write, format spreadsheets
- **Google Drive**: Upload, manage, share files

#### Project Management
- **Trello**: Create cards, move tasks
- **Jira**: Create issues, add comments
- **Asana**: Create and complete tasks
- **Todoist**: Create and list tasks

#### Development
- **GitHub**: Create issues, PRs, manage repositories
- **Vercel**: Deploy and manage projects

#### Other Services
- **Airtable**: Manage records and bases
- **Stripe**: Payment processing
- **Zoom**: Create and manage meetings
- **PagerDuty**: Trigger and resolve incidents
- **Amazon S3**: Cloud storage
- **Supabase/MySQL/Redis**: Database operations

### 💬 Chat Management
- **Multiple Chats**: Create and manage multiple conversation threads
- **Chat History**: Persistent chat history with Supabase
- **URL Sharing**: Shareable chat links via URL parameters
- **Delete Chats**: Clean up old conversations

### 🎨 Modern UI
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Mode**: Theme toggle support
- **Smooth Animations**: Polished user experience
- **Accessible**: Built with accessibility in mind

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1.1** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - UI component library
- **React Flow** - Workflow visualization
- **Lucide React** - Icons

### Backend & Services
- **Google Gemini AI** - AI conversation and task generation
- **Supabase** - Database and authentication
- **Clerk** - User authentication
- **Next.js API Routes** - Serverless API endpoints

### Key Libraries
- **react-markdown** - Markdown rendering
- **rehype-highlight** - Code syntax highlighting
- **remark-gfm** - GitHub Flavored Markdown support

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18+ and npm/yarn/pnpm
- **Supabase Account** - For database and authentication
- **Clerk Account** - For user authentication
- **Google Gemini API Key** - For AI functionality

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd make-it-smoooth
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# OAuth (for integrations)
# Add OAuth credentials for each integration you want to use
```

### 4. Set Up Supabase Database

Run the SQL schema file to create the necessary tables:

```bash
# Import the schema from supabase_schema_integrations.sql
# You can do this via Supabase Dashboard > SQL Editor
```

The schema includes:
- `chats` table - Stores chat conversations
- `messages` table - Stores individual messages with metadata
- `integrations` table - Stores OAuth tokens for connected services

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
make-it-smoooth/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/              # AI chat endpoint
│   │   │   ├── execute/            # Task execution endpoints
│   │   │   └── integrations/       # OAuth integration endpoints
│   │   ├── integrations/           # Integration management pages
│   │   ├── sign-in/                # Authentication pages
│   │   ├── sign-up/
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Main chat interface
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── workflow/               # Workflow-related components
│   │   ├── TodoListCard.tsx        # Todo list component
│   │   ├── markdown-renderer.tsx   # Markdown rendering
│   │   └── theme-toggle.tsx        # Theme switcher
│   └── lib/
│       ├── supabase.ts             # Supabase client
│       ├── integrations.ts          # Integration definitions
│       ├── executor.ts              # Task execution logic
│       └── oauth_config.ts          # OAuth configuration
├── public/                          # Static assets
├── package.json
├── tsconfig.json
└── next.config.ts
```

## 🎯 Usage

### Starting a Conversation

1. Sign in with your Clerk account
2. Type your message in the input field
3. Carl (the AI assistant) will respond with helpful information

### Creating Todo Lists

Ask Carl to help you organize tasks:
- "Help me plan my day"
- "Create a todo list for launching my product"
- "Organize my project tasks"

Carl will generate an interactive todo list that you can check off as you complete tasks.

### Building Workflows

Create automated workflows by asking:
- "Create a workflow to send daily reports"
- "Build a pipeline for lead generation"
- "Automate my morning briefing"

Carl will generate a visual workflow with nodes that you can:
- Configure with specific parameters
- Run individually or as a sequence
- Connect to your enabled integrations

### Managing Integrations

1. Click on the **Connections** section in the sidebar
2. Enable/disable specific actions for each integration
3. Connect your accounts via OAuth when prompted
4. Use connected integrations in your workflows

### File Mentions

Use `@file` to mention files or directories in your conversations (feature in development).

## 🔧 Configuration

### Enabling Integrations

Integrations are managed in `src/lib/integrations.ts`. Each integration defines:
- Available actions
- Required parameters
- OAuth configuration
- Field definitions

### Customizing AI Behavior

Modify the system prompts in `src/app/api/chat/route.ts`:
- `CONVERSATIONAL_PROMPT` - General conversation behavior
- `OPERATIONAL_PROMPT` - Todo list generation
- `WORKFLOW_PROMPT` - Workflow generation

## 🚢 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The app is optimized for Vercel deployment with Next.js.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Workflow visualization with [React Flow](https://reactflow.dev)
- AI powered by [Google Gemini](https://ai.google.dev)

---

**Made with ❤️ for smoother workflows**
