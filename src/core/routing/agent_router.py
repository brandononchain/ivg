"""
Agent Routing System for IVG Platform
=======================================
Routes user intents to the correct agent or agent pipeline
based on input classification.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Optional


class AgentType(Enum):
    """All available agents in the IVG platform."""
    # Master layer
    MASTER_AGENT = "master-agent"
    MASTER_ORCHESTRATOR = "master-orchestrator"
    MASTER_VIDEO_GENERATION = "master-video-generation"

    # Content agents
    VIDEO_SCRIPTWRITER = "content-video-scriptwriter"

    # Design agents
    BRAND_GUARDIAN = "design-brand-guardian"
    IMAGE_PROMPT_ENGINEER = "design-image-prompt-engineer"
    INCLUSIVE_VISUALS = "design-inclusive-visuals-specialist"
    UI_DESIGNER = "design-ui-designer"
    UX_ARCHITECT = "design-ux-architect"
    UX_RESEARCHER = "design-ux-researcher"
    VISUAL_STORYTELLER = "design-visual-storyteller"
    WHIMSY_INJECTOR = "design-whimsy-injector"

    # Engineering agents
    FRONTEND_DEVELOPER = "engineering-frontend-developer"


class IntentCategory(Enum):
    """Classification of user intent."""
    SIMPLE_GENERATION = "simple_generation"
    SCRIPTED_PRODUCTION = "scripted_production"
    BRAND_VIDEO = "brand_video"
    STYLE_TRANSFER = "style_transfer"
    AUDIO_VIDEO = "audio_video"
    INFINITE_CHAIN = "infinite_chain"
    RETAKE_EDIT = "retake_edit"
    PLATFORM_DESIGN = "platform_design"
    RESEARCH = "research"


@dataclass
class RoutingDecision:
    """Result of routing analysis."""
    primary_agent: AgentType
    pipeline_agents: list[AgentType]
    intent: IntentCategory
    requires_orchestration: bool
    confidence: float
    reasoning: str


# Intent-to-pipeline mapping
ROUTING_TABLE: dict[IntentCategory, list[AgentType]] = {
    IntentCategory.SIMPLE_GENERATION: [
        AgentType.IMAGE_PROMPT_ENGINEER,
        AgentType.MASTER_VIDEO_GENERATION,
    ],
    IntentCategory.SCRIPTED_PRODUCTION: [
        AgentType.VIDEO_SCRIPTWRITER,
        AgentType.VISUAL_STORYTELLER,
        AgentType.IMAGE_PROMPT_ENGINEER,
        AgentType.INCLUSIVE_VISUALS,
        AgentType.BRAND_GUARDIAN,
        AgentType.MASTER_VIDEO_GENERATION,
    ],
    IntentCategory.BRAND_VIDEO: [
        AgentType.BRAND_GUARDIAN,
        AgentType.VIDEO_SCRIPTWRITER,
        AgentType.IMAGE_PROMPT_ENGINEER,
        AgentType.INCLUSIVE_VISUALS,
        AgentType.MASTER_VIDEO_GENERATION,
    ],
    IntentCategory.STYLE_TRANSFER: [
        AgentType.IMAGE_PROMPT_ENGINEER,
        AgentType.MASTER_VIDEO_GENERATION,
    ],
    IntentCategory.AUDIO_VIDEO: [
        AgentType.VIDEO_SCRIPTWRITER,
        AgentType.IMAGE_PROMPT_ENGINEER,
        AgentType.MASTER_VIDEO_GENERATION,
    ],
    IntentCategory.INFINITE_CHAIN: [
        AgentType.VISUAL_STORYTELLER,
        AgentType.VIDEO_SCRIPTWRITER,
        AgentType.IMAGE_PROMPT_ENGINEER,
        AgentType.INCLUSIVE_VISUALS,
        AgentType.MASTER_VIDEO_GENERATION,
    ],
    IntentCategory.RETAKE_EDIT: [
        AgentType.IMAGE_PROMPT_ENGINEER,
        AgentType.MASTER_VIDEO_GENERATION,
    ],
    IntentCategory.PLATFORM_DESIGN: [
        AgentType.UX_RESEARCHER,
        AgentType.UX_ARCHITECT,
        AgentType.UI_DESIGNER,
        AgentType.WHIMSY_INJECTOR,
        AgentType.FRONTEND_DEVELOPER,
    ],
}

# Intents that require the Master Orchestrator
ORCHESTRATED_INTENTS = {
    IntentCategory.SCRIPTED_PRODUCTION,
    IntentCategory.BRAND_VIDEO,
    IntentCategory.INFINITE_CHAIN,
    IntentCategory.PLATFORM_DESIGN,
}


class AgentRouter:
    """
    Routes user requests to the appropriate agent pipeline.

    The Master Agent uses this router to determine which agents
    should handle a request and in what order.
    """

    def __init__(self):
        self.routing_table = ROUTING_TABLE
        self.orchestrated_intents = ORCHESTRATED_INTENTS

    def classify_intent(self, user_input: str) -> IntentCategory:
        """
        Classify user intent from their input.

        In production, this would use NLP/LLM classification.
        This provides the rule-based foundation.
        """
        input_lower = user_input.lower()

        # Check for retake/edit intent
        if any(word in input_lower for word in ["retake", "redo", "fix", "edit region", "replace part"]):
            return IntentCategory.RETAKE_EDIT

        # Check for audio intent
        if any(word in input_lower for word in ["audio", "music", "sound", "soundtrack", "song"]):
            return IntentCategory.AUDIO_VIDEO

        # Check for style transfer
        if any(word in input_lower for word in ["style transfer", "transform video", "apply style", "convert style"]):
            return IntentCategory.STYLE_TRANSFER

        # Check for infinite chain intent
        if any(word in input_lower for word in ["infinite", "chain", "continue", "extend", "keep going", "next segment"]):
            return IntentCategory.INFINITE_CHAIN

        # Check for scripted production
        if any(word in input_lower for word in ["script", "story", "narrative", "episode", "scene", "act"]):
            return IntentCategory.SCRIPTED_PRODUCTION

        # Check for brand video
        if any(word in input_lower for word in ["brand", "company", "product video", "marketing", "campaign"]):
            return IntentCategory.BRAND_VIDEO

        # Check for platform design
        if any(word in input_lower for word in ["ui", "ux", "design", "interface", "frontend", "component"]):
            return IntentCategory.PLATFORM_DESIGN

        # Default to simple generation
        return IntentCategory.SIMPLE_GENERATION

    def route(self, user_input: str) -> RoutingDecision:
        """Route a user request to the appropriate agent pipeline."""
        intent = self.classify_intent(user_input)
        pipeline = self.routing_table.get(intent, [AgentType.MASTER_VIDEO_GENERATION])
        requires_orchestration = intent in self.orchestrated_intents

        primary_agent = (
            AgentType.MASTER_ORCHESTRATOR
            if requires_orchestration
            else pipeline[0] if pipeline else AgentType.MASTER_VIDEO_GENERATION
        )

        return RoutingDecision(
            primary_agent=primary_agent,
            pipeline_agents=pipeline,
            intent=intent,
            requires_orchestration=requires_orchestration,
            confidence=0.85,
            reasoning=f"Classified as {intent.value} — routing to {primary_agent.value}",
        )
