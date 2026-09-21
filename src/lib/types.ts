export interface RedFlag {
	flag: string;
	why: string;
}

export interface JobAnalysis {
	roleTitle: string;
	roleSummary: string;
	seniorityLevel: string;
	mustHaves: string[];
	niceToHaves: string[];
	redFlags: RedFlag[];
	buzzwordDensity: 'low' | 'medium' | 'high';
	salaryTransparency: 'clear' | 'vague' | 'missing';
}

export interface SuggestedBullet {
	bullet: string;
	targets: string;
}

export interface PriorityGap {
	keyword: string;
	evidence: string;
	whyItMatters: string;
}

export interface FitAnalysis {
	fitScore: number;
	fitSummary: string;
	matchedKeywords: string[];
	missingKeywords: string[];
	priorityGaps?: PriorityGap[];
	suggestedBullets: SuggestedBullet[];
}

export interface InterviewPrepItem {
	question: string;
	talkingPoint: string;
	gapAddressed: string;
}

export interface DecodeResult {
	job: JobAnalysis;
	fit: FitAnalysis | null;
	coverLetter: string | null;
	interviewPrep: InterviewPrepItem[] | null;
}

export type PipelineStep = 'job' | 'fit' | 'coverLetter' | 'interviewPrep';
export type StepStatus = 'pending' | 'streaming' | 'complete' | 'skipped' | 'error';

export type DecodeEvent =
	| { type: 'step-start'; step: PipelineStep }
	| { type: 'delta'; step: PipelineStep; text: string }
	| { type: 'step-complete'; step: 'job'; data: JobAnalysis }
	| { type: 'step-complete'; step: 'fit'; data: FitAnalysis }
	| { type: 'step-complete'; step: 'coverLetter'; data: { letter: string } }
	| { type: 'step-complete'; step: 'interviewPrep'; data: { items: InterviewPrepItem[] } }
	| { type: 'step-skipped'; step: PipelineStep; reason: string }
	| { type: 'error'; step?: PipelineStep; message: string }
	| { type: 'done' };

export const DENSITY_CONFIG = {
	low: { label: 'Low buzzword density', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
	medium: { label: 'Medium buzzword density', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
	high: { label: 'High buzzword density', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
};

export const SALARY_CONFIG = {
	clear: { label: 'Salary range given', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
	vague: { label: 'Salary range is vague', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
	missing: { label: 'No salary listed', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
};

export const EXAMPLE_JOB = `Senior Solutions Engineer, AI Infrastructure
Acme Cloud · San Francisco, CA (Hybrid) · Full-time

About the role:
We're looking for a rockstar, ninja-level Senior Solutions Engineer to be a key part of our best-in-class GTM org. You'll own the technical relationship with our most strategic enterprise accounts, running POCs, live demos, and deep technical discovery to translate cutting-edge AI infrastructure into customer wins. You will wear many hats and thrive in a fast-paced, ever-changing environment synergizing cross-functionally with Sales, Product, and Engineering.

What you'll do:
- Deliver world-class live demos of our GPU inference platform to enterprise and government customers
- Build proof-of-concepts using LLM inference stacks (vLLM, TensorRT-LLM) on NVIDIA and AMD accelerators
- Design and deploy RAG pipelines and agentic workflows using LangChain, LlamaIndex, or similar
- Partner with Sales as the technical expert throughout the deal cycle
- Create technical content (blog posts, videos, tutorials) to scale technical credibility
- Occasional travel to conferences (GTC, re:Invent) and customer sites

Requirements:
- 5+ years in a customer-facing technical role (Solutions Engineering, Sales Engineering, or similar)
- Hands-on experience with GPU-accelerated AI infrastructure (NVIDIA, AMD, or similar)
- Experience building and deploying RAG / agentic LLM applications in production
- Strong communicator who can explain complex systems to both engineers and executives
- Bachelor's degree in Computer Science, Engineering, or equivalent experience

Nice to have:
- Experience with Kubernetes and container orchestration
- Public speaking or technical content creation track record
- Familiarity with MCP or other agent tool-calling protocols

Compensation: Competitive salary + equity + benefits. We offer a fast-paced, high-growth environment with unlimited earning potential for the right rockstar.`;

export const EXAMPLE_RESUME = `Kitana Toft
Solutions & Presales Engineering · Forward Deployed Engineering · AI Infrastructure

SUMMARY
AI infrastructure engineer with hands-on production deployment experience across NVIDIA, AMD, and Intel accelerator platforms. Builds full-stack agentic AI systems and REST/MCP APIs from hardware bring-up to application layer, and works as the technical presales interface: live demos, POCs, and video content reaching enterprise, government, and developer audiences at scale (180K+ views).

EXPERIENCE
Technology Enablement Engineer (Technical Presales) · Supermicro · Jul 2023 – Present
- Deployed and extended AMD's solution blueprint into a full agentic RAG pipeline on AMD MI350X GPUs — Kubernetes (k3s), vLLM, ChromaDB, and MCP tool-calling servers, with Grafana/Prometheus observability.
- Hands-on bring-up, validation, and inference tuning of production AI workloads across NVIDIA B200/B300, RTX Pro 6000 BSE, H200/H100, A100, AMD MI350X, and Intel Gaudi 3/2.
- Built inference and RAG pipelines with PyTorch, LangChain, LlamaIndex, and vLLM; deployed NVIDIA AI Enterprise Blueprints including Llama 3 70B, Stable Diffusion XL, and multi-modal models (LLaVA, CLIP).
- Independently scripted, filmed, and edited 16 technical video tutorials on real enterprise AI deployments, reaching 180K+ views (top video: 146K+).
- Technical presales lead for product launches and live AI capability demos (NVIDIA GTC, SC, Cloud Fest) to enterprise and government audiences.

Software Engineer (Apprenticeship) · SproutLabs Smart Irrigation · Sep – Dec 2022
- Owned design and delivery of the admin REST API and full-stack smart irrigation platform, architecting a microservices system with CI/CD from the ground up.
- Held a dual engineer / Project Manager role, leading a 3-person team through 3 Agile sprints.

PROJECTS
Career Copilot — RAG assistant on kitanatoft.com (SvelteKit, Claude API, RAG, Vercel)
LLM Chatbot with RAG (Python, PyTorch, LangChain, Docker)
Multi-Modal AI Applications (Python, PyTorch, Transformers, Gradio)

EDUCATION
University of California, Santa Cruz — B.S. Computer Engineering with Honors, CS Minor
Foothill College — A.S. Computer Science, Engineering & Mathematics

TECHNICAL SKILLS
Hardware: NVIDIA B200/B300, RTX Pro 6000 BSE, H200/H100, A100, AMD MI350X, Intel Gaudi 3/2, Max, Flex
AI / Inference: PyTorch, LangChain, LangGraph, LlamaIndex, vLLM, Transformers, CUDA, ROCm, oneAPI, MCP
Infra & languages: Kubernetes (k3s), Docker, Grafana, Prometheus, ChromaDB, Linux, GCP, Python, TypeScript, Go, SQL, C++
Web / APIs: REST API design & integration, FastAPI, Node.js, SvelteKit, React, Next.js, MCP servers
Presales & content: Live demos & POCs, technical discovery, product launches, GTC / SC / Cloud Fest, video production`;
