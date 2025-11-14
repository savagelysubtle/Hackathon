# LM Studio & LangGraph Tool Use Documentation

## Key Findings from Documentation

### 1. Model Compatibility

- **Critical**: Not all models support function calling/tool use
- Models need to be specifically trained/fine-tuned for function calling
- LM Studio shows a "hammer badge" in the app for models with native tool use
  support
- **Recommended models for tool use:**
  - `qwen2.5-7b-instruct` (Qwen models are noted for effective tool use)
  - `gemma-3-12b-it` (Gemma 3 models)
  - `gemma-3-27b-it` (Gemma 3 models)
  - Current model: `Qwen/qwen3-vl-30b` - **Should support tool use** (Qwen
    family)

### 2. LM Studio Tool Use Methods

LM Studio supports two approaches:

#### A. Native SDK (`.act()` method)

- Uses `@lmstudio/sdk` directly
- Not compatible with LangChain's `bindTools()`
- Example:

```typescript
import { LMStudioClient, tool } from "@lmstudio/sdk";
const model = await client.llm.model("qwen2.5-7b-instruct");
await model.act("query", [tools], { onMessage: ... });
```

#### B. OpenAI-Compatible API (What we're using)

- LM Studio exposes OpenAI-compatible API at `http://localhost:1234/v1`
- Works with LangChain's `ChatOpenAI` and `bindTools()`
- Should support standard OpenAI function calling format

### 3. LangChain `bindTools()` with LM Studio

**Current Implementation:**

```typescript
const model = createModel(modelConfig).bindTools(tools);
```

**Potential Issues:**

1. **Model may not be loaded with function calling enabled** in LM Studio
2. **Tool format compatibility** - LM Studio might need specific formatting
3. **API endpoint configuration** - Ensure `/v1` endpoint is correct
4. **Model name format** - Some models need specific naming

### 4. Troubleshooting Steps

1. **Verify Model Supports Function Calling:**

   - Check LM Studio app for "hammer badge" on the model
   - Try a known working model like `qwen2.5-7b-instruct`

2. **Check LM Studio Server Settings:**

   - Ensure server is running on `http://localhost:1234`
   - Verify OpenAI-compatible API is enabled
   - Check if function calling is enabled in server settings

3. **Verify Tool Format:**

   - LangChain tools should be compatible with OpenAI format
   - Tools need proper `name`, `description`, and `schema` fields
   - Our CoinGecko tools use Zod schemas which should work

4. **Test with OpenAI First:**

   - Switch to OpenAI provider temporarily to verify tools work
   - If tools work with OpenAI but not LM Studio, it's a model/compatibility
     issue

5. **Add Explicit Tool Calling Configuration:**
   - Some models need explicit `tool_choice` or `function_calling` parameters
   - May need to configure `modelKwargs` in ChatOpenAI

### 5. Recommended Fixes

#### Option 1: Add Explicit Function Calling Config

```typescript
case 'lmstudio':
  return new ChatOpenAI({
    modelName: config.modelName || process.env.LM_STUDIO_MODEL || 'local-model',
    temperature,
    openAIApiKey: process.env.LM_STUDIO_API_KEY || 'lm-studio',
    configuration: {
      baseURL: process.env.LM_STUDIO_BASE_URL || 'http://localhost:1234/v1',
    },
    modelKwargs: {
      // Explicitly enable function calling if supported
      // Some models may need this
    },
  });
```

#### Option 2: Verify Model Name Format

- Try: `qwen2.5-7b-instruct` instead of `Qwen/qwen3-vl-30b`
- Some models need exact naming format

#### Option 3: Add Tool Calling Debug Logging

- Log the actual tool definitions being sent
- Check if LM Studio receives tool definitions in requests
- Verify response format from LM Studio

### 6. Alternative: Use LM Studio Native SDK

If OpenAI-compatible API doesn't work, could switch to LM Studio SDK:

- Would require rewriting agent node to use `.act()` method
- More complex but guaranteed to work with LM Studio models
- Not compatible with LangGraph's current structure

## Current Status

- ✅ Tools are properly defined (CoinGecko tools)
- ✅ Tools are exported in tools array
- ✅ Tools are bound with `bindTools()`
- ✅ System message mentions tools
- ⚠️ Need to verify LM Studio model supports function calling
- ⚠️ Need to verify LM Studio server configuration
- ⚠️ May need model-specific configuration

## Next Steps

1. Check LM Studio app for model compatibility badge
2. Try switching to `qwen2.5-7b-instruct` model
3. Verify LM Studio server is configured for function calling
4. Add debug logging to see tool definitions in API requests
5. Test with OpenAI provider to confirm tools work
