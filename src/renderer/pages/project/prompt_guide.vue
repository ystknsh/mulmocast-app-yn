<template>
  <Tabs default-value="beginner" class="w-full">
    <TabsList :class="`grid w-full grid-cols-3 ${selectedTheme === 'compact' ? 'h-8' : ''}`">
      <TabsTrigger value="beginner" :class="selectedTheme === 'compact' ? 'text-xs' : ''"> Basic Prompt </TabsTrigger>
      <TabsTrigger value="advanced" :class="selectedTheme === 'compact' ? 'text-xs' : ''">
        Advanced Prompt
      </TabsTrigger>
      <TabsTrigger value="examples" :class="selectedTheme === 'compact' ? 'text-xs' : ''"> Examples </TabsTrigger>
    </TabsList>

    <TabsContent value="beginner" :class="selectedTheme === 'compact' ? 'mt-2' : 'mt-4'">
      <div :class="selectedTheme === 'compact' ? 'space-y-2' : 'space-y-4'">
        <div :class="`rounded-lg border border-blue-200 bg-white ${selectedTheme === 'compact' ? 'p-2' : 'p-4'}`">
          <h4
            :class="`flex items-center font-semibold text-gray-800 ${selectedTheme === 'compact' ? 'mb-1 text-sm' : 'mb-2'}`"
          >
            <MessageSquare :size="selectedTheme === 'compact' ? 12 : 16" class="mr-2 text-blue-500" />
            Simple ChatGPT Prompt Template
          </h4>
          <div
            :class="`rounded border bg-gray-50 font-mono ${selectedTheme === 'compact' ? 'p-2 text-xs' : 'p-3 text-sm'}`"
          >
            <pre>{{ basicPrompt }}</pre>
          </div>
          <div :class="`flex items-center space-x-2 ${selectedTheme === 'compact' ? 'mt-2' : 'mt-3'}`">
            <Button
              :size="selectedTheme === 'compact' ? 'sm' : 'sm'"
              variant="outline"
              :class="selectedTheme === 'compact' ? 'h-6 text-xs' : 'text-xs'"
              @click="copyToClipboard(basicPrompt)"
            >
              <Copy :size="selectedTheme === 'compact' ? 8 : 12" class="mr-1" />
              Copy Template
            </Button>
            <span :class="selectedTheme === 'compact' ? 'text-xs text-gray-500' : 'text-xs text-gray-500'">
              Replace [TOPIC] and [AUDIENCE] with your content
            </span>
          </div>
        </div>
      </div>
    </TabsContent>

    <TabsContent value="advanced" class="mt-4">
      <div class="space-y-4">
        <div class="rounded-lg border border-blue-200 bg-white p-4">
          <h4 class="mb-2 flex items-center font-semibold text-gray-800">
            <Settings :size="16" class="mr-2 text-blue-500" />
            Detailed ChatGPT Prompt Template
          </h4>
          <div class="rounded border bg-gray-50 p-3 font-mono text-sm">
            <pre>{{ advancedPrompt }}</pre>
          </div>
          <div class="mt-3 flex items-center space-x-2">
            <Button size="sm" variant="outline" class="text-xs" @click="copyToClipboard(advancedPrompt)">
              <Copy :size="12" class="mr-1" />
              Copy Advanced Template
            </Button>
            <span class="text-xs text-gray-500"> Customize all bracketed sections for your needs </span>
          </div>
        </div>
      </div>
    </TabsContent>

    <TabsContent value="examples" class="mt-4">
      <div class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-lg border border-blue-200 bg-white p-4">
            <h4 class="mb-2 text-sm font-semibold text-gray-800">Educational Content Example</h4>
            <div class="rounded bg-gray-50 p-2 font-mono text-xs">
              "Create a MulmoScript for a 7-minute educational video about renewable energy for high school students.
              Include visual prompts for solar panels, wind turbines, and energy statistics."
            </div>
          </div>
          <div class="rounded-lg border border-blue-200 bg-white p-4">
            <h4 class="mb-2 text-sm font-semibold text-gray-800">Business Presentation Example</h4>
            <div class="rounded bg-gray-50 p-2 font-mono text-xs">
              "Generate a MulmoScript for a 10-minute startup pitch presentation about AI-powered healthcare, including
              charts and product mockup visuals."
            </div>
          </div>
          <div class="rounded-lg border border-blue-200 bg-white p-4">
            <h4 class="mb-2 text-sm font-semibold text-gray-800">Tutorial Content Example</h4>
            <div class="rounded bg-gray-50 p-2 font-mono text-xs">
              "Create a MulmoScript for a cooking tutorial showing how to make sushi, with step-by-step images and
              ingredient close-ups."
            </div>
          </div>
          <div class="rounded-lg border border-blue-200 bg-white p-4">
            <h4 class="mb-2 text-sm font-semibold text-gray-800">Interview Style Example</h4>
            <div class="rounded bg-gray-50 p-2 font-mono text-xs">
              "Generate a MulmoScript for an interview-style podcast about digital marketing trends, with
              infographic-style visuals for statistics."
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h5 class="mb-2 flex items-center font-medium text-amber-800">
            <AlertTriangle :size="16" class="mr-2" />
            Pro Tips for Better Results
          </h5>
          <ul class="space-y-1 text-sm text-amber-700">
            <li>• Be specific about your target audience and tone</li>
            <li>• Include desired duration and number of segments</li>
            <li>• Specify visual style preferences for image prompts</li>
            <li>• Ask for natural, conversational dialogue</li>
            <li>• Request varied media types (images, charts, videos) when appropriate</li>
          </ul>
        </div>
      </div>
    </TabsContent>
  </Tabs>
</template>

<script setup lang="ts">
import { MessageSquare, Settings, Copy, AlertTriangle } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  selectedTheme: string;
}

defineProps<Props>();

const basicPrompt = `Create a MulmoScript in YAML format for a [TOPIC] podcast/video.

Requirements:
- 2 speakers: host and guest
- 6-8 beats (conversation segments)
- Include image prompts for each beat
- Duration: approximately 5-10 minutes
- Target audience: [AUDIENCE]

Topic: [YOUR_TOPIC_HERE]
Audience: [YOUR_AUDIENCE_HERE]

Please format the output as valid YAML with metadata, speakers, and beats sections.`;

const advancedPrompt = `Create a comprehensive MulmoScript in YAML format for multimedia content generation.

CONTENT DETAILS:
- Topic: [YOUR_TOPIC]
- Format: [podcast/video/presentation]
- Duration: [X] minutes
- Target audience: [SPECIFIC_AUDIENCE]
- Tone: [professional/casual/educational/entertaining]

TECHNICAL REQUIREMENTS:
- 2 speakers with distinct personalities
- 8-12 conversation beats
- Each beat should include:
  * Speaker dialogue (natural, conversational)
  * Descriptive image prompts for AI generation
  * Optional: media type specifications (image/chart/video)

CONTENT STRUCTURE:
1. Engaging introduction
2. Core concept explanation
3. Practical examples or applications
4. Interactive discussion between speakers
5. Conclusion with key takeaways

YAML FORMAT REQUIREMENTS:
- metadata: title, description
- speakers: host (name, voice), guest (name, voice)
- beats: id, speaker, text, media (type, prompt)

Please ensure the dialogue flows naturally and image prompts are detailed enough for AI image generation.`;

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    // You can add a toast notification here
  } catch (err) {
    console.error("Failed to copy text: ", err);
  }
};
</script>
