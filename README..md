# IVG — Infinite Video Generation

Generate an infinite amount of high-quality, longest-duration videos powered by the open-source [LTX-2](https://github.com/Lightricks/LTX-2) model (22B parameters).

## Architecture

```
User Input
    ↓
┌─────────────────┐
│  Master Agent    │ ← Refines prompts, classifies intent, routes
└────────┬────────┘
         ↓
┌─────────────────────┐
│ Master Orchestrator  │ ← Sequences multi-agent pipelines
└────────┬────────────┘
         ↓
┌──────────────────────────┐
│ Master Video Generation  │ ← LTX-2 pipeline execution + infinite chaining
└──────────────────────────┘
```

### Agent Hierarchy

**Master Layer**
- **Master Agent** — Entry point. Receives user input, refines prompts for LTX-2, routes to correct sub-agent
- **Master Orchestrator** — Coordinates multi-agent pipelines from script to screen
- **Master Video Generation** — Direct LTX-2 interface. Manages all 8 pipelines, upsampling, infinite chaining

**Content Agents**
- **Video Scriptwriter** — Scripts optimized for LTX-2 generation with scene-as-prompt format

**Design Agents**
- **Brand Guardian** — Brand consistency across all generated video
- **Image Prompt Engineer** — LTX-2 optimized prompt crafting (chronological, literal, <200 words)
- **Inclusive Visuals Specialist** — Bias detection, diverse representation, counter-bias prompts
- **UI Designer** — Design tokens, component library, dark/light themes
- **UX Architect** — Layout frameworks, information architecture, theme system
- **UX Researcher** — User research, usability testing, persona development
- **Visual Storyteller** — Story arcs, scene composition, infinite narrative structure
- **Whimsy Injector** — Micro-interactions, celebrations, playful UI

**Engineering Agents**
- **Frontend Developer** — React/Next.js implementation with TypeScript

## LTX-2 Pipelines

| Pipeline | Use Case | Steps |
|----------|----------|-------|
| TI2VidTwoStagesPipeline | Production — text/image to video + 2x upsampling | 40+10 |
| TI2VidTwoStagesHQPipeline | High quality with res_2s sampler | 20+10 |
| DistilledPipeline | Rapid preview iteration | 8+4 |
| A2VidPipelineTwoStage | Audio-driven synchronized video | 40+10 |
| ICLoraPipeline | Video-to-video style transfer | varies |
| KeyframeInterpolationPipeline | Smooth transitions between keyframes | varies |
| RetakePipeline | Selective region regeneration | varies |

## Project Structure

```
ivg/
├── agents/
│   ├── master/                    # Master Agent
│   ├── orchestrator/              # Master Orchestrator
│   ├── video-generation/          # Master Video Generation
│   ├── design/                    # 8 Design sub-agents
│   ├── content/                   # Video Scriptwriter
│   └── engineering/               # Frontend Developer
├── src/
│   ├── core/
│   │   ├── config/                # LTX-2 configuration
│   │   ├── pipelines/             # Generation pipeline manager
│   │   └── routing/               # Agent routing system
│   ├── frontend/                  # Next.js + React + TypeScript
│   │   ├── components/            # UI components
│   │   ├── pages/                 # Dashboard, Studio, Library, Settings
│   │   └── styles/                # Design token CSS system
│   └── backend/
│       └── api/                   # REST + WebSocket API
├── config/
│   └── agent-registry.yaml        # Central agent registry
└── pyproject.toml                 # Python dependencies (LTX-2 stack)
```

## Quick Start

```bash
# Clone and setup
git clone https://github.com/brandononchain/ivg.git
cd ivg

# Python environment (for LTX-2 backend)
uv sync

# Frontend
cd src/frontend
npm install
npm run dev
```

## Infinite Generation Flow

1. User provides prompt (any complexity)
2. **Master Agent** refines prompt for LTX-2 guidelines
3. Routes to appropriate pipeline via **Master Orchestrator**
4. **Master Video Generation** executes LTX-2 pipeline
5. Applies spatial (2x) + temporal (2x) upsampling
6. Extracts final frames as keyframes for next segment
7. Chains infinitely — each output seeds the next input
