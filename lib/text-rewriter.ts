// Text rewriting service using IBM Watsonx Granite LLM
// This simulates the IBM Watsonx integration for tone-based text rewriting

export type ToneType = 'neutral' | 'suspenseful' | 'inspiring'

export interface RewriteResult {
  originalText: string
  rewrittenText: string
  tone: ToneType
  timestamp: string
}

// Simulated IBM Watsonx Granite LLM API call
export async function rewriteTextWithTone(
  originalText: string, 
  tone: ToneType
): Promise<RewriteResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const rewrittenText = await performToneRewrite(originalText, tone)
  
  return {
    originalText,
    rewrittenText,
    tone,
    timestamp: new Date().toISOString()
  }
}

// Prompt chaining for tone-specific rewrites
async function performToneRewrite(text: string, tone: ToneType): Promise<string> {
  const prompts = getTonePrompts(tone)
  
  // Step 1: Analyze the original text
  const analysis = await analyzeText(text)
  
  // Step 2: Apply tone-specific rewriting
  const rewritten = await applyToneRewrite(text, tone, analysis, prompts)
  
  // Step 3: Ensure faithfulness to original meaning
  const refined = await refineFaithfulness(text, rewritten, tone)
  
  return refined
}

function getTonePrompts(tone: ToneType) {
  const prompts = {
    neutral: {
      analysis: "Analyze this text for its core meaning, key facts, and main narrative structure.",
      rewrite: "Rewrite this text in a clear, balanced, and objective tone. Maintain all factual information while using neutral language that is accessible and professional.",
      refine: "Ensure the rewritten text preserves all original meaning while maintaining a neutral, informative tone."
    },
    suspenseful: {
      analysis: "Identify the dramatic elements, tension points, and narrative flow in this text.",
      rewrite: "Transform this text into a suspenseful narrative. Add dramatic tension, use evocative language, create anticipation, and employ literary devices like foreshadowing while preserving the core message.",
      refine: "Verify that the suspenseful rewrite maintains the original facts and meaning while enhancing dramatic impact."
    },
    inspiring: {
      analysis: "Extract the motivational elements, positive themes, and empowering messages from this text.",
      rewrite: "Rewrite this text with an inspiring and uplifting tone. Use motivational language, emphasize positive outcomes, include encouraging phrases, and create an empowering narrative while keeping all original information intact.",
      refine: "Ensure the inspiring version preserves factual accuracy while maximizing motivational impact."
    }
  }
  
  return prompts[tone]
}

async function analyzeText(text: string): Promise<string> {
  // Simulated text analysis
  const wordCount = text.split(' ').length
  const sentences = text.split(/[.!?]+/).length
  const avgWordsPerSentence = Math.round(wordCount / sentences)
  
  return `Text contains ${wordCount} words in ${sentences} sentences (avg ${avgWordsPerSentence} words/sentence). ` +
         `Tone: ${detectCurrentTone(text)}. Structure: ${detectStructure(text)}.`
}

function detectCurrentTone(text: string): string {
  const words = text.toLowerCase()
  
  if (words.includes('exciting') || words.includes('amazing') || words.includes('incredible')) {
    return 'enthusiastic'
  } else if (words.includes('dark') || words.includes('mysterious') || words.includes('danger')) {
    return 'dramatic'
  } else {
    return 'neutral'
  }
}

function detectStructure(text: string): string {
  if (text.includes('\n\n')) return 'multi-paragraph'
  if (text.includes(':') || text.includes('•')) return 'structured/listed'
  return 'narrative'
}

async function applyToneRewrite(
  originalText: string, 
  tone: ToneType, 
  analysis: string, 
  prompts: any
): Promise<string> {
  // Simulated LLM rewriting based on tone
  const sentences = originalText.split(/(?<=[.!?])\s+/)
  const rewrittenSentences = sentences.map(sentence => rewriteSentence(sentence, tone))
  
  return rewrittenSentences.join(' ')
}

function rewriteSentence(sentence: string, tone: ToneType): string {
  const trimmed = sentence.trim()
  if (!trimmed) return sentence
  
  switch (tone) {
    case 'neutral':
      return neutralizeText(trimmed)
    case 'suspenseful':
      return addSuspense(trimmed)
    case 'inspiring':
      return addInspiration(trimmed)
    default:
      return trimmed
  }
}

function neutralizeText(text: string): string {
  // Convert to neutral, professional tone
  return text
    .replace(/amazing|incredible|fantastic/gi, 'notable')
    .replace(/terrible|awful|horrible/gi, 'challenging')
    .replace(/love|adore/gi, 'appreciate')
    .replace(/hate|despise/gi, 'find difficult')
    .replace(/!\s*$/, '.')
}

function addSuspense(text: string): string {
  // Add suspenseful elements
  const suspenseWords = ['mysteriously', 'ominously', 'unexpectedly', 'suddenly', 'eerily']
  const randomSuspense = suspenseWords[Math.floor(Math.random() * suspenseWords.length)]
  
  if (text.includes('was') || text.includes('were')) {
    text = text.replace(/(was|were)/, `${randomSuspense} $1`)
  }
  
  if (text.endsWith('.')) {
    text = text.slice(0, -1) + '...'
  }
  
  return text
    .replace(/said/gi, 'whispered')
    .replace(/went/gi, 'crept')
    .replace(/looked/gi, 'peered')
    .replace(/found/gi, 'discovered')
}

function addInspiration(text: string): string {
  // Add inspiring elements
  const inspiringWords = ['remarkably', 'brilliantly', 'triumphantly', 'magnificently', 'powerfully']
  const randomInspiring = inspiringWords[Math.floor(Math.random() * inspiringWords.length)]
  
  if (text.includes('did') || text.includes('made')) {
    text = text.replace(/(did|made)/, `${randomInspiring} $1`)
  }
  
  return text
    .replace(/good/gi, 'excellent')
    .replace(/nice/gi, 'wonderful')
    .replace(/okay|ok/gi, 'fantastic')
    .replace(/tried/gi, 'strived')
    .replace(/worked/gi, 'dedicated themselves')
    .replace(/\.$/, '!')
}

async function refineFaithfulness(
  originalText: string, 
  rewrittenText: string, 
  tone: ToneType
): Promise<string> {
  // Simulated faithfulness check and refinement
  const originalWords = originalText.toLowerCase().split(/\W+/).filter(w => w.length > 3)
  const rewrittenWords = rewrittenText.toLowerCase().split(/\W+/).filter(w => w.length > 3)
  
  // Ensure key terms are preserved
  const keyTerms = originalWords.filter(word => 
    word.length > 6 || 
    ['important', 'key', 'main', 'primary', 'essential'].includes(word)
  )
  
  let refined = rewrittenText
  keyTerms.forEach(term => {
    if (!rewrittenWords.includes(term)) {
      // Add missing key terms back
      refined = refined.replace(/\.$/, `, maintaining ${term}.`)
    }
  })
  
  return refined
}

// Export for use in components
export { rewriteTextWithTone as default }
