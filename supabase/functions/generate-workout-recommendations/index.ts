import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username, fitness_level, fitness_goals")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch user profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch recent workouts
    const { data: workouts, error: workoutsError } = await supabase
      .from("workouts")
      .select("id, workout_date, total_duration, total_calories")
      .eq("user_id", userId)
      .order("workout_date", { ascending: false })
      .limit(10);

    if (workoutsError) {
      console.error("Workouts fetch error:", workoutsError);
    }

    // Fetch exercises from recent workouts
    const workoutIds = workouts?.map(w => w.id) || [];
    const { data: exercises } = await supabase
      .from("exercises")
      .select("type, name, sets, reps, duration, weight")
      .in("workout_id", workoutIds)
      .limit(20);

    // Build context for AI
    const workoutHistory = workouts?.map(w => 
      `Date: ${w.workout_date}, Duration: ${w.total_duration}min, Calories: ${w.total_calories}`
    ).join("\n") || "No workout history";

    const exerciseHistory = exercises?.map(e => 
      `${e.name} (${e.type}): ${e.sets ? `${e.sets}x${e.reps}` : `${e.duration}min`}`
    ).join("\n") || "No exercise details";

    const userContext = `
User Profile:
- Fitness Level: ${profile.fitness_level}
- Goals: ${profile.fitness_goals || "Not specified"}

Recent Workout History (last 10 workouts):
${workoutHistory}

Recent Exercises:
${exerciseHistory}
`;

    const systemPrompt = `You are an expert fitness coach. Generate 3-5 personalized workout recommendations based on the user's fitness level, goals, and workout history. Each recommendation should be specific, actionable, and progressive.

Consider:
- User's current fitness level
- Their stated goals
- Recent workout patterns and exercise types
- Progressive overload principles
- Variety to prevent plateaus
- Recovery and balance

Provide detailed workout plans that are achievable and motivating.`;

    // Call Lovable AI with tool calling for structured output
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate workout recommendations for this user:\n\n${userContext}` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_workout_recommendations",
              description: "Generate personalized workout recommendations",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Catchy workout plan title" },
                        description: { type: "string", description: "Brief description of the workout focus" },
                        duration: { type: "string", description: "Estimated duration (e.g., '45 minutes')" },
                        difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
                        exercises: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              sets: { type: "string", description: "Number of sets (e.g., '3' or '3-4')" },
                              reps: { type: "string", description: "Number of reps or duration (e.g., '12-15' or '30 seconds')" },
                              notes: { type: "string", description: "Additional tips or form cues" }
                            },
                            required: ["name", "sets", "reps"]
                          }
                        },
                        benefits: {
                          type: "array",
                          items: { type: "string" },
                          description: "Key benefits of this workout"
                        }
                      },
                      required: ["title", "description", "duration", "difficulty", "exercises", "benefits"]
                    }
                  }
                },
                required: ["recommendations"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_workout_recommendations" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to generate recommendations" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      console.error("No tool call in response:", aiResponse);
      return new Response(
        JSON.stringify({ error: "Invalid AI response format" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recommendations = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(recommendations),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-workout-recommendations:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});