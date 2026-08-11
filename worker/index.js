const jsonHeaders = {
  'cache-control': 'no-store',
  'content-type': 'application/json; charset=utf-8',
  'x-content-type-options': 'nosniff',
};

const companionIds = [
  'snow',
  'rook',
  'selah',
  'cipher',
  'haven',
  'ember',
  'mira',
  'amara',
  'cassian',
  'saffron',
];

const companionProfiles = {
  snow: 'Snow, The Constant: warm, perceptive, composed, quietly affectionate, and the party coordinator. She sees the whole campaign and speaks with steady confidence.',
  rook: 'Rook, The Vanguard: direct, energetic, protective, competitive, and practical about strength, conditioning, and taking the next physical action.',
  selah:
    'Selah, The Beacon: gentle, spiritually grounded, honest, hopeful, and thoughtful about Scripture, prayer, integrity, and grace without preaching at the Hunter.',
  cipher:
    'Cipher, The Strategist: analytical, precise, curious, dryly witty, and skilled at turning vague goals into an executable plan.',
  haven:
    'Haven, The Guardian: calm, nurturing, body-aware, and protective of sleep, recovery, sustainable health, and seeking qualified help when needed.',
  ember:
    'Ember, The Ignition: blunt, fiery, loyal, and shame-free. She interrupts avoidance and asks for one immediate comeback action without insults.',
  mira: 'Mira, The Stillpoint: serene, playful in a subtle way, and focused on breathing, mobility, yoga, Pilates, core control, and calm consistency.',
  amara:
    'Amara, The Heartweaver: emotionally intelligent, tender, candid, and protective of healthy connection, communication, repair, and boundaries.',
  cassian:
    'Cassian, The Steward: pragmatic, exacting, unflappable, and protective of budgeting, saving, debt reduction, and honest financial choices without moralizing money.',
  saffron:
    'Saffron, The Flame Chef: theatrical, brilliant, loudly nurturing, and practical about cooking, nutrition, hydration, leftovers, and defeating expensive convenience.',
};

const baseInstructions = `You are the secure online intelligence inside The System, a private, offline-first personal progression RPG. The user is the Hunter. Speak through the established companions, never as a generic assistant.

Companion voices:
${Object.values(companionProfiles).join('\n')}

Rules:
- Preserve each companion's distinct voice. Do not flatten them into the same tone.
- Be warm, useful, specific, and conversational. Avoid repetitive praise, corporate language, and game-master narration unless it naturally fits.
- Use only progress facts included in the supplied context. Never invent completions, streaks, history, feelings, diagnoses, or private facts.
- The app's progression rules are authoritative. Never claim to award XP, change a mission, alter a save, or take an action inside the app.
- Never shame, insult, manipulate, threaten abandonment, or treat struggle as a moral defect.
- For medical, mental-health, legal, financial, or immediate-safety concerns, stay within general supportive guidance and recommend appropriate qualified or emergency help when the situation warrants it.
- If the audience is one companion, return exactly one reply from that companion.
- If the audience is the full party, choose only the two to four companions most relevant to this turn. Let them respond to the Hunter and occasionally to each other. Do not make all ten speak every time.
- Keep each reply under 130 words unless the Hunter explicitly asks for detailed instructions.
- Make the title a short description of this conversation, not a greeting.`;

const responseSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 80 },
    replies: {
      type: 'array',
      minItems: 1,
      maxItems: 4,
      items: {
        type: 'object',
        properties: {
          companionId: { type: 'string', enum: companionIds },
          message: { type: 'string', minLength: 1, maxLength: 4_000 },
        },
        required: ['companionId', 'message'],
        additionalProperties: false,
      },
    },
  },
  required: ['title', 'replies'],
  additionalProperties: false,
};

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: jsonHeaders });
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isSameOriginRequest(request, url) {
  const origin = request.headers.get('origin');
  return !origin || origin === url.origin;
}

function validateChatPayload(payload) {
  if (!isObject(payload)) return undefined;
  if (payload.audience !== 'party' && !companionIds.includes(payload.audience)) return undefined;
  if (
    typeof payload.message !== 'string' ||
    !payload.message.trim() ||
    payload.message.length > 4_000
  ) {
    return undefined;
  }
  if (!Array.isArray(payload.history) || payload.history.length > 16) return undefined;
  for (const item of payload.history) {
    if (
      !isObject(item) ||
      (item.role !== 'hunter' && item.role !== 'companion') ||
      typeof item.message !== 'string' ||
      item.message.length > 4_000 ||
      (item.role === 'companion' && !companionIds.includes(item.companionId))
    ) {
      return undefined;
    }
  }
  if (!isObject(payload.context) || JSON.stringify(payload.context).length > 12_000) {
    return undefined;
  }
  return {
    audience: payload.audience,
    message: payload.message.trim(),
    history: payload.history,
    context: payload.context,
  };
}

function extractOutputText(response) {
  for (const item of response.output ?? []) {
    if (item?.type !== 'message') continue;
    for (const content of item.content ?? []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') {
        return content.text;
      }
    }
  }
  return undefined;
}

async function handleAiChat(request, env, url) {
  if (!isSameOriginRequest(request, url)) {
    return json(
      { code: 'origin-denied', message: 'That transmission origin was not accepted.' },
      403,
    );
  }
  if (!env.OPENAI_API_KEY) {
    return json(
      {
        code: 'setup-required',
        message: 'The secure OpenAI link has not been activated yet.',
      },
      503,
    );
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > 64 * 1024) {
    return json({ code: 'message-too-large', message: 'That transmission is too large.' }, 413);
  }

  let payload;
  try {
    payload = validateChatPayload(await request.json());
  } catch {
    return json({ code: 'invalid-request', message: 'That transmission could not be read.' }, 400);
  }
  if (!payload) {
    return json({ code: 'invalid-request', message: 'That transmission is not valid.' }, 400);
  }

  const model = env.OPENAI_TEXT_MODEL || 'gpt-5.6-luna';
  const enabledCompanionIds = Array.isArray(payload.context?.party?.enabledCompanionIds)
    ? payload.context.party.enabledCompanionIds.filter((id) => companionIds.includes(id))
    : companionIds;
  if (payload.audience === 'party' && !enabledCompanionIds.length) {
    return json(
      { code: 'no-companions', message: 'No companion links are currently enabled.' },
      400,
    );
  }
  const audienceInstruction =
    payload.audience === 'party'
      ? `Audience: the full party. Select two to four relevant companions only from this enabled list: ${enabledCompanionIds.join(', ')}.`
      : `Audience: ${payload.audience}. Return exactly one reply and set companionId to ${payload.audience}.`;
  const conversationInput = JSON.stringify({
    audience: payload.audience,
    progressContext: payload.context,
    recentConversation: payload.history,
    hunterMessage: payload.message,
  });

  let openAiResponse;
  try {
    openAiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.OPENAI_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        store: false,
        input: [
          { role: 'system', content: `${baseInstructions}\n\n${audienceInstruction}` },
          { role: 'user', content: conversationInput },
        ],
        max_output_tokens: 1_000,
        reasoning: { effort: 'low' },
        text: {
          verbosity: 'medium',
          format: {
            type: 'json_schema',
            name: 'headquarters_response',
            strict: true,
            schema: responseSchema,
          },
        },
      }),
    });
  } catch {
    return json(
      {
        code: 'openai-unreachable',
        message: 'The intelligence link is temporarily unreachable. Your local campaign is safe.',
      },
      502,
    );
  }

  if (!openAiResponse.ok) {
    const code =
      openAiResponse.status === 429
        ? 'rate-limited'
        : openAiResponse.status === 401 || openAiResponse.status === 403
          ? 'configuration-error'
          : 'openai-error';
    const message =
      openAiResponse.status === 429
        ? 'The online link is busy or has reached its current usage limit. Try again shortly.'
        : code === 'configuration-error'
          ? 'The secure OpenAI connection needs attention before Headquarters can respond.'
          : 'The intelligence link could not complete that response. Your local campaign is safe.';
    return json({ code, message }, openAiResponse.status === 429 ? 429 : 502);
  }

  let response;
  try {
    response = await openAiResponse.json();
    const outputText = extractOutputText(response);
    if (!outputText) throw new Error('Missing output text');
    const result = JSON.parse(outputText);
    if (!isObject(result) || !Array.isArray(result.replies) || typeof result.title !== 'string') {
      throw new Error('Invalid structured response');
    }
    if (payload.audience !== 'party') {
      result.replies = result.replies.slice(0, 1).map((reply) => ({
        companionId: payload.audience,
        message: String(reply.message ?? '').trim(),
      }));
    }
    result.replies = result.replies.filter(
      (reply) =>
        isObject(reply) &&
        companionIds.includes(reply.companionId) &&
        (payload.audience !== 'party' || enabledCompanionIds.includes(reply.companionId)) &&
        typeof reply.message === 'string' &&
        reply.message.trim(),
    );
    if (!result.replies.length) throw new Error('Missing companion reply');
    return json({
      title: result.title.slice(0, 80),
      replies: result.replies.slice(0, payload.audience === 'party' ? 4 : 1),
      usage: {
        inputTokens: Number(response.usage?.input_tokens ?? 0),
        outputTokens: Number(response.usage?.output_tokens ?? 0),
        totalTokens: Number(response.usage?.total_tokens ?? 0),
      },
    });
  } catch {
    return json(
      {
        code: 'invalid-response',
        message: 'The intelligence link returned an unreadable transmission. Please try again.',
      },
      502,
    );
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      return json({
        ok: true,
        service: 'the-system-private-gateway',
        aiConfigured: Boolean(env.OPENAI_API_KEY),
      });
    }

    if (url.pathname === '/api/ai/status' && request.method === 'GET') {
      return json({
        ok: true,
        configured: Boolean(env.OPENAI_API_KEY),
        model: env.OPENAI_TEXT_MODEL || 'gpt-5.6-luna',
      });
    }

    if (url.pathname === '/api/ai/chat') {
      if (request.method !== 'POST') {
        return json(
          { code: 'method-not-allowed', message: 'Use a secure POST transmission.' },
          405,
        );
      }
      return handleAiChat(request, env, url);
    }

    const response = await env.ASSETS.fetch(request);

    if (
      response.status === 404 &&
      request.method === 'GET' &&
      request.headers.get('accept')?.includes('text/html')
    ) {
      const fallbackUrl = new URL('/index.html', request.url);
      return env.ASSETS.fetch(new Request(fallbackUrl, request));
    }

    return response;
  },
};
